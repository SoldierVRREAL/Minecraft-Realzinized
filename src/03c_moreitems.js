// ================= More items: mob drops, meat, dyes, new foods, new tools and weapons =================
const mat=(id,name,col,tex,o={})=>item(id,Object.assign({name,type:'mat',stack:64,color:col,tex:tex?'item/'+tex:undefined},o));
const food=(id,name,f,s,col,tex,o={})=>item(id,Object.assign({name,type:'food',food:f,sat:s,stack:64,color:col,tex:tex?'item/'+tex:undefined},o));
// ---- mob drops ----
food('raw_beef','Raw Beef',3,1.8,'#c8483a','beef_raw');food('raw_porkchop','Raw Porkchop',3,1.8,'#e88a8a','porkchop_raw');
food('raw_chicken','Raw Chicken',2,1.2,'#e8b0a0','chicken_raw',{fx:[['poison',4,0]],fxChance:.3});
food('raw_mutton','Raw Mutton',2,1.2,'#c84a4a','mutton_raw');food('cooked_mutton','Cooked Mutton',6,9.6,'#a8603a','mutton_cooked');
food('raw_venison','Raw Venison',3,1.8,'#b8443a','rabbit_raw');food('cooked_venison','Cooked Venison',8,12.8,'#8a4a2a','rabbit_cooked');
food('rotten_flesh','Rotten Flesh',4,.8,'#8a5a3a','rotten_flesh',{fx:[['poison',5,0]],fxChance:.8});
food('spider_eye','Spider Eye',2,3.2,'#a02a3a','spider_eye',{fx:[['poison',5,0]]});
mat('leather','Leather','#a0603a','leather');mat('feather','Feather','#f0f0f0','feather');mat('bone','Bone','#e8e4d8','bone');
mat('bone_meal','Bone Meal','#f4f4f4','dye_powder_white',{tip:['Right click grass to grow flowers and tall grass']});
mat('string','String','#f0f0f0','string');mat('gunpowder','Gunpowder','#5a5a5a','gunpowder');mat('magma_cream','Magma Cream','#e8a030','magma_cream');
mat('egg','Egg','#e8dcc0','egg',{stack:16,tip:['Right click to throw: sometimes a chick hatches']});
mat('frost_fang','Frost Fang','#c8ecff',null,{tip:['Dropped by Ice Wolves']});mat('crystal_silk','Crystal Silk','#7cc0ff',null,{tip:['Dropped by Crystal Spiders']});
mat('glow_spores','Glow Spores','#50b0e8',null,{tip:['Dropped by Glowshrooms']});mat('flint','Flint','#4a4a4a','flint');
// ---- dyes (white = bone meal) ----
const DYES=[['red','Red','#b02e26'],['yellow','Yellow','#e8d040'],['blue','Blue','#3a4ab0'],['black','Black','#1d1d21'],['green','Green','#5e7c16'],['brown','Brown','#835432'],['pink','Pink','#f38baa'],
  ['cyan','Cyan','#169c9c'],['purple','Purple','#8932b8'],['lime','Lime','#80c71f'],['light_blue','Light Blue','#3ab3da'],['magenta','Magenta','#c74ebd'],['gray','Gray','#474f52'],['light_gray','Light Gray','#9d9d97'],['orange','Orange','#f9801d']];
for(const [k,N,c] of DYES)mat(k+'_dye',N+' Dye',c,'dye_powder_'+(k==='light_gray'?'silver':k));
// ---- foods ----
food('golden_carrot','Golden Carrot',6,14.4,'#f0c020','carrot_golden');
food('fried_egg','Fried Egg',4,5,'#f8f0d0',null);
food('frost_berry','Frost Berries',2,1.2,'#7ab8ff',null,{fx:[['speed',10,0]],tip:['Found in Frozen Forest leaves']});
food('ember_pepper','Ember Pepper',3,2,'#e04010',null,{fx:[['fireres',30,0]],tip:['Found on Ashen dead bushes']});
food('crystal_apple','Crystal Apple',6,9.6,'#6ab4ff',null,{fx:[['absorption',60,0],['speed',30,0]],always:true});
food('spore_bread','Spore Bread',6,8,'#a080e0',null,{fx:[['regen',6,0]]});
food('magma_jerky','Magma Jerky',5,6,'#c04010',null,{fx:[['fireres',60,0]]});
food('venison_stew','Venison Stew',10,12,'#8a5a3a','rabbit_stew',{stack:16});
// ---- tools ----
const gad=(id,name,col,tip,uses,tex)=>item(id,{name,type:'gadget',color:col,tip:[tip],uses,tex:tex?'item/'+tex:undefined});
gad('flint_and_steel','Flint and Steel','#8a8a8a','Light TNT, or set things on fire',64,'flint_and_steel');
gad('shears','Shears','#c8c8c8','Shear sheep for wool, glowshrooms for mushrooms',238,'shears');
gad('bucket','Bucket','#b8b8b8','Right click a cow to milk it',0,'bucket_empty');
item('milk_bucket',{name:'Milk Bucket',type:'potion',color:'#f8f8f8',fx:[['milk',0,0]],tex:'item/bucket_milk',tip:['Drink to clear all effects']});
gad('mob_radar','Mob Radar','#40c060','Hold it: shows creatures within 32 blocks',0);
item('totem',{name:'Totem of Renewal',type:'mat',stack:1,color:'#f0d060',tip:['Keep it in your inventory: saves you from death once']});
item('frost_dagger',{name:'Frost Dagger',type:'weapon',tool:'sword',dmg:6,color:'#c8ecff',tip:['Hits slow the target']});
item('magma_hammer',{name:'Magma Hammer',type:'weapon',tool:'axe',dmg:9,color:'#e04010',tip:['Hits shake the ground and burn everything next to the target']});
item('crystal_bow',{name:'Crystal Bow',type:'bow',color:'#6ab4ff',multishot:true,tip:['Shoots three arrows at once (uses one)']});
item('spore_bomb',{name:'Spore Bomb',type:'splash',color:'#8a5ae0',fx:[['poison',8,0],['weakness',10,0]],tip:['Throw it: poisons everything it splashes']});
item('frost_bomb',{name:'Frost Bomb',type:'splash',color:'#9ad8ff',fx:[['slowness',10,1]],tip:['Throw it: freezes creatures in place']});
Object.assign(DURABILITY,{frost:400,magma:600});
// ---- mining: new blocks ----
{const b=k=>B[k];const T={TNT:.05,BOOKSHELF:1.5,HAY:.5,PUMPKIN:1,JACK:1,MELON:1,CLAY:.6,TERRACOTTA:1.25,IRON_BLOCK:5,LAPIS_BLOCK:3,NETHER_BRICK:2,END_STONE:3,PRISMARINE:1.5,PRISM_BRICKS:1.5,DARK_PRISM:1.5,
  SEA_LANTERN:.3,JUKEBOX:2,NOTEBLOCK:.8,LAMP:.3,CRYSTAL_BRICKS:2.2,BASALT_BRICKS:2,ASH_BRICKS:1.5,ICE_BRICKS:1.2,SNOW_BRICKS:.8,MAGMA_BRICKS:2,SAKURA_LANTERN:.3,GLOW_LAMP:.3,MYTHRIL_LANTERN:.3,
  QUARTZ_PILLAR:.8,QUARTZ_CHISELED:.8,GRANITE:1.5,P_GRANITE:1.5,DIORITE:1.5,P_DIORITE:1.5,ANDESITE:1.5,P_ANDESITE:1.5};
  for(const k in T)MINE_T_X[b(k)]=T[k];for(const [k] of MB_WOOLS)MINE_T_X[b('WOOL_'+k.toUpperCase())]=.8;
  for(const k of ['TERRACOTTA','IRON_BLOCK','LAPIS_BLOCK','NETHER_BRICK','END_STONE','PRISMARINE','PRISM_BRICKS','DARK_PRISM','CRYSTAL_BRICKS','BASALT_BRICKS','ASH_BRICKS','ICE_BRICKS','SNOW_BRICKS','MAGMA_BRICKS',
    'QUARTZ_PILLAR','QUARTZ_CHISELED','GRANITE','P_GRANITE','DIORITE','P_DIORITE','ANDESITE','P_ANDESITE'])PICK_BLOCKS.add(b(k));
  for(const k of ['BOOKSHELF','PUMPKIN','JACK','MELON','JUKEBOX','NOTEBLOCK'])AXE_BLOCKS.add(b(k));SHOVEL_BLOCKS.add(b('CLAY'));SHOVEL_BLOCKS.add(b('HAY'));
  PICK_LEVEL[b('IRON_BLOCK')]=1;PICK_LEVEL[b('LAPIS_BLOCK')]=1;}
Object.assign(MINE_DROP,{143:'melon_slice',144:'b144',153:'b153'});
