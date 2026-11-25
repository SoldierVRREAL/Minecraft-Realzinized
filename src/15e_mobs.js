// ================= Mobs: animals and monsters for Survival =================
// Mobs are Ent objects (kind 'mob') kept in their own list, so melee, arrows, potions, fire and knockback all work on them.
// The host runs their AI and physics and sends them to everyone else ~10 times a second; other players just draw them.
let mobSeq=1,mobSpawnT=2,mobSendT=0,primed=[];
const MOB_T={
  pig:{name:'Pig',hp:10,hw:.45,eh:.9,model:'pig',kind:'passive',spd:.4,flee:1.1,drops:[['raw_porkchop',1,3]],snd:'pig',col:'#f0a0a0'},
  cow:{name:'Cow',hp:10,hw:.45,eh:1.4,model:'cow',kind:'passive',spd:.38,flee:1.1,drops:[['raw_beef',1,3],['leather',0,2]],snd:'cow',col:'#5a4030'},
  sheep:{name:'Sheep',hp:8,hw:.45,eh:1.3,model:'sheep',kind:'passive',spd:.4,flee:1.1,drops:[['raw_mutton',1,2]],snd:'sheep',col:'#e8e8e8'},
  chicken:{name:'Chicken',hp:4,hw:.2,eh:.7,model:'chicken',kind:'passive',spd:.4,flee:1.1,drops:[['raw_chicken',1,1],['feather',0,2]],snd:'chicken',col:'#f0f0f0',slowFall:true},
  deer:{name:'Deer',hp:12,hw:.45,eh:1.5,model:'deer',kind:'passive',spd:.45,flee:1.6,shy:10,drops:[['raw_venison',1,3],['leather',0,2]],snd:'cow',pitch:1.5,col:'#8a5a32'},
  glowshroom:{name:'Glowshroom',hp:10,hw:.45,eh:1.4,model:'cow',kind:'passive',spd:.35,flee:1,drops:[['glow_spores',1,2],['raw_beef',0,2]],snd:'cow',pitch:.8,glow:.75,col:'#3a7ae0'},
  zombie:{name:'Zombie',hp:20,hw:.3,eh:1.95,model:'zombie',kind:'hostile',spd:.7,dmg:3,burn:true,drops:[['rotten_flesh',0,2]],rare:[['carrot',.03],['baked_potato',.03],['iron_ingot',.02]],col:'#4a8a4a'},
  skeleton:{name:'Skeleton',hp:20,hw:.3,eh:1.99,model:'skeleton',kind:'hostile',spd:.75,ranged:true,burn:true,drops:[['bone',0,2],['arrow',0,2]],col:'#c8c8c8'},
  spider:{name:'Spider',hp:16,hw:.7,eh:.9,model:'spider',kind:'hostile',spd:1,dmg:2,climb:true,dayNeutral:true,drops:[['string',0,2],['spider_eye',0,1]],col:'#3a3028'},
  creeper:{name:'Creeper',hp:20,hw:.3,eh:1.7,model:'creeper',kind:'hostile',spd:.65,explode:true,drops:[['gunpowder',0,2]],col:'#4ab040'},
  crystal_spider:{name:'Crystal Spider',hp:18,hw:.7,eh:.9,model:'spider',kind:'hostile',spd:1.05,dmg:3,climb:true,hitFx:[['slowness',3,0]],glow:.55,drops:[['crystal_silk',1,2],['crystal_shard',0,1]],col:'#3f8cf0'},
  ice_wolf:{name:'Ice Wolf',hp:16,hw:.3,eh:.85,model:'wolf',kind:'neutral',spd:.55,chase:1.1,dmg:4,hitFx:[['slowness',3,0]],tame:'bone',drops:[['frost_fang',0,2]],snd:'wolf',col:'#c8e0f8'},
  magma:{name:'Magma Creature',hp:16,hw:.5,eh:1,model:'cube',kind:'hostile',spd:.9,dmg:4,hop:true,fireproof:true,hitFx:[['ignite',3,0]],glow:.65,drops:[['magma_cream',0,2]],snd:'slime',col:'#c8460c',scale:2}};
const MOB_TYPES=Object.keys(MOB_T);
const sDiff=()=>OPT.sdiff==null?2:OPT.sdiff,diffMul=()=>[0,.5,1,1.5][sDiff()];   // Options > Survival Difficulty (the host's setting counts)
const PASSIVE_BY={plains:['pig','cow','sheep','chicken'],forest:['pig','cow','sheep','chicken'],sakura:['deer','deer','pig','sheep','chicken'],crystal:['deer','chicken','sheep'],
  redwood:['deer','deer','cow','pig'],mushroom:['glowshroom'],frozen:['ice_wolf','sheep','deer'],ashen:[],ocean:[]};
const HOSTILE_BASE=['zombie','zombie','skeleton','skeleton','spider','creeper','creeper'];
const HOSTILE_BY={crystal:['crystal_spider','crystal_spider'],ashen:['magma','magma'],frozen:['ice_wolf']};
const COOKED={raw_beef:'cooked_beef',raw_porkchop:'cooked_porkchop',raw_chicken:'cooked_chicken',raw_mutton:'cooked_mutton',raw_venison:'cooked_venison'};
// sheep colours: 0 = white, 1.. = MB_WOOLS order
const WOOL_IDS=['b71'].concat(MB_WOOLS.map(w=>'b'+B['WOOL_'+w[0].toUpperCase()]));
const WOOL_TINT=['#ffffff'].concat(MB_WOOLS.map(w=>w[2]));
const DYE_WOOL={red:-1,orange:1,magenta:2,light_blue:3,yellow:4,lime:5,pink:6,gray:7,light_gray:8,cyan:9,purple:10,blue:11,brown:12,green:13,black:14};
WOOL_IDS[-1]='b12';
function sheepColor(){const r=Math.random();return r<.818?0:r<.868?8:r<.918?7:r<.968?14:r<.998?12:6;}
ITEMS.egg.egg=true;ITEMS.egg.type='splash';ITEMS.egg.fx=[];

// ---------------- models (vanilla 1.8 geometry: boxes [x,y,z,w,h,d,u,v,inflate,mirror], pivots in model space, y down from 24) ----------------
const HP2=Math.PI/2;
const MOB_MODELS={
  pig:{head:{p:[0,12,-6],b:[[-4,-4,-8,8,8,8,0,0],[-2,0,-9,4,3,1,16,16]]},body:{p:[0,11,2],r:[HP2,0,0],b:[[-5,-10,-7,10,16,8,28,8]]},
    l1:{p:[-3,18,7],b:[[-2,0,-2,4,6,4,0,16]]},l2:{p:[3,18,7],b:[[-2,0,-2,4,6,4,0,16]]},l3:{p:[-3,18,-5],b:[[-2,0,-2,4,6,4,0,16]]},l4:{p:[3,18,-5],b:[[-2,0,-2,4,6,4,0,16]]}},
  cow:{head:{p:[0,4,-8],b:[[-4,-4,-6,8,8,6,0,0],[-5,-5,-4,1,3,1,22,0],[4,-5,-4,1,3,1,22,0]]},body:{p:[0,5,2],r:[HP2,0,0],b:[[-6,-10,-7,12,18,10,18,4],[-2,2,-8,4,6,1,52,0]]},
    l1:{p:[-4,12,7],b:[[-2,0,-2,4,12,4,0,16]]},l2:{p:[4,12,7],b:[[-2,0,-2,4,12,4,0,16]]},l3:{p:[-4,12,-6],b:[[-2,0,-2,4,12,4,0,16]]},l4:{p:[4,12,-6],b:[[-2,0,-2,4,12,4,0,16]]}},
  deer:{head:{p:[0,3,-8],b:[[-3,-4,-6,6,7,6,0,0],[-4,-11,-3,1,7,1,22,0],[-6,-10,-3,2,1,1,22,0],[-6,-13,-3,1,3,1,22,0],[3,-11,-3,1,7,1,22,0],[4,-10,-3,2,1,1,22,0],[5,-13,-3,1,3,1,22,0]]},
    body:{p:[0,5,2],r:[HP2,0,0],b:[[-5,-10,-6,10,17,9,18,4]]},
    l1:{p:[-3,11,7],b:[[-1.5,0,-1.5,3,13,3,0,16]]},l2:{p:[3,11,7],b:[[-1.5,0,-1.5,3,13,3,0,16]]},l3:{p:[-3,11,-6],b:[[-1.5,0,-1.5,3,13,3,0,16]]},l4:{p:[3,11,-6],b:[[-1.5,0,-1.5,3,13,3,0,16]]}},
  sheep:{head:{p:[0,6,-8],b:[[-3,-4,-6,6,6,8,0,0]]},body:{p:[0,5,2],r:[HP2,0,0],b:[[-4,-10,-7,8,16,6,28,8]]},
    l1:{p:[-3,12,7],b:[[-2,0,-2,4,12,4,0,16]]},l2:{p:[3,12,7],b:[[-2,0,-2,4,12,4,0,16]]},l3:{p:[-3,12,-5],b:[[-2,0,-2,4,12,4,0,16]]},l4:{p:[3,12,-5],b:[[-2,0,-2,4,12,4,0,16]]}},
  sheep_fur:{head:{p:[0,6,-8],b:[[-3,-4,-4,6,6,6,0,0,.6]]},body:{p:[0,5,2],r:[HP2,0,0],b:[[-4,-10,-7,8,16,6,28,8,1.75]]},
    l1:{p:[-3,12,7],b:[[-2,0,-2,4,6,4,0,16,.5]]},l2:{p:[3,12,7],b:[[-2,0,-2,4,6,4,0,16,.5]]},l3:{p:[-3,12,-5],b:[[-2,0,-2,4,6,4,0,16,.5]]},l4:{p:[3,12,-5],b:[[-2,0,-2,4,6,4,0,16,.5]]}},
  chicken:{head:{p:[0,15,-4],b:[[-2,-6,-2,4,6,3,0,0],[-2,-4,-4,4,2,2,14,0],[-1,-2,-3,2,2,2,14,4]]},body:{p:[0,16,0],r:[HP2,0,0],b:[[-3,-4,-3,6,8,6,0,9]]},
    rleg:{p:[-2,19,1],b:[[-1,0,-3,3,5,3,26,0]]},lleg:{p:[1,19,1],b:[[-1,0,-3,3,5,3,26,0]]},rwing:{p:[-4,13,0],b:[[0,0,-3,1,4,6,24,13]]},lwing:{p:[4,13,0],b:[[-1,0,-3,1,4,6,24,13]]}},
  zombie:{head:{p:[0,0,0],b:[[-4,-8,-4,8,8,8,0,0],[-4,-8,-4,8,8,8,32,0,.5]]},body:{p:[0,0,0],b:[[-4,0,-2,8,12,4,16,16]]},
    rarm:{p:[-5,2,0],b:[[-3,-2,-2,4,12,4,40,16]]},larm:{p:[5,2,0],b:[[-1,-2,-2,4,12,4,40,16,0,true]]},rleg:{p:[-1.9,12,0],b:[[-2,0,-2,4,12,4,0,16]]},lleg:{p:[1.9,12,0],b:[[-2,0,-2,4,12,4,0,16,0,true]]}},
  skeleton:{head:{p:[0,0,0],b:[[-4,-8,-4,8,8,8,0,0]]},body:{p:[0,0,0],b:[[-4,0,-2,8,12,4,16,16]]},
    rarm:{p:[-5,2,0],b:[[-1,-2,-1,2,12,2,40,16]]},larm:{p:[5,2,0],b:[[-1,-2,-1,2,12,2,40,16,0,true]]},rleg:{p:[-2,12,.1],b:[[-1,0,-1,2,12,2,0,16]]},lleg:{p:[2,12,.1],b:[[-1,0,-1,2,12,2,0,16,0,true]]}},
  creeper:{head:{p:[0,6,0],b:[[-4,-8,-4,8,8,8,0,0]]},body:{p:[0,6,0],b:[[-4,0,-2,8,12,4,16,16]]},
    l1:{p:[-2,18,4],b:[[-2,0,-2,4,6,4,0,16]]},l2:{p:[2,18,4],b:[[-2,0,-2,4,6,4,0,16]]},l3:{p:[-2,18,-4],b:[[-2,0,-2,4,6,4,0,16]]},l4:{p:[2,18,-4],b:[[-2,0,-2,4,6,4,0,16]]}},
  wolf:{head:{p:[-1,13.5,-7],b:[[-3,-3,-2,6,6,4,0,0],[-3,-5,0,2,2,1,16,14],[1,-5,0,2,2,1,16,14],[-1.5,0,-5,3,3,4,0,10]]},body:{p:[0,14,2],r:[HP2,0,0],b:[[-4,-2,-3,6,9,6,18,14]]},
    mane:{p:[-1,14,2],r:[HP2,0,0],b:[[-4,-3,-3,8,6,7,21,0]]},l1:{p:[-2.5,16,7],b:[[-1,0,-1,2,8,2,0,18]]},l2:{p:[.5,16,7],b:[[-1,0,-1,2,8,2,0,18]]},l3:{p:[-2.5,16,-4],b:[[-1,0,-1,2,8,2,0,18]]},l4:{p:[.5,16,-4],b:[[-1,0,-1,2,8,2,0,18]]},
    tail:{p:[-1,12,8],r:[.9,0,0],b:[[-1,0,-1,2,8,2,9,18]]}},
  cube:{core:{p:[0,0,0],b:[[-2,18,-2,4,4,4,0,16]]}}};
{const seg=[];for(let i=0;i<8;i++){const u=i===2?24:i===3?24:0,v=i===2?10:i===3?19:i;seg.push([-4,16+i,-4,8,1,8,u,v]);}MOB_MODELS.cube.shell={p:[0,0,0],b:seg};}
{const sp={head:{p:[0,15,-3],b:[[-4,-4,-8,8,8,8,32,4]]},neck:{p:[0,15,0],b:[[-3,-3,-3,6,6,6,0,0]]},body:{p:[0,15,9],b:[[-5,-4,-6,10,8,12,0,12]]}};
  [[-4,15,2],[4,15,2],[-4,15,1],[4,15,1],[-4,15,0],[4,15,0],[-4,15,-1],[4,15,-1]].forEach((p,i)=>{sp['g'+(i+1)]={p,b:[i%2===0?[-15,-1,-1,16,2,2,18,0]:[-1,-1,-1,16,2,2,18,0]]};});MOB_MODELS.spider=sp;}
const MOB_MESH={};
function mobMesh(model,th){const k=model+':'+th;if(MOB_MESH[k])return MOB_MESH[k];const M=MOB_MODELS[model],out={};
  for(const n in M){const o=[];for(const [x,y,z,w,h,d,u,v,inf,mir] of M[n].b)boxUV(o,-(x+w),-(y+h),z,w,h,d,u,v,64,th,inf||0,!!mir);out[n]=meshFrom(o);}return MOB_MESH[k]=out;}
// ---------------- textures ----------------
let MOB_TEX={};
const MOB_TEXKEYS=['pig','cow','sheep','sheep_fur','chicken','zombie','skeleton','spider','spider_eyes','creeper','wolf','wolf_angry','wolf_collar','magma','deer','crystal_spider','crystal_spider_eyes','ice_wolf','ice_wolf_angry','glowshroom'];
function procMobTex(k){const tall=k==='zombie';const c=mkCanvas(64,tall?64:32),g=c.getContext('2d');
  const T=MOB_T[k]||{};const base=k==='sheep_fur'?'#f4f4f4':k.includes('eyes')||k==='wolf_collar'?null:(T.col||(k.startsWith('wolf')?'#c8c0b8':k.startsWith('ice_wolf')?'#c8e0f8':'#888888'));
  if(base){const [r,gg,b]=hexRGB(base).map(v=>v*255);for(let y=0;y<c.height;y++)for(let x=0;x<64;x++){const n=.82+hash2(x,y,k.length*13)*.3;g.fillStyle=`rgb(${r*n|0},${gg*n|0},${b*n|0})`;g.fillRect(x,y,1,1);}}
  // eyes on the front of the head box
  const H={pig:[0,0,8,8,8],cow:[0,0,8,8,6],deer:[0,0,8,8,6],glowshroom:[0,0,8,8,6],sheep:[0,0,6,6,8],chicken:[0,0,4,6,3],zombie:[0,0,8,8,8],skeleton:[0,0,8,8,8],creeper:[0,0,8,8,8],spider:[32,4,8,8,8],crystal_spider:[32,4,8,8,8],wolf:[0,0,6,6,4],ice_wolf:[0,0,6,6,4],spider_eyes:[32,4,8,8,8],crystal_spider_eyes:[32,4,8,8,8]}[k];
  if(H){const [u,v,w,h,d]=H;const fx=u+d,fy=v+d;const eye=k.includes('spider')?'#ff2020':k==='crystal_spider'||k==='crystal_spider_eyes'?'#60e0ff':'#101010';g.fillStyle=k==='crystal_spider_eyes'?'#60e0ff':eye;
    g.fillRect(fx+Math.round(w*.2),fy+Math.round(h*.35),Math.max(1,w/4|0),Math.max(1,h/8|0));g.fillRect(fx+w-Math.round(w*.2)-Math.max(1,w/4|0),fy+Math.round(h*.35),Math.max(1,w/4|0),Math.max(1,h/8|0));
    if(k==='creeper'){g.fillStyle='#102010';g.fillRect(fx+3,fy+4,2,3);g.fillRect(fx+2,fy+5,4,2);}}
  return c;}
function initMobTextures(){for(const k in MOB_TEX)gl.deleteTexture(MOB_TEX[k].tex);MOB_TEX={};const P=PACK.mobs||{};
  for(const k of MOB_TEXKEYS){const c=P[k]||procMobTex(k);MOB_TEX[k]={tex:mkTex(c),h:c.height};}}
function mobTexKey(e){const t=e.mob;if(t==='ice_wolf')return e.angry>0&&!e.owner?'ice_wolf_angry':'ice_wolf';return t;}

// ---------------- spawning and removal ----------------
function spawnMob(type,pos,o={}){const T=MOB_T[type];const e=new Ent(o.id||('m'+(mobSeq++)),T.name,'mob');e.mob=type;e.pos=pos.slice();e.hw=T.hw;e.eh=T.eh;e.maxHp=T.hp;e.health=o.hp!=null?o.hp:T.hp;
  e.yaw=o.yaw!=null?o.yaw:Math.random()*6.28;e.bodyYaw=e.yaw;e.headYaw=e.yaw;e.mot=[0,0,0];e.spdK=T.spd;e.ai={t:0};e.angry=0;e.fuse=0;e.shootT=1+Math.random()*2;e.atkCD=0;e.panic=0;
  e.color=type==='sheep'?(o.color!=null?o.color:sheepColor()):0;e.sheared=false;e.owner=o.owner||null;e.baby=!!o.baby;e.growT=o.baby?300:0;e.eggT=200+Math.random()*400;e.sayT=4+Math.random()*12;
  if(e.owner){e.maxHp=20;e.health=Math.min(20,o.hp!=null?o.hp:20);}
  mobs.push(e);return e;}
function removeMob(e){mobs=mobs.filter(m=>m!==e);}
const surfY=(x,z)=>surfaceH[(Math.floor(z)&ZM)*WX+(Math.floor(x)&XM)];
const openAt=(x,y,z)=>{const b=getB(x,y,z);return !b||(!BD[b].solid&&!BD[b].liquid);};
function floorOk(x,y,z){const b=getB(x,y-1,z);return b&&BD[b].solid&&!BD[b].liquid&&!BD[b].leaves&&b!==B.BEDROCK&&openAt(x,y,z)&&openAt(x,y+1,z);}
function effLight(x,y,z){const L=lightAt(x,y,z);const sky=L>>4,blk=L&15;return Math.max(blk,sky-Math.round((1-dayAmt())*11));}
function mobSpawnTick(dt){mobSpawnT-=dt;if(mobSpawnT>0)return;mobSpawnT=1.2;if(mobs.length>=44)return;
  const players=ents.filter(e=>e.kind==='player'&&e.alive&&!e.spectator);if(!players.length)return;
  const p=players[Math.random()*players.length|0];let pas=0,hos=0;for(const m of mobs){if(!m.alive||hdist(m.pos,p.pos)>64)continue;if(MOB_T[m.mob].kind==='passive'||m.owner)pas++;else hos++;}
  const farFromAll=(x,z,r)=>players.every(q=>Math.hypot(q.pos[0]-x,q.pos[2]-z)>=r);
  // animals: on the surface, in daylight-reachable spots, in small groups
  if(pas<9&&Math.random()<.45){const a=Math.random()*6.283,r=24+Math.random()*26;const x=Math.floor(p.pos[0]+Math.cos(a)*r),z=Math.floor(p.pos[2]+Math.sin(a)*r);
    if(chunkReadyAt(x,z)&&farFromAll(x,z,20)){const k=BIOMES[biomeAt(x,z)].k;const list=PASSIVE_BY[k]||[];if(list.length){const type=list[Math.random()*list.length|0];const n=type==='ice_wolf'?1+(Math.random()*3|0):1+(Math.random()*3|0);
      for(let i=0;i<n;i++){const xx=x+(Math.random()*5|0)-2,zz=z+(Math.random()*5|0)-2;if(!chunkReadyAt(xx,zz))continue;const y=surfY(xx,zz)+1;if(y<2||!floorOk(xx,y,zz)||(lightAt(xx,y,zz)>>4)<9)continue;spawnMob(type,[xx+.5,y,zz+.5]);}}}}
  // monsters: anywhere dark (caves, night), plus Magma Creatures on the Ashen surface at any time
  if(hos<11&&sDiff()>0)for(let tries=0;tries<3;tries++){const a=Math.random()*6.283,r=20+Math.random()*26;const x=Math.floor(p.pos[0]+Math.cos(a)*r),z=Math.floor(p.pos[2]+Math.sin(a)*r);
    if(!chunkReadyAt(x,z)||!farFromAll(x,z,18))continue;const k=BIOMES[biomeAt(x,z)].k;
    if(k==='ashen'&&Math.random()<.25){const y=surfY(x,z)+1;if(floorOk(x,y,z)){spawnMob('magma',[x+.5,y,z+.5]);break;}}
    let y=Math.floor(p.pos[1]+Math.random()*44-26);y=Math.min(y,surfY(x,z)+1);let ok=false;for(let s=0;s<14&&y>2;s++,y--){if(floorOk(x,y,z)){ok=true;break;}}if(!ok)continue;
    if(effLight(x,y,z)>7)continue;const list=HOSTILE_BASE.concat(HOSTILE_BY[k]||[]);const type=list[Math.random()*list.length|0];
    if(MOB_T[type].hw>.5&&!(openAt(x+1,y,z)&&openAt(x,y,z+1)))continue;spawnMob(type,[x+.5,y,z+.5]);break;}}
function mobDespawn(dt){const players=ents.filter(e=>e.kind==='player'&&e.alive);if(!players.length)return;
  for(const m of mobs){if(m.owner||!m.alive)continue;let d=1e9;for(const q of players)d=Math.min(d,dist(q.pos,m.pos));const hostile=MOB_T[m.mob].kind!=='passive';
    if(d>110||m.pos[1]<-10||(hostile&&d>44&&Math.random()<dt/25))m.gone=true;}
  if(mobs.some(m=>m.gone))mobs=mobs.filter(m=>!m.gone);}

// ---------------- AI (host) ----------------
const angTo=(a,b)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
function nearestPlayer(e,r){let best=null,bd=r;for(const q of ents){if(q.kind!=='player'||!q.alive||q.spectator||q.bat||q.gm==='creative')continue;const d=dist(q.pos,e.pos);if(d<bd){bd=d;best=q;}}return best;}
function canSee(e,t){const o=[e.pos[0],e.pos[1]+e.eh*.85,e.pos[2]],tp=[t.pos[0],t.pos[1]+(t.eh||EH)*.85,t.pos[2]];const d=[tp[0]-o[0],tp[1]-o[1],tp[2]-o[2]];const L=Math.hypot(...d);if(L<.1)return true;return !raycastBlock(o,d.map(v=>v/L),L);}
function updateMob(e,dt){const T=MOB_T[e.mob];
  if(!chunkReadyAt(e.pos[0],e.pos[2])){e.rpos=e.pos;return;}
  // status: effects, lava, fire, burning in daylight
  tickEffects(e,dt);
  if(T.fireproof){e.fire=0;}else{if(e.inLava){e.fire=15;hurt(e,4,null,'lava');}if(e.inWater)e.fire=0;}
  if(e.fire>0){e.fire-=dt;e.fireT+=dt;if(Math.random()<.4)spawnParticles(e.pos[0],e.pos[1]+.5+Math.random()*e.eh,e.pos[2],1,[1,.55,.1],1);if(e.fireT>=1){e.fireT=0;hurt(e,1,null,'fire');}}
  if(!e.alive)return;
  if(T.burn&&dayAmt()>.6&&!e.inWater&&(lightAt(Math.floor(e.pos[0]),Math.floor(e.pos[1]+e.eh),Math.floor(e.pos[2]))>>4)>=15&&e.fire<=0)e.fire=8;
  if(e.baby){e.growT-=dt;if(e.growT<=0)e.baby=false;}
  if(e.mob==='chicken'){e.eggT-=dt;if(e.eggT<=0){e.eggT=300+Math.random()*300;hostSpawnDrop([e.pos[0],e.pos[1]-.6,e.pos[2]],'egg',1,[0,2,0]);mobSndRaw(e,['mob/chicken/plop']);}}
  if(e.sheared){e.regrowT-=dt;if(e.regrowT<=0)e.sheared=false;}
  e.angry=Math.max(0,e.angry-dt);e.panic=Math.max(0,e.panic-dt);
  // pick a target
  const A=e.ai;A.t-=dt;
  if(A.t<=0){A.t=.4+Math.random()*.3;
    if(e.owner){const o=entById(e.owner);e.target=null;if(o&&o.alive){const la=o.lastAttacker;if(la&&la.alive&&la!==e&&o.lastAttackT<10&&dist(la.pos,o.pos)<16&&!(la.kind==='mob'&&la.owner===e.owner))e.target=la;
        else{let bd=10;for(const m of mobs)if(m.alive&&m!==e&&MOB_T[m.mob].kind==='hostile'){const d=dist(m.pos,o.pos);if(d<bd){bd=d;e.target=m;}}}}}
    else if(T.kind==='hostile'){let t=e.target&&e.target.alive&&!e.target.bat&&e.target.gm!=='creative'&&dist(e.target.pos,e.pos)<24?e.target:null;if(!t){t=nearestPlayer(e,16);if(t&&!canSee(e,t)&&dist(t.pos,e.pos)>6)t=null;}
      if(t&&T.dayNeutral&&effLight(Math.floor(e.pos[0]),Math.floor(e.pos[1]+.5),Math.floor(e.pos[2]))>9&&!(e.angry>0))t=null;e.target=t;}
    else if(T.kind==='neutral'){e.target=e.angry>0&&e.target&&e.target.alive&&!e.target.bat&&e.target.gm!=='creative'?e.target:null;}
    else e.target=null;}
  const t=e.target;let wx=0,wz=0,spd=T.spd;e.jump=false;let face=null;
  if((e.owner||e.tempt)&&!t){const o=e.owner?entById(e.owner):e.tempt;if(o&&o.alive){const d=dist(o.pos,e.pos);if(!e.owner){if(d>2.2){wx=o.pos[0]-e.pos[0];wz=o.pos[2]-e.pos[2];spd=T.spd*1.4;}}else if(d>24&&chunkReadyAt(o.pos[0],o.pos[2])){e.pos=[o.pos[0]+(Math.random()-.5)*2,o.pos[1],o.pos[2]+(Math.random()-.5)*2];e.mot=[0,0,0];e.prev=null;}
      else if(d>4){wx=o.pos[0]-e.pos[0];wz=o.pos[2]-e.pos[2];spd=T.chase||1;}face=o;}}
  if(t){const dx=t.pos[0]-e.pos[0],dz=t.pos[2]-e.pos[2],dy=t.pos[1]-e.pos[1],hd=Math.hypot(dx,dz);face=t;spd=T.chase||T.spd;
    if(T.ranged){if(hd<6){wx=-dx;wz=-dz;}else if(hd>12){wx=dx;wz=dz;}else{wx=-dz*(e.strafe||1);wz=dx*(e.strafe||1);spd*=.5;if(Math.random()<dt*.4)e.strafe=-(e.strafe||1);}
      e.shootT-=dt;if(e.shootT<=0&&hd<16&&canSee(e,t)){e.shootT=1.6+Math.random()*1.2;mobShoot(e,t);}}
    else if(T.explode){if(hd<3.2&&Math.abs(dy)<2.5&&canSee(e,t)){if(e.fuse===0){mobSndRaw(e,['random/fuse','random/creeper']);}e.fuse+=dt;}else{e.fuse=Math.max(0,e.fuse-dt);wx=dx;wz=dz;}
      if(e.fuse>=1.5){creeperBoom(e);return;}}
    else if(T.hop){if(e.onGround){e.hopT=(e.hopT||0)-dt;if(e.hopT<=0){e.hopT=.8+Math.random()*.8;const L=hd||1;e.mot[1]=.5;e.mot[0]+=dx/L*.3;e.mot[2]+=dz/L*.3;mobSndRaw(e,['mob/slime/big','mob/magmacube/jump']);}}}
    else{wx=dx;wz=dz;}
    // bite / punch
    const reach=e.hw+(t.hw||HW)+.7;if(!T.ranged&&hd<reach*.7){wx=wz=0;}if(T.dmg&&hd<reach&&dy>-1.2&&dy<e.eh+.4&&e.atkCD<=0){e.atkCD=1;e.swing=1;damage(t,Math.max(.5,T.dmg*diffMul()),e,'melee',[dx,dz,0,0,0],false,T.hitFx);}}
  else if((!e.owner&&!e.tempt)||!face){
    if(e.panic>0&&e.fleeFrom){wx=e.pos[0]-e.fleeFrom.pos[0];wz=e.pos[2]-e.fleeFrom.pos[2];spd=T.flee||1;}
    else{if(T.shy&&Math.random()<dt*2){const q=nearestPlayer(e,T.shy);if(q&&!q.sneak){e.panic=3;e.fleeFrom=q;}}
      if(!A.goal||A.wt<=0||hdist(A.goal,e.pos)<.8){A.wt=3+Math.random()*6;A.goal=Math.random()<.45?null:[e.pos[0]+(Math.random()-.5)*16,0,e.pos[2]+(Math.random()-.5)*16];}
      A.wt-=dt;if(A.goal){wx=A.goal[0]-e.pos[0];wz=A.goal[2]-e.pos[2];spd=T.spd*.8;}}}
  const L=Math.hypot(wx,wz);if(L>.01){wx/=L;wz/=L;
    // animals don't walk off cliffs or into lava when they are just wandering
    if(!t&&!(e.panic>0)){const ax=Math.floor(e.pos[0]+wx*(e.hw+.5)),az=Math.floor(e.pos[2]+wz*(e.hw+.5)),ay=Math.floor(e.pos[1]);let drop=0;while(drop<4&&!(getB(ax,ay-1-drop,az)&&BD[getB(ax,ay-1-drop,az)].solid))drop++;
      const lb=getB(ax,ay,az);if(drop>=3||lb===B.LAVA||getB(ax,ay-1,az)===B.LAVA){wx=wz=0;if(A.goal)A.goal=null;}}}
  else{wx=wz=0;}
  if(e.fuse>0){wx=wz=0;}
  if((wx||wz)&&e.collidedH&&e.onGround&&!T.climb)e.jump=true;
  if(e.inWater||e.inLava)e.jump=true;
  // don't stand inside other creatures or players: a gentle push apart
  for(const o of mobs.length<60?hitList():ents){if(o===e||!o.alive||o.bat)continue;const px=e.pos[0]-o.pos[0],pz=e.pos[2]-o.pos[2],m=e.hw+(o.hw||HW);if(Math.abs(px)>=m||Math.abs(pz)>=m||Math.abs(e.pos[1]-o.pos[1])>1.5)continue;const d=Math.hypot(px,pz)||.01;const k=Math.min(1,(m-d)/m)*.06;e.mot[0]+=px/d*k;e.mot[2]+=pz/d*k;}
  e.spdK=spd*(e.baby?1.2:1);physics(e,dt,wx,wz);
  if(T.climb&&e.collidedH&&(wx||wz)){e.mot[1]=Math.max(e.mot[1],.2);e.fallDist=0;}
  if(T.slowFall&&!e.onGround&&e.mot[1]<-.1){e.mot[1]=-.1;e.fallDist=0;}
  // turn the body toward where it walks and the head toward what it watches
  if(wx||wz){const want=Math.atan2(-wx,-wz);e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dt*8);}else if(face){const want=Math.atan2(-(face.pos[0]-e.pos[0]),-(face.pos[2]-e.pos[2]));e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dt*4);}
  if(face){const fx=face.pos[0]-e.pos[0],fz=face.pos[2]-e.pos[2],fy=(face.pos[1]+(face.eh||EH)*.85)-(e.pos[1]+e.eh*.85);let hy=Math.atan2(-fx,-fz);const dd=angTo(e.bodyYaw,hy);hy=e.bodyYaw+clamp(dd,-1.2,1.2);e.headYaw=hy;e.pitch=clamp(Math.atan2(fy,Math.hypot(fx,fz)),-.8,.8);}
  else{e.headYaw+=angTo(e.headYaw,e.bodyYaw)*Math.min(1,dt*5);e.pitch*=.9;}
  e.yaw=e.headYaw;}
function mobShoot(e,t){const o=[e.pos[0],e.pos[1]+1.5,e.pos[2]];const tp=[t.pos[0],t.pos[1]+(t.eh||EH)/3,t.pos[2]];const dx=tp[0]-o[0],dz=tp[2]-o[2],hd=Math.hypot(dx,dz);const dy=tp[1]-o[1]+hd*.2;
  const L=Math.hypot(dx,dy,dz)||1,j=()=>(Math.random()-.5)*.06;spawnProj('arrow',o,[dx/L*1.6+j(),dy/L*1.6+j(),dz/L*1.6+j()],e,0);projs[projs.length-1].noPick=true;e.swing=1;
  mobSndRaw(e,['mob/skeleton/shoot','random/bow']);}
function mobHurt(e,src,cause){const T=MOB_T[e.mob];if(!src||src===e)return;
  if(T.kind==='passive'){e.panic=6;e.fleeFrom=src;}
  else if(src.gm==='creative'){}
  else if(!(src.kind==='mob'&&src.owner&&src.owner===e.owner)){if(e.owner&&src.id===e.owner)return;e.target=src;e.angry=30;
    if(e.mob==='ice_wolf'&&!e.owner)for(const m of mobs)if(m!==e&&m.mob==='ice_wolf'&&!m.owner&&dist(m.pos,e.pos)<14){m.angry=30;m.target=src;}}}
function mobDie(e,src,cause){if(!e.alive)return;const T=MOB_T[e.mob];e.alive=false;e.health=0;e.deathT=0;e.fire=e.fire||0;
  if(dropAuth()){const burnt=e.fire>0;for(const [id,a,b] of T.drops){const n=a+Math.floor(Math.random()*(b-a+1))*(e.baby?0:1);if(n>0)hostSpawnDrop([e.pos[0],e.pos[1]-.4,e.pos[2]],burnt&&COOKED[id]?COOKED[id]:id,n);}
    for(const [id,ch] of T.rare||[])if(Math.random()<ch)hostSpawnDrop([e.pos[0],e.pos[1]-.4,e.pos[2]],id,1);
    if(e.mob==='sheep'&&!e.sheared&&!e.baby)hostSpawnDrop([e.pos[0],e.pos[1]-.4,e.pos[2]],WOOL_IDS[e.color]||'b71',1);
    if(src&&src.kind==='player')src.kills=(src.kills||0)+1;}
  mobSnd(e,'death');netSend(N.MOBDIE,{id:e.id});}
function creeperBoom(e){e.alive=false;removeMob(e);netSend(N.MOBDIE,{id:e.id,s:1});explode([e.pos[0],e.pos[1]+.8,e.pos[2]],3,e);}

// ---------------- explosions and TNT ----------------
// whoever causes an explosion works it out and tells everyone which blocks went; damage goes through the normal damage routing
function explode(c,pw,src){const list=[],dropList=[];const R=pw*1.15;
  for(let dy=-Math.ceil(R);dy<=Math.ceil(R);dy++)for(let dz=-Math.ceil(R);dz<=Math.ceil(R);dz++)for(let dx=-Math.ceil(R);dx<=Math.ceil(R);dx++){const d=Math.hypot(dx,dy,dz);if(d>R*(.65+Math.random()*.35))continue;
    const x=Math.floor(c[0]+dx),y=Math.floor(c[1]+dy),z=Math.floor(c[2]+dz);if(y<1||!chunkReadyAt(x,z))continue;const b=getB(x,y,z);
    if(!b||b===B.BEDROCK||b===B.OBSIDIAN||b===B.CHEST||rotBase(b)===B.FURNACE||b===B.BARRIER||BD[b].liquid)continue;
    if(b===B.TNT){igniteTNT(x,y,z,.4+Math.random()*.8,src);continue;}
    list.push(x,y,z,0);if(Math.random()<.3&&dropList.length<24)dropList.push([x,y,z,b]);}
  applyBlockList(list,true);netSend(N.BOOM,{l:list,p:c,pw});boomFx(c,pw);
  for(const [x,y,z,b] of dropList){const id=MINE_DROP[b]!==undefined?MINE_DROP[b]:'b'+b;if(id&&ITEMS[id])requestDrop([x+.5,y-.5,z+.5],id,1);}
  for(const e of hitList()){if(!e.alive||e.bat||e.spectator)continue;const ec=[e.pos[0],e.pos[1]+(e.eh||EH)*.5,e.pos[2]];const v=[ec[0]-c[0],ec[1]-c[1],ec[2]-c[2]];const d=Math.hypot(...v);if(d>pw*2)continue;
    let imp=1-d/(pw*2);if(d>.5&&raycastBlock(c,v.map(q=>q/d),d))imp*=.35;const dmg=(imp*imp+imp)/2*6*pw+1;const hl=Math.hypot(v[0],v[2])||1;
    const dm=src&&src.kind==='mob'&&e.kind==='player'?Math.max(.5,diffMul()):1;
    damage(e,Math.round(dmg*dm*2)/2,src&&src!==e?src:null,'explosion',[v[0],v[2],imp*2.5,v[0]/hl,v[2]/hl],false);}}
function boomFx(c,pw){spawnParticles(c[0],c[1],c[2],50,[.9,.9,.9],pw*2.4,'poof');spawnParticles(c[0],c[1],c[2],24,[1,.75,.3],pw*1.5);
  if(actx&&camPos){const d=dist(c,camPos);if(d<48){const vol=Math.max(.15,1-d/48);const g=packGroup(['random/explode','entity/generic/explode']);if(g)playBytes(g[Math.random()*g.length|0],vol,.75+Math.random()*.2);else{noiseHit(.9,300,.7,.7*vol,'lowpass');tone('sine',90,30,.6,.3*vol);}}}
  if(player&&dist(c,player.pos)<pw*4)GZ.shake=Math.max(GZ.shake||0,.5*(1-dist(c,player.pos)/(pw*4)));}
// many block changes at once with one relight (explosions, bone meal). list = [x,y,z,b, x,y,z,b, ...]
function applyBlockList(list,fx){if(!list.length||!INF)return;let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;const slots=new Set(),cols=new Set();let parts=0;
  for(let i=0;i<list.length;i+=4){const x=list[i],y=list[i+1],z=list[i+2],b=list[i+3];if(y<0||y>=WY)continue;const was=getB(x,y,z);if(was===b)continue;
    if(fx&&was&&parts<40&&Math.random()<.35){blockParticles(x,y,z,was,3);parts++;}
    const cx=x>>4,cz=z>>4,k=ckey(cx,cz);let m=worldEdits.get(k);if(!m){m=new Map();worldEdits.set(k,m);}m.set((x&15)|((z&15)<<4)|(y<<8),b);infDirtySave=true;
    if(!inBInf(x,y,z))continue;const s=SLOT(cx,cz);world[idx(x,y,z)]=b;if(b&&y+1>cmaxY[s])cmaxY[s]=Math.min(WY-1,y+1);slots.add(s);cols.add(x+','+z);
    x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}
  for(const cz of cols){const [x,z]=cz.split(',').map(Number);let t=WY-1;while(t>0&&!(world[idx(x,t,z)]&&BD[world[idx(x,t,z)]].solid))t--;surfaceH[(z&ZM)*WX+(x&XM)]=t;}
  if(!slots.size)return;let lit=false;for(const s of slots)if(cst[s]>=2)lit=true;if(!lit)return;
  const ch=lightBox(x0-15,z0-15,x1+15,z1+15);for(const s of slots)if(cst[s]>=3)meshSlot(s);for(const s of ch)if(!slots.has(s)&&cst[s]>=3)cdirty[s]=1;}
function igniteTNT(x,y,z,fuse,by,remote){if(!remote){setBlockNet(x,y,z,0);netSend(N.TNT,{x,y,z,t:fuse});}primed.push({x,y,z,t:fuse,t0:fuse,own:!remote,by:by||null});
  if(actx&&camPos&&dist([x,y,z],camPos)<16){const g=packGroup(['random/fuse','entity/tnt/primed']);if(g)playBytes(g[0],.8,1);}}
function tickPrimed(dt){for(const p of primed.slice()){p.t-=dt;if(Math.random()<.5)spawnParticles(p.x+.5,p.y+1.05,p.z+.5,1,[.6,.6,.6],.6,'poof');if(p.t<=0){p.done=true;if(p.own)explode([p.x+.5,p.y+.5,p.z+.5],4,p.by);}}
  if(primed.some(p=>p.done))primed=primed.filter(p=>!p.done);}

// ---------------- network ----------------
function sendMobs(dt){if(!net||!isHost())return;mobSendT-=dt;if(mobSendT>0)return;mobSendT=.1;const now=Math.round(performance.now());
  const arr=mobs.filter(m=>m.alive).map(e=>[e.id,MOB_TYPES.indexOf(e.mob),+e.pos[0].toFixed(2),+e.pos[1].toFixed(2),+e.pos[2].toFixed(2),+e.vel[0].toFixed(2),+e.vel[1].toFixed(2),+e.vel[2].toFixed(2),
    +e.bodyYaw.toFixed(2),+e.headYaw.toFixed(2),+e.pitch.toFixed(2),Math.round(e.health*10)/10,(e.sheared?1:0)|(e.angry>0?2:0)|(e.swing>.5?4:0)|(e.fire>0?8:0)|(e.baby?16:0),e.color,+e.fuse.toFixed(2),e.owner,now]);
  netSend(N.MOBS,arr);}
const mobGone=new Map();
function mobNet(code,d,from,fromHost){
  if(code===N.MOBS){if(!fromHost||isHost())return;const seen=new Set();const now=performance.now();
    for(const a of d){const id=a[0];seen.add(id);if(mobGone.has(id)&&now-mobGone.get(id)<3000)continue;const type=MOB_TYPES[a[1]];if(!type)continue;let e=mobs.find(m=>m.id===id);
      if(!e){e=spawnMob(type,[a[2],a[3],a[4]],{id,color:a[13],owner:a[15],hp:a[11]});}
      if(e.mob!==type){e.mob=type;e.name=MOB_T[type].name;}
      pushSnap(e,[a[2],a[3],a[4]],[a[5],a[6],a[7]],a[9],a[10],a[16]);e.bodyYawNet=a[8];
      if(a[11]<e.health-.3){const pred=e.hitPred&&now-e.hitPred<800;if(!pred)mobSnd(e,'hurt');if(!(e.hurtT>0))e.hurtT=.5;}e.health=a[11];
      const f=a[12];e.sheared=!!(f&1);e.angry=f&2?5:0;if(f&4)e.swing=Math.max(e.swing,1);e.fire=f&8?1:0;e.baby=!!(f&16);e.color=a[13];
      if(a[14]>0&&!(e.fuse>0))mobSndRaw(e,['random/fuse','random/creeper']);e.fuse=a[14];if(a[15]&&!e.owner)spawnParticles(e.pos[0],e.pos[1]+1,e.pos[2],10,[1,.3,.4],1.5);e.owner=a[15];}
    for(const m of mobs)if(m.alive&&!seen.has(m.id))m.gone=true;mobs=mobs.filter(m=>!m.gone);return;}
  if(code===N.MOBDIE){const e=mobs.find(m=>m.id===d.id);mobGone.set(d.id,performance.now());if(!e)return;if(d.s){removeMob(e);return;}if(e.alive){e.alive=false;e.deathT=0;mobSnd(e,'death');}return;}
  if(code===N.MOBUSE){if(!isHost())return;const by=entById('p'+from)||entById(d.by);if(d.a==='egg'){if(Array.isArray(d.p))spawnMob('chicken',d.p,{baby:true});return;}const e=mobs.find(m=>m.id===d.id);if(e&&e.alive)mobAct(e,d.a,by);return;}
  if(code===N.BOOM){if(!Array.isArray(d.l))return;applyBlockList(d.l,!!d.p);if(d.p)boomFx(d.p,d.pw||3);return;}
  if(code===N.TNT){igniteTNT(d.x,d.y,d.z,d.t,null,true);return;}}

// ---------------- using items on mobs ----------------
function lookMob(p,range){const o=eye(p),d=fwd(p);const bh=raycastBlock(o,d,range);const maxT=bh?bh.t:range;let best=null,bt=maxT;for(const m of mobs){if(!m.alive)continue;const tt=rayBox(o,d,...entBox(m,.1));if(tt>=0&&tt<bt){bt=tt;best=m;}}return best;}
function mobInteract(p,s){if(!INF||!p.alive)return false;const m=lookMob(p,3.5);if(!m)return false;const id=s&&s.id;const send=a=>{if(isHost()||dimLocal())mobAct(m,a,p);else netSend(N.MOBUSE,{id:m.id,a,by:p.id},'host');};
  if(id==='shears'&&((m.mob==='sheep'&&!m.sheared&&!m.baby)||m.mob==='glowshroom')){send('shear');wearHeld(p,1);p.swing=1;sfx('pick',{vol:.8});return true;}
  if(id==='bucket'&&m.mob==='cow'&&!m.baby){p.inv[p.sel]={id:'milk_bucket',count:1};p.swing=1;sfx('drink');return true;}
  if(id==='bone'&&m.mob==='ice_wolf'&&!m.owner){consume(p,p.sel);send('tame');p.swing=1;return true;}
  if(id&&id.endsWith('_dye')&&m.mob==='sheep'&&!m.sheared){const k=id.slice(0,-4);if(DYE_WOOL[k]!=null){consume(p,p.sel);send('dye:'+k);p.swing=1;spawnParticles(m.pos[0],m.pos[1]+1,m.pos[2],8,hexRGB(ITEMS[id].color),1.5);return true;}}
  if(id==='flint_and_steel'){damage(m,1,p,'fire',null,false,[['ignite',6,0]]);wearHeld(p,1);p.swing=1;return true;}
  return false;}
function mobAct(e,a,by){
  if(a==='shear'){if(e.mob==='sheep'&&!e.sheared){e.sheared=true;e.regrowT=120+Math.random()*60;hostSpawnDrop([e.pos[0],e.pos[1]+.2,e.pos[2]],e.color===-1?'b12':(WOOL_IDS[e.color]||'b71'),1+(Math.random()*3|0));}
    else if(e.mob==='glowshroom'){hostSpawnDrop([e.pos[0],e.pos[1]+.2,e.pos[2]],'b98',3);e.mob='cow';e.name=MOB_T.cow.name;spawnParticles(e.pos[0],e.pos[1]+1,e.pos[2],16,[.4,.7,1],2);}}
  else if(a==='tame'&&by){if(Math.random()<.34){e.owner=by.id;e.maxHp=20;e.health=20;e.angry=0;e.target=null;spawnParticles(e.pos[0],e.pos[1]+1,e.pos[2],12,[1,.3,.4],1.5);if(by===player)chatMsg('Your Ice Wolf will follow you and fight for you.','#88ddff',false);}
    else spawnParticles(e.pos[0],e.pos[1]+1,e.pos[2],8,[.6,.6,.6],1.2,'poof');}
  else if(a.startsWith('dye:')){const k=a.slice(4);if(DYE_WOOL[k]!=null)e.color=DYE_WOOL[k];}}
// right click with other new items: eggs, bone meal, flint and steel on TNT
function useSpecial(p,s){if(!INF||!s)return false;const id=s.id;
  if(id==='bone_meal'){const h=raycastBlock(eye(p),fwd(p),4.5);if(!h)return false;const grassy=[B.GRASS,B.SAKURA_GRASS,B.SNOW_GRASS,B.CRYSTAL_GRASS,B.GLOW_MOSS,B.PODZOL];if(!grassy.includes(h.b))return false;
    const k=BIOMES[biomeAt(h.x,h.z)].k;const pool={sakura:[B.PETALS,B.PETALS,B.TGRASS,B.POPPY],crystal:[B.TGRASS,B.CRYSTAL_CLUSTER],mushroom:[B.GLOW_PLANT,B.GLOW_SHROOM],redwood:[B.FERN,B.TGRASS],frozen:[B.FERN]}[k]||[B.TGRASS,B.TGRASS,B.TGRASS,B.POPPY,B.DANDELION];
    const list=[];for(let i=0;i<14;i++){const x=h.x+Math.round((Math.random()-.5)*5),z=h.z+Math.round((Math.random()-.5)*5);for(let y=h.y+2;y>=h.y-2;y--){if(grassy.includes(getB(x,y,z))&&!getB(x,y+1,z)){list.push(x,y+1,z,pool[Math.random()*pool.length|0]);break;}}}
    if(!list.length)return false;applyBlockList(list,false);netSend(N.BOOM,{l:list});consume(p,p.sel);p.swing=1;spawnParticles(h.x+.5,h.y+1.2,h.z+.5,14,[.4,1,.4],2);return true;}
  if(id==='flint_and_steel'){const h=raycastBlock(eye(p),fwd(p),4.5);if(h&&h.b===B.TNT){igniteTNT(h.x,h.y,h.z,4,p);wearHeld(p,1);p.swing=1;return true;}return false;}
  return false;}
function eggImpact(pr){spawnParticles(pr.pos[0],pr.pos[1],pr.pos[2],8,[.95,.92,.85],2);sfx('pick',{pos:pr.pos,vol:.6});
  if(!owned(pr.owner)||Math.random()>=.125)return;const p=[pr.pos[0],pr.pos[1],pr.pos[2]];if(isHost()||dimLocal())spawnMob('chicken',p,{baby:true});else netSend(N.MOBUSE,{a:'egg',p},'host');}
function useTotem(e){const i=e.inv.findIndex(s=>s&&s.id==='totem');if(i<0)return false;e.inv[i]=null;e.health=6;e.fire=0;e.effects={};giveEffect(e,'regen',12,1);giveEffect(e,'absorption',8,1);e.absorb=Math.max(e.absorb||0,4);
  spawnParticles(e.pos[0],e.pos[1]+1,e.pos[2],50,[1,.85,.3],4);if(e===player){chatMsg('Your Totem of Renewal saved you!','#ffdd55',false);sfx('win');}return true;}
function hammerQuake(e,t,dmg){for(const m of hitList()){if(m===e||m===t||!m.alive||m.bat||dist(m.pos,t.pos)>3)continue;damage(m,dmg*.5,e,'melee',[m.pos[0]-t.pos[0],m.pos[2]-t.pos[2],1,0,0],false,[['ignite',3,0]]);}
  for(let i=0;i<10;i++){const a=i/10*6.283;spawnParticles(t.pos[0]+Math.cos(a)*1.5,t.pos[1]+.1,t.pos[2]+Math.sin(a)*1.5,2,[1,.45,.1],1.5);}}

// ---------------- sounds ----------------
const MOB_SND={pig:{say:['mob/pig/say'],hurt:['mob/pig/say'],death:['mob/pig/death']},cow:{say:['mob/cow/say'],hurt:['mob/cow/hurt','mob/cow/say'],death:['mob/cow/hurt']},
  sheep:{say:['mob/sheep/say'],hurt:['mob/sheep/say'],death:['mob/sheep/say']},chicken:{say:['mob/chicken/say'],hurt:['mob/chicken/hurt'],death:['mob/chicken/hurt']},
  wolf:{say:['mob/wolf/classic/panting','mob/wolf/classic/bark'],angry:['mob/wolf/classic/growl'],hurt:['mob/wolf/classic/hurt'],death:['mob/wolf/classic/death']},
  slime:{say:[],hurt:['mob/slime/big','mob/magmacube/big'],death:['mob/slime/big','mob/magmacube/big']},
  zombie:{say:['mob/zombie/say'],hurt:['mob/zombie/hurt'],death:['mob/zombie/death']},skeleton:{say:['mob/skeleton/say'],hurt:['mob/skeleton/hurt'],death:['mob/skeleton/death']},
  spider:{say:['mob/spider/say'],hurt:['mob/spider/say'],death:['mob/spider/death']},crystal_spider:{say:['mob/spider/say'],hurt:['mob/spider/say'],death:['mob/spider/death']},creeper:{say:[],hurt:['mob/creeper/say'],death:['mob/creeper/death']}};
function mobSndRaw(e,names,pitch){if(!actx||!camPos)return false;const d=dist(e.pos,camPos);if(d>16)return true;const g=packGroup(names);if(!g)return false;playBytes(g[Math.random()*g.length|0],(1-d/16)*.8,(pitch||1)*(.9+Math.random()*.2));return true;}
function mobSnd(e,kind){if(!actx||!camPos)return;const T=MOB_T[e.mob];const set=MOB_SND[T.snd||e.mob]||{};const k=kind==='say'&&e.angry>0&&set.angry?'angry':kind;const pitch=(T.pitch||1)*(e.baby?1.5:1);
  if(set[k]&&set[k].length&&mobSndRaw(e,set[k],pitch))return;const d=dist(e.pos,camPos);if(d>16)return;const v=1-d/16;
  if(kind==='hurt'){sfx('hurt',{pos:e.pos});return;}
  // stand-ins for the mobs this sound pack has nothing for
  switch(e.mob){case 'zombie':tone('sawtooth',kind==='death'?90:120,60,.5,.05*v);noiseHit(.3,300,1,.08*v,'lowpass');break;
    case 'skeleton':for(let i=0;i<3;i++)setTimeout(()=>noiseHit(.04,2200,3,.12*v),i*70);break;
    case 'spider':case 'crystal_spider':noiseHit(.35,3500,1,.07*v,'highpass');break;
    case 'creeper':if(kind==='death')noiseHit(.3,500,1,.2*v,'lowpass');break;
    case 'magma':noiseHit(.2,250,3,.2*v,'lowpass');break;
    default:if(kind==='death')sfx('hurt',{pos:e.pos});}}

// ---------------- per-frame update ----------------
function mobsUpdate(dt){
  if(MATCH.mode!=='survival'||MATCH.state!=='play'){if(mobs.length)mobs=[];primed=[];return;}
  if(SURV.loading)return;
  const host=isHost()||dimLocal();
  for(const e of mobs){e.invuln=Math.max(0,e.invuln-dt);e.hurtT=Math.max(0,e.hurtT-dt);e.atkCD-=dt;e.swing=Math.max(0,e.swing-dt*4);
    if(e.deathT!=null){e.deathT+=dt;if(e.deathT>.9){e.gone=true;spawnParticles(e.pos[0],e.pos[1]+e.eh*.5,e.pos[2],14,[.85,.85,.85],1.2,'poof');}continue;}
    if(host)updateMob(e,dt);else{interpRemote(e,dt);if(e.bodyYawNet!=null)e.bodyYaw+=angTo(e.bodyYaw,e.bodyYawNet)*Math.min(1,dt*12);e.headYaw=e.yaw;}
    // idle noises (every player makes their own)
    e.sayT-=dt;if(e.sayT<=0){e.sayT=8+Math.random()*16;if(e.alive)mobSnd(e,'say');}}
  if(mobs.some(m=>m.gone))mobs=mobs.filter(m=>!m.gone);
  tickPrimed(dt);
  if(host){if(isHost())sendMobs(dt);if(sDiff()===0&&mobs.some(m=>MOB_T[m.mob].kind==='hostile'))mobs=mobs.filter(m=>MOB_T[m.mob].kind!=='hostile');mobSpawnTick(dt);mobDespawn(dt);}
  if(GZ.shake>0)GZ.shake=Math.max(0,GZ.shake-dt);}

// ---------------- drawing ----------------
function mobBright(e){const p=e.rpos||e.pos;const x=Math.floor(p[0]),z=Math.floor(p[2]),y=Math.floor(p[1]+.5);const a=lightAt(x,y,z),b=lightAt(x,y+1,z);const L=Math.max(a>>4,b>>4)<<4|Math.max(a&15,b&15);
  return Math.max(LB[(L>>4)&15]*SKYMUL,LB[L&15],.2);}
function drawMobs(fogF){if(!mobs.length&&!primed.length)return;if(mobTexDirty){mobTexDirty=false;initMobTextures();}useTex(VP,camPos);
  for(const e of mobs){const rp=e.rpos||e.pos;if(Math.hypot(rp[0]-camPos[0],rp[2]-camPos[2])>Math.min(fogF+8,96))continue;drawMob(e);}
  gl.uniform1f(PT.u.hurt,0);gl.uniform4f(PT.u.tint,1,1,1,1);
  // lit TNT: a flashing, slightly swelling block
  for(const p of primed){const hm=heldMesh('b'+B.TNT);if(!hm)continue;const sw=p.t<.6?1+(1-p.t/.6)*.15:1;const flash=Math.floor(p.t*5)%2===0;
    gl.uniform1f(PT.u.bright,flash?1.6:Math.max(.3,mobBright({pos:[p.x+.5,p.y,p.z+.5]})));drawMesh(hm.mesh,chain(M4.tr(p.x+.5,p.y+.5,p.z+.5),M4.sc(sw,sw,sw)),hm.tex);}}
function drawMob(e){const T=MOB_T[e.mob];const tk=mobTexKey(e);const TX=MOB_TEX[tk];if(!TX)return;limbTick(e);
  const model=T.model,M=mobMesh(model,TX.h);const rp=e.rpos||e.pos;const by=e.bodyYaw==null?e.yaw:e.bodyYaw;
  let S=(T.scale||1)*(e.baby?.5:1)*(model==='zombie'||model==='skeleton'?.9375:1);let sy=1;
  if(e.fuse>0){const f=Math.min(1,e.fuse/1.5);const w=1+Math.sin(f*100)*f*.01;S*=(1+f*.4)*w;sy=1/(1+f*.1);}
  if(T.hop){const air=e.vel&&Math.abs(e.vel[1])>.5;sy*=air?1.25:.85+.15*Math.cos(perfT*4);}
  const tilt=e.deathT!=null?Math.min(1,Math.sqrt(e.deathT*1.8))*HP2:0;
  const base=chain(M4.tr(rp[0],rp[1],rp[2]),M4.ry(by),M4.rz(tilt),M4.sc(S,S*sy,S));
  const ls=(e.limbSwing||0)*.6662,la=Math.min(1,e.limbAmt||0);const hY=-((e.headYaw==null?e.yaw:e.headYaw)-by),hX=-(e.pitch||0);
  const R={};   // vanilla rotations per part
  const C=Math.cos;
  if(model==='pig'||model==='cow'||model==='deer'||model==='sheep'||model==='creeper'){R.l1=[C(ls)*1.4*la,0,0];R.l2=[C(ls+Math.PI)*1.4*la,0,0];R.l3=[C(ls+Math.PI)*1.4*la,0,0];R.l4=[C(ls)*1.4*la,0,0];R.head=[hX,hY,0];}
  if(model==='wolf'){R.l1=[C(ls)*1.4*la,0,0];R.l2=[C(ls+Math.PI)*1.4*la,0,0];R.l3=[C(ls+Math.PI)*1.4*la,0,0];R.l4=[C(ls)*1.4*la,0,0];R.head=[hX,hY,0];R.tail=[e.angry>0?1.5:e.owner?1.2:.65,C(ls)*1.4*la,0];}
  if(model==='chicken'){R.head=[hX,hY,0];R.rleg=[C(ls)*1.4*la,0,0];R.lleg=[C(ls+Math.PI)*1.4*la,0,0];const fl=e.onGround===false||(e.vel&&Math.abs(e.vel[1])>1)?Math.abs(Math.sin(perfT*20))*1.2:0;R.rwing=[0,0,fl];R.lwing=[0,0,-fl];}
  if(model==='zombie'||model==='skeleton'||model==='enderman'){R.head=[hX,hY,0];const sw=e.swing>0?Math.sin((1-e.swing)*Math.PI):0;const armX=-HP2+Math.sin(perfT*1.3)*.05;
    R.rarm=[armX-sw*.6,-.1+sw*.3,Math.cos(perfT*1.8)*.05+.05];R.larm=[armX-sw*.4,.1-sw*.3,-Math.cos(perfT*1.8)*.05-.05];if((model==='skeleton'||model==='enderman')&&!e.target&&!(e.swing>0)){R.rarm=[C(ls+Math.PI)*la,0,.05];R.larm=[C(ls)*la,0,-.05];}
    R.rleg=[C(ls)*1.4*la,0,0];R.lleg=[C(ls+Math.PI)*1.4*la,0,0];}
  if(model==='spider'){R.head=[hX,hY,0];const f6=Math.PI/4,f8=Math.PI/8,k=ls*2;
    const z=[-f6,f6,-f6*.74,f6*.74,-f6*.74,f6*.74,-f6,f6],y=[f8*2,-f8*2,f8,-f8,-f8,f8,-f8*2,f8*2];
    const a9=-(C(k)*.4)*la,a10=-(C(k+Math.PI)*.4)*la,a11=-(C(k+HP2)*.4)*la,a12=-(C(k+Math.PI*1.5)*.4)*la;
    const s13=Math.abs(Math.sin(ls)*.4)*la,s14=Math.abs(Math.sin(ls+Math.PI)*.4)*la,s15=Math.abs(Math.sin(ls+HP2)*.4)*la,s16=Math.abs(Math.sin(ls+Math.PI*1.5)*.4)*la;
    const ya=[a9,-a9,a10,-a10,a11,-a11,a12,-a12],za=[s13,-s13,s14,-s14,s15,-s15,s16,-s16];for(let i=0;i<8;i++)R['g'+(i+1)]=[0,y[i]+ya[i],z[i]+za[i]];}
  const MD=MOB_MODELS[model];
  const mat=n=>{const P=MD[n].p,r0=MD[n].r||[0,0,0],r=R[n]||[0,0,0];const X=r0[0]+r[0],Y=r0[1]+r[1],Z=r0[2]+r[2];return chain(base,M4.tr(-P[0]/16,(24-P[1])/16,P[2]/16),M4.rz(Z),M4.ry(-Y),M4.rx(-X));};
  const br=mobBright(e);const flash=e.fuse>0&&Math.floor(e.fuse*8)%2===0;gl.uniform1f(PT.u.bright,flash?2.2:Math.max(br,T.glow||0));gl.uniform1f(PT.u.hurt,(e.hurtT>0||e.deathT!=null)?1:0);
  const mats={};for(const n in M){mats[n]=mat(n);drawMesh(M[n],mats[n],TX.tex);}
  // sheep wool, wolf collar, glowing spider eyes
  if(model==='sheep'&&!e.sheared&&MOB_TEX.sheep_fur){const F=mobMesh('sheep_fur',MOB_TEX.sheep_fur.h);const c=hexRGB(WOOL_TINT[e.color]||(e.color===-1?'#b02e26':'#ffffff'));gl.uniform4f(PT.u.tint,c[0],c[1],c[2],1);
    for(const n in F)drawMesh(F[n],mats[n],MOB_TEX.sheep_fur.tex);gl.uniform4f(PT.u.tint,1,1,1,1);}
  if(model==='wolf'&&e.owner&&MOB_TEX.wolf_collar&&PACK.mobs&&PACK.mobs.wolf_collar){gl.uniform4f(PT.u.tint,.85,.15,.15,1);for(const n of ['mane','body'])drawMesh(M[n],mats[n],MOB_TEX.wolf_collar.tex);gl.uniform4f(PT.u.tint,1,1,1,1);}
  if((model==='spider'||model==='enderman')&&e.deathT==null){const ek=model==='enderman'?'enderman_eyes':e.mob==='crystal_spider'?'crystal_spider_eyes':'spider_eyes';const ET=MOB_TEX[ek];if(ET&&PACK.mobs&&PACK.mobs[ek]){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.uniform1f(PT.u.bright,1.2);
    drawMesh(M.head,mats.head,ET.tex);gl.depthMask(true);gl.disable(gl.BLEND);}}
  gl.uniform1f(PT.u.hurt,0);
  if(e.fire>0&&e.deathT==null){useBox(VP,camPos);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.uniform1f(PB.u.lit,0);const w=e.hw*2.2,h=e.eh*.9;
    for(let i=0;i<3;i++)box(chain(M4.tr(rp[0],rp[1]+h*.5+Math.sin(perfT*9+i)*.15,rp[2]),M4.ry(perfT*2+i*2),M4.sc(w,h,w)),[1,.5+.2*i,.1],.18);gl.disable(gl.BLEND);gl.uniform1f(PB.u.lit,1);useTex(VP,camPos);}}
// ---------------- HUD: Mob Radar ----------------
function drawMobHUD(){const p=player;if(!p||!p.alive||!survival())return;const s=p.inv[p.sel];if(!s||s.id!=='mob_radar')return;
  const R=70,cx=W-R-24,cy=R+90;hc.save();hc.fillStyle='rgba(0,20,10,.6)';hc.beginPath();hc.arc(cx,cy,R,0,7);hc.fill();hc.strokeStyle='rgba(90,255,140,.7)';hc.lineWidth=2;hc.stroke();
  hc.strokeStyle='rgba(90,255,140,.25)';hc.beginPath();hc.arc(cx,cy,R/2,0,7);hc.stroke();hc.beginPath();hc.moveTo(cx-R,cy);hc.lineTo(cx+R,cy);hc.moveTo(cx,cy-R);hc.lineTo(cx,cy+R);hc.stroke();
  const sw=(perfT*2)%(Math.PI*2);hc.fillStyle='rgba(90,255,140,.12)';hc.beginPath();hc.moveTo(cx,cy);hc.arc(cx,cy,R,sw-.5,sw);hc.fill();
  const cs=Math.cos(p.yaw),sn=Math.sin(p.yaw);let nh=0,np=0;
  for(const m of mobs){if(!m.alive)continue;const dx=m.pos[0]-p.pos[0],dz=m.pos[2]-p.pos[2];const d=Math.hypot(dx,dz);if(d>32)continue;const T=MOB_T[m.mob];
    const rx=(dx*cs-dz*sn)/32*R,ry=(dx*sn+dz*cs)/32*R;const hostile=T.kind==='hostile'||(T.kind==='neutral'&&m.angry>0&&!m.owner);if(hostile)nh++;else np++;
    hc.fillStyle=m.owner?'#80d0ff':hostile?'#ff5050':'#70ff90';hc.beginPath();hc.arc(cx+rx,cy+ry,hostile?4:3,0,7);hc.fill();
    if(Math.abs(m.pos[1]-p.pos[1])>4){hc.fillStyle='#fff';hc.font='bold 10px sans-serif';hc.fillText(m.pos[1]>p.pos[1]?'+':'-',cx+rx+4,cy+ry-3);}}
  hc.fillStyle='#fff';hc.beginPath();hc.moveTo(cx,cy-6);hc.lineTo(cx+4,cy+4);hc.lineTo(cx-4,cy+4);hc.fill();hc.restore();
  txt(`${nh} hostile · ${np} other`,cx,cy+R+18,14,'#b8ffcc','center');}
// extra block drops in Survival: berries, peppers, flint, melon slices
function extraDrops(x,y,z,b,id){const at=[x+.5,y-.6,z+.5],v=()=>[(Math.random()-.5)*1.5,2.5,(Math.random()-.5)*1.5];
  if(b===B.FROZEN_LEAVES&&Math.random()<.08)requestDrop(at,'frost_berry',1,v());
  else if(b===B.DEAD_BUSH&&Math.random()<.4)requestDrop(at,'ember_pepper',1,v());
  else if(b===B.GRAVEL&&Math.random()<.12)requestDrop(at,'flint',1,v());
  else if(b===B.MELON)requestDrop(at,'melon_slice',2+(Math.random()*5|0),v());}
