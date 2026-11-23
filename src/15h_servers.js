// ================= Servers, like Minecraft Java's multiplayer, carried by Photon =================
// Multiplayer screen: your saved servers (name, MOTD, icon, players, ping) plus "Servers online now" (public servers in your region),
// Join Server, Direct Connection, Add / Edit / Delete, Refresh. A server is a Photon room named after its address; whoever hosts it
// (Host Server here, or Open to Server from the pause menu) runs the world. When the host stops, the server closes for everyone.
// The host is the server: it decides who may join (bans, whitelist), keeps every player's inventory and position in its world save,
// and runs the commands (/list /msg /me /say /kick /ban /pardon /op /deop /whitelist /gamemode /defaultgamemode /tp /time /seed /stop).
Object.assign(N,{KICK:45,CMD:46,SETGM:47,PSAVE:48,TPTO:49,SRVINFO:50});
const SRV={list:[],sel:null,browsers:[],rooms:{},cfg:null,hosting:false,joined:null,info:null,players:{},amOp:false,sig:'',lastClick:{k:null,t:0},dlgOpen:null};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const homeRegion=()=>store('mcr_region')||'us';
function srvLoad(){try{SRV.list=(JSON.parse(store('mcr_servers')||'[]')||[]).filter(s=>s&&s.addr);}catch(e){SRV.list=[];}}
function srvSaveList(){store('mcr_servers',JSON.stringify(SRV.list.slice(0,60)));}
// "name" or "name:region" (like host:port; no region means the Americas region)
function parseAddr(s){s=String(s||'').trim().toLowerCase();let region='us';const m=s.match(/^(.*):([a-z]+)$/);if(m&&PHOTON_REGIONS.some(r=>r[0]===m[2])){s=m[1];region=m[2];}
  s=s.replace(/\s+/g,'-').replace(/[^a-z0-9._-]/g,'').slice(0,40);return s?{room:s,region,full:s+(region!=='us'?':'+region:'')}:null;}
const regionName=r=>(PHOTON_REGIONS.find(x=>x[0]===r)||[r,r])[1];

// ---------------- pinging: one lobby connection per region we need ----------------
function srvBrowseStop(){for(const b of SRV.browsers)b.close();SRV.browsers=[];}
function srvBrowseStart(){srvBrowseStop();SRV.rooms={};const app=store('mcr_appid');if(!app){srvRender();return;}
  const regs=new Set([homeRegion()]);for(const s of SRV.list){const a=parseAddr(s.addr);if(a)regs.add(a.region);}
  for(const reg of regs){SRV.rooms[reg]={loading:true,list:[],rtt:0,err:null};
    SRV.browsers.push(photonBrowse(app,reg,(list,rtt,err)=>{const R=SRV.rooms[reg];if(!R)return;if(err){R.err=err;R.loading=false;}else{R.list=list;R.rtt=rtt;R.loading=false;R.err=null;}srvRender();}));}
  srvRender();}
function srvStatus(addr){const a=parseAddr(addr);if(!a)return {st:'bad'};const R=SRV.rooms[a.region];if(!store('mcr_appid'))return {st:'noapp'};if(!R||R.loading)return {st:'ping'};
  if(R.err)return {st:'err',msg:R.err};const r=R.list.find(x=>x.name===a.room);if(!r)return {st:'off'};return {st:'on',r,rtt:R.rtt};}
// the five signal bars (or a red cross), drawn like the Java icons
function pingIcon(c,st,rtt){c.width=10;c.height=8;const g=c.getContext('2d');g.clearRect(0,0,10,8);
  if(st==='off'||st==='err'||st==='bad'){g.fillStyle='#ff3030';for(let i=0;i<6;i++){g.fillRect(2+i,1+i,1,1);g.fillRect(7-i,1+i,1,1);}return;}
  const n=st==='ping'?-1:rtt<150?5:rtt<300?4:rtt<600?3:rtt<1000?2:1;const anim=Math.floor(performance.now()/180)%8;
  for(let i=0;i<5;i++){const h=2+i*1.5|0;const lit=st==='ping'?(anim<5?i===anim:i===8-anim):i<n;g.fillStyle=lit?(st==='ping'?'#a0a0ff':'#55ff55'):'#353535';g.fillRect(i*2,8-h,1,h);}}
function defaultIcon(){const c=mkCanvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;const gi=ICONS['b'+B.GRASS];if(gi)g.drawImage(gi,0,0,32,32);else{g.fillStyle='#5a8a3a';g.fillRect(0,0,32,32);}return c.toDataURL();}

// ---------------- the Multiplayer screen ----------------
function openMP(){initAudio();sfx('click');readName();hide('menu');hide('discPanel');srvLoad();SRV.sel=null;SRV.sig='';show('mpPanel');$('phStatus').textContent='';
  if(!store('mcr_appid'))dlgPhoton(true);else srvBrowseStart();srvRender(true);}
function srvRows(){const rows=SRV.list.map((s,i)=>({t:'saved',i,key:'s'+i,name:s.name,addr:s.addr}));
  const home=homeRegion(),R=SRV.rooms[home];const pub=[];
  if(R&&!R.loading&&!R.err)for(const r of R.list){if(!r.p||!+r.p.pub)continue;const full=r.name+(home!=='us'?':'+home:'');if(SRV.list.some(s=>{const a=parseAddr(s.addr);return a&&a.room===r.name&&a.region===home;}))continue;pub.push({t:'pub',key:'p'+full,name:r.name,addr:full});}
  return {rows,pub};}
function srvRender(force){const box=$('srvList');if(!box||$('mpPanel').classList.contains('hidden'))return;const {rows,pub}=srvRows();
  const sig=JSON.stringify([rows.map(r=>[r.key,r.name,r.addr,JSON.stringify(srvStatus(r.addr).r||srvStatus(r.addr).st)]),pub.map(r=>[r.key,JSON.stringify(srvStatus(r.addr).r)]),SRV.sel&&SRV.sel.key]);
  if(!force&&sig===SRV.sig){srvAnimate();return;}SRV.sig=sig;const top=box.scrollTop;box.textContent='';
  const add=r=>{const s=srvStatus(r.addr);const row=document.createElement('div');row.className='srow'+(SRV.sel&&SRV.sel.key===r.key?' sel':'');row.setAttribute('role','option');row.dataset.key=r.key;
    const img=document.createElement('img');img.alt='';const ic=s.r&&s.r.p&&s.r.p.ic;img.src=typeof ic==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(ic)?ic:(srvRender.defIc||(srvRender.defIc=defaultIcon()));
    const info=document.createElement('div');info.className='sinfo';const nm=document.createElement('div');nm.className='sname';nm.textContent=r.t==='pub'&&s.r&&s.r.p&&s.r.p.m==='battle'?r.name+'  [Battle]':r.name;
    const motd=document.createElement('div');motd.className='smotd';
    if(s.st==='on')motd.textContent=String(s.r.p&&s.r.p.motd||'A Minecraft:realzanized Server').slice(0,90);
    else if(s.st==='ping')motd.textContent='Pinging...';else if(s.st==='noapp'){motd.textContent='Set a Photon App ID in Photon Settings to ping servers';motd.classList.add('err');}
    else if(s.st==='bad'){motd.textContent='That server address is not valid';motd.classList.add('err');}
    else{motd.textContent=s.st==='err'?s.msg:'Can\'t connect to server';motd.classList.add('err');}
    info.append(nm,motd);
    const right=document.createElement('div');right.className='sright';const pl=document.createElement('div');pl.className='splay';
    if(s.st==='on'){pl.textContent=s.r.n+'/'+s.r.max;const names=String(s.r.p&&s.r.p.pl||'').split('\n').filter(Boolean);pl.title=names.length?names.join('\n'):'';
      if(s.r.p&&s.r.p.v&&s.r.p.v!==GAME_VERSION){pl.textContent=s.r.p.v>GAME_VERSION?'Client out of date!':'Server out of date!';pl.style.color='#ff5555';}else if(!s.r.open){pl.textContent='Not accepting players';pl.style.color='#ff5555';}}
    const pc=document.createElement('canvas');pc.className='sping';pc.dataset.st=s.st;pc.dataset.rtt=s.rtt||0;pingIcon(pc,s.st,s.rtt||0);pc.title=s.st==='on'?Math.round(s.rtt)+' ms':'';right.append(pl,pc);
    row.append(img,info,right);
    if(r.t==='saved'){const mv=document.createElement('div');mv.className='smove';const up=document.createElement('button');up.textContent='▲';up.title='Move up';const dn=document.createElement('button');dn.textContent='▼';dn.title='Move down';
      up.addEventListener('click',e=>{e.stopPropagation();srvMove(r.i,-1);});dn.addEventListener('click',e=>{e.stopPropagation();srvMove(r.i,1);});mv.append(up,dn);row.appendChild(mv);}
    row.addEventListener('click',()=>{const now=performance.now();const dbl=SRV.lastClick.k===r.key&&now-SRV.lastClick.t<450;SRV.lastClick={k:r.key,t:now};SRV.sel=r;sfx('click');if(dbl){srvJoinSelected();return;}srvRender(true);});
    box.appendChild(row);};
  if(!rows.length){const d=document.createElement('div');d.className='rnote';d.textContent='No servers yet. Add Server saves one by its address; Direct Connection joins once; Host Server opens one of your worlds to other players.';box.appendChild(d);}
  rows.forEach(add);
  const h=document.createElement('div');h.className='shead';const R=SRV.rooms[homeRegion()];
  h.textContent='Servers online now ('+regionName(homeRegion())+')'+(!store('mcr_appid')?'':R&&R.loading?': searching...':R&&R.err?': '+R.err:pub.length?'':': none right now');box.appendChild(h);
  pub.forEach(add);box.scrollTop=top;srvButtons();}
function srvAnimate(){for(const c of document.querySelectorAll('#srvList canvas.sping'))if(c.dataset.st==='ping')pingIcon(c,'ping',0);}
function srvButtons(){const s=SRV.sel;$('srvJoin').disabled=!s;$('srvEdit').disabled=!(s&&s.t==='saved');$('srvDel').disabled=!(s&&s.t==='saved');}
function srvMove(i,d){const j=i+d;if(j<0||j>=SRV.list.length)return;const l=SRV.list;[l[i],l[j]]=[l[j],l[i]];srvSaveList();SRV.sel=null;sfx('click');srvRender(true);}
function srvJoinSelected(){const s=SRV.sel;if(!s)return;srvJoin(s.addr,s.name);}
setInterval(()=>{if(!$('mpPanel').classList.contains('hidden'))srvRender();},250);
$('srvJoin').addEventListener('click',srvJoinSelected);
$('srvDirect').addEventListener('click',()=>{sfx('click');dlgDirect();});
$('srvAdd').addEventListener('click',()=>{sfx('click');dlgEdit(-1);});
$('srvEdit').addEventListener('click',()=>{if(SRV.sel&&SRV.sel.t==='saved'){sfx('click');dlgEdit(SRV.sel.i);}});
$('srvDel').addEventListener('click',()=>{if(SRV.sel&&SRV.sel.t==='saved'){sfx('click');dlgDelete(SRV.sel.i);}});
$('srvRefresh').addEventListener('click',()=>{sfx('click');SRV.sig='';srvBrowseStart();});
$('srvHost').addEventListener('click',()=>{sfx('click');if(!store('mcr_appid')){dlgPhoton(true);return;}dlgHost('menu');});
$('srvPhoton').addEventListener('click',()=>{sfx('click');dlgPhoton(false);});
$('phBack').addEventListener('click',()=>{sfx('click');srvBrowseStop();if(net&&!online){net.leave();net=null;}dlgClose();hide('mpPanel');show('menu');});
$('discBack').addEventListener('click',()=>{hide('discPanel');openMP();});
addEventListener('keydown',e=>{if($('mpPanel').classList.contains('hidden')||!$('srvDlg').classList.contains('hidden'))return;if(e.target&&e.target.tagName==='INPUT')return;
  if(e.code==='Enter'&&SRV.sel){e.preventDefault();srvJoinSelected();}
  else if(e.code==='ArrowDown'||e.code==='ArrowUp'){const {rows,pub}=srvRows();const all=rows.concat(pub);if(!all.length)return;let i=all.findIndex(r=>SRV.sel&&r.key===SRV.sel.key);i=Math.max(0,Math.min(all.length-1,i+(e.code==='ArrowDown'?1:-1)));SRV.sel=all[i];srvRender(true);e.preventDefault();}
  else if(e.code==='Delete'&&SRV.sel&&SRV.sel.t==='saved')dlgDelete(SRV.sel.i);});

// ---------------- dialogs ----------------
function dlgShow(html,mount,wide){const b=$('srvDlgBox');b.classList.toggle('wide',!!wide);b.innerHTML=html;show('srvDlg');SRV.dlgOpen=true;mount&&mount(b);const f=b.querySelector('input,select');if(f)setTimeout(()=>f.focus(),0);}
function dlgClose(){hide('srvDlg');SRV.dlgOpen=null;}
addEventListener('keydown',e=>{if($('srvDlg').classList.contains('hidden'))return;
  if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();const c=$('srvDlgBox').querySelector('[data-cancel]');if(c)c.click();else dlgClose();}
  else if(e.code==='Enter'){const ok=$('srvDlgBox').querySelector('[data-ok]');if(ok&&!ok.disabled){e.preventDefault();ok.click();}}},true);
function dlgEdit(i){const s=i>=0?SRV.list[i]:{name:'Minecraft Server',addr:''};
  dlgShow(`<h3>${i>=0?'Edit Server Info':'Add Server'}</h3><div class="form"><label for="se_name">Server Name</label><input id="se_name" type="text" maxlength="32" autocomplete="off">
    <label for="se_addr">Server Address</label><input id="se_addr" type="text" maxlength="48" placeholder="name or name:region" spellcheck="false" autocomplete="off"></div>
    <div class="note">The address is what the host sees on their screen when they open the server, for example <b>realz-castle</b> or <b>realz-castle:eu</b>.</div>
    <div class="row"><button class="btn small" data-ok id="se_ok">Done</button><button class="btn small" data-cancel id="se_cancel">Cancel</button></div>`,b=>{
    b.querySelector('#se_name').value=s.name;b.querySelector('#se_addr').value=s.addr;const ok=b.querySelector('#se_ok');const chk=()=>{ok.disabled=!parseAddr(b.querySelector('#se_addr').value);};chk();b.querySelector('#se_addr').addEventListener('input',chk);
    ok.addEventListener('click',()=>{const a=parseAddr(b.querySelector('#se_addr').value);if(!a)return;const e={name:b.querySelector('#se_name').value.trim().slice(0,32)||'Minecraft Server',addr:a.full};
      if(i>=0)SRV.list[i]=e;else SRV.list.push(e);srvSaveList();sfx('click');dlgClose();SRV.sel=null;srvBrowseStart();});
    b.querySelector('#se_cancel').addEventListener('click',()=>{sfx('click');dlgClose();});});}
function dlgDelete(i){const s=SRV.list[i];if(!s)return;
  dlgShow(`<h3>Are you sure you want to remove this server?</h3><div class="note" style="text-align:center">'${esc(s.name)}' will be lost forever! (A long time!)</div>
    <div class="row"><button class="btn small" data-ok id="sd_ok">Delete</button><button class="btn small" data-cancel id="sd_cancel">Cancel</button></div>`,b=>{
    b.querySelector('#sd_ok').addEventListener('click',()=>{SRV.list.splice(i,1);srvSaveList();SRV.sel=null;sfx('click');dlgClose();srvRender(true);});b.querySelector('#sd_cancel').addEventListener('click',()=>{sfx('click');dlgClose();});});}
function dlgDirect(){dlgShow(`<h3>Direct Connection</h3><div class="form"><label for="dc_addr">Server Address</label><input id="dc_addr" type="text" maxlength="48" spellcheck="false" autocomplete="off"></div>
    <div class="row"><button class="btn small" data-ok id="dc_ok">Join Server</button><button class="btn small" data-cancel id="dc_cancel">Cancel</button></div>`,b=>{
    const inp=b.querySelector('#dc_addr'),ok=b.querySelector('#dc_ok');inp.value=store('mcr_lastaddr')||'';const chk=()=>{ok.disabled=!parseAddr(inp.value);};chk();inp.addEventListener('input',chk);
    ok.addEventListener('click',()=>{const a=parseAddr(inp.value);if(!a)return;store('mcr_lastaddr',a.full);srvJoin(a.full,a.full);});b.querySelector('#dc_cancel').addEventListener('click',()=>{sfx('click');dlgClose();});});}
function dlgPhoton(first){dlgShow(`<h3>Photon Settings</h3>${first?'<div class="note">Multiplayer runs on Photon Realtime. Everyone playing together needs the same App ID: make a free one at <b>dashboard.photonengine.com</b> (Create a New App, choose <b>Realtime</b>), then share it with your friends once.</div>':''}
    <div class="form"><label for="pz_app">Photon Realtime App ID</label><input id="pz_app" type="text" maxlength="64" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" spellcheck="false" autocomplete="off">
    <label for="pz_reg">Home region (where you host, and whose servers show as online now)</label><select id="pz_reg">${PHOTON_REGIONS.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join('')}</select></div>
    <div class="err" id="pz_err"></div><div class="row"><button class="btn small" data-ok id="pz_ok">Done</button><button class="btn small" data-cancel id="pz_cancel">Cancel</button></div>`,b=>{
    b.querySelector('#pz_app').value=store('mcr_appid')||'';b.querySelector('#pz_reg').value=homeRegion();
    b.querySelector('#pz_ok').addEventListener('click',()=>{const app=b.querySelector('#pz_app').value.trim();if(!/^[0-9a-f-]{20,}$/i.test(app)){b.querySelector('#pz_err').textContent='Paste your Photon Realtime App ID (it looks like 1a2b3c4d-....).';return;}
      store('mcr_appid',app);store('mcr_region',b.querySelector('#pz_reg').value);sfx('click');dlgClose();srvBrowseStart();});
    b.querySelector('#pz_cancel').addEventListener('click',()=>{sfx('click');dlgClose();srvRender(true);});});}
function dlgConnecting(addr,onCancel){dlgShow(`<h3>Connecting to the server...</h3><div class="note" style="text-align:center">${esc(addr)}</div><div class="note" id="cn_st" style="text-align:center"></div>
    <div class="row"><button class="btn small" data-cancel id="cn_cancel">Cancel</button></div>`,b=>{b.querySelector('#cn_cancel').addEventListener('click',()=>{sfx('click');onCancel&&onCancel();});});}
const dlgStatus=t=>{const e=$('cn_st');if(e)e.textContent=t;};

// ---------------- joining ----------------
function srvJoin(addr,label){const a=parseAddr(addr);if(!a){$('phStatus').textContent='That server address is not valid.';return;}const app=store('mcr_appid');if(!app){dlgPhoton(true);return;}
  srvBrowseStop();readName();readOptions();if(net){net.leave();net=null;}online=false;SRV.hosting=false;SRV.cfg=null;SRV.info=null;SRV.amOp=false;
  const n=new PhotonNet(app,a.region,'any',myName,{join:a.room});net=n;SRV.joined={addr:a.full,room:a.room,region:a.region,name:label||a.full,mode:null};
  dlgConnecting(a.full,()=>{if(net===n){net=null;n.leave();}SRV.joined=null;dlgClose();srvBrowseStart();});
  n.tr.onstate=s=>{if(net===n&&!n.ready)dlgStatus(s.replace(/([a-z])([A-Z])/g,'$1 $2')+'...');};
  n.onEvent=onNetEvent;n.onJoin=(id,name)=>{if(isHost()&&MATCH.state==='lobby')MATCH.phaseT=0;if(survival())chatMsg(name+' joined the game','#ffff55',false);};n.onLeave=onMemberLeave;
  n.onHostChange=()=>{if(net!==n)return;if(SRV.joined&&SRV.joined.mode==='survival'){srvDisconnect('Server closed','Connection Lost');return;}onHostChanged();};
  n.onFail=msg=>{if(net!==n)return;srvDisconnect(msg,online?'Connection Lost':'Failed to connect to the server');};
  n.onReady=()=>{if(net!==n)return;const props=n.tr.props?n.tr.props():{};const mode=props.m==='battle'?'battle':'survival';SRV.joined.mode=mode;
    if(n.isHost()){srvDisconnect('Server closed: nobody is hosting '+a.full+' any more.','Failed to connect to the server');return;}   // only us in there: the host is gone
    online=true;player=null;ents=[];const hello={n:myName,v:GAME_VERSION};
    if(mode==='survival'){dlgClose();hide('mpPanel');const el=$('loading');$('loadTitle').textContent='Joining world';el.classList.remove('hidden');$('loadBar').style.width='5%';netSend(N.HELLO,hello,'host');
      setTimeout(()=>{if(net===n&&MATCH.mode!=='survival')netSend(N.HELLO,hello,'host');},4000);
      setTimeout(()=>{if(net===n&&MATCH.mode!=='survival')srvDisconnect('Timed out: the server did not send the world.','Failed to connect to the server');},25000);}
    else{dlgClose();hide('mpPanel');enterLobby();netSend(N.HELLO,hello,'host');}};}
// leave the server and show why (kicked, server closed, connection lost...)
function srvDisconnect(msg,title){if(SRV.discing)return;SRV.discing=true;try{if(net){const n=net;try{if(online&&!n.isHost()&&survival()&&player)netSend(N.PSAVE,{d:playerSave(player)},'host');}catch(e){}net=null;setTimeout(()=>n.leave(),60);}online=false;SRV.joined=null;
    if(MATCH.state!=='menu')toMenu();dlgClose();hideOverlays();$('loading').classList.add('hidden');hide('menu');hide('mpPanel');
    $('discTitle').textContent=title||'Connection Lost';$('discMsg').textContent=msg||'';show('discPanel');document.exitPointerLock&&document.exitPointerLock();}finally{SRV.discing=false;}}
function srvJoinedInfo(info){SRV.info=info||null;SRV.amOp=!!(info&&(info.ops||[]).includes(myName.toLowerCase()));}

// ---------------- hosting ----------------
function srvDefaults(){let c=null;try{c=JSON.parse(store('mcr_lastsrv')||'null');}catch(e){}
  return Object.assign({room:'realz-'+Math.random().toString(36).slice(2,7),region:homeRegion(),motd:'A Minecraft:realzanized Server',max:8,gm:'survival',pvp:true,pub:true,wl:false,white:[],ops:[],bans:{}},c||{},{white:(c&&c.white)||[],ops:(c&&c.ops)||[],bans:(c&&c.bans)||{}});}
function srvFullAddr(c){return c.room+(c.region!=='us'?':'+c.region:'');}
// where: 'menu' (Host Server: pick a world or the Battle mini game), 'pause' (Open to Server), 'edit' (Server Settings while hosting)
function dlgHost(where){const cur=where==='edit'?SRV.cfg:where==='pause'?Object.assign(srvDefaults(),(loadWorldData(SURV.meta.id)||{}).srv||{},{gm:player&&player.gm||'survival'}):srvDefaults();
  const worlds=worldList();const live=where==='edit';
  dlgShow(`<h3>${where==='edit'?'Server Settings':where==='pause'?'Open to Server':'Host a Server'}</h3><div class="form">
    ${where==='menu'?`<label for="hs_game">Game</label><select id="hs_game"><option value="survival">Survival world</option><option value="battle">Battle mini game</option></select>
    <label for="hs_world" class="hs_sv">World</label><select id="hs_world" class="hs_sv">${worlds.map(w=>`<option value="${esc(w.id)}">${esc(w.name)}${w.mode==='creative'?' (Creative)':''}</option>`).join('')}<option value="__new">Create a new world</option></select>`:''}
    <label for="hs_room">Server Address</label><input id="hs_room" type="text" maxlength="40" spellcheck="false" autocomplete="off" ${live?'disabled':''}>
    <label for="hs_reg">Region</label><select id="hs_reg" ${live?'disabled':''}>${PHOTON_REGIONS.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join('')}</select>
    <label for="hs_motd">MOTD</label><input id="hs_motd" type="text" maxlength="80" autocomplete="off">
    <label for="hs_max">Max Players</label><select id="hs_max">${[2,3,4,5,6,8,10,12,16,20].map(n=>`<option value="${n}">${n}</option>`).join('')}</select>
    <label for="hs_gm" class="hs_sv">Others Play In</label><select id="hs_gm" class="hs_sv"><option value="survival">Survival</option><option value="creative">Creative</option></select>
    <label for="hs_pvp" class="hs_sv">PvP</label><select id="hs_pvp" class="hs_sv"><option value="1">On</option><option value="0">Off</option></select>
    <label for="hs_pub">Listed Publicly</label><select id="hs_pub"><option value="1">Yes: in Servers online now</option><option value="0">No: address only</option></select>
    <label for="hs_wl">Whitelist</label><select id="hs_wl"><option value="0">Off: anyone can join</option><option value="1">On: whitelisted only</option></select></div>
    <div class="note">Players join with this address: <span class="addr" id="hs_addr"></span></div>
    <div class="err" id="hs_err"></div>
    <div class="row"><button class="btn small" data-ok id="hs_ok">${live?'Done':'Start Server'}</button>${live?'<button class="btn small" id="hs_stop">Stop Server</button>':''}<button class="btn small" data-cancel id="hs_cancel">Cancel</button></div>`,b=>{
    const q=s=>b.querySelector(s);q('#hs_room').value=cur.room;q('#hs_reg').value=cur.region||'us';q('#hs_motd').value=cur.motd;q('#hs_max').value=String(cur.max);q('#hs_gm').value=cur.gm;q('#hs_pvp').value=cur.pvp===false?'0':'1';q('#hs_pub').value=cur.pub===false?'0':'1';q('#hs_wl').value=cur.wl?'1':'0';
    if(q('#hs_world')&&SURV.lastWorld)q('#hs_world').value=SURV.lastWorld;
    const upd=()=>{const a=parseAddr(q('#hs_room').value+':'+q('#hs_reg').value);q('#hs_addr').textContent=a?a.full:'(type an address)';q('#hs_ok').disabled=!a;
      const sv=!q('#hs_game')||q('#hs_game').value==='survival';for(const el of b.querySelectorAll('.hs_sv'))el.style.display=sv?'':'none';};
    upd();for(const s of ['#hs_room','#hs_reg','#hs_game'])if(q(s))q(s).addEventListener(s==='#hs_room'?'input':'change',upd);
    q('#hs_cancel').addEventListener('click',()=>{sfx('click');dlgClose();if(where!=='menu')$('resumeBtn').click();});
    if(q('#hs_stop'))q('#hs_stop').addEventListener('click',()=>{sfx('click');dlgClose();srvStop('Server closed');$('resumeBtn').click();});
    q('#hs_ok').addEventListener('click',()=>{const a=parseAddr(q('#hs_room').value+':'+q('#hs_reg').value);if(!a)return;
      const cfg=Object.assign({},cur,{room:a.room,region:a.region,full:a.full,motd:q('#hs_motd').value.trim().slice(0,80)||'A Minecraft:realzanized Server',max:+q('#hs_max').value,gm:q('#hs_gm').value,pvp:q('#hs_pvp').value==='1',pub:q('#hs_pub').value==='1',wl:q('#hs_wl').value==='1'});
      if(live){SRV.cfg=cfg;srvCfgChanged();dlgClose();$('resumeBtn').click();return;}
      const game=q('#hs_game')?q('#hs_game').value:'survival';const wid=q('#hs_world')?q('#hs_world').value:null;
      q('#hs_ok').disabled=true;q('#hs_err').textContent='Starting the server...';srvStart(cfg,where,game,wid,msg=>{q('#hs_ok').disabled=false;q('#hs_err').textContent=msg;});});},true);}
async function makeIcon(url){if(!url)return null;try{const img=new Image();await new Promise((ok,bad)=>{img.onload=ok;img.onerror=bad;img.src=url;});const c=mkCanvas(40,40),g=c.getContext('2d');const s=Math.min(img.width,img.height);
    g.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,40,40);return c.toDataURL('image/jpeg',.7);}catch(e){return null;}}
function srvProps(){const c=SRV.cfg;const names=net?net.list().map(m=>m.name):[myName];return {m:SRV.mode||'survival',motd:c.motd,pub:c.pub?1:0,v:GAME_VERSION,pl:names.slice(0,16).join('\n').slice(0,300),h:myName.slice(0,16),ic:SRV.icon||''};}
async function srvStart(cfg,where,game,wid,onErr){const app=store('mcr_appid');if(!app){onErr('Set your Photon App ID first (Photon Settings).');return;}readName();readOptions();
  let meta=null;if(game==='survival'){meta=where==='pause'?SURV.meta:wid&&wid!=='__new'?worldList().find(w=>w.id===wid):null;if(!meta&&where!=='pause')meta=newWorldMeta('Server World','','survival');SURV.lastWorld=meta&&meta.id;}
  SRV.icon=await makeIcon(meta&&meta.thumb)||'';SRV.mode=game;SRV.cfg=cfg;
  const n=new PhotonNet(app,cfg.region,game,myName,{create:{name:cfg.room,max:cfg.max,props:srvProps()}});
  n.onEvent=onNetEvent;
  n.onJoin=(id,name)=>{if(isHost()&&MATCH.state==='lobby')MATCH.phaseT=0;if(survival())chatMsg(name+' joined the game','#ffff55',false);srvUpdateProps();};
  n.onLeave=id=>{onMemberLeave(id);srvUpdateProps();};n.onHostChange=()=>{if(net===n)onHostChanged();};
  n.onFail=msg=>{if(net!==n&&n.ready)return;if(!n.ready){SRV.cfg=null;onErr(msg);return;}
    // lost Photon while hosting: the world carries on, offline
    net=null;online=false;SRV.hosting=false;try{n.leave();}catch(e){}if(survival()){if(player)player.id='p1';chatMsg('The server stopped: '+msg+' You are playing offline now.','#ff5555',false);}else{toMenu();srvDisconnect(msg,'Connection Lost');}};
  n.onReady=()=>{store('mcr_lastsrv',JSON.stringify(Object.assign({},cfg,{full:undefined})));net=n;online=true;SRV.hosting=true;SRV.joined=null;srvBrowseStop();
    if(game==='battle'){dlgClose();hide('mpPanel');player=null;ents=[];enterLobby();chatMsg('Server started. Players join with the address '+cfg.full,'#55ff55',false);srvUpdateProps();return;}
    SRV.players=Object.assign({},(loadWorldData(meta.id)||{}).others||{});
    if(where==='pause'){const old=player.id;player.id='p'+n.myId;for(const m of mobs)if(m.owner===old)m.owner=player.id;dlgClose();$('resumeBtn').click();}
    else{dlgClose();hide('mpPanel');playWorld(meta,true);}
    chatMsg('Server started. Players join with the address '+cfg.full,'#55ff55',false);SURV.toast={t:5,txt:'Server open: '+cfg.full};srvUpdateProps();saveWorldSoon();};}
function saveWorldSoon(){setTimeout(()=>{if(survival()&&SRV.hosting)saveWorld();},1500);}
function srvUpdateProps(){if(!SRV.hosting||!net||!net.tr.setProps||!SRV.cfg)return;net.tr.setProps(srvProps());}
function srvCfgChanged(){if(!SRV.cfg)return;store('mcr_lastsrv',JSON.stringify(SRV.cfg));srvUpdateProps();
  netSend(N.SRVINFO,{pvp:SRV.cfg.pvp,motd:SRV.cfg.motd,ops:SRV.cfg.ops,addr:SRV.cfg.full});if(survival())saveWorld();}
// stop hosting: everyone else gets "Server closed"; the host keeps playing offline
function srvStop(why){if(!SRV.hosting||!net)return;netSend(N.KICK,{all:1,r:why||'Server closed'});const n=net;setTimeout(()=>{try{n.leave();}catch(e){}},300);net=null;online=false;SRV.hosting=false;
  if(survival()){saveWorld();player.id='p1';for(const m of mobs)if(m.owner&&m.owner!=='p1')m.owner='p1';ents=ents.filter(e=>e===player);chatMsg('Server stopped. You are playing offline.','#aaaaaa',false);}else toMenu();}
// who may join: bans, whitelist, same name already playing
function srvAdmit(from,d){const c=SRV.cfg;if(!c)return null;const nm=String((d&&d.n)||((net.members.get(from)||{}).name)||'').slice(0,16);const lo=nm.toLowerCase();
  if(c.bans&&c.bans[lo]!=null)return 'You are banned from this server.\nReason: '+(c.bans[lo]||'Banned by an operator.');
  if(c.wl&&lo!==myName.toLowerCase()&&!(c.white||[]).includes(lo)&&!(c.ops||[]).includes(lo))return 'You are not white-listed on this server!';   // operators can always join, like Java
  if(lo===myName.toLowerCase())return 'The host is already playing as '+nm+'. Change your name and try again.';
  // the same name joining again (say after a dropped connection): the old session goes, like Java's "logged in from another location"
  for(const e of ents)if(e.kind==='player'&&e.id!=='p'+from&&e.name.toLowerCase()===lo&&e!==player)srvKick(+String(e.id).slice(1),'You logged in from another location');
  return null;}
function srvKick(id,reason){netSend(N.KICK,{id,r:reason});setTimeout(()=>{if(net)net.block(id);},400);}
// what joining players are given: their own saved player data, the server's rules
{const ss=survSnapshot;survSnapshot=function(jid){const s=ss(jid);if(SRV.hosting&&SRV.cfg){const m=net&&net.members.get(+String(jid).slice(1));const lo=String(m&&m.name||'').toLowerCase();
    s.me=SRV.players[lo]||null;s.gm=SRV.cfg.gm;s.srv={pvp:SRV.cfg.pvp,motd:SRV.cfg.motd,ops:SRV.cfg.ops||[],addr:SRV.cfg.full};}return s;};}
// joiners send their player data to the host now and then (and when they leave), so it is in the host's world save
setInterval(()=>{if(online&&net&&!isHost()&&survival()&&player&&!SURV.loading)netSend(N.PSAVE,{d:playerSave(player)},'host');},12000);
const srvPvp=()=>!online?true:SRV.hosting?SRV.cfg&&SRV.cfg.pvp!==false:SRV.info?SRV.info.pvp!==false:true;
{const one=onNetEvent;onNetEvent=function(code,d,from){
  if(code===N.HELLO&&SRV.hosting&&isHost()&&net){const r=srvAdmit(from,d);if(r){srvKick(from,r);return;}}
  if(code>=N.KICK&&code<=N.SRVINFO){srvNet(code,d,from);return;}
  return one(code,d,from);};}
function srvNet(code,d,from){const fromHost=net&&from===net.hostId();if(!d)return;
  if(code===N.KICK){if(!fromHost)return;if(d.all||d.id===net.myId){srvDisconnect(String(d.r||'Kicked from the server'),d.all?'Connection Lost':'Disconnected');return;}if(typeof d.id==='number')net.block(d.id);return;}
  if(code===N.CMD){if(!isHost()||typeof d.c!=='string')return;const e=entById('p'+from);serverCmd({id:from,ent:e||null,name:e?e.name:((net.members.get(from)||{}).name||'Player'),local:false},d.c.slice(0,200));return;}
  if(code===N.SETGM){if(fromHost)setGameMode(d.gm,false);return;}
  if(code===N.PSAVE){if(!isHost()||!SRV.hosting||!d.d||typeof d.d!=='object')return;const m=net.members.get(from);if(m)SRV.players[m.name.toLowerCase()]=d.d;return;}
  if(code===N.TPTO){if(fromHost&&player&&Array.isArray(d.p)){player.pos=d.p.map(Number);player.mot=[0,0,0];player.vel=[0,0,0];player.fallDist=0;GZ.tp=perfT;}return;}
  if(code===N.SRVINFO){if(fromHost){SRV.info=Object.assign(SRV.info||{},d);SRV.amOp=(SRV.info.ops||[]).includes(myName.toLowerCase());}return;}}
// pause menu: Open to Server / Server Settings, and the right name for leaving
{const sh=show;show=function(id){if(id==='pause'){const b=$('openSrvBtn');const sp=MATCH.mode==='survival'&&MATCH.state==='play'&&!online&&!!SURV.meta;
    b.classList.toggle('hidden',!(sp||SRV.hosting));setLbtn(b,SRV.hosting?'Server Settings':'Open to Server');
    setLbtn($('leaveBtn'),MATCH.mode==='survival'?(online&&!isHost()?'Disconnect':SRV.hosting?'Stop Server and Quit':'Save and Quit to Title'):'Leave Game');}sh(id);};}
$('openSrvBtn').addEventListener('click',()=>{sfx('click');if(SRV.hosting){dlgHost('edit');return;}if(!store('mcr_appid')){hide('pause');dlgPhoton(true);return;}hide('pause');dlgHost('pause');});
{const tm=toMenu;toMenu=function(){try{if(online&&net){if(SRV.hosting)netSend(N.KICK,{all:1,r:'Server closed'});else if(survival()&&player)netSend(N.PSAVE,{d:playerSave(player)},'host');}}catch(e){}
  tm();SRV.hosting=false;SRV.cfg=null;SRV.joined=null;SRV.info=null;SRV.amOp=false;};}

// ---------------- player list (hold Tab) ----------------
let tabHeld=false;
addEventListener('keydown',e=>{if(e.code!=='Tab'||!online||MATCH.mode!=='survival'||MATCH.state!=='play'||chatUI)return;e.preventDefault();if(!tabHeld){tabHeld=true;tabRender();$('tabList').classList.remove('hidden');}});
addEventListener('keyup',e=>{if(e.code==='Tab'){tabHeld=false;$('tabList').classList.add('hidden');}});
setInterval(()=>{if(tabHeld){if(!online||MATCH.state!=='play'){tabHeld=false;$('tabList').classList.add('hidden');}else tabRender();}},500);
function tabRender(){const el=$('tabList');el.textContent='';const head=document.createElement('div');head.className='th';
  const motd=SRV.hosting?SRV.cfg&&SRV.cfg.motd:SRV.info&&SRV.info.motd;const addr=SRV.hosting?SRV.cfg&&SRV.cfg.full:SRV.info&&SRV.info.addr||(SRV.joined&&SRV.joined.addr);
  head.textContent=motd||'Minecraft:realzanized';el.appendChild(head);
  const ps=ents.filter(e=>e.kind==='player').sort((a,b)=>a.name.localeCompare(b.name));
  for(const e of ps){const r=document.createElement('div');r.className='tr';const n=document.createElement('span');const hostE=net&&e.id==='p'+net.hostId();n.textContent=e.name+(hostE?' (host)':'');if(e.gm==='creative')n.style.color='#aaa';
    const c=document.createElement('canvas');const ms=e===player?(net&&net.ping):e.ping;pingIcon(c,ms==null?'ping':'on',ms||0);c.title=ms!=null?Math.round(ms)+' ms':'';r.append(n,c);el.appendChild(r);}
  const f=document.createElement('div');f.className='tf';f.textContent=(addr?addr+' · ':'')+ps.length+' player'+(ps.length===1?'':'s')+' · Photon';el.appendChild(f);}
