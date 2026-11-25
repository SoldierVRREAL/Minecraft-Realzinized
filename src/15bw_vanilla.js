// ================= Recipes, fuel and smelting for the vanilla blocks and items =================
{const NEWP=['BIRCH','ACACIA','DARK_OAK'].map(k=>'b'+B[k+'_PLANKS']);PLANKS.push(...NEWP);
  for(const k of ['BIRCH','ACACIA','DARK_OAK']){shapeless(['b'+B[k+'_LOG']],'b'+B[k+'_PLANKS'],4);FUEL['b'+B[k+'_LOG']]=15;FUEL['b'+B[k+'_PLANKS']]=15;SMELT['b'+B[k+'_LOG']]='coal';}
  const WOOLS=['b12','b71'].concat(MB_WOOLS.map(w=>'b'+B['WOOL_'+w[0].toUpperCase()]));
  shaped(['WWW','PPP'],{W:WOOLS,P:PLANKS},'b'+B.BED);
  shapeless(['blaze_rod'],'blaze_powder',2);shapeless(['ender_pearl','blaze_powder'],'ender_eye');
  shaped(['GG','GG'],{G:'glowstone_dust'},'b17');shaped(['QQ','QQ'],{Q:'nether_quartz'},'b57');
  shaped(['GGG','GGG','GGG'],{G:'gold_nugget'},'gold_ingot');shapeless(['gold_ingot'],'gold_nugget',9);
  shaped(['NNN','NNN'],{N:'b'+B.NETHER_BRICK},'b'+B.NB_FENCE,6);
  shapeless(['b'+B.REEDS],'b'+B.REEDS);
  FUEL.blaze_rod=120;FUEL.lava_bucket=1000;
  SMELT['b'+B.CACTUS]='green_dye';SMELT['b'+B.RED_SAND]='b11';SMELT['b'+B.QUARTZ_ORE]='nether_quartz';SMELT.b27='b'+B.NETHER_BRICK;}
