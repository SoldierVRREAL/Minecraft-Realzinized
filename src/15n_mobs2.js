// ================= Nether and End creatures: Zombie Pigmen, Ghasts, Blazes, Wither Skeletons, Endermen; the Ender Dragon and its crystals =================
Object.assign(MOB_T,{
  zombie_pigman:{name:'Zombie Pigman',hp:20,hw:.3,eh:1.95,model:'zombie',kind:'neutral',spd:.7,chase:1.05,dmg:5,fireproof:true,drops:[['rotten_flesh',0,1],['gold_nugget',0,1]],rare:[['gold_ingot',.03]],xp:5,col:'#e8a0a0'},
  ghast:{name:'Ghast',hp:10,hw:2,eh:4,model:'ghast',kind:'hostile',spd:.3,fly:true,fireproof:true,drops:[['gunpowder',0,2],['ghast_tear',0,1]],xp:5,scale:4.5,col:'#f0f0f0'},
  blaze:{name:'Blaze',hp:20,hw:.3,eh:1.8,model:'blaze',kind:'hostile',spd:.6,dmg:6,fireproof:true,hover:true,hitFx:[['ignite',4,0]],drops:[['blaze_rod',0,1]],xp:10,glow:1,col:'#f0b020'},
  wither_skeleton:{name:'Wither Skeleton',hp:20,hw:.36,eh:2.4,model:'skeleton',kind:'hostile',spd:.75,dmg:8,fireproof:true,hitFx:[['poison',10,0]],drops:[['coal',0,1],['bone',0,2]],xp:5,scale:1.2,col:'#2a2a2a'},
  enderman:{name:'Enderman',hp:40,hw:.3,eh:2.9,model:'enderman',kind:'neutral',spd:.75,chase:1.25,dmg:7,drops:[['ender_pearl',0,1]],xp:5,col:'#141414'},
  dragon:{name:'Ender Dragon',hp:200,hw:3.5,eh:3.5,model:'dragon',kind:'boss',spd:1,fireproof:true,drops:[],xp:0,col:'#1a1a1a'},
  end_crystal:{name:'End Crystal',hp:1,hw:1,eh:2,model:'crystal',kind:'object',spd:0,fireproof:true,drops:[],xp:0,col:'#e0a0f0'}});
for(const k of ['zombie_pigman','ghast','blaze','wither_skeleton','enderman','dragon','end_crystal'])MOB_TYPES.push(k);
for(const k of ['pig','cow','sheep','chicken','deer','glowshroom'])MOB_T[k].xp=2;for(const k of ['zombie','skeleton','spider','creeper','crystal_spider','magma','ice_wolf'])MOB_T[k].xp=5;
MOB_TEXKEYS.push('zombie_pigman','ghast','ghast_shooting','blaze','wither_skeleton','enderman','enderman_eyes','end_crystal');
Object.assign(MOB_SRC,{zombie_pigman:'zombie_pigman',ghast:'ghast/ghast',ghast_shooting:'ghast/ghast_shooting',blaze:'blaze',wither_skeleton:'skeleton/wither_skeleton',enderman:'enderman/enderman',enderman_eyes:'enderman/enderman_eyes',end_crystal:'endercrystal/endercrystal'});
Object.assign(PASSIVE_BY,{birch:['pig','cow','sheep','chicken'],taiga:['sheep','deer','pig'],savanna:['cow','sheep','pig'],desert:[],dark:['pig','sheep'],hills:['sheep','cow'],river:[]});
HOSTILE_BASE.push('enderman');
// ---- models (vanilla 1.8 geometry) ----
MOB_MODELS.enderman={head:{p:[0,-18,0],b:[[-4,-8,-4,8,8,8,0,0],[-4,-8,-4,8,8,8,0,16,-.5]]},body:{p:[0,-18,0],b:[[-4,0,-2,8,12,4,32,16]]},
  rarm:{p:[-5,-16,0],b:[[-1,-2,-1,2,30,2,56,0]]},larm:{p:[5,-16,0],b:[[-1,-2,-1,2,30,2,56,0,0,true]]},rleg:{p:[-2,-6,0],b:[[-1,0,-1,2,30,2,56,0]]},lleg:{p:[2,-6,0],b:[[-1,0,-1,2,30,2,56,0,0,true]]}};
MOB_MODELS.blaze={head:{p:[0,0,0],b:[[-4,-4,-4,8,8,8,0,0]]}};for(let i=0;i<12;i++)MOB_MODELS.blaze['r'+i]={p:[0,0,0],b:[[0,0,0,2,8,2,0,16]]};
MOB_MODELS.ghast={body:{p:[0,16,0],b:[[-8,-8,-8,16,16,16,0,0]]}};
for(let i=0;i<9;i++){const len=8+((i*7)%6);const x=(((i%3)-(Math.floor(i/3)%2)*.5+.25)/2*2-1)*5,z=((Math.floor(i/3))/2*2-1)*5;MOB_MODELS.ghast['t'+i]={p:[x,24,z],b:[[-1,0,-1,2,len,2,0,0]]};}
MOB_MODELS.crystal={core:{p:[0,0,0],b:[[-4,-4,-4,8,8,8,32,0]]},glass:{p:[0,0,0],b:[[-4,-4,-4,8,8,8,0,0]]},base:{p:[0,0,0],b:[[-6,0,-6,12,4,12,0,16]]}};
{const d0=drawMob;drawMob=function(e){const T=MOB_T[e.mob];
    if(e.mob==='blaze'){const MD=MOB_MODELS.blaze,a=perfT*20+(e.id.length*7);let f=a*Math.PI*-.1;for(let i=0;i<4;i++){MD['r'+i].p=[Math.cos(f)*9,-2+Math.cos((i*2+a)*.25),Math.sin(f)*9];f++;}
      f=Math.PI/4+a*Math.PI*.03;for(let i=4;i<8;i++){MD['r'+i].p=[Math.cos(f)*7,2+Math.cos((i*2+a)*.25),Math.sin(f)*7];f++;}f=.47123894+a*Math.PI*-.05;for(let i=8;i<12;i++){MD['r'+i].p=[Math.cos(f)*5,11+Math.cos((i*1.5+a)*.5),Math.sin(f)*5];f++;}
      if(Math.random()<.15&&e.deathT==null)spawnParticles(e.rpos?e.rpos[0]:e.pos[0],(e.rpos||e.pos)[1]+1,(e.rpos||e.pos)[2],1,[.4,.4,.4],.5,'poof');}
    if(e.mob==='ghast'){const MD=MOB_MODELS.ghast;for(let i=0;i<9;i++)MD['t'+i].r=[.2*Math.sin(perfT*2+i)+.4,0,0];}
    if(e.mob==='dragon'){drawDragon(e);return;}
    if(e.mob==='end_crystal'){drawCrystal(e);return;}
    return d0(e);};}
{const k0=mobTexKey;mobTexKey=function(e){if(e.mob==='ghast'&&e.shootFlash>0)return 'ghast_shooting';return k0(e);};}

// ---- AI ----
const FIREBALLS=[];   // {pos,vel,kind:'ghast'|'small'|'dragon',owner,age,vis}
{const u0=updateMob;updateMob=function(e,dt){const T=MOB_T[e.mob];
    if(e.mob==='end_crystal'){e.rpos=e.pos;return;}
    if(e.mob==='dragon'){dragonAI(e,dt);return;}
    if(e.mob==='ghast'){ghastAI(e,dt);return;}
    if(e.mob==='enderman')endermanAI(e,dt);
    if(T.hover&&e.target&&e.alive){const ty=e.target.pos[1]+1.5;if(e.pos[1]<ty)e.mot[1]=Math.max(e.mot[1],.08);else if(e.mot[1]<-.06)e.mot[1]=-.06;}
    u0(e,dt);
    if(e.mob==='blaze'&&e.alive&&e.target){const t=e.target;const d=dist(t.pos,e.pos);e.shootT-=dt;
      if(d<40&&d>2.5&&canSee(e,t)){if(e.shootT<=0){e.burst=3;e.shootT=4+Math.random()*2;e.burstT=0;}}
      if(e.burst>0){e.burstT-=dt;if(e.burstT<=0){e.burst--;e.burstT=.3;const o=[e.pos[0],e.pos[1]+1.2,e.pos[2]];const v=[t.pos[0]-o[0]+(Math.random()-.5)*d*.12,t.pos[1]+.9-o[1],t.pos[2]-o[2]+(Math.random()-.5)*d*.12];const L=Math.hypot(...v);
        fireballSpawn('small',o,v.map(q=>q/L*16),e);psnd(['mob/ghast/fireball4'],e.pos,.6)||(actx&&noiseHit(.25,700,1,.12,'lowpass'));}}}};}
function fireballSpawn(kind,pos,vel,owner,remote){FIREBALLS.push({kind,pos:pos.slice(),vel:vel.slice(),owner,age:0,vis:!!remote});if(!remote&&net)netSend(N.FB,{k:kind,p:pos.map(v=>+v.toFixed(2)),v:vel.map(v=>+v.toFixed(2)),dm:DIM});}
function fireballTick(dt){const auth=isHost()||dimLocal()||!net;
  for(const f of FIREBALLS){f.age+=dt;if(f.age>8){f.dead=true;continue;}
    // hitting a ghast's fireball sends it back
    if(f.kind==='ghast'&&player&&player.alive&&player.swing>.85&&dist(f.pos,eye(player))<3.2){const fw=fwd(player);f.vel=fw.map(v=>v*18);f.owner=player;f.vis=false;if(net)netSend(N.FB,{k:f.kind,p:f.pos,v:f.vel,dm:DIM,re:1});}
    const n=Math.ceil(Math.hypot(...f.vel)*dt/.3)+1;
    for(let i=0;i<n&&!f.dead;i++){for(let k=0;k<3;k++)f.pos[k]+=f.vel[k]*dt/n;const b=getB(Math.floor(f.pos[0]),Math.floor(f.pos[1]),Math.floor(f.pos[2]));let hitE=null;
      for(const e of hitList()){if(!e.alive||e===f.owner||e.bat||e.mob==='end_crystal'&&f.kind!=='dragon')continue;const bb=entBox(e,f.kind==='ghast'?.4:.2);if(f.pos[0]>bb[0][0]&&f.pos[0]<bb[1][0]&&f.pos[1]>bb[0][1]&&f.pos[1]<bb[1][1]&&f.pos[2]>bb[0][2]&&f.pos[2]<bb[1][2]){hitE=e;break;}}
      if(hitE||(b&&BD[b].solid)){f.dead=true;if(f.vis)break;fireballHit(f,hitE);}}
    if(Math.random()<.7)spawnParticles(f.pos[0],f.pos[1],f.pos[2],1,f.kind==='dragon'?[.6,.2,.8]:[.3,.3,.3],.3,f.kind==='dragon'?'magic':'poof');}
  for(let i=FIREBALLS.length-1;i>=0;i--)if(FIREBALLS[i].dead)FIREBALLS.splice(i,1);
  void auth;}
function fireballHit(f,e){const c=f.pos.slice();
  if(f.kind==='ghast'){if(e)damage(e,6,f.owner&&f.owner.alive?f.owner:null,'explosion');explode(c,1.2,f.owner);for(let i=0;i<4;i++){const x=Math.floor(c[0]+(Math.random()-.5)*3),z=Math.floor(c[2]+(Math.random()-.5)*3);for(let y=Math.floor(c[1])+1;y>=Math.floor(c[1])-2;y--)if(!getB(x,y,z)&&(BD[getB(x,y-1,z)]||{}).solid){lightFire(x,y,z);break;}}}
  else if(f.kind==='small'){if(e){damage(e,5,f.owner,'fire',null,false,[['ignite',5,0]]);}else{const x=Math.floor(c[0]-f.vel[0]*.02),y=Math.floor(c[1]-f.vel[1]*.02),z=Math.floor(c[2]-f.vel[2]*.02);if(!getB(x,y,z))lightFire(x,y,z);}spawnParticles(c[0],c[1],c[2],8,[1,.6,.1],1.5);}
  else if(f.kind==='dragon'){ACID.push({pos:[c[0],Math.floor(c[1])+.1,c[2]],t:6,r:3});spawnParticles(c[0],c[1],c[2],30,[.7,.2,.9],3,'magic');}}
const ACID=[];   // the dragon's breath lingers on the ground
function acidTick(dt){for(const a of ACID){a.t-=dt;if(Math.random()<.8)spawnParticles(a.pos[0]+(Math.random()-.5)*a.r*2,a.pos[1]+.2,a.pos[2]+(Math.random()-.5)*a.r*2,2,[.75,.25,.95],.6,'magic');
    a.hitT=(a.hitT||0)-dt;if(a.hitT<=0){a.hitT=.5;for(const e of hitList())if(e.alive&&e.mob!=='dragon'&&e.mob!=='end_crystal'&&hdist(e.pos,a.pos)<a.r&&Math.abs(e.pos[1]-a.pos[1])<2)damage(e,3,null,'magic',null,true);}}
  for(let i=ACID.length-1;i>=0;i--)if(ACID[i].t<=0)ACID.splice(i,1);}
function ghastAI(e,dt){tickEffects(e,dt);e.fire=0;if(!e.alive)return;const A=e.ai;A.t-=dt;e.shootFlash=Math.max(0,(e.shootFlash||0)-dt);
  if(A.t<=0){A.t=.5;const t=nearestPlayer(e,64);e.target=t&&canSee({pos:[e.pos[0],e.pos[1]+1,e.pos[2]],eh:2},t)?t:null;}
  if(!A.goal||dist(A.goal,e.pos)<2||A.wt<=0||!chunkReadyAt(A.goal[0],A.goal[2])){A.wt=6;let g=null;for(let k=0;k<6&&!g;k++){const c=[e.pos[0]+(Math.random()-.5)*32,clamp(e.pos[1]+(Math.random()-.5)*16,34,110),e.pos[2]+(Math.random()-.5)*32];if(!getB(Math.floor(c[0]),Math.floor(c[1]),Math.floor(c[2])))g=c;}A.goal=g||e.pos.slice();}
  A.wt-=dt;const d=[A.goal[0]-e.pos[0],A.goal[1]-e.pos[1],A.goal[2]-e.pos[2]];const L=Math.hypot(...d)||1;const sp=2.2;
  const np=[e.pos[0]+d[0]/L*sp*dt,e.pos[1]+d[1]/L*sp*dt,e.pos[2]+d[2]/L*sp*dt];let free=true;
  for(const [ox,oy,oz] of [[0,0,0],[1.6,1,0],[-1.6,1,0],[0,1,1.6],[0,1,-1.6],[0,3.5,0]]){const b=getB(Math.floor(np[0]+ox),Math.floor(np[1]+oy),Math.floor(np[2]+oz));if(b&&BD[b].solid)free=false;}
  if(free){e.vel=[d[0]/L*sp,d[1]/L*sp,d[2]/L*sp];e.pos=np;}else{A.goal=null;e.vel=[0,0,0];}
  e.rpos=e.pos;
  const t=e.target;if(t){const want=Math.atan2(-(t.pos[0]-e.pos[0]),-(t.pos[2]-e.pos[2]));e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dt*4);e.headYaw=e.bodyYaw;e.yaw=e.bodyYaw;
    e.shootT-=dt;if(e.shootT<=1&&!(e.warned)){e.warned=true;e.shootFlash=1.2;ghastSound(e,'warn');}
    if(e.shootT<=0){e.shootT=3+Math.random()*2;e.warned=false;const o=[e.pos[0]-Math.sin(e.bodyYaw)*2.4,e.pos[1]+2.4,e.pos[2]-Math.cos(e.bodyYaw)*2.4];const v=[t.pos[0]-o[0],t.pos[1]+1-o[1],t.pos[2]-o[2]];const L2=Math.hypot(...v);
      fireballSpawn('ghast',o,v.map(q=>q/L2*14),e);ghastSound(e,'shoot');}}
  else{if(e.vel[0]||e.vel[2]){const want=Math.atan2(-e.vel[0],-e.vel[2]);e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dt*2);}e.yaw=e.headYaw=e.bodyYaw;e.shootT=Math.max(e.shootT,2);}}
function endermanAI(e,dt){if(!e.alive)return;
  // looking one in the eyes makes it angry
  e.stareT=(e.stareT||0)-dt;if(e.stareT<=0){e.stareT=.25;for(const q of ents){if(q.kind!=='player'||!q.alive||q.gm==='creative'||e.angry>0)continue;const o=eye(q),f=fwd(q);const h=[e.pos[0]-o[0],e.pos[1]+2.6-o[1],e.pos[2]-o[2]];const L=Math.hypot(...h);if(L>40)continue;
      const dot=(h[0]*f[0]+h[1]*f[1]+h[2]*f[2])/L;if(dot>1-.025/Math.max(1,L/8)&&!raycastBlock(o,h.map(v=>v/L),L-.5)){e.angry=30;e.target=q;mobSndRaw(e,['mob/endermen/stare'])||ghastSound(e,'stare');teleportMob(e);break;}}}
  if(e.inWater||(WEATHER.rain>.5&&DIM==='overworld'&&(lightAt(Math.floor(e.pos[0]),Math.floor(e.pos[1]+2),Math.floor(e.pos[2]))>>4)>=15)){if(Math.random()<dt*2){hurt(e,1,null,'drown');teleportMob(e);}}
  if(e.angry>0&&e.target&&dist(e.target.pos,e.pos)>12&&Math.random()<dt*.15)teleportMob(e,e.target.pos);}
function teleportMob(e,near){const c=near||e.pos;for(let k=0;k<16;k++){const x=Math.floor(c[0]+(Math.random()-.5)*(near?8:32)),z=Math.floor(c[2]+(Math.random()-.5)*(near?8:32));if(!chunkReadyAt(x,z))continue;let y=Math.floor(c[1]+(Math.random()-.5)*16);
    for(let s=0;s<20&&y>1;s++,y--){if(floorOk(x,y,z)&&openAt(x,y+2,z)){spawnParticles(e.pos[0],e.pos[1]+1.4,e.pos[2],20,[.6,.2,.8],1.5,'magic');e.pos=[x+.5,y,z+.5];e.mot=[0,0,0];e.prev=null;spawnParticles(e.pos[0],e.pos[1]+1.4,e.pos[2],20,[.6,.2,.8],1.5,'magic');psnd(['mob/endermen/portal','portal/portal'],e.pos,.5,1.6);return true;}}}return false;}
{const h0=mobHurt;mobHurt=function(e,src,cause){h0(e,src,cause);if(!src||src===e)return;
    if(e.mob==='zombie_pigman'&&src.kind==='player'&&src.gm!=='creative'){for(const m of mobs)if(m.mob==='zombie_pigman'&&m.alive&&dist(m.pos,e.pos)<32){m.angry=40;m.target=src;}}
    if(e.mob==='enderman'&&cause==='shot'){teleportMob(e);}};}
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,inv){if(e&&e.mob==='enderman'&&cause==='shot'){teleportMob(e);return false;}
    if(e&&e.mob==='blaze'&&cause==='snowball')amt=3;
    if(e&&e.mob==='dragon'){if(DRAGON.phase!=='perch'&&cause!=='explosion')amt=amt*.6+.5;kb=null;}
    if(e&&e.mob==='end_crystal'){if(!e.alive)return false;e.health=0;kill(e,src,cause);return true;}
    return h0(e,amt,src,cause,kb,raw,inv);};}
function ghastSound(e,k){if(!actx||!camPos)return;const d=dist(e.pos,camPos);if(d>64)return;const v=Math.max(.05,1-d/64);
  if(k==='warn'){tone('sine',420,260,.9,.12*v);tone('triangle',300,180,1.1,.06*v);}else if(k==='shoot'){noiseHit(.4,500,1,.3*v,'lowpass');}else if(k==='moan'){tone('sine',380+Math.random()*120,200,1.6,.07*v);tone('sine',250,150,1.8,.04*v);}
  else if(k==='stare'){tone('sawtooth',90,60,1.2,.08*v);tone('sine',140,70,1.4,.06*v);}else if(k==='death'){tone('sine',600,90,1.4,.12*v);}}
{const s0=mobSnd;mobSnd=function(e,kind){if(!actx||!camPos)return;const m=e.mob;
    if(m==='ghast'){ghastSound(e,kind==='say'?'moan':kind==='death'?'death':'moan');return;}
    if(m==='blaze'){const d=dist(e.pos,camPos);if(d>20)return;const v=1-d/20;if(kind==='say')noiseHit(1.2,400,.6,.12*v,'lowpass');else if(kind==='hurt')noiseHit(.3,900,2,.2*v);else noiseHit(1,300,1,.25*v,'lowpass');return;}
    if(m==='enderman'){const d=dist(e.pos,camPos);if(d>20)return;const v=1-d/20;if(kind==='say'){tone('sine',180+Math.random()*80,120,.8,.05*v);tone('triangle',90,140,.7,.03*v);}else tone('sawtooth',220,80,.4,.07*v);return;}
    if(m==='zombie_pigman'){const d=dist(e.pos,camPos);if(d>16)return;const v=1-d/16;const g=packGroup(['mob/pig/say']);if(g&&kind!=='death'){playBytes(g[0],.6*v,.6);return;}tone('sawtooth',140,80,.5,.06*v);return;}
    if(m==='wither_skeleton'){s0(Object.assign({},e,{mob:'skeleton'}),kind);return;}
    if(m==='dragon'){dragonSound(kind);return;}
    if(m==='end_crystal')return;
    return s0(e,kind);};}

// ---- spawning in the Nether and the End; spawners ----
{const s0=mobSpawnTick;mobSpawnTick=function(dt){if(DIM==='nether')return netherSpawn(dt);if(DIM==='end')return endSpawn(dt);return s0(dt);};}
let dimSpawnT=1;
function netherSpawn(dt){dimSpawnT-=dt;spawnerTick(dt);if(dimSpawnT>0)return;dimSpawnT=1;if(mobs.length>=34||sDiff()===0)return;
  const players=ents.filter(e=>e.kind==='player'&&e.alive&&!e.spectator);if(!players.length)return;const p=players[Math.random()*players.length|0];
  for(let tries=0;tries<4;tries++){const a=Math.random()*6.283,r=16+Math.random()*30;const x=Math.floor(p.pos[0]+Math.cos(a)*r),z=Math.floor(p.pos[2]+Math.sin(a)*r);if(!chunkReadyAt(x,z))continue;
    if(players.some(q=>hdist(q.pos,[x,0,z])<14))continue;let y=Math.floor(clamp(p.pos[1]+(Math.random()-.5)*40,33,118));
    const fort=inFortress(x,y,z)||inFortress(x,y+4,z);
    if(!fort&&Math.random()<.12){// ghasts in big open caverns
      if(mobs.filter(m=>m.mob==='ghast').length<4){let open=true;for(let dy=0;dy<5&&open;dy++)for(const [dx,dz] of [[0,0],[2,2],[-2,-2],[2,-2],[-2,2]])if(getB(x+dx,y+dy,z+dz))open=false;if(open){spawnMob('ghast',[x+.5,y,z+.5]);break;}}continue;}
    let ok=false;for(let s=0;s<20&&y>2;s++,y--){if(floorOk(x,y,z)){ok=true;break;}}if(!ok)continue;const below=getB(x,y-1,z);if(below===B.NETHER_WART)continue;
    let type;if(fort||inFortress(x,y,z)){type=Math.random()<.55?'wither_skeleton':Math.random()<.5?'blaze':'zombie_pigman';}else{const r=Math.random();type=r<.7?'zombie_pigman':'magma';}
    if(type==='zombie_pigman'){const n=1+(Math.random()*3|0);for(let i=0;i<n;i++){const xx=x+(i?(Math.random()*3|0)-1:0),zz=z+(i?(Math.random()*3|0)-1:0);if(floorOk(xx,y,zz))spawnMob('zombie_pigman',[xx+.5,y,zz+.5]);}}
    else{if(MOB_T[type].hw>.5&&!(openAt(x+1,y,z)&&openAt(x,y,z+1)))continue;spawnMob(type,[x+.5,y,z+.5]);}break;}}
function spawnerTick(dt){for(const [k,type] of SPAWNERS){const i0=k.indexOf(':');if(k.slice(0,i0)!==DIM)continue;const [x,y,z]=k.slice(i0+1).split(',').map(Number);
    if(getB(x,y,z)!==B.SPAWNER){continue;}const near=ents.some(e=>e.kind==='player'&&e.alive&&dist(e.pos,[x,y,z])<16);if(!near)continue;
    const st=SPAWNER_T.get(k)||{t:2+Math.random()*4};SPAWNER_T.set(k,st);st.t-=dt;if(Math.random()<.3)spawnParticles(x+.5,y+.5,z+.5,1,[1,.4,.1],.5);if(st.t>0)continue;st.t=10+Math.random()*20;
    if(mobs.filter(m=>m.mob===type&&dist(m.pos,[x,y,z])<9).length>=6)continue;const n=1+(Math.random()*3|0);
    for(let i=0;i<n;i++)for(let k2=0;k2<6;k2++){const X=x+((Math.random()*9|0)-4),Z=z+((Math.random()*9|0)-4),Y=y+((Math.random()*3|0)-1);if(openAt(X,Y,Z)&&openAt(X,Y+1,Z)){spawnMob(type,[X+.5,Y,Z+.5]);spawnParticles(X+.5,Y+1,Z+.5,10,[1,.5,.1],1.5,'poof');break;}}}}
const SPAWNER_T=new Map();
function endSpawn(dt){dimSpawnT-=dt;if(dimSpawnT>0)return;dimSpawnT=1.5;if(sDiff()===0)return;const n=mobs.filter(m=>m.mob==='enderman').length;if(n>=14)return;
  const players=ents.filter(e=>e.kind==='player'&&e.alive&&!e.spectator);if(!players.length)return;const p=players[Math.random()*players.length|0];
  const a=Math.random()*6.283,r=20+Math.random()*30;const x=Math.floor(p.pos[0]+Math.cos(a)*r),z=Math.floor(p.pos[2]+Math.sin(a)*r);if(!chunkReadyAt(x,z))return;const y=surfY(x,z)+1;if(y<10||!floorOk(x,y,z)||!openAt(x,y+2,z))return;spawnMob('enderman',[x+.5,y,z+.5]);}
// keep the dragon and its crystals from despawning
{const d0=mobDespawn;mobDespawn=function(dt){const keep=mobs.filter(m=>m.mob==='dragon'||m.mob==='end_crystal');mobs=mobs.filter(m=>m.mob!=='dragon'&&m.mob!=='end_crystal');d0(dt);mobs=keep.concat(mobs);};}
// experience from creatures, and what dies in the End
{const m0=mobDie;mobDie=function(e,src,cause){const was=e.alive;m0(e,src,cause);if(!was)return;const T=MOB_T[e.mob];
    if(T.xp&&src===player&&!e.baby)xpDrop(e.pos,T.xp+(Math.random()*3|0));
    if(e.mob==='end_crystal')crystalDie(e,src);
    if(e.mob==='dragon')dragonDie(e);};}

// ---- the End fight ----
const DRAGON={phase:'circle',a:0,t:8,target:null,tp:null,breathT:0,healT:0,hitT:0,beam:null,flap:0};
let DRAGON_DEATH=null;
function dragonAuth(){return !net||isHost()||dimLocal();}
function dragonEnsure(){if(DIM!=='end'||!dragonAuth())return;
  const pil=endPillars();pil.forEach((p,i)=>{if(DRAGON_STATE.crystals&(1<<i))return;if(mobs.some(m=>m.mob==='end_crystal'&&m.pil===i))return;const c=spawnMob('end_crystal',[p.x+.5,p.h+2,p.z+.5],{id:'ec'+i});c.pil=i;});
  if(!DRAGON_STATE.killed&&!mobs.some(m=>m.mob==='dragon')){const d=spawnMob('dragon',[0,90,-30],{id:'dragon'});d.bodyYaw=0;DRAGON.phase='circle';DRAGON.t=6;DRAGON.a=0;}}
function crystalDie(e,src){removeMob(e);if(e.pil!=null)DRAGON_STATE.crystals|=1<<e.pil;else{const i=+String(e.id).slice(2);if(i>=0)DRAGON_STATE.crystals|=1<<i;}
  if(dragonAuth()){explode([e.pos[0],e.pos[1],e.pos[2]],5,src);const d=mobs.find(m=>m.mob==='dragon'&&m.alive);if(d&&DRAGON.beam===e){damage(d,10,src&&src.kind==='player'?src:null,'explosion',null,true);DRAGON.beam=null;}
    if(net)netSend(N.DGN,{s:DRAGON_STATE});}}
function dragonNet(d){if(d.s){const was=DRAGON_STATE.killed;Object.assign(DRAGON_STATE,d.s);if(!was&&DRAGON_STATE.killed&&DIM==='end'&&!DRAGON_DEATH){chatMsg('The Ender Dragon has been defeated!','#e0a0ff',false);}}}
function dragonSound(kind){if(!actx)return;const d=camPos?Math.min(1,48/Math.max(8,DRAGON.camD||40)):1;if(kind==='say'){tone('sawtooth',70,40,2.2,.14*d);tone('square',110,55,1.8,.05*d);noiseHit(1.6,250,.7,.2*d,'lowpass');}
  else if(kind==='hurt'){tone('sawtooth',160,70,.6,.15*d);noiseHit(.5,600,1,.2*d);}else if(kind==='flap'){noiseHit(.5,180,.8,.25*d,'lowpass');}else{tone('sawtooth',90,30,4,.2);noiseHit(4,200,.5,.3,'lowpass');}}
function dragonAI(e,dt){const D=DRAGON;if(!e.alive)return;e.rpos=e.pos;const py=endPortalY();
  const players=ents.filter(q=>q.kind==='player'&&q.alive&&!q.spectator&&q.gm!=='creative');
  // healing from the nearest crystal
  D.healT-=dt;if(D.healT<=0){D.healT=.5;let best=null,bd=32;for(const c of mobs)if(c.mob==='end_crystal'&&c.alive){const dd=dist(c.pos,e.pos);if(dd<bd){bd=dd;best=c;}}D.beam=best;if(best&&e.health<e.maxHp)e.health=Math.min(e.maxHp,e.health+1);}
  D.t-=dt;
  const pick=()=>{const left=mobs.filter(m=>m.mob==='end_crystal'&&m.alive).length;const r=Math.random();const perchCh=.12+(10-left)*.05;
    if(r<perchCh){D.phase='toperch';D.t=30;}else if(r<perchCh+.35&&players.length){D.phase='strafe';D.target=players[Math.random()*players.length|0];D.t=12;D.shot=false;}
    else if(r<perchCh+.6&&players.length){D.phase='charge';D.target=players[Math.random()*players.length|0];D.t=8;}else{D.phase='circle';D.t=8+Math.random()*8;}};
  let tp;let sp=16;
  if(D.phase==='circle'){D.a+=dt*.22;tp=[Math.cos(D.a)*58,78+Math.sin(D.a*2.3)*8,Math.sin(D.a)*58];if(D.t<=0)pick();}
  else if(D.phase==='strafe'){const t=D.target;if(!t||!t.alive){D.phase='circle';D.t=4;tp=e.pos;}else{tp=[t.pos[0],t.pos[1]+14,t.pos[2]];const d=dist(tp,e.pos);
      if(d<40&&!D.shot&&canSee({pos:e.pos,eh:2},t)){D.shot=true;const o=dragonHead(e);const v=[t.pos[0]-o[0],t.pos[1]-o[1],t.pos[2]-o[2]];const L=Math.hypot(...v);fireballSpawn('dragon',o,v.map(q=>q/L*12),e);dragonSound('say');}
      if(D.shot&&d<14||D.t<=0){D.phase='circle';D.t=6+Math.random()*6;}}}
  else if(D.phase==='charge'){const t=D.target;if(!t||!t.alive||D.t<=0){D.phase='circle';D.t=6;tp=e.pos;}else{tp=[t.pos[0],t.pos[1]+1,t.pos[2]];sp=20;if(dist(tp,e.pos)<4){D.phase='circle';D.t=8;}}}
  else if(D.phase==='toperch'){tp=[0,py+6,0];sp=12;if(dist(tp,e.pos)<3){D.phase='perch';D.t=12+Math.random()*6;D.breathT=2;dragonSound('say');}if(D.t<=0){D.phase='circle';D.t=5;}}
  else if(D.phase==='perch'){tp=[0,py+5.2,0];sp=4;D.breathT-=dt;
    const t=players.filter(q=>dist(q.pos,[0,py,0])<24).sort((a,b)=>dist(a.pos,e.pos)-dist(b.pos,e.pos))[0];
    if(t){const want=Math.atan2(-(t.pos[0]-e.pos[0]),-(t.pos[2]-e.pos[2]));e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dt*1.5);}
    if(D.breathT<=0&&t){D.breathT=4+Math.random()*2;const o=dragonHead(e);const f=[-Math.sin(e.bodyYaw),0,-Math.cos(e.bodyYaw)];for(let i=1;i<=6;i++)ACID.push({pos:[o[0]+f[0]*i*1.6,py+.1,o[2]+f[2]*i*1.6],t:3,r:1.6});dragonSound('say');}
    if(D.t<=0){D.phase='circle';D.t=8;e.pos[1]+=1;}}
  if(!tp)tp=e.pos;
  // fly: turn toward the point and move along the body's facing
  const d=[tp[0]-e.pos[0],tp[1]-e.pos[1],tp[2]-e.pos[2]];const L=Math.hypot(...d)||1;
  if(D.phase!=='perch'){const want=Math.atan2(-d[0],-d[2]);e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dt*(D.phase==='charge'?2.2:1.3));
    const fw=[-Math.sin(e.bodyYaw),0,-Math.cos(e.bodyYaw)];const vy=clamp(d[1]/Math.max(4,L)*sp,-10,10);const s=Math.min(sp,L*2);e.vel=[fw[0]*s,vy,fw[2]*s];}
  else e.vel=[d[0]/L*Math.min(sp,L*3),d[1]/L*Math.min(sp,L*3),d[2]/L*Math.min(sp,L*3)];
  for(let k=0;k<3;k++)e.pos[k]+=e.vel[k]*dt;e.pitch=clamp(-e.vel[1]/20,-.5,.5);e.headYaw=e.bodyYaw;e.yaw=e.bodyYaw;
  // wings and body knock players aside
  D.hitT-=dt;if(D.hitT<=0){D.hitT=.5;for(const q of players){const dd=dist(q.pos,[e.pos[0],e.pos[1]-1,e.pos[2]]);if(dd<5.5){damage(q,D.phase==='charge'?10:5,e,'melee',[q.pos[0]-e.pos[0],q.pos[2]-e.pos[2],2.5,0,0]);if(D.phase==='charge'){D.phase='circle';D.t=6;}}}}
  e.sayT-=dt;if(e.sayT<=0){e.sayT=6+Math.random()*8;dragonSound('say');}
  D.flapT=(D.flapT||0)-dt;if(D.flapT<=0&&D.phase!=='perch'){D.flapT=1.1;dragonSound('flap');}}
function dragonHead(e){const f=[-Math.sin(e.bodyYaw),0,-Math.cos(e.bodyYaw)];return [e.pos[0]+f[0]*8,e.pos[1]+1,e.pos[2]+f[2]*8];}
function dragonDie(e){removeMob(e);DRAGON_DEATH={pos:e.pos.slice(),yaw:e.bodyYaw||0,t:0,auth:dragonAuth()};dragonSound('death');}
function dragonDeathTick(dt){const D=DRAGON_DEATH;if(!D)return;D.t+=dt;D.pos[1]+=dt*1.2;if(Math.random()<.9)spawnParticles(D.pos[0]+(Math.random()-.5)*8,D.pos[1]+(Math.random()-.5)*4,D.pos[2]+(Math.random()-.5)*8,6,[1,1,1],3,'poof');
  if(Math.random()<dt*3)boomFx([D.pos[0]+(Math.random()-.5)*6,D.pos[1],D.pos[2]+(Math.random()-.5)*6],1);
  if(D.t>=8){DRAGON_DEATH=null;const py=endPortalY();if(D.auth){const list=[];for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const d=Math.hypot(dx,dz);if(d<=2.5&&(dx||dz))list.push(dx,py,dz,B.END_PORTAL);}
      if(!DRAGON_STATE.egg){list.push(0,py+5,0,B.DRAGON_EGG);DRAGON_STATE.egg=true;}applyBlockList(list,false);if(net)netSend(N.BOOM,{l:list});
      DRAGON_STATE.killed=true;if(net)netSend(N.DGN,{s:DRAGON_STATE});if(isHost()||!net)saveWorld();}
    chatMsg('The Ender Dragon has been defeated! The exit portal is open.','#e0a0ff',false);announce('Free the End','The exit portal is open',5,false);
    if(player&&dist(player.pos,[0,py,0])<160)xpDrop([player.pos[0],player.pos[1]+1,player.pos[2]],600,true);}}
// ---- dragon and crystal drawing ----
let DRAGON_TEX=null,DRAGON_EYES_TEX=null,dragonMeshes=null,CRYSTAL_BEAM_T=0;
function dmesh(boxes){const o=[];for(const [x,y,z,w,h,d,u,v,mir] of boxes)boxUV(o,-(x+w),-(y+h),z,w,h,d,u,v,256,256,0,!!mir);return meshFrom(o);}
function initDragonMeshes(){dragonMeshes={
  head:dmesh([[-6,-1,-24,12,5,16,176,44],[-8,-8,-10,16,16,16,112,30],[-5,-12,-4,2,4,6,0,0],[3,-12,-4,2,4,6,0,0,1],[-5,-3,-22,2,2,4,112,0],[3,-3,-22,2,2,4,112,0,1]]),
  jaw:dmesh([[-6,0,-16,12,4,16,176,65]]),
  neck:dmesh([[-5,-5,-5,10,10,10,192,104],[-1,-9,-3,2,4,6,48,0]]),
  body:dmesh([[-12,0,-16,24,24,64,0,0],[-1,-6,-10,2,6,12,220,53],[-1,-6,10,2,6,12,220,53],[-1,-6,30,2,6,12,220,53]]),
  wing:dmesh([[-56,-4,-4,56,8,8,112,88],[-56,0,2,56,0,56,-56,88]]),wingtip:dmesh([[-56,-2,-2,56,4,4,112,136],[-56,0,2,56,0,56,-56,144]]),
  fleg:dmesh([[-4,-4,-4,8,24,8,112,104]]),flegtip:dmesh([[-3,-1,-3,6,24,6,226,138]]),ffoot:dmesh([[-4,0,-12,8,4,16,144,104]]),
  rleg:dmesh([[-8,-4,-8,16,32,16,0,0]]),rlegtip:dmesh([[-6,-2,0,12,32,12,196,0]]),rfoot:dmesh([[-9,0,-20,18,6,24,112,0]])};}
function drawDragon(e){if(!PACK.dragon&&!DRAGON_TEX){DRAGON_TEX=mkTex(procDragonTex());}if(!DRAGON_TEX&&PACK.dragon)DRAGON_TEX=mkTex(PACK.dragon);if(!DRAGON_EYES_TEX&&PACK.dragonEyes)DRAGON_EYES_TEX=mkTex(PACK.dragonEyes);if(!dragonMeshes)initDragonMeshes();
  const M=dragonMeshes,rp=e.rpos||e.pos;DRAGON.camD=dist(rp,camPos);const fl=perfT*2.2;const flap=Math.sin(fl)*.55;
  const P=(x,y,z)=>M4.tr(-x/16,-y/16,z/16),RX=a=>M4.rx(-a),RY=a=>M4.ry(-a),RZ=a=>M4.rz(a);
  const base=chain(M4.tr(rp[0],rp[1]+1.4,rp[2]),M4.ry(e.bodyYaw||0),M4.rx(-(e.pitch||0)));
  gl.uniform1f(PT.u.bright,Math.max(.7,mobBright(e)));gl.uniform1f(PT.u.hurt,e.hurtT>0?1:0);const T=DRAGON_TEX;
  drawMesh(M.body,chain(base,P(0,4,8)),T);
  let m=chain(base,P(0,10,-8));for(let i=0;i<5;i++){m=chain(m,RX(Math.sin(fl*.5+i*.6)*.05+(i<2?-.12:.06)),P(0,0,-10));drawMesh(M.neck,m,T);}
  const hm=chain(m,P(0,0,-6),RX(.05));drawMesh(M.head,hm,T);drawMesh(M.jaw,chain(hm,P(0,4,-8),RX(DRAGON.phase==='perch'?.35+Math.sin(perfT*3)*.15:.06)),T);
  if(DRAGON_EYES_TEX){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.uniform1f(PT.u.bright,1.2);drawMesh(M.head,hm,DRAGON_EYES_TEX);gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(PT.u.bright,Math.max(.7,mobBright(e)));}
  m=chain(base,P(0,10,52));for(let i=0;i<12;i++){m=chain(m,RY(Math.sin(fl*.4+i*.5)*.07),RX(.03),P(0,0,10));drawMesh(M.neck,m,T);}
  for(const s of [1,-1]){const w=chain(base,M4.sc(s,1,1),P(-12,5,2),RZ(flap-.1),RY(.08));drawMesh(M.wing,w,T);drawMesh(M.wingtip,chain(w,P(-56,0,0),RZ(-flap*1.3+.25)),T);}
  const tuck=DRAGON.phase==='perch'?0:1;for(const s of [1,-1]){const sm=chain(base,M4.sc(s,1,1));const fl2=chain(sm,P(-12,20,2),RX(1.3*tuck));drawMesh(M.fleg,fl2,T);const ft=chain(fl2,P(0,20,-1),RX(-.5*tuck));drawMesh(M.flegtip,ft,T);drawMesh(M.ffoot,chain(ft,P(0,23,0),RX(.75*tuck)),T);
    const rl=chain(sm,P(-16,16,42),RX(1*tuck));drawMesh(M.rleg,rl,T);const rt=chain(rl,P(0,32,-4),RX(.5*tuck));drawMesh(M.rlegtip,rt,T);drawMesh(M.rfoot,chain(rt,P(0,31,4),RX(.75*tuck)),T);}
  gl.uniform1f(PT.u.hurt,0);
  const c=DRAGON.beam&&DRAGON.beam.alive&&mobs.includes(DRAGON.beam)?DRAGON.beam:(!dragonAuth()?mobs.find(q=>q.mob==='end_crystal'&&q.alive&&dist(q.pos,rp)<32):null);
  if(c&&e.alive!==false&&e.hurtT!==1){useBox(VP,camPos);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.uniform1f(PB.u.lit,0);const a=[c.pos[0],c.pos[1]+1.6,c.pos[2]],b=[rp[0],rp[1]+1,rp[2]];const v=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const L=Math.hypot(...v);
    for(let i=0;i<L;i+=.8){const t=i/L;box(chain(M4.tr(a[0]+v[0]*t,a[1]+v[1]*t,a[2]+v[2]*t),M4.sc(.18,.18,.18)),[1,.55,1],.45);}gl.disable(gl.BLEND);gl.uniform1f(PB.u.lit,1);useTex(VP,camPos);}}
function procDragonTex(){const c=mkCanvas(256,256),g=c.getContext('2d');g.fillStyle='#1a1a1e';g.fillRect(0,0,256,256);for(let i=0;i<1500;i++){g.fillStyle=Math.random()<.5?'#26262c':'#121216';g.fillRect(Math.random()*256|0,Math.random()*256|0,2,2);}g.fillStyle='#b040e0';g.fillRect(112+16,30+16,4,2);g.fillRect(112+26,30+16,4,2);return c;}
let crystalMeshes=null;
function drawCrystal(e){const TX=MOB_TEX.end_crystal;if(!TX)return;if(!crystalMeshes){const mk=b=>{const o=[];for(const [x,y,z,w,h,d,u,v] of b)boxUV(o,-(x+w),-(y+h),z,w,h,d,u,v,64,TX.h,0,false);return meshFrom(o);};const M=MOB_MODELS.crystal;crystalMeshes={core:mk(M.core.b),glass:mk(M.glass.b),base:mk(M.base.b)};}
  const rp=e.rpos||e.pos,t=perfT*3+(e.pil||0);const bob=Math.sin(t*.6)*.2;gl.uniform1f(PT.u.bright,1.3);gl.uniform1f(PT.u.hurt,0);
  drawMesh(crystalMeshes.base,chain(M4.tr(rp[0],rp[1]-.02,rp[2]),M4.sc(2,2,2)),TX.tex);
  const c=chain(M4.tr(rp[0],rp[1]+1.2+bob,rp[2]),M4.sc(2,2,2));const k=Math.PI/4;
  const r1=chain(c,M4.ry(t*.4),M4.rx(k),M4.rz(.6155));drawMesh(crystalMeshes.glass,r1,TX.tex);
  const r2=chain(r1,M4.sc(.875,.875,.875),M4.ry(t*.4),M4.rx(k),M4.rz(.6155));drawMesh(crystalMeshes.glass,r2,TX.tex);
  drawMesh(crystalMeshes.core,chain(r2,M4.sc(.875,.875,.875),M4.ry(t*.4),M4.rx(k),M4.rz(.6155)),TX.tex);}
// fireballs and the dying dragon are drawn with the creatures
{const d0=drawMobs;drawMobs=function(fogF){d0(fogF);if(!INF)return;
    if(FIREBALLS.length||EYES.length||XPORBS.length||DRAGON_DEATH){useTex(VP,camPos);gl.uniform1f(PT.u.hurt,0);gl.uniform4f(PT.u.tint,1,1,1,1);
      for(const f of FIREBALLS){const hm=heldMesh(f.kind==='dragon'?'ender_eye':'blaze_powder');const s=f.kind==='ghast'?1:f.kind==='dragon'?.9:.45;gl.uniform1f(PT.u.bright,1.6);
        if(f.kind==='dragon')gl.uniform4f(PT.u.tint,.8,.3,1,1);drawMesh(hm.mesh,chain(M4.tr(f.pos[0],f.pos[1],f.pos[2]),M4.ry(perfT*6),M4.sc(s,s,s)),hm.tex);gl.uniform4f(PT.u.tint,1,1,1,1);}
      for(const e of EYES){const hm=heldMesh('ender_eye');gl.uniform1f(PT.u.bright,1.4);drawMesh(hm.mesh,chain(M4.tr(e.pos[0],e.pos[1],e.pos[2]),M4.ry(perfT*3),M4.sc(.45,.45,.45)),hm.tex);}
      drawXPOrbs();
      if(DRAGON_DEATH){const D=DRAGON_DEATH;drawDragon({pos:D.pos,rpos:D.pos,bodyYaw:D.yaw,pitch:0,hurtT:1});useBox(VP,camPos);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.uniform1f(PB.u.lit,0);
        for(let i=0;i<Math.min(24,D.t*4);i++){const a=hash2(i,1,9)*6.283+D.t*.4,b=hash2(i,2,9)*3-1.5;const len=6+D.t*4;box(chain(M4.tr(D.pos[0],D.pos[1]+1,D.pos[2]),M4.ry(a),M4.rx(b),M4.tr(0,0,len/2),M4.sc(.5+D.t*.08,.08,len)),[1,.85,1],.35);}
        gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(PB.u.lit,1);}}};}
{const m0=mobsUpdate;mobsUpdate=function(dt){m0(dt);if(!INF||MATCH.mode!=='survival')return;fireballTick(dt);acidTick(dt);dragonDeathTick(dt);
    if(DIM==='end'&&dragonAuth()&&!SURV.loading){DRAGON.ensureT=(DRAGON.ensureT||0)-dt;if(DRAGON.ensureT<=0){DRAGON.ensureT=3;dragonEnsure();}}};}
Object.assign(N,{FB:64});
{const o0=onNetEvent;onNetEvent=function(code,d,from){if(code===N.FB&&d&&MATCH.mode==='survival'){if((d.dm||'overworld')!==DIM)return;if(d.re){const f=FIREBALLS.find(q=>q.kind===d.k&&dist(q.pos,d.p)<4);if(f){f.vel=d.v;f.vis=!(isHost()||dimLocal());return;}}
      fireballSpawn(d.k,d.p,d.v,null,true);return;}return o0(code,d,from);};}
// boss bar
function drawBossBar(){if(DIM!=='end')return;const d=mobs.find(m=>m.mob==='dragon');if(!d||!d.alive)return;const w=Math.min(420,W*.6),x=(W-w)/2,y=22;
  hc.save();txt('Ender Dragon',W/2,y-6,16,'#ffffff','center');hc.fillStyle='rgba(40,0,40,.8)';hc.fillRect(x,y,w,8);hc.fillStyle='#e040e0';hc.fillRect(x,y,w*Math.max(0,d.health/d.maxHp),8);hc.strokeStyle='#000';hc.lineWidth=1;hc.strokeRect(x+.5,y+.5,w-1,7);
  for(let i=1;i<20;i++){hc.fillStyle='rgba(0,0,0,.35)';hc.fillRect(x+w*i/20,y,1,8);}hc.restore();}
