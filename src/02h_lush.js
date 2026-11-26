// ---------- mystical forest tiles: a brighter, greener grass block, leaves and tall grass for the forest biomes ----------
// Only the forests use these (see 15x_forest.js); grass everywhere else keeps its texture.
// With a resource pack they are made from the pack's own grass, leaves and dirt (05/06f), so they keep the Minecraft look.
const LUSH_RAMP=[[30,98,20],[44,128,28],[58,154,36],[74,178,44],[96,202,58],[126,226,84]];
function lushRamp(t){t=Math.max(0,Math.min(.999,t))*(LUSH_RAMP.length-1);const i=Math.floor(t),f=t-i,a=LUSH_RAMP[i],b=LUSH_RAMP[i+1];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];}
// how deep the grass hangs over the side at each of the 16 columns (Minecraft-style drips, a bit longer than usual)
const LUSH_DRIP=[4,5,4,3,4,6,5,4,3,4,5,7,5,4,3,5];
const LUSH={};
{const T=n=>{const i=TILE_PACK.indexOf(n);if(i>=0)return i;TILE_PACK.push(n);return TILE_PACK.length-1;};
  LUSH.top=T('~lush_grass_top');NEWT[LUSH.top]={k:'lush',part:'top'};
  LUSH.side=T('~lush_grass_side');NEWT[LUSH.side]={k:'lush',part:'side'};
  LUSH.leaves=T('~lush_leaves');NEWT[LUSH.leaves]={k:'lush',part:'leaves'};
  LUSH.tall=T('~lush_tallgrass');NEWT[LUSH.tall]={k:'lush',part:'tall'};}
// without a pack: drawn here, pixel by pixel
{const prev=procTileX;const dirtT=TILE_PACK.indexOf('dirt'),leafT=TILE_PACK.indexOf('oak_leaves'),tallT=TILE_PACK.indexOf('short_grass');
  procTileX=function(t,x,y){const D=NEWT[t];if(!D||D.k!=='lush')return prev(t,x,y);const h=hash2;
    const n=h(x,y,911)*.55+h(x>>1,y>>1,912)*.3+h(x>>2,y>>2,913)*.15;
    if(D.part==='top'){let v=n;if(h(x,y,914)>.93)v=.95;else if(h(x,y,915)>.9)v=.08;const c=lushRamp(v);return [c[0]|0,c[1]|0,c[2]|0,255];}
    if(D.part==='side'){const dep=LUSH_DRIP[x];if(y<dep||(y===dep&&h(x,0,916)>.6)){const c=lushRamp(.25+n*.65-(y/dep)*.25);return [c[0]|0,c[1]|0,c[2]|0,255];}return procTile(dirtT,x,y);}
    const p=procTile(D.part==='leaves'?leafT:tallT,x,y);if(p[3]===0)return p;const l=(p[0]+p[1]+p[2])/765;const c=lushRamp(l*1.15+(D.part==='leaves'?-.05:.1));return [c[0]|0,c[1]|0,c[2]|0,p[3]===undefined?255:p[3]];};}
atlasCanvas=makeProcAtlas();
let lushAt=(x,z)=>false;   // set in 15x_forest.js: true in the mystical forest biomes
