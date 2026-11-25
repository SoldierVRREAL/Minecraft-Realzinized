// ================= What the new blocks and items do (see 02e/02f/03e) =================
// farming (hoes, seeds, crops that grow, stems that grow melons and pumpkins, saplings that grow trees, bone meal), doors and trapdoors,
// cakes, levers, the enchanting table, anvil, cauldron and brewing stand, the jukebox and music discs, fishing, spawn eggs,
// Bottles o' Enchanting, fire charges, fireworks, maps, glass bottles, bowls... plus turning blocks as they are placed.

// ---------- turned blocks behave like the block they came from ----------
{const copy=(v,b)=>{if(MINE_T[b]!=null&&MINE_T[v]==null)MINE_T[v]=MINE_T[b];if(MINE_T_X[b]!=null&&MINE_T_X[v]==null)MINE_T_X[v]=MINE_T_X[b];
    for(const S of [PICK_BLOCKS,AXE_BLOCKS,SHOVEL_BLOCKS,LOG_BLOCKS,FLAMMABLE])if(S.has(b))S.add(v);
    if(PICK_LEVEL[b]!=null&&PICK_LEVEL[v]==null)PICK_LEVEL[v]=PICK_LEVEL[b];if(MINE_DROP[v]===undefined)MINE_DROP[v]=MINE_DROP[b]!==undefined?MINE_DROP[b]:'b'+b;
    if(FLAM[b]&&!FLAM[v])FLAM[v]=FLAM[b];if(ORE_XP[b]&&!ORE_XP[v])ORE_XP[v]=ORE_XP[b];};
  for(const v in ROT_BASE)copy(+v,ROT_BASE[v]);
  // wood burns
  for(const b of [B.JUNGLE_PLANKS,B.BIRCH_STAIRS,B.ACACIA_STAIRS,B.DARK_OAK_STAIRS,B.JUNGLE_STAIRS,B.BIRCH_SLAB,B.ACACIA_SLAB,B.DARK_OAK_SLAB,B.JUNGLE_SLAB,B.SPRUCE_SLAB].concat(XB.saplings)){FLAMMABLE.add(b);FLAM[b]=[5,20];}
  const m0=blockMat;blockMat=function(b){b=rotBase(b);if(b<=243)return m0(b);const D=BD[b];if(D&&(D.crop!=null||D.sapling))return 'grass';if(D&&(D.trans||D.pane))return 'glass';if(AXE_BLOCKS.has(b))return 'wood';if(b===B.FARMLAND)return 'gravel';return m0(b);};}
// the new ores turn up underground (added after the old ones so nothing already there moves)
ORES.push([B.REDSTONE_ORE,6,2,16,7],[B.LAPIS_ORE,1,4,30,6],[B.EMERALD_ORE,.7,4,32,1]);

// ---------- recipes ----------
{const n0=RECIPES.length;const K=(o)=>o;const S='stick';const P=PLANKS;const b=k=>'b'+B[k];
  PLANKS.push(b('JUNGLE_PLANKS'));FUEL[b('JUNGLE_PLANKS')]=15;
  for(const r of RECIPES)if(r.ins&&r.ins.length===1&&r.ins[0]==='b64')r.out=b('JUNGLE_PLANKS');
  for(const r of LC_REC)if(r.need&&r.need.length===1&&r.need[0].opts[0]==='b64'&&r.out==='b6')r.out=b('JUNGLE_PLANKS');
  for(let i=RECIPES.length-1;i>=0;i--){const r=RECIPES[i];if(r.ins&&r.ins.length===1&&r.ins[0]===b('REEDS')&&r.out===b('REEDS'))RECIPES.splice(i,1);}
  for(let i=LC_REC.length-1;i>=0;i--){const r=LC_REC[i];if(r.out===b('REEDS')&&r.need.length===1&&r.need[0].opts[0]===b('REEDS'))LC_REC.splice(i,1);}
  // coal and charcoal both work for torches and fire charges
  for(const r of RECIPES)if(r.out==='b54'&&r.keys&&Array.isArray(r.keys.C)&&!r.keys.C.includes('charcoal'))r.keys.C.push('charcoal');
  for(const [t,m] of TOOL_MATS)if(ITEMS[t+'_hoe'])shaped(['MM',' S',' S'],{M:m,S},t+'_hoe');
  shaped(['  S',' ST','S T'],{S,T:'string'},'fishing_rod');shapeless(['fishing_rod','carrot'],'carrot_on_a_stick');
  shaped(['WWW'],{W:'wheat'},'bread');shaped(['WCW'],{W:'wheat',C:'brown_dye'},'cookie',8);
  shaped(['MMM','SES','WWW'],{M:'milk_bucket',S:'sugar',E:'egg',W:'wheat'},b('CAKE'));
  shapeless([b('PUMPKIN')],'seeds_pumpkin',4);shapeless(['melon_slice'],'seeds_melon');
  shapeless([b('REEDS')],'sugar');shaped(['RRR'],{R:b('REEDS')},'paper',3);shapeless(['paper','paper','paper','leather'],'book');
  shaped(['PPP','BBB','PPP'],{P,B:'book'},'b139');shapeless(['book','black_dye','feather'],'book_writable');
  shaped(['P P',' P '],{P},'bowl',4);shapeless(['bowl',b('MUSH_RED'),b('MUSH_BROWN')],'mushroom_stew');
  shaped(['BB','BB'],{B:'brick'},'b10');shaped(['CC','CC'],{C:'clay_ball'},'b144');shaped(['NN','NN'],{N:'netherbrick'},'b148');
  shaped(['EEE','EEE','EEE'],{E:'emerald'},'b25');shapeless(['b25'],'emerald',9);
  shaped(['EEE','EEE','EEE'],{E:'slime_ball'},'b34');shapeless(['b34'],'slime_ball',9);
  shaped(['RRR','RRR','RRR'],{R:'redstone'},'b63');shapeless(['b63'],'redstone',9);
  shaped(['G G',' G '],{G:'b11'},'glass_bottle',3);shaped(['GGG','GGG'],{G:'b11'},b('GLASS_PANE'),16);
  shaped(['PP','PP'],{P:'prismarine_shard'},'b150');shaped(['HH','HH'],{H:'rabbit_hide'},'leather');
  const DYE={white:'bone_meal',silver:'light_gray_dye'};
  COLORS16.forEach(([k],i)=>{const dye=DYE[k]||k+'_dye';if(!ITEMS[dye])return;shaped(['GGG','GDG','GGG'],{G:'b11',D:dye},'b'+XB.glass[i],8);
    shaped(['GGG','GGG'],{G:'b'+XB.glass[i]},'b'+XB.panes[i+1],16);shaped(['CCC','CDC','CCC'],{C:'b145',D:dye},'b'+XB.clays[i],8);});
  shaped(['SS','SS'],{S:b('RED_SAND')},b('RSANDSTONE'));shaped(['SS','SS'],{S:b('RSANDSTONE')},b('RSANDSTONE_S'),4);shaped(['S','S'],{S:b('RSANDSTONE_SLAB')},b('RSANDSTONE_C'));
  const stairs=(out,m)=>shaped(['M  ','MM ','MMM'],{M:m},out,4),slab=(out,m)=>shaped(['MMM'],{M:m},out,6);
  stairs('b46','b6');stairs('b72','b52');stairs('b67','b20');stairs(b('RSANDSTONE_STAIRS'),b('RSANDSTONE'));slab(b('RSANDSTONE_SLAB'),b('RSANDSTONE'));
  for(const [k,pl] of [['BIRCH',b('BIRCH_PLANKS')],['ACACIA',b('ACACIA_PLANKS')],['DARK_OAK',b('DARK_OAK_PLANKS')],['JUNGLE',b('JUNGLE_PLANKS')]]){stairs(b(k+'_STAIRS'),pl);slab(b(k+'_SLAB'),pl);}
  slab(b('SPRUCE_SLAB'),'b52');stairs(b('SANDSTONE_STAIRS'),'b19');stairs(b('BRICK_STAIRS'),'b10');slab(b('BRICK_SLAB'),'b10');stairs(b('NB_STAIRS'),'b148');slab(b('NB_SLAB'),'b148');
  stairs(b('QUARTZ_STAIRS'),'b57');slab(b('QUARTZ_SLAB'),'b57');slab(b('COBBLE_SLAB'),'b9');
  for(const [k,pl] of [['OAK','b6'],['SPRUCE','b52'],['BIRCH',b('BIRCH_PLANKS')],['JUNGLE',b('JUNGLE_PLANKS')],['ACACIA',b('ACACIA_PLANKS')],['DARK_OAK',b('DARK_OAK_PLANKS')],['IRON','iron_ingot']])shaped(['PP','PP','PP'],{P:pl},b('DOOR_'+k),3);
  shaped(['PPP','PPP'],{P},b('TRAPDOOR_OAK'),2);shaped(['II','II'],{I:'iron_ingot'},b('TRAPDOOR_IRON'));
  shaped(['PPP','PPP',' S '],{P,S},b('SIGN'),3);shaped(['SSS','SLS','SSS'],{S,L:'leather'},b('ITEM_FRAME'));shaped(['B B',' B '],{B:'brick'},b('FLOWER_POT'));
  shapeless(['b31'],'red_dye');shapeless(['b32'],'yellow_dye');shapeless([b('SUNFLOWER')],'yellow_dye',2);
  shaped(['GGG','GNG','OOO'],{G:'b11',N:'nether_star',O:'b26'},'b29');
  shaped([' B ','DOD','OOO'],{B:'book',D:'diamond',O:'b26'},b('ENCHANT_TABLE'));shaped(['III',' i ','iii'],{I:'b146',i:'iron_ingot'},b('ANVIL'));
  shaped(['I I','I I','III'],{I:'iron_ingot'},b('CAULDRON'));shaped([' R ','CCC'],{R:'blaze_rod',C:COBBLE},b('BREWING_STAND'));shaped(['I I','ICI',' I '],{I:'iron_ingot',C:'b8'},b('HOPPER'));
  shaped(['GGG','QQQ','SSS'],{G:'b11',Q:'nether_quartz',S:['b50',b('BIRCH_SLAB'),b('SPRUCE_SLAB'),b('JUNGLE_SLAB'),b('ACACIA_SLAB'),b('DARK_OAK_SLAB')]},b('DAYLIGHT'));
  shaped(['CCC','CBC','CRC'],{C:COBBLE,B:'bow',R:'redstone'},b('DISPENSER'));shaped(['CCC','C C','CRC'],{C:COBBLE,R:'redstone'},b('DROPPER'));
  shaped(['PPP','CIC','CRC'],{P,C:COBBLE,I:'iron_ingot',R:'redstone'},b('PISTON'));shapeless([b('PISTON'),'slime_ball'],b('STICKY_PISTON'));
  shaped(['R','S'],{R:'redstone',S},b('RS_TORCH'));shaped(['S','C'],{S,C:COBBLE},b('LEVER'));
  shaped(['TRT','SSS'],{T:b('RS_TORCH'),R:'redstone',S:'b3'},b('REPEATER'));shaped([' T ','TQT','SSS'],{T:b('RS_TORCH'),Q:'nether_quartz',S:'b3'},b('COMPARATOR'));
  shaped(['I I','ISI','I I'],{I:'iron_ingot',S},b('RAIL'),16);shaped(['G G','GSG','GRG'],{G:'gold_ingot',S,R:'redstone'},b('RAIL_GOLDEN'),6);
  shaped(['I I','IPI','IRI'],{I:'iron_ingot',P:'b3',R:'redstone'},b('RAIL_DETECTOR'),6);shaped(['ISI','ITI','ISI'],{I:'iron_ingot',S,T:b('RS_TORCH')},b('RAIL_ACTIVATOR'),6);
  shaped(['I I','III'],{I:'iron_ingot'},'minecart');shapeless(['minecart','b8'],'chest_minecart');shapeless(['minecart','b118'],'furnace_minecart');shapeless(['minecart','b124'],'tnt_minecart');shapeless(['minecart',b('HOPPER')],'hopper_minecart');
  shaped(['P P','PPP'],{P},'boat');shaped(['SS ','SB ','  S'],{S:'string',B:'slime_ball'},'lead',2);shaped(['PPP','PCP','PPP'],{P:'paper',C:'compass'},'map');
  shapeless(['paper','gunpowder'],'fireworks',3);shapeless(['gunpowder',DYES.map(d=>d[0]+'_dye').filter(d=>ITEMS[d])],'firework_charge');
  shapeless(['gunpowder','blaze_powder',['coal','charcoal']],'fire_charge',3);
  shaped(['NNN','NMN','NNN'],{N:'gold_nugget',M:'melon_slice'},'speckled_melon');shapeless(['spider_eye',b('MUSH_BROWN'),'sugar'],'fermented_spider_eye');shapeless(['slime_ball','blaze_powder'],'magma_cream');
  shaped(['SSS',' S ','SBS'],{S,B:'b41'},'armor_stand');
  Object.assign(SMELT,{potato:'baked_potato',raw_fish:'cooked_fish',raw_salmon:'cooked_salmon',clay_ball:'brick',b27:'netherbrick'});
  SMELT[b('WET_SPONGE')]=b('SPONGE');SMELT[b('EMERALD_ORE')]='emerald';SMELT[b('LAPIS_ORE')]='blue_dye';SMELT[b('REDSTONE_ORE')]='redstone';
  for(const k in SMELT)if(SMELT[k]==='coal'&&BD[+k.slice(1)]&&(LOG_BLOCKS.has(+k.slice(1))||/Log|Wood/.test(BLOCK_NAMES[+k.slice(1)]||'')))SMELT[k]='charcoal';
  FUEL.charcoal=80;FUEL.boat=20;FUEL.bowl=5;for(const s of XB.saplings)FUEL['b'+s]=5;for(const k of ['BIRCH','ACACIA','DARK_OAK','JUNGLE','SPRUCE'])FUEL[b(k+'_SLAB')]=7;
  // the console crafting screen shows the new recipes too
  for(let i=n0;i<RECIPES.length;i++)LC_REC.push(lcRecipe(RECIPES[i]));
  const T=n=>LC_TABS.find(t=>t.name===n).entries;
  T('Structures').push(['Red Sandstone',[b('RSANDSTONE'),b('RSANDSTONE_S'),b('RSANDSTONE_C')]],['Stained Glass',XB.glass.map(i=>'b'+i)],['Glass Panes',XB.panes.map(i=>'b'+i)],
    ['Stained Terracotta',XB.clays.map(i=>'b'+i)],['Bricks',['b10','b144']],['Storage Blocks',['b25','b34','b63']],['Stairs',['b42','b46','b72','b67',b('BIRCH_STAIRS'),b('JUNGLE_STAIRS'),b('ACACIA_STAIRS'),b('DARK_OAK_STAIRS'),b('SANDSTONE_STAIRS'),b('RSANDSTONE_STAIRS'),b('BRICK_STAIRS'),b('NB_STAIRS'),b('QUARTZ_STAIRS')]],
    ['Enchantment Table',[b('ENCHANT_TABLE')]],['Anvil',[b('ANVIL')]],['Brewing Stand',[b('BREWING_STAND')]],['Cauldron',[b('CAULDRON')]],['Beacon',['b29']]);
  T('Tools and Weapons').push(['Hoe',['wood_hoe','stone_hoe','iron_hoe','golden_hoe','diamond_hoe']],['Fishing Rod',['fishing_rod','carrot_on_a_stick']],['Map',['map']],['Glass Bottle',['glass_bottle']],
    ['Minecarts',['minecart','chest_minecart','furnace_minecart','tnt_minecart','hopper_minecart']],['Boat',['boat']],['Lead',['lead']],['Fire Charge',['fire_charge']],['Fireworks',['fireworks','firework_charge']]);
  T('Food').push(['Bread from Wheat',['bread']],['Cookie',['cookie']],['Cake',[b('CAKE')]],['Mushroom Stew',['mushroom_stew']],['Glistering Melon',['speckled_melon']],['Fermented Spider Eye',['fermented_spider_eye']],['Magma Cream',['magma_cream']]);
  T('Materials').push(['Paper and Books',['paper','book','book_writable']],['Sugar',['sugar']],['Bowl',['bowl']],['Seeds',['seeds_pumpkin','seeds_melon']],['Dyes from Flowers',['red_dye','yellow_dye']],['Leather from Hide',['leather']],['Emerald',['emerald']],['Slimeball',['slime_ball']],['Redstone',['redstone']]);
  T('Decoration').push(['Doors',['OAK','SPRUCE','BIRCH','JUNGLE','ACACIA','DARK_OAK','IRON'].map(k=>b('DOOR_'+k))],['Trapdoors',[b('TRAPDOOR_OAK'),b('TRAPDOOR_IRON')]],['Ladder',['b37']],['Sign',[b('SIGN')]],['Item Frame',[b('ITEM_FRAME')]],['Flower Pot',[b('FLOWER_POT')]],
    ['More Slabs',['b41',b('COBBLE_SLAB'),b('BIRCH_SLAB'),b('SPRUCE_SLAB'),b('JUNGLE_SLAB'),b('ACACIA_SLAB'),b('DARK_OAK_SLAB'),b('BRICK_SLAB'),b('NB_SLAB'),b('QUARTZ_SLAB'),b('RSANDSTONE_SLAB')]],
    ['Redstone',[b('RS_TORCH'),b('LEVER'),b('REPEATER'),b('COMPARATOR'),b('DAYLIGHT'),b('PISTON'),b('STICKY_PISTON'),b('DISPENSER'),b('DROPPER'),b('HOPPER')]],['Rails',[b('RAIL'),b('RAIL_GOLDEN'),b('RAIL_DETECTOR'),b('RAIL_ACTIVATOR')]],['Armor Stand',['armor_stand']]);}
// ---------- loot: the collectibles turn up in chests ----------
{const L=LOOT_TABLES;L.stronghold.push(['book_enchanted',1,1,.25],['saddle',1,1,.2],['iron_horse_armor',1,1,.1],['slime_ball',1,3,.25],['record_cat',1,1,.06],['record_13',1,1,.06],['name_tag',1,1,.15]);
  L.library.push(['book',1,3,.6],['paper',2,7,.5],['book_enchanted',1,1,.3],['map',1,1,.25],['compass',1,1,.2],['book_writable',1,1,.15]);
  L.fortress.push(['saddle',1,1,.35],['golden_horse_armor',1,1,.2],['iron_horse_armor',1,1,.15],['diamond_horse_armor',1,1,.1]);
  L.rportal.push(['fire_charge',1,2,.3],['clock',1,1,.1]);
  if(MOB_T.deer)MOB_T.deer.drops=(MOB_T.deer.drops||[]).concat([['rabbit_hide',0,1]]);
  for(const r of RECORDS)L.stronghold.push(['record_'+r,1,1,.02]);}
// ---------- spawn eggs: one per creature ----------
const EGG_COL={pig:['#f0a5a2','#db635f'],cow:['#443626','#a1a1a1'],sheep:['#e7e7e7','#ffb5b5'],chicken:['#a1a1a1','#ff0000'],deer:['#8a6a4a','#e8d8c0'],glowshroom:['#3a7ae0','#a0e0ff'],
  zombie:['#00afaf','#799c65'],skeleton:['#c1c1c1','#494949'],spider:['#342d27','#a80e0e'],creeper:['#0da70b','#000000'],crystal_spider:['#2a50a0','#7cc0ff'],ice_wolf:['#d0e8f8','#6a8ab0'],
  magma:['#340000','#fcfc00'],zombie_pigman:['#ea9393','#4c7129'],ghast:['#f9f9f9','#bcbcbc'],blaze:['#f6b201','#fff87e'],wither_skeleton:['#141414','#474d4d'],enderman:['#161616','#000000']};
for(const k in MOB_T){if(k==='dragon'||k==='end_crystal')continue;const c=EGG_COL[k]||[MOB_T[k].col||'#808080','#404040'];
  item('spawn_egg_'+k,{name:'Spawn '+MOB_T[k].name,type:'mat',stack:64,color:c[0],color2:c[1],spawn:k,tip:['Right click the ground to spawn a '+MOB_T[k].name]});}
{const d0=packDeriveItems;packDeriveItems=async function(get,icons){let n=await d0(get,icons);const tex=p=>get('textures/'+p+'.png');const base=await tex('items/spawn_egg'),ov=await tex('items/spawn_egg_overlay');
  if(base)for(const k in ITEMS){const it=ITEMS[k];if(!it.spawn||icons[k])continue;const c=imgToCanvas(base,32,32,0,0,base.width,base.width);tintCanvas(c,it.color);
    if(ov){const o=tintCanvas(imgToCanvas(ov,32,32,0,0,ov.width,ov.width),it.color2);c.getContext('2d').drawImage(o,0,0);}icons[k]=c;n++;}return n;};}
{const p0=procIcon;procIcon=function(id){const it=ITEMS[id];if(it&&it.block!=null&&rotBase(it.block)===B.ANVIL){const c=mkCanvas(32,32),g=c.getContext('2d');const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
    R(3,7,26,8,'#1e1e1e');R(4,8,24,6,'#4a4a4a');R(4,8,24,2,'#5e5e5e');R(11,15,10,6,'#1e1e1e');R(12,15,8,6,'#3c3c3c');R(7,21,18,7,'#1e1e1e');R(8,22,16,5,'#444444');R(8,22,16,1,'#565656');return c;}
  if(it&&it.spawn){const c=mkCanvas(32,32),g=c.getContext('2d');g.fillStyle=it.color;g.beginPath();g.ellipse(16,17,9,12,0,0,7);g.fill();g.fillStyle=it.color2;
    for(const [x,y] of [[12,10],[19,14],[14,21],[20,22]]){g.fillRect(x,y,3,3);}return c;}return p0(id);};}
// gray pack art the game tints
Object.assign(TILE_TINT,{melon_stem_disconnected:'#7fb238',pumpkin_stem_disconnected:'#7fb238',redstone_dust_cross:'#d01810'});

// ---------- helpers ----------
const setMany=list=>{applyBlockList(list,false);if(net)netSend(N.BOOM,{l:list});};
const growAuth=()=>!net||isHost()||dimLocal();
function growLight(x,y,z){if(!inB(x,y,z))return 0;const L=light[idx(x,y,z)];return Math.max((L>>4)&15,L&15);}
function xpSpend(n){const L=Math.max(0,XP.level-n);let t=0;for(let i=0;i<L;i++)t+=xpNeed(i);XP.total=t+Math.floor(XP.prog*xpNeed(L));xpRecalc();}
function giveOrDrop(p,id,n){if(addItem(p,id,n))requestDrop([p.pos[0],p.pos[1]+1,p.pos[2]],id,n);}
const lookDir=p=>{const f=fwd(p);return Math.abs(f[0])>Math.abs(f[2])?(f[0]>0?1:3):(f[2]>0?2:0);};   // 0:-z 1:+x 2:+z 3:-x
const DOOR_SND={open:['random/door_open','block/wooden_door/open'],close:['random/door_close','block/wooden_door/close']};

// ---------- crops and saplings: registered when placed or loaded, grown by a slow tick ----------
const CROPS=new Map();
const isGrower=b=>{const D=BD[b];return !!D&&(D.crop!=null||!!D.sapling);};
function cropNote(x,y,z,b){const k=x+','+y+','+z;if(isGrower(b))CROPS.set(k,[x,y,z]);else CROPS.delete(k);}
{const a0=applyBlock;applyBlock=function(x,y,z,b){a0(x,y,z,b);if(INF)cropNote(x,y,z,b);};}
{const l0=applyBlockList;applyBlockList=function(list,fx){l0(list,fx);if(INF)for(let i=0;i<list.length;i+=4)cropNote(list[i],list[i+1],list[i+2],list[i+3]);};}
{const g0=genChunk;genChunk=function(cx,cz){const r=g0(cx,cz);const ed=worldEdits.get(ckey(cx,cz));if(ed)for(const [li,v] of ed)if(isGrower(v))cropNote(cx*16+(li&15),li>>8,cz*16+((li>>4)&15),v);return r;};}
const CROP_NEXT=b=>{const D=BD[b];if(!D)return 0;if(D.crop==='nether_wart')return D.stage<D.maxStage?b+1:B.NETHER_WART;return D.stage<D.maxStage?b+1:0;};
function cropGrow(x,y,z,b,steps){let n=b;for(let i=0;i<steps;i++){const nx=CROP_NEXT(n);if(!nx)break;n=nx;}if(n!==b){setBlockNet(x,y,z,n);return true;}return false;}
function farmWater(x,y,z){for(let dz=-4;dz<=4;dz++)for(let dx=-4;dx<=4;dx++)for(let dy=0;dy<=1;dy++)if(isWaterB(getB(x+dx,y+dy,z+dz)))return true;return false;}
function stemFruit(x,y,z,kind){const fruit=kind==='melon_stem'?B.MELON:B.PUMPKIN;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(getB(x+dx,y,z+dz)===fruit)return;
  const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dz])=>!getB(x+dx,y,z+dz)&&[B.DIRT,B.GRASS,B.FARMLAND,B.FARMLAND_WET].includes(getB(x+dx,y-1,z+dz)));if(!opts.length)return;
  const [dx,dz]=opts[Math.random()*opts.length|0];setBlockNet(x+dx,y,z+dz,fruit);}
let cropT=0;
function cropTick(dt){cropT+=dt;if(cropT<1)return;cropT=0;if(!growAuth())return;
  for(const [k,[x,y,z]] of CROPS){if(!inB(x,y,z))continue;const b=getB(x,y,z);const D=BD[b];if(!isGrower(b)){CROPS.delete(k);continue;}
    if(D.sapling){if(growLight(x,y+1,z)>=9&&Math.random()<1/90)growTree(x,y,z,D.sapling);continue;}
    if(D.crop==='nether_wart'){if(Math.random()<1/40)cropGrow(x,y,z,b,1);continue;}
    const soil=getB(x,y-1,z);if(soil!==B.FARMLAND&&soil!==B.FARMLAND_WET)continue;
    if(Math.random()<.1){const wet=farmWater(x,y-1,z);if(wet&&soil===B.FARMLAND)setBlockNet(x,y-1,z,B.FARMLAND_WET);else if(!wet&&soil===B.FARMLAND_WET)setBlockNet(x,y-1,z,B.FARMLAND);}
    if(growLight(x,y,z)<9)continue;const chance=soil===B.FARMLAND_WET?1/22:1/50;if(Math.random()>=chance)continue;
    if(D.stage<D.maxStage)cropGrow(x,y,z,b,1);else if(D.crop==='melon_stem'||D.crop==='pumpkin_stem')stemFruit(x,y,z,D.crop);}}
// trees from saplings (like the ones the world grows: simple shapes, own wood and leaves)
function growTree(x,y,z,kind){const W={oak:[B.LOG,B.LEAVES],spruce:[B.SPRUCE_LOG,B.SPRUCE_LEAVES],birch:[B.BIRCH_LOG,B.BIRCH_LEAVES],jungle:[B.JLOG,B.JLEAVES],acacia:[B.ACACIA_LOG,B.ACACIA_LEAVES],dark_oak:[B.DARK_OAK_LOG,B.DARK_OAK_LEAVES]}[kind]||[B.LOG,B.LEAVES];
  const [lg,lv]=W;const list=[];const free=(a,b2,c)=>{const v=getB(a,b2,c);return !v||BD[v].leaves||BD[v].cross||v===B[kind==='oak'?'SAPLING_OAK':'SAPLING_'+kind.toUpperCase()];};
  const put=(a,b2,c,v)=>{if(v===lv&&getB(a,b2,c)&&!(BD[getB(a,b2,c)].cross))return;list.push(a,b2,c,v);};
  const r=Math.random;let th=kind==='spruce'?6+(r()*3|0):kind==='jungle'?7+(r()*4|0):kind==='birch'?5+(r()*2|0):kind==='dark_oak'?5+(r()*2|0):4+(r()*3|0);
  for(let i=0;i<=th+1;i++)if(!free(x,y+i,z))return false;
  if(kind==='acacia'){const dx=r()<.5?1:-1,dz=r()<.5?1:0;let cx=x,cz=z,cy=y;for(let i=0;i<th;i++){if(i>=th-3){cx+=dx;cz+=dz;}put(cx,cy+i,cz,lg);}const ty=y+th;
    for(let ox=-2;ox<=2;ox++)for(let oz=-2;oz<=2;oz++){if(Math.abs(ox)+Math.abs(oz)<4)put(cx+ox,ty,cz+oz,lv);if(Math.abs(ox)+Math.abs(oz)<2)put(cx+ox,ty+1,cz+oz,lv);}}
  else if(kind==='spruce'){for(let i=0;i<th;i++)put(x,y+i,z,lg);let rad=0;for(let i=th+1;i>=2;i--){for(let ox=-rad;ox<=rad;ox++)for(let oz=-rad;oz<=rad;oz++)if((ox||oz||i>=th)&&Math.abs(ox)+Math.abs(oz)<=rad+(rad>1?0:1))put(x+ox,y+i,z+oz,lv);rad=rad>=2?1:rad+1;}}
  else{const R=kind==='dark_oak'||kind==='jungle'?3:2;for(let i=0;i<th;i++)put(x,y+i,z,lg);
    for(let dy=th-2;dy<=th+1;dy++){const rr=dy>=th?R-1:R;for(let ox=-rr;ox<=rr;ox++)for(let oz=-rr;oz<=rr;oz++){if(Math.abs(ox)===rr&&Math.abs(oz)===rr&&(dy===th+1||r()<.5))continue;if(!ox&&!oz&&dy<th)continue;put(x+ox,y+dy,z+oz,lv);}}}
  setMany(list);return true;}

// ---------- jukebox music: an original tune made from the disc's name (no recorded music is used) ----------
const JUKE={pos:null,disc:null,nodes:[],gain:null,end:0};
function jukeStop(drop){if(JUKE.gain){try{JUKE.gain.gain.cancelScheduledValues(0);JUKE.gain.disconnect();}catch(e){}}for(const o of JUKE.nodes)try{o.stop();}catch(e){}JUKE.nodes=[];JUKE.gain=null;
  if(drop&&JUKE.pos&&JUKE.disc)requestDrop([JUKE.pos[0]+.5,JUKE.pos[1]+1.2,JUKE.pos[2]+.5],JUKE.disc,1,[0,2,0]);JUKE.pos=null;JUKE.disc=null;}
function jukePlay(pos,disc){jukeStop(false);if(!actx)return;JUKE.pos=pos;JUKE.disc=disc;const name=ITEMS[disc].disc;let s=0;for(const ch of name)s=s*31+ch.charCodeAt(0)|0;
  const rnd=()=>{s=Math.imul(s^(s>>>15),2246822507)+0x6d2b79f5|0;return ((s>>>0)%10000)/10000;};
  const scale=[0,2,4,7,9,12,14,16,19,21];const root=196*Math.pow(2,(rnd()*7|0)/12);const beat=60/(92+rnd()*50);const g=actx.createGain();g.gain.value=.0;g.connect(masterOut||actx.destination);JUKE.gain=g;
  const t0=actx.currentTime+.1;const bars=16;const note=(f,t,d,type,v)=>{const o=actx.createOscillator(),e=actx.createGain();o.type=type;o.frequency.value=f;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.02);e.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(e);e.connect(g);o.start(t);o.stop(t+d+.05);JUKE.nodes.push(o);};
  const motif=[];for(let i=0;i<8;i++)motif.push(rnd()<.2?-1:scale[rnd()*scale.length|0]);const chords=[0,5,3,4].map(()=>[0,5,7,3,9][rnd()*5|0]);
  for(let bar=0;bar<bars;bar++){const ch=chords[bar%4];for(let i=0;i<8;i++){const m=motif[(i+(bar>>2)*3)%8];const t=t0+(bar*8+i)*beat/2;if(m>=0&&!(bar%4===3&&i>5))note(root*Math.pow(2,(m+(bar>=8?ch%3:0))/12),t,beat*.45,'square',.05);}
    note(root/2*Math.pow(2,ch/12),t0+bar*4*beat,beat*1.8,'triangle',.12);note(root/2*Math.pow(2,(ch+7)/12),t0+(bar*4+2)*beat,beat*1.8,'triangle',.1);}
  JUKE.end=perfT+bars*4*beat+1;chatMsg('Now Playing: Music Disc - '+name,'#ff55ff',false);}
function jukeTick(){if(!JUKE.pos)return;if(perfT>JUKE.end){JUKE.nodes=[];if(JUKE.gain)try{JUKE.gain.disconnect();}catch(e){}JUKE.gain=null;return;}
  if(getB(JUKE.pos[0],JUKE.pos[1],JUKE.pos[2])!==B.JUKEBOX){jukeStop(true);return;}
  if(JUKE.gain&&camPos){const d=dist([JUKE.pos[0]+.5,JUKE.pos[1]+.5,JUKE.pos[2]+.5],camPos);JUKE.gain.gain.value=Math.max(0,1-d/48);}}

// ---------- fishing ----------
const FISH={on:false,pos:null,bite:0,biteT:0,next:0};
const FISH_LOOT=[['raw_fish',60],['raw_salmon',25],['clownfish',2],['pufferfish',13]],JUNK_LOOT=[['bowl',10],['leather_boots',10],['leather',10],['stick',5],['string',5],['rotten_flesh',10],['bone',10],['black_dye',1],['b'+B.LILY,17]],
  TREASURE_LOOT=[['bow',1],['fishing_rod',1],['name_tag',1],['saddle',1],['book_enchanted',1]];
const pickW=T=>{let r=Math.random()*T.reduce((a,e)=>a+e[1],0);for(const e of T){r-=e[1];if(r<=0)return e[0];}return T[0][0];};
function fishCast(p){if(FISH.on){fishReel(p);return;}const o=eye(p),d=fwd(p);let hit=null;for(let t=1;t<14;t+=.25){const x=Math.floor(o[0]+d[0]*t),y=Math.floor(o[1]+d[1]*t-t*t*.012),z=Math.floor(o[2]+d[2]*t);const b=getB(x,y,z);
    if(isWaterB(b)){hit=[x+.5,y+.9,z+.5];break;}if(b&&BD[b].solid)break;}
  psnd(['random/bow','entity/fishing_bobber/throw'],p.pos,.5,.6);p.swing=1;
  if(!hit){chatMsg('Cast into water to fish.','#aaaaaa',false);return;}FISH.on=true;FISH.pos=hit;FISH.bite=0;FISH.next=perfT+5+Math.random()*20;}
function fishReel(p){const bit=FISH.bite>0;FISH.on=false;p.swing=1;wearHeld(p,1);psnd(['random/bow','entity/fishing_bobber/retrieve'],p.pos,.4,.5);
  if(!bit)return;const r=Math.random();const id=r<.85?pickW(FISH_LOOT):r<.95?pickW(JUNK_LOOT):pickW(TREASURE_LOOT);if(!ITEMS[id])return;
  giveOrDrop(p,id,1);xpDrop([p.pos[0],p.pos[1]+.5,p.pos[2]],1+(Math.random()*6|0));sfx('pick');spawnParticles(FISH.pos[0],FISH.pos[1],FISH.pos[2],10,[.8,.9,1],2);}
function fishTick(dt){if(!FISH.on)return;const p=player;const s=p&&p.inv[p.sel];if(!p||!p.alive||!s||s.id!=='fishing_rod'||dist(p.pos,FISH.pos)>28||!isWaterB(getB(Math.floor(FISH.pos[0]),Math.floor(FISH.pos[1]-.5),Math.floor(FISH.pos[2])))){FISH.on=false;return;}
  if(FISH.bite>0){FISH.bite-=dt;if(FISH.bite<=0)FISH.next=perfT+5+Math.random()*25;}
  else if(perfT>FISH.next){FISH.bite=1.2;psnd(['random/splash','entity/fishing_bobber/splash'],FISH.pos,.6,1);spawnParticles(FISH.pos[0],FISH.pos[1],FISH.pos[2],14,[.85,.9,1],2.5);}
  else if(Math.random()<dt*2)spawnParticles(FISH.pos[0]+(Math.random()-.5)*2,FISH.pos[1],FISH.pos[2]+(Math.random()-.5)*2,1,[.8,.9,1],.3);}
{const d0=drawXPOrbs;drawXPOrbs=function(){d0();if(!FISH.on||!FISH.pos)return;useBox(VP,camPos);const y=FISH.pos[1]+Math.sin(perfT*3)*.03-(FISH.bite>0?.18:0);
  box(chain(M4.tr(FISH.pos[0],y+.06,FISH.pos[2]),M4.sc(.12,.08,.12)),[.85,.1,.1],1);box(chain(M4.tr(FISH.pos[0],y-.02,FISH.pos[2]),M4.sc(.12,.08,.12)),[.95,.95,.95],1);useTex(VP,camPos);};}

// ---------- fireworks ----------
const ROCKETS=[];
function launchRocket(pos,boost){ROCKETS.push({pos:pos.slice(),t:0,life:1.1+Math.random()*.5,col:[Math.random(),Math.random(),Math.random()].map(v=>.4+v*.6)});psnd(['fireworks/launch1','entity/firework_rocket/launch'],pos,.7,1);}
function rocketTick(dt){for(const r of ROCKETS){r.t+=dt;r.pos[1]+=dt*14;spawnParticles(r.pos[0],r.pos[1],r.pos[2],1,[1,.9,.6],.3);
    if(r.t>r.life){r.dead=true;spawnParticles(r.pos[0],r.pos[1],r.pos[2],70,r.col,9,'magic');psnd(['fireworks/blast1','entity/firework_rocket/blast'],r.pos,.9,1);}}
  for(let i=ROCKETS.length-1;i>=0;i--)if(ROCKETS[i].dead)ROCKETS.splice(i,1);}
{const g0=glideTick;glideTick=function(e){if(e.rocketT>0){e.rocketT-=.05;const L=fwd(e);for(let k=0;k<3;k++)e.mot[k]+=L[k]*.1+(L[k]*1.5-e.mot[k])*.5;if(Math.random()<.5)spawnParticles(e.pos[0],e.pos[1],e.pos[2],2,[1,.8,.5],.5);}return g0(e);};}

// ---------- maps: hold a map to see the land around you ----------
const MAPV={c:null,t:-9,x:0,z:0};
function mapRender(){const p=player;const N=128,c=MAPV.c||(MAPV.c=mkCanvas(N,N)),g=c.getContext('2d');const im=g.createImageData(N,N),D=im.data;const px=Math.floor(p.pos[0]),pz=Math.floor(p.pos[2]);
  const col={};const rgb=b=>col[b]||(col[b]=(()=>{const h=BLOCK_COL[rotBase(b)]||'#808080';const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];})());
  let prev=new Int16Array(N);for(let j=0;j<N;j++){const z=pz-64+j;for(let i=0;i<N;i++){const x=px-64+i;const o=(j*N+i)*4;
      if(!inB(x,0,z)){D[o]=200;D[o+1]=184;D[o+2]=140;D[o+3]=255;continue;}let y=surfaceH[(z&ZM)*WX+(x&XM)];let b=y>=0?getB(x,y,z):0;let w=0;
      while(y+1<WY&&isWaterB(getB(x,y+1,z))){y++;w++;}
      let c3;if(w){c3=[64,100,230].map(v=>v*Math.max(.55,1-w*.05));}else{c3=rgb(b);const up=getB(x,y+1,z);if(up&&BD[up].cross&&!BD[up].liquid)c3=rgb(up);const sh=j?(y>prev[i]?1.12:y<prev[i]?.82:1):1;c3=c3.map(v=>Math.min(255,v*sh));}
      prev[i]=y;D[o]=c3[0];D[o+1]=c3[1];D[o+2]=c3[2];D[o+3]=255;}}
  g.putImageData(im,0,0);MAPV.t=perfT;}
function drawMap(){const p=player;const s=p&&p.inv[p.sel];if(!s||s.id!=='filled_map'||!INF||hideGui)return;if(perfT-MAPV.t>.5)mapRender();
  const S=Math.round(Math.min(W,H)*.42),x=W-S-Math.round(S*.08),y=H-S-Math.round(S*.35);hc.save();hc.imageSmoothingEnabled=false;
  hc.fillStyle='#d8c8a0';hc.fillRect(x-S*.05,y-S*.05,S*1.1,S*1.1);hc.fillStyle='#8a7050';hc.fillRect(x-2,y-2,S+4,S+4);hc.drawImage(MAPV.c,x,y,S,S);
  hc.translate(x+S/2,y+S/2);hc.rotate(-p.yaw+Math.PI);hc.fillStyle='#ffffff';hc.strokeStyle='#000';hc.lineWidth=1.5;hc.beginPath();hc.moveTo(0,-S*.035);hc.lineTo(S*.025,S*.03);hc.lineTo(-S*.025,S*.03);hc.closePath();hc.fill();hc.stroke();hc.restore();}
{const h0=drawHUD;drawHUD=function(){h0();if(INF&&MATCH.mode==='survival'&&player&&player.alive)drawMap();};}

// ---------- the anvil and enchanting table ----------
const ENCH_KINDS=it=>it.tool==='sword'||it.tool==='axe'?['sharpness','knockback','fire_aspect']:it.tool==='pickaxe'||it.tool==='shovel'?['efficiency']:it.type==='armor'?['protection']:it.type==='bow'?['power','punch','flame','infinity']:[];
function enchantHeld(p,lvl){const s=p.inv[p.sel];const it=s&&ITEMS[s.id];if(!it||it.ench||it.base)return null;const opts=[];for(const k of ENCH_KINDS(it))for(let L=lvl;L>=1;L--){const id=enchId(s.id,k+L);if(ITEMS[id]){opts.push(id);break;}}
  if(!opts.length)return null;const id=opts[Math.random()*opts.length|0];p.inv[p.sel]={id,count:1,dmg:s.dmg};return id;}
function useEnchantTable(p,h){const s=p.inv[p.sel];const it=s&&ITEMS[s.id];const cre=p.gm==='creative';
  if(!it||!ENCH_KINDS(it).length){chatMsg('Hold a sword, axe, pickaxe, shovel, bow or armour and right-click to enchant it.','#aaaaaa',false);return;}
  if(it.ench||it.base){chatMsg('That is already enchanted.','#aaaaaa',false);return;}
  const lvl=Math.max(1,Math.min(3,1+Math.floor(XP.level/10)));const lap=hasItem(p,'blue_dye');
  if(!cre&&XP.level<lvl){chatMsg('You need '+lvl+' experience level'+(lvl>1?'s':'')+' to enchant this.','#ff5555',false);return;}
  if(!cre&&(lap<0||p.inv[lap].count<lvl)){chatMsg('You need '+lvl+' Lapis Lazuli to enchant this.','#ff5555',false);return;}
  const id=enchantHeld(p,lvl);if(!id){chatMsg('That cannot be enchanted.','#aaaaaa',false);return;}
  if(!cre){xpSpend(lvl);const li=hasItem(p,'blue_dye');p.inv[li].count-=lvl;if(p.inv[li].count<=0)p.inv[li]=null;}
  chatMsg('Enchanted: '+ITEMS[id].name,'#c080ff',false);spawnParticles(h.x+.5,h.y+1.2,h.z+.5,30,[.7,.4,1],2.5,'magic');psnd(['random/levelup','block/enchantment_table/use'],[h.x,h.y,h.z],.6,1.3);}
const REPAIR_MAT={wood:PLANKS,stone:COBBLE,iron:['iron_ingot'],golden:['gold_ingot'],diamond:['diamond'],ruby:['ruby'],amethyst:['amethyst_steel'],mythril:['mythril_ingot'],leather:['leather'],chainmail:['iron_ingot'],cobalt:['cobalt_ingot']};
function useAnvil(p,h){const s=p.inv[p.sel];const it=s&&ITEMS[s.id];const cre=p.gm==='creative';
  if(!it){chatMsg('Hold a damaged tool to repair it, or a tool with an Enchanted Book in your inventory to enchant it.','#aaaaaa',false);return;}
  const bk=hasItem(p,'book_enchanted');
  if(bk>=0&&!it.ench&&!it.base&&ENCH_KINDS(it).length){if(!cre&&XP.level<1){chatMsg('You need 1 experience level.','#ff5555',false);return;}const id=enchantHeld(p,1+(Math.random()*3|0));if(id){if(!cre){xpSpend(1);p.inv[bk].count--;if(p.inv[bk].count<=0)p.inv[bk]=null;}
      chatMsg('Enchanted: '+ITEMS[id].name,'#c080ff',false);psnd(['random/anvil_use','block/anvil/use'],[h.x,h.y,h.z],.6,1);return;}}
  const m=maxDur(s.id);if(!m||!(s.dmg>0)){chatMsg('Hold a damaged tool, weapon or armour piece to repair it.','#aaaaaa',false);return;}
  const tier=(it.base?ITEMS[it.base]:it).id||'';const key=(s.id.split('_')[0]);const mats=REPAIR_MAT[key]||REPAIR_MAT[toolTier(s.id)]||[];
  let used=0;while(s.dmg>0&&used<4){const i=p.inv.findIndex(q=>q&&mats.includes(q.id));if(i<0&&!cre)break;if(i>=0&&!cre){p.inv[i].count--;if(p.inv[i].count<=0)p.inv[i]=null;}s.dmg=Math.max(0,s.dmg-Math.ceil(m/4));used++;}
  if(!used){chatMsg('You need '+(ITEMS[mats[0]]?ITEMS[mats[0]].name:'the right material')+' to repair this.','#ff5555',false);return;}
  if(!cre&&XP.level>=1)xpSpend(1);psnd(['random/anvil_use','block/anvil/use'],[h.x,h.y,h.z],.6,1);chatMsg('Repaired.','#aaaaaa',false);}
// ---------- the brewing stand: an ingredient turns the water bottles in your inventory into potions ----------
const BREW={speckled_melon:'potion_healing',ghast_tear:'potion_regeneration',sugar:'potion_swiftness',blaze_powder:'potion_strength',magma_cream:'potion_fire_resistance',
  golden_carrot:'potion_invisibility',spider_eye:'splash_poison',fermented_spider_eye:'splash_weakness',rabbit_foot:'potion_swiftness'};
function useBrewing(p,h){const s=p.inv[p.sel];const id=s&&s.id;
  if(id==='gunpowder'){let n=0;for(let i=0;i<p.inv.length&&n<3;i++){const q=p.inv[i];if(!q||!/^potion_/.test(q.id))continue;const sp='splash_'+q.id.slice(7);if(!ITEMS[sp])continue;p.inv[i]={id:sp,count:q.count};n++;}
    if(!n){chatMsg('Gunpowder turns Potions of Healing into Splash Potions.','#aaaaaa',false);return;}consume(p,p.sel);}
  else{const out=BREW[id];if(!out){chatMsg('Hold a brewing ingredient (Glistering Melon, Ghast Tear, Sugar, Blaze Powder, Magma Cream, Golden Carrot, Spider Eye...) with Water Bottles in your inventory.','#aaaaaa',false);return;}
    let n=0;for(let i=0;i<p.inv.length&&n<3;i++){const q=p.inv[i];if(!q||q.id!=='potion_water')continue;const k=Math.min(q.count,3-n);n+=k;q.count-=k;if(q.count<=0)p.inv[i]=null;}
    if(!n){chatMsg('You need Water Bottles in your inventory: fill Glass Bottles at water.','#aaaaaa',false);return;}giveOrDrop(p,out,n);consume(p,p.sel);chatMsg('Brewed '+(n>1?n+' x ':'')+ITEMS[out].name,'#c080ff',false);}
  psnd(['random/fizz','block/brewing_stand/brew'],[h.x,h.y,h.z],.6,1);spawnParticles(h.x+.5,h.y+1,h.z+.5,14,[.6,.5,1],1.5);p.swing=1;}

// ---------- right click: blocks you use, then the new items ----------
function placeTwo(p,h,lo,up){const X=h.px,Y=h.py,Z=h.pz;if(!replaceable(getB(X,Y,Z))||!replaceable(getB(X,Y+1,Z))||!chunkReadyAt(X,Z))return false;if(!(BD[getB(X,Y-1,Z)]||{}).solid)return false;
  for(const e of ents){if(e.alive&&Math.abs(e.pos[0]-X-.5)<.8&&Math.abs(e.pos[2]-Z-.5)<.8&&e.pos[1]>Y-1.8&&e.pos[1]<Y+2)return false;}setMany([X,Y,Z,lo,X,Y+1,Z,up]);return true;}
function slabMerge(p,h,id){const R=ROT[id];if(!R||R.kind!=='slab')return false;const ny=h.py-h.y;
  // clicking the top of a bottom slab / the underside of a top slab of the same kind fills it in
  if((h.b===R.v[0]&&ny===1)||(h.b===R.v[1]&&ny===-1)){setBlockNet(h.x,h.y,h.z,R.v[2]);return true;}
  const cur=getB(h.px,h.py,h.pz);if(cur===R.v[0]||cur===R.v[1]){setBlockNet(h.px,h.py,h.pz,R.v[2]);return true;}return false;}
{const u0=useSpecial;useSpecial=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival')return u0(p,s);const id=s&&s.id,it=id&&ITEMS[id];const h=raycastBlock(eye(p),fwd(p),4.5,true,true);
  const hb=h&&h.b,HD=hb&&BD[hb],cre=p.gm==='creative';
  // ---- using blocks (sneak to place against them instead) ----
  if(h&&!p.sneak&&HD){
    if(HD.door){const d=HD.door;const lo=d.u?h.y-1:h.y;const lb=getB(h.x,lo,h.z),L=BD[lb];if(L&&L.door){const nb=d.first+L.door.f*4+(L.door.open?0:2);setMany([h.x,lo,h.z,nb,h.x,lo+1,h.z,nb+1]);
        psnd(L.door.open?DOOR_SND.close:DOOR_SND.open,[h.x,h.y,h.z],.6,1);p.swing=1;return true;}}
    if(HD.trap){const t=HD.trap;const ns=t.s>=2?t.s-2:t.s+2;setBlockNet(h.x,h.y,h.z,t.first+t.f*4+ns);psnd(t.s>=2?DOOR_SND.close:DOOR_SND.open,[h.x,h.y,h.z],.5,1.2);p.swing=1;return true;}
    if(HD.cake!=null&&(p.food<20||cre)){p.food=Math.min(20,p.food+2);p.sat=Math.min(p.food,(p.sat||0)+.4);sfx('eat');setBlockNet(h.x,h.y,h.z,HD.cake>=6?0:XB.cake[HD.cake+1]);p.swing=1;return true;}
    if(HD.lever!=null){setBlockNet(h.x,h.y,h.z,XB.lever[HD.lever?0:1]);psnd(['random/click','block/lever/click'],[h.x,h.y,h.z],.5,HD.lever?.5:.6);p.swing=1;return true;}
    if(hb===B.ENCHANT_TABLE){useEnchantTable(p,h);return true;}
    if(rotBase(hb)===B.ANVIL){useAnvil(p,h);return true;}
    if(hb===B.BREWING_STAND){useBrewing(p,h);return true;}
    if(hb===B.JUKEBOX){if(JUKE.pos&&JUKE.pos[0]===h.x&&JUKE.pos[1]===h.y&&JUKE.pos[2]===h.z){jukeStop(true);return true;}if(it&&it.disc){jukePlay([h.x,h.y,h.z],id);consume(p,p.sel);p.swing=1;return true;}}
    if(rotBase(hb)===B.CAULDRON){
      if(id==='water_bucket'&&hb===B.CAULDRON){setBlockNet(h.x,h.y,h.z,B.CAULDRON_W);if(!cre)p.inv[p.sel]={id:'bucket',count:1};psnd(['liquid/splash'],[h.x,h.y,h.z],.4);return true;}
      if(id==='bucket'&&hb===B.CAULDRON_W){setBlockNet(h.x,h.y,h.z,B.CAULDRON);giveBucket(p,'water_bucket');return true;}
      if(id==='glass_bottle'&&hb===B.CAULDRON_W){setBlockNet(h.x,h.y,h.z,B.CAULDRON);consume(p,p.sel);giveOrDrop(p,'potion_water',1);sfx('drink');return true;}}}
  // ---- items ----
  if(it&&it.tool==='hoe'&&h){const ny=h.py-h.y;if(ny===1&&(hb===B.GRASS||hb===B.DIRT||hb===B.PODZOL||hb===B.COARSE_DIRT||hb===B.SAKURA_GRASS||hb===B.SNOW_GRASS)&&!getB(h.x,h.y+1,h.z)){
      setBlockNet(h.x,h.y,h.z,hb===B.COARSE_DIRT?B.DIRT:farmWater(h.x,h.y,h.z)?B.FARMLAND_WET:B.FARMLAND);wearHeld(p,1);p.swing=1;sfx('dig',{pos:[h.x,h.y,h.z],mat:'grass'});return true;}}
  const PLANT={seeds_wheat:'wheat',carrot:'carrots',potato:'potatoes',seeds_melon:'melon_stem',seeds_pumpkin:'pumpkin_stem'};
  if(PLANT[id]&&h&&(hb===B.FARMLAND||hb===B.FARMLAND_WET)&&h.py-h.y===1&&!getB(h.x,h.y+1,h.z)){setBlockNet(h.x,h.y+1,h.z,XB.crops[PLANT[id]][0]);consume(p,p.sel);p.swing=1;sfx('dig',{pos:[h.x,h.y,h.z],mat:'grass'});return true;}
  if(id==='nether_wart_item'&&h&&hb===B.SOUL&&h.py-h.y===1&&!getB(h.x,h.y+1,h.z)){setBlockNet(h.x,h.y+1,h.z,XB.crops.nether_wart[0]);consume(p,p.sel);p.swing=1;return true;}
  if(id==='bone_meal'&&h&&HD){if(HD.crop!=null&&HD.crop!=='nether_wart'){const grown=HD.stage<HD.maxStage&&cropGrow(h.x,h.y,h.z,hb,2+(Math.random()*3|0));if(!grown&&(HD.crop==='melon_stem'||HD.crop==='pumpkin_stem'))stemFruit(h.x,h.y,h.z,HD.crop);
      consume(p,p.sel);p.swing=1;spawnParticles(h.x+.5,h.y+.6,h.z+.5,10,[.4,1,.4],1.5);return true;}
    if(HD.sapling){if(Math.random()<.45)growTree(h.x,h.y,h.z,HD.sapling);consume(p,p.sel);p.swing=1;spawnParticles(h.x+.5,h.y+.6,h.z+.5,10,[.4,1,.4],1.5);return true;}}
  if(id==='fishing_rod'){fishCast(p);return true;}
  if(it&&it.spawn&&h){const pos=[h.px+.5,h.py,h.pz+.5];if(growAuth())spawnMob(it.spawn,pos);else netSend(N.MOBUSE,{a:'spawnegg',m:it.spawn,p:pos},'host');if(!cre)consume(p,p.sel);p.swing=1;return true;}
  if(id==='experience_bottle'){throwSplash(p,'experience_bottle');if(!cre)consume(p,p.sel);p.swing=1;return true;}
  if(id==='fire_charge'&&h){if(hb===B.TNT){igniteTNT(h.x,h.y,h.z,4,p);}else if(!lightFire(h.px,h.py,h.pz))return true;psnd(['mob/ghast/fireball4','item/firecharge/use'],[h.x,h.y,h.z],.5,1);if(!cre)consume(p,p.sel);p.swing=1;return true;}
  if(id==='fireworks'){if(p.gliding){p.rocketT=1.6;launchRocket(p.pos,true);if(!cre)consume(p,p.sel);return true;}if(h){launchRocket([h.px+.5,h.py+.2,h.pz+.5]);if(!cre)consume(p,p.sel);p.swing=1;return true;}return false;}
  if(id==='map'){consume(p,p.sel);giveOrDrop(p,'filled_map',1);mapRender();sfx('pick');p.swing=1;return true;}
  if(id==='glass_bottle'){const r=rayFluidOrSolid(eye(p),fwd(p),4.5);if(r&&isWaterB(r.b)){consume(p,p.sel);giveOrDrop(p,'potion_water',1);sfx('drink');p.swing=1;return true;}return false;}
  if(id==='redstone'&&h&&canBuild()){const below=getB(h.px,h.py-1,h.pz);if((BD[below]||{}).solid&&replaceable(getB(h.px,h.py,h.pz))&&placeBlock(h.px,h.py,h.pz,B.RS_DUST)){consume(p,p.sel);p.swing=1;}return true;}
  // ---- placing blocks: doors, trapdoors, slabs on slabs ----
  if(it&&it.type==='block'&&h&&canBuild()){const bd=BD[it.block];
    if(bd&&bd.door&&!bd.door.u){const k=(lookDir(p)+2)%4;const lo=it.block+k*4;if(placeTwo(p,h,lo,lo+1)){consume(p,p.sel);p.swing=1;sfx('dig',{pos:[h.px,h.py,h.pz],mat:'wood'});}return true;}
    if(bd&&bd.trap){const pl=!!h.plant,ny=pl?1:h.py-h.y,nx=pl?0:h.px-h.x,nz=pl?0:h.pz-h.z;const e=eye(p),f=fwd(p);const hy=e[1]+f[1]*h.t-h.py;const high=ny===-1||(ny===0&&hy>.5);
      const k=ny?(lookDir(p)+2)%4:(nz===1?0:nx===-1?1:nz===-1?2:3);if(placeBlock(h.px,h.py,h.pz,it.block+k*4+(high?1:0))){consume(p,p.sel);p.swing=1;}return true;}
    if(slabMerge(p,h,it.block)){consume(p,p.sel);p.swing=1;sfx('dig',{pos:[h.x,h.y,h.z],mat:blockMat(it.block)});return true;}}
  return u0(p,s);};}
// a jukebox that is broken drops its disc
// network: a guest's spawn egg is spawned by the host
{const m0=mobNet;mobNet=function(code,d,from,fromHost){if(code===N.MOBUSE&&d&&d.a==='spawnegg'){if(isHost()&&MOB_T[d.m]&&Array.isArray(d.p))spawnMob(d.m,d.p);return;}return m0(code,d,from,fromHost);};}
// a thrown Bottle o' Enchanting bursts into experience
{const s0=splashImpact;splashImpact=function(pr){if(pr.pot==='experience_bottle'){spawnParticles(pr.pos[0],pr.pos[1],pr.pos[2],24,[.5,.8,1],3);sfx('glass',{pos:pr.pos});if(owned(pr.owner))xpDrop(pr.pos,3+(Math.random()*9|0),true);return;}return s0(pr);};}
// drops: crops, seeds from grass, saplings from leaves, the second half of a double slab, ores that give several
function cropDrops(b){const D=BD[b];const full=D.stage>=D.maxStage;const r=n=>Math.random()*n|0;
  switch(D.crop){case 'wheat':return full?[['wheat',1],['seeds_wheat',1+r(3)]]:[['seeds_wheat',1]];
    case 'carrots':return [['carrot',full?2+r(3):1]];case 'potatoes':return full?[['potato',2+r(3)]].concat(Math.random()<.02?[['poisonous_potato',1]]:[]):[['potato',1]];
    case 'melon_stem':return [['seeds_melon',1]];case 'pumpkin_stem':return [['seeds_pumpkin',1]];case 'nether_wart':return [['nether_wart_item',1]];}return [];}
{const SAP={[B.LEAVES]:'OAK',[B.SPRUCE_LEAVES]:'SPRUCE',[B.BIRCH_LEAVES]:'BIRCH',[B.JLEAVES]:'JUNGLE',[B.ACACIA_LEAVES]:'ACACIA',[B.DARK_OAK_LEAVES]:'DARK_OAK'};
  const e0=extraDrops;extraDrops=function(x,y,z,b,id){e0(x,y,z,b,id);const at=[x+.5,y-.6,z+.5],v=()=>[(Math.random()-.5)*1.5,2.5,(Math.random()-.5)*1.5];const D=BD[b];if(!D)return;
    if(D.crop!=null)for(const [i,n] of cropDrops(b))requestDrop(at,i,n,v());
    if(b===B.NETHER_WART)requestDrop(at,'nether_wart_item',1+(Math.random()*3|0),v());
    if((b===B.TGRASS||b===B.TALLGRASS2||b===B.TALLGRASS2_TOP)&&Math.random()<.125)requestDrop(at,'seeds_wheat',1,v());
    if(SAP[b]&&Math.random()<(b===B.JLEAVES?.025:.05))requestDrop(at,'b'+B['SAPLING_'+SAP[b]],1,v());
    if(VB.SLAB_FULL[b])requestDrop(at,'b'+VB.SLAB_FULL[b],1,v());
    const ok=MINE_DROP[b]&&mineDrops(b,id);if(ok){if(b===B.LAPIS_ORE)requestDrop(at,'blue_dye',3+(Math.random()*5|0),v());if(b===B.REDSTONE_ORE)requestDrop(at,'redstone',3+(Math.random()*2|0),v());if(b===144)requestDrop(at,'clay_ball',3,v());}};}
Object.assign(ORE_XP,{[B.EMERALD_ORE]:[3,7],[B.LAPIS_ORE]:[2,5],[B.REDSTONE_ORE]:[1,5]});
// breaking the block under a crop, sapling, stem, torch, rail, lever... drops it too
{const c0=blockChanged;blockChanged=function(x,y,z,was,b){const up=getB(x,y+1,z),U=up&&BD[up];c0(x,y,z,was,b);const W=was&&BD[was];if(!W||b)return;
  if(U&&(U.crop!=null||U.sapling||U.pick||U.rail||U.lever!=null||up===B.RS_DUST||U.door&&!U.door.u||up===B.FLOWER_POT||rotBase(up)===B.REPEATER||rotBase(up)===B.COMPARATOR)){
    if(MATCH.mode==='survival'&&growAuth()){const d=mineDrops(up,null);if(d&&ITEMS[d])requestDrop([x+.5,y+.4,z+.5],d,1);extraDrops(x,y+1,z,up,null);}
    const list=[x,y+1,z,0];if(U.door&&BD[getB(x,y+2,z)]&&BD[getB(x,y+2,z)].door)list.push(x,y+2,z,0);applyBlockList(list,true);}
  if(was===B.JUKEBOX&&JUKE.pos&&JUKE.pos[0]===x&&JUKE.pos[1]===y&&JUKE.pos[2]===z)jukeStop(true);};}
// placing: turned blocks
// eating stew gives the bowl back; drinking a potion gives the bottle back (13_ui)
// ---------- creatures follow the food they like ----------
const TEMPT={cow:['wheat'],sheep:['wheat'],pig:['carrot','potato','carrot_on_a_stick'],chicken:['seeds_wheat','seeds_melon','seeds_pumpkin','nether_wart_item'],deer:['carrot','golden_carrot']};
{const u0=updateMob;updateMob=function(e,dt){const L=TEMPT[e.mob];e.tempt=null;if(L&&!(e.panic>0)&&!e.owner){let bd=10;for(const q of ents){if(q.kind!=='player'||!q.alive)continue;const s=q.inv&&q.inv[q.sel];if(!s||!L.includes(s.id))continue;const d=dist(q.pos,e.pos);if(d<bd){bd=d;e.tempt=q;}}}return u0(e,dt);};}
{const a0=applyPack;applyPack=function(){const r=a0.apply(this,arguments);CRE.cats=null;return r;};}
// ---------- the tick ----------
{const t0=survTick;survTick=function(dt){t0(dt);if(!INF)return;cropTick(dt);fishTick(dt);rocketTick(dt);jukeTick();};}
{const r0=restartSurvivalStream;restartSurvivalStream=function(){CROPS.clear();return r0.apply(this,arguments);};}
