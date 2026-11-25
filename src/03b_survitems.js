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
// ---------- new materials, tools and armour ----------
for(const [id,n,c] of [['iron_ingot','Iron Ingot','#d8d8d8'],['gold_ingot','Gold Ingot','#f5d43a'],['cobalt_ingot','Cobalt Ingot','#3a72c0'],['mythril_ingot','Mythril Ingot','#b8f8e8']])
  item(id,{name:n,type:'mat',stack:64,color:c,ingot:true,tex:id==='iron_ingot'||id==='gold_ingot'?'item/'+id:undefined});
// new tool tiers, each with a special ability (see 15b_craft.js)
const NEW_TIERS=[['ruby','Ruby','#e02030',3,'Fire: swords set targets alight, pickaxes smelt what they mine'],
  ['amethyst','Amethyst Steel','#9a4ae0',4,'Lifesteal: hits heal you; pickaxes and shovels dig 3x3'],
  ['mythril','Mythril','#b8f8e8',3,'Vein: pickaxes mine whole ore veins, axes fell whole trees']];
NEW_TIERS.forEach(([k,N,c,lv,tip])=>{
  item(k+'_sword',{name:N+' Sword',type:'weapon',tool:'sword',dmg:5+lv,color:c,tip:[tip]});
  item(k+'_axe',{name:N+' Axe',type:'weapon',tool:'axe',dmg:4+lv,color:c,tip:[tip]});
  item(k+'_pickaxe',{name:N+' Pickaxe',type:'weapon',tool:'pickaxe',dmg:3+lv,color:c,tip:[tip]});});
// shovels for every tier
[['wood','Wooden','wooden','#9a7440',0],['golden','Golden','golden','#f2d33a',0],['stone','Stone','stone','#8d8d8d',1],['iron','Iron','iron','#e8e8e8',2],['diamond','Diamond','diamond','#4ee6d8',3],
 ['ruby','Ruby',null,'#e02030',3],['amethyst','Amethyst Steel',null,'#9a4ae0',4],['mythril','Mythril',null,'#b8f8e8',3]].forEach(([k,N,p,c,lv])=>
  item(k+'_shovel',{name:N+' Shovel',type:'weapon',tool:'shovel',dmg:2+lv,color:c,tex:p?'item/'+p+'_shovel':undefined,tip:ITEMS[k+'_sword']&&ITEMS[k+'_sword'].tip}));
// cobalt armour: between iron and diamond, full set = no knockback and half fall damage
ARMOR_TIERS.push(['cobalt','Cobalt','#3a72c0','cobalt']);const COBALT_TIER=ARMOR_TIERS.length-1;
ARMOR_SLOTS.forEach(([s,SN],si)=>item('cobalt_'+s,{name:'Cobalt '+SN,type:'armor',slot:si,pts:[3,7,5,3][si],color:'#3a72c0',tier:COBALT_TIER,mat:'cobalt',tip:['Full set: no knockback, half fall damage']}));
// enchanted versions of the new gear (made with sapphires), plus Efficiency for every pickaxe and shovel
ENCH_NAMES.efficiency='Efficiency';ENCH_PRESETS.dig=[[['efficiency',1]],[['efficiency',2]],[['efficiency',3]]];
for(const k of Object.keys(ITEMS)){const it=ITEMS[k];if(it.base)continue;const isNew=NEW_TIERS.some(t=>k.startsWith(t[0]+'_'))||k.startsWith('cobalt_');
  let set=null;if(it.tool==='pickaxe'||it.tool==='shovel')set=ENCH_PRESETS.dig;else if(isNew&&(it.tool==='sword'||it.tool==='axe'))set=ENCH_PRESETS.melee.slice(0,3);else if(isNew&&it.type==='armor')set=ENCH_PRESETS.armor;
  if(set)for(const pr of set){const eid=enchId(k,enchKey(pr));if(!ITEMS[eid])ITEMS[eid]=Object.assign({},it,{base:k,ench:Object.fromEntries(pr)});}}
// tool durability in Survival (uses before it breaks)
const DURABILITY={wood:59,golden:32,stone:131,iron:250,diamond:1561,ruby:1100,amethyst:2400,mythril:2000};
const toolTier=id=>{const it=id&&ITEMS[id];if(!it||it.type!=='weapon')return null;return (it.base||id).split('_')[0];};
let maxDur=id=>DURABILITY[toolTier(id)]||0;
Object.assign(MINE_T_X,{8:1.5,117:1.4,118:2.5,119:3,120:3,121:3,122:3.5,123:3.5});
for(const b of [118,119,120,121,122,123])PICK_BLOCKS.add(b);AXE_BLOCKS.add(117);
const SHOVEL_BLOCKS=new Set([1,2,7,13,35,82,85,89,90,94,99,100]);
// seconds to break block b holding item id (hand = 1x, the right tool is much faster; ores need a good enough pickaxe to drop anything)
const TOOL_SPEED={wood:2,golden:12,stone:4,iron:6,diamond:8,ruby:8,amethyst:10,mythril:13},TOOL_LEVEL={wood:0,golden:0,stone:1,iron:2,diamond:3,ruby:3,amethyst:4,mythril:4};
function mineTime(b,id){let t=MINE_T[b]!=null?MINE_T[b]:MINE_T_X[b];if(t==null||b===B.BEDROCK||b===B.BARRIER||b===B.BEACON)return null;
  const it=id&&ITEMS[id],tier=toolTier(id)||'';const sp=(TOOL_SPEED[tier]||2)*(1+.35*enchLvl(id,'efficiency'));
  if(it&&it.tool==='pickaxe'&&PICK_BLOCKS.has(b))t/=sp;
  else if(it&&it.tool==='axe'&&AXE_BLOCKS.has(b))t/=sp;
  else if(it&&it.tool==='shovel'&&SHOVEL_BLOCKS.has(b))t/=sp;
  else if(PICK_BLOCKS.has(b))t*=2.5;   // stone by hand is slow
  return Math.max(.05,t);}
function mineDrops(b,id){if(PICK_BLOCKS.has(b)&&b!==B.GLASS){const it=id&&ITEMS[id];if(!it||it.tool!=='pickaxe')return null;const need=PICK_LEVEL[b];if(need!=null&&(TOOL_LEVEL[toolTier(id)]||0)<need)return null;}
  return MINE_DROP[b]!==undefined?MINE_DROP[b]:'b'+b;}
// ---------- unique tools (gadgets): right click to use; uses = how many times before it breaks (0 = never) ----------
const GADGETS=[['grapple','Grappling Hook','#8a6a3a','Shoot a hook and get pulled to where it lands',120],
  ['builder_wand',"Builder's Wand",'#e8c040','Right click a block face to extend that surface by up to 9 blocks from your inventory',300],
  ['magnet','Item Magnet','#d03030','Hold it: dropped items within 10 blocks fly to you',0],
  ['spyglass','Spyglass','#c8a040','Hold right click to zoom in',0],
  ['compass','Compass','#c0c0c0','Hold it: points the way back to spawn',0],
  ['clock','Clock','#f0c830','Hold it: shows the day and the time',0],
  ['blink_staff','Blink Staff','#9a4ae0','Teleport up to 12 blocks where you look',80],
  ['fire_staff','Fire Staff','#e04010','Shoot a fire bolt that burns whatever it hits',80],
  ['frost_wand','Frost Wand','#80c8ff','Freeze water into ice and lava into obsidian around where you look',80],
  ['sakura_staff','Sakura Staff','#f5a8cf','Heal 3 hearts and get Regeneration (20 second cooldown)',40],
  ['ore_scanner','Ore Scanner','#3060ff','Show every ore within 16 blocks through walls for 15 seconds',40],
  ['glider','Mythril Glider','#b8f8e8','Hold it and keep holding jump while falling to glide',0]];
for(const [id,n,c,tip,uses] of GADGETS)item(id,{name:n,type:'gadget',color:c,tip:[tip],uses,tex:id==='compass'||id==='clock'?'item/'+id:undefined});
// new foods
item('sakura_mochi',{name:'Sakura Mochi',type:'food',food:6,sat:7,stack:64,color:'#f5a8cf'});
item('glow_stew',{name:'Glow Stew',type:'food',food:8,sat:10,stack:16,color:'#70c8ff',fx:[['regen',10,0]]});
item('crystal_candy',{name:'Crystal Candy',type:'food',food:3,sat:2,stack:64,color:'#6ab4ff',fx:[['speed',30,0]]});
ITEMS.ruby.tex='item/ruby';
{const md=maxDur;maxDur=id=>{const it=id&&ITEMS[id];if(it&&it.type==='gadget')return it.uses||0;if(id==='shield')return 336;return md(id);};}
