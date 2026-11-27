// ---------- accounts: sign in with a name and a password so nobody else can play as you on a server ----------
// There is no account server (the game runs from GitHub Pages and Photon), so the account is worked out from the name and password:
//   PBKDF2(password, name) -> a P-256 private key -> its public key.   Same name + password = same account, on any device.
// A server remembers each name's public key the first time that player joins ("trust on first use"). From then on, joining with
// that name needs a fresh signature from the matching private key, which only the right password gives.
// The host only ever sees public keys and one-use signatures (tied to its own room, its own id and the time), so a host can't
// pretend to be you anywhere else, and a signature can't be reused.
const ACC={name:null,d:null,x:null,y:null,key:null};
const P256={p:0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn,n:0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n,
  Gx:0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,Gy:0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n};
const b64u=b=>{let s='';for(const x of b)s+=String.fromCharCode(x);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const ub64u=s=>{s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s);return Uint8Array.from(b,c=>c.charCodeAt(0));};
const big32=v=>{const o=new Uint8Array(32);for(let i=31;i>=0;i--){o[i]=Number(v&255n);v>>=8n;}return o;};
const bigOf=b=>{let v=0n;for(const x of b)v=(v<<8n)|BigInt(x);return v;};
// k * G on P-256 (Jacobian coordinates, a = -3); only used once at sign-in to find the public key
function p256Mul(k){const P=P256.p;const md=a=>{a%=P;return a<0n?a+P:a;};
  const dbl=([X,Y,Z])=>{if(Z===0n||Y===0n)return [0n,1n,0n];const YY=Y*Y%P,S=4n*X%P*YY%P,ZZ=Z*Z%P,M=md(3n*md(X-ZZ)%P*((X+ZZ)%P));const X3=md(M*M-2n*S);return [X3,md(M*md(S-X3)-8n*YY%P*YY),2n*Y%P*Z%P];};
  const add=(A,B)=>{if(A[2]===0n)return B;if(B[2]===0n)return A;const [X1,Y1,Z1]=A,[X2,Y2,Z2]=B;const Z1Z1=Z1*Z1%P,Z2Z2=Z2*Z2%P,U1=X1*Z2Z2%P,U2=X2*Z1Z1%P,S1=Y1*Z2%P*Z2Z2%P,S2=Y2*Z1%P*Z1Z1%P;
    if(U1===U2)return S1===S2?dbl(A):[0n,1n,0n];const H=md(U2-U1),R=md(S2-S1),HH=H*H%P,HHH=H*HH%P,V=U1*HH%P;const X3=md(R*R-HHH-2n*V);return [X3,md(R*md(V-X3)-S1*HHH%P),Z1*Z2%P*H%P];};
  let R=[0n,1n,0n],Q=[P256.Gx,P256.Gy,1n];while(k>0n){if(k&1n)R=add(R,Q);Q=dbl(Q);k>>=1n;}
  let a=R[2],r=1n,e=P-2n;while(e>0n){if(e&1n)r=r*a%P;a=a*a%P;e>>=1n;}const zi2=r*r%P;return [R[0]*zi2%P,R[1]*zi2%P*r%P];}
const accLo=n=>String(n||'').trim().toLowerCase();
async function accDerive(name,pw){const te=new TextEncoder();const km=await crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveBits']);
  const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:te.encode('minecraft-realzanized account|'+accLo(name)),iterations:200000},km,384));
  const d=bigOf(bits)%(P256.n-1n)+1n;const [x,y]=p256Mul(d);const o={name:String(name).trim().slice(0,16),d:b64u(big32(d)),x:b64u(big32(x)),y:b64u(big32(y))};
  await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',d:o.d,x:o.x,y:o.y,ext:true},{name:'ECDSA',namedCurve:'P-256'},false,['sign']);   // checks the maths: refuses a point not on the curve
  return o;}
const accPub=()=>ACC.x?ACC.x+'.'+ACC.y:null;
async function accSign(msg){if(!ACC.key)ACC.key=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',d:ACC.d,x:ACC.x,y:ACC.y,ext:true},{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  return b64u(new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},ACC.key,new TextEncoder().encode(msg))));}
async function accVerify(pub,msg,sig){try{const [x,y]=String(pub).split('.');const k=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',x,y,ext:true},{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},k,ub64u(sig),new TextEncoder().encode(msg));}catch(e){return false;}}
const accRoom=()=>String((net&&net.tr&&net.tr.room)||(SRV.cfg&&SRV.cfg.room)||(SRV.joined&&SRV.joined.room)||'');
const accMsg=(room,lo,hostId,ts)=>'mcr-login|'+room+'|'+lo+'|'+hostId+'|'+ts;
// remembered on this device until you sign out
function accLoad(){try{const o=JSON.parse(localStorage.getItem('mcr_account')||'null');if(o&&o.name&&o.d&&o.x&&o.y)Object.assign(ACC,o,{key:null});}catch(e){}}
function accSave(o){Object.assign(ACC,{name:o.name,d:o.d,x:o.x,y:o.y,key:null});try{localStorage.setItem('mcr_account',JSON.stringify(o));}catch(e){}accShowName();}
function accSignOut(){Object.assign(ACC,{name:null,d:null,x:null,y:null,key:null});try{localStorage.removeItem('mcr_account');}catch(e){}accShowName();}
// signed in: your name is the account's name
function accShowName(){const inp=$('nameIn');if(ACC.name){inp.value=ACC.name;inp.readOnly=true;inp.title='Signed in. Sign out to change your name.';}else{inp.readOnly=false;inp.title='';}
  readName();const st=$('accSt');if(st)st.innerHTML=ACC.name?'Signed in as <b>'+esc(ACC.name)+'</b>':'Not signed in. You need an account to join servers.';
  const bi=$('accIn'),bo=$('accOut');if(bi)bi.classList.toggle('hidden',!!ACC.name);if(bo)bo.classList.toggle('hidden',!ACC.name);}
{const rn=readName;readName=function(){if(ACC.name)$('nameIn').value=ACC.name;return rn();};}
// the sign-in box
function dlgSignIn(then){dlgShow(`<h3>Sign In</h3><div class="form"><label for="ac_name">Name</label><input id="ac_name" type="text" maxlength="16" autocomplete="username" spellcheck="false">
    <label for="ac_pw">Password</label><input id="ac_pw" type="password" maxlength="64" autocomplete="current-password"><label for="ac_pw2">Password again</label><input id="ac_pw2" type="password" maxlength="64" autocomplete="current-password"></div>
    <div class="note">Your name and password are your account, on any device. The first time you join a server it remembers you, and after that nobody can join it with your name unless they have your password.<br><b>Nobody can reset a forgotten password</b>, so keep it somewhere safe.</div>
    <div class="note" id="ac_err" style="color:#ff6060;min-height:1.2em"></div>
    <div class="row"><button class="btn small" data-ok id="ac_ok">Sign In</button><button class="btn small" data-cancel id="ac_cancel">Cancel</button></div>`,b=>{
    const q=s=>b.querySelector(s),err=t=>{q('#ac_err').textContent=t;};q('#ac_name').value=ACC.name||($('nameIn').value||'').trim();
    q('#ac_ok').addEventListener('click',async()=>{const nm=q('#ac_name').value.trim(),pw=q('#ac_pw').value,pw2=q('#ac_pw2').value;
      if(!nm.length||/[\u0000-\u001f]/.test(nm))return err('Type the name you play with.');   // any name that worked before still works, so nobody loses what they have under it
      const prev=(store('bb_name')||$('nameIn').value||'').trim();if(prev&&accLo(prev)!==accLo(nm)&&!q('#ac_ok').dataset.sure){q('#ac_ok').dataset.sure='1';q('#ac_err').style.color='#ffcc55';
        return err('Your progress on servers is saved under the name "'+prev+'". Signing in as "'+nm+'" starts fresh there. Press Sign In again to go ahead, or change the name back.');}
      q('#ac_err').style.color='#ff6060';if(pw.length<6)return err('Use a password of at least 6 characters.');if(pw!==pw2)return err('The two passwords are different.');
      if(!(window.crypto&&crypto.subtle))return err('This browser can\'t sign in here (it needs a secure page: https, localhost or a local file).');
      q('#ac_ok').disabled=true;err('');q('#ac_err').style.color='#aaa';q('#ac_err').textContent='Signing in...';
      try{const o=await accDerive(nm,pw);accSave(o);sfx('click');dlgClose();chatMsg&&MATCH.state!=='menu'&&chatMsg('Signed in as '+o.name,'#55ff55',false);then&&then();}
      catch(e){q('#ac_ok').disabled=false;q('#ac_err').style.color='#ff6060';err('Could not sign in: '+(e&&e.message||e));}});
    q('#ac_cancel').addEventListener('click',()=>{sfx('click');dlgClose();});});}
// the Profile section of Options: who you are signed in as, Sign In / Sign Out
{const row=document.createElement('div');row.className='row';row.style.cssText='margin:6px 0 0;justify-content:flex-start;gap:8px;align-items:center;flex-wrap:wrap';
  row.innerHTML='<span id="accSt" class="note" style="margin:0"></span><button class="btn small" id="accIn">Sign In</button><button class="btn small hidden" id="accOut">Sign Out</button>';
  $('nameIn').parentElement.insertAdjacentElement('afterend',row);
  $('accIn').addEventListener('click',()=>{sfx('click');dlgSignIn(null);});
  $('accOut').addEventListener('click',()=>{sfx('click');accSignOut();});}
accLoad();accShowName();

// ---------- joining: prove the name ----------
// no account yet: sign in first, then carry on joining
{const j0=srvJoin;srvJoin=function(addr,label){if(!ACC.d){dlgSignIn(()=>srvJoin(addr,label));return;}return j0(addr,label);};}
// the hello to a server carries the public key and a signature over (room, name, host id, time)
{const s0=netSend;netSend=function(code,data,to){if(code===N.HELLO&&ACC.d&&net&&!isHost()&&data&&!data.acc){const n=net,ts=Date.now(),lo=accLo(data.n);
    accSign(accMsg(accRoom(),lo,n.hostId(),ts)).then(sig=>{if(net===n)s0(code,Object.assign({},data,{acc:{pub:accPub(),sig,ts}}),to);},()=>{if(net===n)s0(code,data,to);});return;}
  return s0(code,data,to);};}
// the host checks it before letting them in
const ACC_SEEN=new Map();
async function accCheck(from,d){const C=SRV.cfg;if(!C)return null;C.accounts=C.accounts||{};const nm=String(d.n||'').trim().slice(0,16),lo=accLo(nm);const a=d.acc;
  if(!a||typeof a.pub!=='string'||typeof a.sig!=='string'||typeof a.ts!=='number')return 'You need to sign in to join servers.\nPress Sign In (in Options, under Profile) and choose a password.';
  if(Math.abs(Date.now()-a.ts)>10*60000)return 'Could not check your sign-in: your device\'s clock is more than 10 minutes off.\nFix the date and time and try again.';
  const now=Date.now();for(const [k,t] of ACC_SEEN)if(now-t>12*60000)ACC_SEEN.delete(k);
  if(ACC_SEEN.has(a.sig)||!(await accVerify(a.pub,accMsg(accRoom(),lo,net.myId,a.ts),a.sig)))return 'Could not check your sign-in. Try joining again.';
  ACC_SEEN.set(a.sig,now);
  const have=C.accounts[lo];if(have&&have!==a.pub)return 'The name '+nm+' is already registered on this server with a different password.\nIf it is your name, sign in with the password you used before.';
  if(!have){C.accounts[lo]=a.pub;srvCfgChanged();}return null;}
{const o0=onNetEvent;onNetEvent=function(code,d,from){
  if(code===N.HELLO&&SRV.hosting&&isHost()&&net&&d&&!d._acc){const n=net;accCheck(from,d).then(err=>{if(net!==n||!SRV.hosting)return;if(err){srvKick(from,err);return;}o0(code,Object.assign({},d,{_acc:1}),from);});return;}
  return o0(code,d,from);};}
// the host's own name is theirs on their server too (when they are signed in)
{const c0=srvCfgChanged;srvCfgChanged=function(){const C=SRV.cfg;if(C&&ACC.name&&accLo(ACC.name)===accLo(myName)){C.accounts=C.accounts||{};if(!C.accounts[accLo(myName)])C.accounts[accLo(myName)]=accPub();}return c0();};}
// /account reset <name>: an operator frees a name whose owner forgot their password.  /account list: names registered here
{const c0=serverCmd;serverCmd=function(S,text){const a=String(text).replace(/^\//,'').trim().split(/\s+/);if((a[0]||'').toLowerCase()!=='account')return c0(S,text);
  const reply=(t,col='#aaaaaa')=>{if(S.local)chatMsg(t,col,false);else netSend(N.CHAT,{t,c:col},S.id);};const C=SRV.cfg;
  if(!SRV.hosting||!C)return reply('That command only works on a server you are hosting.','#ff5555');
  if(!S.local&&!(C.ops||[]).includes(accLo(S.name)))return reply('You need to be an operator to do that.','#ff5555');
  C.accounts=C.accounts||{};const sub=(a[1]||'').toLowerCase();
  if(sub==='list'){const l=Object.keys(C.accounts);return reply(l.length?l.length+' registered name(s): '+l.join(', '):'No names are registered on this server yet.');}
  if(sub==='reset'&&a[2]){const lo=accLo(a.slice(2).join(' '));if(!C.accounts[lo])return reply('Nobody has registered '+lo+' here.','#ff5555');delete C.accounts[lo];srvCfgChanged();return reply('Freed the name '+lo+'. The next person to join with it registers it.','#55ff55');}
  return reply('Usage: /account list   or   /account reset <name>','#ff5555');};}
// the appearance screen has a name box too: while signed in, it shows the account's name
{const c0=closeDress;closeDress=function(){const r=c0.apply(this,arguments);if(ACC.name&&myName!==ACC.name){$('nameIn').value=ACC.name;readName();}return r;};}
{const a0=accShowName;accShowName=function(){a0();const d=$('dressName');if(d){d.readOnly=!!ACC.name;if(ACC.name)d.value=ACC.name;}};}
accShowName();
