// ================= Terrain v2: continents, eroded mountain ranges with snow caps, river valleys, climate-placed biomes =================
// New worlds use this generator (GENV 2, 160 blocks tall); worlds saved before it keep the old one (GENV 1) so their builds still line up.
// The nine custom biomes stay, placed by temperature and rainfall next to the new vanilla ones, and every border is blended.
let GENV=1,INF_WY=128,DIM='overworld';
BIOMES.push(
  {k:'birch',name:'Birch Forest',base:68,amp:7,sc:90,top:B.GRASS,fill:B.DIRT,trees:.75,tree:'birch',fog:[.72,.84,.97]},
  {k:'taiga',name:'Taiga',base:70,amp:9,sc:100,top:B.GRASS,fill:B.DIRT,trees:.7,tree:'spruce',fog:[.7,.8,.9],sky:[.45,.6,.92],cold:true},
  {k:'savanna',name:'Savanna',base:67,amp:4,sc:140,top:B.GRASS,fill:B.DIRT,trees:.05,tree:'acacia',fog:[.86,.85,.76],sky:[.5,.66,.95]},
  {k:'desert',name:'Desert',base:66,amp:4,sc:110,top:B.SAND,fill:B.SAND,trees:.04,tree:'cactus',fog:[.92,.87,.74],sky:[.55,.7,.96]},
  {k:'dark',name:'Dark Forest',base:68,amp:5,sc:90,top:B.GRASS,fill:B.DIRT,trees:.97,tree:'darkoak',fog:[.62,.72,.66],fogK:.75},
  {k:'hills',name:'Windswept Hills',base:72,amp:16,sc:80,top:B.GRASS,fill:B.DIRT,trees:.14,tree:'spruce',fog:[.74,.8,.9]},
  {k:'river',name:'River',base:58,amp:2,sc:100,top:B.SAND,fill:B.SAND,trees:0,fog:[.66,.78,.96]},
  {k:'nether',name:'Nether Wastes',base:64,amp:0,sc:100,top:B.NETHERRACK,fill:B.NETHERRACK,trees:0,fog:[.24,.04,.03],sky:[.2,.03,.02],part:'ash'},
  {k:'end',name:'The End',base:60,amp:0,sc:100,top:B.END_STONE,fill:B.END_STONE,trees:0,fog:[.06,.04,.08],sky:[.05,.03,.07]});
BIOMES.forEach((b,i)=>BIO[b.k]=i);
BIOMES[BIO.frozen].cold=true;

// ---------- noise helpers ----------
function ridged(x,z,s,o){let t=0,a=1,f=1,n=0,w=1;for(let i=0;i<o;i++){let v=1-Math.abs(vnoise(x*f,z*f,s+i*31)*2-1);v*=v;v*=w;w=clamp(v*1.8,0,1);t+=v*a;n+=a;a*=.5;f*=2.03;}return t/n;}
// ---------- biome cells chosen by climate ----------
const VC2=250,cellCache2=new Map();
const CLIMATE=[   // [cold, temperate, hot] x [dry, normal, wet]: weighted lists
  [[['taiga',5],['hills',3],['frozen',2]],[['taiga',6],['frozen',3],['hills',1]],[['taiga',4],['frozen',3],['redwood',3]]],
  [[['plains',6],['hills',2],['sakura',2],['forest',1],['savanna',1]],[['forest',6],['birch',4],['plains',4],['sakura',2],['crystal',3]],[['dark',4],['redwood',4],['forest',3],['mushroom',1],['crystal',1],['birch',2]]],
  [[['desert',7],['ashen',3],['savanna',2]],[['savanna',6],['desert',3],['ashen',2],['plains',2]],[['savanna',4],['mushroom',1],['dark',1],['forest',3],['plains',1]]]];
function cellBiome2(i,j){const k=i+','+j;let b=cellCache2.get(k);if(b!=null)return b;const S=WSEED;const px=(i+.5)*VC2,pz=(j+.5)*VC2;
  const T=fbm(px/1700,pz/1700,S+400,3)+(hash2(i,j,S+402)-.5)*.08,H=fbm(px/1400,pz/1400,S+401,3)+(hash2(i,j,S+403)-.5)*.08;
  const ti=T<.43?0:T>.57?2:1,hi=H<.44?0:H>.56?2:1;const list=CLIMATE[ti][hi];let r=hash2(i,j,S+404)*list.reduce((a,e)=>a+e[1],0);b=BIO[list[0][0]];
  for(const [n,w] of list){if((r-=w)<0){b=BIO[n];break;}}
  // the area around spawn is never an awkward biome to start in
  if(Math.hypot(px,pz)<VC2*1.2&&(b===BIO.ashen||b===BIO.mushroom||b===BIO.desert||BIOMES[b].cold))b=(i+j)&1?BIO.forest:BIO.plains;
  if(cellCache2.size>4000)cellCache2.clear();cellCache2.set(k,b);return b;}
function bioH2(b,x,z){const D=BIOMES[b];let h=bioH(b,x,z);
  if(D.k==='desert')h+=Math.pow(Math.abs(Math.sin(x/9+fbm(x/40,z/40,WSEED+74,2)*6)),3)*3;
  else if(D.k==='hills')h+=ridged(x/90,z/90,WSEED+75,3)*14;
  return h;}
// ---------- column info for v2 ----------
const PTS2=new Float64Array(18);
function colInfo2(x,z){const S=WSEED;
  const qx=fbm(x/420,z/420,S+430,2)-.5,qz=fbm(x/420+50,z/420,S+431,2)-.5;const wx=x+qx*180,wz=z+qz*180;
  let C=fbm(wx/1400,wz/1400,S+410,4)+.22*Math.max(0,1-Math.hypot(x,z)/900);
  const E=fbm(wx/820,wz/820,S+411,3);const m=smooth01(.46,.34,E);
  const R=ridged(wx/320,wz/320,S+412,5);
  let h=SEA+5+(fbm(wx/260,wz/260,S+413,3)-.5)*18+(fbm(x/64,z/64,S+415,2)-.5)*5;
  h+=m*(22+Math.pow(R,1.25)*66+(fbm(x/38,z/38,S+414,3)-.5)*10)+smooth01(.58,.45,E)*(1-m)*(R*14+4);
  // biome cells (warped voronoi), blended over ~60 blocks
  const bx=x+(fbm(x/170,z/170,S+1,2)-.5)*110,bz=z+(fbm(x/170,z/170,S+2,2)-.5)*110;
  const ci=Math.floor(bx/VC2),cj=Math.floor(bz/VC2);let d1=1e9,b1=0,n=0;
  for(let j=cj-1;j<=cj+1;j++)for(let i=ci-1;i<=ci+1;i++){const px=(i+.2+.6*hash2(i,j,S+11))*VC2,pz=(j+.2+.6*hash2(i,j,S+12))*VC2;const d=Math.hypot(bx-px,bz-pz);const b=cellBiome2(i,j);PTS2[n++]=d;PTS2[n++]=b;if(d<d1){d1=d;b1=b;}}
  let rs=0,ws=0,lava=-1;
  for(let k=0;k<n;k+=2){const w=Math.max(0,1-(PTS2[k]-d1)/60);if(w<=0)continue;const ww=w*w,b=PTS2[k+1],D=BIOMES[b];let r=(bioH2(b,x,z)-D.base)*(1-.55*m)+(D.base-67)*.8;
    if(D.k==='ashen'){const d=PTS2[k];if(d<100){if(d<8){r+=56*Math.pow(1-8/100,1.5)-(8-d)*1.6;if(b===b1)lava=1;}else r+=56*Math.pow(1-d/100,1.5);}}
    rs+=r*ww;ws+=ww;}
  const hm=h;h+=rs/ws;if(lava>=0)lava=Math.floor(hm+49.4)-3;
  // oceans
  const land=smooth01(.36,.45,C);const oh=SEA-12+(fbm(x/110,z/110,S+416,3)-.5)*12-smooth01(.36,.25,C)*14;h=oh+(h-oh)*land;
  // rivers: winding valleys cut down to just below sea level
  const rv=Math.abs(fbm(wx/640,wz/640,S+420,4)-.5),rw=.011+.007*fbm(x/300,z/300,S+421,2);let river=0;
  if(land>.55){const bed=SEA-3-(1-smooth01(0,rw,rv))*2;const vt=smooth01(rw*.55,rw*(2.4+m*7),rv);if(h>bed)h=bed+(h-bed)*vt;river=1-smooth01(rw*.55,rw*1.3,rv);}
  if(h>138)h=138+(h-138)*.45;
  CI.h=Math.floor(Math.min(WY-6,h));CI.b=land<.35?BIO.ocean:b1;CI.cont=C;CI.m=m;CI.river=river;CI.under=CI.h<SEA;
  CI.lava=land>.9&&lava>CI.h?Math.min(WY-4,lava):-1;
  if(CI.b===BIO.ocean&&CI.h>=SEA)CI.b=b1;
  if(river>.5&&CI.under&&CI.b!==BIO.ocean)CI.b=BIOMES[b1].cold?b1:BIO.river;
  CI.beach=land<1&&land>.2&&CI.h>=SEA-2&&CI.h<=SEA+1&&!BIOMES[b1].cold&&m<.3;
  CI.sb=CI.b===b1?surfBiome(PTS2,n,d1,b1,x,z,60):CI.b;
  return CI;}
// dispatch: the old generator for old worlds
{const c1=colInfo;colInfo=function(x,z){return GENV>=2?colInfo2(x,z):c1(x,z);};}

// ---------- v2 chunk generation ----------
const GH2=new Int16Array(18*18);
function genChunk2(cx,cz){
  const x0=cx*16,z0=cz*16;genCX=cx;genCZ=cz;const S=WSEED;
  for(let y=0;y<WY;y++){const row=y*WZ;for(let lz=0;lz<16;lz++){const o=(row+((z0+lz)&ZM))*WX+(x0&XM);world.fill(0,o,o+16);light.fill(0,o,o+16);}}
  for(let pz=0;pz<18;pz++)for(let px=0;px<18;px++){const x=x0+px-1,z=z0+pz-1;const c=colInfo2(x,z);GH2[pz*18+px]=c.h;
    if(px>0&&px<17&&pz>0&&pz<17){const k=(pz-1)*16+px-1;GH[k]=c.h;GB[k]=c.sb;GL[k]=c.lava;GBE[k]=c.beach?1:0;GU[k]=c.under?1:0;GRV[k]=c.river>.3?1:0;GM[k]=c.m*255|0;}}
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz,k=lz*16+lx,q=(lz+1)*18+lx+1;const hh=GH[k],b=GB[k],D=BIOMES[b];const h=Math.min(WY-2,hh);
    const slope=Math.max(Math.abs(GH2[q-1]-hh),Math.abs(GH2[q+1]-hh),Math.abs(GH2[q-18]-hh),Math.abs(GH2[q+18]-hh));
    let top=D.top,fill=D.fill||B.DIRT,deep=B.STONE;const n=hash2(x,z,S+31);
    const snowY=SEA+46+(fbm(x/44,z/44,S+440,2)-.5)*12-(D.cold?16:0);
    const steep=hh>SEA+2&&(slope>=4||(slope>=3&&hh<SEA+40&&hash2(x,z,S+49)<.7));
    if(GU[k]){top=b===BIO.ocean?(fbm(x/20,z/20,S+32,2)<.45?B.GRAVEL:B.SAND):GRV[k]?(n<.6?B.SAND:B.GRAVEL):(n<.5?B.DIRT:B.GRAVEL);fill=top===B.GRAVEL?B.GRAVEL:top===B.SAND?B.SAND:B.DIRT;if(fbm(x/9,z/9,S+37,2)>.72)top=B.CLAY;}
    else if(GBE[k]){top=B.SAND;fill=B.SAND;deep=B.SANDSTONE;}
    else{
      switch(D.k){
      case 'sakura':if(fbm(x/14,z/14,S+33,2)<.38)top=B.GRASS;break;
      case 'redwood':{const v=fbm(x/12,z/12,S+34,2);if(v<.42)top=B.GRASS;else if(v>.66)top=B.COARSE_DIRT;break;}
      case 'ashen':{const v=fbm(x/18,z/18,S+35,2);if(hh>SEA+30||v<.36){top=B.BASALT;fill=B.BASALT;}else if(v>.68&&n<.04)top=B.MAGMA;break;}
      case 'frozen':if(hh>SEA+18)top=B.SNOW;break;
      case 'desert':deep=B.SANDSTONE;if(fbm(x/30,z/30,S+38,2)>.7&&n<.3)top=B.RED_SAND;break;
      case 'savanna':if(fbm(x/16,z/16,S+39,2)>.66)top=B.COARSE_DIRT;break;
      case 'taiga':{const v=fbm(x/13,z/13,S+41,2);if(v>.67)top=B.PODZOL;else if(v<.3)top=B.COARSE_DIRT;break;}
      case 'hills':if(fbm(x/11,z/11,S+42,2)>.64){top=B.STONE;fill=B.STONE;}break;
      case 'river':top=B.SAND;fill=B.SAND;break;}
      if(steep){const v=fbm(x/7,(z+hh*3)/7,S+43,2);top=fill=v>.68?B.ANDESITE:v<.3&&slope<5?B.GRAVEL:B.STONE;if(D.k==='ashen')top=fill=B.BASALT;if(D.k==='desert'||D.k==='savanna'&&v>.5)top=fill=deep=B.SANDSTONE;}
      else if(hh>SEA+40&&top===B.GRASS){const v=fbm(x/9,z/9,S+44,2);if(v>.66)top=B.STONE;else if(v<.28)top=B.GRAVEL;}
      if(hh>=snowY){if(!steep||(slope<6&&fbm(x/6,z/6,S+48,2)>.4)){top=B.SNOW;if(hh>=snowY+5&&!steep)fill=B.SNOW;}}
      else if(hh>=snowY-6&&!steep&&(top===B.GRASS||top===B.PODZOL)&&hash2(x,z,S+45)<(hh-(snowY-6))/6)top=B.SNOW_GRASS;
      if(D.cold&&!steep&&top===B.GRASS&&D.k==='taiga'&&fbm(x/40,z/40,S+46,2)>.6)top=B.SNOW_GRASS;}
    const fd=3+(n*2|0);
    for(let y=0;y<=h;y++){let bb;if(y===0||(y<4&&hash3(x,y,z,S+36)<.5))bb=B.BEDROCK;else if(y===h)bb=top;else if(y>h-fd)bb=fill;else if(y>h-fd-3&&deep!==B.STONE)bb=deep;else bb=B.STONE;world[idx(x,y,z)]=bb;}
    if(GL[k]>h)for(let y=h+1;y<=GL[k];y++)world[idx(x,y,z)]=B.LAVA;}
  carveCaves(cx,cz);
  // oceans, lakes and rivers; cold places freeze over
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const k=lz*16+lx;if(!GU[k])continue;const x=x0+lx,z=z0+lz;for(let y=GH[k]+1;y<=SEA;y++){const i=idx(x,y,z);if(!world[i])world[i]=B.WATER;}
    if(BIOMES[GB[k]].cold&&world[idx(x,SEA,z)]===B.WATER)world[idx(x,SEA,z)]=B.ICE;}
  placeOres(cx,cz);
  // ground cover
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const k=lz*16+lx;if(GU[k])continue;const x=x0+lx,z=z0+lz,h=GH[k];if(h+2>=WY)continue;const below=world[idx(x,h,z)];
    if(!below||!BD[below].solid||world[idx(x,h+1,z)])continue;const r=hash2(x,z,S+40),fl=fbm(x/14,z/14,S+47,2);const D=BIOMES[GB[k]];let p=0,tall=0;
    const grassy=below===B.GRASS||below===B.PODZOL||below===B.SAKURA_GRASS||below===B.SNOW_GRASS||below===B.COARSE_DIRT;
    // sugar cane on the bank of a river or lake
    if((below===B.GRASS||below===B.SAND)&&h===SEA&&r<.18){let wet=false;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=lx+dx,zz=lz+dz;if(xx<0||zz<0||xx>15||zz>15)continue;if(world[idx(x+dx,h,z+dz)]===B.WATER)wet=true;}
      if(wet){const n2=1+(hash2(x,z,S+48)*3|0);for(let i=1;i<=n2;i++)world[idx(x,h+i,z)]=B.REEDS;continue;}}
    if(GBE[k]&&!grassy)continue;
    switch(D.k){
    case 'plains':if(r<.24)p=B.TGRASS;else if(r<.27)tall=B.TALLGRASS2;else if(fl>.62&&r<.36){const f=[B.DANDELION,B.POPPY,B.AZURE,B.OXEYE,B.TULIP_RED,B.TULIP_ORANGE,B.TULIP_WHITE,B.TULIP_PINK];p=f[(hash2(x>>3,z>>3,S+49)*f.length)|0];}
      else if(r<.285)p=r<.278?B.DANDELION:B.POPPY;else if(r<.2865)p=B.PUMPKIN;break;
    case 'forest':if(r<.13)p=B.TGRASS;else if(r<.16)p=B.FERN;else if(r<.175)p=r<.168?B.POPPY:B.DANDELION;else if(r<.185){tall=[B.LILAC,B.ROSE_BUSH,B.PEONY][(hash2(x,z,S+50)*3)|0];}
      else if(r<.19)p=B.MUSH_BROWN;else if(r<.1905)p=B.MELON;break;
    case 'birch':if(r<.16)p=B.TGRASS;else if(r<.17)p=r<.165?B.POPPY:B.ALLIUM;else if(r<.175)tall=[B.LILAC,B.PEONY][(hash2(x,z,S+50)*2)|0];break;
    case 'dark':if(r<.07)p=B.TGRASS;else if(r<.1)p=r<.085?B.MUSH_RED:B.MUSH_BROWN;else if(r<.104)tall=B.ROSE_BUSH;break;
    case 'taiga':if(r<.11)p=B.FERN;else if(r<.13)tall=B.LARGE_FERN;else if(r<.19)p=B.TGRASS;else if(r<.198)p=B.MUSH_BROWN;break;
    case 'hills':if(below===B.GRASS){if(r<.12)p=B.TGRASS;else if(r<.13)p=B.AZURE;}break;
    case 'savanna':if(r<.34)p=B.TGRASS;else if(r<.42)tall=B.TALLGRASS2;break;
    case 'desert':if(r<.012)p=B.DEAD_BUSH;break;
    case 'sakura':p=r<.2?B.PETALS:r<.27?B.TGRASS:r<.28?B.POPPY:r<.285?B.TULIP_PINK:0;break;case 'crystal':p=r<.035?B.CRYSTAL_CLUSTER:r<.1?B.TGRASS:r<.105?B.BLUE_ORCHID:0;break;
    case 'redwood':p=r<.22?B.FERN:r<.3?B.TGRASS:0;if(!p&&r<.33)tall=B.LARGE_FERN;break;case 'ashen':p=below===B.ASH&&r<.03?B.DEAD_BUSH:0;break;
    case 'mushroom':p=r<.06?B.GLOW_PLANT:r<.11?B.GLOW_SHROOM:0;break;case 'frozen':p=r<.04?B.FERN:0;break;}
    if(!grassy&&p!==B.DEAD_BUSH&&below!==B.SAND)p=tall=0;
    if(tall&&!world[idx(x,h+2,z)]){world[idx(x,h+1,z)]=tall;world[idx(x,h+2,z)]=tall+1;}else if(p)world[idx(x,h+1,z)]=p;}
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)for(const f of chunkFeatures2(cx+dx,cz+dz))buildFeature2(f);
  structApply('overworld',cx,cz);
  finishChunk(cx,cz);
}
const GRV=new Uint8Array(256),GM=new Uint8Array(256);
// the player's changes, the height map and the highest block (shared by every generator)
function finishChunk(cx,cz){const x0=cx*16,z0=cz*16;
  const ed=worldEdits.get(ckey(cx,cz));if(ed)for(const [li,b] of ed){const lx=li&15,lz=(li>>4)&15,y=li>>8;if(y<WY)world[idx(x0+lx,y,z0+lz)]=b;}
  let my=0;for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz;let y=WY-1;while(y>0&&!world[idx(x,y,z)])y--;if(y>my)my=y;
    let t=y;while(t>0&&!(world[idx(x,t,z)]&&BD[world[idx(x,t,z)]].solid))t--;surfaceH[(z&ZM)*WX+(x&XM)]=t;}
  cmaxY[SLOT(cx,cz)]=Math.min(WY-1,my+1);
  lootChunk(cx,cz);}
{const g1=genChunk;genChunk=function(cx,cz){if(structSeed!==WSEED)structReset();if(DIM==='nether')return genNether(cx,cz);if(DIM==='end')return genEnd(cx,cz);if(GENV>=2)return genChunk2(cx,cz);return g1(cx,cz);};}

// ---------- v2 features ----------
const featCache2=new Map();
function chunkFeatures2(cx,cz){const key=ckey(cx,cz);let f=featCache2.get(key);if(f)return f;f=[];const S=WSEED;
  const c0=colInfo2(cx*16+8,cz*16+8),D0=BIOMES[c0.b];const tries=D0.trees>.5?26:16;
  for(let t=0;t<tries;t++){const x=cx*16+(hash3(cx,cz,t,S+80)*16|0),z=cz*16+(hash3(cx,cz,t,S+81)*16|0);const c=colInfo2(x,z);if(c.under||c.beach||c.lava>=0||c.river>.3)continue;const D=BIOMES[c.b];
    const snowY=SEA+46-(D.cold?16:0);if(c.h>snowY-2)continue;const r=hash3(cx,cz,t,S+82);let type=null;
    let ch=D.trees;if(c.h>SEA+34)ch*=Math.max(.15,1-(c.h-SEA-34)/14);if(c.m>.6&&D.k!=='taiga')ch*=.5;
    if(r<ch)type=D.tree;
    if(D.k==='forest'&&type&&hash3(cx,cz,t,S+84)<.32)type='birch';
    if(D.k==='dark'&&type&&hash3(cx,cz,t,S+84)<.14)type=hash3(cx,cz,t,S+85)<.5?'oak':'birch';
    if(D.k==='taiga'&&type&&hash3(cx,cz,t,S+84)<.3)type='pine';
    if(D.k==='hills'&&type&&hash3(cx,cz,t,S+84)<.4)type='oak';
    if(D.k==='plains'&&!type&&r>.9&&r<.912)type='bush';
    if(c.m>.45&&D.k!=='desert'&&!type&&r>.97)type='spruce';
    if(D.k==='frozen'&&r>.95)type='spike';if(D.k==='crystal'&&r>.9&&r<.93)type='spire';if((D.k==='redwood'&&r>.985)||(D.k==='plains'&&r>.996))type='ruin';
    if((D.k==='taiga'||D.k==='hills')&&r>.975)type='boulder';
    if((D.k==='forest'||D.k==='birch'||D.k==='taiga')&&r>.955&&r<.965)type='fallen';
    if(D.k==='desert'&&r>.9&&r<.93)type='cactus';
    if(!type)continue;const sp=type==='redwood'?7:type==='ruin'?10:type==='mushroom'?6:type==='spire'?5:type==='darkoak'?4:type==='cactus'?2:3.2;
    if(f.some(o=>Math.hypot(o.x-x,o.z-z)<Math.max(sp,o.sp)))continue;f.push({t:type,x,z,y:c.h+1,r:hash3(cx,cz,t,S+83),sp});}
  // rare: a ruined portal or a pond
  {const r=hash2(cx,cz,S+86);const x=cx*16+8,z=cz*16+8;
    if(r<.006&&!c0.under&&!c0.beach&&c0.river<.2&&c0.h<SEA+40)f.push({t:'rportal',x,z,y:c0.h,r:hash2(cx,cz,S+87),sp:12});
    else if(r>.988&&!c0.under&&c0.river<.2&&c0.h<SEA+30&&['plains','forest','birch','taiga','savanna','dark','desert'].includes(D0.k)){
      const hs=[colInfo2(x-4,z).h,colInfo2(x+4,z).h,colInfo2(x,z-4).h,colInfo2(x,z+4).h];if(Math.max(...hs)-Math.min(...hs)<=2)f.push({t:'pond',x,z,y:Math.min(...hs,c0.h),r:hash2(cx,cz,S+88),sp:10,lava:D0.k==='desert'||(D0.k==='savanna'&&hash2(cx,cz,S+89)<.3)});}}
  if(featCache2.size>800)featCache2.clear();featCache2.set(key,f);return f;}
function buildFeature2(f){const {x,y,z,r}=f;const R=(i)=>hash3(x,z,i,WSEED+90+(r*1000|0));
  switch(f.t){
  case 'birch':{const h=5+(R(1)*3|0)+(R(2)<.1?3:0);for(let i=0;i<h;i++)gput(x,y+i,z,B.BIRCH_LOG);
    for(let dy=h-3;dy<=h;dy++){const rr=dy>=h-1?1:2;for(let dz=-rr;dz<=rr;dz++)for(let dx=-rr;dx<=rr;dx++){if(Math.abs(dx)===rr&&Math.abs(dz)===rr&&(dy===h||R(dx*7+dz+dy*31)<.5))continue;gsoft(x+dx,y+dy,z+dz,B.BIRCH_LEAVES);}}
    gsoft(x,y+h,z,B.BIRCH_LEAVES);gsoft(x,y+h+1,z,B.BIRCH_LEAVES);break;}
  case 'spruce':{const h=7+(R(1)*5|0);const base=1+(R(2)*2|0);const maxR=2+(R(3)<.5?1:0);for(let i=0;i<h;i++)gput(x,y+i,z,B.SPRUCE_LOG);
    let rr=0,step=0;for(let dy=h+1;dy>=base;dy--){for(let dz=-rr;dz<=rr;dz++)for(let dx=-rr;dx<=rr;dx++){if(rr>0&&Math.abs(dx)===rr&&Math.abs(dz)===rr)continue;gsoft(x+dx,y+dy,z+dz,B.SPRUCE_LEAVES);}
      if(rr>=step){rr=step===0?1:0;step=Math.min(maxR,step+1);}else rr++;}
    gsoft(x,y+h+1,z,B.SPRUCE_LEAVES);gsoft(x,y+h+2,z,B.SPRUCE_LEAVES);break;}
  case 'pine':{const h=10+(R(1)*6|0);for(let i=0;i<h;i++)gput(x,y+i,z,B.SPRUCE_LOG);const top=3+(R(2)*2|0);
    for(let dy=h-top;dy<=h;dy++){const rr=dy===h?0:dy>=h-1?1:(dy%2?1:2);for(let dz=-rr;dz<=rr;dz++)for(let dx=-rr;dx<=rr;dx++){if(rr>1&&Math.abs(dx)===rr&&Math.abs(dz)===rr)continue;gsoft(x+dx,y+dy,z+dz,B.SPRUCE_LEAVES);}}
    gsoft(x,y+h+1,z,B.SPRUCE_LEAVES);break;}
  case 'acacia':{const h=4+(R(1)*2|0);for(let i=0;i<h;i++)gput(x,y+i,z,B.ACACIA_LOG);const dir=(R(2)*4|0),dx=[1,-1,0,0][dir],dz=[0,0,1,-1][dir];let tx=x,ty=y+h-1,tz=z;const bend=1+(R(3)*2|0);
    for(let i=0;i<bend;i++){tx+=dx;tz+=dz;ty++;gput(tx,ty,tz,B.ACACIA_LOG);}ty++;gput(tx,ty,tz,B.ACACIA_LOG);
    const canopy=(cx,cy,cz2,rad)=>{for(let ddz=-rad;ddz<=rad;ddz++)for(let ddx=-rad;ddx<=rad;ddx++){if(Math.abs(ddx)===rad&&Math.abs(ddz)===rad)continue;gsoft(cx+ddx,cy,cz2+ddz,B.ACACIA_LEAVES);}
      for(let ddz=-rad+1;ddz<=rad-1;ddz++)for(let ddx=-rad+1;ddx<=rad-1;ddx++){if(Math.abs(ddx)+Math.abs(ddz)>rad)continue;gsoft(cx+ddx,cy+1,cz2+ddz,B.ACACIA_LEAVES);}};
    canopy(tx,ty,tz,3);
    if(R(4)<.6){const d2=(dir+1+(R(5)*2|0))%4,ex=[1,-1,0,0][d2],ez=[0,0,1,-1][d2];let bx=x,by=y+h-2,bz=z;for(let i=0;i<2;i++){bx+=ex;bz+=ez;by++;gput(bx,by,bz,B.ACACIA_LOG);}canopy(bx,by+1,bz,2);}break;}
  case 'darkoak':{const h=6+(R(1)*3|0);for(let i=-1;i<h;i++)for(let a=0;a<2;a++)for(let b=0;b<2;b++)gput(x+a,y+i,z+b,B.DARK_OAK_LOG);
    for(let k=0;k<3;k++){const a=R(10+k)*6.283,l=1+(R(20+k)*2|0);const bx=Math.round(x+.5+Math.cos(a)*1.6),bz=Math.round(z+.5+Math.sin(a)*1.6);for(let i=0;i<l;i++)gput(bx,y+h-2-i,bz,B.DARK_OAK_LOG);}
    for(let dy=-1;dy<=1;dy++){const rad=dy===1?2.6:3.8;const ri=Math.ceil(rad);for(let dz=-ri;dz<=ri+1;dz++)for(let dx=-ri;dx<=ri+1;dx++){const d=Math.hypot(dx-.5,dz-.5);if(d>rad+R(dx*11+dz*7+dy)*.6)continue;gsoft(x+dx,y+h+dy,z+dz,B.DARK_OAK_LEAVES);}}break;}
  case 'cactus':{const h=1+(R(1)*3|0);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(gget(x+dx,y,z+dz))return;if(gget(x,y-1,z)!==B.SAND)return;for(let i=0;i<h;i++)gput(x,y+i,z,B.CACTUS);break;}
  case 'boulder':{const rad=1.2+R(1)*1.4;const ri=Math.ceil(rad);for(let dy=-1;dy<=ri;dy++)for(let dz=-ri;dz<=ri;dz++)for(let dx=-ri;dx<=ri;dx++){if(Math.hypot(dx,dy*1.2,dz)>rad)continue;gput(x+dx,y+dy,z+dz,R(dx*5+dy*7+dz*3)<.55?B.MOSSY:B.COBBLE);}break;}
  case 'fallen':{const log=f.x%2?B.BIRCH_LOG:B.LOG;const l=4+(R(1)*3|0),ax=R(2)<.5;for(let i=0;i<l;i++){const xx=x+(ax?i:0),zz=z+(ax?0:i);gput(xx,y,zz,log);}gput(x-(ax?2:0),y,z-(ax?0:2),log);break;}
  case 'rportal':buildRuinedPortal(f,R);break;
  case 'pond':{const rad=3+R(1)*2.5,dep=2+(R(2)*2|0);const ri=Math.ceil(rad)+1;const liq=f.lava?B.LAVA:B.WATER;
    for(let dz=-ri;dz<=ri;dz++)for(let dx=-ri;dx<=ri;dx++){const d=Math.hypot(dx*(1+.3*Math.sin(R(3)*6)),dz)/rad;if(d>1)continue;const dd=Math.max(1,Math.round(dep*(1-d*d)));
      for(let yy=y+1;yy<=y+5;yy++)gput(x+dx,yy,z+dz,0);for(let yy=y-dd+1;yy<=y;yy++)gput(x+dx,yy,z+dz,liq);
      if(f.lava&&R(dx+dz*9)<.6)gput(x+dx,y-dd,z+dz,B.STONE);else if(!f.lava&&R(dx*3+dz)<.4)gput(x+dx,y-dd,z+dz,B.CLAY);}break;}
  default:buildFeature(f);}}
// a broken Nether portal from long ago: crying-free obsidian, netherrack scorched into the ground, and a chest
function buildRuinedPortal(f,R){const {x,z}=f;const y=f.y+1;const ax=R(1)<.5;const w=4,h=5;
  for(let dz=-4;dz<=4;dz++)for(let dx=-4;dx<=4;dx++){const d=Math.hypot(dx,dz);if(d>4-R(dx*3+dz*5)*1.5)continue;const r=R(dx*7+dz*13+5);gput(x+dx,y-1,z+dz,r<.55?B.NETHERRACK:r<.62?B.MAGMA:r<.7?B.GRAVEL:B.STONE);if(r>.93&&d<3)gput(x+dx,y,z+dz,B.NETHERRACK);}
  const lean=R(2)<.3;
  for(let i=0;i<w;i++)for(let j=0;j<h;j++){const edge=i===0||i===w-1||j===0||j===h-1;if(!edge)continue;if(R(i*11+j*17+3)<.28)continue;const px=x+(ax?i-1:0),pz=z+(ax?0:i-1);
    const yy=y+j-(lean&&j>2?0:0);gput(px+(lean&&!ax&&j>2?1:0),yy,pz+(lean&&ax&&j>2?1:0),B.OBSIDIAN);}
  for(let k=0;k<3;k++){const a=R(30+k)*6.283,d=2+R(40+k)*2;gput(Math.round(x+Math.cos(a)*d),y,Math.round(z+Math.sin(a)*d),B.OBSIDIAN);}
  const cxp=x+(ax?0:2),czp=z+(ax?2:0);gput(cxp,y,czp,B.CHEST);lootAdd(cxp,y,czp,'rportal');}

// ---------- structures: block lists built once and handed out chunk by chunk ----------
// STRUCTS[dim] = list of {x0,z0,x1,z1,build(put)}; the blocks are bucketed per chunk on first use
const STRUCTS={overworld:[],nether:[],end:[]},STRUCT_BUCKETS=new Map();
let structSeed=null;
function structReset(){STRUCTS.overworld=[];STRUCTS.nether=[];STRUCTS.end=[];STRUCT_BUCKETS.clear();structSeed=WSEED;LOOT.clear();
  {for(const s of strongholdSpots())STRUCTS.overworld.push({x0:s[0]-48,z0:s[2]-48,x1:s[0]+48,z1:s[2]+48,build:put=>buildStronghold(s,put),id:'sh'+s[0]});}}
function structBlocks(S){if(S.buckets)return S.buckets;const bk=new Map();const put=(x,y,z,b)=>{const k=ckey(x>>4,z>>4);let a=bk.get(k);if(!a){a=[];bk.set(k,a);}a.push(x,y,z,b);};S.build(put);S.buckets=bk;return bk;}
function structApply(dim,cx,cz){if(structSeed!==WSEED)structReset();const x0=cx*16,z0=cz*16;
  for(const S of STRUCTS[dim]){if(S.x1<x0||S.x0>x0+15||S.z1<z0||S.z0>z0+15)continue;const a=structBlocks(S).get(ckey(cx,cz));if(!a)continue;
    for(let i=0;i<a.length;i+=4){const y=a[i+1];if(y<1||y>=WY)continue;world[idx(a[i],y,a[i+2])]=a[i+3];}}}
// three strongholds in a ring 640..1150 blocks from the middle of the world, a third of a turn apart
function strongholdSpots(){const S=WSEED,a0=hash2(7,7,S+500)*6.283,out=[];for(let i=0;i<3;i++){const a=a0+i*2.0944,r=640+hash2(i,3,S+501)*500;out.push([Math.round(Math.cos(a)*r),26+(hash2(i,4,S+502)*8|0),Math.round(Math.sin(a)*r)]);}return out;}
function nearestStronghold(x,z){let best=null,bd=1e18;for(const s of strongholdSpots()){const d=(s[0]-x)**2+(s[2]-z)**2;if(d<bd){bd=d;best=s;}}return best;}
function buildStronghold(s,put){const [sx,sy,sz]=s;const R=i=>hash3(sx,sz,i,WSEED+510);let n=0;const brick=()=>{const r=R(n++);return r<.68?B.SBRICK:r<.84?B.MSBRICK:B.CRACKED;};
  // hollow box: walls of stone bricks, air inside
  const room=(x0,y0,z0,x1,y1,z1)=>{for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){const wall=x===x0||x===x1||y===y0||y===y1||z===z0||z===z1;put(x,y,z,wall?brick():0);}};
  const hole=(x0,y0,z0,x1,y1,z1)=>{for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)put(x,y,z,0);};
  // portal room
  room(sx-6,sy-1,sz-9,sx+6,sy+8,sz+9);
  for(let z=sz-8;z<=sz+8;z+=4)for(const x of [sx-6,sx+6]){put(x,sy+3,z,B.IRON_BARS);put(x,sy+4,z,B.IRON_BARS);}
  for(let z=sz+1;z<=sz+5;z++)for(let x=sx-2;x<=sx+2;x++)put(x,sy,z,B.SBRICK);
  for(let z=sz+2;z<=sz+4;z++)for(let x=sx-1;x<=sx+1;x++)put(x,sy,z,B.LAVA);
  for(let i=-1;i<=1;i++){put(sx-2,sy+1,sz+3+i,B.END_FRAME);put(sx+2,sy+1,sz+3+i,B.END_FRAME);put(sx+i,sy+1,sz+1,B.END_FRAME);put(sx+i,sy+1,sz+5,B.END_FRAME);}
  for(let i=-1;i<=1;i++){put(sx+i,sy+1,sz-1,B.SBR_STAIRS);put(sx+i,sy+1,sz,B.SBRICK);}
  for(let z=sz+6;z<=sz+8;z++)for(let x=sx-1;x<=sx+1;x++)put(x,sy+1,z,B.SBRICK);
  put(sx,sy+2,sz+7,B.SPAWNER);
  for(const [x,z] of [[sx-5,sz-8],[sx+5,sz-8],[sx-5,sz+8],[sx+5,sz+8]])put(x,sy+3,z,B.TORCH);
  // some frames already hold an eye
  for(let i=0;i<12;i++)if(R(100+i)<.1){const p=[[sx-2,sz+2],[sx-2,sz+3],[sx-2,sz+4],[sx+2,sz+2],[sx+2,sz+3],[sx+2,sz+4],[sx-1,sz+1],[sx,sz+1],[sx+1,sz+1],[sx-1,sz+5],[sx,sz+5],[sx+1,sz+5]][i];put(p[0],sy+1,p[1],B.END_FRAME_EYE);}
  // corridor south, a crossing, rooms east and west, and a stair shaft up toward the surface
  hole(sx-1,sy,sz-9,sx+1,sy+2,sz-9);
  const corr=(x0,z0,x1,z1)=>{for(let z=Math.min(z0,z1)-(x0===x1?0:2);z<=Math.max(z0,z1)+(x0===x1?0:2);z++)for(let x=Math.min(x0,x1)-(x0===x1?2:0);x<=Math.max(x0,x1)+(x0===x1?2:0);x++)for(let y=sy-1;y<=sy+3;y++){
      const side=x0===x1?(x===Math.min(x0,x1)-2||x===Math.max(x0,x1)+2):(z===Math.min(z0,z1)-2||z===Math.max(z0,z1)+2);put(x,y,z,side||y===sy-1||y===sy+3?brick():0);}};
  corr(sx,sz-10,sx,sz-26);
  room(sx-4,sy-1,sz-34,sx+4,sy+5,sz-26);hole(sx-1,sy,sz-26,sx+1,sy+2,sz-26);put(sx,sy+3,sz-30,B.TORCH);
  // fountain in the crossing
  for(let z=sz-31;z<=sz-29;z++)for(let x=sx-1;x<=sx+1;x++)put(x,sy-1,z,B.WATER);put(sx,sy,sz-30,B.SBRICK);put(sx,sy+1,sz-30,B.SBRICK);put(sx,sy+2,sz-30,B.WATER);
  corr(sx+5,sz-30,sx+20,sz-30);hole(sx+4,sy,sz-31,sx+4,sy+2,sz-29);corr(sx-5,sz-30,sx-20,sz-30);hole(sx-4,sy,sz-31,sx-4,sy+2,sz-29);
  // library
  room(sx+21,sy-1,sz-37,sx+33,sy+7,sz-23);hole(sx+21,sy,sz-31,sx+21,sy+2,sz-29);
  for(let z=sz-36;z<=sz-24;z++)for(let y=sy;y<=sy+5;y++){put(sx+32,y,z,B.BOOKSHELF);if(z%3!==0)put(sx+28,y,z,y<sy+3?B.BOOKSHELF:0);}
  for(let x=sx+22;x<=sx+31;x++)for(let y=sy;y<=sy+4;y++){put(x,y,sz-36,B.BOOKSHELF);put(x,y,sz-24,B.BOOKSHELF);}
  put(sx+24,sy,sz-30,B.CHEST);lootAdd(sx+24,sy,sz-30,'library');put(sx+30,sy+5,sz-30,B.TORCH);put(sx+23,sy+3,sz-27,B.TORCH);
  // store room
  room(sx-29,sy-1,sz-35,sx-21,sy+4,sz-25);hole(sx-21,sy,sz-31,sx-21,sy+2,sz-29);put(sx-27,sy,sz-33,B.CHEST);lootAdd(sx-27,sy,sz-33,'stronghold');put(sx-27,sy,sz-27,B.CHEST);lootAdd(sx-27,sy,sz-27,'stronghold');
  put(sx-25,sy+2,sz-30,B.TORCH);for(let x=sx-28;x<=sx-22;x+=2)put(x,sy,sz-34,B.IRON_BARS);
  // corridor north of the portal room to a prison cell block
  corr(sx,sz+10,sx,sz+22);hole(sx-1,sy,sz+9,sx+1,sy+2,sz+9);room(sx-6,sy-1,sz+23,sx+6,sy+4,sz+31);hole(sx-1,sy,sz+23,sx+1,sy+2,sz+23);
  for(let x=sx-5;x<=sx+5;x++){put(x,sy,sz+27,x%3===0?0:B.IRON_BARS);put(x,sy+1,sz+27,B.IRON_BARS);put(x,sy+2,sz+27,B.IRON_BARS);}
}
// ---------- loot: chests made by the generator are filled the first time their chunk is made (by the host) ----------
const LOOT=new Map();
function lootAdd(x,y,z,table){LOOT.set(DIM+':'+key(x,y,z),table);}
const LOOT_TABLES={
  rportal:[['obsidian',1,2,.9],['flint_and_steel',1,1,.5],['flint',1,4,.5],['gold_nugget',4,18,.8],['golden_apple',1,1,.15],['gold_ingot',1,3,.4],['golden_sword',1,1,.2],['golden_helmet',1,1,.15],['obsidian',1,3,.4],['iron_ingot',1,3,.3]],
  stronghold:[['ender_pearl',1,2,.6],['iron_ingot',1,5,.6],['bread',1,3,.6],['apple',1,3,.5],['gold_ingot',1,3,.3],['diamond',1,2,.15],['iron_sword',1,1,.2],['iron_chestplate',1,1,.15],['iron_pickaxe',1,1,.2],['ender_pearl',1,1,.3]],
  library:[['ender_pearl',1,2,.4],['bread',1,2,.3],['iron_ingot',1,3,.3],['diamond_pickaxe_e_efficiency2',1,1,.08],['bow_e_power2',1,1,.1],['iron_sword_e_sharpness1',1,1,.12]],
  fortress:[['diamond',1,3,.3],['iron_ingot',1,5,.5],['gold_ingot',1,3,.6],['golden_sword',1,1,.3],['golden_chestplate',1,1,.3],['flint_and_steel',1,1,.3],['nether_wart_item',3,7,.5],['obsidian',2,4,.25],['blaze_rod',1,2,.2]],
  end:[]};
function lootFill(t){const L=LOOT_TABLES[t]||[];const items=new Array(CHEST_SLOTS).fill(null);for(const [id0,a,b,ch] of L){if(Math.random()>ch)continue;const id=id0==='obsidian'?'b'+B.OBSIDIAN:id0;if(!ITEMS[id])continue;
    let s=Math.random()*items.length|0;for(let k=0;k<items.length&&items[s];k++)s=(s+1)%items.length;items[s]={id,count:Math.min(ITEMS[id].stack||1,a+(Math.random()*(b-a+1)|0))};}return items;}
function lootChunk(cx,cz){if(!LOOT.size||typeof chests==='undefined'||!isHost())return;for(const [dk,t] of LOOT){const i0=dk.indexOf(':');if(dk.slice(0,i0)!==DIM)continue;const k=dk.slice(i0+1);const [x,y,z]=k.split(',').map(Number);if((x>>4)!==cx||(z>>4)!==cz)continue;
  if(world[idx(x,y,z)]!==B.CHEST||chests.has(k))continue;const ed=worldEdits.get(ckey(cx,cz));if(ed&&ed.has((x&15)|((z&15)<<4)|(y<<8)))continue;   // already looted and broken, or edited
  if(lootDone.has(DIM+':'+k))continue;lootDone.add(DIM+':'+k);survChestAdd(x,y,z);chests.get(k).items=lootFill(t);}}
const lootDone=new Set();
