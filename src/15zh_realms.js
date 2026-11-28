// ================= Realms: a server world that stays online when its host leaves =================
// A Realm is a server opened with "Realm: On". Nothing changes while the host is there. What is different:
//  * the host sends everyone a copy of the whole world now and then (compressed, a little at a time so the game doesn't stutter);
//  * when the host leaves, the player who has been on the longest takes over hosting at once, from the live world plus that copy,
//    and everyone else carries on with them (a moment of loading);
//  * when everyone has left, anyone who has played on the Realm can open it again from their own copy: they just join it from
//    the server list like any server, and if nobody is on, their game hosts it.
// Two copies that went separate ways (people playing it at different times without meeting) can't be merged: when you join a Realm
// whose world doesn't include your copy's latest changes, your copy is kept as a Singleplayer world so nothing is lost.
N.REALM=78;
const REALM={sid:null,line:[],sendT:20,sending:false,parts:{},joinedLine:null,leaving:false,hostT:0,
  ns:(()=>{try{return sessionStorage.getItem('mcr_rns')||'';}catch(e){return '';}})()};   // ns: lets tests run two players in one browser
const realmKey=a=>String(a||'').toLowerCase();
function realmList(){try{return JSON.parse(store('mcr_realms'+REALM.ns)||'[]')||[];}catch(e){return [];}}
function realmGet(addr){const k=realmKey(addr);return realmList().find(r=>r.addr===k)||null;}
function realmPut(o){const l=realmList().filter(r=>r.addr!==o.addr);l.unshift(o);store('mcr_realms'+REALM.ns,JSON.stringify(l.slice(0,30)));}
function realmWid(addr){const r=realmGet(addr);return r&&r.wid||('realm-'+(REALM.ns?REALM.ns+'-':'')+realmKey(addr).replace(/[^a-z0-9]/g,'_').slice(0,40));}
const realmMe=()=>myName.toLowerCase();
const realmHosting=()=>!!(SRV.hosting&&SRV.cfg&&SRV.cfg.realm&&survival());
const realmGuest=()=>!!(online&&net&&!isHost()&&SRV.info&&SRV.info.realm&&survival());
const realmSid=()=>Date.now().toString(36)+(Math.random()*1e6|0).toString(36);
function mySave(){const p=playerSave(player);if(p){p.dim=DIM;p.xp=XP.total;}return p;}
// make sure there is a (hidden) world entry for a Realm copy, so its save slot can be hosted like any world
function realmMeta(addr,name,seed){const wid=realmWid(addr);const l=worldList();let m=l.find(w=>w.id===wid);
  if(!m){m={mode:'survival',id:wid,name:'Realm: '+(name||addr).slice(0,24),seed:seed|0,created:Date.now(),played:Date.now(),realm:realmKey(addr)};saveWorldList([m,...l]);}
  else if(name&&m.realm){m.name='Realm: '+name.slice(0,24);saveWorldList(l);}return m;}
function realmWrite(wid,d){try{localStorage.setItem('mcr_w_'+wid,JSON.stringify(d));return true;}catch(e){chatMsg('Could not keep a copy of the Realm: browser storage is full.','#ff5555',false);return false;}}
function realmSetupHost(){if(!realmHosting()||REALM.sid)return;const d=loadWorldData(SURV.meta.id)||{};REALM.sid=realmSid();
  REALM.line=((REALM.joinedLine||(d.realm&&d.realm.line))||[]).concat([REALM.sid]).slice(-30);REALM.joinedLine=null;
  realmPut({addr:realmKey(SRV.cfg.full),name:SRV.cfg.motd,wid:SURV.meta.id,t:Date.now(),sid:REALM.sid});srvUpdateProps();}
// the whole world as a Realm copy: the usual save, with the host's own player stored like everyone else's
function realmStamp(d){d.others=d.others||{};if(player)d.others[realmMe()]=mySave();d.realm={sid:REALM.sid,line:REALM.line,t:Date.now(),name:SRV.cfg&&SRV.cfg.motd,addr:SRV.cfg&&realmKey(SRV.cfg.full)};return d;}
// every save of a Realm host's world carries the Realm details too
{const s0=saveWorld;saveWorld=function(){const r=s0.apply(this,arguments);try{if(r&&realmHosting()&&REALM.sid){const d=loadWorldData(SURV.meta.id);if(d){realmStamp(d);realmWrite(SURV.meta.id,d);}}}catch(e){}return r;};}
// ---------- the host sends copies ----------
async function realmSend(to){if(REALM.sending||!realmHosting()||SURV.loading)return;REALM.sending=true;try{
    saveWorld();const d=realmStamp(loadWorldData(SURV.meta.id)||{});realmWrite(SURV.meta.id,d);
    const js=JSON.stringify(d);const z=await phZip(js);const body=z||js,zz=!!z;const id=REALM.sid+'.'+Date.now().toString(36),P=12000,n=Math.ceil(body.length/P);
    for(let i=0;i<n;i++){if(!realmHosting()||!net)break;netSend(N.REALM,{k:'bk',id,i,n,zz,p:body.slice(i*P,(i+1)*P)},to);await NK.wait(300);}
    REALM.sendT=60+Math.min(240,body.length/40000*10);}catch(e){console.error(e);}finally{REALM.sending=false;}}
// ---------- everyone else keeps it ----------
async function realmGotPart(d){if(typeof d.id!=='string'||typeof d.p!=='string'||!(d.n>0)||d.n>4000)return;let R=REALM.parts[d.id];
  if(!R){for(const k in REALM.parts)delete REALM.parts[k];R=REALM.parts[d.id]={n:d.n,got:0,p:new Array(d.n)};}if(R.p[d.i]==null){R.p[d.i]=d.p;R.got++;}if(R.got<R.n)return;delete REALM.parts[d.id];
  try{const s=d.zz?await phUnzip(R.p.join('')):R.p.join('');realmKeep(JSON.parse(s));}catch(e){console.error('realm copy',e);}}
function realmKeep(d){if(!d||!SRV.info||!SRV.info.addr)return;const addr=SRV.info.addr;d.others=d.others||{};if(player&&survival())d.others[realmMe()]=mySave();d.player=d.others[realmMe()]||null;
  const m=realmMeta(addr,d.realm&&d.realm.name,d.seed);if(realmWrite(m.id,d))realmPut({addr:realmKey(addr),name:(d.realm&&d.realm.name)||addr,wid:m.id,t:(d.realm&&d.realm.t)||Date.now(),sid:d.realm&&d.realm.sid});}
// my copy, brought up to date with what I see right now (when I leave, or when I take over)
function realmLiveCopy(){const addr=SRV.info&&SRV.info.addr||SRV.cfg&&SRV.cfg.full;if(!addr||!player)return null;const wid=realmWid(addr);const B=loadWorldData(wid)||{};
  const live={player:mySave()};survSaveExtra(live);
  const d=Object.assign({},B,{seed:WSEED,time:worldTime,day:GZ.day,spawn:SURV.spawn,gen:GENV,edits:live.edits,chests:live.chests,player:live.player,dragon:live.dragon||B.dragon});
  d.dims={};for(const k of XDIMS){const L=live.dims[k]||{};d.dims[k]=Object.assign({furn:[]},(B.dims||{})[k]||{},{edits:L.edits||{},chests:L.chests||[]});}
  d.others=Object.assign({},B.others||{});d.others[realmMe()]=d.player;
  d.realm=Object.assign({},B.realm||{},{t:Date.now(),addr:realmKey(addr),sid:(B.realm&&B.realm.sid)||((REALM.joinedLine||[]).slice(-1)[0])||null,line:REALM.joinedLine||(B.realm&&B.realm.line)||[]});
  if(!d.srv)d.srv=null;return d;}
function realmSaveMine(){if(!realmGuest())return;const d=realmLiveCopy();if(!d)return;const m=realmMeta(SRV.info.addr,SRV.info.motd,WSEED);if(realmWrite(m.id,d))realmPut({addr:realmKey(SRV.info.addr),name:SRV.info.motd||SRV.info.addr,wid:m.id,t:Date.now(),sid:d.realm.sid});}
setInterval(()=>{try{if(realmGuest()&&!SURV.loading)realmSaveMine();}catch(e){}},45000);

// ---------- hosting from a copy: taking over, or opening a Realm nobody is on ----------
function realmBecomeHost(n,a,d,why){const addr=a.full;const m=realmMeta(addr,(d.realm&&d.realm.name)||(d.srv&&d.srv.motd),d.seed);
  if(!d.srv&&SRV.info)d.srv={pvp:SRV.info.pvp,motd:SRV.info.motd,ops:SRV.info.ops||[]};
  const cfg=Object.assign(srvDefaults(),d.srv||{},{room:a.room,region:a.region,full:a.full,realm:true});
  if(cfg.bans&&cfg.bans[realmMe()]!=null){srvDisconnect('You are banned from this Realm, so you can\'t open it.','Failed to connect to the server');return;}
  d.others=d.others||{};d.player=d.others[realmMe()]||d.player||null;realmWrite(m.id,d);
  REALM.joinedLine=(d.realm&&d.realm.line)||REALM.joinedLine||[];REALM.sid=null;
  SRV.mode='survival';SRV.cfg=cfg;SRV.hosting=true;SRV.joined=null;SRV.info=null;SRV.amOp=false;SRV.players=Object.assign({},d.others);delete SRV.players[realmMe()];
  online=true;net=n;SURV.lastWorld=m.id;
  // the room stays open and listed, and if our connection drops we may open it again
  try{n.tr.reopen=true;n.tr.setOpen&&n.tr.setOpen(true);const r=n.tr.lbc&&n.tr.lbc.isJoinedToRoom()&&n.tr.lbc.myRoom();if(r&&r.setIsVisible)r.setIsVisible(!!cfg.pub||true);}catch(e){}
  playWorld(m,true);realmSetupHost();
  chatMsg(why,'#ffff55',false);SURV.toast={t:5,txt:'Hosting the Realm: '+a.full};netSend(N.REALM,{k:'host'});srvUpdateProps();setTimeout(()=>realmSend(),8000);}
// the host left: the longest-connected player takes over; everyone else catches up with them
function realmHostChanged(n){const a=SRV.joined?{room:SRV.joined.room,region:SRV.joined.region,full:SRV.joined.addr}:parseAddr(SRV.info.addr);
  if(n.isHost()){const d=realmLiveCopy()||{};realmBecomeHost(n,a,d,'The host left. You are hosting the Realm now, so it stays online.');return;}
  const h=n.members.get(n.hostId());chatMsg('The host left. '+(h?h.name:'Someone')+' is hosting the Realm now.','#ffff55',false);REALM.resync=perfT+2.5;}
function realmResyncTick(){if(REALM.resync&&perfT>=REALM.resync){REALM.resync=0;if(!realmGuest()||!net)return;
  try{netSend(N.PSAVE,{d:mySave()},'host');}catch(e){}netSend(N.HELLO,{n:myName,v:GAME_VERSION,rl:1},'host');}}
// joining from the server list: if the Realm is offline and we have a copy, open it
{const j0=srvJoin;srvJoin=function(addr,label){j0(addr,label);const n=net;if(!n||!n.tr||SRV.hosting)return;const a=parseAddr(addr);if(!a)return;
  const h0=n.onHostChange;n.onHostChange=function(h){if(net===n&&online&&SRV.info&&SRV.info.realm&&survival()){realmHostChanged(n);return;}return h0.apply(this,arguments);};
  const r0=n.onReady;n.onReady=function(){const mine=realmGet(a.full)&&loadWorldData(realmWid(a.full));
    if(net===n&&n.isHost()&&mine){dlgClose();hide('mpPanel');realmBecomeHost(n,a,mine,'Nobody was on the Realm, so you opened it from your copy. It stays online for anyone who joins.');return;}return r0.apply(this,arguments);};
  const f0=n.onFail;n.onFail=function(msg){const mine=realmGet(a.full)&&loadWorldData(realmWid(a.full));
    if(!online&&mine&&/^Unknown server/.test(String(msg))){if(net===n)net=null;try{n.leave();}catch(e){}realmOpen(a,mine);return;}return f0.apply(this,arguments);};};}
function realmOpen(a,d){dlgConnecting(a.full+' (opening the Realm)',()=>{dlgClose();srvBrowseStart();});
  const m=realmMeta(a.full,(d.realm&&d.realm.name)||(d.srv&&d.srv.motd),d.seed);d.player=(d.others||{})[realmMe()]||d.player||null;realmWrite(m.id,d);
  const cfg=Object.assign(srvDefaults(),d.srv||{},{room:a.room,region:a.region,full:a.full,realm:true});
  if(cfg.bans&&cfg.bans[realmMe()]!=null){srvDisconnect('You are banned from this Realm, so you can\'t open it.','Failed to connect to the server');return;}
  REALM.joinedLine=(d.realm&&d.realm.line)||[];REALM.sid=null;
  srvStart(cfg,'menu','survival',m.id,msg=>{// someone else opened it at the same moment: join them instead
    if(/already in use/.test(msg)){dlgClose();setTimeout(()=>srvJoin(a.full,'Realm'),600);return;}srvDisconnect(msg,'Failed to connect to the server');});}

// ---------- messages ----------
{const o0=onNetEvent;onNetEvent=function(code,d,from){if(code!==N.REALM)return o0(code,d,from);if(!d||!net)return;const fromHost=from===net.hostId();
  if(d.k==='bk'&&fromHost&&!isHost())realmGotPart(d);
  else if(d.k==='host'&&!fromHost&&realmHosting()){// two of us think we host (after a drop): the one who joined later steps back
    const me=net.members.get(net.myId),them=net.members.get(from);if(them&&me&&(them.joined<me.joined||(them.joined===me.joined&&from<net.myId)))realmStepDown();}
  else if(d.k==='bye'&&fromHost)REALM.byeT=perfT;};}
// we came back from a dropped connection and someone else is hosting now: join them
function realmStepDown(){if(!realmHosting())return;const a=SRV.cfg.full;saveWorld();chatMsg('Someone else took over the Realm while you were away. Rejoining it...','#ffff55',false);
  const n=net;net=null;online=false;SRV.hosting=false;try{n.leave();}catch(e){}REALM.sid=null;toMenu();setTimeout(()=>srvJoin(a,'Realm'),900);}
// the host says it's hosting every few seconds; the start of a session copies everyone in
function realmTick(dt){realmSetupHost();realmResyncTick();
  if(realmHosting()&&net){REALM.hostT-=dt;if(REALM.hostT<=0){REALM.hostT=5;netSend(N.REALM,{k:'host'});}
    if(net.list().length>1){REALM.sendT-=dt;if(REALM.sendT<=0){REALM.sendT=60;realmSend();}}}}
{const t0=survTick;survTick=function(dt){t0(dt);try{realmTick(dt);}catch(e){console.error(e);}};}
// someone new joined: give them a copy soon
{const o0=onNetEvent;onNetEvent=function(code,d,from){const r=o0(code,d,from);if(code===N.HELLO&&realmHosting())REALM.sendT=Math.min(REALM.sendT,10);return r;};}
// what a joining player is told: it's a Realm, and which sessions its world comes from
{const s0=survSnapshot;survSnapshot=function(jid){const s=s0(jid);if(realmHosting()){s.srv=Object.assign({},s.srv||{},{realm:1,addr:SRV.cfg.full});s.realm={line:REALM.line};}return s;};}
// joined: remember the Realm, add it to the server list, and check our own copy hasn't gone its own way
{const a0=survApplyStart;survApplyStart=function(d){const r=a0(d);try{if(d.srv&&d.srv.realm&&d.srv.addr){REALM.joinedLine=(d.realm&&d.realm.line)||[];const addr=d.srv.addr;
    const mine=realmGet(addr)&&loadWorldData(realmWid(addr));
    if(mine&&mine.realm&&mine.realm.sid&&!REALM.joinedLine.includes(mine.realm.sid)&&!REALM.checked){REALM.checked=addr;const when=new Date(mine.realm.t||Date.now()).toLocaleString();
      const meta=newWorldMeta((mine.realm.name||'Realm').slice(0,18)+' (your copy)','','survival');meta.seed=mine.seed;const l=worldList();const mm=l.find(w=>w.id===meta.id);if(mm){mm.seed=mine.seed;saveWorldList(l);}
      try{localStorage.setItem('mcr_w_'+meta.id,JSON.stringify(mine));}catch(e){}
      chatMsg('Your copy of this Realm (from '+when+') had changes this world doesn\'t have. It was kept as the Singleplayer world "'+meta.name+'".','#ffcc55',false);}
    if(!SRV.list.some(s=>realmKey(s.addr)===realmKey(addr))){SRV.list.unshift({name:'Realm: '+(d.srv.motd||addr),addr});srvSaveList();}
    realmPut(Object.assign({wid:realmWid(addr),t:mine&&mine.realm&&mine.realm.t||0,sid:mine&&mine.realm&&mine.realm.sid},realmGet(addr)||{},{addr:realmKey(addr),name:d.srv.motd||addr}));}}catch(e){console.error(e);}return r;};}
// leaving: a Realm host hands over instead of closing the server; a guest keeps an up-to-date copy
{const s0=netSend;netSend=function(code,data,to){if(code===N.KICK&&data&&data.all&&REALM.leaving)return;return s0(code,data,to);};}
{const t0=toMenu;toMenu=function(){if(realmHosting()&&net){REALM.leaving=true;try{realmKeepRoom();saveWorld();realmWrite(SURV.meta.id,realmStamp(loadWorldData(SURV.meta.id)||{}));netSend(N.REALM,{k:'bye'});}catch(e){}}
  else if(realmGuest())try{realmSaveMine();}catch(e){}
  try{t0();}finally{REALM.leaving=false;REALM.sid=null;REALM.joinedLine=null;REALM.checked=null;REALM.parts={};}};}
// a Realm host leaving must not close the room (a normal host's leaving hides it from the list at once)
function realmKeepRoom(){try{if(net&&net.tr)net.tr.reopen=false;}catch(e){}}
addEventListener('pagehide',()=>{try{if(realmHosting()&&net){realmKeepRoom();saveWorld();netSend(N.REALM,{k:'bye'});net.leave();}else if(realmGuest())realmSaveMine();}catch(e){}});
// the pause menu says what leaving does
{const sh=show;show=function(id){sh(id);if(id==='pause'&&MATCH.mode==='survival'){if(realmHosting())setLbtn($('leaveBtn'),'Leave the Realm (it stays online)');else if(realmGuest())setLbtn($('leaveBtn'),'Leave the Realm');}};}

// ---------- the host dialog: Realm on or off ----------
{const d0=dlgShow;dlgShow=function(html,mount,wide){if(typeof html==='string'&&html.includes('id="hs_wl"')){
    html=html.replace('<label for="hs_wl">Whitelist</label>','<label for="hs_realm" class="hs_sv">Realm</label><select id="hs_realm" class="hs_sv"><option value="0">Off: the server closes when you leave</option><option value="1">On: stays online when you leave</option></select><label for="hs_wl">Whitelist</label>');
    html=html.replace('<div class="note">Players join with this address:','<div class="note hs_sv" id="hs_rnote" style="display:none">A Realm stays online after you leave: another player takes over hosting, and everyone who has played keeps a copy, so any of them can open it again later from the server list.</div><div class="note">Players join with this address:');
    const m0=mount;mount=b=>{m0&&m0(b);const sel=b.querySelector('#hs_realm');if(!sel)return;const cur=SRV.hosting&&SRV.cfg?SRV.cfg:null;sel.value=cur&&cur.realm?'1':'0';
      const note=b.querySelector('#hs_rnote');const upd=()=>{note.style.display=sel.value==='1'&&sel.style.display!=='none'?'':'none';};sel.addEventListener('change',upd);upd();
      // the dialog builds its settings from a copy; pass the Realm choice through when it starts or saves
      const ok=b.querySelector('#hs_ok');ok.addEventListener('click',()=>{REALM.want=sel.value==='1';},true);};}
  return d0(html,mount,wide);};}
{const s0=srvStart;srvStart=function(cfg,where,game,wid,onErr){if(REALM.want!=null&&game==='survival'){cfg=Object.assign({},cfg,{realm:REALM.want});REALM.want=null;}return s0(cfg,where,game,wid,onErr);};}
{const c0=srvCfgChanged;srvCfgChanged=function(){if(REALM.want!=null&&SRV.cfg&&survival()){SRV.cfg.realm=REALM.want;REALM.want=null;if(!SRV.cfg.realm)REALM.sid=null;}return c0();};}
{const p0=srvProps;srvProps=function(){const p=p0();if(SRV.cfg&&SRV.cfg.realm)p.rl=1;return p;};}
// the server list marks Realms (yours, and ones listed online)
{const r0=srvRender;srvRender=function(force){r0(force);const box=$('srvList');if(!box)return;const all=srvRows();
  for(const row of box.querySelectorAll('[data-key]')){const r=all.rows.concat(all.pub).find(x=>x.key===row.dataset.key);if(!r)continue;const st=srvStatus(r.addr);const mine=realmGet(r.addr);
    const online=st&&st.r&&st.r.p&&st.r.p.rl;if(!(mine||online))continue;const nm=row.querySelector('.sname,.name');if(nm&&!nm.dataset.rl){nm.dataset.rl=1;nm.textContent+='  [Realm]';}
    const m=row.querySelector('.smotd,.motd');if(m&&mine&&(!st||!st.r)&&!m.dataset.rlo){m.dataset.rlo=1;m.textContent='Nobody is on. Join to open it from your copy.';m.style.color='#9ad0ff';}}};}
// Realm copies don't clutter the Singleplayer list (they live in the server list)
{const w0=renderWorldList;renderWorldList=function(){const l0=worldList;worldList=()=>l0().filter(w=>!w.realm);try{return w0();}finally{worldList=l0;}};}
{const h0=dlgHost;dlgHost=function(where){const l0=worldList;worldList=()=>l0().filter(w=>!w.realm);try{return h0(where);}finally{worldList=l0;}};}
{const seen={};for(const k in N){if(seen[N[k]])console.error('network code clash: N.'+k+' and N.'+seen[N[k]]+' are both '+N[k]);seen[N[k]]=k;}}
