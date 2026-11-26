// ================= Tumble and Glide: the other two console mini games =================
// Tumble: everyone starts on the top of three layers of patterned blocks over a lava lake. Snowballs (or shovels) break the blocks
//   under the other players; snowballs also push people and set off TNT hidden in the layers. Fall into the lava and you are out.
//   The last player standing wins the round; a game is several rounds on freshly generated layers, and the most round wins takes it.
// Glide: fly an elytra round a looping course for three laps. Green rings score points, golden rings are checkpoints (crash three
//   times and you go back to the last one), and updrafts carry you back up to the top. Score Attack: the most points wins.
//   Time Attack: the fastest time wins, and your best time on each course is kept.
// The arenas and courses are this game's own designs, generated in code.
const MG_MODES={tumble:true,glide:true};
Object.assign(N,{MGS:60,MGR:61});
const MG_NAMES={battle:'Battle',br:'Battle Royale',tumble:'Tumble',glide:'Glide'};
const T_TOOLS=[['snowball','Snowballs'],['shovel','Shovels'],['mixed','Both']];
const T_ROUNDS=[3,5,7];
const GLIDE_COURSES=[{id:'canyon',name:'Canyon Run',seed:3101},{id:'sandstone',name:'Sandstone Spires',seed:4207},{id:'magma',name:'Magma Rift',seed:5309}];
if(SET.tTool==null)SET.tTool='snowball';if(SET.tRounds==null)SET.tRounds=3;if(SET.gMode==null)SET.gMode='score';if(SET.gCourse==null)SET.gCourse='canyon';if(SET.gLaps==null)SET.gLaps=3;
const fmtRace=t=>{t=Math.max(0,t||0);const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2);};
const isMG=()=>!!MG_MODES[MATCH.mode];
function mgMapName(id){if(id==='tumble')return 'Tumble Arena';if(String(id).startsWith('glide_')){const c=GLIDE_COURSES.find(c=>'glide_'+c.id===id);return c?c.name:'';}return '';}

// ================================== maps ==================================
{const g0=generateMap;generateMap=function(id,seed,extra){
  if(id==='tumble'||String(id).startsWith('glide_')){const info=id==='tumble'?genTumble(seed):genGlide(String(id).slice(6));info.id=id;mapInfo=info;computeLight();if(info.allLit)for(let i=0;i<light.length;i++)light[i]=(light[i]&15)|0xF0;else if(info.minSky)for(let i=0;i<light.length;i++)if((light[i]>>4)<info.minSky)light[i]=(light[i]&15)|(info.minSky<<4);return info;}
  return g0.apply(this,arguments);};}
{const n0=nextMapId;nextMapId=function(){if(SET.mode==='tumble')return 'tumble';if(SET.mode==='glide')return 'glide_'+(SET.gCourse||'canyon');return n0.apply(this,arguments);};}

// ---- Tumble arena: a lava lake ringed by stepped stone stands, three patterned layers floating over it ----
function tumbleSets(){const wools=Object.keys(B).filter(k=>/^WOOL_/.test(k)&&k!=='WOOL_W').map(k=>B[k]).concat([B.WOOL]);
  return [wools,[B.TERRACOTTA,B.CLAY,B.BRICK,B.SANDSTONE,B.CSANDSTONE],[B.SNOW,B.PACKED_ICE,B.SNOW_BRICKS,B.ICE_BRICKS],[B.NETHERRACK,B.NETHER_BRICK,B.MAGMA_BRICKS,B.SOUL],
    [B.GRASS,B.DIRT,B.PODZOL,B.MOSSY,B.COBBLE],[B.END_STONE,B.PRISMARINE,B.PRISM_BRICKS,B.DARK_PRISM],[B.HAY,B.PUMPKIN,B.MELON,B.PLANKS,B.BOOKSHELF],
    [B.QUARTZ,B.QUARTZ_PILLAR,B.QUARTZ_CHISELED,B.LAPIS_BLOCK,B.IRON_BLOCK]].map(a=>a.filter(Boolean)).filter(a=>a.length>=2);}
function genTumble(seed){setDims(66,46,66);rs=(seed|0)||7;const R=15,Ls=[11,18,25],top=Ls[2];
  for(let z=0;z<WZ;z++)for(let x=0;x<WX;x++){const d=Math.hypot(x+.5-CX,z+.5-CZ);if(d>31.5)continue;setB(x,0,z,B.BEDROCK);setB(x,1,z,B.NETHERRACK);
    if(d<27)for(let y=2;y<=4;y++)setB(x,y,z,B.LAVA);
    else{const step=Math.min(3,Math.floor((d-27)*1.05)),h=9+step*4;for(let y=2;y<=h;y++)setB(x,y,z,y===h?(step===3?B.CHISELED:B.SBRICK):y%6===0?B.MSBRICK:B.SBRICK);
      if(step===3&&(x+z)%2===0)setB(x,h+1,z,B.SBRICK);}}
  // banners hanging on the inside of the stands, with lamps between them
  const cols=[B.WOOL_RED||B.WOOL,B.WOOL_YELLOW||B.WOOL,B.WOOL_LIME||B.WOOL,B.WOOL_LIGHT_BLUE||B.WOOL,B.WOOL_MAGENTA||B.WOOL,B.WOOL_ORANGE||B.WOOL];
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=Math.floor(CX+Math.cos(a)*27.6),z=Math.floor(CZ+Math.sin(a)*27.6);
    if(i%2===0){const c=cols[(i/2)%cols.length];for(let y=5;y<=9;y++)setB(x,y,z,c);}else setB(x,8,z,B.GLOW);}
  // the layers: patchwork cells of one block family each, ragged edges, a little TNT in the lower two for the snowballs
  const sets=tumbleSets(),cells=[];
  Ls.forEach((y,li)=>{const set=sets[Math.floor(srand()*sets.length)];const pts=[];
    for(let i=0;i<28;i++){const a=srand()*6.2832,r=Math.sqrt(srand())*R;pts.push([CX+Math.cos(a)*r,CZ+Math.sin(a)*r,set[Math.floor(srand()*set.length)]]);}
    for(let z=0;z<WZ;z++)for(let x=0;x<WX;x++){const d=Math.hypot(x+.5-CX,z+.5-CZ);const edge=R+(fbm(x*.16,z*.16,(seed|0)+li*31)-.5)*6;const tnt=srand();if(d>edge)continue;
      let best=pts[0],bd=1e9;for(const p of pts){const q=(p[0]-x)*(p[0]-x)+(p[1]-z)*(p[1]-z);if(q<bd){bd=q;best=p;}}
      setB(x,y,z,li<2&&tnt<.014&&SET.tTool!=='shovel'?B.TNT:best[2]);cells.push([x,y,z]);}});
  const sp=spawnRing(CX,CZ,9,16,top+2);
  return {sky:[.47,.65,1],fog:[.74,.84,1],fogDist:120,skyLight:true,allLit:true,voidY:-8,central:sp,spawns:sp,center:[CX,top+1,CZ],noBeam:true,tumble:{layers:Ls,R,cells}};}

// ---- Glide courses: a closed loop tunnelled through a block of rock, open to the sky in places, falling most of the way round ----
// and climbing back up an updraft shaft at the end of each lap
const GTHEME={canyon:{wall:[B.STONE,B.STONE,B.ANDESITE||B.STONE,B.COBBLE],band:B.GRAVEL,top:B.GRASS,sub:B.DIRT,floor:B.WATER,vine:true,sky:[.47,.65,1],fog:[.74,.84,1]},
  sandstone:{wall:[B.SANDSTONE,B.SANDSTONE,B.SSANDSTONE||B.SANDSTONE],band:B.CSANDSTONE||B.TERRACOTTA||B.SANDSTONE,top:B.SAND,sub:B.SAND,floor:B.SAND,vine:false,sky:[.55,.72,.98],fog:[.93,.86,.68]},
  magma:{wall:[B.NETHERRACK,B.NETHERRACK,B.NETHER_BRICK||B.NETHERRACK],band:B.MAGMA_BRICKS||B.MAGMA||B.NETHERRACK,top:B.NETHERRACK,sub:B.NETHERRACK,floor:B.LAVA,vine:false,sky:[.16,.04,.03],fog:[.3,.08,.04],dark:true}};
function genGlide(cid){const C=GLIDE_COURSES.find(c=>c.id===cid)||GLIDE_COURSES[0],T=GTHEME[C.id];setDims(176,86,176);rs=C.seed;const s=C.seed;
  const NP=900,ph=[srand()*6.2832,srand()*6.2832,srand()*6.2832],P=[],R=[],open=[],UP=.8;
  for(let i=0;i<NP;i++){const u=i/NP,a=u*Math.PI*2;const r=56+13*Math.sin(3*a+ph[0])+5*Math.sin(5*a+ph[1]);let y;
    if(u<UP)y=72-54*(u/UP)+1.5*Math.sin(9*a+ph[2])*Math.sin(Math.PI*u/UP);else{const k=(u-UP)/(1-UP);y=18+54*k*k*(3-2*k);}
    P.push([CX+Math.cos(a)*r,y,CZ+Math.sin(a)*r]);R.push(u>=UP?9:7.6+1.6*Math.sin(7*a+ph[1]));open.push(u<UP-.03&&Math.sin(2*a+ph[2])>.2);}
  // rock
  for(let z=0;z<WZ;z++)for(let x=0;x<WX;x++){const G=76+Math.floor(fbm(x*.04,z*.04,s)*7);setB(x,0,z,B.BEDROCK);
    for(let y=1;y<=G;y++){let b;if(y===G)b=T.top;else if(y>G-4)b=T.sub;else{const band=(y+Math.floor(fbm(x*.08,z*.08,s+3)*4))%9===0;b=band?T.band:T.wall[(hash2(x,y*7+z,s)*T.wall.length)|0];}setB(x,y,z,b);}}
  // carve the tube (and the open canyon stretches up to the sky)
  for(let i=0;i<NP;i++){const c=P[i],r=R[i],n=Math.ceil(r);for(let dy=-n;dy<=n;dy++)for(let dz=-n;dz<=n;dz++)for(let dx=-n;dx<=n;dx++){if(dx*dx+dy*dy+dz*dz>r*r)continue;setB(Math.floor(c[0]+dx),Math.floor(c[1]+dy),Math.floor(c[2]+dz),0);}
    if(open[i]&&i%2===0){const r2=r*.9;for(let dz=-n;dz<=n;dz++)for(let dx=-n;dx<=n;dx++){if(dx*dx+dz*dz>r2*r2)continue;for(let y=Math.floor(c[1]);y<WY;y++)setB(Math.floor(c[0]+dx),y,Math.floor(c[2]+dz),0);}}}
  // floors (water, sand or lava), vines down the canyon walls, glowstone lamps along the tunnels
  for(let i=0;i<NP;i+=3){const c=P[i],r=R[i];for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(dx*dx+dz*dz>r*r*.6)continue;const x=Math.floor(c[0]+dx),z=Math.floor(c[2]+dz);
      for(let y=Math.floor(c[1]);y>Math.floor(c[1]-r-2);y--){if(getB(x,y,z)&&!getB(x,y+1,z)){setB(x,y,z,T.floor);break;}}}}
  for(let i=0;i<NP;i+=4){const c=P[i];
    if(open[i]&&T.vine){for(let k=0;k<3;k++){const a=srand()*6.2832;let x=c[0],z=c[2];for(let st=0;st<14;st++){x+=Math.cos(a);z+=Math.sin(a);if(getB(Math.floor(x),Math.floor(c[1]+4),Math.floor(z))){const vx=Math.floor(x-Math.cos(a)),vz=Math.floor(z-Math.sin(a));
          for(let y=Math.floor(c[1]+6);y>Math.floor(c[1]-2);y--)if(!getB(vx,y,vz))setB(vx,y,vz,B.VINE);break;}}}}
    else if(!open[i]&&i%12===0){const a=srand()*6.2832,up=(srand()-.5)*1.2;const d=[Math.cos(a),up,Math.sin(a)];let q=c.slice();for(let st=0;st<14;st++){q=[q[0]+d[0],q[1]+d[1],q[2]+d[2]];const x=Math.floor(q[0]),y=Math.floor(q[1]),z=Math.floor(q[2]);if(getB(x,y,z)){setB(x,y,z,B.GLOW);break;}}}}
  // lap length, checkpoints and rings
  const L=[0];for(let i=1;i<=NP;i++){const a=P[i-1],b=P[i%NP];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]));}
  const tan=i=>{const a=P[(i-3+NP)%NP],b=P[(i+3)%NP];const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(...d)||1;return d.map(v=>v/l);};
  const basis=t=>{let u=[t[2],0,-t[0]];const ul=Math.hypot(...u);u=ul<1e-3?[1,0,0]:u.map(v=>v/ul);const v=[u[1]*t[2]-u[2]*t[1],u[2]*t[0]-u[0]*t[2],u[0]*t[1]-u[1]*t[0]];return [u,v];};
  const rings=[],cpIdx=[0,Math.round(NP*.25),Math.round(NP*.5),Math.round(NP*.72)];
  const putRing=(c,t,rr,blk)=>{const [u,v]=basis(t);for(let k=0;k<96;k++){const a=k/96*Math.PI*2;const q=[c[0]+(u[0]*Math.cos(a)+v[0]*Math.sin(a))*rr,c[1]+(u[1]*Math.cos(a)+v[1]*Math.sin(a))*rr,c[2]+(u[2]*Math.cos(a)+v[2]*Math.sin(a))*rr];
    const x=Math.floor(q[0]),y=Math.floor(q[1]),z=Math.floor(q[2]);if(!getB(x,y,z))setB(x,y,z,blk);}};
  cpIdx.forEach((i,k)=>{const t=tan(i),rr=R[i]-.8;rings.push({id:'c'+k,cp:k,i,c:P[i].slice(),t,r:rr});putRing(P[i],t,rr,B.GLOW);});
  let next=12;for(let i=0;i<NP;i++){if(L[i]<next)continue;next=L[i]+11;const u=i/NP;if(u>=UP-.01||cpIdx.some(k=>Math.abs(L[k]-L[i])<9))continue;
    const t=tan(i),[bu,bv]=basis(t),m=R[i]-3.6,ox=(srand()*2-1)*m*.6,oy=(srand()*2-1)*m*.4;const c=[P[i][0]+bu[0]*ox+bv[0]*oy,P[i][1]+bu[1]*ox+bv[1]*oy,P[i][2]+bu[2]*ox+bv[2]*oy];
    rings.push({id:'r'+i,cp:-1,i,c,t,r:2.3});putRing(c,t,2.3,B.SLIME);}
  // start grid: just before the start ring, facing along the course
  const i0=Math.round(NP*.975),t0=tan(i0),[u0,v0]=basis(t0),yaw=Math.atan2(-t0[0],-t0[2]),sp=[];
  for(const back of [0,-3])for(const oy of [1.2,-1.8])for(const ox of [-3,-1,1,3]){const c=P[(i0+back+NP)%NP];sp.push([c[0]+u0[0]*ox+v0[0]*oy,c[1]+u0[1]*ox+v0[1]*oy,c[2]+u0[2]*ox+v0[2]*oy,yaw]);}
  return {sky:T.sky,fog:T.fog,fogDist:T.dark?90:140,skyLight:true,minSky:T.dark?9:11,skyMul:T.dark?.5:1,dark:!!T.dark,voidY:-40,central:sp,spawns:sp,center:null,noBeam:true,
    glide:{course:C.id,name:C.name,P,R,L,len:L[NP],cpIdx,rings,upFrom:Math.round(NP*UP),upTo:Math.round(NP*.985),i0,NP}};}

// ================================== match flow ==================================
// a game of Tumble is several rounds (hostStartMatch again for each, keeping the round wins); Glide is one race
{const h0=hostStartMatch;hostStartMatch=function(){
  if(!MG_MODES[SET.mode]){MATCH.mg=null;return h0.apply(this,arguments);}
  if(!MATCH.mgNext||!MATCH.mg||MATCH.mg.mode!==SET.mode)MATCH.mg={mode:SET.mode,round:1,rounds:SET.mode==='tumble'?(+SET.tRounds||3):1,wins:{},hist:[],endAt:0};
  MATCH.mgNext=false;Object.assign(MATCH.mg,{endAt:0,between:false,crAnn:false,crT:0});
  const bots=SET.bots;if(SET.mode==='glide')SET.bots=0;SET._mg=MATCH.mg;
  try{return h0.apply(this,arguments);}finally{SET.bots=bots;delete SET._mg;}};}
{const s0=snapshotFor;snapshotFor=function(){const p=s0.apply(this,arguments);if(isMG()&&p&&p.set)p.set._mg=MATCH.mg;return p;};}
{const a0=applyStart;applyStart=function(p,late){const r=a0.apply(this,arguments);
  if(MG_MODES[p.mode]){if(p.set&&p.set._mg)MATCH.mg=JSON.parse(JSON.stringify(p.set._mg));delete SET._mg;mgSetup(p,late);}else MATCH.mg=null;return r;};}
function mgSetup(p,late){const myId=net?'p'+net.myId:'p1';
  for(const e of ents){e.mgs={s:0,l:0,gi:0,f:0,rg:0,bb:0};e.mgBB=0;e.gliding=false;e.food=20;e.inv=new Array(9).fill(null);e.sel=0;e.armor=[null,null,null,null];
    if(e.spectator)e.mgLate=true;
    if(MATCH.mode==='tumble'){const t=SET.tTool;if(t==='shovel')e.inv[0]={id:'diamond_shovel',count:1};else if(t==='mixed'){e.inv[0]={id:'diamond_shovel',count:1};e.inv[1]={id:'snowball',count:1};}else e.inv[0]={id:'snowball',count:1};}}
  if(MATCH.mode==='glide'&&mapInfo.glide){const G=mapInfo.glide;for(const e of ents){e.gi=G.i0;e.lap=0;e.cpNext=1;e.lastCp=0;e.hearts=3;e.gInv=0;e.gGround=0;e.gScore=0;e.gRingN=0;e.gRings=new Set();e.gFin=0;e.gCrash=0;e.gSpawn=e.pos.slice();e.gPrev=null;}
    const best=glideBest();if(best)chatMsg('Your best time on '+G.name+': '+fmtRace(best),'#ffff55',false);}
  if(MATCH.mode==='tumble'&&MATCH.mg&&MATCH.mg.round>1)announce('Round '+MATCH.mg.round+' of '+MATCH.mg.rounds,'New layers!',2.5,false);
  if(late===myId&&player)announce(MG_NAMES[MATCH.mode]+' in progress','You can watch until the next round',4,false);}
// the countdown has finished (14_main.js): gliders are launched along the course
function mgRoundStart(){if(MATCH.mode!=='glide'||!player||!player.alive||!mapInfo.glide)return;const G=mapInfo.glide,t=glideTan(G,G.i0);player.gliding=true;player.mot=[t[0]*.95,t[1]*.95+.05,t[2]*.95];player.gPrev=null;}
{const t0=hostMatchTick;hostMatchTick=function(dt){if(!isMG())return t0.apply(this,arguments);
  MATCH.phaseT-=dt;if(MATCH.phaseT<=0){MATCH.phaseT=1;netSend(N.PHASE,{pre:MATCH.preT,t:MATCH.gameT,sd:false,r:0,bs:false});}
  if(MATCH.preT>0)return;if(MATCH.mode==='tumble')tumbleHostTick(dt);else glideHostTick(dt);};}
{const e0=hostEndMatch;hostEndMatch=function(w){if(!isMG())return e0.apply(this,arguments);mgEndMatch();};}
// final results: Tumble ranks by round wins, Score Attack by points (plus a bonus for finishing order), Time Attack by finishing time
function mgEndMatch(){if(MATCH.state!=='play')return;const mg=MATCH.mg||{};const list=ents.filter(e=>!e.mgLate&&(e.kind==='player'||e.kind==='bot'));let rows;
  if(MATCH.mode==='tumble'){rows=list.map(e=>({e,v:(mg.wins||{})[e.id]||0,x:{wins:(mg.wins||{})[e.id]||0,bb:(e.mgs&&e.mgs.bb)||e.mgBB||0}})).sort((a,b)=>b.v-a.v);}
  else{const fin=list.filter(e=>e.mgs&&e.mgs.f>0).sort((a,b)=>a.mgs.f-b.mgs.f);const bonus=[20,15,10];
    rows=list.map(e=>{const m=e.mgs||{},fi=fin.indexOf(e),pts=(m.s||0)+(fi<0?0:bonus[fi]!=null?bonus[fi]:5);return {e,fi,pts,prog:(m.l||0)*1e4+(m.gi||0),x:{pts,f:m.f||0,rg:m.rg||0,l:m.l||0,fb:fi<0?0:bonus[fi]!=null?bonus[fi]:5}};});
    if(SET.gMode==='time')rows.sort((a,b)=>(a.fi<0)-(b.fi<0)||(a.fi>=0?a.e.mgs.f-b.e.mgs.f:b.prog-a.prog));else rows.sort((a,b)=>b.pts-a.pts||(a.fi<0)-(b.fi<0));}
  rows.forEach((r,i)=>r.e.place=i+1);const top=rows[0];let w=top?top.e:null;
  if(MATCH.mode==='tumble'&&rows[1]&&rows[1].v===top.v)w=null;
  const res=rows.map(r=>({id:r.e.id,name:r.e.name,k:MATCH.mode==='tumble'?r.v:SET.gMode==='time'?(r.x.f?fmtRace(r.x.f):'DNF'):r.x.pts,p:r.e.place,d:0,r:0,fw:null,aw:'contender',x:r.x}));
  const m={w:w?w.id:null,res,t:Math.round(MATCH.gameT),mg:{mode:MATCH.mode,gm:SET.gMode,course:mapInfo.glide?mapInfo.glide.name:''}};netSend(N.END,m);applyEnd(m);MATCH.mapIdx++;
  if(online)setTimeout(()=>{if(isHost()&&MATCH.state==='over'){netSend(N.TOLOBBY,{});enterLobby();}},10000);}
// the scoreboard: the same screen as Battle, with each mini game's own numbers
{const r0=showResults;showResults=function(m){r0.apply(this,arguments);if(!m||!m.mg||MATCH.state!=='over')return;const mode=m.mg.mode,rows=m.res.slice().sort((a,b)=>a.p-b.p);
  $('sbKillIco').replaceChildren(iconCanvas(mode==='tumble'?'snowball':'feather',26));const pick=resPick;
  resPick=i=>{pick(i);const r=rows[i];if(!r||!r.x)return;const X=r.x,T=s=>document.createTextNode(s);
    if(mode==='tumble'){$('sbAward').replaceChildren(iconCanvas('diamond_shovel'),T('Rounds won: '+X.wins));$('sbFav').replaceChildren(iconCanvas('snowball'),T('Blocks broken: '+X.bb));$('sbDealt').replaceChildren(T(''));$('sbTaken').replaceChildren(T(''));}
    else{$('sbAward').replaceChildren(iconCanvas(ITEMS.diamond?'diamond':'feather'),T(m.mg.gm==='time'?'Time Attack':'Score: '+X.pts));$('sbFav').replaceChildren(iconCanvas(ITEMS.slimeball?'slimeball':ITEMS.gold_ingot?'gold_ingot':'feather'),T('Rings: '+X.rg));
      $('sbDealt').replaceChildren(iconCanvas('clock'),T(X.f?'Finished in '+fmtRace(X.f):'Did not finish ('+Math.min(SET.gLaps,X.l)+'/'+SET.gLaps+' laps)'));$('sbTaken').replaceChildren(T(X.fb&&m.mg.gm!=='time'?'Finish bonus: '+X.fb:''));}};
  resPick(resSel||0);
  $('resNote').textContent=(mode==='glide'?m.mg.course+' · '+(m.mg.gm==='time'?'Time Attack':'Score Attack')+'. ':'')+$('resNote').textContent;};}
// no damage in the mini games except falling into Tumble's lava or the void; no hunger; no inventory screen
{const h0=hurt;hurt=function(e,amt,src,cause){if(isMG()&&MATCH.state==='play'&&(MATCH.mode==='glide'||(cause!=='void'&&cause!=='lava')))return false;return h0.apply(this,arguments);};}
{const k0=tickOwned;tickOwned=function(e,dt,moved){if(isMG()){e.food=20;e.sat=5;if(MATCH.mode==='tumble'&&MATCH.state==='play'&&e.alive&&e.inLava){e.invuln=0;hurt(e,999,e.lastAttackT<8?e.lastAttacker:null,'lava',null,true,true);}}return k0.apply(this,arguments);};}
{const o0=openInv;openInv=function(){if(isMG()&&MATCH.state==='play')return false;return o0.apply(this,arguments);};}
{const b0=updateBot;updateBot=function(b,dt){if(MATCH.mode==='tumble')return tumbleBot(b,dt);if(MATCH.mode==='glide'){const m=physics(b,dt,0,0);tickOwned(b,dt,m);return;}return b0.apply(this,arguments);};}
{const u0=updatePlayer;updatePlayer=function(dt){if(!isMG()||MATCH.state!=='play'||!player)return u0.apply(this,arguments);
  const p=player;if(!p.alive)return u0.apply(this,arguments);
  if(MATCH.mode==='glide'&&MATCH.preT>0){if(p.gSpawn){p.pos=p.gSpawn.slice();p.prev=p.pos.slice();p.rpos=p.pos.slice();}p.mot=[0,0,0];p.vel=[0,0,0];p.gliding=false;return;}
  const active=(locked||padActive||touchActive)&&!chestOpen&&!(MATCH.preT>0);
  if(MATCH.mode==='tumble'&&active)tumbleInput(p,dt);
  if(MATCH.mode==='glide'&&!p.onGround&&!(MATCH.preT>0))p.gliding=true;
  const L=lmb,R=rmb;lmb=rmb=lmbEdge=rmbEdge=false;try{u0.apply(this,arguments);}finally{lmb=L;rmb=R;lmbEdge=rmbEdge=false;}
  if(MATCH.mode==='glide')glideTrack(p,dt);};}
{const p0=promptLabels;promptLabels=function(){const p=player;if(!isMG()||MATCH.state!=='play'||!p||!p.alive)return p0.apply(this,arguments);const K=(m,g)=>padActive?g:m;
  if(MATCH.mode==='glide')return [[K('R','Y'),'Look Behind']];const s=p.inv[p.sel];const out=[[K(s&&s.id==='snowball'?'LMB':'LMB','RT'),s&&s.id==='snowball'?'Throw':'Mine']];
  if(SET.tTool==='mixed')out.push([K('Wheel','LB/RB'),'Switch']);return out;};}
// messages between players: knockback for someone else's player, TNT, round results
{const o0=onNetEvent;onNetEvent=function(code,d,from){
  if(code===N.MGS){const e=d&&entById(d.id);if(e&&!e.isLocal)e.mgs=d;return;}
  if(code===N.MGR){const fromHost=net&&from===net.hostId();if(!d)return;
    if(d.t==='kb'){const e=entById(d.id);if(e&&owned(e)&&e.alive){knockback(e,d.d[0],d.d[1]);const by=entById(d.by);if(by){e.lastAttacker=by;e.lastAttackT=0;}}}
    else if(d.t==='boom'){if(Array.isArray(d.l))for(let i=0;i<d.l.length;i+=3)applyBlock(d.l[i],d.l[i+1],d.l[i+2],0);mgBoomFx(d.p,entById(d.by));}
    else if(d.t==='mg'&&fromHost)MATCH.mg=d.mg;
    else if(d.t==='endAt'&&fromHost&&MATCH.mg)MATCH.mg.endAt=d.v;
    return;}
  return o0.apply(this,arguments);};}

// ================================== Tumble ==================================
function tumbleLayerBlock(x,y,z){const T=mapInfo&&mapInfo.tumble;return !!(T&&T.layers.includes(y)&&getB(x,y,z)&&Math.hypot(x+.5-CX,z+.5-CZ)<=T.R+4);}
function tumbleBreak(x,y,z,who){const b=getB(x,y,z);if(!b)return;setBlockNet(x,y,z,0);sfx('dig',{pos:[x,y,z],mat:blockMat(b)});if(who)who.mgBB=(who.mgBB||0)+1;}
function throwSnowball(e){const d=fwd(e),o=eye(e);spawnProj('snowball',[o[0]+d[0]*.3,o[1]-.1,o[2]+d[2]*.3],[d[0]*1.5,d[1]*1.5,d[2]*1.5],e,0);e.swing=1;sfx('bow',{pos:e.pos,vol:.5});}
function snowballBlock(a,x,y,z){spawnParticles(a.pos[0],a.pos[1],a.pos[2],6,[.95,.97,1],1.5);if(!owned(a.owner)||MATCH.mode!=='tumble'||MATCH.state!=='play')return;
  const b=getB(x,y,z);if(b===B.TNT&&tumbleLayerBlock(x,y,z)){tumbleBoom(x,y,z,a.owner);return;}if(tumbleLayerBlock(x,y,z))tumbleBreak(x,y,z,a.owner);}
function snowballEnt(a,e){spawnParticles(a.pos[0],a.pos[1],a.pos[2],6,[.95,.97,1],1.5);if(!owned(a.owner)||!e.alive||e===a.owner||e.kind==='mob')return;const dx=a.vel[0],dz=a.vel[2];
  if(owned(e)){knockback(e,dx,dz);e.lastAttacker=a.owner;e.lastAttackT=0;}else netSend(N.MGR,{t:'kb',id:e.id,d:[dx,dz],by:a.owner.id});sfx('hit',{pos:e.pos,vol:.5});}
// TNT in the layers: blows a hole and throws everyone near it
function tumbleBoom(x,y,z,by){const c=[x+.5,y+.5,z+.5],l=[];const T=mapInfo.tumble;
  for(let dy=-3;dy<=3;dy++)for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const d=Math.hypot(dx,dy,dz);if(d>2.9*(.7+Math.random()*.3))continue;const X=x+dx,Y=y+dy,Z=z+dz;if(tumbleLayerBlock(X,Y,Z))l.push(X,Y,Z);}
  for(let i=0;i<l.length;i+=3)applyBlock(l[i],l[i+1],l[i+2],0);netSend(N.MGR,{t:'boom',p:c,l,by:by&&by.id});mgBoomFx(c,by);if(by)by.mgBB=(by.mgBB||0)+l.length/3;}
function mgBoomFx(c,by){if(typeof boomFx==='function')boomFx(c,2.5);for(const e of ents){if(!owned(e)||!e.alive)continue;const dx=e.pos[0]-c[0],dz=e.pos[2]-c[2],d=Math.hypot(dx,e.pos[1]+.9-c[1],dz);if(d>5)continue;
  knockback(e,dx||.01,dz||.01);e.mot[1]+=.35*(1-d/5);if(by&&by!==e){e.lastAttacker=by;e.lastAttackT=0;}}}
function tumbleInput(p,dt){p.mgCD=(p.mgCD||0)-dt;if(SET.tTool==='mixed'){if(p.sel>1)p.sel%=2;}else p.sel=0;const s=p.inv[p.sel];if(!s||p.mgCD>0)return;
  if(s.id==='snowball'&&(lmb||rmb)){throwSnowball(p);p.mgCD=.25;}
  else if(s.id==='diamond_shovel'&&lmb){const h=raycastBlock(eye(p),fwd(p),5);if(h&&tumbleLayerBlock(h.x,h.y,h.z)){tumbleBreak(h.x,h.y,h.z,p);p.mgCD=.15;p.swing=1;}else if(lmbEdge)p.swing=1;}}
function tumbleHostTick(dt){const mg=MATCH.mg;if(!mg||mg.between)return;const alive=aliveList(),total=ents.filter(e=>!e.spectator&&!e.mgLate).length;
  if((total>1&&alive.length<=1)||alive.length===0){tumbleRoundOver(alive[0]||null);return;}
  // after two minutes the layers start crumbling away, faster and faster, so every round ends
  const CR=120;if(MATCH.gameT>=CR){if(!mg.crAnn){mg.crAnn=true;announce('The layers are crumbling!','',3);sfx('go');}mg.crT-=dt;
    if(mg.crT<=0){mg.crT=.2;const cells=mapInfo.tumble.cells;const n=2+Math.floor((MATCH.gameT-CR)/6);for(let i=0;i<n;i++)for(let k=0;k<6;k++){const c=cells[Math.floor(Math.random()*cells.length)];if(getB(c[0],c[1],c[2])){tumbleBreak(c[0],c[1],c[2],null);break;}}}}}
function tumbleRoundOver(w){const mg=MATCH.mg;mg.between=true;if(w)mg.wins[w.id]=(mg.wins[w.id]||0)+1;mg.hist.push(w?w.id:null);
  for(const e of ents)if(e.mgs)e.mgs.bb=e.mgBB||e.mgs.bb||0;netSend(N.MGR,{t:'mg',mg});
  announce(w?w.name+' won the round!':'Nobody won the round','',3.5);sfx('win');
  if(mg.round>=mg.rounds){setTimeout(()=>{if(MATCH.mode==='tumble'&&MATCH.state==='play')mgEndMatch();},3500);}
  else setTimeout(()=>{if(MATCH.state!=='play'||MATCH.mode!=='tumble'||MATCH.mg!==mg)return;mg.round++;MATCH.mgNext=true;for(const e of ents)e.mgs&&(e.mgs.bb=e.mgBB||0);hostStartMatch();},4500);}
// bots: walk about their layer without stepping off it, and snowball (or dig out) the floor under the nearest player
function tumbleBot(b,dt){const ai=b.ai||(b.ai=newAI());ai.tt=(ai.tt||0)-dt;ai.ta=(ai.ta==null?1+Math.random():ai.ta)-dt;let wx=0,wz=0;b.jump=false;b.sprint=false;
  if(MATCH.state==='play'&&!(MATCH.preT>0)&&b.alive&&MATCH.mg&&!MATCH.mg.between){
    let tg=null,td=1e9;for(const e of aliveList()){if(e===b)continue;const d=dist(e.pos,b.pos);if(d<td){td=d;tg=e;}}
    const tools=b.inv.filter(Boolean).map(s=>s.id);if(tools.length>1){const want=td<4.5?'diamond_shovel':'snowball';const i=b.inv.findIndex(s=>s&&s.id===want);if(i>=0)b.sel=i;}
    const tool=b.inv[b.sel]&&b.inv[b.sel].id;
    if(ai.tt<=0||!ai.g||hdist(b.pos,ai.g)<1.2){ai.tt=1+Math.random()*2.5;const y=Math.floor(b.pos[1]-.5);const T=mapInfo.tumble;ai.g=null;
      for(let k=0;k<12;k++){const a=Math.random()*6.2832,r=Math.random()*T.R;const x=Math.floor(CX+Math.cos(a)*r),z=Math.floor(CZ+Math.sin(a)*r);if(getB(x,y,z)){ai.g=[x+.5,y+1,z+.5];break;}}}
    if(tg&&tool==='diamond_shovel'&&td<10&&Math.abs(tg.pos[1]-b.pos[1])<1.5)ai.g=[tg.pos[0],b.pos[1],tg.pos[2]];
    if(ai.g){const dx=ai.g[0]-b.pos[0],dz=ai.g[2]-b.pos[2],l=Math.hypot(dx,dz)||1;if(l>.6){wx=dx/l;wz=dz/l;b.yaw=Math.atan2(-dx,-dz);}}
    const fy=Math.floor(b.pos[1]-.5),fx=Math.floor(b.pos[0]+wx*.9),fz=Math.floor(b.pos[2]+wz*.9);if(b.onGround&&(wx||wz)&&!getB(fx,fy,fz)&&!getB(fx,fy-1,fz)){wx=wz=0;ai.tt=0;}
    if(tg&&ai.ta<=0){const D=DIFF[SET.difficulty|0]||DIFF[1];ai.ta=(.75+Math.random()*1.1)/D.react;const u=[Math.floor(tg.pos[0]),Math.floor(tg.pos[1]-.5),Math.floor(tg.pos[2])];
      if(tool==='snowball'&&td<24){const o=eye(b),c=[u[0]+.5+(Math.random()-.5)*(1-D.acc)*2,u[1]+.5,u[2]+.5+(Math.random()-.5)*(1-D.acc)*2];const dx=c[0]-o[0],dy=c[1]-o[1],dz=c[2]-o[2],h=Math.hypot(dx,dz);
        b.yaw=Math.atan2(-dx,-dz);b.pitch=Math.atan2(dy+h*h*.0067,h);throwSnowball(b);}
      else if(tool==='diamond_shovel'&&td<4.6){if(tumbleLayerBlock(...u)){const o=eye(b);b.yaw=Math.atan2(-(u[0]+.5-o[0]),-(u[2]+.5-o[2]));tumbleBreak(u[0],u[1],u[2],b);b.swing=1;}}}}
  const moved=physics(b,dt,wx,wz);tickOwned(b,dt,moved);}

// ================================== Glide ==================================
function glideTan(G,i){const NP=G.NP,a=G.P[(i-3+NP)%NP],b=G.P[(i+3)%NP];const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(...d)||1;return d.map(v=>v/l);}
const glideKey=()=>'mcr_glide_best_'+(mapInfo.glide?mapInfo.glide.course:SET.gCourse)+'_'+SET.gLaps;
function glideBest(){const v=+store(glideKey());return v>0?v:0;}
// elytra flight, as in vanilla (EntityLivingBase.travel with the elytra flag): steer by looking, dive for speed, pull up to climb
function glideTick(e){const L=fwd(e),pitch=e.pitch,d6=Math.hypot(L[0],L[2]),d8=Math.hypot(e.mot[0],e.mot[2]);let f4=Math.cos(pitch);f4*=f4;
  e.mot[1]+=-.08+f4*.06;
  if(e.mot[1]<0&&d6>0){const d2=e.mot[1]*-.1*f4;e.mot[1]+=d2;e.mot[0]+=L[0]*d2/d6;e.mot[2]+=L[2]*d2/d6;}
  if(pitch>0&&d6>0){const d10=d8*Math.sin(pitch)*.04;e.mot[1]+=d10*3.2;e.mot[0]-=L[0]*d10/d6;e.mot[2]-=L[2]*d10/d6;}
  if(d6>0){e.mot[0]+=(L[0]/d6*d8-e.mot[0])*.1;e.mot[2]+=(L[2]/d6*d8-e.mot[2])*.1;}
  if(e.gUp&&e.pos[1]<e.gUpY){e.mot[1]=Math.min(e.mot[1]+.16,1.15,(e.gUpY-e.pos[1])*.12+.1);const k=Math.max(d8,.55)/(d8||1);e.mot[0]*=Math.min(1.02,k);e.mot[2]*=Math.min(1.02,k);}   // updrafts lift you and keep you moving
  e.mot[0]*=.99;e.mot[1]*=.98;e.mot[2]*=.99;
  const moved=moveEntity(e,e.mot[0],e.mot[1],e.mot[2]);
  if(e.collidedH){const d11=Math.hypot(e.mot[0],e.mot[2]);const f5=(d8-d11)*10-3;if(f5>0)e.gCrash=(e.gCrash||0)+f5;}
  e.fallDist=0;if(e.onGround)e.gliding=false;return moved;}
function lookBehind(){if(MATCH.mode!=='glide'||MATCH.state!=='play'||!player||!player.alive)return false;if(keys.KeyR)return true;
  try{const gp=[...(navigator.getGamepads?navigator.getGamepads():[])].find(g=>g&&g.connected);return !!(gp&&gp.buttons[3]&&gp.buttons[3].pressed);}catch(e){return false;}}
function glideRespawn(p,msg){const G=mapInfo.glide;const i=(G.cpIdx[p.lastCp]+4)%G.NP,c=G.P[i],t=glideTan(G,i);p.pos=c.slice();p.prev=c.slice();p.rpos=c.slice();p.gPrev=null;
  p.yaw=Math.atan2(-t[0],-t[2]);p.pitch=0;p.mot=[t[0]*.9,t[1]*.9,t[2]*.9];p.hearts=3;p.gInv=2;p.gGround=0;p.gCrash=0;p.gliding=true;p.gi=i;if(msg)announce(msg,'',1.6,false);}
function glideCross(r,a,b){const sa=(a[0]-r.c[0])*r.t[0]+(a[1]-r.c[1])*r.t[1]+(a[2]-r.c[2])*r.t[2],sb=(b[0]-r.c[0])*r.t[0]+(b[1]-r.c[1])*r.t[1]+(b[2]-r.c[2])*r.t[2];
  if(!(sa<0&&sb>=0))return false;const k=sa/(sa-sb),x=[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];return dist(x,r.c)<=r.r+(r.cp>=0?2.5:.45);}   // checkpoints span the tube: anywhere through counts
function glideTrack(p,dt){const G=mapInfo.glide;if(!G||!p.alive||MATCH.preT>0)return;const NP=G.NP,laps=SET.gLaps||3,score=SET.gMode!=='time';
  // where along the course you are
  let best=p.gi||0,bd=1e9;for(let k=-10;k<=45;k++){const i=((p.gi||0)+k+NP)%NP,q=G.P[i];const d=(q[0]-p.pos[0])**2+(q[1]-p.pos[1])**2+(q[2]-p.pos[2])**2;if(d<bd){bd=d;best=i;}}
  if(bd>400){for(let i=0;i<NP;i+=3){const q=G.P[i];const d=(q[0]-p.pos[0])**2+(q[1]-p.pos[1])**2+(q[2]-p.pos[2])**2;if(d<bd){bd=d;best=i;}}}
  p.gi=best;p.gUp=best>=G.upFrom&&best<G.upTo&&bd<(G.R[best]+1.5)**2;p.gUpY=G.P[Math.min(NP-1,best+24)][1];   // updrafts lift you up to the course, no higher
  if(p.gUp&&Math.random()<.5)spawnParticles(p.pos[0]+(Math.random()-.5)*4,p.pos[1]-1,p.pos[2]+(Math.random()-.5)*4,1,[1,.85,.2],1.5,'magic');
  // rings and checkpoints you flew through since the last frame
  const b=[p.pos[0],p.pos[1]+.3,p.pos[2]],a=p.gPrev||b;p.gPrev=b;
  if(a!==b)for(const r of G.rings){if(Math.abs(r.c[0]-b[0])>8||Math.abs(r.c[2]-b[2])>8||Math.abs(r.c[1]-b[1])>9)continue;if(!glideCross(r,a,b))continue;
    if(r.cp<0){if(!p.gRings.has(r.id)){p.gRings.add(r.id);p.gRingN++;if(score)p.gScore+=1;sfx('orb',{vol:.6});spawnParticles(r.c[0],r.c[1],r.c[2],14,[.5,1,.45],3,'magic');}}
    else if(r.cp===p.cpNext){p.lastCp=r.cp;p.cpNext=(r.cp+1)%4;if(score)p.gScore+=2;spawnParticles(r.c[0],r.c[1],r.c[2],24,[1,.9,.3],4,'magic');
      if(r.cp===0){p.lap++;p.gRings=new Set();if(p.lap>=laps){glideFinish(p);return;}announce('Lap '+(p.lap+1)+' of '+laps,'',1.8,false);sfx('win',{vol:.5});}
      else{announce('Checkpoint!','',1.4,false);sfx('orb');}}}
  // crashes: three and you go back to the last checkpoint; landing or leaving the course does the same
  p.gInv=Math.max(0,(p.gInv||0)-dt);
  if(p.gCrash>0){if(p.gInv<=0){p.hearts--;p.gInv=1;p.hurtT=.5;sfx('hurt');if(p.hearts<=0)glideRespawn(p,'Back to the last checkpoint');}p.gCrash=0;}
  if(p.onGround||p.inWater||p.inLava){p.gGround=(p.gGround||0)+dt;if(p.gGround>.8||p.inLava)glideRespawn(p,'Back to the last checkpoint');}else p.gGround=0;
  if(p.pos[1]<1||p.pos[1]>WY+30||bd>2500)glideRespawn(p,'Back to the last checkpoint');
  const hs=Math.hypot(p.mot[0],p.mot[1],p.mot[2]);p.gSlow=hs<.08?(p.gSlow||0)+dt:0;if(p.gSlow>2)glideRespawn(p,'Back to the last checkpoint');   // stuck or stalled
  glideSync(p,dt);}
function glideSync(p,dt){p.gSyncT=(p.gSyncT||0)-dt;const m={id:p.id,s:p.gScore||0,l:p.lap||0,gi:p.gi||0,f:p.gFin||0,rg:p.gRingN||0,cp:p.cpNext};p.mgs=m;if(p.gSyncT>0&&!p.gFin)return;p.gSyncT=.25;netSend(N.MGS,m);}
function glideFinish(p){p.gFin=Math.max(.01,MATCH.gameT);p.gliding=false;const best=glideBest(),pb=!best||p.gFin<best;if(pb)store(glideKey(),String(p.gFin));
  announce('Finished!',fmtRace(p.gFin)+(pb?'  New best time!':''),4,false);sfx('win');p.gSyncT=0;glideSync(p,0);
  p.alive=false;p.spectator=true;p.bat=false;spectate.mode='bat';chatMsg((online?myName+' finished in ':'Finished in ')+fmtRace(p.gFin),'#ffff55',online);}
function glideHostTick(dt){const mg=MATCH.mg;if(!mg)return;const ps=ents.filter(e=>!e.mgLate&&e.kind==='player');const fin=ps.filter(e=>e.mgs&&e.mgs.f>0);
  if(fin.length&&!mg.endAt&&ps.length>1){mg.endAt=MATCH.gameT+30;netSend(N.MGR,{t:'endAt',v:mg.endAt});announce(fin[0].name+' finished!','30 seconds to reach the end',3);}
  if((ps.length&&fin.length===ps.length)||(mg.endAt&&MATCH.gameT>=mg.endAt)||MATCH.gameT>=(SET.gLaps||3)*180)mgEndMatch();}

// ================================== HUD ==================================
function mgHudTop(){if(MATCH.state!=='play'||MATCH.preT>0)return;const mg=MATCH.mg;if(!mg)return;
  if(MATCH.mode==='tumble'&&!mg.between){const left=120-MATCH.gameT;if(left>0&&left<=10)txt('The layers start crumbling in '+Math.ceil(left)+' second'+(Math.ceil(left)===1?'':'s'),W/2,30,18,'#fff','center');}
  if(MATCH.mode==='glide'&&mg.endAt){const left=Math.ceil(mg.endAt-MATCH.gameT);if(left>0)txt(left+' second'+(left===1?'':'s')+' to reach the end',W/2,30,18,'#fff','center');}}
// returns true when it has drawn everything (living players: no hotbar, health or hunger in these games)
function mgHud(){const p=player;if(MATCH.mode==='tumble'){tumbleHud();return p.alive;}glideHud();return p.alive;}
function tumbleHud(){const mg=MATCH.mg;if(!mg)return;const G=hudGeom();const n=mg.rounds,bw=Math.round(G.S*.5),bh=Math.max(4,Math.round(G.S*.09)),gap=Math.round(bw*.25);
  const x0=Math.round(W/2-(n*bw+(n-1)*gap)/2),y=Math.round(G.hy+G.S*.55);const me=player&&player.id;
  for(let i=0;i<n;i++){const h=mg.hist[i];const col=i>=mg.hist.length?'#8a8a8a':h==null?'#e8e8e8':h===me?'#4ce05a':'#e04848';const x=x0+i*(bw+gap);
    hc.fillStyle='rgba(0,0,0,.55)';hc.fillRect(x-2,y-2,bw+4,bh+4);hc.fillStyle=col;hc.fillRect(x,y,bw,bh);hc.fillStyle='rgba(255,255,255,.35)';hc.fillRect(x,y,bw,Math.max(1,bh>>2));}
  if(SET.tTool==='mixed'&&player.alive){const S=Math.round(G.S*.8);for(let i=0;i<2;i++){const x=Math.round(W/2-S+i*S),yy=y-S-10;hc.fillStyle='rgba(0,0,0,.45)';hc.fillRect(x,yy,S,S);
    hc.strokeStyle=player.sel===i?'#fff':'#555';hc.lineWidth=3;hc.strokeRect(x+1.5,yy+1.5,S-3,S-3);const s=player.inv[i];if(s&&ICONS[s.id])hc.drawImage(ICONS[s.id],x+S*.15,yy+S*.15,S*.7,S*.7);}}
  if(mg.round)txt('Round '+mg.round+' of '+mg.rounds,Math.round(W*.05),40,16,'#ffffff','left');}
function glideIcon(){if(glideIcon.c)return glideIcon.c;const c=mkCanvas(16,16),g=c.getContext('2d');const px=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);};
  // a small pair of grey-blue wings
  const L=['..aa........aa..','.abba......abba.','abbbba....abbbba','abbbbba..abbbbba','.abbbbbaabbbbba.','.abbbbbccbbbbba.','..abbbccccbbba..','..abbcc..ccbba..','...abc....cba...','...ab......ba...','....a......a....'];
  L.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch!=='.')px(x,y+2,ch==='a'?'#2c3448':ch==='b'?'#8c9ab8':'#c7d2e6');}));return glideIcon.c=c;}
function glideHud(){const G=mapInfo.glide;if(!G)return;const p=player,laps=SET.gLaps||3,score=SET.gMode!=='time';const S=Math.max(14,Math.round(Math.min(W,H*1.78)/64));
  // left: elytra and the standings
  hc.drawImage(glideIcon(),Math.round(W*.04),Math.round(H*.05),S*2,S*2);
  const ps=ents.filter(e=>e.kind==='player'&&!e.mgLate).map(e=>{const m=e===p?{s:p.gScore||0,l:p.lap||0,gi:p.gi||0,f:p.gFin||0}:(e.mgs||{});return {e,s:m.s||0,f:m.f||0,prog:(m.l||0)*1e4+((m.cp===1&&(m.gi||0)>G.NP*.5)?0:(m.gi||0))};});
  if(score)ps.sort((a,b)=>b.s-a.s);else ps.sort((a,b)=>(!a.f)-(!b.f)||(a.f&&b.f?a.f-b.f:b.prog-a.prog));
  const medal=['#ffd54a','#d6d6d6','#cd8a4a'];ps.slice(0,8).forEach((r,i)=>{const y=Math.round(H*.05+S*2.6+i*S*1.15);const x=Math.round(W*.04);
    hc.fillStyle=medal[i]||'#6a6a6a';hc.beginPath();hc.arc(x+S*.35,y-S*.3,S*.32,0,Math.PI*2);hc.fill();
    txt((score?String(r.s):r.f?fmtRace(r.f):'')+'  '+r.e.name,x+S*.9,y,Math.round(S*.8),r.e===p?'#ffff55':'#ffffff','left');});
  // right: time, speed, score
  const rx=Math.round(W*.96),t=p.gFin||MATCH.gameT,sp=Math.hypot(...(p.vel||[0,0,0]));
  txt(fmtRace(MATCH.preT>0?0:t),rx,Math.round(H*.05+S*1.3),Math.round(S*1.05),'#ffffff','right');
  txt(sp.toFixed(2)+' m/s',rx,Math.round(H*.05+S*2.5),Math.round(S*.75),'#ffffff','right');
  if(score)txt(String(p.gScore||0),rx,Math.round(H*.05+S*3.6),Math.round(S*.85),'#7dff6a','right');
  else{const best=glideBest();if(best)txt('Best '+fmtRace(best),rx,Math.round(H*.05+S*3.6),Math.round(S*.75),'#ffd54a','right');}
  // bottom: progress bar with checkpoint ticks and everyone's position, the lap counter, and your three hearts
  const bw=Math.round(Math.min(W*.5,620)),bx=Math.round(W/2-bw/2),by=Math.round(H*.9);
  hc.fillStyle='rgba(0,0,0,.5)';hc.fillRect(bx-3,by-4,bw+6,10);hc.fillStyle='#d0d0d0';hc.fillRect(bx,by,bw,2);
  for(const k of G.cpIdx){const x=bx+Math.round(G.L[k]/G.len*bw);hc.fillRect(x-1,by-4,2,10);}
  const frac=e=>{const m=e===p?{gi:p.gi,cp:p.cpNext}:(e.mgs||{});const gi=m.gi||0;return (m.cp===1&&gi>G.NP*.5)?0:G.L[gi]/G.len;};
  for(const e of ents){if(e.kind!=='player'||e.mgLate)continue;const x=bx+Math.round(frac(e)*bw);hc.fillStyle=e===p?'#ffff55':PLAYER_COLORS[e.color%16];hc.beginPath();hc.arc(x,by+1,e===p?6:4,0,Math.PI*2);hc.fill();
    hc.strokeStyle='#000';hc.lineWidth=1.5;hc.stroke();}
  txt(Math.min(laps,(p.lap||0)+1)+'/'+laps,bx+bw+12,by+6,Math.round(S*.8),'#ffffff','left');
  if(p.alive){const hs=Math.round(S*.7);for(let i=0;i<3;i++)drawHeartPx(Math.round(W/2-hs*1.6+i*hs*1.1),by-hs-10,hs,i<(p.hearts==null?3:p.hearts));}
  for(const e of ents){if(e===p||!e.alive||e.kind!=='player')continue;if(dist(camPos,e.pos)<90)nameTagMC(e,'#ffffff');}}
function drawHeartPx(x,y,s,full){const H5=['.##.##.','#######','#######','.#####.','..###..','...#...'];const k=s/7;
  H5.forEach((r,j)=>[...r].forEach((c,i)=>{if(c!=='#')return;hc.fillStyle=full?(j<2&&i>0&&i<3?'#a8a8ff':'#3938e5'):'#3a3a3a';hc.fillRect(Math.round(x+i*k),Math.round(y+j*k),Math.ceil(k),Math.ceil(k));}));}
