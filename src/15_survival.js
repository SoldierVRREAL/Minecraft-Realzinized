// ================= Survival: worlds (saved in this browser), spawning, loading, day/night, death & respawn, online worlds =================
const SURV={meta:null,loading:false,saveT:0,syncT:0,spawn:null,lastBiome:-1,biomeT:0,online:false};
N.WTIME=30;
const survival=()=>INF&&MATCH.mode==='survival';
const canBuild=()=>MATCH.mode==='br'||MATCH.mode==='survival';
function worldList(){try{return JSON.parse(store('mcr_worlds')||'[]')||[];}catch(e){return [];}}
function saveWorldList(l){store('mcr_worlds',JSON.stringify(l.slice(0,40)));}
function seedFrom(text){text=String(text||'').trim();if(!text)return (Math.random()*2**31)|0;if(/^-?\d{1,10}$/.test(text))return (+text)|0;return hashStr(text)|0;}
function newWorldMeta(name,seedText){const meta={id:'w'+Date.now().toString(36)+(Math.random()*1e4|0),name:(name||'New World').trim().slice(0,32)||'New World',seed:seedFrom(seedText),created:Date.now(),played:Date.now()};
  const l=worldList();l.unshift(meta);saveWorldList(l);return meta;}
function loadWorldData(id){try{return JSON.parse(store('mcr_w_'+id)||'null');}catch(e){return null;}}
function playerSave(p){return p?{pos:p.pos.map(v=>+v.toFixed(2)),yaw:p.yaw,inv:p.inv,armor:p.armor,hp:p.alive?p.health:20,food:p.alive?p.food:20,sat:p.sat,sel:p.sel}:null;}
function saveWorld(){if(!survival()||!SURV.meta||!isHost()||SURV.loading)return false;
  const data={v:1,seed:WSEED,time:worldTime,spawn:SURV.spawn,edits:editsToJSON(),player:playerSave(player)};
  let ok=true;try{localStorage.setItem('mcr_w_'+SURV.meta.id,JSON.stringify(data));}catch(e){ok=false;}
  const l=worldList();const m=l.find(w=>w.id===SURV.meta.id);if(m){m.played=Date.now();saveWorldList([m,...l.filter(w=>w!==m)]);}
  if(!ok)chatMsg('Could not save the world: browser storage is full.','#ff5555',false);infDirtySave=false;return ok;}
function deleteWorld(id){saveWorldList(worldList().filter(w=>w.id!==id));try{localStorage.removeItem('mcr_w_'+id);}catch(e){}}
const STARTER=[['stone_pickaxe',1],['stone_axe',1],['stone_sword',1],['bread',8],['b54',16],['b6',16]];
// o: {meta, seed, edits(Map), time, spawn, me(saved player), ents(list from host), join}
function beginSurvival(o){
  if(chestOpen)chestClose(false);hideOverlays();hide('worldPanel');hide('mpPanel');hide('deathPanel');
  MATCH.mode='survival';MATCH.state='play';MATCH.preT=0;MATCH.gameT=0;MATCH.edits=[];MATCH.map='survival';MATCH.winner=null;
  SURV.meta=o.meta||null;SURV.saveT=0;SURV.syncT=0;SURV.lastBiome=-1;
  infInit(infRingFor(OPT.chunks),o.seed,o.edits||new Map());infRD=Math.min(OPT.chunks,infMaxRD());
  worldTime=o.time!=null?o.time:.06;
  SURV.spawn=o.spawn||infFindSpawn();
  mapInfo={id:'survival',survival:true,skyLight:true,sky:[.5,.7,1],fog:[.7,.8,1],fogDist:160,voidY:-64,spawns:[[SURV.spawn[0],SURV.spawn[1],SURV.spawn[2],0]],central:[],center:null};
  projs=[];drops=(o.drops||[]).map(d=>Object.assign({},d));particles=[];feed=[];msgs=[];chat=[];br=null;suddenDeath=false;chests=new Map();
  const myId=net?'p'+net.myId:'p1';ents=[];
  for(const d of o.ents||[]){if(d.id===myId)continue;const e=new Ent(d.id,d.name,'player');e.skin=d.skin;e.color=ents.length;e.pos=d.sp.slice(0,3);e.yaw=d.sp[3]||0;ents.push(e);}
  player=new Ent(myId,myName,'player');player.isLocal=true;player.skin=mySkin;player.inv=new Array(36).fill(null);player.color=ents.length;
  const me=o.me;
  if(me){player.pos=me.pos.slice();player.yaw=me.yaw||0;me.inv.forEach((s,i)=>{if(i<36)player.inv[i]=s;});player.armor=me.armor||[null,null,null,null];player.health=me.hp||20;player.food=me.food==null?20:me.food;player.sat=me.sat||5;player.sel=me.sel||0;}
  else{player.pos=SURV.spawn.slice();for(const [id,n] of STARTER)addItem(player,id,n);}
  player.vel=[0,0,0];player.mot=[0,0,0];player.fallDist=0;ents.push(player);
  spectate.mode='bat';SURV.loading=true;
  const el=$('loading');$('loadTitle').textContent=o.join?'Joining world':'Generating world';$('loadTip').textContent=SURV_TIPS[Math.random()*SURV_TIPS.length|0];loadLogo();$('loadBar').style.width='0%';el.classList.remove('hidden');
}
const SURV_TIPS=['Sakura Forests glow pink at night.','Crystal Forests hide caves lined with glowing crystals.','Ash storms roll across the Ashen Wasteland: look for ruby ore near the volcanoes.',
  'Glowing Mushroom Fields light up the night.','Frozen Forests freeze their lakes over. Sapphire ore is more common under them.','Ancient Redwoods are so tall the fog hides their tops.',
  'Mythril ore needs a diamond pickaxe. It shows up most under Crystal Forests.','Torches keep the dark away. You start with a few.','Graphics too slow? Try Options > Video Settings > Graphics: Potato.'];
function survTick(dt){if(!INF)return;const p=player;const c=p?p.pos:SURV.spawn;
  if(SURV.loading){const t0=performance.now();infTick(c[0],c[2],40);const prog=infProgress(c[0],c[2],Math.min(2,infRD));$('loadBar').style.width=Math.round(prog*100)+'%';
    if(prog>=1&&chunkReadyAt(c[0],c[2])){SURV.loading=false;if(p)settlePlayer(p);$('loading').classList.add('hidden');if(MATCH.state==='play'&&!paused)lockPointer();
      if(!SURV.meta||!loadWorldData(SURV.meta.id))saveWorld();}
    return;}
  infTick(camPos[0]||c[0],camPos[2]||c[2],[3,4,6,7][GFX_ORDER.indexOf(OPT.gfx)]||5);
  worldTime=(worldTime+dt/DAY_LEN)%1;updateAmbient(dt);if(SURV.toast)SURV.toast.t-=dt;
  // running slowly: suggest a lighter graphics preset once
  SURV.fps=(SURV.fps||60)*.97+(1/Math.max(dt,1e-3))*.03;if(SURV.fps<22&&OPT.gfx!=='potato'&&!SURV.slowTip){SURV.slowT=(SURV.slowT||0)+dt;if(SURV.slowT>10){SURV.slowTip=true;const nx=GFX_ORDER[Math.max(0,GFX_ORDER.indexOf(OPT.gfx)-1)];
    chatMsg(`Running slowly (${Math.round(SURV.fps)} fps). Try Options > Video Settings > Graphics: ${GFX_PRESETS[nx].name}.`,'#ffaa00',false);}}else SURV.slowT=0;
  if(isHost()){SURV.saveT+=dt;if(SURV.saveT>=30){SURV.saveT=0;saveWorld();}SURV.syncT-=dt;if(SURV.syncT<=0&&net){SURV.syncT=5;netSend(N.WTIME,{t:worldTime});}}
  // biome name when you walk into a new one
  if(p&&p.alive){const b=biomeAt(p.pos[0],p.pos[2]);if(b!==SURV.lastBiome){SURV.biomeT+=dt;if(SURV.biomeT>1.2||SURV.lastBiome<0){SURV.toast={t:3,txt:BIOMES[b].name};SURV.lastBiome=b;SURV.biomeT=0;}}else SURV.biomeT=0;}}
// lift the player out of anything solid (trees, edits) after loading or respawning
function settlePlayer(p){for(let i=0;i<80;i++){const x=Math.floor(p.pos[0]),y=Math.floor(p.pos[1]),z=Math.floor(p.pos[2]);if(!solid(x,y,z)&&!solid(x,y+1,z))break;p.pos[1]=y+1;}p.vel=[0,0,0];p.mot=[0,0,0];p.fallDist=0;}
function survRespawn(){const p=player;if(!p)return;hide('deathPanel');p.alive=true;p.bat=false;p.spectator=false;p.health=20;p.food=20;p.sat=5;p.effects={};p.fire=0;p.air=300;
  p.pos=SURV.spawn.slice();p.vel=[0,0,0];p.mot=[0,0,0];p.fallDist=0;p.invuln=1;if(!chunkReadyAt(p.pos[0],p.pos[2])){SURV.loading=true;$('loadTitle').textContent='Respawning';$('loading').classList.remove('hidden');}else{settlePlayer(p);lockPointer();}sfx('click');}
function survDeathPanel(killer,cause){$('deathSub').textContent=feed[0]?feed[0].txt:'';document.exitPointerLock&&document.exitPointerLock();show('deathPanel');}
function survLeave(){if(survival()){saveWorld();}}
// ---------- world select ----------
function openWorlds(){initAudio();sfx('click');readName();hide('menu');renderWorldList();$('w_gfx').value=OPT.gfx;show('worldPanel');}
function renderWorldList(){const box=$('worldList');box.textContent='';const l=worldList();
  if(!l.length){const d=document.createElement('div');d.className='rnote';d.textContent='No worlds yet. Create one below.';box.appendChild(d);return;}
  for(const w of l){const row=document.createElement('div');row.className='wrow';const b=document.createElement('button');b.className='room';
    const nm=document.createElement('span');nm.className='rn';nm.textContent=w.name;const st=document.createElement('span');st.className='rs';st.textContent='Seed '+w.seed+' · '+new Date(w.played||w.created).toLocaleDateString();
    b.append(nm,st);b.addEventListener('click',()=>playWorld(w));const del=document.createElement('button');del.className='wdel';del.textContent='Delete';del.title='Delete '+w.name;
    del.addEventListener('click',()=>{if(del.dataset.sure){deleteWorld(w.id);renderWorldList();sfx('click');}else{del.dataset.sure='1';del.textContent='Sure?';setTimeout(()=>{if(document.body.contains(del)){del.textContent='Delete';delete del.dataset.sure;}},2500);}});
    row.append(b,del);box.appendChild(row);}}
function playWorld(meta,keepNet){sfx('click');if(!keepNet){if(net){net.leave();net=null;}online=false;}const data=loadWorldData(meta.id);
  beginSurvival({meta,seed:data&&data.seed!=null?data.seed:meta.seed,edits:data?editsFromJSON(data.edits):new Map(),time:data?data.time:null,spawn:data?data.spawn:null,me:data?data.player:null});}
$('wCreate').addEventListener('click',()=>{const meta=newWorldMeta($('w_name').value,$('w_seed').value);$('w_seed').value='';playWorld(meta);});
$('wBack').addEventListener('click',()=>{sfx('click');hide('worldPanel');show('menu');});
$('w_gfx').addEventListener('change',()=>{applyPreset($('w_gfx').value);});
$('respawnBtn').addEventListener('click',survRespawn);
$('deathMenu').addEventListener('click',()=>{hide('deathPanel');toMenu();});
// ---------- Multiplayer through Photon (App ID only) ----------
function openMP(){initAudio();sfx('click');readName();hide('menu');$('ph_app').value=store('mcr_appid')||'';$('ph_region').value=store('mcr_region')||'us';$('ph_mode').value=store('mcr_mpmode')||'survival';$('phStatus').textContent='';show('mpPanel');}
$('phBack').addEventListener('click',()=>{sfx('click');if(net&&!online){net.leave();net=null;}hide('mpPanel');show('menu');});
$('phConnect').addEventListener('click',()=>{const app=$('ph_app').value.trim(),region=$('ph_region').value,mode=$('ph_mode').value;
  if(!/^[0-9a-f-]{20,}$/i.test(app)){$('phStatus').textContent='Paste your Photon Realtime App ID (it looks like 1a2b3c4d-....).';return;}
  store('mcr_appid',app);store('mcr_region',region);store('mcr_mpmode',mode);if(net){net.leave();net=null;}readOptions();
  $('phStatus').textContent='Connecting to Photon...';const n=new PhotonNet(app,region,mode,myName);net=n;
  n.tr.onstate=s=>{if(net===n&&!n.ready)$('phStatus').textContent='Photon: '+s.replace(/([a-z])([A-Z])/g,'$1 $2')+'...';};
  n.onEvent=onNetEvent;n.onJoin=(id,name)=>{if(isHost()&&MATCH.state==='lobby')MATCH.phaseT=0;if(survival())chatMsg(name+' joined the game','#ffff55',false);};n.onLeave=onMemberLeave;n.onHostChange=onHostChanged;
  n.onFail=msg=>{if(net!==n)return;const was=online;net=null;n.leave();if(was){toMenu();openMP();}$('phStatus').textContent=msg;};
  n.onReady=()=>{if(net!==n)return;online=true;$('phStatus').textContent='Connected. '+(n.isHost()?'You are the host.':'Joining the host...');player=null;ents=[];
    if(mode==='survival'){if(n.isHost()){const id='online_'+(hashStr(app)>>>0).toString(36);let meta=worldList().find(w=>w.id===id);
        if(!meta){meta={id,name:'Online World',seed:seedFrom(''),created:Date.now(),played:Date.now()};saveWorldList([meta,...worldList()]);}hide('mpPanel');playWorld(meta,true);}
      else{hide('mpPanel');const el=$('loading');$('loadTitle').textContent='Joining world';el.classList.remove('hidden');$('loadBar').style.width='5%';netSend(N.HELLO,{},'host');
        setTimeout(()=>{if(net===n&&MATCH.mode!=='survival'&&!n.isHost()){netSend(N.HELLO,{},'host');}},4000);}}
    else{hide('mpPanel');if(n.isHost())enterLobby();else{enterLobby();netSend(N.HELLO,{},'host');}}};});
// what a joining player needs to build the same world
function survSnapshot(joinId){return {mode:'survival',seed:WSEED,time:worldTime,spawn:SURV.spawn,edits:editsToJSON(),
  ents:ents.filter(e=>e.kind==='player').map(e=>({id:e.id,name:e.name,skin:e.skin,sp:[e.pos[0],e.pos[1],e.pos[2],e.yaw]})),drops:drops.filter(d=>d.did>0).map(d=>({did:d.did,pos:d.pos,vel:[0,0,0],id:d.id,count:d.count,age:1,spin:0}))};}
function survApplyStart(d){beginSurvival({meta:null,seed:d.seed,edits:editsFromJSON(d.edits),time:d.time,spawn:d.spawn,ents:d.ents,drops:d.drops,join:true});}
// render distance grew past what the chunk ring holds: rebuild it around the player (edits and time are kept)
function restartSurvivalStream(){if(!INF)return;const ed=worldEdits,seed=WSEED;infInit(infRingFor(OPT.chunks),seed,ed);infRD=Math.min(OPT.chunks,infMaxRD());
  SURV.loading=true;$('loadTitle').textContent='Loading chunks';$('loadBar').style.width='0%';$('loading').classList.remove('hidden');}
addEventListener('keydown',e=>{if(e.code==='F3'&&INF){SURV.debug=!SURV.debug;e.preventDefault();}});
addEventListener('keydown',e=>{if(e.code!=='Escape')return;if(!$('worldPanel').classList.contains('hidden')){$('wBack').click();e.preventDefault();}else if(!$('mpPanel').classList.contains('hidden')){$('phBack').click();e.preventDefault();}});
