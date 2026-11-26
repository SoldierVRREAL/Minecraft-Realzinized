// mining the redstone pieces (turned and powered states copy these in 15r)
{const T=MINE_T_X;for(const k of ['STONE_BUTTON','PLATE_STONE'])if(B[k]!=null){T[B[k]]=.5;PICK_BLOCKS.add(B[k]);}
  for(const k of ['WOOD_BUTTON','PLATE_WOOD'])if(B[k]!=null){T[B[k]]=.5;AXE_BLOCKS.add(B[k]);}
  for(const k of ['PLATE_GOLD','PLATE_IRON'])if(B[k]!=null){T[B[k]]=.5;PICK_BLOCKS.add(B[k]);}
  for(const k of ['n','s'])for(const h of RS.head[k])MINE_DROP[h]=null;
  T[B.COMMAND_BLOCK]=undefined;MINE_DROP[B.COMMAND_BLOCK]=null;}
