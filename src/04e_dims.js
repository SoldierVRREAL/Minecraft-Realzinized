// ================= The Nether and the End: their terrain, Nether Fortresses, the End island's obsidian pillars and exit portal =================
// Both use the same chunk ring as the Overworld (see 04c_inf.js); only the generator changes. 128 blocks tall.
const NCAVE=new Float32Array(5*5*33);
const SPAWNERS=new Map();   // 'dim:x,y,z' -> mob type, filled when a structure with spawners is built
function spawnerAdd(x,y,z,type){SPAWNERS.set(DIM+':'+key(x,y,z),type);}
function genNether(cx,cz){
  const x0=cx*16,z0=cz*16;genCX=cx;genCZ=cz;const S=WSEED+7000;
  for(let y=0;y<WY;y++){const row=y*WZ;for(let lz=0;lz<16;lz++){const o=(row+((z0+lz)&ZM))*WX+(x0&XM);world.fill(0,o,o+16);light.fill(0,o,o+16);}}
  for(let i=0;i<256;i++){GB[i]=BIO.nether;GH[i]=64;GU[i]=0;GBE[i]=0;GL[i]=-1;}
  // density on a 4-block grid: open caverns in the middle, solid toward the floor and the roof
  for(let gy=0;gy<33;gy++)for(let gz=0;gz<5;gz++)for(let gx=0;gx<5;gx++){const x=x0+gx*4,y=gy*4,z=z0+gz*4;
    let v=vnoise3(x/46,y/26,z/46,S+1)*.55+vnoise3(x/17,y/11,z/17,S+2)*.3+vnoise3(x/7,y/6,z/7,S+3)*.15;
    const fl=y<34?(34-y)/34:0,rf=y>92?(y-92)/34:0;v+=fl*fl*.9+rf*rf*1.1-.04;NCAVE[(gy*5+gz)*5+gx]=v;}
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz;const gx=lx>>2,fx=(lx&3)/4,gz=lz>>2,fz=(lz&3)/4;
    for(let y=0;y<WY;y++){let b=0;
      if(y===0||y===WY-1||(y<5&&hash3(x,y,z,S+4)<(5-y)/5)||(y>WY-6&&hash3(x,y,z,S+5)<(y-(WY-6))/5))b=B.BEDROCK;
      else{const gy=Math.min(31,y>>2),fy=(y&3)/4;const c=(i,j,l)=>NCAVE[((gy+l)*5+gz+j)*5+gx+i];
        const v=((c(0,0,0)*(1-fx)+c(1,0,0)*fx)*(1-fz)+(c(0,1,0)*(1-fx)+c(1,1,0)*fx)*fz)*(1-fy)+((c(0,0,1)*(1-fx)+c(1,0,1)*fx)*(1-fz)+(c(0,1,1)*(1-fx)+c(1,1,1)*fx)*fz)*fy;
        if(v>.52)b=B.NETHERRACK;else if(y<=31)b=B.LAVA;}
      world[idx(x,y,z)]=b;}}
  // floors: soul sand and gravel near the lava sea, magma at its shore; fire and mushrooms here and there
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz;const ss=fbm(x/22,z/22,S+6,2),gv=fbm(x/18,z/18,S+7,2);
    for(let y=WY-6;y>4;y--){const i=idx(x,y,z),b=world[i];if(b!==B.NETHERRACK)continue;const up=world[idx(x,y+1,z)];
      if(up===0){const r=hash3(x,y,z,S+8);
        if(y<=40&&ss>.6){world[i]=B.SOUL;if(world[idx(x,y-1,z)]===B.NETHERRACK)world[idx(x,y-1,z)]=B.SOUL;if(r<.04)world[idx(x,y+1,z)]=B.NETHER_WART;}
        else if(y>=30&&y<=36&&gv>.63)world[i]=B.GRAVEL;
        else if(y<=33&&r<.25)world[i]=B.MAGMA;
        else if(r<.006)world[idx(x,y+1,z)]=B.FIRE;
        else if(r<.012)world[idx(x,y+1,z)]=r<.009?B.MUSH_RED:B.MUSH_BROWN;}}}
  // glowstone hanging from the roof
  for(let t=0;t<3;t++){const r=hash3(cx,cz,t,S+9);if(r>.55)continue;const gx=x0+(hash3(cx,cz,t,S+10)*16|0),gz=z0+(hash3(cx,cz,t,S+11)*16|0);let gy=WY-8;
    while(gy>40&&!(world[idx(gx,gy,gz)]===0&&world[idx(gx,gy+1,gz)]===B.NETHERRACK))gy--;if(gy<=40)continue;
    for(let k=0;k<40;k++){const x=gx+Math.round((hash3(gx,k,gz,S+12)-.5)*5),y=gy-(hash3(gx,k,gz,S+13)*6|0),z=gz+Math.round((hash3(gx,k,gz,S+14)-.5)*5);
      if((x>>4)!==cx||(z>>4)!==cz||y<1)continue;const i=idx(x,y,z);if(world[i])continue;const n=[world[idx(x,y+1,z)],lx1(x,y,z)];if(n[0]===B.GLOW||n[0]===B.NETHERRACK||n[1])world[i]=B.GLOW;}}
  // quartz ore, and lava springs in the walls
  for(let v=0;v<14;v++){let x=x0+(hash3(cx,cz,v,S+15)*16|0),y=10+(hash3(cx,cz,v,S+16)*108|0),z=z0+(hash3(cx,cz,v,S+17)*16|0);
    for(let s=0;s<7;s++){if((x>>4)===cx&&(z>>4)===cz&&y>0&&y<WY){const i=idx(x,y,z);if(world[i]===B.NETHERRACK)world[i]=B.QUARTZ_ORE;}const r=hash3(cx*31+s,cz,v,S+18);if(r<.33)x+=r<.16?1:-1;else if(r<.66)z+=r<.5?1:-1;else y+=r<.83?1:-1;}}
  for(let v=0;v<2;v++){const x=x0+(hash3(cx,cz,v,S+19)*16|0),y=36+(hash3(cx,cz,v,S+20)*80|0),z=z0+(hash3(cx,cz,v,S+21)*16|0);const i=idx(x,y,z);
    if(world[i]!==B.NETHERRACK)continue;let open=0;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz;if((xx>>4)===cx&&(zz>>4)===cz&&!world[idx(xx,y,zz)])open++;}if(open===1)world[i]=B.LAVA;}
  structApply('nether',cx,cz);finishChunk(cx,cz);}
function lx1(x,y,z){const g=(xx,zz)=>(xx>>4)===genCX&&(zz>>4)===genCZ?world[idx(xx,y,zz)]:0;return g(x+1,z)===B.GLOW||g(x-1,z)===B.GLOW||g(x,z+1)===B.GLOW||g(x,z-1)===B.GLOW;}

// ---------- Nether Fortresses: nether brick bridges on tall arches, blaze spawners, a nether wart garden, a treasure room ----------
const FORT_CELL=288;
function fortressAt(i,j){const S=WSEED+7100;if(hash2(i,j,S)>.8&&!(i===0&&j===0))return null;const x=Math.round((i+.25+hash2(i,j,S+1)*.5)*FORT_CELL),z=Math.round((j+.25+hash2(i,j,S+2)*.5)*FORT_CELL);
  return {x,y:62+(hash2(i,j,S+3)*10|0),z,i,j,arms:[0,1,2,3].map(k=>28+(hash2(i,j,S+10+k)*34|0))};}
const FORTS=[];   // bounding boxes of fortresses that have been built, for mob spawning
function fortressSpots(cx,cz){const out=[];const ci=Math.floor(cx*16/FORT_CELL),cj=Math.floor(cz*16/FORT_CELL);for(let j=cj-1;j<=cj+1;j++)for(let i=ci-1;i<=ci+1;i++){const f=fortressAt(i,j);if(f)out.push(f);}return out;}
function nearestFortress(x,z){let best=null,bd=1e18;const ci=Math.floor(x/FORT_CELL),cj=Math.floor(z/FORT_CELL);for(let j=cj-2;j<=cj+2;j++)for(let i=ci-2;i<=ci+2;i++){const f=fortressAt(i,j);if(!f)continue;const d=(f.x-x)**2+(f.z-z)**2;if(d<bd){bd=d;best=f;}}return best;}
function ensureFortStructs(cx,cz){if(structSeed!==WSEED)structReset();for(const f of fortressSpots(cx,cz)){const id='nf'+f.i+','+f.j;if(STRUCTS.nether.some(s=>s.id===id))continue;const R=Math.max(...f.arms)+12;
    const S={id,x0:f.x-R,z0:f.z-R,x1:f.x+R,z1:f.z+R,build:put=>buildFortress(f,put)};STRUCTS.nether.push(S);FORTS.push({x0:S.x0,z0:S.z0,x1:S.x1,z1:S.z1,y0:f.y-4,y1:f.y+10});}}
function inFortress(x,y,z){return FORTS.some(f=>x>=f.x0&&x<=f.x1&&z>=f.z0&&z<=f.z1&&y>=f.y0&&y<=f.y1);}
function buildFortress(f,put){const {x:fx,y:fy,z:fz}=f;const R=i=>hash3(fx,fz,i,WSEED+7200);const NB=B.NETHER_BRICK,FE=B.NB_FENCE;
  const solid=(x0,y0,z0,x1,y1,z1,b)=>{for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)put(x,y,z,b);};
  // a bridge 5 wide from the middle out along one axis
  const bridge=(dx,dz,len)=>{for(let s=6;s<=len;s++){const bx=fx+dx*s,bz=fz+dz*s;for(let w=-2;w<=2;w++){const x=bx+(dz?w:0),z=bz+(dx?w:0);put(x,fy,z,NB);put(x,fy-1,z,NB);
        for(let y=fy+1;y<=fy+4;y++)put(x,y,z,Math.abs(w)===2&&y===fy+1?NB:Math.abs(w)===2&&y===fy+2&&s%2===0?FE:0);}
      // arches every 9 blocks, reaching down to the lava sea
      if(s%9===0)for(const w of [-2,2])for(let y=fy-2;y>=18;y--){const x=bx+(dz?w:0),z=bz+(dx?w:0);put(x,y,z,NB);if(y>fy-5){const x2=bx+(dz?w*0.5|0:0),z2=bz+(dx?w*0.5|0:0);put(x2,y,z2,NB);}}
      if(s%9===4)for(let w=-2;w<=2;w++){const x=bx+(dz?w:0),z=bz+(dx?w:0);put(x,fy-2,z,NB);}}};
  // the middle: an open courtyard with the first blaze spawner on a pedestal
  solid(fx-6,fy-1,fz-6,fx+6,fy,fz+6,NB);solid(fx-6,fy+1,fz-6,fx+6,fy+6,fz+6,0);
  for(let i=-6;i<=6;i++){for(const [x,z] of [[fx+i,fz-6],[fx+i,fz+6],[fx-6,fz+i],[fx+6,fz+i]]){if(Math.abs(i)<=2)continue;put(x,fy+1,z,NB);put(x,fy+2,z,FE);}}
  for(const [x,z] of [[fx-6,fz-6],[fx+6,fz-6],[fx-6,fz+6],[fx+6,fz+6]])for(let y=fy-1;y>=18;y--)put(x,y,z,NB);
  solid(fx-1,fy+1,fz-1,fx+1,fy+1,fz+1,NB);put(fx,fy+2,fz,B.SPAWNER);spawnerAdd(fx,fy+2,fz,'blaze');
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  for(let k=0;k<4;k++)bridge(dirs[k][0],dirs[k][1],f.arms[k]);
  // ends of the bridges: spawner platform, nether wart garden, treasure room, stairs down
  const order=[0,1,2,3].sort((a,b)=>R(a)-R(b));
  for(let n=0;n<4;n++){const k=order[n],[dx,dz]=dirs[k];const L=f.arms[k];const ex=fx+dx*(L+5),ez=fz+dz*(L+5);
    if(n===0){// blaze platform
      solid(ex-4,fy-1,ez-4,ex+4,fy,ez+4,NB);solid(ex-4,fy+1,ez-4,ex+4,fy+5,ez+4,0);for(let i=-4;i<=4;i++)for(const [x,z] of [[ex+i,ez-4],[ex+i,ez+4],[ex-4,ez+i],[ex+4,ez+i]]){put(x,fy+1,z,FE);}
      for(const [x,z] of [[ex-4,ez-4],[ex+4,ez-4],[ex-4,ez+4],[ex+4,ez+4]])for(let y=fy-1;y>=18;y--)put(x,y,z,NB);
      put(ex,fy+1,ez,NB);put(ex,fy+2,ez,B.SPAWNER);spawnerAdd(ex,fy+2,ez,'blaze');}
    else if(n===1){// nether wart garden, roofed
      solid(ex-5,fy-1,ez-5,ex+5,fy+6,ez+5,NB);solid(ex-4,fy+1,ez-4,ex+4,fy+5,ez+4,0);
      for(let i=-1;i<=1;i++)for(let y=fy+1;y<=fy+3;y++)put(ex-dx*5+(dz?i:0),y,ez-dz*5+(dx?i:0),0);
      for(let z=ez-3;z<=ez+3;z++)for(let x=ex-3;x<=ex+3;x++){if((dx?x:z)%3===0)continue;put(x,fy,z,B.SOUL);put(x,fy+1,z,B.NETHER_WART);}
      for(let x=ex-4;x<=ex+4;x+=4)put(x,fy+4,ez,B.GLOW);}
    else if(n===2){// treasure room
      solid(ex-4,fy-1,ez-4,ex+4,fy+5,ez+4,NB);solid(ex-3,fy+1,ez-3,ex+3,fy+4,ez+3,0);
      for(let i=-1;i<=1;i++)for(let y=fy+1;y<=fy+3;y++)put(ex-dx*4+(dz?i:0),y,ez-dz*4+(dx?i:0),0);
      for(let i=-3;i<=3;i+=2){put(ex+(dz?i:0)+dx*3,fy+2,ez+(dx?i:0)+dz*3,FE);}
      put(ex+dx*2,fy+1,ez+dz*2,B.CHEST);lootAdd(ex+dx*2,fy+1,ez+dz*2,'fortress');put(ex-dx*1+(dz?2:0),fy+1,ez-dz*1+(dx?2:0),B.CHEST);lootAdd(ex-dx*1+(dz?2:0),fy+1,ez-dz*1+(dx?2:0),'fortress');}
    else{// a second spawner on a little tower
      solid(ex-3,fy-1,ez-3,ex+3,fy,ez+3,NB);solid(ex-3,fy+1,ez-3,ex+3,fy+5,ez+3,0);for(let i=-3;i<=3;i++)for(const [x,z] of [[ex+i,ez-3],[ex+i,ez+3],[ex-3,ez+i],[ex+3,ez+i]])put(x,fy+1,z,i%2?FE:NB);
      for(let y=fy-1;y>=18;y--)for(const [x,z] of [[ex-3,ez-3],[ex+3,ez+3]])put(x,y,z,NB);
      if(R(9)<.6){put(ex,fy+1,ez,B.SPAWNER);spawnerAdd(ex,fy+1,ez,'blaze');}else{put(ex,fy+1,ez,B.CHEST);lootAdd(ex,fy+1,ez,'fortress');}}}}

// ---------- the End ----------
const END_R=96;
function endIslandTop(x,z){const d=Math.hypot(x,z);const a=Math.atan2(z,x);const R=END_R+(fbm(Math.cos(a)*3+9,Math.sin(a)*3+9,WSEED+8001,3)-.5)*40;if(d>=R)return null;const t=d/R;
  const top=Math.floor(62+(1-t*t)*3+(fbm(x/24,z/24,WSEED+8002,2)-.5)*4);const thick=Math.floor(3+Math.pow(1-t,1.4)*44+(fbm(x/14,z/14,WSEED+8003,2)-.5)*6);return [top,top-thick];}
function outerIslandTop(x,z){const d=Math.hypot(x,z);if(d<700)return null;const n=fbm(x/90,z/90,WSEED+8010,3);if(n<.66)return null;const t=(n-.66)/.2;const top=Math.floor(58+t*8+(fbm(x/20,z/20,WSEED+8011,2)-.5)*4);return [top,top-Math.floor(t*26+2)];}
function endPillars(){const S=WSEED+8100;const out=[];const a0=hash2(1,1,S)*6.283;const hs=[];for(let i=0;i<10;i++)hs.push(i);hs.sort((a,b)=>hash2(a,7,S)-hash2(b,7,S));
  for(let i=0;i<10;i++){const a=a0+i*Math.PI/5;const k=hs[i];out.push({x:Math.round(Math.cos(a)*43),z:Math.round(Math.sin(a)*43),r:2+(k%3),h:76+k*3,cage:k===1||k===2});}return out;}
function genEnd(cx,cz){
  const x0=cx*16,z0=cz*16;genCX=cx;genCZ=cz;
  for(let y=0;y<WY;y++){const row=y*WZ;for(let lz=0;lz<16;lz++){const o=(row+((z0+lz)&ZM))*WX+(x0&XM);world.fill(0,o,o+16);light.fill(0,o,o+16);}}
  for(let i=0;i<256;i++){GB[i]=BIO.end;GH[i]=60;GU[i]=0;GBE[i]=0;GL[i]=-1;}
  for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const x=x0+lx,z=z0+lz;const c=endIslandTop(x,z)||outerIslandTop(x,z);if(!c)continue;const [top,bot]=c;
    for(let y=Math.max(1,bot);y<=Math.min(WY-2,top);y++)world[idx(x,y,z)]=B.END_STONE;}
  if(Math.abs(x0+8)<120&&Math.abs(z0+8)<120)structApply('end',cx,cz);
  finishChunk(cx,cz);}
function endStructsInit(){if(STRUCTS.end.some(s=>s.id==='endmain'))return;
  STRUCTS.end.push({id:'endmain',x0:-60,z0:-60,x1:60,z1:60,build:put=>{
    for(const p of endPillars()){const ri=Math.ceil(p.r);const top=endIslandTop(p.x,p.z);const y0=top?top[1]+4:40;
      for(let y=y0;y<=p.h;y++)for(let dz=-ri;dz<=ri;dz++)for(let dx=-ri;dx<=ri;dx++)if(dx*dx+dz*dz<=p.r*p.r+p.r)put(p.x+dx,y,p.z+dz,B.OBSIDIAN);
      put(p.x,p.h+1,p.z,B.BEDROCK);
      if(p.cage)for(let dy=0;dy<=3;dy++)for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const edge=Math.abs(dx)===2||Math.abs(dz)===2||dy===3;if(edge)put(p.x+dx,p.h+1+dy,p.z+dz,B.IRON_BARS);}}
    // the exit portal's bedrock frame (lit up when the dragon dies)
    const t=endIslandTop(0,0);const y=t?t[0]:63;
    for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const d=Math.hypot(dx,dz);if(d>3.5)continue;put(dx,y-1,dz,B.BEDROCK);put(dx,y,dz,d>2.5?B.BEDROCK:0);if(d<=2.5)for(let yy=y+1;yy<=y+4;yy++)put(dx,yy,dz,0);}
    for(let yy=y;yy<=y+4;yy++)put(0,yy,0,B.BEDROCK);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])put(dx,y+2,dz,B.TORCH);}});}
function endPortalY(){const t=endIslandTop(0,0);return t?t[0]:63;}
{const r0=structReset;structReset=function(){r0();FORTS.length=0;SPAWNERS.clear();endStructsInit();};}
{const a0=structApply;structApply=function(dim,cx,cz){if(dim==='nether')ensureFortStructs(cx,cz);return a0(dim,cx,cz);};}
