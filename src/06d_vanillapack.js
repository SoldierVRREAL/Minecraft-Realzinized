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
