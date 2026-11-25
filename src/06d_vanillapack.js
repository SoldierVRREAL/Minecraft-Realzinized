// ================= Resource pack: tints and derived tiles for the vanilla blocks in 02d_vanilla.js =================
// pack loading: tint the grey foliage textures like the game does, and make the derived tiles (turned bed tops, the End portal's star field)
const TILE_TINT={leaves_birch:'#80a755',leaves_spruce:'#619961',leaves_acacia:'#aea42a',leaves_big_oak:'#59ae30',double_plant_grass_bottom:'#79c05a',double_plant_grass_top:'#79c05a',
  double_plant_fern_bottom:'#68a64a',double_plant_fern_top:'#68a64a',reeds:'#91bd59'};
{const rot=(img,r)=>{const c=dvCanvas(img),w=c.width,o=mkCanvas(w,w),g=o.getContext('2d');g.imageSmoothingEnabled=false;g.translate(w/2,w/2);g.rotate(r*Math.PI/2);g.drawImage(c,-w/2,-w/2);return o;};
  for(let r=1;r<4;r++){DV_TILES['~bed_feet_top_r'+r]=['bed_feet_top',i=>rot(i,r)];DV_TILES['~bed_head_top_r'+r]=['bed_head_top',i=>rot(i,r)];}
  const prev=packDeriveTiles;
  packDeriveTiles=async function(get,tiles){let n=await prev(get,tiles);
    const t=TILE_PACK.indexOf('~end_portal');if(t>=0&&!tiles[t]){const img=await get('textures/entity/end_portal.png');if(img){const s=16;const c=mkCanvas(s,s),g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.fillStyle='#05060c';g.fillRect(0,0,s,s);g.globalCompositeOperation='lighter';g.globalAlpha=.9;g.drawImage(img,0,0,64,64,0,0,s,s);g.globalAlpha=.5;g.drawImage(img,64,64,64,64,0,0,s,s);tiles[t]=c;n++;}}
    for(const name in TILE_TINT){const ti=TILE_PACK.indexOf(name);if(ti>=0&&tiles[ti]&&isGray(tiles[ti]))tiles[ti]=tintCanvas(dvCanvas(tiles[ti]),TILE_TINT[name]);}
    return n;};}
// hearts are violet: the pack's red heart sprites are turned purple (same shading, new hue)
function violetCanvas(img){const w=img.width,h=img.height,c=mkCanvas(w,h),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,0);const d=g.getImageData(0,0,w,h);const D=d.data;
  for(let i=0;i<D.length;i+=4){if(D[i+3]<10)continue;const r=D[i]/255,gg=D[i+1]/255,b=D[i+2]/255;const mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2,dd=mx-mn;if(dd<.06||mx!==r)continue;   // only the reddish pixels
    const s=l>.5?dd/(2-mx-mn):dd/(mx+mn);const H=280/360;const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;const f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
    D[i]=f(H+1/3)*255;D[i+1]=f(H)*255;D[i+2]=f(H-1/3)*255;}
  g.putImageData(d,0,0);return c;}
{const l0=loadPackBuffer;loadPackBuffer=async function(buf,label){const r=await l0(buf,label);const G=PACK.gui;if(G)for(const k of ['heart_full','heart_half'])if(G[k]&&!G[k]._violet){G[k]=violetCanvas(G[k]);G[k]._violet=true;}return r;};}
