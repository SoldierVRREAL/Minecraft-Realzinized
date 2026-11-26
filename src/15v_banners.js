// ================= Banners and paintings =================
// Banners: 16 colours (6 wool + a stick), patterns added in a 3x3 crafting grid with dyes (open the grid by using a crafting table
// while holding a banner), up to 6 layers; a cauldron of water washes off the last layer. They stand on the ground (16 turns) or
// hang on walls, drawn with the resource pack's banner art. Paintings hang on walls in the largest size that fits there, chosen
// at random; their art comes from the resource pack (an original stand-in set is drawn when no pack is loaded).

// ---------- banner blocks: 16 standing turns + 4 walls; the colour and pattern live in BANNERS ----------
{let id=VB.lastId+1;const t=BD[B.PLANKS].side;RS.banner={stand:[],wall:[]};
  for(let r=0;r<16;r++){def(id,t,t,t,{render:false,solid:false,opaque:false,pick:true,banner:{r},sup:[0,-1,0],shape:[[.4,0,.4,.6,1,.6]]});BLOCK_COL[id]='#e0e0e0';RS.banner.stand.push(id++);}
  for(let a=0;a<4;a++){def(id,t,t,t,{render:false,solid:false,opaque:false,pick:true,banner:{a},sup:DIRS4[a].slice(),shape:[turnBox([0,0,0,1,1,.1],a)]});BLOCK_COL[id]='#e0e0e0';RS.banner.wall.push(id++);}
  VB.lastId=id-1;for(const b of RS.banner.stand.concat(RS.banner.wall)){MINE_T_X[b]=1;AXE_BLOCKS.add(b);MINE_DROP[b]=null;}}
const BANNER_PATTERNS=[// [texture name, 3x3 dye mask]
  ['border','###|# #|###'],['circle','   | # |   '],['cross','# #| # |# #'],['diagonal_left','## |#  |   '],['diagonal_right',' ##|  #|   '],['diagonal_up_left','   |#  |## '],['diagonal_up_right','   |  #| ##'],
  ['gradient','# #| # | # '],['gradient_up',' # | # |# #'],['half_horizontal','###|###|   '],['half_horizontal_bottom','   |###|###'],['half_vertical','## |## |## '],['half_vertical_right',' ##| ##| ##'],
  ['rhombus',' # |# #| # '],['square_bottom_left','   |   |#  '],['square_bottom_right','   |   |  #'],['square_top_left','#  |   |   '],['square_top_right','  #|   |   '],['straight_cross',' # |###| # '],
  ['stripe_bottom','   |   |###'],['stripe_center',' # | # | # '],['stripe_downleft','  #| # |#  '],['stripe_downright','#  | # |  #'],['stripe_left','#  |#  |#  '],['stripe_middle','   |###|   '],
  ['stripe_right','  #|  #|  #'],['small_stripes','# #|# #|   '],['stripe_top','###|   |   '],['triangle_bottom','   | # |# #'],['triangle_top','# #| # |   ']];
const DYE_OF=i=>{const k=COLORS16[i][0];return k==='white'?'bone_meal':k==='silver'?'light_gray_dye':k+'_dye';};
for(let i=0;i<16;i++){item('banner_'+i,{name:COLORS16[i][1]+' Banner',type:'mat',stack:16,color:COLORS16[i][2],banner:i,tip:['Place it on the ground or a wall','Add patterns with dyes in a 3x3 crafting grid']});}
const WOOLS16=[WOOL_IDS[0]].concat(WOOL_IDS.slice(1));
{const n0=RECIPES.length;for(let i=0;i<16;i++)if(WOOLS16[i])shaped(['WWW','WWW',' S '],{W:WOOLS16[i],S:'stick'},'banner_'+i);for(let i=n0;i<RECIPES.length;i++)LC_REC.push(lcRecipe(RECIPES[i]));
  LC_TABS.find(t=>t.name==='Decoration').entries.push(['Banners',[...Array(16).keys()].map(i=>'banner_'+i)]);}
// patterns: one banner plus dyes of one colour laid out in a pattern's shape
{const m0=matchRecipe;matchRecipe=function(grid,n){const r=m0(grid,n);if(r||n!==3)return r;const ban=[];const dyes=[];
  grid.forEach((s,i)=>{if(!s)return;const it=ITEMS[s.id];if(it&&it.banner!=null)ban.push([i,s]);else dyes.push([i,s]);});
  if(ban.length!==1||!dyes.length)return null;const dyeCol=dyes.map(([,s])=>[...Array(16).keys()].find(c=>DYE_OF(c)===s.id));if(dyeCol.some(c=>c==null)||new Set(dyeCol).size!==1)return null;
  const mask=[...Array(9)].map((_,i)=>dyes.some(([j])=>j===i)?'#':' ');const m=mask.slice(0,3).join('')+'|'+mask.slice(3,6).join('')+'|'+mask.slice(6).join('');
  const P=BANNER_PATTERNS.find(p=>p[1]===m);if(!P)return null;const b=ban[0][1];const layers=(b.tag&&b.tag.p)||[];if(layers.length>=6)return null;
  return {out:b.id,n:1,tag:{p:layers.concat([[P[0],dyeCol[0]]])}};};}
// the crafting screen keeps the result's tag
{const s=document;const sc0=slotClick;slotClick=function(kind,i,right,shift){if(kind==='o'){const r=craftResult();if(r&&r.tag){const p=player;if(CR.cur)return;
      for(let k=0;k<CR.grid.length;k++){const g=CR.grid[k];if(!g)continue;g.count--;if(!g.count)CR.grid[k]=null;}CR.cur={id:r.out,count:1,tag:r.tag};sfx('pick');craftRender();return;}}return sc0(kind,i,right,shift);};}
// holding a banner at a crafting table opens the 3x3 grid instead of the recipe book
{const t0=tryOpenChest;tryOpenChest=function(){const p=player;if(p&&p.alive&&MATCH.mode==='survival'&&!p.sneak){const s=p.inv[p.sel];if(s&&ITEMS[s.id]&&ITEMS[s.id].banner!=null){const h=raycastBlock(eye(p),fwd(p),4.5);if(h&&h.b===B.CRAFTING)return craftOpen('table');}}return t0();};}
// ---------- placed banners ----------
const BANNERS=new Map();   // "x,y,z" -> {c, p:[[pattern,colour]...]}  (per dimension: kept in DIMDATA on travel)
N.BANNER=73;
function bannerSet(k,v,send){if(v)BANNERS.set(k,v);else BANNERS.delete(k);if(send&&net)netSend(N.BANNER,{k,v:v||null});}
NET_X[N.BANNER]=d=>bannerSet(d.k,d.v,false);
{const u0=useSpecial;useSpecial=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival')return u0(p,s);const it=s&&ITEMS[s.id];if(!it||it.banner==null)return u0(p,s);
  const h=raycastBlock(eye(p),fwd(p),4.5,true,true);if(!h||!canBuild())return true;const pl=!!h.plant;const nx=pl?0:h.px-h.x,ny=pl?1:h.py-h.y,nz=pl?0:h.pz-h.z;const X=h.px,Y=h.py,Z=h.pz;
  if(!replaceable(getB(X,Y,Z)))return true;let id;
  if(ny===1){if(getB(X,Y+1,Z)&&!replaceable(getB(X,Y+1,Z)))return true;const r=((Math.round(-(p.yaw)/(Math.PI/8))%16)+16+8)%16;id=RS.banner.stand[r];}
  else if(ny===0){const a=nz===1?0:nx===-1?1:nz===-1?2:3;id=RS.banner.wall[a];}else return true;
  if(placeBlock(X,Y,Z,id)){bannerSet(pk3(X,Y,Z),{c:it.banner,p:(s.tag&&s.tag.p)||[]},true);consume(p,p.sel);p.swing=1;}return true;};}
// breaking one gives the banner back with its patterns
{const c0=rsChanged;rsChanged=function(x,y,z,was,b){c0(x,y,z,was,b);if(was&&BD[was]&&BD[was].banner&&!(b&&BD[b]&&BD[b].banner)){const k=pk3(x,y,z);const v=BANNERS.get(k);
  if(v){if(MATCH.mode==='survival'&&(!net||isHost()||dimLocal())&&!(player&&player.gm==='creative'&&dist(player.pos,[x,y,z])<6&&!net))requestDrop([x+.5,y,z+.5],'banner_'+v.c,1,undefined,v.p.length?{p:v.p}:undefined);BANNERS.delete(k);}}};}
// a cauldron of water washes off the top pattern
{const u0=useSpecial;useSpecial=function(p,s){if(INF&&p.alive&&s&&ITEMS[s.id]&&ITEMS[s.id].banner!=null&&s.tag&&s.tag.p&&s.tag.p.length){const h=raycastBlock(eye(p),fwd(p),4.5);
    if(h&&h.b===B.CAULDRON_W){const one=Object.assign({},s,{count:1,tag:{p:s.tag.p.slice(0,-1)}});if(!one.tag.p.length)delete one.tag;s.count--;if(s.count<=0)p.inv[p.sel]=null;if(addItem(p,one.id,1,one.tag))requestDrop(p.pos,one.id,1,undefined,one.tag);
      setBlockNet(h.x,h.y,h.z,B.CAULDRON);psnd(['liquid/splash'],[h.x,h.y,h.z],.4);return true;}}return u0(p,s);};}
// ---------- banner art: the pack's banner pictures layered and tinted (cached per design) ----------
let BAN_SRC={},BAN_TEX={};
{const l0=packLoadMobs;packLoadMobs=async function(get){const r=await l0(get);BAN_SRC={};const g=async n=>{const i=await get('textures/entity/'+n+'.png');return i?imgToCanvas(i,64,64,0,0,i.width,i.height):null;};
  BAN_SRC.base=await g('banner_base');BAN_SRC.cloth=await g('banner/base');for(const [k] of BANNER_PATTERNS)BAN_SRC[k]=await g('banner/'+k);
  const ps=await get('textures/painting/paintings_kristoffer_zetterstrand.png');PAINT_SRC=ps?imgToCanvas(ps,256,256,0,0,ps.width,ps.height):null;return r||1;};}
{const i0=initMobTextures;initMobTextures=function(){i0();for(const k in BAN_TEX)gl.deleteTexture(BAN_TEX[k].tex);BAN_TEX={};if(PAINT_TEX){gl.deleteTexture(PAINT_TEX);PAINT_TEX=null;}};}
function tintMask(src,hex){const c=mkCanvas(64,64),g=c.getContext('2d');g.drawImage(src,0,0);const d=g.getImageData(0,0,64,64);const t=hexRGB(hex);
  for(let i=0;i<d.data.length;i+=4){const L=(d.data[i]+d.data[i+1]+d.data[i+2])/765;d.data[i]=255*t[0];d.data[i+1]=255*t[1];d.data[i+2]=255*t[2];d.data[i+3]*=L;}/* old packs keep the shape in brightness, new ones in alpha */g.putImageData(d,0,0);return c;}
function bannerTex(v){const key=v.c+'|'+v.p.map(q=>q.join(':')).join(',');if(BAN_TEX[key])return BAN_TEX[key];const c=mkCanvas(64,64),g=c.getContext('2d');
  if(BAN_SRC.base)g.drawImage(BAN_SRC.base,0,0);else{g.fillStyle='#8a6a3a';g.fillRect(44,0,20,64);g.fillRect(0,42,44,6);}
  const lay=(src,col)=>{if(src)g.drawImage(tintMask(src,col),0,0);else{g.fillStyle=col;g.fillRect(1,1,20,40);g.fillRect(22,1,20,40);}};
  lay(BAN_SRC.cloth,COLORS16[v.c][2]);for(const [pn,col] of v.p){if(BAN_SRC[pn])lay(BAN_SRC[pn],COLORS16[col][2]);}
  return BAN_TEX[key]={tex:mkTex(c)};}
let BAN_MESH=null;
function bannerMeshes(){if(BAN_MESH)return BAN_MESH;const mk=(x,y,z,w,h,d,u,v)=>{const o=[];boxUV(o,x,y,z,w,h,d,u,v,64,64,0,false);for(let i=0;i<o.length;i+=8){o[i]*=16;o[i+1]*=16;o[i+2]*=16;}return meshFrom(o);};// boxUV works in blocks; these meshes stay in pixels
  // model units: pixels; the real game draws banners at 2/3 size
  BAN_MESH={cloth:mk(-10,-40,-1,20,40,1,0,0),pole:mk(-1,-42,-1,2,42,2,44,0),bar:mk(-10,-2,-1,20,2,2,0,42)};return BAN_MESH;}
function drawBanners(fogF){if(!BANNERS.size||!INF)return;useTex(VP,camPos);const M=bannerMeshes();const f=2/3;gl.uniform1f(PT.u.hurt,0);
  for(const [k,v] of BANNERS){const [x,y,z]=k.split(',').map(Number);if(Math.hypot(x+.5-camPos[0],z+.5-camPos[2])>Math.min(fogF+8,96))continue;const b=getB(x,y,z);const D=BD[b];if(!D||!D.banner)continue;
    const T=bannerTex(v);gl.uniform1f(PT.u.bright,mobBright({pos:[x+.5,y,z+.5]}));const sway=Math.sin(perfT*1.6+x*.7+z*.3)*.05;
    let base,clothTop;
    if(D.banner.r!=null){base=chain(M4.tr(x+.5,y,z+.5),M4.ry(-D.banner.r*Math.PI/8),M4.sc(f/16,f/16,f/16));drawMesh(M.pole,chain(base,M4.tr(0,42,0)),T.tex);drawMesh(M.bar,chain(base,M4.tr(0,44,0)),T.tex);clothTop=chain(base,M4.tr(0,42,-1.5));}
    else{const a=D.banner.a;const ang=[0,-HP2,Math.PI,HP2][a];base=chain(M4.tr(x+.5,y,z+.5),M4.ry(ang),M4.tr(0,0,-.5+.1),M4.sc(f/16,f/16,f/16));drawMesh(M.bar,chain(base,M4.tr(0,2*16*.75/1,1.5)),T.tex);clothTop=chain(base,M4.tr(0,2*16*.75-2,1.5));}
    drawMesh(M.cloth,chain(clothTop,M4.rx(sway)),T.tex);}}
{const d0=drawMobs;drawMobs=function(fogF){d0(fogF);drawBanners(fogF);};}
// banners per dimension, saved with the world
XSAVE.push({save:(d)=>{const all={};for(const dm of DIMS)all[dm]=(DIMDATA[dm]&&DIMDATA[dm].banners)||[];all[DIM]=[...BANNERS];d.banners=all;},reset:()=>{BANNERS.clear();for(const dm of DIMS)if(DIMDATA[dm])DIMDATA[dm].banners=[];},
  load:o=>{const all=o.banners||{};for(const dm of DIMS){if(!DIMDATA[dm])DIMDATA[dm]={edits:new Map(),chests:new Map(),furn:new Map(),drops:[]};DIMDATA[dm].banners=all[dm]||[];}BANNERS.clear();for(const [k,v] of (all[DIM]||[]))BANNERS.set(k,v);}});
{const t0=travelTo;travelTo=function(dim,pos,opt){if(!INF||!player)return t0(dim,pos,opt);const from=DIM;const keep=[...BANNERS];const r=t0(dim,pos,opt);if(DIMDATA[from])DIMDATA[from].banners=keep;BANNERS.clear();for(const [k,v] of ((DIMDATA[dim]&&DIMDATA[dim].banners)||[]))BANNERS.set(k,v);return r;};}
// banner item icons: a little banner in its colour
{const p0=procIcon;procIcon=function(id){const it=ITEMS[id];if(it&&it.banner!=null){const c=mkCanvas(32,32),g=c.getContext('2d');g.fillStyle='#6a4a2a';g.fillRect(15,2,2,28);g.fillRect(7,3,18,2);
    g.fillStyle=COLORS16[it.banner][2];g.fillRect(8,5,16,20);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(8,24,16,1);g.fillRect(23,5,1,20);return c;}return p0(id);};}

// ---------- paintings ----------
// the 26 pictures of the real game, by their place on the pack's painting sheet [width, height, u, v] (pixels; 16 = one block)
const PAINTINGS=[[16,16,0,0],[16,16,16,0],[16,16,32,0],[16,16,48,0],[16,16,64,0],[16,16,80,0],[16,16,96,0],[32,16,0,32],[32,16,32,32],[32,16,64,32],[32,16,96,32],[32,16,128,32],
  [16,32,0,64],[16,32,16,64],[32,32,0,128],[32,32,32,128],[32,32,64,128],[32,32,96,128],[32,32,128,128],[32,32,160,128],[64,32,0,96],[64,64,0,192],[64,64,64,192],[64,64,128,192],[64,48,192,64],[64,48,192,112]];
let PAINT_SRC=null,PAINT_TEX=null;const PAINT_MESH={};
item('painting',{name:'Painting',type:'mat',stack:64,color:'#a07a50',tex:'item/painting',tip:['Hang it on a wall: it takes the biggest picture that fits']});
{const n0=RECIPES.length;shaped(['SSS','SWS','SSS'],{S:'stick',W:WOOLS16},'painting');for(let i=n0;i<RECIPES.length;i++)LC_REC.push(lcRecipe(RECIPES[i]));LC_TABS.find(t=>t.name==='Decoration').entries.push(['Painting',['painting']]);}
MOB_T.painting={name:'Painting',hp:1,hw:.5,eh:1,model:'painting',kind:'object',spd:0,drops:[],persist:true,col:'#a07a50'};MOB_TYPES.push('painting');
// a stand-in painting sheet (original pictures) for when no pack is loaded
function procPaintSheet(){const c=mkCanvas(256,256),g=c.getContext('2d');g.fillStyle='#6a4a2a';g.fillRect(192,0,16,16);const rnd=(a)=>{let s=a*9301+49297;return ()=>((s=(s*9301+49297)%233280)/233280);};
  PAINTINGS.forEach(([w,h,u,v],i)=>{const r=rnd(i+1);const hue=r()*360;const sky=g.createLinearGradient(0,v,0,v+h);sky.addColorStop(0,`hsl(${hue},55%,${55+r()*20}%)`);sky.addColorStop(1,`hsl(${(hue+40)%360},45%,${30+r()*20}%)`);
    g.fillStyle=sky;g.fillRect(u,v,w,h);g.fillStyle=`hsl(${(hue+180)%360},40%,30%)`;let y=v+h*.6;for(let x=u;x<u+w;x++){y+=(r()-.5)*2;y=Math.max(v+h*.3,Math.min(v+h-1,y));g.fillRect(x,Math.round(y),1,v+h-Math.round(y));}
    if(r()<.6){g.fillStyle=`hsl(${(hue+60)%360},80%,75%)`;const s=2+Math.round(r()*w/6);g.fillRect(u+Math.round(r()*(w-s)),v+2,s,s);}
    g.strokeStyle='#3a2a1a';g.lineWidth=1;g.strokeRect(u+.5,v+.5,w-1,h-1);});return c;}
function paintMesh(i){if(PAINT_MESH[i])return PAINT_MESH[i];const [w,h,u,v]=PAINTINGS[i];const W=w/16,H=h/16,D=1/16,o=[];const tw=256;
  const q=(P,n,u0,v0,u1,v1)=>{const U=[u0,u1,u1,u0],V=[v0,v0,v1,v1];for(const k of [0,1,2,0,2,3])o.push(P[k][0],P[k][1],P[k][2],n[0],n[1],n[2],U[k]/tw,V[k]/tw);};
  const x0=-W/2,x1=W/2,y0=-H/2,y1=H/2;
  q([[x0,y1,D],[x1,y1,D],[x1,y0,D],[x0,y0,D]],[0,0,1],u,v,u+w,v+h);                     // the picture, facing out (+z)
  const bu=192,bv=0;q([[x1,y1,0],[x0,y1,0],[x0,y0,0],[x1,y0,0]],[0,0,-1],bu,bv,bu+16,bv+16); // the back
  q([[x0,y1,0],[x1,y1,0],[x1,y1,D],[x0,y1,D]],[0,1,0],bu,bv,bu+16,bv+1);q([[x0,y0,D],[x1,y0,D],[x1,y0,0],[x0,y0,0]],[0,-1,0],bu,bv,bu+16,bv+1);
  q([[x0,y1,0],[x0,y1,D],[x0,y0,D],[x0,y0,0]],[-1,0,0],bu,bv,bu+1,bv+16);q([[x1,y1,D],[x1,y1,0],[x1,y0,0],[x1,y0,D]],[1,0,0],bu,bv,bu+1,bv+16);
  return PAINT_MESH[i]=meshFrom(o);}
function drawPainting(e){if(!PAINT_TEX)PAINT_TEX=mkTex(PAINT_SRC||procPaintSheet());const rp=e.pos;const a=e.face||0;const ang=[Math.PI,HP2,0,-HP2][a];
  gl.uniform1f(PT.u.bright,mobBright({pos:[rp[0]+DIRS4[a][0]*.5,rp[1],rp[2]+DIRS4[a][2]*.5]}));gl.uniform1f(PT.u.hurt,0);drawMesh(paintMesh(e.paint||0),chain(M4.tr(rp[0],rp[1],rp[2]),M4.ry(ang)),PAINT_TEX);}
// where a w x h painting would sit on the wall behind (x,y,z) facing DIRS4[a]: the cells it covers, or null
function paintCells(x,y,z,a,w,h){const [nx,,nz]=DIRS4[a];const rx=-nz,rz=nx;   // along the wall
  const ox=-Math.floor((w-1)/2),oy=-Math.floor((h-1)/2);const cells=[];
  for(let i=0;i<w;i++)for(let j=0;j<h;j++){const cx=x+rx*(i+ox),cy=y+j+oy,cz=z+rz*(i+ox);if(getB(cx,cy,cz))return null;if(!rsCond(getB(cx-nx,cy,cz-nz))&&!(BD[getB(cx-nx,cy,cz-nz)]||{}).solid)return null;cells.push([cx,cy,cz]);}
  const center=[x+rx*(ox+(w-1)/2)+.5-nx*.5+nx*0,y+oy+(h-1)/2+.5,z+rz*(ox+(w-1)/2)+.5-nz*.5];
  // not on top of another painting
  for(const m of mobs){if(m.mob!=='painting'||!m.alive)continue;const [mw,mh]=PAINTINGS[m.paint||0];if(m.face!==a)continue;if(Math.abs(m.pos[0]-center[0])*16<(mw+w*16)/2-.01&&Math.abs(m.pos[2]-center[2])*16<(mw+w*16)/2-.01&&Math.abs(m.pos[1]-center[1])*16<(mh+h*16)/2-.01)return null;}
  return {cells,center};}
{const u0=useSpecial;useSpecial=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival'||!s||s.id!=='painting')return u0(p,s);const h=raycastBlock(eye(p),fwd(p),4.5);if(!h||h.py!==h.y)return true;
  const nx=h.px-h.x,nz=h.pz-h.z;const a=DIRS4.findIndex(d=>d[0]===nx&&d[2]===nz);if(a<0)return true;
  // the biggest pictures that fit, one of them at random
  const fits=[];PAINTINGS.forEach(([w,hh],i)=>{const r=paintCells(h.px,h.py,h.pz,a,w/16,hh/16);if(r)fits.push([w*hh,i,r]);});if(!fits.length){chatMsg('There is no room for a painting there.','#aaaaaa',false);return true;}
  const big=Math.max(...fits.map(f=>f[0]));const pick=fits.filter(f=>f[0]===big);const [,i,r]=pick[Math.random()*pick.length|0];const pos=r.center;
  if(dropAuth()){const e=spawnMob('painting',pos,{yaw:0});e.paint=i;e.face=a;}else netSend(N.MOBUSE,{id:'new',a:'paint:'+i+':'+a,p:pos,by:p.id},'host');
  if(p.gm!=='creative')consume(p,p.sel);p.swing=1;psnd(['dig/wood1'],pos,.4);return true;};}
{const m0=mobNet;mobNet=function(code,d,from,fromHost){if(code===N.MOBUSE&&d&&d.id==='new'&&typeof d.a==='string'&&d.a.startsWith('paint:')){if(isHost()&&Array.isArray(d.p)){const [,i,a]=d.a.split(':').map(Number);const e=spawnMob('painting',d.p,{yaw:0});e.paint=i;e.face=a;}return;}return m0(code,d,from,fromHost);};}
// a painting falls off when its wall goes
{const c0=rsChanged;rsChanged=function(x,y,z,was,b){c0(x,y,z,was,b);if(!was||(b&&BD[b]&&BD[b].solid)||!(!net||isHost()||dimLocal()))return;
  for(const m of mobs){if(m.mob!=='painting'||!m.alive)continue;const [w,h]=PAINTINGS[m.paint||0];const a=m.face||0;const [nx,,nz]=DIRS4[a];
    const wx=m.pos[0]-nx*.5,wz=m.pos[2]-nz*.5;if(Math.abs(x+.5-wx)<=w/32+.01&&Math.abs(z+.5-wz)<=w/32+.01&&Math.abs(y+.5-m.pos[1])<=h/32+.01&&(nx?Math.abs(x+.5-(m.pos[0]-nx*.5))<.6:Math.abs(z+.5-(m.pos[2]-nz*.5))<.6))mobDie(m,null,'wall');}};}
// paintings are thin: their hit box follows the wall
{const b0=entBox;entBox=function(e,pad){if(e&&e.mob==='painting'){const [w,h]=PAINTINGS[e.paint||0];const a=e.face||0;const [nx,,nz]=DIRS4[a];const hw=w/32,hh=h/32;const ax=nx?.05:hw,az=nz?.05:hw;
    return [[e.pos[0]-ax,e.pos[1]-hh,e.pos[2]-az],[e.pos[0]+ax,e.pos[1]+hh,e.pos[2]+az]];}return b0(e,pad);};}

// items added by the later files need their icons too
rebuildIcons();rebuildItemAtlas();
// two kinds of network message must never share a number
{const seen={};for(const k in N){if(seen[N[k]])console.error("network code clash: N."+k+" and N."+seen[N[k]]+" are both "+N[k]);seen[N[k]]=k;}}
