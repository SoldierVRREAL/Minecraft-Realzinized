// ================= Minecraft:realzanized blocks: the six new overworld biomes, new ores, survival basics =================
Object.assign(B,{SAKURA_LOG:78,SAKURA_LEAVES:79,SAKURA_PLANKS:80,PETALS:81,SAKURA_GRASS:82,CRYSTAL:83,CRYSTAL_ORE:84,CRYSTAL_GRASS:85,
  REDWOOD_LOG:86,REDWOOD_LEAVES:87,REDWOOD_PLANKS:88,PODZOL:89,ASH:90,BASALT:91,BURNT_LOG:92,MAGMA:93,GLOW_MOSS:94,GLOW_CAP:95,MUSH_STEM:96,
  GLOW_PLANT:97,GLOW_SHROOM:98,SNOW:99,SNOW_GRASS:100,PACKED_ICE:101,FROZEN_LOG:102,FROZEN_LEAVES:103,RUBY_ORE:104,SAPPHIRE_ORE:105,
  COBALT_ORE:106,MYTHRIL_ORE:107,AMETHYST_ORE:108,COAL_ORE:109,IRON_ORE:110,GOLD_ORE:111,DIAMOND_ORE:112,BEDROCK:113,DEAD_BUSH:114,FERN:115,CRYSTAL_CLUSTER:116});
// atlas tiles 62.. (names starting with ~ are ours; the rest are looked up in a resource pack first)
TILE_PACK.push('cherry_log','cherry_log_top','cherry_leaves','cherry_planks','pink_petals','~sakura_grass','~crystal','~crystal_ore','~crystal_grass_top','~crystal_grass_side',
  '~redwood_log','~redwood_log_top','~redwood_leaves','~redwood_planks','podzol_top','podzol_side','~ash','basalt_side','basalt_top','~burnt_log','magma',
  '~glow_moss_top','~glow_moss_side','~glow_cap','mushroom_stem','~glow_plant','~glow_shroom','snow','grass_block_snow','packed_ice','~frozen_log','~frozen_leaves',
  '~ruby_ore','~sapphire_ore','~cobalt_ore','~mythril_ore','~amethyst_steel_ore','coal_ore','iron_ore','gold_ore','diamond_ore','bedrock','dead_bush','~fern','~crystal_cluster','~frozen_log_top','~burnt_log_top');
// tile:  62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108
def(78,63,62,63);def(79,64,64,64,{opaque:false,light:6,leaves:true,glow:.8});def(80,65,65,65);def(81,66,66,66,{solid:false,opaque:false,cross:true});
def(82,67,1,2);def(83,68,68,68,{light:11});def(84,69,69,69,{light:5,glow:.6});def(85,70,71,2);
def(86,73,72,73);def(87,74,74,74,{opaque:false,leaves:true});def(88,75,75,75);def(89,76,77,2);
def(90,78,78,78);def(91,80,79,80);def(92,108,81,108);def(93,82,82,82,{light:7,hot:true});
def(94,83,84,2,{light:4});def(95,85,85,85,{light:13});def(96,86,86,86);def(97,87,87,87,{solid:false,opaque:false,cross:true,light:10});def(98,88,88,88,{solid:false,opaque:false,cross:true,light:9});
def(99,89,89,89);def(100,89,90,2);def(101,91,91,91);def(102,107,92,107);def(103,93,93,93,{opaque:false,leaves:true});
for(let i=0;i<9;i++)def(104+i,94+i,94+i,94+i,i===3?{light:4}:{});
def(113,103,103,103);def(114,104,104,104,{solid:false,opaque:false,cross:true});def(115,105,105,105,{solid:false,opaque:false,cross:true});def(116,106,106,106,{solid:false,opaque:false,cross:true,light:8});
BD[B.LEAVES].leaves=true;BD[B.JLEAVES].leaves=true;
Object.assign(BLOCK_NAMES,{78:'Sakura Log',79:'Sakura Leaves',80:'Sakura Planks',81:'Sakura Petals',82:'Sakura Grass',83:'Blue Crystal',84:'Crystal Ore',85:'Crystal Grass',
  86:'Redwood Log',87:'Redwood Leaves',88:'Redwood Planks',89:'Podzol',90:'Ash',91:'Basalt',92:'Burnt Log',93:'Magma Block',94:'Glow Moss',95:'Glowing Mushroom Cap',96:'Mushroom Stem',
  97:'Glowing Plant',98:'Glow Shroom',99:'Snow Block',100:'Snowy Grass',101:'Packed Ice',102:'Frozen Log',103:'Frozen Leaves',104:'Ruby Ore',105:'Sapphire Ore',106:'Cobalt Ore',
  107:'Mythril Ore',108:'Amethyst Steel Ore',109:'Coal Ore',110:'Iron Ore',111:'Gold Ore',112:'Diamond Ore',113:'Bedrock',114:'Dead Bush',115:'Fern',116:'Crystal Cluster',33:'Ice',15:'Water',16:'Lava'});
Object.assign(BLOCK_COL,{78:'#4a2c2e',79:'#f5a8cf',80:'#e4aaa9',81:'#f5a8cf',82:'#7bb04a',83:'#3f8cf0',84:'#6f8faa',85:'#40b4c4',86:'#82381f',87:'#2f6828',88:'#ae5434',89:'#6a4622',
  90:'#74727a',91:'#3a3a42',92:'#2a221c',93:'#c8460c',94:'#5a3e9a',95:'#4a9af0',96:'#d6d0c2',97:'#70e0ff',98:'#9a70ff',99:'#f2f6fa',100:'#e6ecf2',101:'#8ab2ea',102:'#7a8a9c',103:'#c8e6f4',
  104:'#c02030',105:'#3050e8',106:'#2a5aa0',107:'#b8f8e8',108:'#9a4ae0',109:'#3a3a3a',110:'#c8a080',111:'#f0c830',112:'#5fe3d6',113:'#3a3a3a',114:'#8a6a3a',115:'#4a8a2a',116:'#6ab4ff',33:'#a8c8f8'});
// ---- procedural 16x16 art for the new tiles ----
Object.assign(P,{cbark:PAL('3a2224 4a2c2e 5c3638 6e4244'),cring:PAL('c88490 d898a4 e6b0b8'),sak:PAL('d86a9e e87fb0 f093c0 f5a8cf fbbfe0 ffd6ec'),cplank:PAL('b87a7e c9898c d89a9c e4aaa9 eebcb8'),
  cry:PAL('123a88 1a4fa8 2a6ad0 3f8cf0 6ab4ff a8dcff e0f6ff'),cgr:PAL('248090 2a8a9a 34a0b0 40b4c4 58c8d8'),rbark:PAL('4a1c10 5a2416 6e2e1a 82381f 943f22 a64a28'),rring:PAL('a05038 b06040 c47452 d48a64'),
  rleaf:PAL('1a3e18 1f4a1c 285a22 316a2a 3c7a32'),rplank:PAL('7a3220 8a3a24 9c462c ae5434 bc6040'),pod:PAL('3e2812 4a3018 5a3a1c 6a4622 7a5228'),ash:PAL('4e4c50 58565a 66646a 74727a 828088 908e96'),
  bas:PAL('222228 2a2a30 34343a 3e3e46 4a4a52'),burnt:PAL('141010 1c1612 26201a 302820 3a3026'),mag:PAL('4a1406 5a1a08 8a2a0a c8460c f07818 ffb040'),gm:PAL('2e2048 3a2a5a 4a347a 5a3e9a 6a4aba'),
  cap:PAL('1e48b0 2a5ac8 3a7ae0 4a9af0 70c0ff b0e8ff'),stem:PAL('b8b0a0 c8c0b0 d6d0c2 e2dccf'),snow:PAL('dde4ec e6ecf2 eef2f8 f6f9fc ffffff'),pice:PAL('6a96d6 7aa4e0 8ab2ea 9ac0f2 aaccf8'),
  fbark:PAL('4a5a6a 5a6a7a 6a7a8c 7a8a9c 9aaabc'),fleaf:PAL('8cb8d4 a0c8e0 b4d8ec c8e6f4 dcf2fc'),bed:PAL('141414 2a2a2a 3e3e3e 565656 787878')});
const ORE_COL={94:PAL('8a0c18 c01828 e02838 ff7080'),95:PAL('14208a 2a46d0 4a70ff 9ac0ff'),96:PAL('14305a 22508a 3a72c0 6aa0e8'),97:PAL('70c8b8 a8f0e0 d8fff6 ffffff'),98:PAL('4a1a80 7a34c0 a860f0 d4a8ff'),
  99:PAL('101010 1c1c1c 2a2a2a 3a3a3a'),100:PAL('9a6a4a c0906a d8a888 ecc4a8'),101:PAL('c09010 e0b020 f5d43a fff080'),102:PAL('1c9e96 2fbdb4 5fe3d6 c8fff8')};
function oreTile(t,x,y,base){const h=hash2;let best=9;for(let i=0;i<6;i++){const cx=2+h(i,t,201)*12,cy=2+h(i,t,202)*12;const d=Math.hypot(x+.5-cx,(y+.5-cy)*1.2)-(.9+h(i,t,203)*1.4);if(d<best)best=d;}
  if(best<0){const pal=ORE_COL[t];return pk(pal,best<-1?.65+h(x,y,204)*.35:.15+h(x,y,205)*.5);}return base;}
function logSide(pal,x,y,s){const col=Math.floor(x+hash2(Math.floor(y/5),x>>2,s)*2);return pk(pal,(x%3==0?.08:.45)+hash2(col,Math.floor(y/(3+hash2(col,0,s+1)*5)),s+2)*.55);}
function logTop(bark,ring,x,y,s){if(x==0||y==0||x==15||y==15)return pk(bark,hash2(x,y,s)*.8);const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5));return pk(ring,((d|0)%2?.15:.75)+hash2(x,y,s+1)*.25);}
function leafTile(pal,x,y,s,hole){const v=cl(x,y,s,2);if(hash2(x,y,s+1)<hole&&v<.55)return [0,0,0,0];return pk(pal,v);}
function plankTile(pal,x,y,s){const row=y>>2;if(y%4==3)return pk(pal,0);if((x+(row*5))%16==0)return pk(pal,.15);return pk(pal,.35+cl(x*3,row,s,4)*.65);}
function grassSide(top,x,y,s){const fr=3+(hash2(x,0,s)<.5?1:0)+(hash2(x,1,s)<.25?1:0);if(y<fr)return pk(top,cl(x,y,s+1,3));return pk(P.dirt,cl(x,y,4,3));}
function crossPlant(x,y,stemCol,s,heads){for(const [bx,top] of heads){const lean=Math.round((y-15)*.12*((bx%2)?1:-1));if(x===bx+lean&&y>=top)return stemCol(y);}return [0,0,0,0];}
function procTileX(t,x,y){const h=hash2;const stone=pk(P.stone,cl(x,y,6,2.5));
  switch(t){
  case 62:return logSide(P.cbark,x,y,210);
  case 63:return logTop(P.cbark,P.cring,x,y,212);
  case 64:{const v=cl(x,y,214,2);if(h(x,y,215)<.16&&v<.5)return [0,0,0,0];const p=pk(P.sak,v);return h(x,y,216)<.05?[255,240,250]:p;}
  case 65:return plankTile(P.cplank,x,y,217);
  case 66:{const fl=[[3,4],[11,3],[7,10],[2,12],[13,11]];for(const [fx,fy] of fl){const d=Math.hypot(x-fx,y-fy);if(d<2.3)return d<.8?[250,220,120]:pk(P.sak,.4+h(x,y,218)*.5);}
      if(((x+y*3)%7===0)&&y>5&&h(x,y,219)<.5)return [70,130,40];return [0,0,0,0];}
  case 67:{if(h(x>>1,y>>1,220)<.22)return pk(P.sak,.3+h(x,y,221)*.6);return pk(P.grass,cl(x,y,1,3));}
  case 68:{const f=Math.abs(((x*1.6+y)%9)-4.5);const edge=x==0||y==0||x==15||y==15;return pk(P.cry,edge?.25:.35+f/9*.5+h(x,y,222)*.2+((x-y+16)%11==0?.3:0));}
  case 69:{const g=Math.abs(((x+y*1.4)%8)-4);const d=Math.min(Math.hypot(x-4,y-5),Math.hypot(x-11,y-10),Math.hypot(x-12,y-3));if(d<2.2)return pk(P.cry,.5+(2.2-d)*.25-g*.02);return stone;}
  case 70:return pk(P.cgr,cl(x,y,223,3));
  case 71:return grassSide(P.cgr,x,y,224);
  case 72:{const col=Math.floor(x/3);const v=h(col,Math.floor(y/(2+h(col,1,225)*6)),226);const groove=x%3===0;return pk(P.rbark,groove?.05:.3+v*.7);}
  case 73:return logTop(P.rbark,P.rring,x,y,227);
  case 74:return leafTile(P.rleaf,x,y,229,.2);
  case 75:return plankTile(P.rplank,x,y,230);
  case 76:{const v=cl(x,y,231,2.2);if(h(x,y,232)<.1)return [40,90,30];return pk(P.pod,v);}
  case 77:{const fr=2+(h(x,0,233)<.5?1:0);if(y<fr)return pk(P.pod,cl(x,y,234,2));return pk(P.dirt,cl(x,y,4,3));}
  case 78:return pk(P.ash,cl(x,y,235,1.8)*.8+h(x,y,236)*.2);
  case 79:{const col=x>>2;return pk(P.bas,(x%4==0?.05:.4)+h(col,y>>1,237)*.5);}
  case 80:{const r=Math.hypot(x-7.5,y-7.5);return pk(P.bas,(r|0)%3==0?.1:.55+h(x,y,238)*.4);}
  case 81:{const v=logSide(P.burnt,x,y,239);return h(x,y,240)<.04?[120,40,10]:v;}
  case 82:{const c=cobbleAt(x,y,241);if(c.edge)return pk(P.mag,.75+h(x,y,242)*.25);return pk(P.mag,.05+h(c.id,1,243)*.3);}
  case 83:{if(h(x,y,244)<.07)return [120,240,255];return pk(P.gm,cl(x,y,245,2));}
  case 84:{const fr=3+(h(x,0,246)<.5?1:0);if(y<fr)return h(x,y,247)<.08?[120,240,255]:pk(P.gm,cl(x,y,245,2));return pk(P.dirt,cl(x,y,4,3));}
  case 85:{const sp=[[4,4],[11,6],[6,11],[13,13],[1,9]];for(const [sx,sy] of sp)if(Math.hypot(x-sx,y-sy)<1.6)return [225,250,255];return pk(P.cap,cl(x,y,248,2.5));}
  case 86:return pk(P.stem,(x%4==0?.1:.5)+h(x>>1,y,249)*.5);
  case 87:return crossPlant(x,y,yy=>yy<6?[150,250,255]:[40,150+yy*4,160],250,[[3,4],[7,2],[11,5],[13,8]]);
  case 88:{if(x>=7&&x<=8&&y>=8)return [210,200,230];const d=Math.hypot((x-7.5)*.8,y-6);if(d<4&&y<=8)return d<1.4?[230,200,255]:[150,100,250];return [0,0,0,0];}
  case 89:return pk(P.snow,cl(x,y,251,2)*.6+h(x,y,252)*.4);
  case 90:{const fr=3+(h(x,0,253)<.5?1:0)+(h(x,1,253)<.3?1:0);if(y<fr)return pk(P.snow,cl(x,y,251,2));return pk(P.dirt,cl(x,y,4,3));}
  case 91:{const c=cobbleAt(x,y,254);if(c.edge)return pk(P.pice,.15);return pk(P.pice,.4+h(c.id,2,255)*.5);}
  case 92:{const v=logSide(P.fbark,x,y,256);return h(x>>1,y>>2,257)<.25?pk(P.snow,.6):v;}
  case 93:{const v=cl(x,y,258,2);if(h(x,y,259)<.14&&v<.5)return [0,0,0,0];return h(x,y,260)<.06?[255,255,255]:pk(P.fleaf,v);}
  case 94:case 95:case 96:case 97:case 98:case 99:case 100:case 101:case 102:return oreTile(t,x,y,stone);
  case 103:return pk(P.bed,h(x>>1,y>>1,261)*.7+h(x,y,262)*.3);
  case 104:{const br=[[7,15,7,8],[7,9,3,5],[7,10,12,4],[4,6,2,3],[11,6,13,2]];for(const [x0,y0,x1,y1] of br){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const px=Math.round(x0+(x1-x0)*i/n),py=Math.round(y0+(y1-y0)*i/n);if(px===x&&py===y)return [140,100,50];}}return [0,0,0,0];}
  case 105:{const fr=[[4,15,2,5],[8,15,8,2],[12,15,14,4]];for(const [x0,y0,x1,y1] of fr){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const px=Math.round(x0+(x1-x0)*i/n),py=Math.round(y0+(y1-y0)*i/n);
      if(px===x&&py===y)return [50,110,30];if(Math.abs(px-x)===1&&py===y&&py<13&&(py%2===0))return [70,140,40];}}return [0,0,0,0];}
  case 106:{const sh=[[4,15,3,6],[8,15,9,3],[12,15,13,7]];for(const [x0,y0,x1,y1] of sh){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const px=Math.round(x0+(x1-x0)*i/n),py=Math.round(y0+(y1-y0)*i/n);if(Math.abs(px-x)<=(py>y0-3?1:0)&&py===y)return pk(P.cry,.3+i/n*.65);}}return [0,0,0,0];}
  case 107:return logTop(P.fbark,P.fleaf,x,y,263);
  case 108:return logTop(P.burnt,P.ash,x,y,264);
  }
  return [255,0,255];}
atlasCanvas=makeProcAtlas();
