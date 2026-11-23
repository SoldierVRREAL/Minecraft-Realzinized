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
item('totem','Totem of Renewal',{type:'mat',stack:1,color:'#f0d060',tip:['Keep it in your inventory: saves you from death once']});
item('frost_dagger',{name:'Frost Dagger',type:'weapon',tool:'sword',dmg:6,color:'#c8ecff',tip:['Hits slow the target']});
item('magma_hammer',{name:'Magma Hammer',type:'weapon',tool:'axe',dmg:9,color:'#e04010',tip:['Hits shake the ground and burn everything next to the target']});
item('crystal_bow',{name:'Crystal Bow',type:'bow',color:'#6ab4ff',multishot:true,tip:['Shoots three arrows at once (uses one)']});
item('spore_bomb',{name:'Spore Bomb',type:'splash',color:'#8a5ae0',fx:[['poison',8,0],['weakness',10,0]],tip:['Throw it: poisons everything it splashes']});
item('frost_bomb',{name:'Frost Bomb',type:'splash',color:'#9ad8ff',fx:[['slowness',10,1]],tip:['Throw it: freezes creatures in place']});
Object.assign(DURABILITY,{frost:400,magma:600});
// ---- mining: new blocks ----
Object.assign(MINE_T_X,{124:.05,139:1.5,140:.5,141:1,142:1,143:1,144:.6,145:1.25,146:5,147:3,148:2,149:3,150:1.5,151:1.5,152:1.5,153:.3,154:2,155:.8,156:.3,157:2.2,158:2,159:1.5,160:1.2,161:.8,162:2,163:.3,164:.3,165:.3,168:.8,169:.8,
  170:1.5,171:1.5,172:1.5,173:1.5,174:1.5,175:1.5});
for(let b=125;b<=138;b++)MINE_T_X[b]=.8;
for(const b of [145,146,147,148,149,150,151,152,157,158,159,160,161,162,168,169,170,171,172,173,174,175])PICK_BLOCKS.add(b);
for(const b of [139,141,142,143,154,155])AXE_BLOCKS.add(b);SHOVEL_BLOCKS.add(144);SHOVEL_BLOCKS.add(140);
Object.assign(PICK_LEVEL,{146:1,147:1});
Object.assign(MINE_DROP,{143:'melon_slice',144:'b144',153:'b153'});
