// ================= endless world (Survival): ring-buffer chunk storage, biome terrain, caves, ores, features, lighting, streaming =================
// The block/light arrays become a WX x WY x WZ ring that wraps every WX blocks. Each 16x16 column slot remembers which world
// chunk lives in it (ownX/ownZ), so getB/setB work with any world coordinate and unloaded places read as air.
const SEA=62;
let RN=16,RCM=15,ownX=null,ownZ=null,cst=null,cmaxY=null,cdirty=null,WSEED=1,worldEdits=new Map(),infRD=4,infSlotsUsed=0;
const SLOT=(cx,cz)=>((cz&RCM)*RN+(cx&RCM));
const ckey=(cx,cz)=>cx+','+cz;
function inBInf(x,y,z){if(y<0||y>=WY)return false;const cx=x>>4,cz=z>>4,s=((cz&RCM)*RN+(cx&RCM));return ownX[s]===cx&&ownZ[s]===cz;}
function chunkState(cx,cz){const s=SLOT(cx,cz);return ownX[s]===cx&&ownZ[s]===cz?cst[s]:0;}
// ready = lit and meshed with its neighbours, so physics and drawing are correct there
function chunkReadyAt(x,z){const cx=Math.floor(x)>>4,cz=Math.floor(z)>>4;return chunkState(cx,cz)>=3;}
function infInit(ringBlocks,seed,edits){
  if(INF)infShutdown();
  INF=true;WX=WZ=ringBlocks;WY=INF_WY;XM=ZM=ringBlocks-1;RN=ringBlocks>>4;RCM=RN-1;CX=0;CZ=0;
  world=new Uint16Array(WX*WY*WZ);light=new Uint8Array(WX*WY*WZ);surfaceH=new Int16Array(WX*WZ).fill(-1);
  ownX=new Int32Array(RN*RN).fill(0x7fffffff);ownZ=new Int32Array(RN*RN).fill(0x7fffffff);cst=new Uint8Array(RN*RN);cmaxY=new Uint8Array(RN*RN);cdirty=new Uint8Array(RN*RN);
  chests=new Map();reserved=[];inB=inBInf;WSEED=seed|0;worldEdits=edits||new Map();featCache.clear();infSlotsUsed=0;
  for(const c of chunks)if(c){gl.deleteBuffer(c.buf);if(c.wbuf)gl.deleteBuffer(c.wbuf);}chunks=new Array(RN*RN).fill(null);
}
function infShutdown(){for(const c of chunks)if(c){gl.deleteBuffer(c.buf);if(c.wbuf)gl.deleteBuffer(c.wbuf);}chunks=[];INF=false;inB=inBFix;XM=ZM=-1;}
function infRingFor(rd){return 2*(rd+2)+2<=16?256:512;}
function infMaxRD(){return (RN-2)/2-2|0;}

// ---------- noise ----------
function hash3(x,y,z,s){let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(z|0,1440662683)+Math.imul(s|0,1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vnoise3(x,y,z,s){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z);let xf=x-xi,yf=y-yi,zf=z-zi;xf=xf*xf*(3-2*xf);yf=yf*yf*(3-2*yf);zf=zf*zf*(3-2*zf);
  const a=hash3(xi,yi,zi,s),b=hash3(xi+1,yi,zi,s),c=hash3(xi,yi+1,zi,s),d=hash3(xi+1,yi+1,zi,s),e=hash3(xi,yi,zi+1,s),f=hash3(xi+1,yi,zi+1,s),g=hash3(xi,yi+1,zi+1,s),h=hash3(xi+1,yi+1,zi+1,s);
  const x1=a+(b-a)*xf,x2=c+(d-c)*xf,x3=e+(f-e)*xf,x4=g+(h-g)*xf;const y1=x1+(x2-x1)*yf,y2=x3+(x4-x3)*yf;return y1+(y2-y1)*zf;}
const smooth01=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};

// ---------- biomes ----------
// fog: horizon/fog colour; fogK: how much closer the fog sits; part: ambient particles; trees: share of feature tries that grow something
const BIOMES=[
  {k:'ocean',name:'Ocean',base:46,amp:9,sc:110,top:B.SAND,fill:B.SAND,trees:0,fog:[.62,.76,.95]},
  {k:'plains',name:'Plains',base:66,amp:5,sc:120,top:B.GRASS,fill:B.DIRT,trees:.07,tree:'oak',fog:[.72,.83,.98]},
  {k:'forest',name:'Forest',base:68,amp:9,sc:90,top:B.GRASS,fill:B.DIRT,trees:.8,tree:'oak',fog:[.68,.8,.92]},
  {k:'sakura',name:'Sakura Forest',base:71,amp:15,sc:100,top:B.SAKURA_GRASS,fill:B.DIRT,trees:.5,tree:'sakura',fog:[.98,.8,.9],part:'petal',sky:[.55,.62,.98]},
  {k:'crystal',name:'Crystal Forest',base:69,amp:12,sc:90,top:B.CRYSTAL_GRASS,fill:B.DIRT,trees:.5,tree:'crystal',fog:[.62,.84,1],part:'sparkle',sky:[.35,.62,1]},
  {k:'redwood',name:'Ancient Redwood',base:73,amp:16,sc:120,top:B.PODZOL,fill:B.DIRT,trees:.42,tree:'redwood',fog:[.74,.78,.74],fogK:.38,part:'mote'},
  {k:'ashen',name:'Ashen Wasteland',base:68,amp:9,sc:80,top:B.ASH,fill:B.ASH,trees:.2,tree:'burnt',fog:[.52,.45,.41],fogK:.5,part:'ash',sky:[.5,.45,.45]},
  {k:'mushroom',name:'Glowing Mushroom Fields',base:65,amp:5,sc:100,top:B.GLOW_MOSS,fill:B.DIRT,trees:.24,tree:'mushroom',fog:[.6,.5,.82],part:'spore',sky:[.42,.4,.85]},
  {k:'frozen',name:'Frozen Forest',base:68,amp:13,sc:95,top:B.SNOW_GRASS,fill:B.DIRT,trees:.45,tree:'frozen',fog:[.86,.91,.98],part:'snow',sky:[.62,.74,.92]}];
const BIO={};BIOMES.forEach((b,i)=>BIO[b.k]=i);
const LAND=[['plains',15],['forest',13],['sakura',10],['crystal',10],['redwood',10],['ashen',10],['mushroom',9],['frozen',10]];const LAND_W=LAND.reduce((a,b)=>a+b[1],0);
const VCELL=230;
function cellBiome(i,j){let r=hash2(i,j,WSEED+13)*LAND_W;for(const [k,w] of LAND){if((r-=w)<0)return BIO[k];}return BIO.plains;}
function bioH(b,x,z){const D=BIOMES[b];const n=fbm(x/D.sc,z/D.sc,WSEED+20+b*7,4);let h=D.base+(n-.5)*2*D.amp;
  if(D.k==='sakura')h+=(fbm(x/38,z/38,WSEED+71,2)-.5)*7;
  else if(D.k==='frozen'){const l=fbm(x/70,z/70,WSEED+90,3);if(l<.4)h=Math.min(h,SEA-1-(.4-l)*50);}
  else if(D.k==='redwood')h+=Math.pow(fbm(x/60,z/60,WSEED+72,2),3)*14;
  else if(D.k==='plains')h+=(fbm(x/300,z/300,WSEED+73,2)-.5)*8;
  return h;}
// column info (pure function of x,z and the seed): height, biome, blend, volcano crater lava level
const CI={h:0,b:0,lava:-1,beach:false,under:false,cont:0};
function colInfo(x,z){
  const wx=x+(fbm(x/170,z/170,WSEED+1,2)-.5)*90,wz=z+(fbm(x/170,z/170,WSEED+2,2)-.5)*90;
  let cont=fbm(x/720,z/720,WSEED+3,3)+.28*Math.max(0,1-Math.hypot(x,z)/700);
  const ci=Math.floor(wx/VCELL),cj=Math.floor(wz/VCELL);let d1=1e9,b1=0;const pts=[];
  for(let j=cj-1;j<=cj+1;j++)for(let i=ci-1;i<=ci+1;i++){const px=(i+.18+.64*hash2(i,j,WSEED+11))*VCELL,pz=(j+.18+.64*hash2(i,j,WSEED+12))*VCELL;const d=Math.hypot(wx-px,wz-pz);pts.push(d,cellBiome(i,j));if(d<d1){d1=d;b1=pts[pts.length-1];}}
  let hs=0,ws=0,lava=-1;
  for(let k=0;k<pts.length;k+=2){const w=Math.max(0,1-(pts[k]-d1)/42);if(w<=0)continue;const ww=w*w;let h=bioH(pts[k+1],x,z);
    if(BIOMES[pts[k+1]].k==='ashen'){const d=pts[k];if(d<100){const rim=h+56*Math.pow(1-8/100,1.5);if(d<8){h=rim-(8-d)*1.6;if(pts[k+1]===b1)lava=Math.floor(rim)-3;}else h+=56*Math.pow(1-d/100,1.5);}}
    hs+=h*ww;ws+=ww;}
  let h=hs/ws;
  const oceanT=smooth01(.35,.43,cont);const oh=bioH(BIO.ocean,x,z);h=oh+(h-oh)*oceanT;
  CI.h=Math.floor(h);CI.b=oceanT<.35?BIO.ocean:b1;CI.lava=oceanT>.9?lava:-1;CI.cont=cont;CI.beach=oceanT<1&&CI.h>=SEA-2&&CI.h<=SEA+1&&CI.b!==BIO.frozen;CI.under=CI.h<SEA;
  if(CI.b===BIO.ocean&&CI.h>=SEA)CI.b=b1;
  CI.sb=CI.b===b1?surfBiome(pts,pts.length,d1,b1,x,z,42):CI.b;
  return CI;}
function biomeAt(x,z){return colInfo(Math.floor(x),Math.floor(z)).b;}
// Near a border the ground of the two biomes mixes in patches (grass, sand, snow...), instead of meeting in a straight line.
// pts: [distance, biome, ...]; R: blend width. Returns the biome whose surface this column gets.
function surfBiome(pts,n,d1,b1,x,z,R){let tot=0;for(let k=0;k<n;k+=2){const w=Math.max(0,1-(pts[k]-d1)/R);pts[k]=w*w*w*w;tot+=pts[k];}if(tot<=1.0001)return b1;
  const r=clamp((fbm(x/5,z/5,WSEED+61,2)-.5)*1.6+.5,0,1)*.85+hash2(x,z,WSEED+62)*.15;let acc=0;for(let k=0;k<n;k+=2){acc+=pts[k]/tot;if(r<acc)return pts[k+1];}return b1;}

// ---------- chunk generation ----------
const GH=new Int16Array(256),GB=new Uint8Array(256),GL=new Int16Array(256),GBE=new Uint8Array(256),GU=new Uint8Array(256);
let genCX=0,genCZ=0;
function gput(x,y,z,b){if(y<1||y>=WY||(x>>4)!==genCX||(z>>4)!==genCZ)return;world[idx(x,y,z)]=b;}
function gsoft(x,y,z,b){if(y<1||y>=WY||(x>>4)!==genCX||(z>>4)!==genCZ)return;const i=idx(x,y,z),c=world[i];if(!c||BD[c].cross||c===B.SNOW&&b!==B.SNOW)world[i]=b;}
function gget(x,y,z){if(y<0||y>=WY||(x>>4)!==genCX||(z>>4)!==genCZ)return 0;return world[idx(x,y,z)];}
function genChunk(cx,cz){
  const x0=cx*16,z0=cz*16;genCX=cx;genCZ=cz;const S=WSEED;
  for(let y=0;y<WY;y++){const row=y*WZ;for(let lz=0;lz<16;lz++){const o=(row+((z0+lz)&ZM))*WX+(x0&XM);world.fill(0,o,o+16);light.fill(0,o,o+16);}}
  // terrain columns
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz;const c=colInfo(x,z);const k=lz*16+lx;GH[k]=c.h;GB[k]=c.sb!=null?c.sb:c.b;GL[k]=c.lava;GBE[k]=c.beach?1:0;GU[k]=c.under?1:0;
    const D=BIOMES[c.b];const h=Math.min(WY-2,c.h);let top=D.top,fill=D.fill||B.DIRT;const n=hash2(x,z,S+31);
    if(c.under){top=c.b===BIO.ocean?(fbm(x/20,z/20,S+32,2)<.45?B.GRAVEL:B.SAND):(n<.5?B.DIRT:B.GRAVEL);fill=top===B.GRAVEL?B.GRAVEL:top===B.SAND?B.SAND:B.DIRT;if(fbm(x/9,z/9,S+37,2)>.7)top=B.CLAY;}
    else if(c.beach){top=B.SAND;fill=B.SAND;}
    else if(D.k==='sakura'&&fbm(x/14,z/14,S+33,2)<.38)top=B.GRASS;
    else if(D.k==='redwood'&&fbm(x/12,z/12,S+34,2)<.42)top=B.GRASS;
    else if(D.k==='ashen'){const v=fbm(x/18,z/18,S+35,2);if(c.h>SEA+30)top=fill=B.BASALT;else if(v<.36){top=B.BASALT;fill=B.BASALT;}else if(v>.68&&n<.04)top=B.MAGMA;}
    else if(D.k==='frozen'&&c.h>SEA+22)top=B.SNOW;
    const fd=3+(n*2|0);
    for(let y=0;y<=h;y++){let b;if(y===0||(y<4&&hash3(x,y,z,S+36)<.5))b=B.BEDROCK;else if(y===h)b=top;else if(y>h-fd)b=fill;else b=B.STONE;world[idx(x,y,z)]=b;}
    if(c.lava>h)for(let y=h+1;y<=c.lava;y++)world[idx(x,y,z)]=B.LAVA;}
  carveCaves(cx,cz);
  // water: oceans, lakes and frozen lakes (frozen biome freezes the top)
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const k=lz*16+lx;if(!GU[k])continue;const x=x0+lx,z=z0+lz;for(let y=GH[k]+1;y<=SEA;y++){const i=idx(x,y,z);if(!world[i])world[i]=B.WATER;}
    if(GB[k]===BIO.frozen)world[idx(x,SEA,z)]=B.ICE;}
  placeOres(cx,cz);
  // ground cover: grass tufts, flowers, petals, glowing plants...
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const k=lz*16+lx;if(GU[k]||GBE[k])continue;const x=x0+lx,z=z0+lz,h=GH[k];if(h+1>=WY)continue;const below=world[idx(x,h,z)];
    if(!below||!BD[below].solid||world[idx(x,h+1,z)])continue;const r=hash2(x,z,S+40);const D=BIOMES[GB[k]];let p=0;
    switch(D.k){case 'plains':p=r<.22?B.TGRASS:r<.245?B.POPPY:r<.27?B.DANDELION:r<.2718?B.PUMPKIN:0;break;case 'forest':p=r<.14?B.TGRASS:r<.18?B.FERN:r<.19?B.POPPY:r<.1915?B.MELON:r<.1925?B.PUMPKIN:0;break;
      case 'sakura':p=r<.2?B.PETALS:r<.27?B.TGRASS:r<.28?B.POPPY:0;break;case 'crystal':p=r<.035?B.CRYSTAL_CLUSTER:r<.1?B.TGRASS:0;break;
      case 'redwood':p=r<.22?B.FERN:r<.3?B.TGRASS:0;break;case 'ashen':p=below===B.ASH&&r<.03?B.DEAD_BUSH:0;break;
      case 'mushroom':p=r<.06?B.GLOW_PLANT:r<.11?B.GLOW_SHROOM:0;break;case 'frozen':p=r<.04?B.FERN:0;break;}
    if(p)world[idx(x,h+1,z)]=p;}
  // trees and other features from this chunk and its neighbours (they may hang over the edge)
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)for(const f of chunkFeatures(cx+dx,cz+dz))buildFeature(f);
  structApply('overworld',cx,cz);
  // the player's changes
  const ed=worldEdits.get(ckey(cx,cz));if(ed)for(const [li,b] of ed){const lx=li&15,lz=(li>>4)&15,y=li>>8;world[idx(x0+lx,y,z0+lz)]=b;}
  // height map and highest block
  let my=0;for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz;let y=WY-1;while(y>0&&!world[idx(x,y,z)])y--;if(y>my)my=y;
    let t=y;while(t>0&&!(world[idx(x,t,z)]&&BD[world[idx(x,t,z)]].solid))t--;surfaceH[(z&ZM)*WX+(x&XM)]=t;}
  cmaxY[SLOT(cx,cz)]=Math.min(WY-1,my+1);
  lootChunk(cx,cz);
}
// caves: long winding tunnels (worms started in nearby chunks) plus big open caverns from 3D noise; lava lakes at the bottom.
// Crystal Forest caverns are lined with crystals, Frozen Forest caverns with ice.
const CAVE=new Float32Array(5*5*33);let carveSurf=true;
function carveCaves(cx,cz){const x0=cx*16,z0=cz*16,S=WSEED;
  const carve=(x,y,z)=>{if(y<1||y>=WY-1)return;const lx=x-x0,lz=z-z0;if(lx<0||lz<0||lx>15||lz>15)return;const k=lz*16+lx;if(y>GH[k]+(carveSurf?1:-3))return;if(GU[k]&&y>GH[k]-4)return;
    const i=idx(x,y,z),b=world[i];if(!b||b===B.BEDROCK||b===B.WATER||b===B.LAVA)return;if(y>=GH[k]-1&&(world[idx(x,y+1,z)]===B.WATER))return;world[i]=y<=10?B.LAVA:0;};
  // caverns: noise on a 4-block grid, interpolated
  carveSurf=true;
  for(let gy=0;gy<33;gy++)for(let gz=0;gz<5;gz++)for(let gx=0;gx<5;gx++){const x=x0+gx*4,y=gy*4,z=z0+gz*4;CAVE[(gy*5+gz)*5+gx]=vnoise3(x/34,y/20,z/34,S+50)*.65+vnoise3(x/13,y/9,z/13,S+51)*.35;}
  const bc=GB[8*16+8],kind=BIOMES[bc].k;const thr=kind==='crystal'?.6:kind==='frozen'?.63:.665;
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const k=lz*16+lx,top=GH[k]-7;const gx=lx>>2,fx=(lx&3)/4,gz=lz>>2,fz=(lz&3)/4;
    for(let y=5;y<top&&y<WY-2;y++){const gy=y>>2,fy=(y&3)/4;const c=(i,j,l)=>CAVE[((gy+l)*5+gz+j)*5+gx+i];
      const v=((c(0,0,0)*(1-fx)+c(1,0,0)*fx)*(1-fz)+(c(0,1,0)*(1-fx)+c(1,1,0)*fx)*fz)*(1-fy)+((c(0,0,1)*(1-fx)+c(1,0,1)*fx)*(1-fz)+(c(0,1,1)*(1-fx)+c(1,1,1)*fx)*fz)*fy;
      if(v>thr+(y<14?.04:0))carve(x0+lx,y,z0+lz);}}
  // worms (only the wide ones break through to the surface, so there are cave mouths but no ditches)
  for(let wz=cz-6;wz<=cz+6;wz++)for(let wx=cx-6;wx<=cx+6;wx++){const n=hash2(wx,wz,S+52)<.4?1:0+(hash2(wx,wz,S+53)<.12?1:0);
    for(let w=0;w<n;w++){let r0=hash3(wx,wz,w,S+54);let px=wx*16+hash3(wx,wz,w,S+55)*16,pz=wz*16+hash3(wx,wz,w,S+56)*16,py=12+hash3(wx,wz,w,S+57)*58;
      let yaw=hash3(wx,wz,w,S+58)*6.283,pit=(hash3(wx,wz,w,S+59)-.5)*.6;const len=60+(r0*90|0);const base=1.2+hash3(wx,wz,w,S+60)*1.8;
      if(Math.abs(px-(x0+8))>len+12||Math.abs(pz-(z0+8))>len+12)continue;
      for(let s=0;s<len;s++){const r=base*(.75+.5*Math.sin(s*.12+r0*9));px+=Math.cos(yaw)*Math.cos(pit);pz+=Math.sin(yaw)*Math.cos(pit);py+=Math.sin(pit);
        yaw+=(hash3(wx*7+s,wz,w,S+61)-.5)*.5;pit=pit*.85+(hash3(wx,wz*7+s,w,S+62)-.5)*.35;if(py<6)pit=Math.abs(pit);
        if(px+r<x0||px-r>x0+16||pz+r<z0||pz-r>z0+16)continue;const ri=Math.ceil(r);carveSurf=GENV<2||r>2.3;
        for(let dy=-ri;dy<=ri;dy++)for(let dz=-ri;dz<=ri;dz++)for(let dx=-ri;dx<=ri;dx++){if(dx*dx+dy*dy*1.3+dz*dz>r*r)continue;carve(Math.floor(px+dx),Math.floor(py+dy),Math.floor(pz+dz));}}}}
  // cave decoration
  if(kind==='crystal'||kind==='frozen')for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz,top=GH[lz*16+lx]-3;
    for(let y=8;y<top;y++){const i=idx(x,y,z);if(world[i]!==B.STONE)continue;const open=!world[idx(x,y+1,z)]||!world[idx(x,y-1,z)]||(lx<15&&!world[idx(x+1,y,z)])||(lx>0&&!world[idx(x-1,y,z)])||(lz<15&&!world[idx(x,y,z+1)])||(lz>0&&!world[idx(x,y,z-1)]);
      if(!open)continue;const r=hash3(x,y,z,S+63);if(kind==='crystal'){if(r<.08)world[i]=B.CRYSTAL;else if(r<.2)world[i]=B.CRYSTAL_ORE;else if(r<.27&&!world[idx(x,y+1,z)])world[idx(x,y+1,z)]=B.CRYSTAL_CLUSTER;}
      else{if(r<.55)world[i]=B.PACKED_ICE;else if(r<.62)world[i]=B.ICE;}}}
}
// ore veins: [block, tries per chunk, min y, max y, vein size, biome bonus]
const ORES=[[B.COAL_ORE,18,6,110,9],[B.IRON_ORE,12,4,64,7],[B.COBALT_ORE,6,4,50,6],[B.GOLD_ORE,3,4,32,6],[B.DIAMOND_ORE,1.4,2,16,5],
  [B.RUBY_ORE,1.6,4,40,4,'ashen'],[B.SAPPHIRE_ORE,1.6,4,40,4,'frozen'],[B.MYTHRIL_ORE,.8,2,22,4,'crystal'],[B.AMETHYST_ORE,.8,2,26,4,'mushroom'],[B.CRYSTAL_ORE,0,10,64,6,'crystal'],[B.GRANITE,2,6,90,26],[B.DIORITE,2,6,90,26],[B.ANDESITE,2,6,90,26]];
function placeOres(cx,cz){const x0=cx*16,z0=cz*16,S=WSEED;const kind=BIOMES[GB[8*16+8]].k;let n=0;
  for(const [ore,tries,y0,y1,size,bonus] of ORES){let t=tries;if(bonus===kind)t=t*3+(ore===B.CRYSTAL_ORE?8:0);const whole=Math.floor(t)+(hash2(cx,cz,S+70+n)<t%1?1:0);
    for(let v=0;v<whole;v++){n++;let x=x0+(hash3(cx,cz,n,S+71)*16|0),y=y0+(hash3(cx,cz,n,S+72)*(y1-y0)|0),z=z0+(hash3(cx,cz,n,S+73)*16|0);
      for(let s=0;s<size;s++){if((x>>4)===cx&&(z>>4)===cz&&y>0&&y<WY){const i=idx(x,y,z);if(world[i]===B.STONE)world[i]=ore;}const r=hash3(cx*31+s,cz,n,S+74);
        if(r<.33)x+=r<.16?1:-1;else if(r<.66)z+=r<.5?1:-1;else y+=r<.83?1:-1;}}}}
// features: deterministic list per chunk (cached), built clipped into whichever chunk is generating
const featCache=new Map();
function chunkFeatures(cx,cz){const key=ckey(cx,cz);let f=featCache.get(key);if(f)return f;f=[];const S=WSEED;
  for(let t=0;t<14;t++){const x=cx*16+(hash3(cx,cz,t,S+80)*16|0),z=cz*16+(hash3(cx,cz,t,S+81)*16|0);const c=colInfo(x,z);if(c.under||c.beach||c.lava>=0)continue;const D=BIOMES[c.b];
    const r=hash3(cx,cz,t,S+82);let type=null;
    if(r<D.trees)type=D.tree;
    if(D.k==='frozen'&&r>.95)type='spike';if(D.k==='crystal'&&r>.9&&r<.93)type='spire';if((D.k==='redwood'&&r>.985)||(D.k==='plains'&&r>.996))type='ruin';
    if(D.k==='plains'&&r>.9&&r<.915)type='bush';
    if(!type)continue;const sp=type==='redwood'?7:type==='ruin'?10:type==='mushroom'?6:type==='spire'?5:3.5;
    if(f.some(o=>Math.hypot(o.x-x,o.z-z)<Math.max(sp,o.sp)))continue;f.push({t:type,x,z,y:c.h+1,r:hash3(cx,cz,t,S+83),sp});}
  if(featCache.size>800)featCache.clear();featCache.set(key,f);return f;}
function buildFeature(f){const {x,y,z,r}=f;const R=(i)=>hash3(x,z,i,WSEED+90+(r*1000|0));
  switch(f.t){
  case 'oak':{const big=R(0)<.12;const h=big?7+(R(1)*3|0):4+(R(1)*3|0);for(let i=0;i<h;i++)gput(x,y+i,z,B.LOG);const rad=big?3:2;
    for(let dy=h-3;dy<=h;dy++){const rr=dy>=h-1?rad-1:rad;for(let dz=-rr;dz<=rr;dz++)for(let dx=-rr;dx<=rr;dx++){if(Math.abs(dx)===rr&&Math.abs(dz)===rr&&(dy===h||R(dx*7+dz+dy*31)<.5))continue;gsoft(x+dx,y+dy,z+dz,B.LEAVES);}}
    gsoft(x,y+h,z,B.LEAVES);break;}
  case 'bush':{gput(x,y,z,B.LOG);for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)for(let dy=0;dy<=1;dy++)if(!(dy===1&&dx&&dz))gsoft(x+dx,y+dy,z+dz,B.LEAVES);break;}
  case 'sakura':{const h=5+(R(1)*3|0);const lx=R(2)<.5?1:-1,lz=R(3)<.5?1:-1;let tx=x,tz=z;for(let i=0;i<h;i++){if(i===(h>>1)&&R(4)<.7){tx+=lx;}if(i===h-2&&R(5)<.5)tz+=lz;gput(tx,y+i,tz,B.SAKURA_LOG);}
    const rad=3+R(6)*1.6;const cy=y+h;for(let dy=-2;dy<=2;dy++)for(let dz=-5;dz<=5;dz++)for(let dx=-5;dx<=5;dx++){const d=Math.hypot(dx,dz,dy*1.8);if(d>rad+R(dx*13+dz*7+dy)*.8)continue;gsoft(tx+dx,cy+dy,tz+dz,B.SAKURA_LEAVES);}
    for(let k=0;k<10;k++){const a=R(20+k)*6.283,d=rad-.3;const hx=Math.round(tx+Math.cos(a)*d),hz=Math.round(tz+Math.sin(a)*d);const len=1+(R(40+k)*3|0);for(let j=1;j<=len;j++)gsoft(hx,cy-2-j,hz,B.SAKURA_LEAVES);}
    for(let i=1;i<=2;i++){gput(tx+lx*i,cy-1,tz,B.SAKURA_LOG);}break;}
  case 'crystal':{if(R(0)<.55){buildSpire(x,y,z,R,7+(R(1)*12|0));break;}
    const h=5+(R(1)*4|0);for(let i=0;i<h;i++)gput(x,y+i,z,B.SPRUCE_LOG);for(let dy=2;dy<=h+1;dy++){const rr=dy>h-1?1:2;for(let dz=-rr;dz<=rr;dz++)for(let dx=-rr;dx<=rr;dx++){if(Math.abs(dx)+Math.abs(dz)>rr+1)continue;if(dy<h-1&&R(dx+dz*5+dy*17)<.35)continue;gsoft(x+dx,y+dy,z+dz,B.FROZEN_LEAVES);}}
    gsoft(x,y+h+1,z,B.CRYSTAL);break;}
  case 'spire':buildSpire(x,y,z,R,14+(R(1)*10|0));break;
  case 'redwood':{const h=24+(R(1)*16|0);const thick=R(2)<.2?3:2;
    for(let i=-3;i<h;i++)for(let a=0;a<thick;a++)for(let b=0;b<thick;b++)gput(x+a,y+i,z+b,B.REDWOOD_LOG);
    for(let k=0;k<4;k++){const dx=[-1,thick,0,0][k],dz=[0,0,-1,thick][k];const rl=1+(R(10+k)*3|0);for(let i=0;i<rl;i++)gput(x+(dx<0?-1:dx>=thick?thick:R(14+k)*thick|0),y+i,z+(dz<0?-1:dz>=thick?thick:R(18+k)*thick|0),B.REDWOOD_LOG);}
    const leafAt=(cx2,cy,cz2,rad)=>{for(let dy=-1;dy<=1;dy++)for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++){if(Math.hypot(dx,dz)+Math.abs(dy)*1.5>rad+.3)continue;gsoft(cx2+dx,cy+dy,cz2+dz,B.REDWOOD_LEAVES);}};
    const mid=thick/2-.5;for(let i=Math.floor(h*.55);i<h;i+=3){const a=R(30+i)*6.283;const len=2+(R(50+i)*3|0)*(1-(i-h*.55)/(h*.45));
      for(let j=1;j<=len;j++)gput(Math.round(x+mid+Math.cos(a)*(j+mid)),y+i,Math.round(z+mid+Math.sin(a)*(j+mid)),B.REDWOOD_LOG);
      leafAt(Math.round(x+mid+Math.cos(a)*(len+mid)),y+i+1,Math.round(z+mid+Math.sin(a)*(len+mid)),2+(R(70+i)*2|0));}
    for(let dy=0;dy<6;dy++){const rad=Math.max(1,3-(dy>>1));for(let dz=-rad;dz<=rad+thick-1;dz++)for(let dx=-rad;dx<=rad+thick-1;dx++){const ex=dx<0?-dx:dx>thick-1?dx-thick+1:0,ez=dz<0?-dz:dz>thick-1?dz-thick+1:0;if(Math.hypot(ex,ez)>rad+.4)continue;gsoft(x+dx,y+h-2+dy,z+dz,B.REDWOOD_LEAVES);}}break;}
  case 'burnt':{const h=4+(R(1)*5|0);for(let i=0;i<h;i++)gput(x,y+i,z,B.BURNT_LOG);const nb=1+(R(2)*3|0);for(let k=0;k<nb;k++){const a=(R(3+k)*4|0),dx=[1,-1,0,0][a],dz=[0,0,1,-1][a];const by=y+2+(R(9+k)*(h-2)|0);gput(x+dx,by,z+dz,B.BURNT_LOG);if(R(12+k)<.5)gput(x+dx*2,by+1,z+dz*2,B.BURNT_LOG);}break;}
  case 'mushroom':{const h=5+(R(1)*5|0);const fat=R(2)<.3;for(let i=0;i<h;i++){gput(x,y+i,z,B.MUSH_STEM);if(fat&&i<h-1){gput(x+1,y+i,z,B.MUSH_STEM);gput(x,y+i,z+1,B.MUSH_STEM);gput(x+1,y+i,z+1,B.MUSH_STEM);}}
    const rad=3+(R(3)*2.5|0)+(fat?1:0);const cx2=fat?x+.5:x,cz2=fat?z+.5:z;for(let dy=0;dy<=3;dy++){const rr=rad-dy*dy*.45;for(let dz=-rad-1;dz<=rad+1;dz++)for(let dx=-rad-1;dx<=rad+1;dx++){const d=Math.hypot(x+dx-cx2,z+dz-cz2);
      if(d>rr+.3)continue;if(dy<1&&d<rr-1.2)continue;gput(x+dx,y+h+dy-1,z+dz,B.GLOW_CAP);}}
    for(let k=0;k<6;k++){const a=R(20+k)*6.283;const hx=Math.round(cx2+Math.cos(a)*(rad-.5)),hz=Math.round(cz2+Math.sin(a)*(rad-.5));gsoft(hx,y+h-2,hz,B.GLOW_PLANT);}break;}
  case 'frozen':{const h=6+(R(1)*5|0);for(let i=0;i<h;i++)gput(x,y+i,z,B.FROZEN_LOG);for(let dy=2;dy<=h+1;dy++){const rr=Math.max(0,Math.round((h+1-dy)*.45))+(dy%2===0?0:1)-((dy===h+1)?1:0);
      for(let dz=-rr;dz<=rr;dz++)for(let dx=-rr;dx<=rr;dx++){if(Math.abs(dx)+Math.abs(dz)>rr+(rr>1?1:0))continue;gsoft(x+dx,y+dy,z+dz,B.FROZEN_LEAVES);}}
    gsoft(x,y+h+1,z,B.FROZEN_LEAVES);gsoft(x,y+h+2,z,B.SNOW);break;}
  case 'spike':{const h=6+(R(1)*14|0);for(let i=-2;i<h;i++){const rr=Math.max(0,(1-i/h)*2.2);const ri=Math.ceil(rr);for(let dz=-ri;dz<=ri;dz++)for(let dx=-ri;dx<=ri;dx++)if(Math.hypot(dx,dz)<=rr+.2)gput(x+dx,y+i,z+dz,B.PACKED_ICE);}break;}
  case 'ruin':{const w=5+(R(1)*4|0),d=5+(R(2)*4|0);for(let dz=0;dz<d;dz++)for(let dx=0;dx<w;dx++){const edge=dx===0||dz===0||dx===w-1||dz===d-1;const yy=y-1;
      gput(x+dx,yy,z+dz,R(dx*11+dz)<.4?B.MSBRICK:R(dx+dz*13)<.2?B.CRACKED:B.SBRICK);if(!edge)continue;const hh=Math.floor(R(dx*5+dz*7+3)*4);
      for(let i=0;i<hh;i++)gput(x+dx,y+i,z+dz,R(dx*3+dz*5+i)<.45?B.MSBRICK:R(i+dx)<.3?B.CRACKED:B.SBRICK);if(hh>0&&R(dx+dz+40)<.3)gsoft(x+dx,y+hh,z+dz,B.VINE);}
    if(R(9)<.6){gput(x+(w>>1),y,z+(d>>1),B.CHISELED);}
    // a small buried vault under the middle of the floor (a chiseled tile marks the spot) with a chest in it
    {const mx=x+(w>>1),mz=z+(d>>1);gput(mx,y-1,mz,B.CHISELED);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){gput(mx+a,y-3,mz+b,B.SBRICK);if(a||b)gput(mx+a,y-2,mz+b,R(a*3+b*7+60)<.5?B.MSBRICK:B.SBRICK);}
      gput(mx,y-2,mz,B.CHEST);if(typeof lootAdd==='function')lootAdd(mx,y-2,mz,'ruin');}
    break;}
  }}
function buildSpire(x,y,z,R,len){const ax=(R(5)-.5)*.7,az=(R(6)-.5)*.7;const r0=1.6+R(7)*1.2;
  for(let i=-2;i<len;i++){const t=Math.max(0,i)/len;const rr=r0*(1-t)+.35;const px=x+ax*i,pz=z+az*i;const ri=Math.ceil(rr);
    for(let dz=-ri;dz<=ri;dz++)for(let dx=-ri;dx<=ri;dx++)if(Math.hypot(dx,dz)<=rr)gput(Math.round(px+dx),y+i,Math.round(pz+dz),B.CRYSTAL);}
  for(let k=0;k<3;k++){const a=R(30+k)*6.283,l=3+(R(40+k)*4|0);for(let i=0;i<l;i++)gput(Math.round(x+Math.cos(a)*(1+i*.6)),y+i,Math.round(z+Math.sin(a)*(1+i*.6)),B.CRYSTAL);}}

// ---------- lighting (sky + block light, 4 bits each) recomputed for a box of columns ----------
const NBLK=2048;const OPQ=new Uint8Array(NBLK),ATT=new Uint8Array(NBLK),EMIT=new Uint8Array(NBLK);
function refreshLightTables(){for(let b=0;b<NBLK;b++){const D=BD[b];OPQ[b]=D&&D.opaque?1:0;ATT[b]=D&&(D.leaves||D.liquid==='water'||b===B.ICE)?1:0;EMIT[b]=D?D.light|0:0;}}
let LQ=new Int32Array(1<<20),LOLD=new Uint8Array(1<<16),LTOP=new Int16Array(4096);
// recompute light in columns x0..x1, z0..z1 (inclusive); light flowing in from the ring of columns just outside is kept.
// returns the set of chunk slots whose light changed
function lightBox(x0,z0,x1,z1){
  if(!OPQ[B.STONE])refreshLightTables();
  const bw=x1-x0+1,bd=z1-z0+1,ew=bw+2;if(bw>62||bd>62)throw new Error('light box too big');
  let maxY=0;for(let cz=z0>>4;cz<=z1>>4;cz++)for(let cx=x0>>4;cx<=x1>>4;cx++){const s=SLOT(cx,cz);if(ownX[s]===cx&&ownZ[s]===cz&&cmaxY[s]>maxY)maxY=cmaxY[s];}
  const yTop=Math.min(WY-1,maxY+15),H=yTop+1,plane=WX*WZ;
  const loaded=(x,z)=>{const cx=x>>4,cz=z>>4,s=((cz&RCM)*RN+(cx&RCM));return ownX[s]===cx&&ownZ[s]===cz;};
  // opaque tops for the box and a 1-column ring
  for(let ez=0;ez<bd+2;ez++)for(let ex=0;ex<ew;ex++){const x=x0-1+ex,z=z0-1+ez;let t=-1;if(!loaded(x,z))t=WY;else{const base=((z&ZM)*WX+(x&XM));let y=yTop;while(y>=0&&!OPQ[world[y*plane+base]])y--;t=y;}LTOP[ez*ew+ex]=t;}
  const need=bw*bd*H;if(LOLD.length<need)LOLD=new Uint8Array(need*1.3|0);if(LQ.length<need*2)LQ=new Int32Array(need*2.2|0);
  const changed=new Set();
  for(const shift of [4,0]){let qh=0,qt=0;
    // seed
    for(let lz=0;lz<bd;lz++)for(let lx=0;lx<bw;lx++){const x=x0+lx,z=z0+lz;if(!loaded(x,z))continue;const base=((z&ZM)*WX+(x&XM));const top=LTOP[(lz+1)*ew+lx+1];
      let nt=top;if(shift===4){for(const o of [-1,1,-ew,ew]){const t=LTOP[(lz+1)*ew+lx+1+o];if(t>nt)nt=t;}if(nt>yTop)nt=yTop;}
      for(let y=0;y<H;y++){const i=y*plane+base;const L=light[i];if(shift===4)LOLD[(y*bd+lz)*bw+lx]=L;let v=0;
        if(shift===4){if(y>top){v=15;if(y<=nt)LQ[qt++]=lx|lz<<6|y<<12;}}else{v=EMIT[world[i]];if(v)LQ[qt++]=lx|lz<<6|y<<12;}
        light[i]=(L&~(15<<shift))|(v<<shift);}}
    // light flowing in from outside the box
    const inject=(lx,lz,ox,oz)=>{const x=x0+lx,z=z0+lz,X=x+ox,Z=z+oz;if(!loaded(X,Z)||!loaded(x,z))return;const b0=((z&ZM)*WX+(x&XM)),b1=((Z&ZM)*WX+(X&XM));
      for(let y=0;y<H;y++){const l=(light[y*plane+b1]>>shift)&15;if(l<=1)continue;const i=y*plane+b0;const b=world[i];if(OPQ[b])continue;const nl=l-1-ATT[b];if(((light[i]>>shift)&15)<nl){light[i]=(light[i]&~(15<<shift))|(nl<<shift);LQ[qt++]=lx|lz<<6|y<<12;}}};
    for(let lx=0;lx<bw;lx++){inject(lx,0,0,-1);inject(lx,bd-1,0,1);}for(let lz=0;lz<bd;lz++){inject(0,lz,-1,0);inject(bw-1,lz,1,0);}
    // flood
    while(qh<qt){const q=LQ[qh++];const lx=q&63,lz=(q>>6)&63,y=q>>>12;const x=x0+lx,z=z0+lz;const i=y*plane+((z&ZM)*WX+(x&XM));const l=(light[i]>>shift)&15;if(l<=1)continue;
      for(let f=0;f<6;f++){let nx=lx,ny=y,nz=lz;if(f===0)nx++;else if(f===1)nx--;else if(f===2)ny++;else if(f===3)ny--;else if(f===4)nz++;else nz--;
        if(nx<0||nz<0||nx>=bw||nz>=bd||ny<0||ny>=H)continue;const X=x0+nx,Z=z0+nz;if(!loaded(X,Z))continue;const j=ny*plane+((Z&ZM)*WX+(X&XM));const b=world[j];if(OPQ[b])continue;
        const nl=l-1-ATT[b];if(((light[j]>>shift)&15)<nl){light[j]=(light[j]&~(15<<shift))|(nl<<shift);if(qt<LQ.length)LQ[qt++]=nx|nz<<6|ny<<12;}}}}
  // which chunks changed
  for(let lz=0;lz<bd;lz++)for(let lx=0;lx<bw;lx++){const x=x0+lx,z=z0+lz;if(!loaded(x,z))continue;const s=SLOT(x>>4,z>>4);if(changed.has(s))continue;const base=((z&ZM)*WX+(x&XM));
    for(let y=0;y<H;y++)if(light[y*plane+base]!==LOLD[(y*bd+lz)*bw+lx]){changed.add(s);break;}}
  // above the box's top everything is open sky
  if(yTop<WY-1)for(let lz=0;lz<bd;lz++)for(let lx=0;lx<bw;lx++){const x=x0+lx,z=z0+lz;if(!loaded(x,z))continue;const base=((z&ZM)*WX+(x&XM));for(let y=yTop+1;y<WY;y++)light[y*plane+base]=0xF0;}
  return changed;}
// lighting a freshly generated chunk: recompute its own 16x16 columns, pull light in from lit neighbours, then let its light
// spread outward (only ever brightening) up to 15 blocks into the neighbours. Much cheaper than a full box recompute.
const LT18=new Int16Array(18*18);
function lightChunk(cx,cz){if(!OPQ[B.STONE])refreshLightTables();
  const x0=cx*16,z0=cz*16,M=15,BX=x0-M,BZ=z0-M,BW=46,plane=WX*WZ;let maxY=0;
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const s=SLOT(cx+dx,cz+dz);if(ownX[s]===cx+dx&&ownZ[s]===cz+dz&&cmaxY[s]>maxY)maxY=cmaxY[s];}
  const yTop=Math.min(WY-1,maxY+15),H=yTop+1;
  const loaded=(x,z)=>{const qx=x>>4,qz=z>>4,s=((qz&RCM)*RN+(qx&RCM));return ownX[s]===qx&&ownZ[s]===qz;};
  for(let ez=0;ez<18;ez++)for(let ex=0;ex<18;ex++){const x=x0-1+ex,z=z0-1+ez;let t=WY;if(loaded(x,z)){const base=((z&ZM)*WX+(x&XM));let y=WY-1;while(y>=0&&!OPQ[world[y*plane+base]])y--;t=y;}LT18[ez*18+ex]=t;}
  if(LQ.length<BW*BW*H)LQ=new Int32Array(BW*BW*H);
  const touched=new Set();const mine=SLOT(cx,cz);
  for(const shift of [4,0]){let qh=0,qt=0;const mask=~(15<<shift);
    for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz,base=((z&ZM)*WX+(x&XM));const top=LT18[(lz+1)*18+lx+1];
      let nt=top;if(shift===4){for(const o of [-1,1,-18,18]){const t=LT18[(lz+1)*18+lx+1+o];if(t>nt)nt=t;}if(nt>yTop)nt=yTop;}
      for(let y=0;y<H;y++){const i=y*plane+base;let v;if(shift===4){v=y>top?15:0;if(v&&y<=nt)LQ[qt++]=(lx+M)|(lz+M)<<6|y<<12;}else{v=EMIT[world[i]];if(v)LQ[qt++]=(lx+M)|(lz+M)<<6|y<<12;}
        light[i]=(light[i]&mask)|(v<<shift);}
      if(shift===4)for(let y=H;y<WY;y++)light[y*plane+base]=0xF0;}
    // light already in the neighbours flows in
    const inject=(lx,lz,ox,oz)=>{const x=x0+lx,z=z0+lz,X=x+ox,Z=z+oz;if(!loaded(X,Z))return;const b0=((z&ZM)*WX+(x&XM)),b1=((Z&ZM)*WX+(X&XM));
      for(let y=0;y<H;y++){const l=(light[y*plane+b1]>>shift)&15;if(l<=1)continue;const i=y*plane+b0;const b=world[i];if(OPQ[b])continue;const nl=l-1-ATT[b];if(((light[i]>>shift)&15)<nl){light[i]=(light[i]&mask)|(nl<<shift);LQ[qt++]=(lx+M)|(lz+M)<<6|y<<12;}}};
    for(let i=0;i<16;i++){inject(i,0,0,-1);inject(i,15,0,1);inject(0,i,-1,0);inject(15,i,1,0);}
    // flood (brighten only), out to 15 blocks around the chunk
    while(qh<qt){const q=LQ[qh++];const lx=q&63,lz=(q>>6)&63,y=q>>>12;const x=BX+lx,z=BZ+lz;const l=(light[y*plane+((z&ZM)*WX+(x&XM))]>>shift)&15;if(l<=1)continue;
      for(let f=0;f<6;f++){let nx=lx,ny=y,nz=lz;if(f===0)nx++;else if(f===1)nx--;else if(f===2)ny++;else if(f===3)ny--;else if(f===4)nz++;else nz--;
        if(nx<0||nz<0||nx>=BW||nz>=BW||ny<0||ny>=H)continue;const X=BX+nx,Z=BZ+nz;if(!loaded(X,Z))continue;const j=ny*plane+((Z&ZM)*WX+(X&XM));const b=world[j];if(OPQ[b])continue;
        const nl=l-1-ATT[b];if(((light[j]>>shift)&15)<nl){light[j]=(light[j]&mask)|(nl<<shift);if(nx<M||nz<M||nx>=M+16||nz>=M+16)touched.add(SLOT(X>>4,Z>>4));if(qt<LQ.length)LQ[qt++]=nx|nz<<6|ny<<12;}}}}
  touched.delete(mine);return touched;}
// after a block edit: relight around it and remesh what changed
function infRelightAround(x,y,z){const ch=lightBox(x-15,z-15,x+15,z+15);for(const s of ch)if(cst[s]>=3)cdirty[s]=1;}

// ---------- block edits (kept per chunk so they survive the chunk unloading, and saved with the world) ----------
function infSetBlock(x,y,z,b){if(y<0||y>=WY)return;const cx=x>>4,cz=z>>4,k=ckey(cx,cz);let m=worldEdits.get(k);if(!m){m=new Map();worldEdits.set(k,m);}
  m.set((x&15)|((z&15)<<4)|(y<<8),b);infDirtySave=true;
  if(!inBInf(x,y,z))return;const s=SLOT(cx,cz);world[idx(x,y,z)]=b;if(b&&y+1>cmaxY[s])cmaxY[s]=Math.min(WY-1,y+1);
  let t=WY-1;while(t>0&&!(world[idx(x,t,z)]&&BD[world[idx(x,t,z)]].solid))t--;surfaceH[(z&ZM)*WX+(x&XM)]=t;
  if(cst[s]<2)return;
  const ch=lightBox(x-15,z-15,x+15,z+15);ch.add(s);for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=x+dx,nz=z+dz;if((nx>>4)!==cx||(nz>>4)!==cz){const s2=SLOT(nx>>4,nz>>4);if(ownX[s2]===nx>>4&&ownZ[s2]===nz>>4)ch.add(s2);}}
  // the edited chunk is rebuilt straight away so the change shows this frame; neighbours follow in the stream tick
  if(cst[s]>=3)meshSlot(s);for(const s2 of ch)if(s2!==s&&cst[s2]>=3)cdirty[s2]=1;}
let infDirtySave=false;

// ---------- streaming: generate / light / mesh chunks around the camera within a per-frame time budget ----------
const SPIRAL=[];for(let dz=-16;dz<=16;dz++)for(let dx=-16;dx<=16;dx++)SPIRAL.push([dx,dz,Math.max(Math.abs(dx),Math.abs(dz)),dx*dx+dz*dz]);SPIRAL.sort((a,b)=>a[3]-b[3]);
let infStats={gen:0,light:0,mesh:0};
function infClaim(cx,cz){const s=SLOT(cx,cz);if(ownX[s]===cx&&ownZ[s]===cz)return s;
  if(chunks[s]){gl.deleteBuffer(chunks[s].buf);if(chunks[s].wbuf)gl.deleteBuffer(chunks[s].wbuf);chunks[s]=null;}
  ownX[s]=cx;ownZ[s]=cz;cst[s]=0;cdirty[s]=0;genChunk(cx,cz);cst[s]=1;infStats.gen++;return s;}
function allNeighbours(cx,cz,minState){for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(chunkState(cx+dx,cz+dz)<minState)return false;}return true;}
function infTick(px,pz,budget){if(!INF)return 0;const t0=performance.now();const pcx=Math.floor(px)>>4,pcz=Math.floor(pz)>>4;const rd=Math.min(infRD,infMaxRD());const G=rd+2,L=rd+1,M=rd;let work=0;
  for(const [dx,dz,d] of SPIRAL){if(d>G)break;const cx=pcx+dx,cz=pcz+dz;const s=SLOT(cx,cz);const mine=ownX[s]===cx&&ownZ[s]===cz;
    if(!mine){infClaim(cx,cz);work++;if(performance.now()-t0>budget)break;continue;}
    if(d<=L&&cst[s]===1&&allNeighbours(cx,cz,1)){const ch=lightChunk(cx,cz);for(const s2 of ch)if(cst[s2]>=3)cdirty[s2]=1;cst[s]=2;infStats.light++;work++;if(performance.now()-t0>budget)break;continue;}
    if(d<=M&&cst[s]>=2&&(cst[s]===2||cdirty[s])&&allNeighbours(cx,cz,2)){meshSlot(s);cst[s]=3;cdirty[s]=0;infStats.mesh++;work++;if(performance.now()-t0>budget)break;}}
  return work;}
// how much of the area around the player is ready (loading screen progress)
function infProgress(px,pz,r){const pcx=Math.floor(px)>>4,pcz=Math.floor(pz)>>4;let n=0,ok=0;for(const [dx,dz,d] of SPIRAL){if(d>r)break;n++;if(chunkState(pcx+dx,pcz+dz)>=3)ok++;}return ok/n;}
function meshSlot(s){const cx=ownX[s],cz=ownZ[s];const m=meshRegion(cx*16,cz*16,0,cmaxY[s]);uploadChunkMesh(s,m,cx,cz);}
// a safe place to stand near x,z (top of the ground, not in water)
function infFindSpawn(){for(let r=0;r<4000;r+=24){const n=r?Math.max(6,Math.round(r/12)):1;for(let k=0;k<n;k++){const a=k/n*6.283+r*.01;const x=Math.round(Math.cos(a)*r),z=Math.round(Math.sin(a)*r);
  const c=colInfo(x,z);if(!c.under&&!c.beach&&c.lava<0&&c.h<SEA+26)return [x+.5,c.h+1,z+.5];}}return [0.5,SEA+2,0.5];}
// edits <-> plain data for saving / sending
function editsToJSON(){const o={};for(const [k,m] of worldEdits){if(!m.size)continue;const a=[];for(const [i,b] of m)a.push(i,b);o[k]=a;}return o;}
function editsFromJSON(o){const m=new Map();for(const k in o||{}){const a=o[k],mm=new Map();for(let i=0;i+1<a.length;i+=2)mm.set(a[i],a[i+1]);m.set(k,mm);}return m;}
