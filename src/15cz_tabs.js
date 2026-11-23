// ================= The new recipes on the console crafting screen's tabs =================
{const T=n=>LC_TABS.find(t=>t.name===n).entries;const b=k=>'b'+B[k];
  T('Structures').push(['TNT',[b('TNT')]],['Bookshelf',[b('BOOKSHELF')]],['Hay Bale',[b('HAY')]],['Melon',[b('MELON')]],['Block of Iron',[b('IRON_BLOCK'),b('LAPIS_BLOCK')]],
    ['Biome Bricks',[b('CRYSTAL_BRICKS'),b('BASALT_BRICKS'),b('ASH_BRICKS'),b('ICE_BRICKS'),b('SNOW_BRICKS'),b('MAGMA_BRICKS')]],['Polished Stone',[b('P_GRANITE'),b('P_DIORITE'),b('P_ANDESITE')]],
    ['Prismarine',[b('PRISMARINE'),b('PRISM_BRICKS'),b('DARK_PRISM')]],['Nether Bricks',[b('NETHER_BRICK')]],['End Stone',[b('END_STONE')]],['Quartz',['b57',b('QUARTZ_PILLAR'),b('QUARTZ_CHISELED')]],['Bone Block',['b18']]);
  T('Tools and Weapons').push(['Flint and Steel',['flint_and_steel']],['Shears',['shears']],['Bucket',['bucket']],['Crystal Bow',['crystal_bow']],['Frost Dagger',['frost_dagger']],['Magma Hammer',['magma_hammer']],
    ['Bombs',['spore_bomb','frost_bomb']],['Mob Radar',['mob_radar']],['Totem of Renewal',['totem']]);
  T('Food').push(['Golden Carrot',['golden_carrot']],['Crystal Apple',['crystal_apple']],['Spore Bread',['spore_bread']],['Magma Jerky',['magma_jerky']],['Venison Stew',['venison_stew']],['Pumpkin Pie',['pumpkin_pie']],['Bread',['bread']]);
  T('Armour').push(['Leather Armour',['leather_helmet','leather_chestplate','leather_leggings','leather_boots']]);
  T('Materials').push(['Bone Meal',['bone_meal']],['Dyes',['red_dye','yellow_dye','blue_dye','black_dye','brown_dye','pink_dye','cyan_dye','purple_dye','lime_dye','light_blue_dye','magenta_dye','gray_dye','light_gray_dye','orange_dye']],['String to Wool',['b71']]);
  T('Decoration').push(['Coloured Wool',Object.values(DYE_TO_WOOL)],["Jack o'Lantern",[b('JACK')]],['Lamps and Lanterns',[b('LAMP'),b('SEA_LANTERN'),b('SAKURA_LANTERN'),b('GLOW_LAMP'),b('MYTHRIL_LANTERN')]],
    ['Jukebox',[b('JUKEBOX')]],['Note Block',[b('NOTEBLOCK')]]);}
