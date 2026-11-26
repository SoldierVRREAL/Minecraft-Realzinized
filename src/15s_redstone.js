// ================= Redstone power =================
// Runs where the world is decided (single player, the host, or a player alone in their dimension). Game ticks are 1/20 s, redstone
// ticks are 2 game ticks. Power works like the real game: sources (levers, buttons, pressure plates, redstone torches, blocks of
// redstone, daylight sensors, detector rails, repeaters, comparators) power the blocks around them; a solid block is "strongly"
// powered by a lever or button on it, a torch under it, a repeater or comparator pointing into it, and "weakly" powered by dust
// on it or pointing into it. Dust carries power 15 blocks, losing one level a block; it takes power from strongly powered
// blocks only. Mechanisms (lamps, pistons, doors, trapdoors, TNT, note blocks, dispensers, droppers, hoppers, rails, command
// blocks) switch from anything next to them, including weakly powered blocks.
const RSK=b=>b&&BD[b]?BD[b].rs:null;
const pk3=(x,y,z)=>x+','+y+','+z;
// blocks that carry power through them (full solid cubes)
function rsCond(b){if(!b)return false;const D=BD[b];if(!D||!D.solid||!D.opaque||D.shape||D.cross||D.liquid||D.dyn||D.quads)return false;const r=D.rs;if(r&&(r.k==='piston'))return false;return b!==B.REDSTONE;}
const OPPF=[1,0,3,2,5,4];
const f6Of=(dx,dy,dz)=>dy<0?0:dy>0?1:dz<0?2:dz>0?3:dx<0?4:5;
// ---- what a component at (x,y,z) sends toward its neighbour in direction d (F6 index): [weak, strong] ----
function rsEmit(x,y,z,d){const b=getB(x,y,z);if(!b)return 0;if(b===B.REDSTONE)return 15;const r=RSK(b);if(!r)return 0;
  switch(r.k){
  case 'lever':case 'button':return r.on?15:0;
  case 'plate':return r.on?rsPlateLvl(x,y,z,r):0;
  case 'torch':{if(!r.on)return 0;const s=r.a<0?0:f6Of(...DIRS4[r.a]);return d===s?0:15;}
  case 'rep':return r.on&&d===f6Of(...DIRS4[r.f])?15:0;
  case 'comp':return d===f6Of(...DIRS4[r.f])?rsCompOut(x,y,z):0;
  case 'dust':{if(!r.lvl)return 0;if(d===0)return r.lvl;if(d===1)return 0;const pts=rsDustPoints(x,y,z);const hi=[null,null,0,2,3,1][d];return pts[hi]?r.lvl:0;}
  case 'daylight':return RS_DAY.get(pk3(x,y,z))||0;
  case 'rail':return r.type==='detector'&&r.on?15:0;}
  return 0;}
function rsStrong(x,y,z,d){const b=getB(x,y,z);const r=RSK(b);if(!r)return 0;
  switch(r.k){
  case 'lever':case 'button':return r.on&&d===f6Of(...F6[r.s])?15:0;
  case 'plate':return r.on&&d===0?rsPlateLvl(x,y,z,r):0;
  case 'torch':return r.on&&d===1?15:0;
  case 'rep':return r.on&&d===f6Of(...DIRS4[r.f])?15:0;
  case 'comp':return d===f6Of(...DIRS4[r.f])?rsCompOut(x,y,z):0;
  case 'rail':return r.type==='detector'&&r.on&&d===0?15:0;}
  return 0;}
// power a solid block gets: strong (from levers/torches/repeaters...) and any (also from dust)
function blockStrong(x,y,z){let m=0;for(let d=0;d<6;d++){const [dx,dy,dz]=F6[d];const v=rsStrong(x+dx,y+dy,z+dz,OPPF[d]);if(v>m)m=v;}return m;}
function blockPower(x,y,z){let m=0;for(let d=0;d<6;d++){const [dx,dy,dz]=F6[d];const v=rsEmit(x+dx,y+dy,z+dz,OPPF[d]);if(v>m)m=v;}return m;}
// power a mechanism at (x,y,z) receives (skip one side, e.g. a piston's face)
function rsInput(x,y,z,skip){let m=0;for(let d=0;d<6;d++){if(d===skip)continue;const [dx,dy,dz]=F6[d];const nx=x+dx,ny=y+dy,nz=z+dz;const nb=getB(nx,ny,nz);
    const v=RSK(nb)||nb===B.REDSTONE?rsEmit(nx,ny,nz,OPPF[d]):rsCond(nb)?blockPower(nx,ny,nz):0;if(v>m)m=v;if(m>=15)break;}return m;}
// ---- dust: links to other dust (flat, up a block side, down a block side) and which sides it points to ----
const isDust=b=>{const r=RSK(b);return !!(r&&r.k==='dust');};
function dustLinks(x,y,z){const out=[];const upOpen=!rsCond(getB(x,y+1,z));
  for(let i=0;i<4;i++){const [dx,,dz]=DIRS4[i];const nx=x+dx,nz=z+dz;const nb=getB(nx,y,nz);
    if(isDust(nb))out.push([nx,y,nz,i]);else{if(upOpen&&rsCond(nb)&&isDust(getB(nx,y+1,nz)))out.push([nx,y+1,nz,i]);if(!rsCond(nb)&&isDust(getB(nx,y-1,nz)))out.push([nx,y-1,nz,i]);}}
  return out;}
function dustConnects(b,i){const r=RSK(b);if(b===B.REDSTONE)return true;if(!r)return false;
  switch(r.k){case 'lever':case 'button':case 'plate':case 'torch':case 'daylight':return true;case 'rep':return r.f%2===i%2;case 'comp':return r.f%2===i%2;case 'rail':return r.type==='detector';}return false;}
function rsDustPoints(x,y,z){const p=[false,false,false,false];let n=0;const L=dustLinks(x,y,z);for(const l of L)if(!p[l[3]]){p[l[3]]=true;n++;}
  for(let i=0;i<4;i++){if(p[i])continue;const [dx,,dz]=DIRS4[i];if(dustConnects(getB(x+dx,y,z+dz),i)){p[i]=true;n++;}}
  if(n===0)return [true,true,true,true];if(n===1){for(let i=0;i<4;i++)if(p[i]){p[(i+2)%4]=true;break;}}return p;}
// the dust shape: a cross centre with arms toward its connections, or one straight line, and lines up the sides of blocks
function rsDustBoxes(x,y,z,L){const D=BD[RS.dust[L]];const [ct,lt,lz]=D.dust;const p=rsDustPoints(x,y,z);const h=1/64,o=[];
  const all=p[0]&&p[1]&&p[2]&&p[3];const ns=p[0]&&p[2]&&!p[1]&&!p[3],ew=p[1]&&p[3]&&!p[0]&&!p[2];
  if(ns)o.push([0,0,0,1,h,1,lz]);else if(ew)o.push([0,0,0,1,h,1,lt]);
  else if(all&&!dustLinks(x,y,z).length&&![0,1,2,3].some(i=>dustConnects(getB(x+DIRS4[i][0],y,z+DIRS4[i][2]),i)))o.push([0,0,0,1,h,1,ct]);
  else{o.push([5/16,0,5/16,11/16,h,11/16,ct]);const arm=[[5/16,0,0,11/16,h,5/16],[11/16,0,5/16,1,h,11/16],[5/16,0,11/16,11/16,h,1],[0,0,5/16,5/16,h,11/16]];for(let i=0;i<4;i++)if(p[i])o.push(arm[i].concat([ct]));}
  // climbing the side of a block to dust on top of it
  if(!rsCond(getB(x,y+1,z)))for(let i=0;i<4;i++){const [dx,,dz]=DIRS4[i];if(rsCond(getB(x+dx,y,z+dz))&&isDust(getB(x+dx,y+1,z+dz))){const w=[[0,0,0,1,1,h],[1-h,0,0,1,1,1],[0,0,1-h,1,1,1],[0,0,0,h,1,1]][i];o.push(w.concat([i%2?lz:lt]));}}
  return o;}

// ---- scheduling ----
const COMPS=new Set(),RSQ=new Set(),RST=[],RS_DAY=new Map(),RS_EDGE=new Map(),RS_COMP=new Map(),RS_BURN=new Map(),RS_PLATES=new Set(),RS_SENSORS=new Set(),HOPPERS=new Set();
let rsTick=0,rsAcc=0,rsBusy=0;
const rsAuth=()=>INF&&MATCH.mode==='survival'&&(!net||isHost()||dimLocal());
function rsNotify(x,y,z){if(!rsAuth())return;RSQ.add(pk3(x,y,z));for(const [dx,dy,dz] of F6){const nx=x+dx,ny=y+dy,nz=z+dz;RSQ.add(pk3(nx,ny,nz));
    if(rsCond(getB(nx,ny,nz)))for(const [ex,ey,ez] of F6)RSQ.add(pk3(nx+ex,ny+ey,nz+ez));}
  // dust two blocks away along a line, and dust going up or down a step
  for(const [dx,,dz] of DIRS4){RSQ.add(pk3(x+dx,y+1,z+dz));RSQ.add(pk3(x+dx,y-1,z+dz));}}
function rsLater(delay,x,y,z,fn,tag){const k=pk3(x,y,z)+'|'+(tag||'');if(RST.some(t=>t.k===k))return;RST.push({t:rsTick+delay,x,y,z,fn,k});}
const rsPending=(x,y,z,tag)=>RST.some(t=>t.k===pk3(x,y,z)+'|'+(tag||''));
// set blocks from the engine (one batch per tick, sent to other players)
let rsBatch=[];
function rsSet(x,y,z,b){if(getB(x,y,z)===b)return;rsBatch.push(x,y,z,b);applyBlockList([x,y,z,b],false);}
function rsFlush(){if(rsBatch.length&&net)netSend(N.BOOM,{l:rsBatch});rsBatch=[];}
// a block changed anywhere: wake the circuits around it
{const a0=applyBlock;applyBlock=function(x,y,z,b){const was=getB(x,y,z);a0(x,y,z,b);if(INF&&was!==getB(x,y,z))rsChanged(x,y,z,was,getB(x,y,z));};}
{const l0=applyBlockList;applyBlockList=function(list,fx){const was=[];if(INF)for(let i=0;i<list.length;i+=4)was.push(getB(list[i],list[i+1],list[i+2]));l0(list,fx);
  if(INF)for(let i=0;i<list.length;i+=4){const x=list[i],y=list[i+1],z=list[i+2];const nb=getB(x,y,z);if(was[i/4]!==nb)rsChanged(x,y,z,was[i/4],nb);}};}
function rsChanged(x,y,z,was,b){const R=RSK(b),W=RSK(was);
  if(R&&R.k==='plate')RS_PLATES.add(pk3(x,y,z));if(R&&R.k==='daylight')RS_SENSORS.add(pk3(x,y,z));if(R&&R.k==='hopper')HOPPERS.add(pk3(x,y,z));if(R&&R.k==='comp')COMPS.add(pk3(x,y,z));
  containerSync(x,y,z,was,b);rsNotify(x,y,z);}
// chunks that load with circuits in them: find their plates, sensors and hoppers
{const g0=genChunk;genChunk=function(cx,cz){const r=g0(cx,cz);const ed=worldEdits.get(ckey(cx,cz));if(ed)for(const [li,v] of ed){const R=RSK(v);if(!R)continue;const x=cx*16+(li&15),y=li>>8,z=cz*16+((li>>4)&15);
    if(R.k==='plate')RS_PLATES.add(pk3(x,y,z));else if(R.k==='daylight')RS_SENSORS.add(pk3(x,y,z));else if(R.k==='hopper')HOPPERS.add(pk3(x,y,z));else if(R.k==='comp')COMPS.add(pk3(x,y,z));}return r;};}

// ---- evaluating one position ----
const dustDone=new Set();
function rsEval(x,y,z){const b=getB(x,y,z);const r=RSK(b);if(!r){if(b===B.TNT&&rsInput(x,y,z)>0){rsSet(x,y,z,0);igniteTNT(x,y,z,4,null);}else if(rotBase(b)===B.NOTEBLOCK)rsEdge(x,y,z,()=>noteBlockPlay(x,y,z));
    else{const D=BD[b];if(D&&D.door)rsDoor(x,y,z,D);else if(D&&D.trap)rsTrap(x,y,z,D);else if(b===B.COMMAND_BLOCK)rsEdge(x,y,z,()=>cmdBlockRun(x,y,z));}return;}
  switch(r.k){
  case 'dust':if(!dustDone.has(pk3(x,y,z)))rsSolveDust(x,y,z);break;
  case 'torch':{const sx=x+(r.a<0?0:DIRS4[r.a][0]),sy=y+(r.a<0?-1:0),sz=z+(r.a<0?0:DIRS4[r.a][2]);const sb=getB(sx,sy,sz);
    const pw=rsCond(sb)?blockPower(sx,sy,sz)>0:false;const want=!pw;const bt=RS_BURN.get(pk3(x,y,z));if(bt&&bt.until>rsTick&&want)break;
    if(want!==!!r.on)rsLater(2,x,y,z,()=>{const c=RSK(getB(x,y,z));if(!c||c.k!=='torch')return;const sb2=getB(sx,sy,sz);const w2=!(rsCond(sb2)&&blockPower(sx,sy,sz)>0);if(w2===!!c.on)return;
      // burnout: a torch flicking too fast goes dark for a while
      let B2=RS_BURN.get(pk3(x,y,z));if(!B2||B2.t0<rsTick-60){B2={t0:rsTick,n:0,until:0};RS_BURN.set(pk3(x,y,z),B2);}B2.n++;
      if(w2&&B2.n>8){B2.until=rsTick+160;spawnParticles(x+.5,y+.7,z+.5,6,[.3,.3,.3],1);psnd(['random/fizz'],[x,y,z],.4);return;}
      rsSet(x,y,z,c.a<0?RS.torch.stand[w2?1:0]:RS.torch.wall[c.a][w2?1:0]);},'t');break;}
  case 'rep':{const lock=repLocked(x,y,z,r);if(lock!==!!r.lock)rsSet(x,y,z,RS.rep[r.f][r.d][r.on][lock?1:0]);if(lock)break;
    const want=repInput(x,y,z,r)>0;if(want!==!!r.on)rsLater(r.d*2,x,y,z,()=>{const c=RSK(getB(x,y,z));if(!c||c.k!=='rep'||c.lock)return;const w2=repInput(x,y,z,c)>0;
      // a short pulse still gets through once
      const v=w2!==!!c.on?w2:!c.on&&want;if(v!==!!c.on)rsSet(x,y,z,RS.rep[c.f][c.d][v?1:0][0]);if(!w2&&v)rsLater(c.d*2,x,y,z,()=>rsEval(x,y,z),'re');},'r');break;}
  case 'comp':{const out=compCalc(x,y,z,r);const cur=RS_COMP.get(pk3(x,y,z))||0;if(out!==cur)rsLater(2,x,y,z,()=>{const c=RSK(getB(x,y,z));if(!c||c.k!=='comp')return;const o2=compCalc(x,y,z,c);RS_COMP.set(pk3(x,y,z),o2);
      const id=RS.comp[c.f][c.sub][o2>0?1:0];if(getB(x,y,z)!==id)rsSet(x,y,z,id);else rsNotify(x,y,z);},'c');break;}
  case 'lamp':{const p=rsInput(x,y,z)>0;if(p&&!r.on)rsSet(x,y,z,RS.lamp[1]);else if(!p&&r.on)rsLater(4,x,y,z,()=>{const c=RSK(getB(x,y,z));if(c&&c.k==='lamp'&&c.on&&!(rsInput(x,y,z)>0))rsSet(x,y,z,RS.lamp[0]);},'l');break;}
  case 'piston':{const p=rsInput(x,y,z,r.f)>0||rsInput(x,y+1,z,0)>0&&false;if(p&&!r.ext)rsLater(0,x,y,z,()=>pistonExtend(x,y,z),'p');else if(!p&&r.ext)rsLater(0,x,y,z,()=>pistonRetract(x,y,z),'p');break;}
  case 'head':{const [dx,dy,dz]=F6[r.f];const bb=RSK(getB(x-dx,y-dy,z-dz));if(!bb||bb.k!=='piston'||!bb.ext)rsSet(x,y,z,0);break;}
  case 'button':if(r.on&&!rsPending(x,y,z,'b'))rsLater(r.wood?30:20,x,y,z,()=>{const c=RSK(getB(x,y,z));if(c&&c.k==='button'&&c.on){rsSet(x,y,z,RS.button[c.wood?'wood':'stone'][c.s][0]);psnd(['random/click'],[x,y,z],.3,.5);}},'b');break;
  case 'disp':rsEdge(x,y,z,()=>rsLater(4,x,y,z,()=>dispense(x,y,z),'d'));break;
  case 'rail':if(r.type==='golden'||r.type==='activator')railPower(x,y,z,r);break;
  case 'daylight':break;}}
// act once when power arrives (note blocks, dispensers, command blocks)
function rsEdge(x,y,z,fn){const k=pk3(x,y,z);const p=rsInput(x,y,z)>0;const was=!!RS_EDGE.get(k);if(p!==was){RS_EDGE.set(k,p);if(p)fn();}}
// doors and trapdoors follow the power when it changes (wooden ones can still be opened by hand)
function rsDoor(x,y,z,D){const d=D.door;const lo=d.u?y-1:y;const L=BD[getB(x,lo,z)];if(!L||!L.door)return;const k=pk3(x,lo,z);const p=rsInput(x,lo,z)>0||rsInput(x,lo+1,z)>0;const was=RS_EDGE.get(k);
  RS_EDGE.set(k,p);if(was===undefined&&!p)return;if(p===was)return;if(!!L.door.open===p)return;const nb=d.first+L.door.f*4+(p?2:0);rsSet(x,lo,z,nb);rsSet(x,lo+1,z,nb+1);psnd(p?DOOR_SND.open:DOOR_SND.close,[x,y,z],.6,1);}
function rsTrap(x,y,z,D){const t=D.trap;const k=pk3(x,y,z);const p=rsInput(x,y,z)>0;const was=RS_EDGE.get(k);RS_EDGE.set(k,p);if(was===undefined&&!p)return;if(p===was)return;const open=t.s>=2;if(open===p)return;
  rsSet(x,y,z,t.first+t.f*4+(p?t.s+2:t.s-2));psnd(p?DOOR_SND.open:DOOR_SND.close,[x,y,z],.5,1.2);}
// ---- dust networks ----
function dustExt(x,y,z){let m=0;for(let d=0;d<6;d++){const [dx,dy,dz]=F6[d];const nx=x+dx,ny=y+dy,nz=z+dz;const nb=getB(nx,ny,nz);if(isDust(nb))continue;
    const v=RSK(nb)||nb===B.REDSTONE?rsEmit(nx,ny,nz,OPPF[d]):rsCond(nb)?blockStrong(nx,ny,nz):0;if(v>m)m=v;}return m;}
function rsSolveDust(x,y,z){const seen=new Map(),order=[];const q=[[x,y,z]];seen.set(pk3(x,y,z),0);
  while(q.length&&order.length<1500){const p=q.shift();order.push(p);for(const l of dustLinks(p[0],p[1],p[2])){const k=pk3(l[0],l[1],l[2]);if(!seen.has(k)){seen.set(k,0);q.push(l);}}}
  for(const p of order){const k=pk3(p[0],p[1],p[2]);dustDone.add(k);seen.set(k,dustExt(p[0],p[1],p[2]));}
  // spread: each level passes level-1 along the links
  const buckets=[];for(let i=0;i<16;i++)buckets.push([]);for(const p of order){const v=seen.get(pk3(...p));if(v>0)buckets[v].push(p);}
  for(let L=15;L>1;L--)for(const p of buckets[L]){if(seen.get(pk3(...p))!==L)continue;for(const l of dustLinks(p[0],p[1],p[2])){const k=pk3(l[0],l[1],l[2]);if(seen.has(k)&&seen.get(k)<L-1){seen.set(k,L-1);buckets[L-1].push(l);}}}
  for(const p of order){const v=seen.get(pk3(...p));const id=RS.dust[v];if(getB(p[0],p[1],p[2])!==id)rsSet(p[0],p[1],p[2],id);}}
// ---- repeaters and comparators ----
function repInput(x,y,z,r){const [dx,,dz]=DIRS4[r.f];const bx=x-dx,bz=z-dz;const nb=getB(bx,y,bz);const back=f6Of(dx,0,dz);
  if(RSK(nb)||nb===B.REDSTONE)return rsEmit(bx,y,bz,back);if(rsCond(nb))return blockPower(bx,y,bz);return 0;}
function sideIn(x,y,z,r,diodes){let m=0;for(const s of [(r.f+1)%4,(r.f+3)%4]){const [dx,,dz]=DIRS4[s];const nb=getB(x+dx,y,z+dz);const R=RSK(nb);if(!R&&nb!==B.REDSTONE)continue;
    if(diodes&&!(R&&(R.k==='rep'||R.k==='comp')))continue;m=Math.max(m,rsEmit(x+dx,y,z+dz,f6Of(-dx,0,-dz)));}return m;}
const repLocked=(x,y,z,r)=>sideIn(x,y,z,r,true)>0;
function rsCompOut(x,y,z){return RS_COMP.get(pk3(x,y,z))||0;}
function compCalc(x,y,z,r){const [dx,,dz]=DIRS4[r.f];const bx=x-dx,bz=z-dz;let a=repInput(x,y,z,r);
  // reading a container (or one behind a solid block)
  let cv=containerLevel(bx,y,bz);if(cv==null&&rsCond(getB(bx,y,bz)))cv=containerLevel(bx-dx,y,bz-dz);if(cv!=null)a=Math.max(a,cv);
  const s=sideIn(x,y,z,r,false);return r.sub?Math.max(0,a-s):(a>=s?a:0);}
function containerLevel(x,y,z){const b=getB(x,y,z);if(!b)return null;const rb=rotBase(b);
  const c=chests.get(pk3(x,y,z));if(c&&(rb===B.CHEST||RSK(b)&&(RSK(b).k==='disp'||RSK(b).k==='hopper')))return fullness(c.items);
  if(rb===B.FURNACE){const f=FURN.get(pk3(x,y,z));return f?fullness([f.in,f.fuel,f.out]):0;}
  if(b===B.JUKEBOX)return JUKE.pos&&JUKE.pos[0]===x&&JUKE.pos[1]===y&&JUKE.pos[2]===z&&JUKE.disc?RECORDS.indexOf(ITEMS[JUKE.disc].disc)+1:0;
  if(BD[b].cake!=null)return (7-BD[b].cake)*2;if(rb===B.CAULDRON)return b===B.CAULDRON_W?3:0;return null;}
function fullness(items){let s=0,any=false;for(const it of items){if(!it)continue;any=true;s+=it.count/stackMax(it.id);}return any?Math.floor(1+s/items.length*14):0;}
// ---- pressure plates and daylight sensors ----
function plateCount(x,y,z,type){let n=0;const box=[x+1/16,y,z+1/16,x+15/16,y+.25,z+15/16];const hit=(p,hw,h)=>p[0]+hw>box[0]&&p[0]-hw<box[3]&&p[2]+hw>box[2]&&p[2]-hw<box[5]&&p[1]<box[4]&&p[1]+h>box[1];
  for(const e of ents)if(e.alive&&!e.spectator&&hit(e.pos,e.hw||.3,e.eh||1.8))n++;for(const m of mobs)if(m.alive&&hit(m.pos,m.hw||.3,m.eh||1))n++;
  if(type!=='stone')for(const d of drops)if(hit(d.pos,.125,.25))n+=type==='wood'?1:d.count||1;return n;}
function rsPlateLvl(x,y,z,r){const n=plateCount(x,y,z,r.type);return r.type==='gold'?Math.min(15,n):r.type==='iron'?Math.min(15,Math.ceil(n/10)):n?15:0;}
function plateTick(){for(const k of RS_PLATES){const [x,y,z]=k.split(',').map(Number);if(!inB(x,y,z))continue;const r=RSK(getB(x,y,z));if(!r||r.k!=='plate'){RS_PLATES.delete(k);continue;}
    const n=plateCount(x,y,z,r.type);const on=n>0;if(on&&!r.on){rsSet(x,y,z,RS.plate[r.type][1]);psnd(['random/click'],[x,y,z],.3,.6);}
    else if(!on&&r.on&&!rsPending(x,y,z,'u'))rsLater(r.type==='gold'||r.type==='iron'?10:20,x,y,z,()=>{const c=RSK(getB(x,y,z));if(c&&c.k==='plate'&&c.on&&!plateCount(x,y,z,c.type)){rsSet(x,y,z,RS.plate[c.type][0]);psnd(['random/click'],[x,y,z],.3,.5);}},'u');
    else if(on&&(r.type==='gold'||r.type==='iron'))rsNotify(x,y,z);}}
function daylightTick(){const day=dayAmt();for(const k of RS_SENSORS){const [x,y,z]=k.split(',').map(Number);if(!inB(x,y,z))continue;const r=RSK(getB(x,y,z));if(!r||r.k!=='daylight'){RS_SENSORS.delete(k);RS_DAY.delete(k);continue;}
    const sky=(lightAt(x,y,z)>>4)&15;let v=Math.round(sky*Math.max(0,Math.min(1,(day-.15)/.7)));if(r.inv)v=15-v;if(RS_DAY.get(k)!==v){RS_DAY.set(k,v);rsNotify(x,y,z);}}}
// ---- powered and activator rails: powered directly, or through up to 8 rails of a powered line ----
function railPower(x,y,z,r){const want=railPowered(x,y,z,r.type);if(want!==!!r.on){rsSet(x,y,z,RS.rail[r.type][want?1:0][r.shape]);}}
function railPowered(x,y,z,type){if(rsInput(x,y,z)>0||rsInput(x,y-1,z)>0&&false)return true;
  for(const dir of [1,-1]){let cx=x,cy=y,cz=z,shape=RSK(getB(x,y,z)).shape;for(let n=0;n<8;n++){const ex=RAIL_EXITS[shape];const e=dir>0?ex[1]:ex[0];cx+=e[0];cz+=e[2];
      let nb=getB(cx,cy+e[1],cz),R=RSK(nb);if(R&&R.k==='rail')cy+=e[1];else{nb=getB(cx,cy-1,cz);R=RSK(nb);if(R&&R.k==='rail')cy-=1;else break;}
      if(R.type!==type)break;if(rsInput(cx,cy,cz)>0)return true;shape=R.shape;}}return false;}
const RAIL_EXITS=[[[0,0,-1],[0,0,1]],[[-1,0,0],[1,0,0]],[[-1,0,0],[1,1,0]],[[-1,1,0],[1,0,0]],[[0,1,-1],[0,0,1]],[[0,0,-1],[0,1,1]],[[0,0,1],[1,0,0]],[[0,0,1],[-1,0,0]],[[0,0,-1],[-1,0,0]],[[0,0,-1],[1,0,0]]];

// ---- pistons ----
const PISTON_IMMOVABLE=b=>{const D=BD[b];if(!D)return true;const rb=rotBase(b);const r=D.rs;
  return b===B.OBSIDIAN||b===B.BEDROCK||b===28||D.portal||rb===B.CHEST||rb===B.FURNACE||rb===B.BEACON||rb===B.ENCHANT_TABLE||rb===B.JUKEBOX||b===B.COMMAND_BLOCK||rb===B.NOTEBLOCK||rb===B.BREWING_STAND||rb===B.ANVIL||rb===B.DAYLIGHT||
    rb===B.SPAWNER||(r&&((r.k==='piston'&&r.ext)||r.k==='head'||r.k==='disp'||r.k==='hopper'||r.k==='comp'||r.k==='daylight'))||D.banner||b===B.END_PORTAL_FRAME||D.liquid&&false;};
const PISTON_BREAKS=b=>{const D=BD[b];if(!D)return false;return D.cross||D.crop!=null||D.sapling||D.pick||D.rail||D.door||D.cake!=null||b===B.FLOWER_POT||D.fire||(D.rs&&['dust','torch','lever','button','plate','rep'].includes(D.rs.k))||b===B.LADDER||(BD[b].ladder)||b===B.WEB;};
function pushPlan(sx,sy,sz,f,px,py,pz){const [dx,dy,dz]=F6[f];const q=[[sx,sy,sz]];const seen=new Set([pk3(sx,sy,sz)]);const move=[],destroy=[];
  while(q.length){const [x,y,z]=q.shift();const b=getB(x,y,z);if(!b||(BD[b]&&BD[b].liquid))continue;if(y<1||y>=WY-1)return null;
    if(PISTON_BREAKS(b)){destroy.push([x,y,z,b]);continue;}if(PISTON_IMMOVABLE(b))return null;move.push([x,y,z,b]);if(move.length>12)return null;
    const nx=x+dx,ny=y+dy,nz=z+dz;if(!seen.has(pk3(nx,ny,nz))){seen.add(pk3(nx,ny,nz));q.push([nx,ny,nz]);}
    if(b===B.SLIME)for(let d2=0;d2<6;d2++){if(d2===f||d2===OPPF[f])continue;const [ex,ey,ez]=F6[d2];const ox=x+ex,oy=y+ey,oz=z+ez;if(ox===px&&oy===py&&oz===pz)continue;const ob=getB(ox,oy,oz);
      if(!ob||BD[ob].liquid||PISTON_BREAKS(ob)||PISTON_IMMOVABLE(ob))continue;if(!seen.has(pk3(ox,oy,oz))){seen.add(pk3(ox,oy,oz));q.push([ox,oy,oz]);}}}
  return {move,destroy};}
function applyMove(plan,f,extra){const [dx,dy,dz]=F6[plan.dir!=null?plan.dir:f];const list=[];const dest=new Set(plan.move.map(([x,y,z])=>pk3(x+dx,y+dy,z+dz)));
  for(const [x,y,z,b] of plan.destroy){const d=mineDrops(b,null);if(d&&ITEMS[d]&&MATCH.mode==='survival')requestDrop([x+.5,y+.3,z+.5],d,1);list.push(x,y,z,0);}
  for(const [x,y,z] of plan.move)if(!dest.has(pk3(x,y,z)))list.push(x,y,z,0);
  for(const [x,y,z,b] of plan.move)list.push(x+dx,y+dy,z+dz,b);if(extra)list.push(...extra);
  // things in the way get shoved along
  for(const e of ents.concat(mobs)){if(!e.alive)continue;for(const [x,y,z] of plan.move.concat(extra?[[extra[0],extra[1],extra[2]]]:[])){const X=x+dx,Y=y+dy,Z=z+dz;
      if(e.pos[0]+(e.hw||.3)>X&&e.pos[0]-(e.hw||.3)<X+1&&e.pos[2]+(e.hw||.3)>Z&&e.pos[2]-(e.hw||.3)<Z+1&&e.pos[1]<Y+1&&e.pos[1]+(e.eh||1.8)>Y){e.pos[0]+=dx;e.pos[1]+=dy>0?dy+.01:dy;e.pos[2]+=dz;if(e===player&&player.mot)player.mot[1]=Math.max(player.mot[1],0);break;}}}
  for(let i=0;i<list.length;i+=4)rsSet(list[i],list[i+1],list[i+2],list[i+3]);}
function pistonExtend(x,y,z){const r=RSK(getB(x,y,z));if(!r||r.k!=='piston'||r.ext)return;if(!(rsInput(x,y,z,r.f)>0))return;const [dx,dy,dz]=F6[r.f];
  const plan=pushPlan(x+dx,y+dy,z+dz,r.f,x,y,z);if(!plan)return;const k=r.sticky?'s':'n';
  applyMove(plan,r.f,[x+dx,y+dy,z+dz,RS.head[k][r.f]]);rsSet(x,y,z,RS.piston[k][r.f][1]);psnd(['tile/piston/out'],[x,y,z],.5,.8+Math.random()*.25);}
function pistonRetract(x,y,z){const r=RSK(getB(x,y,z));if(!r||r.k!=='piston'||!r.ext)return;if(rsInput(x,y,z,r.f)>0)return;const [dx,dy,dz]=F6[r.f];const k=r.sticky?'s':'n';
  const hr=RSK(getB(x+dx,y+dy,z+dz));if(hr&&hr.k==='head')rsSet(x+dx,y+dy,z+dz,0);rsSet(x,y,z,RS.piston[k][r.f][0]);
  if(r.sticky){const fx=x+2*dx,fy=y+2*dy,fz=z+2*dz;const fb=getB(fx,fy,fz);if(fb&&!BD[fb].liquid&&!PISTON_IMMOVABLE(fb)&&!PISTON_BREAKS(fb)){const plan=pushPlan(fx,fy,fz,OPPF[r.f],x,y,z);if(plan&&!plan.destroy.length){plan.dir=OPPF[r.f];applyMove(plan,OPPF[r.f]);}}}
  psnd(['tile/piston/in'],[x,y,z],.5,.7+Math.random()*.2);}

// ---- dispensers, droppers and hoppers: their items live with the chests ----
function contSize(b){const r=RSK(b);return r&&r.k==='disp'?9:r&&r.k==='hopper'?5:0;}
function containerSync(x,y,z,was,b){const n=contSize(b),k=pk3(x,y,z);if(n&&!chests.has(k))chests.set(k,{x,y,z,items:new Array(n).fill(null)});
  if(!n&&contSize(was)){const c=chests.get(k);if(c){if(MATCH.mode==='survival'&&rsAuth())for(const s of c.items)if(s)requestDrop([x+.5,y+.5,z+.5],s.id,s.count);chests.delete(k);if(chestOpen===c)chestClose(true);}}}
function contPush(k){if(net&&isHost()){const c=chests.get(k);if(c)netSend(N.CHEST,{k,items:c.items});}const c=chests.get(k);if(c&&chestOpen===c)renderChest();}
function contAdd(items,s){for(let i=0;i<items.length;i++){const t=items[i];if(t&&t.id===s.id&&!t.dmg&&!s.dmg&&!t.tag&&!s.tag&&t.count<stackMax(t.id)){t.count++;return true;}}
  for(let i=0;i<items.length;i++)if(!items[i]){items[i]=Object.assign({},s,{count:1});return true;}return false;}
// put one item into whatever container is at (x,y,z); from = F6 side it comes in from (furnaces: top -> input, sides -> fuel)
function insertInto(x,y,z,s,from){const b=getB(x,y,z);const k=pk3(x,y,z);const c=chests.get(k);
  if(c&&(rotBase(b)===B.CHEST||contSize(b))){if(contAdd(c.items,s)){contPush(k);return true;}return false;}
  if(rotBase(b)===B.FURNACE){const f=furnAt(k);const slot=from===1?'in':'fuel';if(slot==='fuel'&&!FUEL[s.id])return false;const cur=f[slot];
    if(!cur){f[slot]=Object.assign({},s,{count:1});return true;}if(cur.id===s.id&&cur.count<stackMax(s.id)){cur.count++;return true;}}return false;}
function takeOne(x,y,z,toDown){const b=getB(x,y,z);const k=pk3(x,y,z);const c=chests.get(k);
  if(c&&(rotBase(b)===B.CHEST||contSize(b))){for(let i=0;i<c.items.length;i++){const s=c.items[i];if(!s)continue;const one=Object.assign({},s,{count:1});return {s:one,undo:()=>{if(c.items[i])c.items[i].count++;else c.items[i]=one;},done:()=>{s.count--;if(s.count<=0)c.items[i]=null;contPush(k);}};}return null;}
  if(rotBase(b)===B.FURNACE){const f=FURN.get(k);if(f&&f.out){const s=f.out;return {s:Object.assign({},s,{count:1}),done:()=>{s.count--;if(s.count<=0)f.out=null;}};}}return null;}
function hopperTick(){for(const k of HOPPERS){const [x,y,z]=k.split(',').map(Number);if(!inB(x,y,z))continue;const r=RSK(getB(x,y,z));if(!r||r.k!=='hopper'){HOPPERS.delete(k);continue;}
    const c=chests.get(k);if(!c)continue;if(rsInput(x,y,z)>0)continue;   // powered hoppers are locked
    // push one item out of the spout
    const [tx,ty,tz]=r.a<0?[x,y-1,z]:[x+DIRS4[r.a][0],y,z+DIRS4[r.a][2]];
    for(let i=0;i<c.items.length;i++){const s=c.items[i];if(!s)continue;if(insertInto(tx,ty,tz,s,r.a<0?1:2)){s.count--;if(s.count<=0)c.items[i]=null;contPush(k);rsNotify(tx,ty,tz);rsNotify(x,y,z);}break;}
    // pull one from above: a container, or items lying in the hopper's bowl
    const t=takeOne(x,y+1,z);if(t){if(contAdd(c.items,t.s)){t.done();contPush(k);rsNotify(x,y+1,z);rsNotify(x,y,z);}}
    else{for(const d of drops){if(d.dead)continue;if(Math.floor(d.pos[0])===x&&Math.floor(d.pos[2])===z&&d.pos[1]>=y+.5&&d.pos[1]<y+1.8){if(contAdd(c.items,{id:d.id,count:1,tag:d.tag})){d.count--;if(d.count<=0){d.count=0;hopperEat(d);}contPush(k);rsNotify(x,y,z);}break;}}}}}
function hopperEat(d){d.dead=true;if(net)netSend(N.DROPDEL,{did:d.did});}
// what a dispenser does with the item it picks
function dispense(x,y,z){const b=getB(x,y,z);const r=RSK(b);if(!r||r.k!=='disp')return;const k=pk3(x,y,z);const c=chests.get(k);if(!c)return;
  const full=c.items.map((s,i)=>s?i:-1).filter(i=>i>=0);if(!full.length){psnd(['random/click'],[x,y,z],.4,1.2);return;}const i=full[Math.random()*full.length|0];const s=c.items[i];const id=s.id,it=ITEMS[id];
  const [dx,dy,dz]=F6[r.f];const fx=x+dx,fy=y+dy,fz=z+dz;const at=[x+.5+dx*.7,y+.5+dy*.7-(dy?0:.15),z+.5+dz*.7];const fb=getB(fx,fy,fz);
  const use=()=>{s.count--;if(s.count<=0)c.items[i]=null;contPush(k);};const dropIt=()=>{const v=[dx*3+(Math.random()-.5),dy*3+1.5,dz*3+(Math.random()-.5)];requestDrop([at[0],at[1]-1,at[2]],id,1,v);use();};
  psnd(['random/click'],[x,y,z],.4,1);spawnParticles(at[0],at[1],at[2],5,[.5,.5,.5],1);
  if(r.drop){if(fb&&insertInto(fx,fy,fz,s,OPPF[r.f])){use();rsNotify(fx,fy,fz);}else dropIt();return;}
  const vel=sp=>[dx*sp,dy*sp+.1,dz*sp];
  if(id==='arrow'){spawnProj('arrow',at,vel(1.1),null,1);use();sfx('bow',{pos:at});return;}
  if(it.type==='potion'&&/^splash_/.test(id)){spawnProj('splash',at,vel(.5),null,0,id);use();return;}
  if(id==='experience_bottle'){spawnProj('splash',at,vel(.5),null,0,id);use();return;}
  if(id==='fire_charge'){{fireballSpawn('small',at,[dx*16,dy*16,dz*16],null);use();return;}if(!fb&&lightFire(fx,fy,fz)){use();return;}}
  if(id==='flint_and_steel'){if(fb===B.TNT){rsSet(fx,fy,fz,0);igniteTNT(fx,fy,fz,4,null);}else if(!lightFire(fx,fy,fz))return;s.dmg=(s.dmg||0)+1;if(s.dmg>=maxDur(id))c.items[i]=null;contPush(k);return;}
  if(id==='water_bucket'||id==='lava_bucket'){if(!fb||replaceable(fb)){rsSet(fx,fy,fz,id==='water_bucket'?B.WATER:B.LAVA);c.items[i]={id:'bucket',count:1};contPush(k);wakeAround(fx,fy,fz);}else dropIt();return;}
  if(id==='bucket'){if(fb===B.WATER||fb===B.LAVA){rsSet(fx,fy,fz,0);const out=fb===B.WATER?'water_bucket':'lava_bucket';use();if(!contAdd(c.items,{id:out,count:1}))requestDrop(at,out,1);contPush(k);}else dropIt();return;}
  if(id==='b'+B.TNT){if(!fb||replaceable(fb)){igniteTNT(fx,fy,fz,4,null);use();}else dropIt();return;}
  if(it.spawn){spawnMob(it.spawn,[at[0],fy,at[2]]);use();return;}
  if(id==='bone_meal'&&fb&&BD[fb]){const D=BD[fb];if(D.crop!=null&&D.stage<D.maxStage){cropGrow(fx,fy,fz,fb,2+(Math.random()*3|0));use();return;}if(D.sapling){if(Math.random()<.45)growTree(fx,fy,fz,D.sapling);use();return;}}
  if(id==='fireworks'){launchRocket(at);use();return;}
  if(VEHICLE_ITEMS[id]&&typeof dispenseVehicle==='function'&&dispenseVehicle(id,fx,fy,fz,r.f)){use();return;}
  if(it.type==='armor'){const p=ents.find(e=>e.alive&&e.kind==='player'&&Math.floor(e.pos[0])===fx&&Math.floor(e.pos[2])===fz&&Math.abs(e.pos[1]-fy)<1.5);
    if(p&&!p.armor[it.slot]){if(p===player){p.armor[it.slot]=id;use();return;}}}
  dropIt();}
const VEHICLE_ITEMS={};
const NOTES=RS.notes,NOTE_PITCH=b=>Math.max(0,NOTES.indexOf(b));
// ---- note blocks: 25 pitches, instrument from the block underneath (a made-up chime: no recorded sounds) ----
function noteBlockPlay(x,y,z){const b=getB(x,y,z);if(getB(x,y+1,z))return;const n=NOTE_PITCH(b);const below=getB(x,y-1,z);const m=below?blockMat(below):'';
  const inst=m==='stone'?'bd':m==='sand'||m==='gravel'?'snare':m==='glass'?'hat':m==='wood'?'bass':'harp';noteSound(n,inst,[x+.5,y+.5,z+.5]);spawnParticles(x+.5,y+1.2,z+.5,1,[n/24,1-n/24,.5],.2);
  if(net&&rsAuth())netSend(N.NOTE,{x,y,z,n,i:inst});}
function noteSound(n,inst,pos){if(!actx)return;const d=camPos?dist(pos,camPos):0;if(d>48)return;const v=Math.max(0,1-d/48)*.25;const f=370*Math.pow(2,(n-12)/12)/(inst==='bass'?4:1);const t=actx.currentTime;
  const o=actx.createOscillator(),g=actx.createGain();o.type=inst==='harp'?'triangle':inst==='bass'?'sawtooth':'square';o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+(inst==='harp'?1:.25));
  if(inst==='bd'||inst==='snare'||inst==='hat'){o.type='square';o.frequency.setValueAtTime(inst==='bd'?120:inst==='snare'?300:2000,t);o.frequency.exponentialRampToValueAtTime(inst==='bd'?40:150,t+.15);}
  o.connect(g);g.connect(masterOut||actx.destination);o.start(t);o.stop(t+1.1);}
N.NOTE=70;
// ---- command blocks ----
const CMDS=new Map();
function cmdBlockRun(x,y,z){const c=CMDS.get(pk3(x,y,z));if(!c)return;try{serverCmd({id:null,ent:player,name:'@',local:true,block:[x,y,z]},c);}catch(e){}}
// ---- a small text box (command blocks, name tags...) ----
function askText(title,init,cb){let d=$('askDlg');if(!d){d=document.createElement('div');d.id='askDlg';d.className='screen hidden';
    d.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:80';
    d.innerHTML='<div style="background:#c6c6c6;border:4px solid #373737;box-shadow:inset -4px -4px #555,inset 4px 4px #fff;padding:18px;width:min(460px,90vw);font:18px monospace;color:#404040">'+
      '<div id="askT" style="margin-bottom:10px"></div><input id="askIn" maxlength="200" autocomplete="off" style="width:100%;box-sizing:border-box;font:18px monospace;padding:6px;background:#000;color:#fff;border:2px solid #a0a0a0">'+
      '<div style="margin-top:12px;display:flex;gap:10px;justify-content:flex-end"><button id="askCancel" class="sbtn" style="padding:6px 14px">Cancel</button><button id="askOk" class="sbtn" style="padding:6px 14px">Done</button></div></div>';
    document.body.appendChild(d);OVERLAYS.push('askDlg');if(typeof TOUCH_BLOCK!=='undefined')TOUCH_BLOCK.push('askDlg');}
  const inp=$('askIn');$('askT').textContent=title;inp.value=init||'';ASKOPEN=true;document.exitPointerLock&&document.exitPointerLock();show('askDlg');setTimeout(()=>{inp.focus();inp.select();},30);
  const end=ok=>{hide('askDlg');ASKOPEN=false;inp.onkeydown=null;$('askOk').onclick=null;$('askCancel').onclick=null;for(const k in keys)keys[k]=false;if(ok)cb(inp.value.trim());if(!padActive&&!touchActive)lockPointer();};
  $('askOk').onclick=()=>end(true);$('askCancel').onclick=()=>end(false);inp.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')end(true);else if(e.key==='Escape')end(false);};}

// ---- placing redstone things the way the real game does ----
function placeFace6(p,h){// pistons, dispensers, droppers: face the player, or up/down when they are right above/below
  const px=p.pos[0],pz=p.pos[2],ey=eye(p)[1];if(Math.abs(px-(h.px+.5))<2&&Math.abs(pz-(h.pz+.5))<2){if(ey-h.py>2)return 1;if(h.py-ey>0)return 0;}const L=lookDir(p);return [3,4,2,5][L];}
function rsPlaceId(id,p,h){const D=BD[id];const r=D&&D.rs;const pl=!!h.plant;const nx=pl?0:h.px-h.x,ny=pl?1:h.py-h.y,nz=pl?0:h.pz-h.z;const X=h.px,Y=h.py,Z=h.pz;
  const solidAt=(x,y,z)=>{const b=getB(x,y,z);return !!b&&rsCond(b);};const topOk=solidAt(X,Y-1,Z)||(()=>{const b=getB(X,Y-1,Z);return b&&(BD[b].fence||(VB.SLAB_FULL&&ROT[rotBase(b)]&&ROT[rotBase(b)].kind==='slab'&&ROT[rotBase(b)].v[1]===b)||b===B.GLOW||b===B.HOPPER);})();
  const wallIdx=()=>nz===1?0:nx===-1?1:nz===-1?2:3;   // DIRS4 index of the wall that was clicked
  const L=lookDir(p);
  if(id===B.RS_TORCH){if(ny===1)return topOk?RS.torch.stand[1]:null;if(ny===-1)return null;const a=wallIdx();return solidAt(X+DIRS4[a][0],Y,Z+DIRS4[a][2])?RS.torch.wall[a][1]:null;}
  if(rotBase(id)===XB.lever[0]||(r&&r.k==='button')){const s=ny===1?0:ny===-1?1:[2,5,3,4][wallIdx()];const [sx,sy,sz]=F6[s];if(!solidAt(X+sx,Y+sy,Z+sz))return null;
    return r&&r.k==='button'?RS.button[r.wood?'wood':'stone'][s][0]:RS.lever[s][0];}
  if(r&&r.k==='plate')return topOk||(()=>{const b=getB(X,Y-1,Z);return b&&BD[b].fence;})()?id:null;
  if(id===B.RS_DUST)return topOk?RS.dust[0]:null;
  if(rotBase(id)===B.REPEATER)return topOk?RS.rep[L][1][0][0]:null;
  if(rotBase(id)===B.COMPARATOR)return topOk?RS.comp[L][0][0]:null;
  if(rotBase(id)===B.PISTON)return RS.piston.n[placeFace6(p,h)][0];
  if(rotBase(id)===B.STICKY_PISTON)return RS.piston.s[placeFace6(p,h)][0];
  if(rotBase(id)===B.DISPENSER)return RS.disp.d[placeFace6(p,h)];
  if(rotBase(id)===B.DROPPER)return RS.disp.r[placeFace6(p,h)];
  if(rotBase(id)===B.HOPPER)return ny?RS.hopper[0]:RS.hopper[1+(wallIdx())];
  if(id===B.LAMP)return RS.lamp[0];
  if(r&&r.k==='rail'&&typeof railPlaceShape==='function')return topOk?railPlaceShape(id,X,Y,Z,L):null;
  return undefined;}
{const u0=useSpecial;useSpecial=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival')return u0(p,s);const id=s&&s.id,it=id&&ITEMS[id];const h=raycastBlock(eye(p),fwd(p),4.5,true,true);
  const hb=h&&h.b,R=hb&&RSK(hb),cre=p.gm==='creative';
  // ---- using redstone things ----
  if(h&&!p.sneak){
    if(R&&R.k==='lever'){setBlockNet(h.x,h.y,h.z,RS.lever[R.s][R.on?0:1]);psnd(['random/click'],[h.x,h.y,h.z],.4,R.on?.5:.6);p.swing=1;return true;}
    if(R&&R.k==='button'){if(!R.on){setBlockNet(h.x,h.y,h.z,RS.button[R.wood?'wood':'stone'][R.s][1]);psnd(['random/click'],[h.x,h.y,h.z],.4,.6);}p.swing=1;return true;}
    if(R&&R.k==='rep'){setBlockNet(h.x,h.y,h.z,RS.rep[R.f][R.d%4+1][R.on][R.lock]);psnd(['random/click'],[h.x,h.y,h.z],.3,.55);p.swing=1;return true;}
    if(R&&R.k==='comp'){setBlockNet(h.x,h.y,h.z,RS.comp[R.f][R.sub?0:1][R.on]);psnd(['random/click'],[h.x,h.y,h.z],.3,R.sub?.5:.55);p.swing=1;return true;}
    if(R&&R.k==='daylight'){setBlockNet(h.x,h.y,h.z,RS.daylight[R.inv?0:1]);p.swing=1;return true;}
    if(R&&(R.k==='disp'||R.k==='hopper')){const c=chests.get(pk3(h.x,h.y,h.z));if(c){chestOpen=c;sfx('chest');document.exitPointerLock&&document.exitPointerLock();show('chestUI');
        const lab=$('chestSub').querySelector('.lab');if(lab)pxSet(lab,R.k==='hopper'?'Item Hopper':R.drop?'Dropper':'Dispenser','#404040',false);renderChest();return true;}}
    if(rotBase(hb)===B.NOTEBLOCK){const n=(NOTE_PITCH(hb)+1)%25;setBlockNet(h.x,h.y,h.z,NOTES[n]);noteSound(n,'harp',[h.x+.5,h.y+.5,h.z+.5]);spawnParticles(h.x+.5,h.y+1.2,h.z+.5,1,[n/24,1-n/24,.5],.2);p.swing=1;return true;}
    if(hb===B.COMMAND_BLOCK){if(!cre){chatMsg('Only creative players can set commands.','#aaaaaa',false);return true;}const k=pk3(h.x,h.y,h.z);
      askText('Command for this Command Block (runs when it gets power):',CMDS.get(k)||'',v=>{if(v)CMDS.set(k,v.replace(/^\//,''));else CMDS.delete(k);if(net)netSend(N.CMDB,{k,c:CMDS.get(k)||''},'all');});return true;}
    // iron doors and trapdoors only open with redstone
    if(BD[hb]&&BD[hb].door&&BD[hb].door.first===B.DOOR_IRON||BD[hb]&&BD[hb].trap&&BD[hb].trap.first===B.TRAPDOOR_IRON){if(!(it&&it.type==='block'))return true;}}
  // ---- placing redstone things ----
  if(it&&it.type==='block'&&h&&canBuild()){const pid=rsPlaceId(it.block,p,h);
    if(pid!==undefined){if(pid===null)return true;if(placeBlock(h.px,h.py,h.pz,pid)){consume(p,p.sel);p.swing=1;}return true;}}
  if(id==='redstone'&&h&&canBuild()){const pid=rsPlaceId(B.RS_DUST,p,h);if(pid&&replaceable(getB(h.px,h.py,h.pz))&&placeBlock(h.px,h.py,h.pz,pid)){consume(p,p.sel);p.swing=1;}return true;}
  return u0(p,s);};}
// left click on a note block plays it
{const b0=breakBlock;breakBlock=function(x,y,z,e){const b=getB(x,y,z);if(rotBase(b)===B.NOTEBLOCK&&e===player&&player.gm!=='creative'&&!(mining&&mining.t>.05)){const n=NOTE_PITCH(b);noteSound(n,'harp',[x+.5,y+.5,z+.5]);}return b0.apply(this,arguments);};}
// pieces that hang on a block fall off when it goes (torches, levers, buttons, dust, repeaters, rails, plates...)
{const c0=blockChanged;blockChanged=function(x,y,z,was,b){c0(x,y,z,was,b);if(!INF||!was||(b&&BD[b].solid))return;
  for(let d=0;d<6;d++){const [dx,dy,dz]=F6[d];const nx=x+dx,ny=y+dy,nz=z+dz;const nb=getB(nx,ny,nz);const D=nb&&BD[nb];if(!D||!D.sup)continue;
    if(nx+D.sup[0]!==x||ny+D.sup[1]!==y||nz+D.sup[2]!==z)continue;if(dy===1&&(D.crop!=null))continue;
    if(MATCH.mode==='survival'&&rsAuth()){const dr=mineDrops(nb,null);if(dr&&ITEMS[dr])requestDrop([nx+.5,ny+.3,nz+.5],dr,1);}applyBlockList([nx,ny,nz,0],true);}
  // a piston and its head go together
  const W=RSK(was);if(W&&W.k==='piston'&&W.ext&&!(RSK(b)&&RSK(b).k==='piston')){const [dx,dy,dz]=F6[W.f];const hr=RSK(getB(x+dx,y+dy,z+dz));if(hr&&hr.k==='head')applyBlockList([x+dx,y+dy,z+dz,0],true);}
  if(W&&W.k==='head'&&!b){const [dx,dy,dz]=F6[W.f];const br=RSK(getB(x-dx,y-dy,z-dz));if(br&&br.k==='piston'&&br.ext){if(MATCH.mode==='survival'&&rsAuth()&&player&&player.gm!=='creative')requestDrop([x-dx+.5,y-dy+.3,z-dz+.5],'b'+B[W.sticky?'STICKY_PISTON':'PISTON'],1);applyBlockList([x-dx,y-dy,z-dz,0],true);}}};}
// ---- the clock ----
function redstoneTick(dt){if(!rsAuth()){RSQ.clear();RST.length=0;return;}rsAcc+=dt;let n=0;
  while(rsAcc>=.05&&n<4){rsAcc-=.05;n++;rsTick++;dustDone.clear();
    // timers that are due
    const due=RST.filter(t=>t.t<=rsTick);if(due.length){for(let i=RST.length-1;i>=0;i--)if(RST[i].t<=rsTick)RST.splice(i,1);for(const t of due)try{t.fn();}catch(e){console.error(e);}}
    // neighbour updates
    let guard=0;while(RSQ.size&&guard<3000){const list=[...RSQ];RSQ.clear();for(const k of list){if(++guard>3000)break;const [x,y,z]=k.split(',').map(Number);if(inB(x,y,z))rsEval(x,y,z);}}
    if(rsTick%4===0){plateTick();for(const k of COMPS){const [x,y,z]=k.split(',').map(Number);if(!inB(x,y,z))continue;const r=RSK(getB(x,y,z));if(!r||r.k!=='comp'){COMPS.delete(k);continue;}rsEval(x,y,z);}}if(rsTick%8===0)hopperTick();if(rsTick%20===0)daylightTick();
    rsFlush();}
  if(rsAcc>1)rsAcc=0;}
{const t0=survTick;survTick=function(dt){t0(dt);if(INF)redstoneTick(dt);};}
{const r0=restartSurvivalStream;restartSurvivalStream=function(){RSQ.clear();RST.length=0;RS_PLATES.clear();RS_SENSORS.clear();HOPPERS.clear();COMPS.clear();RS_EDGE.clear();return r0.apply(this,arguments);};}
// ---- extra things saved with the world and sent to players who join (command blocks here; entities, banners... later) ----
const XSAVE=[];let XSTART=null;
{const s0=survSaveExtra;survSaveExtra=function(data){s0(data);for(const h of XSAVE)h.save(data);};}
{const s0=survSnapshot;survSnapshot=function(jid){const s=s0(jid);for(const h of XSAVE)h.save(s,true);return s;};}
{const a0=survApplyStart;survApplyStart=function(d){XSTART=d;return a0(d);};}
{const b0=beginSurvival;beginSurvival=function(o){const X=XSTART||o||{};XSTART=null;for(const h of XSAVE)h.reset();const r=b0.apply(this,arguments);for(const h of XSAVE)h.load(X);return r;};}
N.CMDB=71;
XSAVE.push({save:d=>{d.cmds=[...CMDS];},reset:()=>CMDS.clear(),load:o=>{for(const [k,c] of o.cmds||[])CMDS.set(k,c);}});
// ---- messages from other players ----
const NET_X={};
{const m0=mobNet;mobNet=function(code,d,from,fromHost){const h=NET_X[code];if(h){h(d,from,fromHost);return;}return m0(code,d,from,fromHost);};}
NET_X[N.NOTE]=d=>noteSound(d.n,d.i,[d.x+.5,d.y+.5,d.z+.5]);
NET_X[N.CMDB]=d=>{if(d.c)CMDS.set(d.k,d.c);else CMDS.delete(d.k);};
// ---- recipes ----
{const n0=RECIPES.length;const b=k=>'b'+B[k];
  shapeless(['b3'],b('STONE_BUTTON'));shapeless([PLANKS],b('WOOD_BUTTON'));shaped(['SS'],{S:'b3'},b('PLATE_STONE'));shaped(['PP'],{P:PLANKS},b('PLATE_WOOD'));
  shaped(['GG'],{G:'gold_ingot'},b('PLATE_GOLD'));shaped(['II'],{I:'iron_ingot'},b('PLATE_IRON'));shaped([' R ','RGR',' R '],{R:'redstone',G:'b17'},'b'+B.LAMP);
  for(let i=n0;i<RECIPES.length;i++)LC_REC.push(lcRecipe(RECIPES[i]));
  const T=n=>LC_TABS.find(t=>t.name===n).entries;T('Decoration').push(['Buttons and Plates',[b('STONE_BUTTON'),b('WOOD_BUTTON'),b('PLATE_STONE'),b('PLATE_WOOD'),b('PLATE_GOLD'),b('PLATE_IRON')]],['Redstone Lamp',['b'+B.LAMP]]);}
