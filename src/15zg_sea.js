// ================= The sea update: squid, fish, the Megalodon and the Kraken =================
// Oceans and rivers now have life in them: squid (the pack's own squid), cod, salmon, tropical fish and pufferfish.
// Deep ocean water hides two monsters. The Megalodon circles you, then charges out of the murk with its jaws open.
// The Kraken waits on the sea floor and rises under swimmers and boats; its tentacles hold you down while it squeezes.
// Both have boss bars, and both get a jumpscare when they get you.
// Sea creatures run their own swimming code: they move freely in 3D while in water and flop about (and suffocate) on land.
N.SEA=77;

// ---------- items ----------
Object.assign(DURABILITY,{shark:900});Object.assign(TOOL_SPEED,{shark:6});Object.assign(TOOL_LEVEL,{shark:2});Object.assign(REPAIR_MAT,{shark:['megalodon_tooth']});
ni('megalodon_tooth',{name:'Megalodon Tooth',type:'mat',stack:64,color:'#ece4cc',tip:['Dropped by the Megalodon']});
nfood('kraken_eye','Kraken Eye',4,2,'#f0a020',{rare:true,fx:[['strength',60,1],['absorption',60,1]],always:true,tip:['Dropped by the Kraken','Eat it, if you dare: Strength and Absorption']});
ni('shark_tooth_sword',{name:'Shark Tooth Sword',type:'weapon',tool:'sword',dmg:8,color:'#ece4cc',rc:{src:'iron_sword',col:'#ece4cc',sel:'gray'},tip:['Made from Megalodon teeth']});
{const P=(r,k,o,n)=>shaped(r,k,o,n);P(['T','T','S'],{T:'megalodon_tooth',S:'stick'},'shark_tooth_sword');}
{const t=LC_TABS.find(x=>x.name==='Tools and Weapons');if(t)t.entries.push(['From the Sea',['shark_tooth_sword']]);}
// their pictures, in the same Minecraft style as the other drawn items (see 15ze_mcart.js)
Object.assign(MCA_RAMP,{tooth:'6a604a c8bea0 e0d8c0 f0eadc fffbf0',toothRoot:'2a2018 4a3a2c 5e4a38 6e5a46 7e6a54',sclera:'3a0808 8a2020 a83030 c04848 d86868',krakenIris:'6a2a04 c05a10 e88a18 f8b830 ffe070'});
for(const k of ['tooth','toothRoot','sclera','krakenIris'])if(typeof MCA_RAMP[k]==='string')MCA_RAMP[k]=MCA_RAMP[k].split(' ').map(mcaHex);
Object.assign(MCA_ART,{"megalodon_tooth":{g:["................","...rrrrrrrrrr...","..rrrrrrrrrrrr..","..wwwwwwwwwwww..","..wwwwwwwwwwww..","...wwswwwwwwww..","..wwwwwwwwwww...","...wwwwwwwwww...","....wwswwwwww...","...wwwwwwwww....","....wwwwwwww....",".....wwswwww....","....wwwwwww.....","......wwwww.....","......wwww......",".......ww......."],p:{w:'tooth',r:'toothRoot',s:'#fffdf4'}},
  "kraken_eye":{g:["................",".....eeeeee.....","...eeeeeeeeee...","..eeeiiiiiieee..",".eeiiiikkiiiiee.",".eeiihkkkiiiiee.","eeiiiikkiiiiiee.","eeiiiikkiiiiiee.","eeiiiikkiiiiiee.","eeiiiikkiiiiiee.",".eeiiikkiiiiee..",".eeiiiikkiiiiee.","..eeeiiiiiieee..","...eeeeeeeeee...",".....eeeeee.....","................"],p:{e:'sclera',i:'krakenIris',k:'#080404',v:'#8a0c10',h:'#fff4c8'}}});

// ---------- the creatures ----------
const SEA_FISH=['cod','salmon','tropical_fish','pufferfish'];
Object.assign(MOB_T,{
  squid:{name:'Squid',hp:10,hw:.45,eh:.95,model:'zombie',kind:'water',spd:.3,drops:[['black_dye',1,3]],col:'#26425e',sea:'squid'},
  cod:{name:'Cod',hp:3,hw:.25,eh:.35,model:'zombie',kind:'water',spd:.3,drops:[['raw_fish',1,1]],col:'#a08a5a',sea:'fish'},
  salmon:{name:'Salmon',hp:3,hw:.3,eh:.4,model:'zombie',kind:'water',spd:.3,drops:[['raw_salmon',1,1]],col:'#b04a3a',sea:'fish'},
  tropical_fish:{name:'Tropical Fish',hp:3,hw:.2,eh:.4,model:'zombie',kind:'water',spd:.3,drops:[['clownfish',1,1]],col:'#f08a20',sea:'fish'},
  pufferfish:{name:'Pufferfish',hp:3,hw:.3,eh:.4,model:'zombie',kind:'water',spd:.3,drops:[['pufferfish',1,1]],col:'#e8c020',sea:'fish'},
  megalodon:{name:'Megalodon',hp:200,hw:1.5,eh:2.2,model:'zombie',kind:'hostile',spd:.5,dmg:10,drops:[['megalodon_tooth',2,4],['raw_fish',3,6]],rare:[['heart_of_the_sea',.12]],col:'#4a5560',sea:'mega',fireproof:true},
  kraken:{name:'Kraken',hp:300,hw:2.2,eh:4,model:'zombie',kind:'hostile',spd:.4,dmg:3,drops:[['black_dye',8,16],['kraken_eye',1,1],['nautilus_shell',2,4]],rare:[['heart_of_the_sea',.35]],col:'#5a1828',sea:'kraken',fireproof:true}});
for(const k of ['squid'].concat(SEA_FISH,['megalodon','kraken'])){MOB_TYPES.push(k);MOB_SND[k]={hurt:['entity/fish/hurt'],death:['entity/fish/hurt']};}
MOB_SND.squid={hurt:['entity/fish/hurt'],death:['entity/fish/hurt']};MOB_SND.megalodon={hurt:['ambient/underwater/additions/animal'],death:['ambient/underwater/additions/bass_whale']};
MOB_SND.kraken={hurt:['ambient/underwater/additions/animal'],death:['ambient/underwater/additions/dark']};
// spawn eggs
for(const [k,a,b] of [['squid','#223b4c','#708899'],['cod','#c1a76a','#e5c48b'],['salmon','#a00f10','#0e8474'],['tropical_fish','#ef6915','#fff9ef'],['pufferfish','#f6b201','#37c3f2'],['megalodon','#3c4650','#d8d8d0'],['kraken','#4a0c1c','#f0a020']])
  item('spawn_egg_'+k,{name:'Spawn '+MOB_T[k].name,type:'mat',stack:64,color:a,color2:b,spawn:k,tip:['Right click the ground to spawn a '+MOB_T[k].name]});
const isSea=e=>!!(MOB_T[e.mob]&&MOB_T[e.mob].sea);

// ---------- water helpers ----------
function seaWaterAt(x,y,z){const b=getB(Math.floor(x),Math.floor(y),Math.floor(z));return !!(b&&BD[b]&&BD[b].liquid==='water');}
// the water column at x,z around y: its surface (top water block) and its floor (first solid block below)
function seaCol(x,z,y){x=Math.floor(x);z=Math.floor(z);y=Math.floor(y);let top=y,bot=y;if(!seaWaterAt(x,y,z))return null;
  while(top<WY-1&&seaWaterAt(x,top+1,z))top++;while(bot>1&&seaWaterAt(x,bot-1,z))bot--;return {top,bot:bot-1};}
function seaYaw(e){const v=e.sv;const h=Math.hypot(v[0],v[2]);if(h>.05){const want=Math.atan2(-v[0],-v[2]);e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dtFrame*6+.05);}
  e.headYaw=e.yaw=e.bodyYaw;e.pitch=clamp(Math.atan2(v[1],Math.max(.3,h)),-.9,.9);}
function seaSteer(e,dt,to,speed,turn){const d=[to[0]-e.pos[0],to[1]-e.pos[1],to[2]-e.pos[2]];const L=Math.hypot(d[0],d[1],d[2])||1;const k=Math.min(1,dt*turn);
  for(let i=0;i<3;i++)e.sv[i]+=(d[i]/L*speed-e.sv[i])*k;}
// move through water; a bump into land or air turns it back
function seaMove(e,dt){const mid=e.eh*.5;const n=[e.pos[0]+e.sv[0]*dt,e.pos[1]+e.sv[1]*dt,e.pos[2]+e.sv[2]*dt];
  if(seaWaterAt(n[0],n[1]+mid,n[2])){e.pos=n;return true;}
  let ok=false;for(let i=0;i<3;i++){const t=e.pos.slice();t[i]=n[i];if(seaWaterAt(t[0],t[1]+mid,t[2])){e.pos=t;ok=true;}else e.sv[i]*=-.35;}return ok;}
// out of the water: flop, and slowly suffocate
function seaLand(e,dt){e.sv=[0,0,0];e.landT=(e.landT||0)+dt;if(e.onGround&&Math.random()<dt*2){e.mot[1]=.3;e.mot[0]+=(Math.random()-.5)*.2;e.mot[2]+=(Math.random()-.5)*.2;}
  e.spdK=0;physics(e,dt,0,0);if(e.landT>1){e.landT=0;hurt(e,MOB_T[e.mob].sea==='fish'?1:2,null,'drown');}}

// ---------- behaviour (whoever runs the creatures) ----------
const seaPrey=(e,r)=>{let best=null,bd=r;for(const q of ents){if(q.kind!=='player'||!q.alive||q.spectator||q.bat||q.gm==='creative')continue;
  const inSea=q.inWater||seaWaterAt(q.pos[0],q.pos[1]+.3,q.pos[2])||(typeof vehicleOf==='function'&&q===player&&vehicleOf(q))||q.riding;if(!inSea)continue;const d=dist(q.pos,e.pos);if(d<bd){bd=d;best=q;}}return best;};
function seaInit(e){if(e.sv)return;e.sv=[0,0,0];e.sea={st:'roam',t:0,goal:null,ang:Math.random()*6.28,dir:Math.random()<.5?1:-1,home:e.pos.slice(),taken:0};}
function seaUpdate(e,dt){seaInit(e);if(!chunkReadyAt(e.pos[0],e.pos[2])){e.rpos=e.pos;return;}
  tickEffects(e,dt);e.fire=0;if(!e.alive)return;e.atkCD=Math.max(0,(e.atkCD||0)-dt);
  // knockback from hits arrives in e.mot (blocks per tick)
  if(e.mot&&(e.mot[0]||e.mot[2])){e.sv[0]+=e.mot[0]*14;e.sv[2]+=e.mot[2]*14;e.sv[1]+=e.mot[1]*6;e.mot=[0,0,0];}
  const T=MOB_T[e.mob],kind=T.sea;e.inWater=seaWaterAt(e.pos[0],e.pos[1]+e.eh*.5,e.pos[2]);
  if(!e.inWater){seaLand(e,dt);e.vel=[0,0,0];return;}e.landT=0;e.onGround=false;
  const S=e.sea;S.t+=dt;
  if(kind==='fish')fishAI(e,dt,S);else if(kind==='squid')squidAI(e,dt,S);else if(kind==='mega')megaAI(e,dt,S);else if(kind==='kraken')krakenAI(e,dt,S);
  seaMove(e,dt);e.vel=e.sv.slice();seaYaw(e);}
{const u0=updateMob;updateMob=function(e,dt){if(isSea(e))return seaUpdate(e,dt);return u0(e,dt);};}
// a point in the water near p (within r), not too close to the surface or the floor
function seaGoal(p,r,mid){for(let k=0;k<8;k++){const x=p[0]+(Math.random()-.5)*2*r,z=p[2]+(Math.random()-.5)*2*r,y=p[1]+(Math.random()-.5)*r*.6;const c=seaCol(x,z,y);if(!c)continue;
    const lo=c.bot+1+(mid||0),hi=c.top-(mid||0);if(hi<lo)continue;return [x,clamp(y,lo,hi),z];}return null;}
function fishAI(e,dt,S){const T=MOB_T[e.mob];const near=nearestPlayer(e,5);
  if(e.mob==='pufferfish'){const q=nearestPlayer(e,3);e.puff=q?Math.min(1,(e.puff||0)+dt*4):Math.max(0,(e.puff||0)-dt);
    if(q&&dist(q.pos,e.pos)<1.3+e.puff*.4&&e.atkCD<=0){e.atkCD=1.2;damage(q,1,e,'melee',null,false,[['poison',5,0]]);}}
  if(near&&e.mob!=='pufferfish'){const d=[e.pos[0]-near.pos[0],e.pos[1]-near.pos[1],e.pos[2]-near.pos[2]];seaSteer(e,dt,[e.pos[0]+d[0]*3,e.pos[1]+d[1],e.pos[2]+d[2]*3],3.2,4);return;}
  // schools: followers stay near their leader
  const lead=S.lead&&mobs.find(m=>m.id===S.lead&&m.alive);
  if(!S.goal||S.t>S.next||dist(S.goal,e.pos)<.6){S.t=0;S.next=2+Math.random()*4;S.goal=seaGoal(lead?lead.pos:e.pos,lead?2.5:6,.3)||S.goal;}
  if(S.goal)seaSteer(e,dt,S.goal,e.mob==='salmon'?1.4:e.mob==='pufferfish'?.6:1,2);}
function squidAI(e,dt,S){// it swims in pulses
  S.pulse=(S.pulse||0)-dt;if(S.pulse<=0){S.pulse=2+Math.random()*2.5;const g=seaGoal(e.pos,6,.6);if(g){const d=[g[0]-e.pos[0],g[1]-e.pos[1],g[2]-e.pos[2]];const L=Math.hypot(...d)||1;e.sv=[d[0]/L*2.4,d[1]/L*2.4,d[2]/L*2.4];}}
  for(let i=0;i<3;i++)e.sv[i]*=Math.max(0,1-dt*.9);}
// the Megalodon: roams, finds you, circles closer and closer, then charges
function megaAI(e,dt,S){const T=seaPrey(e,52);const col=seaCol(e.pos[0],e.pos[2],e.pos[1]+1);
  const clampY=p=>{const c=seaCol(p[0],p[2],e.pos[1]+1)||col;if(c){p[1]=clamp(p[1],c.bot+1.4,Math.max(c.bot+1.4,c.top-1.6));}return p;};
  if(!T){if(S.st!=='roam'){S.st='roam';S.t=0;}}
  else if(S.st==='roam'){S.st='stalk';S.t=0;S.R=13+Math.random()*4;S.len=7+Math.random()*6;}
  if(S.st==='roam'){if(!S.goal||S.t>8||dist(S.goal,e.pos)<2){S.t=0;S.goal=seaGoal(S.home,24,1.5)||seaGoal(e.pos,16,1.5);}if(S.goal)seaSteer(e,dt,S.goal,3,1.2);return;}
  const tp=[T.pos[0],T.pos[1]+.5,T.pos[2]];
  if(S.st==='stalk'){S.ang+=dt*.42*S.dir;S.R=Math.max(7,S.R-dt*.5);const p=clampY([tp[0]+Math.cos(S.ang)*S.R,tp[1]-2.5,tp[2]+Math.sin(S.ang)*S.R]);seaSteer(e,dt,p,5.5,1.6);
    if(S.t>S.len){S.st='charge';S.t=0;}return;}
  if(S.st==='charge'){seaSteer(e,dt,tp,13,2.6);const d=dist([e.pos[0],e.pos[1]+1,e.pos[2]],tp);
    if(d<2.8&&e.atkCD<=0){e.atkCD=2;e.swing=1;damage(T,Math.max(3,MOB_T.megalodon.dmg*diffMul()),e,'melee',[T.pos[0]-e.pos[0],T.pos[2]-e.pos[2],0,0,0],false);S.st='recover';S.t=0;}
    else if(S.t>3.5){S.st='recover';S.t=0;}return;}
  if(S.st==='recover'){const away=[e.pos[0]+(e.pos[0]-tp[0])*2,e.pos[1]-1,e.pos[2]+(e.pos[2]-tp[2])*2];seaSteer(e,dt,clampY(away),6.5,1.5);
    if(S.t>3){S.st='stalk';S.t=0;S.R=14;S.len=5+Math.random()*6;S.dir=Math.random()<.5?1:-1;S.ang=Math.atan2(e.pos[2]-tp[2],e.pos[0]-tp[0]);}}}
// the Kraken: lies on the sea floor, rises under you, holds you down and squeezes
function krakenAI(e,dt,S){const col=seaCol(e.pos[0],e.pos[2],e.pos[1]+1);const floorY=col?col.bot+1:e.pos[1];
  if(S.st==='grab'){const V=entById(S.vict);S.sq=(S.sq||0)-dt;
    if(!V||!V.alive||dist(V.pos,e.pos)>16||S.t>6.5||S.taken>=40){seaRelease(e,S);return;}
    e.sv=[0,-.4,0];if(e.pos[1]<=floorY+.5)e.sv[1]=0;
    if(S.sq<=0){S.sq=1.5;e.swing=1;damage(V,Math.max(1,MOB_T.kraken.dmg*diffMul()),e,'melee',null,false);}return;}
  if(S.st==='sink'){seaSteer(e,dt,[S.home[0],floorY,S.home[2]],2.5,1);if(S.t>14){S.st='lurk';S.t=0;}return;}
  const T=seaPrey(e,34);
  if(S.st!=='rise'){S.st='lurk';const g=[S.home[0]+Math.sin(S.t*.2)*3,floorY,S.home[2]+Math.cos(S.t*.17)*3];seaSteer(e,dt,g,.8,1);
    if(T&&Math.hypot(T.pos[0]-e.pos[0],T.pos[2]-e.pos[2])<28){S.st='rise';S.t=0;netSend(N.SEA,{k:'rise',id:e.id});seaNet('rise',{id:e.id});}return;}
  if(!T||S.t>20){S.st='sink';S.t=0;return;}
  const tp=[T.pos[0],T.pos[1]-3.2,T.pos[2]];seaSteer(e,dt,tp,4.2,1.4);
  if(dist([e.pos[0],e.pos[1]+3,e.pos[2]],T.pos)<6.5){S.st='grab';S.t=0;S.vict=T.id;S.taken=0;S.sq=.6;const m={k:'grab',id:e.id,v:T.id};netSend(N.SEA,m);seaNet('grab',m);}}
function seaRelease(e,S){const m={k:'rel',id:e.id,v:S.vict};S.st='sink';S.t=0;S.vict=null;netSend(N.SEA,m);seaNet('rel',m);}
// hits on the Kraken while it holds someone count toward letting go
{const h0=mobHurt;mobHurt=function(e,src,cause){if(e.mob==='kraken'&&e.sea)e.sea.taken+=(e._lastAmt||0);return h0(e,src,cause);};}
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ii){if(e&&e.mob==='kraken')e._lastAmt=amt;return h0(e,amt,src,cause,kb,raw,ii);};}

// ---------- state for the other computers, and the Kraken's grip ----------
const SEAS={grab:null,scare:null,ink:0,hb:0,rumble:0,sendT:0,seen:new Set()};
function seaNet(k,d){if(k==='grab'){const e=mobs.find(m=>m.id===d.id);if(e)e.sst='grab';if(player&&d.v===player.id){SEAS.grab={id:d.id,t:0,miss:0};seaScare('kraken');
      if(typeof vehicleOf==='function'&&vehicleOf(player))dismount(player);}}
  else if(k==='rel'){const e=mobs.find(m=>m.id===d.id);if(e)e.sst='sink';if(SEAS.grab&&SEAS.grab.id===d.id)SEAS.grab=null;}
  else if(k==='rise'){const e=mobs.find(m=>m.id===d.id);if(e)e.sst='rise';}
  else if(k==='st'){for(const [id,st] of d.a||[]){const e=mobs.find(m=>m.id===id);if(e)e.sst=st;}}}
{const o0=onNetEvent;onNetEvent=function(code,d,from){if(code===N.SEA){if(net&&from===net.hostId()&&d&&typeof d.k==='string')seaNet(d.k,d);return;}return o0(code,d,from);};}
// every half second the host tells everyone what the big ones are doing (jaws open, tentacles out)
function seaSync(dt){if(!isHost())return;const big=mobs.filter(m=>m.alive&&(m.mob==='megalodon'||m.mob==='kraken')&&m.sea);for(const m of big)m.sst=m.sea.st;
  if(!net||!big.length)return;SEAS.sendT-=dt;if(SEAS.sendT>0)return;SEAS.sendT=.5;netSend(N.SEA,{k:'st',a:big.map(m=>[m.id,m.sea.st])});}
// held: pulled toward its beak, can't swim up
function seaGrip(dt){const g=SEAS.grab,p=player;if(!g||!p)return;g.t+=dt;const k=mobs.find(m=>m.id===g.id&&m.alive);
  if(!k||!p.alive){g.miss+=dt;if(g.miss>1||!p.alive)SEAS.grab=null;return;}g.miss=0;if(g.t>9){SEAS.grab=null;return;}
  const kp=k.rpos||k.pos;const to=[kp[0],kp[1]+2.6,kp[2]];const d=[to[0]-p.pos[0],to[1]-p.pos[1],to[2]-p.pos[2]];const L=Math.hypot(d[0],d[1],d[2])||1;
  p.mot[0]=p.mot[0]*.6+d[0]/L*.06;p.mot[2]=p.mot[2]*.6+d[2]/L*.06;p.mot[1]=Math.min(p.mot[1]*.5+d[1]/L*.05,-.015);p.fallDist=0;GZ.tp=perfT;}
{const t0=survTick;survTick=function(dt){t0(dt);try{seaSync(dt);seaGrip(dt);}catch(e){console.error(e);}};}

// ---------- spawning (host, Overworld) ----------
let seaSpawnT=2;
function seaSpawn(dt){seaSpawnT-=dt;if(seaSpawnT>0)return;seaSpawnT=2;
  const players=ents.filter(e=>e.kind==='player'&&e.alive&&!e.spectator);if(!players.length)return;const p=players[Math.random()*players.length|0];
  const near=m=>hdist(m.pos,p.pos)<64;let fish=0,squid=0;for(const m of mobs){if(!m.alive||!near(m))continue;const s=MOB_T[m.mob].sea;if(s==='fish')fish++;else if(s==='squid')squid++;}
  const a=Math.random()*6.283,r=12+Math.random()*30;const x=Math.floor(p.pos[0]+Math.cos(a)*r),z=Math.floor(p.pos[2]+Math.sin(a)*r);if(!chunkReadyAt(x,z))return;
  const c=seaCol(x,z,SEA_LVL()-1);if(!c)return;const depth=c.top-c.bot;const bk=BIOMES[biomeAt(x,z)].k;
  if(depth>=3&&fish<12&&Math.random()<.7){const cold=bk==='frozen'||bk==='river'||bk==='taiga';const warm=!cold&&bk==='ocean';const rr=Math.random();
    const type=cold?'salmon':warm&&rr<.22?'tropical_fish':warm&&rr<.3?'pufferfish':'cod';const n=type==='pufferfish'?1:3+(Math.random()*3|0);let lead=null;
    for(let i=0;i<n;i++){const y=c.bot+1+Math.random()*Math.max(1,depth-2);const e=spawnMob(type,[x+.5+(Math.random()-.5)*2,y,z+.5+(Math.random()-.5)*2]);if(!seaWaterAt(e.pos[0],e.pos[1]+.2,e.pos[2])){e.gone=true;continue;}
      seaInit(e);if(type==='tropical_fish')e.color=lead?lead.color:(Math.random()*8|0);if(lead)e.sea.lead=lead.id;else lead=e;}return;}
  if(depth>=5&&squid<4&&Math.random()<.3){const e=spawnMob('squid',[x+.5,c.bot+2+Math.random()*(depth-3),z+.5]);seaInit(e);return;}
  if(bk!=='ocean'||sDiff()===0)return;
  // the big ones: out of sight, deep, far from any other
  const someoneAtSea=players.some(q=>q.inWater||q.riding||seaWaterAt(q.pos[0],q.pos[1]-.5,q.pos[2]));if(!someoneAtSea)return;
  const behind=(q,bx,bz)=>{const f=fwd(q);return (bx-q.pos[0])*f[0]+(bz-q.pos[2])*f[2]<0;};
  if(depth>=10&&!mobs.some(m=>m.mob==='megalodon'&&m.alive&&hdist(m.pos,p.pos)<160)&&Math.random()<.035){const b=seaBigSpot(p,depth,behind,10);if(b){const e=spawnMob('megalodon',b);seaInit(e);}return;}
  const night=dayAmt()<.35;if(depth>=14&&(night||depth>=18)&&!mobs.some(m=>m.mob==='kraken'&&m.alive&&hdist(m.pos,p.pos)<200)&&Math.random()<.02){const b=seaBigSpot(p,depth,behind,14);if(b){const e=spawnMob('kraken',b);seaInit(e);}}}
function seaBigSpot(p,depth,behind,need){for(let k=0;k<10;k++){const a=Math.random()*6.283,r=36+Math.random()*16;const x=Math.floor(p.pos[0]+Math.cos(a)*r),z=Math.floor(p.pos[2]+Math.sin(a)*r);
    if(!chunkReadyAt(x,z)||!behind(p,x,z))continue;const c=seaCol(x,z,SEA_LVL()-1);if(!c||c.top-c.bot<need)continue;return [x+.5,c.bot+1.2,z+.5];}return null;}
const SEA_LVL=()=>SEA;
{const s0=mobSpawnTick;mobSpawnTick=function(dt){if(DIM!=='overworld'||MATCH.mode!=='survival'||!INF)return s0(dt);
  // sea creatures don't count toward the land animals' and monsters' limits
  const sea=mobs.filter(isSea);mobs=mobs.filter(m=>!isSea(m));try{s0(dt);}finally{mobs=mobs.concat(sea);}seaSpawn(dt);};}

// ---------- drawing ----------
// paint a box's six faces in the usual box-UV layout: f(face,x,y,w,h) returns [r,g,b] or [r,g,b,a] or null
function seaPaint(c,u,v,w,h,d,f){const g=c.getContext('2d');const D=g.getImageData(0,0,c.width,c.height);
  const faces=[['top',u+d,v,w,d],['bottom',u+d+w,v,w,d],['right',u,v+d,d,h],['front',u+d,v+d,w,h],['left',u+d+w,v+d,d,h],['back',u+2*d+w,v+d,w,h]];
  for(const [n,x0,y0,fw,fh] of faces)for(let y=0;y<Math.ceil(fh);y++)for(let x=0;x<Math.ceil(fw);x++){const col=f(n,x,y,Math.ceil(fw),Math.ceil(fh));if(!col)continue;
    const X=Math.floor(x0)+x,Y=Math.floor(y0)+y;if(X<0||Y<0||X>=c.width||Y>=c.height)continue;const i=(Y*c.width+X)*4;D.data[i]=col[0];D.data[i+1]=col[1];D.data[i+2]=col[2];D.data[i+3]=col[3]==null?255:col[3];}
  g.putImageData(D,0,0);}
const sN=(x,y,s,a)=>1+(hash2(x,y,s)-.5)*(a||.16);
const sC=(c,k)=>[Math.max(0,Math.min(255,c[0]*k))|0,Math.max(0,Math.min(255,c[1]*k))|0,Math.max(0,Math.min(255,c[2]*k))|0];
// countershading: dark back, pale belly
function seaSkin(top,belly,line,s){return (n,x,y,w,h)=>{if(n==='top')return sC(top,.9*sN(x,y,s));if(n==='bottom')return sC(belly,sN(x,y,s+1,.08));
  const k=sN(x,y,s+2);return y<h*line?sC(top,k*(1-.12*y/h)):sC(belly,k);};}
const SEA_M={};
function seaMeshes(k){if(SEA_M[k])return SEA_M[k];const A=f=>{const o=[];f(o);return meshFrom(o);};let M=null;
  if(k==='squid'||k==='kraken'){const tex=(PACK.mobs&&PACK.mobs[k])||seaSquidTex(k);M={tex:mkTex(tex),th:tex.height,body:A(o=>boxUV(o,-6,0,-6,12,16,12,0,0,64,tex.height)),tent:A(o=>boxUV(o,-1,-18,-1,2,18,2,48,0,64,tex.height))};
    if(k==='kraken'){const e=mkCanvas(16,16),g=e.getContext('2d');for(let y=0;y<16;y++)for(let x=0;x<16;x++){const r=Math.hypot(x-7.5,y-7.5);if(r>7.6)continue;
        g.fillStyle=Math.abs(x-7.5)<1.6&&r<6.5?'#100404':r<5.8?`rgb(255,${(200-r*18)|0},${(40-r*4)|0})`:'#7a1010';g.fillRect(x,y,1,1);}
      M.etex=mkTex(e);M.eye=A(o=>{boxUV(o,-5.5,8,-6.15,4,4,0,0,0,8,4);boxUV(o,1.5,8,-6.15,4,4,0,0,0,8,4);});}}
  else if(SEA_FISH.includes(k)){const c=mkCanvas(32,32);const G=seaFishParts(k,c);M={tex:mkTex(c)};for(const n in G)M[n]=A(o=>G[n](o));}
  else if(k==='megalodon'){const c=mkCanvas(128,128);seaMegaTex(c);const B=(o,a)=>boxUV(o,...a,128,128);
    M={tex:mkTex(c),body:A(o=>B(o,[-7,0,-12,14,14,24,0,0])),head:A(o=>B(o,[-6,0,-11,12,11,11,0,40])),jaw:A(o=>B(o,[-5.5,-3,-10,11,3,10,48,40])),
      tail1:A(o=>B(o,[-5,0,0,10,10,14,0,64])),tail2:A(o=>B(o,[-3,0,0,6,7,12,50,64])),lobeU:A(o=>B(o,[-.5,0,-1.5,1,11,3,88,64])),lobeD:A(o=>B(o,[-.5,-7,-1.5,1,7,3,88,80])),
      dorsal:A(o=>B(o,[-.5,0,-4,1,11,7,0,96])),pecR:A(o=>B(o,[0,-.5,-3,8,1,5,24,96])),pecL:A(o=>boxUV(o,-8,-.5,-3,8,1,5,24,96,128,128,0,true)),
      eyes:A(o=>{B(o,[-6.1,6,-9,1,1,1,120,0]);B(o,[5.1,6,-9,1,1,1,120,0]);})};}
  return SEA_M[k]=M;}
// squid skin if the pack has none (1.8 layout); the Kraken's is made from the pack's squid in packLoadMobs below
function seaSquidTex(k){const c=mkCanvas(64,32);const kr=k==='kraken';const top=kr?[70,16,28]:[34,58,84],bel=kr?[120,40,48]:[60,90,120];
  seaPaint(c,0,0,12,16,12,(n,x,y,w,h)=>{const k2=sN(x,y,9300);if((n==='left'||n==='right')&&y>=4&&y<=6&&x>=5&&x<=6)return n==='left'?[230,230,230]:[20,20,20];return sC(n==='bottom'?bel:top,k2*(1-.15*(y/16)));});
  seaPaint(c,48,0,2,18,2,(n,x,y)=>sC(top,sN(x,y,9301)*(1-.3*y/18)));return c;}
{const p0=packLoadMobs;packLoadMobs=async function(get){const n=await p0(get);try{const img=await get('textures/entity/squid.png');if(img){const raw=dvFull(img);const fit=c=>imgToCanvas(c,64,Math.round(64*c.height/c.width),0,0,c.width,c.height);
  PACK.mobs=PACK.mobs||{};PACK.mobs.squid=fit(raw);PACK.mobs.kraken=fit(mobPal(raw,'1a0408 3a0a14 5a1424 8a2232 b84050'));for(const k of ['squid','kraken'])delete SEA_M[k];}}catch(e){}return n;};}
// fish: parts and pictures
function seaFishParts(k,c){const eye=(n,x,y,w,h,ex,ey)=>(n==='left'||n==='right')&&x===ex(w)&&y===ey?[12,12,12]:null;
  if(k==='cod'){const sk=seaSkin([128,110,70],[226,214,180],.55,9310);
    seaPaint(c,0,0,2,4,7,(n,x,y,w,h)=>{const s=sk(n,x,y,w,h);if((n==='left'||n==='right')&&y<2&&hash2(x,y,9311)>.6)return sC(s,.75);return s;});
    seaPaint(c,0,12,2,3,3,(n,x,y,w,h)=>(n==='left'||n==='right')&&y===1&&(x===0||x===w-1)?[16,16,16]:sk(n,x,y,w,h));
    seaPaint(c,20,0,0,6,5,(n,x,y,w,h)=>[150,128,86,(Math.abs(y-2.5)<1.2+x*.5)?255:0]);seaPaint(c,20,14,0,2,5,(n,x,y,w,h)=>[140,118,78,y>=1||x%2===0?255:0]);
    return {body:o=>boxUV(o,-1,0,-4,2,4,7,0,0,32,32),head:o=>boxUV(o,-1,.5,-7,2,3,3,0,12,32,32),tail:o=>boxUV(o,0,-1,0,0,6,5,20,0,32,32),fin:o=>boxUV(o,0,4,-3,0,2,5,20,14,32,32)};}
  if(k==='salmon'){const sk=seaSkin([150,54,44],[200,180,170],.6,9320);
    seaPaint(c,0,0,3,5,10,(n,x,y,w,h)=>{const s=sk(n,x,y,w,h);if(n!=='bottom'&&hash2(x,y,9321)>.82)return [60,40,36];return s;});
    seaPaint(c,0,16,2,4,3,(n,x,y,w,h)=>(n==='left'||n==='right')&&y===1&&(x===0||x===w-1)?[16,16,16]:sk(n,x,y,w,h));
    seaPaint(c,12,16,0,6,6,(n,x,y)=>[120,40,36,(Math.abs(y-2.5)<1.2+x*.55)?255:0]);seaPaint(c,24,16,0,2,4,(n,x,y)=>[120,40,36,y>=1||x%2===0?255:0]);
    return {body:o=>boxUV(o,-1.5,0,-5,3,5,10,0,0,32,32),head:o=>boxUV(o,-1,.5,-8,2,4,3,0,16,32,32),tail:o=>boxUV(o,0,-.5,0,0,6,6,12,16,32,32),fin:o=>boxUV(o,0,5,-2,0,2,4,24,16,32,32)};}
  if(k==='tropical_fish'){// coloured per fish in the draw call; the picture is white with darker stripes
    seaPaint(c,0,0,2,6,6,(n,x,y,w,h)=>{if((n==='left'||n==='right')&&y===2&&(x===0||x===w-1))return [20,20,20];const st=(n==='left'||n==='right')&&(x===2||x===3);return st?[120,120,120]:sC([250,250,250],sN(x,y,9330,.08));});
    seaPaint(c,16,0,0,4,4,(n,x,y)=>[200,200,200,Math.abs(y-1.5)<.8+x*.6?255:0]);seaPaint(c,16,8,0,3,4,(n,x,y)=>[200,200,200,y>=1||x%2===0?255:0]);
    return {body:o=>boxUV(o,-1,0,-3,2,6,6,0,0,32,32),tail:o=>boxUV(o,0,1,0,0,4,4,16,0,32,32),fin:o=>boxUV(o,0,6,-2,0,3,4,16,8,32,32)};}
  // pufferfish: yellow, brown spots, little spikes
  seaPaint(c,0,0,6,6,6,(n,x,y,w,h)=>{if(n==='front'&&y===1&&(x===1||x===4))return [16,16,16];if((x+y)%3===0&&n!=='bottom')return [250,240,200];
    if(hash2(x,y,9340+n.length)>.78&&n!=='bottom')return [120,84,30];return n==='bottom'?[240,236,210]:sC([232,190,30],sN(x,y,9341));});
  seaPaint(c,0,12,0,2,3,(n,x,y)=>[60,170,220,255]);
  return {body:o=>boxUV(o,-3,0,-3,6,6,6,0,0,32,32),tail:o=>boxUV(o,0,1.5,0,0,2,3,0,12,32,32),fin:o=>{boxUV(o,3,2,-1,0,2,3,0,12,32,32);boxUV(o,-3,2,-1,0,2,3,0,12,32,32);}};}
// the Megalodon's skin: slate back, white belly, scars, gills, red mouth, rows of teeth
function seaMegaTex(c){const top=[58,68,78],bel=[214,214,208];const sk=seaSkin(top,bel,.62,9350);
  const scar=(x,y)=>hash2(x>>1,y,9351)>.93;
  seaPaint(c,0,0,14,14,24,(n,x,y,w,h)=>{let s=sk(n,x,y,w,h);if(n!=='bottom'&&scar(x,y))s=sC(s,1.35);return s;});
  const tooth=(x,y,edge)=>edge&&((x%2===0)||y===0)?[244,240,226]:null,mouth=(x,y)=>sC([92,14,18],sN(x,y,9352));
  seaPaint(c,0,40,12,11,11,(n,x,y,w,h)=>{
    if(n==='bottom'){const e=x===0||y===0||x===w-1||y===h-1;if(e&&(x+y)%2===0)return [246,242,230];return mouth(x,y);}
    if(n==='front'){if(y>=h-2){const t=(x%3)!==1?(y===h-2?[240,236,222]:[250,248,240]):null;if(t)return t;return [40,8,10];}if(y===3&&(x===3||x===w-4))return [20,20,24];}
    if((n==='left'||n==='right')){if(y>=h-2&&x%2===0)return [246,242,230];      if(x>=6&&x<=9&&y>=3&&y<=8&&x%2===0)return sC(top,.55);}
    return sk(n,x,y,w,h);});
  seaPaint(c,48,40,11,3,10,(n,x,y,w,h)=>{if(n==='top'){const e=x===0||y===0||x===w-1||y===h-1;if(e&&(x+y)%2===1)return [246,242,230];return mouth(x,y);}
    if((n==='front'||n==='left'||n==='right')&&y===0&&x%2===0)return [246,242,230];return n==='bottom'?sC(bel,sN(x,y,9353)):sk(n,x,y+8,w,h+8);});
  seaPaint(c,0,64,10,10,14,(n,x,y,w,h)=>sk(n,x,y,w,h));seaPaint(c,50,64,6,7,12,(n,x,y,w,h)=>sk(n,x,y,w,h));
  // fins: solid slabs, set at angles when drawn
  const fin=(n,x,y)=>sC(top,sN(x,y,9354)*(n==='top'?.85:1));seaPaint(c,88,64,1,11,3,fin);seaPaint(c,88,80,1,7,3,fin);seaPaint(c,0,96,1,11,7,fin);seaPaint(c,24,96,8,1,5,fin);
  const g=c.getContext('2d');g.fillStyle='#ff2020';g.fillRect(120,0,8,8);}
// ink, bubbles
function seaInk(e){const p=e.rpos||e.pos;spawnParticles(p[0],p[1]+.6,p[2],24,[.03,.03,.05],1.4,'poof');if(player&&dist(player.pos,p)<4.5)SEAS.ink=Math.max(SEAS.ink,1.6);}
function seaDraw(e){const k=e.mob,M=seaMeshes(k);if(!M)return;const rp=e.rpos||e.pos,by=e.bodyYaw==null?e.yaw:e.bodyYaw;const T=MOB_T[k];
  const dead=e.deathT!=null?Math.min(1,e.deathT*1.6):0;const roll=dead*Math.PI*.9;const pitch=-(e.pitch||0);
  if(e.hurtT>.45&&!e._ink&&(k==='squid'||k==='kraken')){e._ink=true;seaInk(e);}if(!(e.hurtT>0))e._ink=false;
  setEntLight(e.pos);gl.uniform1f(PT.u.hurt,e.hurtT>0||e.deathT!=null?1:0);
  const P=(x,y,z,X,Y,Z)=>[M4.tr(x/16,y/16,z/16),M4.rz(Z||0),M4.ry(-(Y||0)),M4.rx(-(X||0))];const t=perfT+((e.id.charCodeAt(1)||0)%7);
  const spd=Math.hypot(e.vel?e.vel[0]:0,e.vel?e.vel[2]:0);
  if(k==='squid'||k==='kraken'){const S=k==='kraken'?4.2:1;const sw=k==='kraken'?Math.min(1,.4+spd*.15):Math.min(1,spd*.4);
    const base=chain(M4.tr(rp[0],rp[1]+(k==='kraken'?3.2:1.05),rp[2]),M4.ry(by),M4.rx(pitch*.5),M4.rz(roll),M4.sc(S,S,S));
    drawMesh(M.body,base,M.tex);const grab=k==='kraken'&&e.sst==='grab';
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const spread=grab?.9+Math.sin(t*3+i)*.15:.25+(.35+.25*sw)*(.5+.5*Math.sin(t*(k==='kraken'?1.6:3.2)+(k==='kraken'?i:0)));
      let m=chain(base,M4.tr(Math.cos(a)*5/16,1/16,Math.sin(a)*5/16),M4.ry(-a),M4.rz(spread));drawMesh(M.tent,m,M.tex);
      if(k==='kraken'){for(let s=1;s<4;s++){const curl=grab?-.55:Math.sin(t*1.3+i*.9+s)*.35-.1*s;m=chain(m,M4.tr(0,-18/16,0),M4.sc(.82,.82,.82),M4.rz(curl),M4.rx(Math.sin(t*.9+i+s)*.25));drawMesh(M.tent,m,M.tex);}}}
    if(k==='kraken'&&M.eye){gl.uniform1f(PT.u.bright,1.7);drawMesh(M.eye,base,M.etex);}
    else if(k==='squid'&&dayAmt()<.3){/* at night their eyes catch what little light there is */}
    gl.uniform1f(PT.u.hurt,0);return;}
  if(SEA_FISH.includes(k)){const puff=k==='pufferfish'?(e.puff!=null?e.puff:(player&&dist(player.pos,rp)<3?1:0)):0;if(k==='pufferfish'&&!isHost())e.puff=(e.puff||0)+((player&&dist(player.pos,rp)<3?1:0)-(e.puff||0))*Math.min(1,dtFrame*5);
    const S=k==='salmon'?1:k==='pufferfish'?.8*(1+(e.puff||0)*.7):.9;const wet=seaWaterAt(rp[0],rp[1]+e.eh*.5,rp[2]);const flop=wet?0:Math.sin(t*14)*.6;
    const base=chain(M4.tr(rp[0],rp[1]+.05,rp[2]),M4.ry(by),M4.rx(pitch),M4.rz(roll+flop+(wet?0:HP2)),M4.sc(S,S,S));
    if(k==='tropical_fish'){const C=SEA_TROP[(e.color|0)%SEA_TROP.length];gl.uniform4f(PT.u.tint,C[0],C[1],C[2],1);}
    const wag=Math.sin(t*(6+spd*4))*.45;drawMesh(M.body,base,M.tex);if(M.head)drawMesh(M.head,base,M.tex);
    const back=k==='cod'?3:k==='salmon'?5:k==='tropical_fish'?3:3;drawMesh(M.tail,chain(base,M4.tr(0,0,back/16),M4.ry(wag)),M.tex);if(M.fin)drawMesh(M.fin,base,M.tex);
    gl.uniform4f(PT.u.tint,1,1,1,1);gl.uniform1f(PT.u.hurt,0);return;}
  if(k==='megalodon'){const S=2.9;const base=chain(M4.tr(rp[0],rp[1]+.1,rp[2]),M4.ry(by),M4.rx(pitch),M4.rz(roll),M4.sc(S,S,S));
    const charging=e.sst==='charge';const open=e.swing>0?Math.max(0,.1-e.swing*.1):charging?.95+Math.sin(t*5)*.1:.08+Math.sin(t*.8)*.05;
    const sway=Math.sin(t*(1.6+spd*.25))*(.12+Math.min(.25,spd*.03));
    const body=chain(base,M4.ry(-sway*.35));drawMesh(M.body,body,M.tex);
    const head=chain(body,...P(0,2,-12,0,sway*.25,0));drawMesh(M.head,head,M.tex);drawMesh(M.jaw,chain(head,M4.rx(open)),M.tex);
    const t1=chain(body,...P(0,2,12,0,sway,0));drawMesh(M.tail1,t1,M.tex);const t2=chain(t1,...P(0,1.5,14,0,sway*1.4,0));drawMesh(M.tail2,t2,M.tex);
    const tf=chain(t2,...P(0,3.5,11,0,sway*1.2,0));drawMesh(M.lobeU,chain(tf,M4.rx(-.6)),M.tex);drawMesh(M.lobeD,chain(tf,M4.rx(.55)),M.tex);
    drawMesh(M.dorsal,chain(body,M4.tr(0,13/16,1/16),M4.rx(-.42)),M.tex);
    drawMesh(M.pecR,chain(body,M4.tr(6.5/16,3/16,-6/16),M4.rz(-.55),M4.ry(-.3)),M.tex);drawMesh(M.pecL,chain(body,M4.tr(-6.5/16,3/16,-6/16),M4.rz(.55),M4.ry(.3)),M.tex);
    gl.uniform1f(PT.u.bright,2.2);drawMesh(M.eyes,head,M.tex);gl.uniform1f(PT.u.hurt,0);return;}}
const SEA_TROP=[[1,.5,.12],[.2,.6,1],[1,.85,.15],[.95,.25,.4],[.4,.9,.5],[.7,.35,.95],[1,1,1],[.2,.9,.9]];
{const d0=drawMob;drawMob=function(e){if(isSea(e)){if(!e.gone)seaDraw(e);return;}return d0(e);};}

// ---------- the scares ----------
// hit by the Megalodon: the jaws close over the screen. Grabbed by the Kraken: its eye fills it.
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ii){const r=h0(e,amt,src,cause,kb,raw,ii);
  if(r&&e===player&&src&&src.mob==='megalodon'){seaScare('megalodon');if(typeof vehicleOf==='function'&&vehicleOf(player)){dismount(player);player.mot[1]=-.2;}}
  if(r&&e===player&&src&&src.mob==='kraken'&&SEAS.grab)GZ.shake=Math.max(GZ.shake||0,.6);
  return r;};}
const SEA_EYE={veins:null};
function seaScare(k){SEAS.scare={k,t:0,dur:k==='kraken'?1.9:1.3};GZ.shake=Math.max(GZ.shake||0,k==='kraken'?1.4:1.1);seaRoar(k);}
function seaRoar(k){if(!actx)return;try{
  if(k==='megalodon'){tone('sawtooth',120,36,1.1,.2);noiseHit(1.2,240,.8,.6,'lowpass',.35);noiseHit(.25,2500,1,.4,'bandpass');psnd(['ambient/underwater/additions/bass_whale'],null,1,.55);}
  else{tone('sawtooth',82,26,2.2,.22);tone('square',41,30,2,.06);noiseHit(2.1,170,.6,.65,'lowpass',.4);psnd(['ambient/underwater/additions/dark'],null,1,.5);
    if(typeof ndPlay==='function')ndPlay({vol:.55,rate:.45,lp:700,fade:.3,dur:2});}}catch(e){}}
// dread: a slow heartbeat while the Megalodon circles you, faster as it charges; the deep rumble of the Kraken rising
function seaDread(dt){const p=player;if(!p||!actx||DIM!=='overworld')return;let mega=99,charge=false,rise=99;
  for(const m of mobs){if(!m.alive)continue;if(m.mob==='megalodon'){const d=dist(m.pos,p.pos);if(d<mega){mega=d;charge=m.sst==='charge';}}if(m.mob==='kraken'&&(m.sst==='rise'||m.sst==='grab'))rise=Math.min(rise,dist(m.pos,p.pos));}
  const wet=p.inWater||p.riding;if(wet&&mega<34){SEAS.hb-=dt;if(SEAS.hb<=0){SEAS.hb=charge?.32:.55+mega/34*.7;try{tone('sine',58,40,.16,.22*(1-mega/40)+.05);setTimeout(()=>{try{tone('sine',52,36,.14,.15*(1-mega/40)+.03);}catch(e){}},150);}catch(e){}}}
  // the deep is never quite silent
  if(p.inWater&&camPos){const c=seaCol(camPos[0],camPos[2],camPos[1]);if(c&&c.top-c.bot>=10){SEAS.deep=(SEAS.deep==null?15:SEAS.deep)-dt;if(SEAS.deep<=0){SEAS.deep=18+Math.random()*30;
    try{psnd([Math.random()<.5?'ambient/underwater/additions/dark':'ambient/underwater/additions/animal'],null,.35,.7+Math.random()*.2);}catch(e){}}}}
  if(rise<30){SEAS.rumble-=dt;if(SEAS.rumble<=0){SEAS.rumble=3;try{noiseHit(3,90,.6,.3,'lowpass');psnd(['ambient/underwater/additions/bubbles'],null,.6,.6);}catch(e){}}}}
function seaEyeVeins(){if(SEA_EYE.veins)return SEA_EYE.veins;const v=[];for(let i=0;i<40;i++){const a=Math.random()*6.283;const pts=[[Math.cos(a),Math.sin(a)]];let r=1,b=a;for(let s=0;s<6;s++){r-=.08;b+=(Math.random()-.5)*.35;pts.push([Math.cos(b)*r,Math.sin(b)*r]);}v.push(pts);}return SEA_EYE.veins=v;}
{const h0=drawHUD;drawHUD=function(){h0();const dt=Math.min(.1,dtFrame||.016);try{seaDread(dt);}catch(e){}
  if(SEAS.ink>0){SEAS.ink-=dt;hc.save();const a=Math.min(1,SEAS.ink);const gr=hc.createRadialGradient(W/2,H/2,Math.min(W,H)*.1,W/2,H/2,Math.max(W,H)*.7);gr.addColorStop(0,`rgba(4,4,8,${a*.75})`);gr.addColorStop(1,`rgba(0,0,0,${a})`);hc.fillStyle=gr;hc.fillRect(0,0,W,H);hc.restore();}
  if(SEAS.grab){hc.save();const gr=hc.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.65);gr.addColorStop(0,'rgba(40,0,10,0)');gr.addColorStop(1,'rgba(40,0,10,.75)');hc.fillStyle=gr;hc.fillRect(0,0,W,H);hc.restore();}
  const S=SEAS.scare;if(!S)return;S.t+=dt;if(S.t>=S.dur){SEAS.scare=null;return;}const k=S.t/S.dur;hc.save();const j=()=>(Math.random()-.5)*W*.03;
  if(S.k==='megalodon'){// the jaws close over you: gums with rows of teeth come in from the top and the bottom
    const close=Math.min(1,k/.38),e2=close*close*(3-2*close);const gap=H*(.62*(1-e2)+.02);const yT=H/2-gap/2,yB=H/2+gap/2;
    const gr=hc.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.55);gr.addColorStop(0,'#1a0204');gr.addColorStop(.6,'#4a080c');gr.addColorStop(1,'#120204');hc.fillStyle=gr;hc.fillRect(0,0,W,H);
    const n=9,tw=W/n,tl=H*.2;
    const gum=(y0,y1)=>{const g3=hc.createLinearGradient(0,y0,0,y1);g3.addColorStop(0,'#3a0608');g3.addColorStop(1,'#8a1a1e');hc.fillStyle=g3;hc.fillRect(0,Math.min(y0,y1),W,Math.abs(y1-y0));};
    gum(yT-H*.8,yT);gum(yB+H*.8,yB);
    for(const row of [0,1])for(let i=-1;i<=n;i++){const x=i*tw+(row?tw/2:0)+j()*.3,len=tl*(.75+((i*7+row*3)%4)*.12);const y0=row?yB:yT,dir=row?-1:1;
      const g4=hc.createLinearGradient(x,0,x+tw,0);g4.addColorStop(0,'#bdb39c');g4.addColorStop(.45,'#fbf7ea');g4.addColorStop(1,'#a89e88');hc.fillStyle=g4;
      hc.beginPath();hc.moveTo(x+tw*.06,y0);hc.lineTo(x+tw*.94,y0);hc.lineTo(x+tw*.52,y0+dir*len);hc.closePath();hc.fill();hc.strokeStyle='rgba(70,30,20,.7)';hc.lineWidth=1.5;hc.stroke();
      // serrated edges
      hc.fillStyle='rgba(120,100,80,.5)';for(let q=1;q<5;q++){const f=q/5;hc.fillRect(x+tw*(.06+.46*f),y0+dir*len*f,2,2);hc.fillRect(x+tw*(.94-.42*f)-2,y0+dir*len*f,2,2);}}
    if(k>.36&&k<.44){hc.fillStyle='rgba(255,255,255,.8)';hc.fillRect(0,0,W,H);}
    if(k>.44){hc.globalAlpha=Math.min(1,(k-.44)*2.5);hc.fillStyle='#000';hc.fillRect(0,0,W,H);hc.globalAlpha=Math.max(0,.55-(k-.44)*.8);hc.fillStyle='#8a0000';hc.fillRect(0,0,W,H);}}
  else{// the Kraken's eye opens in front of you
    hc.fillStyle='#030104';hc.fillRect(0,0,W,H);const R=Math.min(W,H)*(.42+k*.25),cx=W/2+j(),cy=H/2+j();const open=Math.min(1,k/.2)*(k>.85?Math.max(0,1-(k-.85)/.12):1);
    hc.save();hc.beginPath();hc.ellipse(cx,cy,R*1.25,R*open*.95+1,0,0,Math.PI*2);hc.clip();
    let g2=hc.createRadialGradient(cx,cy,R*.2,cx,cy,R*1.2);g2.addColorStop(0,'#c04030');g2.addColorStop(1,'#2a0406');hc.fillStyle=g2;hc.fillRect(cx-R*1.3,cy-R*1.3,R*2.6,R*2.6);
    hc.strokeStyle='rgba(120,0,0,.8)';hc.lineWidth=Math.max(1,R*.012);for(const v of seaEyeVeins()){hc.beginPath();v.forEach(([x,y],i)=>{const X=cx+x*R*1.2,Y=cy+y*R*1.2;i?hc.lineTo(X,Y):hc.moveTo(X,Y);});hc.stroke();}
    g2=hc.createRadialGradient(cx,cy,0,cx,cy,R*.72);g2.addColorStop(0,'#fff070');g2.addColorStop(.45,'#f0a020');g2.addColorStop(1,'#7a2a06');hc.fillStyle=g2;hc.beginPath();hc.arc(cx,cy,R*.72,0,Math.PI*2);hc.fill();
    hc.strokeStyle='rgba(90,30,0,.5)';hc.lineWidth=Math.max(1,R*.01);for(let i=0;i<48;i++){const a=i/48*Math.PI*2;hc.beginPath();hc.moveTo(cx+Math.cos(a)*R*.2,cy+Math.sin(a)*R*.2);hc.lineTo(cx+Math.cos(a)*R*.7,cy+Math.sin(a)*R*.7);hc.stroke();}
    const pw=R*(.07+.25*Math.max(0,(k-.4)/.6));hc.fillStyle='#000';hc.beginPath();hc.ellipse(cx,cy,pw,R*.66,0,0,Math.PI*2);hc.fill();
    hc.fillStyle='rgba(255,255,240,.75)';hc.beginPath();hc.ellipse(cx-R*.3,cy-R*.32,R*.08,R*.05,-.6,0,Math.PI*2);hc.fill();hc.restore();
    if(k<.08){hc.fillStyle='rgba(255,255,255,.6)';hc.fillRect(0,0,W,H);}}
  hc.restore();};}
// boss bars for the Megalodon and the Kraken when they are close
{const b0=drawBossBar;drawBossBar=function(){b0();if(!INF||!player||hideGui||DIM!=='overworld')return;let y=22+mobs.filter(m=>m.mob==='skinwalker'&&m.alive&&m.sw&&m.sw.st!=='d'&&dist(m.pos,camPos)<64).length*30;
  for(const m of mobs){if(!m.alive||(m.mob!=='megalodon'&&m.mob!=='kraken')||dist(m.pos,camPos)>40)continue;const w=Math.min(420,W*.6),x=(W-w)/2;hc.save();txt(MOB_T[m.mob].name,W/2,y-6,16,m.mob==='kraken'?'#ff9a3a':'#9ad0ff','center');
    hc.fillStyle='rgba(0,10,30,.85)';hc.fillRect(x,y,w,8);const f=Math.max(0,m.health/m.maxHp);const gr=hc.createLinearGradient(0,y,0,y+8);
    if(m.mob==='kraken'){gr.addColorStop(0,'#ff8a2a');gr.addColorStop(1,'#8a2a06');}else{gr.addColorStop(0,'#5ab0ff');gr.addColorStop(1,'#1a4a8a');}hc.fillStyle=gr;hc.fillRect(x,y,w*f,8);
    hc.strokeStyle='#000';hc.lineWidth=1;hc.strokeRect(x+.5,y+.5,w-1,7);for(let i=1;i<20;i++){hc.fillStyle='rgba(0,0,0,.35)';hc.fillRect(x+w*i/20,y,1,8);}hc.restore();y+=30;}};}

// the new items need icons, and no two network messages may share a number
rebuildIcons();rebuildItemAtlas();
{const seen={};for(const k in N){if(seen[N[k]])console.error('network code clash: N.'+k+' and N.'+seen[N[k]]+' are both '+N[k]);seen[N[k]]=k;}}
