// ================= Battle creator: Mini Games > Battle / Battle Royale (and Host Server on the Battle Servers screen) =================
// A console-style create screen: tick boxes on the left, a description of whatever is selected on the right, then Create Casual or
// Create Competitive. Online, the game is a Photon server (15h_servers.js); unticking Online Game plays offline with bots.
const BC={mode:'battle',online:false,pub:true,invite:false,sel:0,ret:'mini',rep:0,snapT:-9,status:'',err:false,busy:false,cfg:null};
const bcOpen=()=>{const p=$('bcPanel');return !!p&&!p.classList.contains('hidden');};
const BC_ROUND={battle:[['Short',300],['Normal',600],['Long',900]],br:[['Short',.2],['Normal',.4],['Long',1]]};
function bcRoundIdx(){const L=BC_ROUND[BC.mode],v=BC.mode==='br'?SET.brLen:SET.roundLen;let b=0;for(let i=1;i<L.length;i++)if(Math.abs(L[i][1]-v)<Math.abs(L[b][1]-v))b=i;return b;}
function bcSaveSet(){store('bb_set',JSON.stringify(SET));writeOptions();}
const BC_DESC={
  mode:'Switch between Battle, rounds on the arena maps, and Battle Royale, one big island with a closing border.',
  central:'When ticked, everyone starts the round around the middle of the arena instead of spread out around it.',
  centralBR:'Battle Royale always spreads everyone out, so this only changes Battle.',
  online:'When ticked, your game is a server that other players join with its address. Untick it to play offline against bots.',
  pub:'When ticked, your server is listed in Battle servers online now, so anyone can find and join it. Untick it and only people you give the address to can join.',
  fof:'Photon servers have no friends lists, so this isn\'t available. Use Invite Only to choose exactly who can join.',
  invite:'When ticked, only the players you name in Server Settings can join. You and your operators always can.',
  maps:'Pick the maps the game goes through, one after another.',
  mapsBR:'Battle Royale is always played on its own island.',
  server:'The server address, region, message of the day, player limit and invite list.',
  round:'How long each round lasts.',
  casual:'Create a Casual game: everyone keeps their own skin, and spectators fly around as bats.',
  comp:'Create a Competitive game: skins that could give an advantage, such as see-through ones, are swapped for plain ones, and spectators are invisible to the players still fighting.'};
function bcRows(){const br=BC.mode==='br',on=BC.online;
  return [{k:'mode',t:'head'},
    {k:'central',t:'chk',label:'Central Spawn',v:()=>SET.central&&!br,off:br,desc:br?'centralBR':'central',fn:()=>{SET.central=!SET.central;bcSaveSet();}},
    {k:'online',t:'chk',label:'Online Game',v:()=>on,fn:()=>{BC.online=!BC.online;if(BC.online&&!store('mcr_appid'))dlgPhoton(true);}},
    {k:'pub',t:'chk',label:'Public Game',v:()=>on&&BC.pub&&!BC.invite,off:!on||BC.invite,fn:()=>{BC.pub=!BC.pub;}},
    {k:'fof',t:'chk',label:'Allow friends of friends',v:()=>false,off:true},
    {k:'invite',t:'chk',label:'Invite Only',v:()=>on&&BC.invite,off:!on,fn:()=>{BC.invite=!BC.invite;if(BC.invite&&!(bcCfg().white||[]).length)bcServerDlg();}},
    {k:'maps',t:'btn',label:'Select Maps',off:br,desc:br?'mapsBR':'maps',fn:()=>{openOptions('menu','maps');jDirect=true;}},
    {k:'server',t:'btn',label:'Server Settings',off:!on,fn:bcServerDlg},
    {k:'round',t:'slider'},
    {k:'casual',t:'btn',label:'Create Casual',fn:()=>bcCreate(false)},
    {k:'comp',t:'btn',label:'Create Competitive',fn:()=>bcCreate(true)}];}
function bcCfg(){if(!BC.cfg)BC.cfg=srvDefaults(true);return BC.cfg;}
// ---- open / close ----
function openBC(mode,ret){initAudio();readName();BC.mode=mode==='br'?'br':'battle';BC.ret=ret||'mini';BC.cfg=srvDefaults(true);BC.pub=BC.cfg.pub!==false;BC.invite=!!BC.cfg.wl;
  BC.online=ret==='mp'||!!store('mcr_appid');BC.status='';BC.err=false;BC.busy=false;
  show('menu');if(!miniOpen)showMini(true);$('menuList').classList.add('hidden');show('bcPanel');$('splash').style.visibility='hidden';bcSnap();
  const rows=bcRows();BC.sel=rows.findIndex(r=>r.k==='casual');bcRender();
  setPrompts('prompts',[['A','Select',bcActivate],['B','Back',bcBack]]);}
function bcReset(){hide('bcPanel');$('splash').style.visibility='';$('menuList').classList.remove('hidden');BC.busy=false;}
function bcBack(){sfx('click');bcReset();if(BC.ret==='mp'){hide('menu');openMP('battle');return;}showMini(true);}
// ---- drawing ----
const bcText=(t,col,sh)=>pxCanvas(t,GS,col,!!sh);
function bcWrap(el,text,col,maxW){el.textContent='';const words=String(text).split(' ');let line='';
  const push=l=>{const c=pxCanvas(l,GS,col,true);c.style.display='block';el.appendChild(c);};
  for(const w of words){const t=line?line+' '+w:w;if(line&&pxCanvas(t,GS,col,true).width>maxW){push(line);line=w;}else line=t;}if(line)push(line);}
function bcCheck(){const S=GS,c=mkCanvas(11*S,11*S),g=c.getContext('2d');const px=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*S,y*S,S,S);};
  const pts=[[1,5],[2,6],[3,7],[4,6],[5,5],[6,4],[7,3],[8,2],[9,1]];   // a tick, two pixels thick with a dark edge, poking out of the top of the box
  for(const [x,y] of pts){px(x,y+2,'#3b3300');px(x+1,y+2,'#3b3300');}for(const [x,y] of pts){px(x,y,'#fff35c');px(x,y+1,'#e0be14');}return c;}
function bcSwords(){const S=GS,c=mkCanvas(22*S,22*S),g=c.getContext('2d');g.imageSmoothingEnabled=false;const ic=ICONS[BC.mode==='br'?'bow':'diamond_sword'];
  if(ic){g.drawImage(ic,2*S,2*S,18*S,18*S);if(BC.mode!=='br'){g.save();g.translate(22*S,0);g.scale(-1,1);g.drawImage(ic,2*S,2*S,18*S,18*S);g.restore();}}return c;}
function bcRender(){const P=$('bcPanel');if(!P)return;const L=$('bcLeft');L.textContent='';const rows=bcRows();
  if(BC.sel<0||BC.sel>=rows.length||rows[BC.sel].off)BC.sel=rows.findIndex(r=>!r.off&&r.t!=='chk'&&r.k==='casual');
  rows.forEach((r,i)=>{let el;const selC=i===BC.sel;
    if(r.t==='head'){el=document.createElement('div');el.className='bcHead';const f=document.createElement('div');f.className='bcIcon';f.appendChild(bcSwords());
      const lab=document.createElement('div');lab.className='bcHeadT';lab.appendChild(bcText(BC.mode==='br'?'Battle Royale':'Battle',selC?'#ffff55':'#404040',selC));el.append(f,lab);}
    else if(r.t==='chk'){el=document.createElement('div');el.className='bcRow'+(r.off?' off':'');const box=document.createElement('span');box.className='bcBox';if(r.v())box.appendChild(bcCheck());
      el.append(box,bcText(r.label,r.off?'#a0a0a0':selC?'#ffff55':'#404040',selC&&!r.off));}
    else if(r.t==='btn'){el=document.createElement('button');el.className='jb bcBtn'+(r.off?' off':'')+(selC?' sel':'');el._label=r.label;jLabel(el);}
    else if(r.t==='slider'){const L2=BC_ROUND[BC.mode];el=jSlider(()=>'Round Length: '+L2[bcRoundIdx()][0],()=>bcRoundIdx()/(L2.length-1),v=>{const i=Math.round(v*(L2.length-1));if(BC.mode==='br')SET.brLen=L2[i][1];else SET.roundLen=L2[i][1];},L2.length-1,()=>{bcSaveSet();});
      el.classList.add('bcBtn');if(selC)el.classList.add('sel');}
    el.dataset.i=i;el.setAttribute('role',r.t==='chk'?'checkbox':'button');if(r.t==='chk')el.setAttribute('aria-checked',String(!!r.v()));if(r.off)el.setAttribute('aria-disabled','true');
    el.addEventListener('mouseenter',()=>{if(BC.sel!==i&&!r.off){BC.sel=i;bcRender();}});
    if(r.t!=='slider')el.addEventListener('click',e=>{e.stopPropagation();if(r.off)return;BC.sel=i;bcActivate();});else el.addEventListener('pointerdown',()=>{BC.sel=i;});
    L.appendChild(el);});
  const st=document.createElement('div');st.className='bcStatus';if(BC.status)bcWrap(st,BC.status,BC.err?'#ff6060':'#404040',200*GS);L.appendChild(st);
  const r=rows[BC.sel]||rows[0];bcWrap($('bcDesc'),BC_DESC[r.desc||r.k]||'',  '#ffffff',122*GS);}
// ---- the picture under the description (battle_art.jpg next to index.html) ----
const BC_ART=new Image();BC_ART.onload=()=>bcSnap();BC_ART.src='battle_art.jpg';
function bcSnap(){const c=$('bcImg');if(!c)return;const g=c.getContext('2d');g.imageSmoothingEnabled=true;
  if(BC_ART.complete&&BC_ART.naturalWidth){g.drawImage(BC_ART,0,0,c.width,c.height);}else{g.fillStyle='#2a3a4a';g.fillRect(0,0,c.width,c.height);}}
// the menu rescales with the window: redraw the creator at the new size and keep its button prompts
{const rl=refreshLCE;refreshLCE=function(){const r=rl.apply(this,arguments);if(bcOpen()){bcRender();setPrompts('prompts',[['A','Select',bcActivate],['B','Back',bcBack]]);}return r;};}
// ---- input ----
function bcMove(d){const rows=bcRows();let i=BC.sel;for(let n=0;n<rows.length;n++){i=(i+d+rows.length)%rows.length;if(!rows[i].off)break;}if(i!==BC.sel){BC.sel=i;sfx('click');bcRender();}}
function bcActivate(){const r=bcRows()[BC.sel];if(!r||r.off||BC.busy)return;if(r.t==='head'){sfx('click');BC.mode=BC.mode==='br'?'battle':'br';bcRender();return;}
  if(r.t==='slider')return;sfx('click');r.fn&&r.fn();if(bcOpen())bcRender();}
function bcSide(d){const r=bcRows()[BC.sel];if(!r)return;if(r.t==='head'){bcActivate();return;}if(r.t!=='slider')return;const L=BC_ROUND[BC.mode];const i=clamp(bcRoundIdx()+d,0,L.length-1);
  if(BC.mode==='br')SET.brLen=L[i][1];else SET.roundLen=L[i][1];bcSaveSet();sfx('click');bcRender();}
const bcFree=()=>bcOpen()&&$('srvDlg').classList.contains('hidden')&&$('jOpt').classList.contains('hidden')&&$('dressPanel').classList.contains('hidden');
document.addEventListener('keydown',e=>{if(!bcFree()||(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)))return;const c=e.code;
  if(c==='ArrowDown'||c==='KeyS'){bcMove(1);e.preventDefault();}else if(c==='ArrowUp'||c==='KeyW'){bcMove(-1);e.preventDefault();}
  else if(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD'){bcSide(c==='ArrowLeft'||c==='KeyA'?-1:1);e.preventDefault();}
  else if(c==='Enter'||c==='Space'){bcActivate();e.preventDefault();}else if(c==='Escape'||c==='Backspace'){bcBack();e.preventDefault();}
  e.stopImmediatePropagation();},true);
function bcPad(E,nav,navX,dt){if(!bcFree())return;BC.rep-=dt;if((nav||navX)&&BC.rep<=0){if(nav)bcMove(nav);else bcSide(navX);BC.rep=.22;}if(!nav&&!navX)BC.rep=0;if(E('a'))bcActivate();if(E('b'))bcBack();}
// ---- Server Settings (address, region, MOTD, players, invite list) ----
function bcServerDlg(){const cur=bcCfg();
  dlgShow(`<h3>Server Settings</h3><div class="form">
    <label for="bs_room">Server Address</label><input id="bs_room" type="text" maxlength="40" spellcheck="false" autocomplete="off">
    <label for="bs_reg">Region</label><select id="bs_reg">${PHOTON_REGIONS.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join('')}</select>
    <label for="bs_motd">MOTD</label><input id="bs_motd" type="text" maxlength="80" autocomplete="off">
    <label for="bs_max">Max Players</label><select id="bs_max">${[2,3,4,5,6,8,10,12,16,20].map(n=>`<option value="${n}">${n}</option>`).join('')}</select>
    <label for="bs_inv">Invited Players</label><input id="bs_inv" type="text" maxlength="400" spellcheck="false" autocomplete="off" placeholder="names, separated by commas"></div>
    <div class="note">Players join with this address: <span class="addr" id="bs_addr"></span>. Invited players only matter when Invite Only is ticked.</div>
    <div class="row"><button class="btn small" data-ok id="bs_ok">Done</button><button class="btn small" data-cancel id="bs_cancel">Cancel</button></div>`,b=>{
    const q=s=>b.querySelector(s);q('#bs_room').value=cur.room;q('#bs_reg').value=cur.region||'us';q('#bs_motd').value=cur.motd;q('#bs_max').value=String(cur.max);q('#bs_inv').value=(cur.white||[]).join(', ');
    const upd=()=>{const a=parseAddr(q('#bs_room').value+':'+q('#bs_reg').value);q('#bs_addr').textContent=a?a.full:'(type an address)';q('#bs_ok').disabled=!a;};
    upd();q('#bs_room').addEventListener('input',upd);q('#bs_reg').addEventListener('change',upd);
    q('#bs_cancel').addEventListener('click',()=>{sfx('click');dlgClose();bcRender();});
    q('#bs_ok').addEventListener('click',()=>{const a=parseAddr(q('#bs_room').value+':'+q('#bs_reg').value);if(!a)return;sfx('click');
      Object.assign(cur,{room:a.room,region:a.region,full:a.full,motd:q('#bs_motd').value.trim().slice(0,80)||'A Battle Server',max:+q('#bs_max').value,
        white:[...new Set(q('#bs_inv').value.split(/[,\s]+/).map(s=>s.trim().toLowerCase()).filter(Boolean))].slice(0,50)});dlgClose();bcRender();});});}
// ---- Create Casual / Create Competitive ----
function bcCreate(comp){if(BC.busy)return;SET.mode=BC.mode;SET.comp=!!comp;bcSaveSet();
  if(!BC.online){bcReset();try{srvBrowseStop();}catch(e){}showMini(false);startBattleSolo();return;}
  if(!store('mcr_appid')){BC.status='Set your Photon App ID first, then press Create again.';BC.err=true;bcRender();dlgPhoton(true);return;}
  const c=bcCfg(),a=parseAddr(c.room+':'+(c.region||'us'));if(!a){BC.status='Pick a server address in Server Settings.';BC.err=true;bcRender();return;}
  const cfg=Object.assign({},c,{room:a.room,region:a.region,full:a.full,pub:BC.pub&&!BC.invite,wl:BC.invite,white:c.white||[],bans:c.bans||{},ops:c.ops||[]});
  BC.busy=true;BC.status='Starting the server '+a.full+'...';BC.err=false;bcRender();try{srvBrowseStop();}catch(e){}
  srvStart(cfg,'battle',BC.mode,null,msg=>{BC.busy=false;BC.status=msg;BC.err=true;if(bcOpen())bcRender();});}
// the server started (or the game left the menu some other way): the creator closes
{const tm=toMenu;toMenu=function(){bcReset();return tm.apply(this,arguments);};}
setInterval(()=>{if(bcOpen()&&MATCH.state!=='menu')bcReset();},250);
// ---- Competitive rules ----
// skins with see-through parts on the body (they make a player harder to see) are swapped for a plain one
const FAIR={};
function skinFair(key){if(FAIR[key]!=null)return FAIR[key];if(key.startsWith('gen:'))return FAIR[key]=true;const T=skinTex(key);if(!T||!T.img||key.startsWith('?'))return true;
  try{const I=T.img,s=I.width/64,c=mkCanvas(I.width,I.height),g=c.getContext('2d');g.drawImage(I,0,0);const d=g.getImageData(0,0,I.width,I.height).data;
    const boxes=[[0,8,32,8],[0,20,56,12]].concat(I.height>=I.width?[[16,52,32,12]]:[]);let holes=0;
    for(const [x0,y0,w,h] of boxes)for(let y=y0*s;y<(y0+h)*s;y++)for(let x=x0*s;x<(x0+w)*s;x++)if(d[(y*I.width+x)*4+3]<128)holes++;
    return FAIR[key]=holes<=4*s*s;}catch(e){return FAIR[key]=true;}}
function fairSkin(e){if(!SET.comp||MATCH.state==='menu'||!e||e.kind!=='player'||skinFair(e.skin||''))return e.skin;return 'gen:'+e.name;}
// spectators are invisible (and silent) to the players still fighting
const compHidesBats=()=>SET.comp&&MATCH.state==='play'&&player&&player.alive;
