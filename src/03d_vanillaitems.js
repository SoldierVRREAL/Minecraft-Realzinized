// ================= Items for the full game: Nether and End progression, buckets of water and lava =================
item('ender_pearl',{name:'Ender Pearl',type:'mat',stack:16,color:'#1a7a6a',tex:'item/ender_pearl',pearl:true,tip:['Right click to throw it: you teleport to where it lands']});
item('ender_eye',{name:'Eye of Ender',type:'mat',stack:64,color:'#3aa080',tex:'item/ender_eye',tip:['Right click to throw it: it flies toward the nearest stronghold','Put twelve in the End Portal Frames to open the way to the End']});
mat('blaze_rod','Blaze Rod','#f0b020','blaze_rod',{tip:['Dropped by Blazes in Nether Fortresses']});mat('blaze_powder','Blaze Powder','#f0a020','blaze_powder');
mat('nether_quartz','Nether Quartz','#e8e0d8','quartz');mat('glowstone_dust','Glowstone Dust','#f0d070','glowstone_dust');mat('ghast_tear','Ghast Tear','#e0f0f0','ghast_tear');
mat('gold_nugget','Gold Nugget','#f0d040','gold_nugget');
item('nether_wart_item',{name:'Nether Wart',type:'mat',stack:64,color:'#a02020',tex:'item/nether_wart',tip:['Plant it on Soul Sand']});
gad('water_bucket','Water Bucket','#3f6fe0','Right click to pour out the water',0,'bucket_water');
gad('lava_bucket','Lava Bucket','#e8701a','Right click to pour out the lava',0,'bucket_lava');
ITEMS.bucket.tip=['Right click water or lava to fill it, or a cow to milk it'];
ITEMS.flint_and_steel.tip=['Light a Nether Portal frame of obsidian, set fires, or light TNT'];
// mining: how long, with what, and what drops
for(const [b,d] of MINE_DROP_LATE)MINE_DROP[b]=d;
{const T=MINE_T_X,P=PICK_BLOCKS,A=AXE_BLOCKS,S=SHOVEL_BLOCKS;
  for(const k of ['BIRCH','ACACIA','DARK_OAK']){T[B[k+'_LOG']]=1.4;T[B[k+'_PLANKS']]=1.4;T[B[k+'_LEAVES']]=.25;A.add(B[k+'_LOG']);A.add(B[k+'_PLANKS']);MINE_DROP[B[k+'_LEAVES']]=null;}
  T[B.SPRUCE_LEAVES]=.25;MINE_DROP[B.SPRUCE_LEAVES]=null;
  T[B.CACTUS]=.6;T[B.REEDS]=.05;T[B.MUSH_RED]=.05;T[B.MUSH_BROWN]=.05;
  for(const k of ['ALLIUM','BLUE_ORCHID','AZURE','OXEYE','TULIP_RED','TULIP_ORANGE','TULIP_WHITE','TULIP_PINK'])T[B[k]]=.05;
  for(const k of ['TALLGRASS2','LARGE_FERN','LILAC','ROSE_BUSH','PEONY']){T[B[k]]=.05;T[B[k+'_TOP']]=.05;MINE_DROP[B[k+'_TOP']]=k==='TALLGRASS2'||k==='LARGE_FERN'?null:'b'+B[k];if(k==='TALLGRASS2'||k==='LARGE_FERN')MINE_DROP[B[k]]=null;}
  T[B.COARSE_DIRT]=.5;S.add(B.COARSE_DIRT);T[B.RED_SAND]=.5;S.add(B.RED_SAND);T[B.MYCELIUM]=.6;S.add(B.MYCELIUM);MINE_DROP[B.MYCELIUM]='b2';
  T[B.QUARTZ_ORE]=3;P.add(B.QUARTZ_ORE);PICK_LEVEL[B.QUARTZ_ORE]=0;MINE_DROP[B.QUARTZ_ORE]='nether_quartz';
  T[B.NETHER_WART]=.05;MINE_DROP[B.NETHER_WART]='nether_wart_item';
  T[B.NB_FENCE]=2;P.add(B.NB_FENCE);
  T[B.SPAWNER]=5;P.add(B.SPAWNER);MINE_DROP[B.SPAWNER]=null;
  T[B.FIRE]=.05;MINE_DROP[B.FIRE]=null;MINE_DROP[B.PORTAL_X]=null;MINE_DROP[B.PORTAL_Z]=null;MINE_DROP[B.END_PORTAL]=null;MINE_DROP[B.END_FRAME_EYE]='b'+B.END_FRAME;
  T[B.DRAGON_EGG]=3;
  for(const b of VB.bed){T[b]=.3;MINE_DROP[b]='b'+B.BED;AXE_BLOCKS.add(b);}
  // the Nether's own blocks: netherrack breaks fast, soul sand with a shovel, glowstone by hand
  T[B.NETHERRACK]=.6;S.add(B.SOUL);if(T[B.SOUL]==null)T[B.SOUL]=.6;
  for(const b of [B.END_STONE,B.NETHER_BRICK])P.add(b);if(T[B.END_STONE]==null)T[B.END_STONE]=4.5;}
