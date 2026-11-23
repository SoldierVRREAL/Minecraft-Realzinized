// ================= Recipes and smelting for the new blocks and items =================
// building blocks
shaped(['GSG','SGS','GSG'],{G:'gunpowder',S:'b7'},'b'+B.TNT);
shaped(['PPP','LFL','PPP'],{P:PLANKS,L:'leather',F:'feather'},'b'+B.BOOKSHELF);
shaped(['GGG','GGG','GGG'],{G:'b30'},'b'+B.HAY);shapeless(['b'+B.HAY],'bread',3);
shapeless(['b'+B.PUMPKIN,'b54'],'b'+B.JACK);shapeless(['b'+B.PUMPKIN,'egg'],'pumpkin_pie');
shaped(['MMM','MMM','MMM'],{M:'melon_slice'},'b'+B.MELON);
shaped(['MMM','MMM','MMM'],{M:'iron_ingot'},'b'+B.IRON_BLOCK);shapeless(['b'+B.IRON_BLOCK],'iron_ingot',9);
shaped(['MMM','MMM','MMM'],{M:'blue_dye'},'b'+B.LAPIS_BLOCK);shapeless(['b'+B.LAPIS_BLOCK],'blue_dye',9);
shapeless(['b10','coal'],'b'+B.NETHER_BRICK);shapeless(['b19','crystal_shard'],'b'+B.END_STONE,2);
shapeless(['b9','crystal_shard'],'b'+B.PRISMARINE,2);shaped(['PP','PP'],{P:'b'+B.PRISMARINE},'b'+B.PRISM_BRICKS,4);shapeless(['b'+B.PRISM_BRICKS,'black_dye'],'b'+B.DARK_PRISM);
shaped(['CPC','PGP','CPC'],{C:'crystal_shard',P:'b'+B.PRISMARINE,G:'b17'},'b'+B.SEA_LANTERN);
shaped(['PPP','PDP','PPP'],{P:PLANKS,D:'diamond'},'b'+B.JUKEBOX);shaped(['PPP','PSP','PPP'],{P:PLANKS,S:'string'},'b'+B.NOTEBLOCK);
shaped(['GGG','GLG','GGG'],{G:'b11',L:'b17'},'b'+B.LAMP);
for(const [src,out] of [[83,'CRYSTAL_BRICKS'],[91,'BASALT_BRICKS'],[90,'ASH_BRICKS'],[101,'ICE_BRICKS'],[99,'SNOW_BRICKS'],[93,'MAGMA_BRICKS']])shaped(['SS','SS'],{S:'b'+src},'b'+B[out],4);
shaped(['PPP','PTP','PPP'],{P:'b81',T:'b54'},'b'+B.SAKURA_LANTERN);shaped(['SSS','SGS','SSS'],{S:'glow_spores',G:'b11'},'b'+B.GLOW_LAMP);shapeless(['b11','mythril_ingot','b54'],'b'+B.MYTHRIL_LANTERN);
shaped(['PP','PP'],{P:'b'+B.P_DIORITE},'b57');shaped(['Q','Q'],{Q:'b57'},'b'+B.QUARTZ_PILLAR,2);shaped(['QQ'],{Q:'b'+B.QUARTZ_PILLAR},'b'+B.QUARTZ_CHISELED,2);
for(const k of ['GRANITE','DIORITE','ANDESITE'])shaped(['SS','SS'],{S:'b'+B[k]},'b'+B['P_'+k],4);
shaped(['SS','SS'],{S:'string'},'b71');shaped(['MMM','MMM','MMM'],{M:'bone_meal'},'b18');shapeless(['b18'],'bone_meal',9);
// dyes and coloured wool
shapeless(['b31'],'red_dye',2);shapeless(['b32'],'yellow_dye',2);shapeless(['sapphire'],'blue_dye',3);shapeless(['coal'],'black_dye',2);shapeless(['b92'],'brown_dye',2);shapeless(['b81'],'pink_dye',2);
shapeless(['crystal_shard'],'cyan_dye',2);shapeless(['red_dye','blue_dye'],'purple_dye',2);shapeless(['green_dye','bone_meal'],'lime_dye',2);shapeless(['blue_dye','bone_meal'],'light_blue_dye',2);
shapeless(['purple_dye','pink_dye'],'magenta_dye',2);shapeless(['black_dye','bone_meal'],'gray_dye',2);shapeless(['gray_dye','bone_meal'],'light_gray_dye',2);shapeless(['red_dye','yellow_dye'],'orange_dye',2);
shapeless(['bone'],'bone_meal',3);
const DYE_TO_WOOL={red:'b12',orange:'b'+B.WOOL_ORANGE,magenta:'b'+B.WOOL_MAGENTA,light_blue:'b'+B.WOOL_LIGHT_BLUE,yellow:'b'+B.WOOL_YELLOW,lime:'b'+B.WOOL_LIME,pink:'b'+B.WOOL_PINK,gray:'b'+B.WOOL_GRAY,
  light_gray:'b'+B.WOOL_SILVER,cyan:'b'+B.WOOL_CYAN,purple:'b'+B.WOOL_PURPLE,blue:'b'+B.WOOL_BLUE,brown:'b'+B.WOOL_BROWN,green:'b'+B.WOOL_GREEN,black:'b'+B.WOOL_BLACK};
for(const k in DYE_TO_WOOL)shapeless([k+'_dye','b71'],DYE_TO_WOOL[k]);
// tools, weapons, gear
shapeless(['iron_ingot','flint'],'flint_and_steel');shaped([' I','I '],{I:'iron_ingot'},'shears');shaped(['I I',' I '],{I:'iron_ingot'},'bucket');
shaped([' SV','S V',' SV'],{S:'stick',V:'string'},'bow');shaped(['F','S','E'],{F:'flint',S:'stick',E:'feather'},'arrow',4);
shaped([' SC','S C',' SC'],{S:'stick',C:'crystal_silk'},'crystal_bow');
shaped(['F','F','S'],{F:'frost_fang',S:'stick'},'frost_dagger');shaped(['MCM',' S ',' S '],{M:'b93',C:'magma_cream',S:'stick'},'magma_hammer');
shaped([' G ','GAG',' G '],{G:'gold_ingot',A:'crystal_apple'},'totem');
shapeless(['gunpowder','glow_spores'],'spore_bomb',2);shapeless(['gunpowder','frost_fang'],'frost_bomb',2);
shaped(['ISI','ICI'],{I:'iron_ingot',S:'spider_eye',C:'crystal_shard'},'mob_radar');
{const K={M:'leather'};shaped(['MMM','M M'],K,'leather_helmet');shaped(['M M','MMM','MMM'],K,'leather_chestplate');shaped(['MMM','M M','M M'],K,'leather_leggings');shaped(['M M','M M'],K,'leather_boots');}
// foods
shapeless(['carrot','gold_ingot'],'golden_carrot');shapeless(['apple','crystal_shard','crystal_shard','crystal_shard'],'crystal_apple');shapeless(['bread','glow_spores'],'spore_bread');
shapeless(['rotten_flesh','magma_cream'],'magma_jerky');shapeless(['cooked_venison','carrot','baked_potato'],'venison_stew');shapeless(['cooked_venison','b98','b97'],'venison_stew');
// furnace
Object.assign(SMELT,{raw_beef:'cooked_beef',raw_porkchop:'cooked_porkchop',raw_chicken:'cooked_chicken',raw_mutton:'cooked_mutton',raw_venison:'cooked_venison',egg:'fried_egg',
  ['b'+B.CLAY]:'b'+B.TERRACOTTA,b115:'green_dye',rotten_flesh:'leather',b13:'flint',b30:'green_dye'});
Object.assign(FUEL,{['b'+B.HAY]:40,['b'+B.BOOKSHELF]:15,['b'+B.NOTEBLOCK]:15,['b'+B.JUKEBOX]:15,magma_cream:30});
