// ================= Minecraft:realzanized items: ore drops, mining speeds =================
// how long each block takes by hand (seconds); tools speed it up (see mineTime)
const MINE_T_X=Object.assign({},{23:3,24:4,25:4,26:12,27:.6,29:1,30:.05,31:.05,32:.05,33:.7,36:2,41:2,46:1.4,50:1.4,51:1.4,52:1.4,53:1.4,54:.05,57:1.6,58:.25,59:3,60:2.4,61:1.2,62:1.2,63:3,64:1.4,71:.9,76:.1,77:.05,
  78:1.4,79:.25,80:1.4,81:.05,82:.6,83:2.2,84:3.2,85:.6,86:1.8,87:.25,88:1.4,89:.6,90:.5,91:2,92:1.2,93:1.4,94:.6,95:.4,96:.6,97:.05,98:.05,99:.4,100:.6,101:1.2,102:1.4,103:.25,
  104:3.5,105:3.5,106:3.5,107:4.5,108:4.5,109:3,110:3,111:3,112:3.5,114:.05,115:.05,116:.05});
// what pickaxes / axes are good for
const PICK_BLOCKS=new Set([3,9,10,14,17,19,20,21,22,23,24,25,26,27,29,33,57,59,60,61,62,63,83,84,91,93,101,104,105,106,107,108,109,110,111,112]);
const AXE_BLOCKS=new Set([4,6,8,46,50,51,52,53,64,78,80,86,88,92,96,102]);
// minimum pickaxe level for ores (0 wood/gold, 1 stone, 2 iron, 3 diamond)
const PICK_LEVEL={26:3,109:0,110:1,111:2,112:2,104:2,105:2,106:1,107:3,108:3,84:1,83:1};
// gems and raw metals that ores drop
item('coal',{name:'Coal',type:'mat',stack:64,color:'#2a2a2a',tex:'item/coal'});
item('raw_iron',{name:'Raw Iron',type:'mat',stack:64,color:'#d8a888',tex:'item/raw_iron'});
item('raw_gold',{name:'Raw Gold',type:'mat',stack:64,color:'#f5d43a',tex:'item/raw_gold'});
item('diamond',{name:'Diamond',type:'mat',stack:64,color:'#5fe3d6',tex:'item/diamond'});
item('ruby',{name:'Ruby',type:'mat',stack:64,color:'#e02030',gem:true});
item('sapphire',{name:'Sapphire',type:'mat',stack:64,color:'#3060ff',gem:true});
item('raw_cobalt',{name:'Raw Cobalt',type:'mat',stack:64,color:'#2a5aa0'});
item('raw_mythril',{name:'Raw Mythril',type:'mat',stack:64,color:'#b8f8e8'});
item('amethyst_steel',{name:'Amethyst Steel Shard',type:'mat',stack:64,color:'#9a4ae0',gem:true});
item('crystal_shard',{name:'Crystal Shard',type:'mat',stack:64,color:'#6ab4ff',gem:true});
item('stick',{name:'Stick',type:'mat',stack:64,color:'#8a6a3a',tex:'item/stick'});
Object.assign(MINE_DROP,{23:'b23',24:'b24',25:'b25',26:'b26',27:'b27',30:null,31:'b31',32:'b32',33:null,46:'b46',50:'b50',51:'b51',52:'b52',53:'b53',54:'b54',57:'b57',58:null,59:'b59',60:'b60',61:'b61',62:'b62',63:'b63',64:'b64',71:'b71',
  78:'b78',79:null,80:'b80',81:'b81',82:'b2',83:'crystal_shard',84:'crystal_shard',85:'b2',86:'b86',87:null,88:'b88',89:'b2',90:'b90',91:'b91',92:'b92',93:'b93',94:'b2',95:'b95',96:'b96',
  97:'b97',98:'b98',99:'b99',100:'b2',101:'b101',102:'b102',103:null,104:'ruby',105:'sapphire',106:'raw_cobalt',107:'raw_mythril',108:'amethyst_steel',109:'coal',110:'raw_iron',111:'raw_gold',112:'diamond',
  114:'stick',115:null,116:'crystal_shard',3:'b9',41:'b41'});
// seconds to break block b holding item id (hand = 1x, the right tool is much faster; ores need a good enough pickaxe to drop anything)
const TOOL_SPEED={wood:2,golden:12,stone:4,iron:6,diamond:8},TOOL_LEVEL={wood:0,golden:0,stone:1,iron:2,diamond:3};
function mineTime(b,id){let t=MINE_T[b]!=null?MINE_T[b]:MINE_T_X[b];if(t==null||b===B.BEDROCK||b===B.BARRIER||b===B.BEACON||b===B.CHEST)return null;
  const it=id&&ITEMS[id],tier=id?id.split('_')[0]:'';
  if(it&&it.tool==='pickaxe'&&PICK_BLOCKS.has(b))t/=TOOL_SPEED[tier]||2;
  else if(it&&it.tool==='axe'&&AXE_BLOCKS.has(b))t/=TOOL_SPEED[tier]||2;
  else if(PICK_BLOCKS.has(b))t*=2.5;   // stone by hand is slow
  return Math.max(.05,t);}
function mineDrops(b,id){if(PICK_BLOCKS.has(b)&&b!==B.GLASS){const it=id&&ITEMS[id];if(!it||it.tool!=='pickaxe')return null;const need=PICK_LEVEL[b];if(need!=null&&(TOOL_LEVEL[id.split('_')[0]]||0)<need)return null;}
  return MINE_DROP[b]!==undefined?MINE_DROP[b]:'b'+b;}
