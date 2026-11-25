// ================= The rest of the vanilla (1.8) items: hoes, seeds and crops, fish and the fishing rod, books, bottles, brewing ingredients, =================
// records, minecarts and boats, horse gear, maps, fireworks, spawn eggs (made in 15r once the mobs are known)... with the pack's own item art.
const COLL=['A collectible: it has no use in this game yet'];
{const T=TOOL_TIERS;for(const [k,N,p,c] of T)item(k+'_hoe',{name:N+' Hoe',type:'weapon',tool:'hoe',dmg:1,color:c,tex:'item/'+(p==='golden'?'gold':p==='wooden'?'wood':p)+'_hoe',tip:['Right click grass or dirt to till it into farmland']});}
gad('fishing_rod','Fishing Rod','#8a6a3a','Right click to cast into water, again to reel in when the float dips',64,'fishing_rod_uncast');
gad('carrot_on_a_stick','Carrot on a Stick','#f08a1a','Pigs follow you while you hold it',25,'carrot_on_a_stick');
// farming
mat('seeds_wheat','Seeds','#4a8a2a','seeds_wheat',{tip:['Plant them on farmland']});mat('seeds_melon','Melon Seeds','#2a2a1a','seeds_melon',{tip:['Plant them on farmland']});
mat('seeds_pumpkin','Pumpkin Seeds','#d8c880','seeds_pumpkin',{tip:['Plant them on farmland']});mat('wheat','Wheat','#d8b84a','wheat');
food('potato','Potato',1,.6,'#c8a050','potato',{tip:['Plant it on farmland, or bake it in a furnace']});food('poisonous_potato','Poisonous Potato',2,1.2,'#a8b040','potato_poisonous',{fx:[['poison',5,0]],fxChance:.6});
// food
food('mushroom_stew','Mushroom Stew',6,7.2,'#a08060','mushroom_stew',{stack:1,bowl:true});mat('bowl','Bowl','#8a6a3a','bowl');
food('raw_fish','Raw Fish',2,.4,'#8aa0b0','fish_cod_raw');food('raw_salmon','Raw Salmon',2,.4,'#c05040','fish_salmon_raw');
food('clownfish','Clownfish',1,.2,'#f08020','fish_clownfish_raw');food('pufferfish','Pufferfish',1,.2,'#e0c040','fish_pufferfish_raw',{fx:[['poison',60,3]]});
food('cooked_fish','Cooked Fish',5,6,'#b0a090','fish_cod_cooked');food('cooked_salmon','Cooked Salmon',6,9.6,'#d07050','fish_salmon_cooked');
// materials
mat('sugar','Sugar','#f8f8f8','sugar');mat('paper','Paper','#f0f0e8','paper');mat('book','Book','#8a4a2a','book_normal');
mat('book_writable','Book and Quill','#8a4a2a','book_writable',{stack:1});mat('book_written','Written Book','#8a4a2a','book_written',{stack:16,tip:COLL});
mat('book_enchanted','Enchanted Book','#a060e0','book_enchanted',{stack:1,tip:['Use it on an Anvil with a tool in your hand to enchant the tool']});
mat('brick','Brick','#a8503a','brick');mat('clay_ball','Clay','#a0a8b8','clay_ball');mat('charcoal','Charcoal','#3a3028','charcoal');
mat('emerald','Emerald','#3fd46a','emerald');mat('nether_star','Nether Star','#f0f0d0','nether_star');mat('netherbrick','Nether Brick','#5a2a2a','netherbrick');
mat('prismarine_shard','Prismarine Shard','#5aa898','prismarine_shard');mat('prismarine_crystals','Prismarine Crystals','#a8d8c8','prismarine_crystals');
mat('rabbit_foot','Rabbit\'s Foot','#c8a880','rabbit_foot');mat('rabbit_hide','Rabbit Hide','#c8a070','rabbit_hide');mat('slime_ball','Slimeball','#70c060','slimeball');
mat('fermented_spider_eye','Fermented Spider Eye','#a05060','spider_eye_fermented');mat('speckled_melon','Glistering Melon','#f0c040','melon_speckled');
mat('redstone','Redstone','#c81a0e','redstone_dust',{tip:['Place it as redstone dust (decorative)']});
mat('glass_bottle','Glass Bottle','#d0e0f0','potion_bottle_empty',{tip:['Right click water to fill it']});
item('potion_water',{name:'Water Bottle',type:'potion',color:'#385dc6',fx:[],tex:'item/potion',tip:['Brew it at a Brewing Stand']});
mat('experience_bottle',"Bottle o' Enchanting",'#a0f050','experience_bottle',{tip:['Right click to throw: it bursts into experience']});
mat('fire_charge','Fire Charge','#e05010','fireball',{tip:['Right click a block to set it alight']});
mat('fireworks','Firework Rocket','#c04040','fireworks',{tip:['Right click the ground to launch it','Use it while gliding for a boost']});mat('firework_charge','Firework Star','#808080','fireworks_charge');
mat('map','Empty Map','#e8e0c8','map_empty',{stack:64,tip:['Right click to draw a map of the land around you']});mat('filled_map','Map','#e8e0c8','map_filled',{stack:1,tip:['Hold it to see the map']});
mat('name_tag','Name Tag','#d8c8a8','name_tag',{tip:COLL});mat('lead','Lead','#a08050','lead',{tip:COLL});mat('saddle','Saddle','#8a5a2a','saddle',{stack:1,tip:COLL});
for(const [k,N,c] of [['iron','Iron','#d8d8d8'],['golden','Gold','#f2d33a'],['diamond','Diamond','#46dccf']])mat(k+'_horse_armor',N+' Horse Armor',c,(k==='golden'?'gold':k)+'_horse_armor',{stack:1,tip:COLL});
for(const [k,N,tn] of [['minecart','Minecart','minecart_normal'],['chest_minecart','Minecart with Chest','minecart_chest'],['furnace_minecart','Minecart with Furnace','minecart_furnace'],
  ['tnt_minecart','Minecart with TNT','minecart_tnt'],['hopper_minecart','Minecart with Hopper','minecart_hopper'],['command_block_minecart','Minecart with Command Block','minecart_command_block'],['boat','Boat','boat']])mat(k,N,'#8a8a8a',tn,{stack:1,tip:['You cannot ride it yet: a collectible for now']});
mat('armor_stand','Armor Stand','#a2824e','wooden_armorstand',{stack:16,tip:COLL});
const RECORDS=['13','cat','blocks','chirp','far','mall','mellohi','stal','strad','ward','11','wait'];
for(const r of RECORDS)mat('record_'+r,'Music Disc','#2a2a2a','record_'+r,{stack:1,disc:r,tip:['"'+r+'"','Right click a Jukebox to play it (an original tune made for this game)']});
ITEMS.blue_dye.name='Lapis Lazuli';
// block items that show the pack's flat item art
{const T=(b,tex)=>{const it=ITEMS['b'+b];if(it&&b!=null)it.tex='item/'+tex;};
  T(B.CAKE,'cake');T(B.BREWING_STAND,'brewing_stand');T(B.CAULDRON,'cauldron');T(B.FLOWER_POT,'flower_pot');T(B.HOPPER,'hopper');T(B.REPEATER,'repeater');T(B.COMPARATOR,'comparator');
  T(B.ITEM_FRAME,'item_frame');T(B.SIGN,'sign');T(28,'barrier');
  for(const [k,tn] of [['OAK','door_wood'],['SPRUCE','door_spruce'],['BIRCH','door_birch'],['JUNGLE','door_jungle'],['ACACIA','door_acacia'],['DARK_OAK','door_dark_oak'],['IRON','door_iron']])T(B['DOOR_'+k],tn);
  for(const b of [B.CAKE,B.BREWING_STAND,B.CAULDRON,B.HOPPER,B.SIGN].concat(XB.doors))if(ITEMS['b'+b])ITEMS['b'+b].stack=b===B.CAKE?1:b===B.SIGN?16:64;
  // redstone dust is placed with the Redstone item, crops with their seeds
  delete ITEMS['b'+B.RS_DUST];}
// ---------- mining: how long, with what, and what drops ----------
{const T=MINE_T_X,P=PICK_BLOCKS,A=AXE_BLOCKS,S=SHOVEL_BLOCKS;const b=k=>B[k];
  const set=(ids,t,tool,lvl,drop)=>{for(const i of ids){if(i==null)continue;T[i]=t;if(tool==='p')P.add(i);else if(tool==='a')A.add(i);else if(tool==='s')S.add(i);if(lvl!=null)PICK_LEVEL[i]=lvl;if(drop!==undefined)MINE_DROP[i]=drop;}};
  set([30,31,32],.05);set([34],.05);set([35],.6,'s');set([36],4);MINE_DROP[36]='string';set([37],.4,'a');set([41],2,'p');set([42],2,'p');set([29],3);
  set([b('JUNGLE_PLANKS')],1.4,'a');set([b('RSANDSTONE'),b('RSANDSTONE_C'),b('RSANDSTONE_S'),b('RSANDSTONE_STAIRS'),b('RSANDSTONE_SLAB'),b('SANDSTONE_STAIRS')],1.2,'p');
  set([b('SPONGE'),b('WET_SPONGE')],.6);set([b('EMERALD_ORE')],3,'p',2,'emerald');set([b('LAPIS_ORE')],3,'p',1,'blue_dye');set([b('REDSTONE_ORE')],3,'p',2,'redstone');
  set([b('BROWN_MUSH_BLOCK')],.3,'a',null,'b'+B.MUSH_BROWN);set([b('RED_MUSH_BLOCK')],.3,'a',null,'b'+B.MUSH_RED);
  set([b('DISPENSER'),b('DROPPER')],3.5,'p');set([b('PISTON'),b('STICKY_PISTON')],.5,'p');
  set(XB.glass.concat(XB.panes),.3,null,null,null);set(XB.clays,1.25,'p');
  for(const k of ['BIRCH','ACACIA','DARK_OAK','JUNGLE'])set([b(k+'_STAIRS'),b(k+'_SLAB')],2,'a');set([b('SPRUCE_SLAB')],2,'a');
  set([b('BRICK_STAIRS'),b('BRICK_SLAB'),b('NB_STAIRS'),b('NB_SLAB'),b('COBBLE_SLAB')],2,'p');set([b('QUARTZ_STAIRS'),b('QUARTZ_SLAB')],.8,'p');
  set([b('ENCHANT_TABLE')],5,'p',0);set([b('ANVIL'),b('ANVIL_Z')],5,'p',0);set([b('CAULDRON'),b('CAULDRON_W')],2,'p',0,'b'+B.CAULDRON);set([b('BREWING_STAND')],.5,'p');set([b('HOPPER')],3,'p',0);
  set([b('DAYLIGHT')],.2,'a');set([b('FLOWER_POT')],.05);set(XB.cake,.5,null,null,null);
  set([b('RS_TORCH')],.05);set([b('RS_DUST')],.05,null,null,'redstone');set(XB.lever,.5);set([b('REPEATER'),b('COMPARATOR')],.05);set(XB.rails,.7,'p');
  set([b('FARMLAND'),b('FARMLAND_WET')],.6,'s',null,'b2');
  for(const k in XB.crops)set(XB.crops[k],.05,null,null,null);   // crops drop through cropDrops (15r)
  set(XB.saplings,.05);set([b('SUNFLOWER'),b('SUNFLOWER_TOP')],.05);MINE_DROP[b('SUNFLOWER_TOP')]='b'+b('SUNFLOWER');
  for(const f of XB.doors){const iron=f===b('DOOR_IRON');for(let i=0;i<16;i++)set([f+i],iron?5:3,iron?'p':'a',iron?0:null,'b'+f);}
  for(const f of XB.traps){const iron=f===b('TRAPDOOR_IRON');for(let i=0;i<16;i++)set([f+i],iron?5:3,iron?'p':'a',iron?0:null,'b'+f);}
  set(XB.frames,.05);set(XB.signs,1,'a',null,'b'+B.SIGN);
  MINE_DROP[144]='clay_ball';MINE_DROP[30]=null;}
