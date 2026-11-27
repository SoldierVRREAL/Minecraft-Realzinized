// ================= The Poolrooms =================
// The game has a noclip glitch: now and then you end up inside a wall or under the world. That glitch stays, but now it takes you
// somewhere: the Poolrooms, an endless maze of white tiles, still water and humming lights. It is a dimension like the Nether
// (built from the seed the same way on every computer), so it works in multiplayer and its edits are saved with the world.
// Somewhere in each stretch of tiles there is a doorway under a green EXIT sign: walk through it to go back to where you were.
// You are not alone in there. The Watchers stand still while you look at them and come for you when you don't.
const POOL={F:32,CELL:10,EX:96,ret:null,safe:null,safeT:0,nc:0,glitch:0,going:false,time:0,spawnT:3,flash:0,ambT:6,hum:null,flick:0,flickT:20,scare:0,breath:0};
BIOMES.push({k:'poolrooms',name:'The Poolrooms',base:32,amp:0,sc:100,top:B.SAND,fill:B.SAND,trees:0,fog:[.6,.7,.68],sky:[.6,.7,.68]});BIO.poolrooms=BIOMES.length-1;
DIM_NAMES.pool='the Poolrooms';

// the tiles give off a soft light of their own, so the rooms are evenly bright like the real place (the ceiling lights add to it)
const POOL_GLOW=[8,10];
// ---------- blocks: small square tiles, beige floor tiles, ceiling lights, the exit doorway and its sign ----------
{let id=VB.lastId+1;
  const tile=(name,part)=>{TILE_PACK.push(name);const t=TILE_PACK.length-1;NEWT[t]={k:'pool',part};return t;};
  const tW=tile('~pool_tiles','wall'),tF=tile('~pool_floor','floor'),tL=tile('~pool_light','light'),tE=tile('~pool_exit','exit'),tA=tile('~pool_sign_ex','EX'),tB=tile('~pool_sign_it','IT'),tAm=tile('~pool_sign_ex_m','EXm'),tBm=tile('~pool_sign_it_m','ITm');
  const blk=(key,name,col,top,side,o)=>{def(id,top,side,top,o);if(name)BLOCK_NAMES[id]=name;BLOCK_COL[id]=col;B[key]=id;return id++;};
  blk('POOL_TILE','Pool Tiles','#d8ddd6',tW,tW,{poolB:true,light:POOL_GLOW[0]});
  blk('POOL_FLOOR','Beige Pool Tiles','#c8b298',tF,tF,{poolB:true,light:POOL_GLOW[1]});
  blk('POOL_LIGHT','Ceiling Light','#f4fafa',tL,tL,{poolB:true,light:15});
  blk('POOL_EXIT',null,'#06080c',tE,tE,{poolB:true,solid:false,opaque:false,light:9,poolExit:true});
  // the sign reads EXIT from both sides: the north faces show the other half of the word, mirrored, because they are seen from behind
  blk('POOL_SIGN_L',null,'#1d8a3e',tW,tW,{poolB:true,light:7,faces:[tW,tW,tW,tW,tA,tBm]});
  blk('POOL_SIGN_R',null,'#1d8a3e',tW,tW,{poolB:true,light:7,faces:[tW,tW,tW,tW,tB,tAm]});
  VB.lastId=id-1;
  for(const k of ['POOL_TILE','POOL_FLOOR','POOL_LIGHT']){const b=B[k];item('b'+b,{name:BLOCK_NAMES[b],type:'block',block:b,stack:64,color:BLOCK_COL[b]});MINE_T_X[b]=2.25;PICK_BLOCKS.add(b);}}
// the tiles, in the same 16x16 pixel style as the rest: a 4x4 grid of tiles with grout lines, each tile a slightly different shade
const PF_GLYPH={E:['111','100','110','100','111'],X:['101','101','010','101','101'],I:['111','010','010','010','111'],T:['111','010','010','010','010']};
function poolTilePx(part,x,y){const h=hash2;
  if(part==='wall'||part==='floor'){const ix=x&3,iy=y&3;const base=part==='wall'?[214,222,216]:[200,178,148],gr=part==='wall'?[184,194,188]:[166,146,120];
    if(ix===3||iy===3){const n=.94+h(x,y,9101)*.08;return [gr[0]*n|0,gr[1]*n|0,gr[2]*n|0,255];}
    let k=.93+h(x>>2,y>>2,9102)*.1+(h(x,y,9103)-.5)*.04;if(ix===0&&iy===0)k+=.04;if(ix===2||iy===2)k-=.025;
    return [Math.min(255,base[0]*k|0),Math.min(255,base[1]*k|0),Math.min(255,base[2]*k|0),255];}
  if(part==='light'){if(x===0||y===0||x===15||y===15)return [190,198,198,255];if(x===1||y===1||x===14||y===14)return [226,232,232,255];const n=h(x,y,9104)*5;return [250-n|0,253-n|0,253-n|0,255];}
  if(part==='exit'){const n=h(x,y,9105),v=4+n*9+(h(x,0,9106)>.8?6:0);return [v*.7|0,v|0,v*1.5|0,255];}
  if(x===0||y===0||x===15||y===15)return [14,56,28,255];
  if(part.length===3){x=15-x;part=part.slice(0,2);}
  const L=x<8?part[0]:part[1],lx=x<8?x-1:x-9,ly=y-3;if(lx>=0&&lx<6&&ly>=0&&ly<10&&PF_GLYPH[L][ly>>1][lx>>1]==='1')return [232,255,236,255];
  const n=h(x,y,9107)*.08;return [29*(1-n)|0,138*(1-n)|0,62*(1-n)|0,255];}
{const prev=procTile;procTile=function(t,x,y){const D=NEWT[t];if(!D||D.k!=='pool')return prev(t,x,y);return poolTilePx(D.part,x,y);};}
atlasCanvas=makeProcAtlas();try{reuploadAtlas();}catch(e){}
// they can't be broken inside the Poolrooms (they can anywhere else, if you bring some out in Creative)
{const m0=mineTime;mineTime=function(b,id){if(DIM==='pool'&&BD[b]&&BD[b].poolB)return null;return m0(b,id);};}

// ---------- the layout ----------
// Columns are worked out from their coordinates alone, so chunks fit together and every computer builds the same rooms.
// Three kinds of area, 48 blocks across: halls (7 high, pools), tall halls (13 high, pillars, ceilings hanging in blocks) and low tiled corridors.
function poolReg(cx,cz){const i=Math.floor(cx*POOL.CELL/48),j=Math.floor(cz*POOL.CELL/48);const r=hash2(i,j,WSEED+9110);return r<.42?0:r<.78?1:2;}
// one exit in every 96x96 stretch
function poolExitOf(i,j){const C=POOL.CELL,E=POOL.EX;const cx=Math.floor((i*E+16+hash2(i,j,WSEED+9120)*(E-32))/C),cz=Math.floor((j*E+16+hash2(i,j,WSEED+9121)*(E-32))/C);return {x:cx*C+4,z:cz*C+5};}
function poolExitNear(x,z){const i=Math.floor(x/POOL.EX),j=Math.floor(z/POOL.EX);let best=null,bd=1e18;for(let b=j-1;b<=j+1;b++)for(let a=i-1;a<=i+1;a++){const e=poolExitOf(a,b);const d=(e.x-x)**2+(e.z-z)**2;if(d<bd){bd=d;best=e;}}return best;}
function poolCol(x,z,o){const C=POOL.CELL,cx=Math.floor(x/C),cz=Math.floor(z/C),u=x-cx*C,v=z-cz*C,reg=poolReg(cx,cz),S=WSEED+9130;
  o.reg=reg;o.h=[7,13,4][reg];o.wall=0;o.open=0;o.pool=0;o.pillar=false;o.drop=0;o.light=false;o.ex=null;
  const wc=[.38,.16,.72][reg],ww=reg===1?4:3,oh=reg===1?7:3;
  // walls on a cell's west and north edges, each with a doorway
  if(u===0&&hash3(cx,cz,1,S)<wc){o.wall=1;const d=1+Math.floor(hash3(cx,cz,2,S)*(C-ww-1));if(v>=d&&v<d+ww)o.open=oh;}
  if(v===0&&hash3(cx,cz,3,S)<wc){const d=1+Math.floor(hash3(cx,cz,4,S)*(C-ww-1));const op=u>=d&&u<d+ww?oh:0;if(!o.wall){o.wall=1;o.open=op;}else o.open=Math.min(o.open,op);}
  // pillars at the corners
  if(!o.wall&&reg!==2){const pw=reg===1?2:1;if(u<pw&&v<pw&&hash3(cx,cz,5,S)<(reg===1?.75:.4))o.pillar=true;}
  // pools: blocky shapes from a coarse noise
  if(!o.wall&&!o.pillar){const n=fbm(Math.floor(x/3)/4.5,Math.floor(z/3)/4.5,S+6,2);if(n>[.6,.6,.68][reg])o.pool=reg===1?5:3;}
  // in the tall halls, parts of the ceiling hang down
  if(reg===1&&u>=2&&u<=C-3&&v>=2&&v<=C-3&&hash3(cx,cz,7,S)<.42)o.drop=4+Math.floor(hash3(cx,cz,8,S)*4);
  // ceiling lights: 2x1 panels every 5 blocks
  const mx=((x%5)+5)%5,mz=((z%5)+5)%5;if((mx===1||mx===2)&&mz===2)o.light=true;
  // the exit: a short wall standing on its own with a dark doorway in it and an EXIT sign above
  const e=poolExitNear(x,z),dx=x-e.x,dz=z-e.z;if(dx>=-4&&dx<=5&&dz>=-3&&dz<=3){o.wall=0;o.open=0;o.pillar=false;o.pool=0;o.drop=0;o.h=Math.max(o.h,7);o.ex=[dx,dz];}
  return o;}
const PCOL={};
function genPool(cx,cz){const x0=cx*16,z0=cz*16;genCX=cx;genCZ=cz;const F=POOL.F;
  for(let y=0;y<WY;y++){const row=y*WZ;for(let lz=0;lz<16;lz++){const o=(row+((z0+lz)&ZM))*WX+(x0&XM);world.fill(0,o,o+16);light.fill(0,o,o+16);}}
  for(let i=0;i<256;i++){GB[i]=BIO.poolrooms;GH[i]=F;GU[i]=0;GBE[i]=0;GL[i]=-1;}
  const T=B.POOL_TILE,FL=B.POOL_FLOOR,LI=B.POOL_LIGHT,WA=B.WATER;
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz;const o=poolCol(x,z,PCOL);const ceil=F+o.h-o.drop;
    world[idx(x,0,z)]=B.BEDROCK;for(let y=1;y<F;y++)world[idx(x,y,z)]=T;
    if(o.pool){for(let y=F-1-o.pool;y<=F-2;y++)world[idx(x,y,z)]=WA;world[idx(x,F-1,z)]=0;}else world[idx(x,F-1,z)]=FL;
    for(let y=ceil;y<=F+18;y++)world[idx(x,y,z)]=T;if(o.light)world[idx(x,ceil,z)]=LI;
    if(o.wall||o.pillar)for(let y=F;y<ceil;y++)world[idx(x,y,z)]=o.wall&&y<F+o.open?0:T;
    if(o.ex){const [dx,dz]=o.ex;if(dz===0&&dx>=-2&&dx<=3){for(let y=F;y<F+5&&y<ceil;y++)world[idx(x,y,z)]=T;
      if(dx===0||dx===1){world[idx(x,F,z)]=B.POOL_EXIT;world[idx(x,F+1,z)]=B.POOL_EXIT;world[idx(x,F+2,z)]=dx===0?B.POOL_SIGN_L:B.POOL_SIGN_R;}}}}
  finishChunk(cx,cz);}
{const g0=genChunk;genChunk=function(cx,cz){if(DIM==='pool'){if(structSeed!==WSEED)structReset();return genPool(cx,cz);}return g0(cx,cz);};}
{const b0=biomeAt;biomeAt=function(x,z){if(INF&&DIM==='pool')return BIO.poolrooms;return b0(x,z);};}
{const m0=dimMapInfo;dimMapInfo=function(dim){if(dim!=='pool')return m0(dim);const sp=SURV.spawn||[0,70,0];
  return {id:'survival',survival:true,skyLight:false,sky:[.6,.7,.68],fog:[.6,.7,.68],fogDist:46,voidY:-64,spawns:[[sp[0],sp[1],sp[2],0]],central:[],center:null,dim:'pool'};};}
// a random dry, open spot far from 0,0 and at least 40 blocks from an exit
function poolArrival(){const F=POOL.F,o={};const free=(x,z)=>{poolCol(x,z,o);return !(o.wall||o.pillar||o.pool||o.ex||o.h-o.drop<3);};
  for(let k=0;k<600;k++){const a=Math.random()*6.283,r=300+Math.random()*2700;const x=Math.floor(Math.cos(a)*r),z=Math.floor(Math.sin(a)*r);
    if(!free(x,z)||!free(x+1,z)||!free(x-1,z)||!free(x,z+1)||!free(x,z-1))continue;const e=poolExitNear(x,z);if(Math.hypot(e.x-x,e.z-z)<40)continue;return [x+.5,F,z+.5];}
  return [5.5,F,5.5];}

// ---------- getting in: the noclip glitch ----------
// Your eyes inside a solid block for a moment, or falling out of the bottom of the Overworld, and reality lets go.
function poolInside(p){const y=eye(p)[1]-.05;const b=getB(Math.floor(p.pos[0]),Math.floor(y),Math.floor(p.pos[2]));const D=b&&BD[b];
  return !!(D&&D.solid&&D.opaque&&!D.shape&&!D.col&&!D.liquid&&!D.poolB&&b!==B.BARRIER);}
function poolGlitch(){if(POOL.going||POOL.glitch>0)return;POOL.glitch=.9;POOL.fx=1;
  if(actx){try{for(let i=0;i<6;i++)setTimeout(()=>{if(!actx)return;tone('square',200+Math.random()*1800,60+Math.random()*200,.07,.05);noiseHit(.12,800+Math.random()*3000,2,.12,'bandpass');},i*110);tone('sawtooth',90,30,.9,.06);}catch(e){}}}
function poolEnter(){const p=player;if(!p||POOL.going)return;POOL.going=true;
  POOL.ret={dim:POOL.safeDim||DIM,pos:(POOL.safe&&POOL.safeDim===DIM?POOL.safe:p.pos).slice()};if(POOL.ret.pos[1]<1)POOL.ret.pos=(SURV.bedSpawn||SURV.spawn).slice();
  const to=poolArrival();POOL.time=0;
  travelTo('pool',to,{after:()=>{p.pos=to.slice();p.vel=[0,0,0];p.mot=[0,0,0];p.fallDist=0;GZ.tp=perfT;POOL.going=false;}});
  $('loadTitle').textContent='You noclipped out of reality';}
function poolLeave(){const p=player;if(!p||POOL.going)return;POOL.going=true;const r=POOL.ret||{dim:'overworld',pos:(SURV.bedSpawn||SURV.spawn).slice()};POOL.ret=null;POOL.flash=1.2;
  travelTo(r.dim,r.pos,{after:()=>{p.pos=r.pos.slice();p.vel=[0,0,0];p.mot=[0,0,0];p.fallDist=0;GZ.tp=perfT;POOL.going=false;}});$('loadTitle').textContent='Waking up';}
function poolTick(dt){const p=player;
  if(POOL.glitch>0){POOL.glitch-=dt;if(POOL.glitch<=0)poolEnter();}
  if(!p||!p.alive||!INF||MATCH.mode!=='survival'||SURV.loading||p.spectator||p.bat){POOL.nc=0;return;}
  if(DIM==='pool'){POOL.time+=dt;const x=Math.floor(p.pos[0]),y=Math.floor(p.pos[1]+.2),z=Math.floor(p.pos[2]);
    if(getB(x,y,z)===B.POOL_EXIT||getB(x,y+1,z)===B.POOL_EXIT)poolLeave();return;}
  POOL.safeT-=dt;if(POOL.safeT<=0&&p.onGround&&!poolInside(p)&&p.pos[1]>2){POOL.safeT=.5;POOL.safe=p.pos.slice();POOL.safeDim=DIM;}
  if(perfT-(GZ.tp||-99)<2.5||(typeof vehicleOf==='function'&&vehicleOf(p))){POOL.nc=0;return;}
  const fell=DIM==='overworld'&&p.pos[1]<-4&&p.gm!=='creative';
  if(poolInside(p))POOL.nc+=dt;else POOL.nc=Math.max(0,POOL.nc-dt*2);
  if(POOL.nc>.6||fell){POOL.nc=0;if(fell){POOL.glitch=.01;POOL.fx=.6;}else poolGlitch();}}
{const t0=survTick;survTick=function(dt){t0(dt);try{poolTick(dt);}catch(e){console.error(e);}};}
// dying in there sends you home as usual (to your bed or the spawn), and the way back is forgotten
{const r0=survRespawn;survRespawn=function(){if(DIM==='pool')POOL.ret=null;return r0();};}
XSAVE.push({save:d=>{d.poolRet=POOL.ret;},reset:()=>{POOL.ret=null;POOL.going=false;POOL.glitch=0;},load:o=>{POOL.ret=o.poolRet||null;POOL.going=false;}});

// ---------- how it looks and sounds ----------
{const u0=updateEnv;updateEnv=function(dt){u0(dt);if(!INF||MATCH.mode!=='survival'||DIM!=='pool')return;
  // now and then the lights flicker
  POOL.flickT-=dt;if(POOL.flickT<=0){POOL.flickT=18+Math.random()*30;POOL.flick=.5+Math.random()*.7;if(actx)try{noiseHit(.25,3000,1,.04,'highpass');}catch(e){}}
  let fl=1;if(POOL.flick>0){POOL.flick-=dt;fl=Math.random()<.35?.35+Math.random()*.3:1;}
  const f=[.62*fl,.72*fl,.7*fl];ENV.zen=f.slice();ENV.hor=f.slice();ENV.fog=f.slice();ENV.glow=0;ENV.night=0;ENV.sunStr=0;ENV.sunCol=[0,0,0];ENV.skyL=[.3,.33,.33];
  ENV.blkL=[.98*fl,1.04*fl,1.03*fl];ENV.amb=.3*fl;SKYMUL=0;const far=Math.max(24,Math.min(infRD,infMaxRD())*16-6);ENV.fogN=4;ENV.fogF=Math.min(far,46);
  const ib=getB(Math.floor(camPos[0]),Math.floor(camPos[1]),Math.floor(camPos[2]));if(ib===B.WATER){ENV.fog=[.16,.36,.38];ENV.fogN=0;ENV.fogF=11;}};}
// the hum of the lights, water lapping, drips, far-off splashes
function poolAmbience(dt){const inPool=INF&&DIM==='pool'&&MATCH.state==='play'&&!SURV.loading&&actx&&!(paused&&!online);
  if(!inPool){if(POOL.hum){try{POOL.hum.g.gain.setTargetAtTime(0,actx.currentTime,.3);const h=POOL.hum;setTimeout(()=>{try{h.o1.stop();h.o2.stop();}catch(e){}},1500);}catch(e){}POOL.hum=null;}return;}
  if(!POOL.hum){try{const g=actx.createGain(),f=actx.createBiquadFilter(),o1=actx.createOscillator(),o2=actx.createOscillator();f.type='lowpass';f.frequency.value=520;
      o1.type='sawtooth';o1.frequency.value=120;o2.type='sine';o2.frequency.value=60;const g2=actx.createGain();g2.gain.value=.5;o1.connect(f);o2.connect(g2);g2.connect(g);f.connect(g);g.gain.value=0;g.connect(masterOut||actx.destination);
      o1.start();o2.start();g.gain.setTargetAtTime(.022,actx.currentTime,1.5);POOL.hum={g,o1,o2};}catch(e){}}
  else{try{POOL.hum.g.gain.setTargetAtTime(POOL.flick>0&&Math.random()<.5?.004:.022,actx.currentTime,.05);}catch(e){}}
  POOL.ambT-=dt;if(POOL.ambT<=0){POOL.ambT=5+Math.random()*10;const r=Math.random();const p=camPos;const far=()=>[p[0]+(Math.random()-.5)*28,p[1],p[2]+(Math.random()-.5)*28];
    try{if(r<.45){const t=actx.currentTime;tone('sine',1500+Math.random()*900,700,.09,.025);setTimeout(()=>{try{tone('sine',1300+Math.random()*700,650,.08,.012);}catch(e){}},180);}
      else if(r<.75)psnd(['liquid/splash'],far(),.25,.5+Math.random()*.2)||noiseHit(.6,500,1,.03,'lowpass');
      else if(r<.9)psnd(['ambient/cave/cave'],far(),.35,.8);
      else{noiseHit(2.5,180,.8,.05,'lowpass');}}catch(e){}}}

// creatures, players and held items: the rooms are lit all over, so they are too (the usual light curve would leave them in shadow)
const poolEntL=p=>{const x=Math.floor(p[0]),z=Math.floor(p[2]),y=Math.floor(p[1]+.5);const L=Math.max(lightAt(x,y,z)&15,lightAt(x,y+1,z)&15);return Math.min(1.05,.5+LB[L]*1.4);};
{const s0=setEntLight;setEntLight=function(p){if(INF&&DIM==='pool'&&p){gl.uniform1f(PT.u.bright,poolEntL(p));return;}return s0(p);};}
{const b0=mobBright;mobBright=function(e){if(INF&&DIM==='pool')return poolEntL(e.rpos||e.pos);return b0(e);};}
// ---------- the Watchers ----------
MOB_T.faceling={name:'Watcher',hp:30,hw:.35,eh:2.6,model:'zombie',kind:'hostile',spd:.4,chase:1.2,dmg:7,drops:[['bone',0,2]],col:'#56606c',fireproof:true,noEgg:true};
MOB_TYPES.push('faceling');
MOB_SND.faceling={hurt:['mob/endermen/hit','mob/enderman/hit'],death:['mob/endermen/death','mob/enderman/death']};
// is p looking at this point (on screen, nothing in between)?
function pfSeenPos(p,pos){const o=eye(p),f=fwd(p);const c=[pos[0]-o[0],pos[1]+1.9-o[1],pos[2]-o[2]];const L=Math.hypot(c[0],c[1],c[2])||1;if((f[0]*c[0]+f[1]*c[1]+f[2]*c[2])/L<.8)return false;
  return canSee({pos,eh:2.6},p);}
function pfVanish(e){spawnParticles(e.pos[0],e.pos[1]+1.3,e.pos[2],30,[.08,.1,.12],1.6,'poof');e.alive=false;e.gone=true;}
function pfUpdate(e,dt){if(!chunkReadyAt(e.pos[0],e.pos[2])){e.rpos=e.pos;return;}
  e.fire=0;tickEffects(e,dt);if(!e.alive)return;e.eh=2.6;e.atkCD=Math.max(0,(e.atkCD||0)-dt);
  const S=e.pf||(e.pf={look:0,rush:0});const T=nearestPlayer(e,56);let wx=0,wz=0,spd=.35;e.sneak=false;e.jump=false;
  if(T){const dx=T.pos[0]-e.pos[0],dz=T.pos[2]-e.pos[2],hd=Math.hypot(dx,dz);const seen=pfSeenPos(T,e.pos);
    if(seen&&S.rush<=0){S.look+=dt;spd=0;if(S.look>6.5&&hd<15){S.rush=2.2;S.look=0;}}
    else{S.look=Math.max(0,S.look-dt*.5);spd=hd>20?1.6:1.2;}
    if(S.rush>0){S.rush-=dt;spd=1.7;}
    if(spd>0){wx=dx;wz=dz;}
    // far away and unseen, it is suddenly closer
    if(!seen&&hd>28&&Math.random()<dt*.12){for(let k=0;k<8;k++){const a=Math.random()*6.283,r=12+Math.random()*6;const x=Math.floor(T.pos[0]+Math.cos(a)*r),z=Math.floor(T.pos[2]+Math.sin(a)*r);
      if(!chunkReadyAt(x,z)||!floorOk(x,POOL.F,z)||!openAt(x,POOL.F+2,z)||pfSeenPos(T,[x+.5,POOL.F,z+.5]))continue;e.pos=[x+.5,POOL.F,z+.5];e.rpos=e.pos.slice();break;}}
    if(hd<1.5+e.hw&&Math.abs(T.pos[1]-e.pos[1])<2.2&&e.atkCD<=0){e.atkCD=3;damage(T,Math.max(2,MOB_T.faceling.dmg*diffMul()),e,'melee',[dx,dz,0,0,0],false);pfVanish(e);return;}
    const want=Math.atan2(-dx,-dz);e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dt*(spd>0?6:2));e.headYaw=e.bodyYaw;e.yaw=e.headYaw;
    const fy=(T.pos[1]+1.5)-(e.pos[1]+2.3);e.pitch=clamp(Math.atan2(fy,hd),-.8,.8);}
  else{e.ai.wt=(e.ai.wt||0)-dt;if(!e.ai.goal||e.ai.wt<=0){e.ai.wt=4+Math.random()*6;e.ai.goal=Math.random()<.4?null:[e.pos[0]+(Math.random()-.5)*14,0,e.pos[2]+(Math.random()-.5)*14];}
    if(e.ai.goal){wx=e.ai.goal[0]-e.pos[0];wz=e.ai.goal[2]-e.pos[2];if(Math.hypot(wx,wz)<.8)wx=wz=0;}
    if(wx||wz){e.bodyYaw+=angTo(e.bodyYaw,Math.atan2(-wx,-wz))*Math.min(1,dt*4);e.headYaw=e.yaw=e.bodyYaw;}}
  const L=Math.hypot(wx,wz);if(L>.01){wx/=L;wz/=L;}if((wx||wz)&&e.collidedH&&e.onGround)e.jump=true;if(e.inWater)e.jump=true;
  e.spdK=spd;physics(e,dt,wx,wz);}
{const u0=updateMob;updateMob=function(e,dt){if(e.mob==='faceling')return pfUpdate(e,dt);return u0(e,dt);};}
// spawning (whoever runs the creatures in this dimension): more of them the longer you stay
function poolSpawn(dt){POOL.spawnT-=dt;if(POOL.spawnT>0)return;POOL.spawnT=4;if(sDiff()===0)return;
  const players=ents.filter(e=>e.kind==='player'&&e.alive&&!e.spectator&&e.gm!=='creative'&&!e.bat);if(!players.length)return;
  const have=mobs.filter(m=>m.alive&&m.mob==='faceling').length;const want=Math.min(4,1+Math.floor(POOL.time/75));if(have>=want)return;
  const p=players[Math.random()*players.length|0];const F=POOL.F;
  for(let k=0;k<16;k++){const a=Math.random()*6.283,r=26+Math.random()*18;const x=Math.floor(p.pos[0]+Math.cos(a)*r),z=Math.floor(p.pos[2]+Math.sin(a)*r);if(!chunkReadyAt(x,z))continue;
    if(!floorOk(x,F,z)||!openAt(x,F+2,z))continue;if(players.some(q=>hdist(q.pos,[x,0,z])<20||pfSeenPos(q,[x+.5,F,z+.5])))continue;
    spawnMob('faceling',[x+.5,F,z+.5]);return;}}
{const s0=mobSpawnTick;mobSpawnTick=function(dt){if(DIM==='pool')return poolSpawn(dt);return s0(dt);};}

// ---------- drawing a Watcher: a tall, thin, pale body, and that face ----------
const PFI={img:null,scare:null,M:null};
{const a=new Image();a.onload=()=>{PFI.img=a;PFI.M=null;};a.src=PF_FACE;const b=new Image();b.onload=()=>{PFI.scare=b;};b.src=PF_SCARE;}
function pfSkin(){const c=mkCanvas(64,64),g=c.getContext('2d');
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=hash2(x,y,9140),m=hash2(x>>1,y>>1,9141);let l=.5+n*.12+m*.1;if(hash2(x,y,9142)>.94)l-=.18;
    g.fillStyle=`rgb(${150*l*1.5|0},${160*l*1.5|0},${174*l*1.5|0})`;g.fillRect(x,y,1,1);}
  // ribs and joints: darker lines
  g.fillStyle='rgba(30,38,50,.5)';for(let i=0;i<4;i++)g.fillRect(20,22+i*3,8,1);g.fillRect(40,28,2,1);g.fillRect(48,26,3,1);return c;}
function pfMeshes(){if(PFI.M)return PFI.M;const A=f=>{const o=[];f(o);return meshFrom(o);};
  const M={tex:mkTex(pfSkin()),
    head:A(o=>boxUV(o,-4.5,0,-4,9,12,8,0,0,64,64)),torso:A(o=>boxUV(o,-4,0,-2,8,13,4,16,16,64,64)),neck:A(o=>boxUV(o,-1.5,0,-1.5,3,4,3,40,0,64,64)),
    rarm:A(o=>boxUV(o,-1,-24,-1,2,24,2,40,16,64,64)),larm:A(o=>boxUV(o,-1,-24,-1,2,24,2,40,16,64,64,0,true)),
    rleg:A(o=>boxUV(o,-1.25,-20,-1.25,2.5,20,2.5,48,16,64,64)),lleg:A(o=>boxUV(o,-1.25,-20,-1.25,2.5,20,2.5,48,16,64,64,0,true))};
  if(PFI.img){const w=PFI.img.width,h=PFI.img.height;const c=mkCanvas(w*2,h),g=c.getContext('2d');g.drawImage(PFI.img,0,0);
    // brighten it a little so it shows up under the lights, and make the soft edge either there or not
    const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){d.data[i]=Math.min(255,d.data[i]*1.25);d.data[i+1]=Math.min(255,d.data[i+1]*1.25);d.data[i+2]=Math.min(255,d.data[i+2]*1.25);d.data[i+3]=d.data[i+3]>110?255:0;}g.putImageData(d,0,0);
    M.ftex=mkTex(c);M.face=A(o=>boxUV(o,-5.5,-2,0,11,15.5,0,0,0,22,15.5));}
  return PFI.M=M;}
function pfDraw(e){const M=pfMeshes();limbTick(e);const rp=e.rpos||e.pos,by=e.bodyYaw==null?e.yaw:e.bodyYaw;
  const tilt=e.deathT!=null?Math.min(1,Math.sqrt(e.deathT*1.8))*HP2:0;const S=.88;
  const base=chain(M4.tr(rp[0],rp[1],rp[2]),M4.ry(by),M4.rz(tilt),M4.sc(S,S,S));
  const ls=(e.limbSwing||0)*.6662,la=Math.min(1,e.limbAmt||0);const hY=-((e.headYaw==null?e.yaw:e.headYaw)-by),hX=-(e.pitch||0);
  const P=(x,y,z,X,Y,Z)=>[M4.tr(x/16,y/16,z/16),M4.rz(Z),M4.ry(-Y),M4.rx(-X)];
  const sway=Math.sin(perfT*1.1+e.id.length)*.06,still=la<.05;const cock=still?.28+Math.sin(perfT*.4)*.04:Math.sin(perfT*3)*.05;
  const body=chain(base,M4.tr(0,20/16,0),M4.rx(-.08));const neck=chain(body,...P(0,13,0,0,0,0));const head=chain(neck,...P(0,3.6,0,hX,hY,cock));
  const reach=la>.8?.5:0;
  const parts={torso:body,neck,head,rarm:chain(body,...P(5,12.5,0,Math.cos(ls+Math.PI)*.7*la-reach+sway,0,.05)),larm:chain(body,...P(-5,12.5,0,Math.cos(ls)*.7*la-reach-sway,0,-.05)),
    rleg:chain(base,...P(1.6,20,0,Math.cos(ls)*1.1*la,0,0)),lleg:chain(base,...P(-1.6,20,0,Math.cos(ls+Math.PI)*1.1*la,0,0))};
  setEntLight(e.pos);gl.uniform1f(PT.u.hurt,e.hurtT>0||e.deathT!=null?1:0);
  for(const k of ['torso','neck','head','rarm','larm','rleg','lleg'])drawMesh(M[k],parts[k],M.tex);
  if(M.face){gl.uniform1f(PT.u.bright,Math.max(.8,mobBright(e)));drawMesh(M.face,chain(head,M4.tr(0,6/16,-4.15/16)),M.ftex);}
  gl.uniform1f(PT.u.hurt,0);}
{const d0=drawMob;drawMob=function(e){if(e.mob==='faceling'){if(!e.gone)pfDraw(e);return;}return d0(e);};}

// ---------- the scare when one reaches you ----------
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ii){const r=h0(e,amt,src,cause,kb,raw,ii);if(r&&e===player&&src&&src.mob==='faceling')pfScare();return r;};}
function pfScare(){POOL.scare=1.5;GZ.shake=Math.max(GZ.shake||0,1.2);
  if(typeof ndPlay==='function'&&actx)try{ndPlay({vol:1,rate:.8,fade:.02});}catch(e){}
  if(actx)try{tone('sawtooth',160,40,1.2,.12);noiseHit(1.2,900,.7,.35,'bandpass',.3);}catch(e){}}
// its breathing when one is close and you can't see it
function pfNear(dt){if(DIM!=='pool'||!player||!actx)return;let best=99;for(const m of mobs)if(m.alive&&m.mob==='faceling')best=Math.min(best,dist(m.pos,player.pos));
  if(best<14){POOL.breath-=dt;if(POOL.breath<=0){POOL.breath=1.6+best*.15;try{noiseHit(.9,300+Math.random()*80,1.2,.05*(1-best/14)+.01,'bandpass');}catch(e){}}}}
{const h0=drawHUD;drawHUD=function(){h0();const dt=Math.min(.1,dtFrame||.016);try{poolAmbience(dt);pfNear(dt);}catch(e){}
  // the glitch: the screen tears and buzzes
  if(POOL.fx>0){POOL.fx-=dt;hc.save();for(let i=0;i<14;i++){const y=Math.random()*H,h=4+Math.random()*30;hc.globalAlpha=.25+Math.random()*.5;hc.fillStyle=Math.random()<.5?'#000':['#e8f0ec','#7fd8c8','#ff3050'][Math.random()*3|0];
      hc.fillRect((Math.random()-.5)*60,y,W,h);}if(POOL.fx<.35){hc.globalAlpha=1-POOL.fx/.35;hc.fillStyle='#000';hc.fillRect(0,0,W,H);}hc.restore();}
  if(POOL.flash>0){POOL.flash-=dt;hc.save();hc.globalAlpha=Math.min(1,POOL.flash);hc.fillStyle='#ffffff';hc.fillRect(0,0,W,H);hc.restore();}
  if(POOL.scare>0){POOL.scare-=dt;hc.save();hc.fillStyle='#000';hc.fillRect(0,0,W,H);const im=PFI.scare;
    if(im){const s=Math.max(W,H)*1.05*(1+(1.5-POOL.scare)*.12),j=()=>(Math.random()-.5)*W*.05;hc.globalAlpha=Math.random()<.15?.55:1;hc.drawImage(im,(W-s)/2+j(),(H-s)/2+j(),s,s);}
    if(Math.random()<.3){hc.globalAlpha=.3;hc.fillStyle='#08303a';hc.fillRect(0,0,W,H);}hc.restore();}};}

// creatures need their own icons nowhere; blocks need icons and the atlas was rebuilt above
rebuildIcons();rebuildItemAtlas();
