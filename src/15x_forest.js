// ---------- mystical forests: greener grass and leaves, misty green fog, drifting motes and weeping willow trees ----------
const LUSH_BIOMES=new Set([BIO.forest,BIO.birch,BIO.dark]);
Object.assign(BIOMES[BIO.forest],{fog:[.55,.76,.62],fogK:.42,part:'mote',sky:[.34,.62,.74]});
Object.assign(BIOMES[BIO.birch],{fog:[.62,.8,.7],fogK:.5,part:'mote',sky:[.4,.66,.82]});
Object.assign(BIOMES[BIO.dark],{fog:[.36,.52,.42],fogK:.34,part:'mote',sky:[.28,.5,.56]});
// which columns are forest: worked out once per chunk and kept
{const C=new Map();let seed=null,lk=-1,la=null;
  lushAt=function(x,z){if(!INF||DIM!=='overworld')return false;if(seed!==WSEED){C.clear();seed=WSEED;lk=-1;}
    const cx=x>>4,cz=z>>4,k=(cx+32768)*65536+(cz+32768);
    if(k!==lk){la=C.get(k);if(!la){la=new Uint8Array(256);for(let i=0;i<256;i++)la[i]=LUSH_BIOMES.has(colInfo((cx<<4)+(i&15),(cz<<4)+(i>>4)).b)?1:0;if(C.size>6000)C.clear();C.set(k,la);}lk=k;}
    return la[(x&15)|((z&15)<<4)]===1;};}
// some of the forest's trees become weeping willows: a round crown of bright leaves with long curtains of leaves and vines hanging down
{const c0=chunkFeatures2;chunkFeatures2=function(cx,cz){const f=c0(cx,cz);if(f._lush)return f;f._lush=1;
  for(const o of f){if(o.t!=='oak'&&o.t!=='birch'&&o.t!=='darkoak')continue;const b=colInfo2(o.x,o.z).b;if(!LUSH_BIOMES.has(b))continue;
    const r=hash3(o.x,o.z,7,WSEED+97);if((o.t==='oak'&&r<.34)||(o.t!=='oak'&&r<.12))o.t='willow';}
  return f;};}
function buildWillow(f){const {x,y,z,r}=f;const R=i=>hash3(x,z,i,WSEED+90+(r*1000|0));
  const h=6+(R(1)*3|0),top=y+h;
  const LAY=[[-1,3.9],[0,4.4],[1,3.7],[2,2.5]];
  const inC=(dx,dy,dz)=>{const L=LAY[dy+1];if(!L)return false;return Math.hypot(dx,dz)<=L[1]-R(dx*7+dz*13+dy*31+100)*.8;};
  for(let i=0;i<h+1;i++)gput(x,y+i,z,B.LOG);
  for(const [dx,dz,k] of [[1,0,1],[-1,0,2],[0,1,3],[0,-1,4]])if(R(40+k)<.45)gput(x+dx,y,z+dz,B.LOG);   // roots
  for(let dy=-1;dy<=2;dy++)for(let dz=-5;dz<=5;dz++)for(let dx=-5;dx<=5;dx++)if(inC(dx,dy,dz))gsoft(x+dx,top+dy,z+dz,B.JLEAVES);
  // the curtains hang from the lowest leaf of each column near the crown's edge
  for(let dz=-5;dz<=5;dz++)for(let dx=-5;dx<=5;dx++){const d=Math.hypot(dx,dz);if(d<1.8||R(dx*17+dz*29+300)>.6)continue;
    let low=null;for(let dy=-1;dy<=2;dy++)if(inC(dx,dy,dz)){low=dy;break;}if(low==null)continue;
    const L=2+(R(dx*5+dz*11+500)*(d>3?7:4)|0);
    for(let i=1;i<=L;i++){const yy=top+low-i;if(yy<=y)break;gsoft(x+dx,yy,z+dz,i<=1&&R(dx+dz*3+700)<.55?B.JLEAVES:B.VINE);}}}
{const b0=buildFeature2;buildFeature2=function(f){if(f.t==='willow'){buildWillow(f);return;}return b0(f);};}

// ---------- the enchanted golden apple ----------
food('enchanted_golden_apple','Enchanted Golden Apple',4,9.6,'#f5c518','golden_apple',{fx:[['regen',20,1],['absorption',120,3],['resistance',300,0],['fireres',300,0]],always:true,ench:{},rare:true});
ITEM_ALT.enchanted_golden_apple=['apple_golden','golden_apple'];
EFFECT_NAMES.resistance='Resistance';
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ig){const r=e&&e.effects&&e.effects.resistance;if(r&&cause!=='void'&&cause!=='starve')amt*=Math.max(0,1-.2*(r.amp+1));return h0.call(this,e,amt,src,cause,kb,raw,ig);};}

// ---------- the chest buried under every ruin: 4 times in 5 plain supplies, 1 time in 5 a treasure ----------
LOOT_TABLES.ruin_common=[['bread',1,4,.75],['apple',1,3,.5],['wheat',2,6,.45],['seeds_wheat',2,6,.4],['coal',2,8,.6],['iron_ingot',1,3,.45],['gold_nugget',2,8,.4],['bone',1,5,.5],
  ['rotten_flesh',1,5,.5],['string',1,4,.4],['b'+B.TORCH,2,8,.5],['stone_sword',1,1,.2],['leather',1,3,.3],['carrot',1,3,.3],['potato',1,3,.3],['arrow',2,8,.35],['iron_pickaxe',1,1,.08]];
LOOT_TABLES.ruin_god=[['enchanted_golden_apple',1,2,1],['diamond',3,9,.95],['b'+B.DIAMONDB,1,2,.35],['emerald',3,8,.5],['golden_apple',1,3,.65],['gold_ingot',4,12,.6],
  ['diamond_sword_e_sharpness3_fire_aspect1',1,1,.45],['diamond_pickaxe_e_efficiency3',1,1,.4],['diamond_chestplate_e_protection3',1,1,.35],['diamond_helmet_e_protection3',1,1,.25],
  ['bow_e_power3_flame1',1,1,.3],['totem',1,1,.3],['nether_star',1,1,.12],['experience_bottle',4,12,.6],['ender_pearl',2,6,.4],['diamond_horse_armor',1,1,.2],['name_tag',1,1,.3],['mythril_sword_e_sharpness3',1,1,.2]];
{const f0=lootFill;lootFill=function(t){if(t==='ruin')t=Math.random()<.2?'ruin_god':'ruin_common';return f0(t);};}
