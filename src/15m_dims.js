// ================= Dimensions: travelling between the Overworld, the Nether and the End; portals; saving all three =================
// Only one dimension is loaded at a time (the chunk ring). The others keep their edits, chests, furnaces and dropped items here.
const DIMS=['overworld','nether','end'];
const DIMDATA={};   // dim -> {edits:Map, chests:Map, furn:Map, drops:[]}  (the current dimension lives in the usual globals)
let hostDim='overworld',DRAGON_STATE={killed:false,crystals:0,egg:false,seen:false},START_EXTRA=null;
const PORTAL_IDS=()=>[B.PORTAL_X,B.PORTAL_Z];
function dimLive(dim){if(dim===DIM)return {edits:worldEdits,chests,furn:FURN,drops};return DIMDATA[dim]||(DIMDATA[dim]={edits:new Map(),chests:new Map(),furn:new Map(),drops:[]});}
function dimResetAll(){for(const d of DIMS)DIMDATA[d]={edits:new Map(),chests:new Map(),furn:new Map(),drops:[]};DIM='overworld';hostDim='overworld';DRAGON_STATE={killed:false,crystals:0,egg:false,seen:false};}
// someone else is the host, and they are in another dimension: run my dimension's creatures and drops here
function dimLocal(){return !!net&&!net.isHost()&&MATCH.mode==='survival'&&DIM!==hostDim;}
function dropAuth(){return isHost()||dimLocal();}
function dimWY(dim){return dim==='overworld'?(GENV>=2?160:128):128;}
const DIM_NAMES={overworld:'the Overworld',nether:'the Nether',end:'the End'};
function dimMapInfo(dim){const sp=SURV.spawn||[0,70,0];
  if(dim==='nether')return {id:'survival',survival:true,skyLight:false,sky:[.2,.03,.02],fog:[.24,.04,.03],fogDist:90,voidY:-64,spawns:[[sp[0],sp[1],sp[2],0]],central:[],center:null,dim};
  if(dim==='end')return {id:'survival',survival:true,skyLight:true,sky:[.05,.03,.07],fog:[.06,.04,.08],fogDist:160,voidY:-64,spawns:[[sp[0],sp[1],sp[2],0]],central:[],center:null,dim};
  return {id:'survival',survival:true,skyLight:true,sky:[.5,.7,1],fog:[.7,.8,1],fogDist:160,voidY:-64,spawns:[[sp[0],sp[1],sp[2],0]],central:[],center:null,dim:'overworld'};}

// ---------- starting, saving and joining ----------
{const b0=beginSurvival;beginSurvival=function(o){const X=START_EXTRA||{};START_EXTRA=null;
    dimResetAll();GENV=o.gen!=null?o.gen:X.gen!=null?X.gen:2;INF_WY=dimWY('overworld');structSeed=null;lootDone.clear();
    b0(o);
    const dims=o.dims||X.dims||{};for(const d of ['nether','end']){const s=dims[d];if(!s)continue;const L=dimLive(d);L.edits=editsFromJSON(s.edits);for(const [k,items] of s.chests||[]){const [x,y,z]=k.split(',').map(Number);L.chests.set(k,{x,y,z,rot:null,lid:0,lidPrev:0,items});}L.furn=new Map(s.furn||[]);}
    if(o.dragon||X.dragon)DRAGON_STATE=Object.assign(DRAGON_STATE,o.dragon||X.dragon);
    SURV.bedSpawn=o.bed||X.bed||null;XP.total=(o.me&&o.me.xp)||0;xpRecalc();
    if(X.hdm)hostDim=X.hdm;
    const want=(o.me&&o.me.dim)||X.dim;if(want&&want!=='overworld'&&DIMS.includes(want))travelTo(want,player.pos.slice(),{quiet:true});};}
{const a0=survApplyStart;survApplyStart=function(d){START_EXTRA={gen:d.gen!=null?d.gen:1,dims:d.dims,dragon:d.dragon,hdm:d.hdm||'overworld',dim:d.me&&d.me.dim};return a0(d);};}
function editsMapJSON(m){const o={};for(const [k,mm] of m){if(!mm.size)continue;const a=[];for(const [i,b] of mm)a.push(i,b);o[k]=a;}return o;}
function survSaveExtra(data){const ow=dimLive('overworld');data.gen=GENV;data.edits=editsMapJSON(ow.edits);data.chests=[...ow.chests].map(([k,c])=>[k,c.items]);data.furn=[...ow.furn];
  data.dims={};for(const d of ['nether','end']){const L=dimLive(d);data.dims[d]={edits:editsMapJSON(L.edits),chests:[...L.chests].map(([k,c])=>[k,c.items]),furn:[...L.furn]};}
  data.dragon=DRAGON_STATE;data.bed=SURV.bedSpawn||null;if(data.player){data.player.dim=DIM;data.player.xp=XP.total;}}
{const s0=survSnapshot;survSnapshot=function(jid){const s=s0(jid);const ow=dimLive('overworld');s.gen=GENV;s.edits=editsMapJSON(ow.edits);s.chests=[...ow.chests].map(([k,c])=>[k,c.items]);
    s.dims={};for(const d of ['nether','end']){const L=dimLive(d);s.dims[d]={edits:editsMapJSON(L.edits),chests:[...L.chests].map(([k,c])=>[k,c.items])};}s.dragon=DRAGON_STATE;s.hdm=DIM;
    if(DIM!=='overworld')s.drops=[];return s;};}
// the chunk ring is rebuilt for a new render distance: keep this dimension's chests
{const r0=restartSurvivalStream;restartSurvivalStream=function(){const c=chests,f=FURN;r0();chests=c;FURN=f;};}

// ---------- travelling ----------
// pos: where to arrive (approximate); opt.after(): runs once the chunks there are ready (builds or finds the portal, the End platform...)
function travelTo(dim,pos,opt={}){if(!INF||!player)return;
  DIMDATA[DIM]={edits:worldEdits,chests,furn:FURN,drops:drops.filter(d=>d.did>0||!net)};const D=DIMDATA[dim]||{edits:new Map(),chests:new Map(),furn:new Map(),drops:[]};
  if(chestOpen)chestClose(false);if(typeof CR!=='undefined'&&CR.open)craftClose();
  mobs=[];primed=[];projs=[];particles=[];mining=null;EYES.length=0;XPORBS.length=0;FLUIDQ.clear();FIREQ.clear();
  DIM=dim;INF_WY=dimWY(dim);
  infInit(infRingFor(OPT.chunks),WSEED,D.edits);infRD=Math.min(OPT.chunks,infMaxRD());
  chests=D.chests;FURN=D.furn;drops=D.drops||[];DIMDATA[dim]=null;delete DIMDATA[dim];
  mapInfo=dimMapInfo(dim);
  for(const e of ents.slice())if(e!==player&&e.kind==='player'){AWAY.set(e.id,e);}ents=ents.filter(e=>e===player||e.kind!=='player');
  player.pos=pos.slice();player.vel=[0,0,0];player.mot=[0,0,0];player.fallDist=0;player.fire=0;
  SURV.loading=true;SURV.afterLoad=opt.after||null;SURV.lastBiome=-1;PORTAL.t=0;PORTAL.cd=3;PORTAL.needExit=true;
  if(!opt.quiet){$('loadTitle').textContent=dim==='nether'?'Entering the Nether':dim==='end'?'Entering the End':'Returning to the Overworld';}else $('loadTitle').textContent='Loading world';
  $('loadBar').style.width='0%';$('loading').classList.remove('hidden');
  stateFullT=0;if(net)sendMyState(1);
  if(dim==='end'&&!opt.quiet&&!DRAGON_STATE.seen){DRAGON_STATE.seen=true;}}
{const t0=survTick;survTick=function(dt){const was=SURV.loading;t0(dt);if(was&&!SURV.loading&&SURV.afterLoad){const f=SURV.afterLoad;SURV.afterLoad=null;try{f();}catch(e){console.error(e);}if(player)settlePlayer(player);}
    if(!SURV.loading&&INF)dimTick(dt);};}
// death sends you home
{const r0=survRespawn;survRespawn=function(){r0();const p=player;if(!p)return;const bed=SURV.bedSpawn;const home=bed?bed.slice():SURV.spawn.slice();
    if(DIM!=='overworld'){travelTo('overworld',home,{quiet:true,after:()=>{p.pos=home.slice();}});}else if(bed){p.pos=home;if(!chunkReadyAt(p.pos[0],p.pos[2])){SURV.loading=true;$('loading').classList.remove('hidden');}else settlePlayer(p);}};}

// ---------- the world reacts to block changes: portals, beds and tall plants come apart, fluids and fire wake up ----------
{const a0=applyBlock;applyBlock=function(x,y,z,b){const was=INF?getB(x,y,z):0;a0(x,y,z,b);if(INF&&was!==b)blockChanged(x,y,z,was,b);};}
function blockChanged(x,y,z,was,b){
  wakeAround(x,y,z);
  const W=was&&BD[was];
  if(W&&(was===B.OBSIDIAN||W.portal)&&!(BD[b]&&BD[b].portal))for(const [dx,dy,dz] of N6){const nb=getB(x+dx,y+dy,z+dz);if(BD[nb]&&BD[nb].portal&&!portalValidAt(x+dx,y+dy,z+dz))breakPortal(x+dx,y+dy,z+dz);}
  if(W&&W.bed&&!b){const dv=BED_DIR[W.facing];const s=W.bed==='f'?1:-1;const ox=x+dv[0]*s,oz=z+dv[1]*s;const o=getB(ox,y,oz);if(BD[o]&&BD[o].bed&&BD[o].bed!==W.bed)applyBlockList([ox,y,oz,0],true);}
  if(W&&W.tall&&!b){const oy=W.tall===1?y+1:y-1;const o=getB(x,oy,z);if(BD[o]&&BD[o].tall&&BD[o].tall!==W.tall)applyBlockList([x,oy,z,0],true);}
  if(W&&W.solid&&!b){const up=getB(x,y+1,z);if(up&&BD[up]&&(BD[up].cross||up===B.CACTUS||up===B.REEDS)&&up!==B.VINE&&!BD[up].liquid&&up!==B.FIRE)applyBlockList([x,y+1,z,0],true);}}
const N6=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const BED_DIR=[[0,1],[-1,0],[0,-1],[1,0]];   // facing 0..3: the head is this way from the foot
{const l0=applyBlockList;applyBlockList=function(list,fx){l0(list,fx);if(!INF)return;for(let i=0;i<list.length;i+=4)wakeAround(list[i],list[i+1],list[i+2]);};}
function wakeAround(x,y,z){for(const [dx,dy,dz] of N6.concat([[0,0,0]])){const X=x+dx,Y=y+dy,Z=z+dz;const b=getB(X,Y,Z);if(BD[b]&&BD[b].liquid){FLUIDQ.set(key(X,Y,Z),perfT+(BD[b].liquid==='lava'?(DIM==='nether'?.5:1.5):.25));}
    else if(!b&&dy>=0){for(const [ex,ey,ez] of N6){const n=getB(X+ex,Y+ey,Z+ez);if(BD[n]&&BD[n].liquid){FLUIDQ.set(key(X,Y,Z),perfT+(BD[n].liquid==='lava'?(DIM==='nether'?.5:1.5):.25));break;}}}}}

// ---------- flowing water and lava ----------
const FLUIDQ=new Map(),FIREQ=new Map();let fluidOut=[],fluidSendT=0;
function fluidAuth(){return !net||dropAuth();}
const replaceable=b=>!b||(BD[b]&&(BD[b].cross||b===B.FIRE||b===B.TORCH)&&!BD[b].liquid&&b!==B.REEDS&&b!==B.CACTUS);
function fluidLevel(b,kind){if(!b||!BD[b]||BD[b].liquid!==kind)return -1;const f=BD[b].flow|0;return f===8?0:f;}   // 0 = source or falling
function fluidStep(kind){return kind==='lava'?(DIM==='nether'?1:2):1;}
function fluidId(kind,lv){return kind==='water'?VB.waterF[lv]:VB.lavaF[lv];}
function fluidTick(dt){if(!fluidAuth()){FLUIDQ.clear();return;}if(!FLUIDQ.size)return;let n=0;const list=[];const done=new Set();
  for(const [k,t] of FLUIDQ){if(t>perfT)continue;FLUIDQ.delete(k);if(done.has(k))continue;done.add(k);if(++n>300)break;const [x,y,z]=k.split(',').map(Number);if(y<1||y>=WY-1||!chunkReadyAt(x,z))continue;
    const r=fluidUpdate(x,y,z);if(r!=null)list.push(x,y,z,r);}
  if(list.length){applyBlockList(list,false);fluidOut.push(...list);for(let i=0;i<list.length;i+=4){const b=list[i+3];if(b===B.OBSIDIAN||b===B.COBBLE||b===B.STONE){sfx('fizz',{pos:[list[i],list[i+1],list[i+2]],vol:.5});spawnParticles(list[i]+.5,list[i+1]+1,list[i+2]+.5,6,[.8,.8,.8],1,'poof');}}}
  fluidSendT-=dt;if(fluidOut.length&&fluidSendT<=0){fluidSendT=.25;if(net)netSend(N.BOOM,{l:fluidOut});fluidOut=[];}}
// what block (x,y,z) should become now, or null if nothing changes
function fluidUpdate(x,y,z){const b=getB(x,y,z);const D=BD[b];
  const kinds=D&&D.liquid?[D.liquid]:['water','lava'];
  for(const kind of kinds){const step=fluidStep(kind);
    // lava meeting water turns to stone
    if(kind==='lava'&&D&&D.liquid==='lava'){for(const [dx,dy,dz] of N6){if(dy<0)continue;const n=getB(x+dx,y+dy,z+dz);if(isWaterB(n))return b===B.LAVA?B.OBSIDIAN:B.COBBLE;}}
    if(kind==='water'&&D&&D.liquid==='water'){const below=getB(x,y-1,z);if(below===B.LAVA)return null;}
    if(isSourceB(b))return null;
    if(D&&D.liquid&&D.liquid!==kind)continue;
    if(D&&!D.liquid&&!replaceable(b))return null;
    // falling: same liquid right above
    const above=getB(x,y+1,z);
    if(BD[above]&&BD[above].liquid===kind){if(kind==='lava'&&isWaterB(b))return B.STONE;return b===fluidId(kind,8)?null:fluidId(kind,8);}
    // sideways from neighbours that cannot fall
    let best=99,srcN=0;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=getB(x+dx,y,z+dz);const lv=fluidLevel(n,kind);if(lv<0)continue;if(n===(kind==='water'?B.WATER:B.LAVA))srcN++;
      const under=getB(x+dx,y-1,z+dz);if(!(BD[under]&&(BD[under].solid||BD[under].liquid===kind))&&replaceable(under))continue;if(lv<best)best=lv;}
    if(kind==='water'&&srcN>=2){const under=getB(x,y-1,z);if(BD[under]&&(BD[under].solid||under===B.WATER))return B.WATER;}
    const want=best+step;
    if(want>7||best===99){if(D&&D.liquid===kind)return 0;continue;}
    const id=fluidId(kind,want);if(id===b)return null;
    if(kind==='lava'&&isWaterB(b))return B.COBBLE;
    if(kind==='water'&&isLavaB(b))return b===B.LAVA?B.OBSIDIAN:B.COBBLE;
    return id;}
  return null;}

// ---------- fire ----------
const FLAMMABLE=new Set();{for(const k of ['LOG','PLANKS','LEAVES','SPRUCE_LOG','SPRUCE_PLANKS','JLOG','JLEAVES','WOOL','WOOL_W','BOOKSHELF','HAY','FENCE','OAK_STAIRS','OAK_SLAB','TGRASS','FERN','SAKURA_LOG','SAKURA_LEAVES','SAKURA_PLANKS','REDWOOD_LOG','REDWOOD_LEAVES','REDWOOD_PLANKS','FROZEN_LOG','FROZEN_LEAVES','BURNT_LOG','TNT',
  'BIRCH_LOG','BIRCH_LEAVES','BIRCH_PLANKS','ACACIA_LOG','ACACIA_LEAVES','ACACIA_PLANKS','DARK_OAK_LOG','DARK_OAK_LEAVES','DARK_OAK_PLANKS','SPRUCE_LEAVES','TALLGRASS2','DEAD_BUSH','VINE','CARPET'])if(B[k]!=null)FLAMMABLE.add(B[k]);for(const w of MB_WOOLS)FLAMMABLE.add(B['WOOL_'+w[0].toUpperCase()]);}
const FIRES=new Map();   // key -> age (only fires that will burn out)
function fireTick(dt){if(!fluidAuth())return;const list=[];let n=0;
  for(const [k,f] of FIRES){f.t-=dt;if(f.t>0)continue;if(++n>60)break;const [x,y,z]=k.split(',').map(Number);if(getB(x,y,z)!==B.FIRE||!chunkReadyAt(x,z)){FIRES.delete(k);continue;}
    const below=getB(x,y-1,z);const eternal=below===B.NETHERRACK||below===B.MAGMA||(below===B.BEDROCK&&DIM==='end');
    const rainy=WEATHER.rain>.5&&DIM==='overworld'&&(lightAt(x,y,z)>>4)>=15;
    if(rainy||(!eternal&&f.life--<=0)){list.push(x,y,z,0);FIRES.delete(k);continue;}
    f.t=.6+Math.random()*.8;
    // burn and spread
    for(const [dx,dy,dz] of N6){const X=x+dx,Y=y+dy,Z=z+dz;const nb=getB(X,Y,Z);if(!FLAMMABLE.has(nb)||Math.random()>.07)continue;
      if(nb===B.TNT){igniteTNT(X,Y,Z,1.5,null);continue;}list.push(X,Y,Z,Math.random()<.6?B.FIRE:0);}
    if(Math.random()<.2){const X=x+((Math.random()*3|0)-1),Y=y+((Math.random()*3|0)-1),Z=z+((Math.random()*3|0)-1);if(!getB(X,Y,Z)&&chunkReadyAt(X,Z)){let fuel=false;for(const [dx,dy,dz] of N6)if(FLAMMABLE.has(getB(X+dx,Y+dy,Z+dz)))fuel=true;if(fuel&&BD[getB(X,Y-1,Z)]&&BD[getB(X,Y-1,Z)].solid)list.push(X,Y,Z,B.FIRE);}}}
  if(list.length){applyBlockList(list,false);if(net)netSend(N.BOOM,{l:list});for(let i=0;i<list.length;i+=4)if(list[i+3]===B.FIRE)fireAdd(list[i],list[i+1],list[i+2]);}}
function fireAdd(x,y,z){FIRES.set(key(x,y,z),{t:.5+Math.random(),life:4+(Math.random()*8|0)});}
function lightFire(x,y,z){if(getB(x,y,z)&&!replaceable(getB(x,y,z)))return false;const below=getB(x,y-1,z);if(!(BD[below]&&BD[below].solid)&&![1,0,-1].some(d=>FLAMMABLE.has(getB(x+d,y,z))||FLAMMABLE.has(getB(x,y,z+d))))return false;
  setBlockNet(x,y,z,B.FIRE);fireAdd(x,y,z);psnd(['fire/ignite'],[x,y,z],1);return true;}

// ---------- Nether portals ----------
const PORTAL={t:0,cd:0,in:false,snd:0};
// a frame of obsidian around an empty rectangle 2..21 wide and 3..21 tall, in the x or z direction
function findPortalFrame(x,y,z){const isIn=b=>!b||b===B.FIRE;
  for(const ax of ['x','z']){const dx=ax==='x'?1:0,dz=ax==='z'?1:0;if(!isIn(getB(x,y,z)))return null;
    let by=y;while(by>y-22&&isIn(getB(x,by-1,z)))by--;if(getB(x,by-1,z)!==B.OBSIDIAN)continue;
    let lx=x,lz=z;let k=0;while(k++<22&&isIn(getB(lx-dx,by,lz-dz))){lx-=dx;lz-=dz;}if(getB(lx-dx,by,lz-dz)!==B.OBSIDIAN)continue;
    let w=0;while(w<22&&isIn(getB(lx+dx*w,by,lz+dz*w)))w++;if(w<2||w>21||getB(lx+dx*w,by,lz+dz*w)!==B.OBSIDIAN)continue;
    let h=0;while(h<22&&isIn(getB(lx,by+h,lz)))h++;if(h<3||h>21)continue;
    let ok=true;for(let i=0;i<w&&ok;i++){if(getB(lx+dx*i,by-1,lz+dz*i)!==B.OBSIDIAN||getB(lx+dx*i,by+h,lz+dz*i)!==B.OBSIDIAN)ok=false;for(let j=0;j<h&&ok;j++)if(!isIn(getB(lx+dx*i,by+j,lz+dz*i)))ok=false;}
    for(let j=0;j<h&&ok;j++){if(getB(lx-dx,by+j,lz-dz)!==B.OBSIDIAN||getB(lx+dx*w,by+j,lz+dz*w)!==B.OBSIDIAN)ok=false;}
    if(ok)return {x:lx,y:by,z:lz,w,h,ax};}
  return null;}
function lightPortal(F){const id=F.ax==='x'?B.PORTAL_X:B.PORTAL_Z;const list=[];for(let i=0;i<F.w;i++)for(let j=0;j<F.h;j++)list.push(F.x+(F.ax==='x'?i:0),F.y+j,F.z+(F.ax==='z'?i:0),id);
  applyBlockList(list,false);if(net)netSend(N.BOOM,{l:list});psnd(['portal/trigger'],[F.x,F.y,F.z],.6,1.3);}
function portalValidAt(x,y,z){const b=getB(x,y,z);const ax=BD[b].portal;const dx=ax==='x'?1:0,dz=ax==='z'?1:0;
  // walk to the frame in all four directions: every step must be portal, every end obsidian
  for(const [sx,sy,sz] of [[dx,0,dz],[-dx,0,-dz],[0,1,0],[0,-1,0]]){let X=x,Y=y,Z=z,k=0;while(k++<23&&getB(X,Y,Z)===b){X+=sx;Y+=sy;Z+=sz;}if(getB(X,Y,Z)!==B.OBSIDIAN)return false;}return true;}
function breakPortal(x,y,z){const b=getB(x,y,z);if(!BD[b]||!BD[b].portal)return;const seen=new Set(),q=[[x,y,z]],list=[];
  while(q.length&&list.length<4*450){const [X,Y,Z]=q.pop();const k=key(X,Y,Z);if(seen.has(k))continue;seen.add(k);if(getB(X,Y,Z)!==b)continue;list.push(X,Y,Z,0);for(const [dx,dy,dz] of N6)q.push([X+dx,Y+dy,Z+dz]);}
  applyBlockList(list,true);psnd(['random/glass','dig/glass'],[x,y,z],.5,.7);}
function touching(e,test){const hw=(e.hw||.3)-.01,eh=e.eh||1.8;for(let y=Math.floor(e.pos[1]);y<=Math.floor(e.pos[1]+eh-.01);y++)for(let z=Math.floor(e.pos[2]-hw);z<=Math.floor(e.pos[2]+hw);z++)for(let x=Math.floor(e.pos[0]-hw);x<=Math.floor(e.pos[0]+hw);x++){const b=getB(x,y,z);if(b&&test(b,x,y,z))return [x,y,z,b];}return null;}
// find a lit portal near (x,z) in a dimension's edits (portals only ever come from players)
function findPortalInEdits(dim,x,y,z,r){const E=dimLive(dim).edits;let best=null,bd=1e18;const c0x=Math.floor((x-r)/16),c1x=Math.floor((x+r)/16),c0z=Math.floor((z-r)/16),c1z=Math.floor((z+r)/16);
  for(let cz=c0z;cz<=c1z;cz++)for(let cx=c0x;cx<=c1x;cx++){const m=E.get(ckey(cx,cz));if(!m)continue;for(const [li,b] of m){if(b!==B.PORTAL_X&&b!==B.PORTAL_Z)continue;const px=cx*16+(li&15),pz=cz*16+((li>>4)&15),py=li>>8;
      const d=(px-x)**2+(pz-z)**2+((py-y)*.5)**2;if(d<bd){bd=d;best=[px,py,pz,b];}}}
  if(!best)return null;// lowest block of that portal column
  let [px,py,pz,b]=best;while(true){const m=E.get(ckey(px>>4,pz>>4));const li=(px&15)|((pz&15)<<4)|((py-1)<<8);if(m&&m.get(li)===b)py--;else break;}return [px,py,pz,b];}
function netherTravel(){const p=player;const to=DIM==='nether'?'overworld':'nether';const k=to==='nether'?1/8:8;
  const tx=Math.floor(p.pos[0]*k),tz=Math.floor(p.pos[2]*k);let ty=Math.floor(p.pos[1]);if(to==='nether')ty=clamp(ty,34,110);
  const hit=touching(p,b=>!!(BD[b]&&BD[b].portal));const ax=hit?BD[hit[3]].portal:'x';
  const found=findPortalInEdits(to,tx,ty,tz,to==='nether'?24:128);
  const arrive=found?[found[0]+.5,found[1],found[2]+.5]:[tx+.5,ty,tz+.5];
  travelTo(to,arrive,{after:()=>{const f=found&&getB(found[0],found[1],found[2]);
    if(found&&BD[f]&&BD[f].portal){const a=BD[f].portal;p.pos=[found[0]+.5,found[1],found[2]+.5];p.yaw=a==='x'?0:Math.PI/2;}
    else{const P=makePortal(tx,ty,tz,ax);p.pos=[P[0]+.5,P[1],P[2]+.5];p.yaw=ax==='x'?0:Math.PI/2;}
    PORTAL.cd=4;PORTAL.t=0;psnd(['portal/travel'],null,.5);}});}
// build a 4x5 obsidian frame with a small platform, as near to (x,y,z) as there is room
function makePortal(x,y,z,ax){const dx=ax==='x'?1:0,dz=ax==='z'?1:0;const ylo=DIM==='nether'?32:Math.max(SEA,8),yhi=WY-8;
  const fits=(X,Y,Z)=>{for(let i=-1;i<=2;i++)for(let j=0;j<=3;j++)for(let s=-1;s<=1;s++){const b=getB(X+dx*i+dz*s,Y+j,Z+dz*i+dx*s);if(b&&!replaceable(b))return false;}
    for(let i=-1;i<=2;i++){const b=getB(X+dx*i,Y-1,Z+dz*i);if(!(BD[b]&&BD[b].solid))return false;}return true;};
  let spot=null;
  for(let r=0;r<=16&&!spot;r+=2)for(let a=0;a<(r?12:1)&&!spot;a++){const X=Math.round(x+Math.cos(a/12*6.283)*r),Z=Math.round(z+Math.sin(a/12*6.283)*r);if(!chunkReadyAt(X,Z))continue;
    for(let dy=0;dy<40&&!spot;dy++)for(const Y of [y+dy,y-dy]){if(Y<ylo||Y>yhi)continue;if(fits(X,Y,Z)){spot=[X,Y,Z];break;}}}
  if(!spot)spot=[x,clamp(y,ylo+2,yhi-6),z];
  const [X,Y,Z]=spot;const list=[];const put=(a,b,c,v)=>list.push(a,b,c,v);
  for(let i=-1;i<=2;i++)for(let s=-1;s<=1;s++){put(X+dx*i+dz*s,Y-1,Z+dz*i+dx*s,(s===0||!(BD[getB(X+dx*i+dz*s,Y-1,Z+dz*i+dx*s)]||{}).solid)?B.OBSIDIAN:getB(X+dx*i+dz*s,Y-1,Z+dz*i+dx*s));
    for(let j=0;j<=3;j++)if(s!==0)put(X+dx*i+dz*s,Y+j,Z+dz*i+dx*s,0);}
  for(let j=-1;j<=4;j++){put(X-dx,Y+j,Z-dz,B.OBSIDIAN);put(X+dx*2,Y+j,Z+dz*2,B.OBSIDIAN);}
  for(let i=0;i<=1;i++){put(X+dx*i,Y-1,Z+dz*i,B.OBSIDIAN);put(X+dx*i,Y+3,Z+dz*i,B.OBSIDIAN);for(let j=0;j<3;j++)put(X+dx*i,Y+j,Z+dz*i,ax==='x'?B.PORTAL_X:B.PORTAL_Z);}
  applyBlockList(list,false);if(net)netSend(N.BOOM,{l:list});return [X,Y,Z];}

// ---------- the End portal ----------
function frameRing(cx,y,cz){const r=[];for(let i=-1;i<=1;i++)r.push([cx-2,cz+i],[cx+2,cz+i],[cx+i,cz-2],[cx+i,cz+2]);return r.map(([a,b])=>[a,y,b]);}
function checkEndPortal(x,y,z){for(let oz=-4;oz<=4;oz++)for(let ox=-4;ox<=4;ox++){const cx=x+ox,cz=z+oz;const ring=frameRing(cx,y,cz);if(!ring.some(([a,,b])=>a===x&&b===z))continue;
    if(ring.every(([a,yy,b])=>getB(a,yy,b)===B.END_FRAME_EYE)){const list=[];for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)list.push(cx+i,y,cz+j,B.END_PORTAL);applyBlockList(list,false);if(net)netSend(N.BOOM,{l:list});
      endPortalSound([cx,y,cz]);chatMsg('The End Portal opens.','#b0ffd8',false);return true;}}return false;}
function endPortalSound(pos){if(!actx)return;const g=packGroup(['portal/trigger']);if(g)playBytes(g[0],.7,.6);tone('sine',90,45,2.4,.18);setTimeout(()=>tone('triangle',220,880,1.6,.06),200);}
function endArrive(){const p=player;const list=[];for(let z=-2;z<=2;z++)for(let x=98;x<=102;x++){list.push(x,48,z,B.OBSIDIAN);for(let y=49;y<=51;y++)list.push(x,y,z,0);}applyBlockList(list,false);if(net)netSend(N.BOOM,{l:list});
  p.pos=[100.5,49,.5];p.yaw=Math.PI/2;PORTAL.cd=3;dragonEnsure();}
function goHomeFromEnd(){const p=player;const bed=SURV.bedSpawn;const home=bed?bed.slice():SURV.spawn.slice();travelTo('overworld',home,{after:()=>{p.pos=home.slice();PORTAL.cd=3;}});}

// ---------- per-frame: portals, cactus and fire contact, fluids, fire, eyes of ender, XP ----------
function dimTick(dt){const p=player;
  fluidTick(dt);fireTick(dt);eyesTick(dt);xpTick(dt);
  if(!p||!p.alive)return;
  PORTAL.cd=Math.max(0,PORTAL.cd-dt);
  const inP=touching(p,b=>!!(BD[b]&&BD[b].portal));
  if(!inP)PORTAL.needExit=false;
  if(inP&&PORTAL.cd<=0&&!PORTAL.needExit){PORTAL.t+=dt*(p.gm==='creative'?4:1);PORTAL.snd-=dt;if(PORTAL.snd<=0){PORTAL.snd=4;psnd(['portal/trigger'],null,.35,1);}if(PORTAL.t>=4){PORTAL.t=0;PORTAL.cd=8;PORTAL.needExit=true;netherTravel();return;}}
  else{PORTAL.t=Math.max(0,PORTAL.t-dt*2);if(!inP)PORTAL.snd=0;if(inP)PORTAL.cd=Math.max(PORTAL.cd,1);}
  if(!inP){const near=touching({pos:[p.pos[0],p.pos[1]-1,p.pos[2]],hw:3,eh:4},b=>!!(BD[b]&&BD[b].portal));PORTAL.amb=(PORTAL.amb||0)-dt;if(near&&PORTAL.amb<=0){PORTAL.amb=3+Math.random()*3;psnd(['portal/portal'],[near[0],near[1],near[2]],.4,1);}}
  // End portal: straight through
  if(PORTAL.cd<=0&&touching(p,b=>b===B.END_PORTAL)){PORTAL.cd=8;if(DIM==='end'){showEndCredits(()=>goHomeFromEnd());}else{travelTo('end',[100.5,49,.5],{after:endArrive});}return;}
  // cactus and fire hurt
  p.cactT=(p.cactT||0)-dt;if(p.cactT<=0&&p.gm!=='creative'&&touching({pos:p.pos,hw:(p.hw||.3)+.05,eh:p.eh||1.8},b=>b===B.CACTUS)){p.cactT=.5;damage(p,1,null,'cactus');}
  if(touching(p,b=>b===B.FIRE)&&p.gm!=='creative'){p.fire=Math.max(p.fire||0,8);}
  if(p.pos[1]<-40&&DIM==='end'&&p.alive&&p.gm!=='creative')damage(p,40,null,'void');}

// ---------- right click: flint and steel, buckets, beds, ender pearls and eyes, nether wart, tall plants ----------
function rayFluidOrSolid(o,d,maxD){for(let t=0;t<maxD;t+=.05){const x=Math.floor(o[0]+d[0]*t),y=Math.floor(o[1]+d[1]*t),z=Math.floor(o[2]+d[2]*t);const b=getB(x,y,z);if(b&&(BD[b].liquid||BD[b].solid))return {x,y,z,b,t};}return null;}
{const u0=useSpecial;useSpecial=function(p,s){if(!INF||!p.alive)return u0(p,s);const id=s&&s.id;const h=raycastBlock(eye(p),fwd(p),4.5);
    // beds: sleep / set spawn (or explode outside the Overworld)
    if(h&&BD[h.b]&&BD[h.b].bed&&!p.sneak){useBed(p,h);return true;}
    if(!s)return u0(p,s);
    if(id==='flint_and_steel'&&h){if(h.b===B.TNT)return u0(p,s);
      const F=findPortalFrame(h.px,h.py,h.pz);if(F){lightPortal(F);wearHeld(p,1);p.swing=1;return true;}
      if(lightFire(h.px,h.py,h.pz)){wearHeld(p,1);p.swing=1;return true;}return false;}
    if(id==='bucket'){const r=rayFluidOrSolid(eye(p),fwd(p),4.5);if(r&&(r.b===B.WATER||r.b===B.LAVA)){setBlockNet(r.x,r.y,r.z,0);giveBucket(p,r.b===B.WATER?'water_bucket':'lava_bucket');psnd(r.b===B.WATER?['liquid/splash']:['liquid/lavapop'],[r.x,r.y,r.z],.6);p.swing=1;return true;}return u0(p,s);}
    if(id==='water_bucket'||id==='lava_bucket'){if(!h)return false;let X=h.px,Y=h.py,Z=h.pz;if(BD[h.b]&&(BD[h.b].cross)){X=h.x;Y=h.y;Z=h.z;}const cur=getB(X,Y,Z);if(cur&&!replaceable(cur)&&!(BD[cur]&&BD[cur].liquid))return false;
      if(id==='water_bucket'&&DIM==='nether'){sfx('fizz',{pos:[X,Y,Z]});spawnParticles(X+.5,Y+.5,Z+.5,12,[.85,.85,.85],1.5,'poof');}else setBlockNet(X,Y,Z,id==='water_bucket'?B.WATER:B.LAVA);
      if(p.gm!=='creative')p.inv[p.sel]={id:'bucket',count:1};p.swing=1;psnd(id==='water_bucket'?['liquid/splash']:['liquid/lava'],[X,Y,Z],.5);return true;}
    if(id==='ender_pearl'){throwPearl(p);if(p.gm!=='creative')consume(p,p.sel);p.swing=1;return true;}
    if(id==='ender_eye'){if(h&&h.b===B.END_FRAME){setBlockNet(h.x,h.y,h.z,B.END_FRAME_EYE);if(p.gm!=='creative')consume(p,p.sel);p.swing=1;psnd(['random/click'],[h.x,h.y,h.z],.6,1.6);spawnParticles(h.x+.5,h.y+1,h.z+.5,10,[.2,.8,.6],1,'magic');checkEndPortal(h.x,h.y,h.z);return true;}
      if(h&&h.b===B.END_FRAME_EYE)return false;throwEye(p);if(p.gm!=='creative')consume(p,p.sel);p.swing=1;return true;}
    if(id==='nether_wart_item'&&h&&h.b===B.SOUL&&!getB(h.x,h.y+1,h.z)){setBlockNet(h.x,h.y+1,h.z,B.NETHER_WART);consume(p,p.sel);p.swing=1;return true;}
    const it=ITEMS[id];
    if(it&&it.type==='block'&&h&&canBuild()){const bd=BD[it.block];
      if(bd&&bd.bed){placeBed(p,h);return true;}
      if(bd&&bd.tall===1){const X=h.px,Y=h.py,Z=h.pz;if(!replaceable(getB(X,Y+1,Z))||!chunkReadyAt(X,Z))return true;if(placeBlock(X,Y,Z,it.block)){setBlockNet(X,Y+1,Z,it.block+1);consume(p,p.sel);p.swing=1;}return true;}
      if(it.block===B.REEDS||bd&&bd.cross&&!bd.fire){const below=getB(h.px,h.py-1,h.pz);if(!(BD[below]&&BD[below].solid)&&below!==B.REEDS)return true;}}
    return u0(p,s);};}
function giveBucket(p,id){if(p.gm==='creative')return;const s=p.inv[p.sel];if(s.count>1){s.count--;if(addItem(p,id,1))requestDrop(p.pos,id,1);}else p.inv[p.sel]={id,count:1};}
function placeBed(p,h){const X=h.px,Y=h.py,Z=h.pz;const fw=fwd(p);let f=0,bd=-9;for(let k=0;k<4;k++){const d=fw[0]*BED_DIR[k][0]+fw[2]*BED_DIR[k][1];if(d>bd){bd=d;f=k;}}   // the head points the way you look
  const dv=BED_DIR[f];const HX=X+dv[0],HZ=Z+dv[1];
  if(!replaceable(getB(X,Y,Z))||!replaceable(getB(HX,Y,HZ)))return;if(!(BD[getB(X,Y-1,Z)]||{}).solid||!(BD[getB(HX,Y-1,HZ)]||{}).solid)return;
  const foot=VB.bed[f*2],head=VB.bed[f*2+1];setBlockNet(X,Y,Z,foot);setBlockNet(HX,Y,HZ,head);if(p.gm!=='creative')consume(p,p.sel);p.swing=1;sfx('dig',{pos:[X,Y,Z],mat:'cloth'});}
function useBed(p,h){if(DIM!=='overworld'){const c=[h.x+.5,h.y+.5,h.z+.5];setBlockNet(h.x,h.y,h.z,0);explode(c,5,p);for(let i=0;i<10;i++){const x=h.x+((Math.random()*5|0)-2),z=h.z+((Math.random()*5|0)-2);for(let y=h.y+2;y>=h.y-2;y--)if(!getB(x,y,z)&&(BD[getB(x,y-1,z)]||{}).solid){lightFire(x,y,z);break;}}return;}
  const W=BD[h.b];const dv=BED_DIR[W.facing];const hx=W.bed==='f'?h.x+dv[0]:h.x,hz=W.bed==='f'?h.z+dv[1]:h.z;
  SURV.bedSpawn=[hx+.5,h.y+.6,hz+.5];
  const night=dayAmt()<.35;
  if(!night){chatMsg('Respawn point set. You can only sleep at night.','#ffffff',false);return;}
  if(mobs.some(m=>m.alive&&MOB_T[m.mob].kind==='hostile'&&dist(m.pos,p.pos)<8)){chatMsg('You may not rest now; there are monsters nearby.','#ffffff',false);return;}
  if(net&&!isHost()){chatMsg('Respawn point set. Only the host can sleep through the night.','#ffffff',false);return;}
  SLEEP.t=0;SLEEP.on=true;p.vel=[0,0,0];chatMsg('Respawn point set.','#ffffff',false);}
const SLEEP={on:false,t:0};
function throwPearl(p){const d=fwd(p),o=eye(p),sp=1.5;spawnProj('splash',[o[0],o[1]-.1,o[2]],[d[0]*sp,d[1]*sp,d[2]*sp],p,0,'ender_pearl');sfx('bow',{pos:p.pos});}
{const s0=splashImpact;splashImpact=function(pr){const it=ITEMS[pr.pot];if(it&&it.pearl){spawnParticles(pr.pos[0],pr.pos[1],pr.pos[2],24,[.55,.15,.75],2.5,'magic');
      if(pr.owner===player&&player.alive){const v=pr.vel,L=Math.hypot(...v)||1;let q=[pr.pos[0]-v[0]/L*.6,pr.pos[1]-v[1]/L*.6,pr.pos[2]-v[2]/L*.6];
        for(let i=0;i<8&&(solid(Math.floor(q[0]),Math.floor(q[1]),Math.floor(q[2]))||solid(Math.floor(q[0]),Math.floor(q[1]+1),Math.floor(q[2])));i++)q[1]+=1;
        player.pos=q;player.vel=[0,0,0];player.mot=[0,0,0];player.fallDist=0;if(player.gm!=='creative')damage(player,5,null,'fall');psnd(['portal/portal','mob/endermen/portal'],null,.4,1.4);}
      return;}
    return s0(pr);};}
// eyes of ender fly toward the nearest stronghold, hover, then drop (or shatter)
const EYES=[];
function throwEye(p){const s=nearestStronghold(p.pos[0],p.pos[2]);const o=eye(p);EYES.push({pos:[o[0],o[1]-.2,o[2]],t:0,tx:s[0]+.5,tz:s[2]+.5,y0:o[1]});psnd(['random/bow'],p.pos,.5,.5);}
function eyesTick(dt){for(const e of EYES){e.t+=dt;const dx=e.tx-e.pos[0],dz=e.tz-e.pos[2],d=Math.hypot(dx,dz);const sp=e.t<1.8?7:0;if(d>.5){e.pos[0]+=dx/d*Math.min(d,sp*dt);e.pos[2]+=dz/d*Math.min(d,sp*dt);}
    e.pos[1]=e.y0+Math.min(1,e.t)*2.5+Math.sin(e.t*4)*.15;if(Math.random()<.5)spawnParticles(e.pos[0],e.pos[1],e.pos[2],1,[.5,.15,.7],.4,'magic');
    if(e.t>2.6){e.done=true;if(Math.random()<.8)requestDrop([e.pos[0],e.pos[1]-1,e.pos[2]],'ender_eye',1,[0,1,0]);else{spawnParticles(e.pos[0],e.pos[1],e.pos[2],16,[.3,.8,.6],1.5,'magic');psnd(['random/glass'],e.pos,.6,1);}}}
  for(let i=EYES.length-1;i>=0;i--)if(EYES[i].done)EYES.splice(i,1);}
function psnd(names,pos,vol=1,pitch=1){if(!actx)return false;let v=vol;if(pos&&camPos){const d=dist(pos,camPos);if(d>24)return true;v*=1-d/24;}const g=packGroup(names);if(!g)return false;playBytes(g[Math.random()*g.length|0],v,pitch*(.95+Math.random()*.1));return true;}

// ---------- multiplayer: tag messages with the dimension, keep players in other dimensions out of sight ----------
const AWAY=new Map();
const DIM_CODES=new Set([N.BOOM,N.TNT,N.DROPADD,N.PROJ,N.DROPREQ]);
{const ns0=netSend;netSend=function(code,data,to){if(MATCH.mode==='survival'&&INF){
      if(code===N.BLOCK&&Array.isArray(data)&&DIM!=='overworld')data=data.concat([DIM]);
      else if(DIM_CODES.has(code)&&data&&typeof data==='object'&&!Array.isArray(data)&&DIM!=='overworld')data=Object.assign({},data,{dm:DIM});
      else if(code===N.WTIME&&data)data=Object.assign({},data,{w:WEATHER.on?1:0,th:WEATHER.thunder?1:0});}
    return ns0(code,data,to);};}
{const sm0=sendMyState;sendMyState=function(dt){return sm0(dt);};}
{const o0=onNetEvent;onNetEvent=function(code,d,from){
    if(MATCH.mode==='survival'&&INF&&d){
      if(code===N.STATE){const dm=d.dm||'overworld';if(net&&from===net.hostId())hostDim=dm;
        if(dm!==DIM){const e=entById(d.id);if(e&&!e.isLocal){ents=ents.filter(x=>x!==e);AWAY.set(e.id,e);}const a=AWAY.get(d.id);if(a){a.pos=d.p.slice();a.dim=dm;}return;}
        const a=AWAY.get(d.id);if(a){AWAY.delete(d.id);if(!entById(d.id)){a.prev=null;ents.push(a);}}}
      else if(code===N.BLOCK&&Array.isArray(d)){const dm=d[4]||'overworld';if(dm!==DIM){const L=dimLive(dm);recordEdit(L.edits,d[0],d[1],d[2],d[3]);return;}}
      else if(code===N.BOOM){const dm=d.dm||'overworld';if(dm!==DIM){if(Array.isArray(d.l)){const L=dimLive(dm);for(let i=0;i+3<d.l.length;i+=4)recordEdit(L.edits,d.l[i],d.l[i+1],d.l[i+2],d.l[i+3]);}return;}}
      else if(DIM_CODES.has(code)&&!Array.isArray(d)){if((d.dm||'overworld')!==DIM)return;}
      else if(code===N.MOBS&&hostDim!==DIM)return;
      else if(code===N.WTIME){if(net&&from===net.hostId()){WEATHER.on=!!d.w;WEATHER.thunder=!!d.th;}}
      else if(code===N.DGN){dragonNet(d,from);return;}}
    return o0(code,d,from);};}
function recordEdit(E,x,y,z,b){const k=ckey(x>>4,z>>4);let m=E.get(k);if(!m){m=new Map();E.set(k,m);}m.set((x&15)|((z&15)<<4)|(y<<8),b);}
{const l0=onMemberLeave;onMemberLeave=function(id){AWAY.delete('p'+id);return l0(id);};}
Object.assign(N,{DGN:63});

// ---------- the sky, light and fog of each dimension ----------
{const u0=updateEnv;updateEnv=function(dt){u0(dt);if(!INF||MATCH.mode!=='survival')return;
    if(DIM==='nether'){const f=[.21,.035,.025];ENV.zen=f.slice();ENV.hor=f.slice();ENV.fog=f.slice();ENV.glow=0;ENV.night=0;ENV.sunStr=0;ENV.sunCol=[0,0,0];ENV.skyL=[.3,.2,.18];ENV.blkL=[1.08,.92,.8];ENV.amb=.3;SKYMUL=.6;
      const far=Math.max(24,Math.min(infRD,infMaxRD())*16-6);ENV.fogN=8;ENV.fogF=Math.min(far,96);
      const ib=getB(Math.floor(camPos[0]),Math.floor(camPos[1]),Math.floor(camPos[2]));if(isLavaB(ib)){ENV.fog=[.9,.3,.05];ENV.fogN=0;ENV.fogF=3;}}
    else if(DIM==='end'){const z=[.03,.015,.045],h=[.07,.05,.09];ENV.zen=z;ENV.hor=h;ENV.fog=h.slice();ENV.glow=0;ENV.night=0;ENV.sunStr=0;ENV.sunCol=[0,0,0];ENV.skyL=[.78,.72,.85];ENV.amb=.16;SKYMUL=.7;
      const far=Math.max(24,Math.min(infRD,infMaxRD())*16-6);ENV.fogN=far*.5;ENV.fogF=far;}
    else weatherEnv(dt);};}
{const d0=drawSkyDome;drawSkyDome=function(fov,aspect){if(DIM==='overworld'||!INF)return d0(fov,aspect);const c=OPT.clouds;OPT.clouds=false;try{d0(fov,aspect);}finally{OPT.clouds=c;}if(DIM==='end')drawEndSky();};}
{const b0=biomeAt;biomeAt=function(x,z){if(INF&&DIM==='nether')return BIO.nether;if(INF&&DIM==='end')return BIO.end;return b0(x,z);};}
{const d0=dayAmt;dayAmt=function(){if(INF&&MATCH.mode==='survival'&&DIM!=='overworld')return DIM==='end'?0:.5;return d0();};}
// the End's sky: the pack's end_sky texture on a huge box around the camera
let END_SKY_TEX=null,endSkyMesh=null;
function drawEndSky(){if(!PACK.endSky&&!END_SKY_TEX)return;if(!END_SKY_TEX){END_SKY_TEX=mkTex(PACK.endSky);}
  if(!endSkyMesh){const o=[];const q=(a,b,c,d)=>{for(const [p,u,v] of [[a,0,0],[b,1,0],[c,1,1],[a,0,0],[c,1,1],[d,0,1]])o.push(p[0],p[1],p[2],u*6,v*6,0,1,0);};const S=1;
    const P=(x,y,z)=>[x*S,y*S,z*S];q(P(-1,-1,-1),P(1,-1,-1),P(1,-1,1),P(-1,-1,1));q(P(-1,1,1),P(1,1,1),P(1,1,-1),P(-1,1,-1));q(P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1));q(P(1,-1,-1),P(-1,-1,-1),P(-1,1,-1),P(1,1,-1));q(P(-1,-1,-1),P(-1,-1,1),P(-1,1,1),P(-1,1,-1));q(P(1,-1,1),P(1,-1,-1),P(1,1,-1),P(1,1,1));
    endSkyMesh=meshFrom(o);}
  gl.disable(gl.DEPTH_TEST);gl.depthMask(false);useTex(VP,camPos);gl.uniform1f(PT.u.bright,.22);gl.uniform1f(PT.u.hurt,0);gl.uniform4f(PT.u.tint,.55,.45,.6,1);
  drawMesh(endSkyMesh,chain(M4.tr(camPos[0],camPos[1],camPos[2]),M4.sc(60,60,60)),END_SKY_TEX);gl.uniform4f(PT.u.tint,1,1,1,1);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);}
{const p0=packLoadMobs;packLoadMobs=async function(get){const n=await p0(get);const es=await get('textures/environment/end_sky.png');if(es){PACK.endSky=dvFull(es);END_SKY_TEX=null;}
    const dg=await get('textures/entity/enderdragon/dragon.png');if(dg){PACK.dragon=dvFull(dg);mobTexDirty=true;}const de=await get('textures/entity/enderdragon/dragon_eyes.png');if(de)PACK.dragonEyes=dvFull(de);return n;};}

// ---------- HUD: portal swirl, sleeping, the place you are ----------
{const h0=drawHUD;drawHUD=function(){h0();if(!INF||MATCH.mode!=='survival'||!player||loadingUp())return;
    if(PORTAL.t>0){const a=Math.min(1,PORTAL.t/4);hc.save();hc.globalAlpha=a*.75;const g=hc.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,'rgba(120,40,220,.35)');g.addColorStop(1,'rgba(90,10,180,1)');hc.fillStyle=g;hc.fillRect(0,0,W,H);
      hc.globalAlpha=a*.25;for(let i=0;i<30;i++){const x=(hash2(i,1,3)*W+perfT*40*(i%3-1))%W,y=(hash2(i,2,3)*H+perfT*60)%H;hc.fillStyle='#d090ff';hc.fillRect(x,y,4,4);}hc.restore();}
    if(SLEEP.on){hc.save();hc.globalAlpha=Math.min(1,SLEEP.t/2);hc.fillStyle='#000';hc.fillRect(0,0,W,H);hc.restore();}
    drawXPBar();drawBossBar();};}
{const t0=survTick;survTick=function(dt){t0(dt);if(SLEEP.on){SLEEP.t+=dt;if(SLEEP.t>=2.6){SLEEP.on=false;worldTime=.01;WEATHER.on=false;WEATHER.thunder=false;WEATHER.t=600+Math.random()*900;if(net)netSend(N.WTIME,{t:worldTime});GZ.day++;}}};}
