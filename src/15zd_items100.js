// ---------- 100 more items: 50 from Minecraft that the game was missing, 50 new ones ----------
// Icons: most are made from the pack's own item pictures, recoloured (copper tools from iron ones, netherite from diamond, drinks from
// the water bottle...), so they keep the Minecraft look. The rest are drawn here on the same 16x16 pixel grid.
const NEWI=[];
function ni(id,o){item(id,o);NEWI.push(id);return ITEMS[id];}
const nfood=(id,name,f,s,col,o={})=>ni(id,Object.assign({name,type:'food',food:f,sat:s,color:col,stack:64},o));

// ---- new tool and armour tiers ----
Object.assign(DURABILITY,{copper:190,emerald:1300,netherite:2031});Object.assign(TOOL_SPEED,{copper:5,emerald:8,netherite:9});Object.assign(TOOL_LEVEL,{copper:1,emerald:3,netherite:4});
Object.assign(REPAIR_MAT,{copper:['copper_ingot'],emerald:['emerald'],netherite:['netherite_ingot']});
const NT_TIERS=[['copper','Copper','#c87533',1,'iron','gray'],['emerald','Emerald','#2fbf5f',3,'diamond','cyan'],['netherite','Netherite','#4a4048',4,'diamond','cyan']];
for(const [k,N,c,lv,src,sel] of NT_TIERS){
  ni(k+'_sword',{name:N+' Sword',type:'weapon',tool:'sword',dmg:5+lv,color:c,rc:{src:src+'_sword',col:c,sel}});
  ni(k+'_pickaxe',{name:N+' Pickaxe',type:'weapon',tool:'pickaxe',dmg:3+lv,color:c,rc:{src:src+'_pickaxe',col:c,sel}});
  ni(k+'_axe',{name:N+' Axe',type:'weapon',tool:'axe',dmg:4+lv,color:c,rc:{src:src+'_axe',col:c,sel}});
  ni(k+'_shovel',{name:N+' Shovel',type:'weapon',tool:'shovel',dmg:2+lv,color:c,rc:{src:src+'_shovel',col:c,sel}});
  ni(k+'_hoe',{name:N+' Hoe',type:'weapon',tool:'hoe',dmg:1,color:c,rc:{src:src+'_hoe',col:c,sel},tip:['Right click grass or dirt to till it into farmland']});}
ARMOR_TIERS.push(['copper','Copper','#c87533','copper'],['netherite','Netherite','#4a4048','netherite'],['turtle','Turtle','#3faa4a','turtle']);
const T_COPPER=ARMOR_TIERS.length-3,T_NETH=ARMOR_TIERS.length-2,T_TURTLE=ARMOR_TIERS.length-1;
ARMOR_SLOTS.forEach(([s,SN],si)=>{ni('copper_'+s,{name:'Copper '+SN,type:'armor',slot:si,pts:[2,4,3,1][si],color:'#c87533',tier:T_COPPER,mat:'copper',rc:{src:'iron_'+s,col:'#c87533',sel:'gray'}});
  ni('netherite_'+s,{name:'Netherite '+SN,type:'armor',slot:si,pts:[3,8,6,3][si],color:'#4a4048',tier:T_NETH,mat:'netherite',rc:{src:'diamond_'+s,col:'#4a4048',sel:'cyan'},tip:['The toughest armour there is']});});

// ---- materials (Minecraft) ----
ni('raw_copper',{name:'Raw Copper',type:'mat',stack:64,color:'#c87533',rc:{src:'raw_iron',col:'#c87533',sel:'all'}});
ni('copper_ingot',{name:'Copper Ingot',type:'mat',stack:64,color:'#d8844a',ingot:true,rc:{src:'iron_ingot',col:'#d8844a',sel:'gray'}});
ni('copper_nugget',{name:'Copper Nugget',type:'mat',stack:64,color:'#d8844a',rc:{src:'gold_nugget',col:'#d8844a',sel:'all'}});
ni('iron_nugget',{name:'Iron Nugget',type:'mat',stack:64,color:'#d8d8d8',rc:{src:'gold_nugget',col:'#cfcfcf',sel:'all'}});
ni('netherite_scrap',{name:'Netherite Scrap',type:'mat',stack:64,color:'#5a4038',rc:{src:'flint',col:'#6a4a3c',sel:'all'}});
ni('netherite_ingot',{name:'Netherite Ingot',type:'mat',stack:64,color:'#4a4048',ingot:true,rc:{src:'iron_ingot',col:'#4a4048',sel:'gray'}});
ni('amethyst_shard',{name:'Amethyst Shard',type:'mat',stack:64,color:'#a070e0',rc:{src:'emerald',col:'#a070e0',sel:'all'}});
ni('echo_shard',{name:'Echo Shard',type:'mat',stack:64,color:'#0f5a5a',rc:{src:'emerald',col:'#127070',sel:'all'},tip:['Dropped by skinwalkers']});
ni('nautilus_shell',{name:'Nautilus Shell',type:'mat',stack:64,color:'#e8dcc8',draw:'shell'});
ni('heart_of_the_sea',{name:'Heart of the Sea',type:'mat',stack:64,color:'#2a8ad8',rare:true,rc:{src:'ender_pearl',col:'#2a8ad8',sel:'all'}});
ni('turtle_scute',{name:'Turtle Scute',type:'mat',stack:64,color:'#3faa4a',draw:'scute'});
ni('turtle_helmet',{name:'Turtle Shell',type:'armor',slot:0,pts:2,color:'#3faa4a',tier:T_TURTLE,mat:'turtle',rc:{src:'iron_helmet',col:'#3faa4a',sel:'gray'},tip:['Breathe longer under water']});
ni('phantom_membrane',{name:'Phantom Membrane',type:'mat',stack:64,color:'#c8c8b8',rc:{src:'leather',col:'#bdbcb0',sel:'all'}});
ni('honeycomb',{name:'Honeycomb',type:'mat',stack:64,color:'#e8a020',draw:'comb'});
ni('goat_horn',{name:'Goat Horn',type:'gadget',stack:1,color:'#d8ccb0',draw:'horn',tip:['Right click to blow it']});
ni('popped_chorus_fruit',{name:'Popped Chorus Fruit',type:'mat',stack:64,color:'#d8a8e0',draw:'chorus2'});
ni('beetroot_seeds',{name:'Beetroot Seeds',type:'mat',stack:64,color:'#8a3030',rc:{src:'seeds_wheat',col:'#a04040',sel:'all'}});
ni('cocoa_beans',{name:'Cocoa Beans',type:'mat',stack:64,color:'#6a4020',tex:'item/dye_powder_brown',draw:'beans'});
// ---- food (Minecraft) ----
nfood('sweet_berries','Sweet Berries',2,.4,'#c0203a',{draw:'berries'});
nfood('glow_berries','Glow Berries',2,.4,'#f0b020',{draw:'gberries'});
nfood('beetroot','Beetroot',1,1.2,'#a02030',{draw:'beet'});
nfood('beetroot_soup','Beetroot Soup',6,7.2,'#a02030',{stack:1,bowl:true,rc:{src:'mushroom_stew',col:'#b02030',sel:'light'}});
nfood('chorus_fruit','Chorus Fruit',4,2.4,'#9a60a8',{draw:'chorus',tip:['Eating it teleports you a short way'],always:true});
nfood('suspicious_stew','Suspicious Stew',6,7.2,'#b08040',{stack:1,bowl:true,rc:{src:'mushroom_stew',col:'#c09048',sel:'light'},tip:['Gives a random effect'],always:true});
nfood('honey_bottle','Honey Bottle',6,1.2,'#f0a020',{stack:16,bottle:true,rc:{src:'potion_water',col:'#f0a020',sel:'sat'},tip:['Cures poison'],always:true});

// ---- food (new) ----
nfood('cheese','Cheese',4,2.4,'#f2c840',{draw:'cheese'});
nfood('pizza','Pizza',8,9,'#e8b040',{rc:{src:'pumpkin_pie',col:'#f0c050',sel:'sat',dots:'#c02020'}});
nfood('burger','Burger',9,12,'#b06a30',{draw:'burger'});
nfood('hot_dog','Hot Dog',7,8,'#d08040',{draw:'hotdog'});
nfood('fries','Fries',5,4,'#f0c840',{draw:'fries'});
nfood('sushi','Sushi',6,7,'#f0f0f0',{draw:'sushi'});
nfood('donut','Donut',5,3,'#f080b0',{draw:'donut'});
nfood('chocolate_bar','Chocolate Bar',4,2,'#5a3018',{draw:'choco',fx:[['speed',10,0]],always:true});
nfood('ice_cream','Ice Cream',4,2,'#f8e0f0',{draw:'icecream',fx:[['fireres',15,0]],always:true});
nfood('pancakes','Pancakes',7,8,'#e0a050',{draw:'pancakes'});
nfood('waffle','Waffle',6,6,'#d89a40',{draw:'waffle'});
nfood('popcorn','Popcorn',3,2,'#fff4c8',{stack:1,bowl:true,rc:{src:'mushroom_stew',col:'#fff0c0',sel:'light',dots:'#f0d070'}});
nfood('apple_pie','Apple Pie',8,7,'#e6c070',{rc:{src:'pumpkin_pie',col:'#e6c070',sel:'sat'}});
nfood('berry_pie','Berry Pie',8,7,'#8a2a5a',{rc:{src:'pumpkin_pie',col:'#9a2a5a',sel:'sat'}});
nfood('muffin','Muffin',5,5,'#c8884a',{draw:'muffin'});
nfood('candy_apple','Candy Apple',5,4,'#e01818',{draw:'candyapple',fx:[['speed',5,0]],always:true});
nfood('toast','Toast',6,6,'#b07a3a',{rc:{src:'bread',col:'#a86a2a',sel:'sat'}});
nfood('honey_toast','Honey Toast',7,8,'#d49a30',{rc:{src:'bread',col:'#e0a030',sel:'sat'}});
nfood('omelette','Omelette',7,8,'#f0d040',{draw:'omelette'});
nfood('sandwich','Sandwich',8,10,'#e0c080',{draw:'sandwich'});
nfood('salad','Salad',6,7,'#4caf3a',{stack:1,bowl:true,rc:{src:'mushroom_stew',col:'#4caf3a',sel:'light',dots:'#e03030'},fx:[['regen',5,0]],always:true});
nfood('fruit_salad','Fruit Salad',7,8,'#e05a7a',{stack:1,bowl:true,rc:{src:'mushroom_stew',col:'#f0c040',sel:'light',dots:'#d02050'},fx:[['regen',8,0]],always:true});
nfood('hot_cocoa','Hot Cocoa',4,4,'#6a3a1a',{stack:16,bottle:true,rc:{src:'potion_water',col:'#6a3a1a',sel:'sat'},fx:[['regen',10,0]],always:true});
nfood('apple_juice','Apple Juice',4,3,'#e8b030',{stack:16,bottle:true,rc:{src:'potion_water',col:'#e8b030',sel:'sat'}});
nfood('berry_smoothie','Berry Smoothie',5,5,'#c0306a',{stack:16,bottle:true,rc:{src:'potion_water',col:'#c0306a',sel:'sat'},fx:[['speed',20,0]],always:true});
nfood('energy_drink','Energy Drink',2,1,'#7fff3a',{stack:16,bottle:true,rc:{src:'potion_water',col:'#6af020',sel:'sat'},fx:[['speed',30,1],['strength',10,0]],always:true});
nfood('cotton_candy','Cotton Candy',2,1,'#f8a0d0',{draw:'cotton',fx:[['speed',5,0]],always:true});
nfood('trail_mix','Trail Mix',4,5,'#a07040',{rc:{src:'seeds_pumpkin',col:'#a07040',sel:'all',dots:'#c02030'}});
nfood('cookie_dough','Cookie Dough',3,2,'#e8c890',{rc:{src:'cookie',col:'#e8c890',sel:'sat'}});

// ---- crafting parts (new) ----
ni('flour',{name:'Flour',type:'mat',stack:64,color:'#f4f0e4',rc:{src:'sugar',col:'#f2eee2',sel:'all'}});
ni('rope',{name:'Rope',type:'mat',stack:64,color:'#a07a48',rc:{src:'string',col:'#a07a48',sel:'all'}});
ni('cloth',{name:'Cloth',type:'mat',stack:64,color:'#e8e4d8',rc:{src:'leather',col:'#e6e2d4',sel:'all'}});
ni('gear',{name:'Gear',type:'mat',stack:64,color:'#b8b8b8',draw:'gear'});
ni('battery',{name:'Battery',type:'mat',stack:64,color:'#d8844a',draw:'battery'});
ni('lens',{name:'Lens',type:'mat',stack:64,color:'#bfe8ff',draw:'lens'});
ni('steel_ingot',{name:'Steel Ingot',type:'mat',stack:64,color:'#8a96a8',ingot:true,rc:{src:'iron_ingot',col:'#8a96a8',sel:'gray'}});
ni('glue',{name:'Glue',type:'mat',stack:64,color:'#f0f0e8',rc:{src:'slime_ball',col:'#efefe6',sel:'all'}});
ni('iron_plate',{name:'Iron Plate',type:'mat',stack:64,color:'#d0d0d0',draw:'plate'});
ni('circuit',{name:'Circuit',type:'mat',stack:64,color:'#2a8a3a',draw:'circuit'});

// ---- gadgets (new) ----
const NG=(id,name,col,draw,tip,o={})=>ni(id,Object.assign({name,type:'gadget',stack:1,color:col,draw,tip:[tip]},o));
NG('magnet','Magnet','#d03030','magnet','Pulls dropped items to you while it is in your hotbar');
NG('grappling_hook','Grappling Hook','#9a9a9a','hook','Right click a block up to 28 blocks away to pull yourself to it');
NG('bandage','Bandage','#f0ece0','bandage','Right click to heal 3 hearts',{stack:16});
NG('med_kit','Med Kit','#e8e8e8','medkit','Right click to heal fully and cure poison',{stack:4});
NG('dynamite','Dynamite','#c02020','dynamite','Right click to throw. Explodes after 2 seconds',{stack:16});
NG('smoke_bomb','Smoke Bomb','#6a6a6a','smoke','Right click for a cloud of smoke and 8 seconds of invisibility',{stack:16});
NG('pocket_watch','Pocket Watch','#e0c040','watch','Hold it to see the time and the day');
NG('depth_meter','Depth Meter','#b0b0b0','depth','Hold it to see your height and the biome');
NG('feather_charm','Feather Charm','#f0e080','charm','No fall damage while it is in your inventory');
NG('recall_scroll','Recall Scroll','#e8d8a8','scroll','Right click and stand still for 3 seconds to go home (your bed, or spawn)',{stack:16});
ni('night_goggles',{name:'Night Vision Goggles',type:'armor',slot:0,pts:1,color:'#3a5a3a',tier:2,mat:'chainmail',draw:'goggles',tip:['See in the dark while you wear them']});
ni('scuba_mask',{name:'Scuba Mask',type:'armor',slot:0,pts:1,color:'#2a7ad8',tier:2,mat:'chainmail',draw:'scuba',tip:['Never run out of air while you wear it']});
ni('winged_boots',{name:'Winged Boots',type:'armor',slot:3,pts:1,color:'#f0f0f0',tier:1,mat:'gold',draw:'wboots',tip:['Run faster and take half fall damage']});

// ---------- icons ----------
const NRGB=h=>{const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];};
function nRecolor(src,col,sel,dots){const s=ICON_RAW[src]||(ITEMS[src]?procIcon(src):null);const c=mkCanvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;if(s)g.drawImage(s,0,0,32,32);
  const d=g.getImageData(0,0,32,32),D=d.data,T=NRGB(col);const px=[];let lo=1,hi=0;
  for(let i=0;i<D.length;i+=4){if(D[i+3]<20)continue;const r=D[i]/255,gg=D[i+1]/255,b=D[i+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2,dd=mx-mn,sat=dd<1e-6?0:dd/(1-Math.abs(2*l-1));
    let hue=0;if(dd>0)hue=(mx===r?((gg-b)/dd+6)%6:mx===gg?(b-r)/dd+2:(r-gg)/dd+4)*60;
    const ok=sel==='all'||(sel==='gray'&&sat<.25&&l>.15)||(sel==='cyan'&&hue>140&&hue<215&&sat>.12)||(sel==='sat'&&sat>.18&&l>.12)||(sel==='light'&&l>.42&&!(hue>15&&hue<45&&sat>.3&&l<.5));
    if(!ok)continue;px.push([i,l]);lo=Math.min(lo,l);hi=Math.max(hi,l);}
  for(const [i,l] of px){const t=hi>lo?(l-lo)/(hi-lo):.5;let o;if(t<.5){const k=.35+t*1.3;o=T.map(v=>v*k);}else{const k=(t-.5)*2*.55;o=T.map(v=>v+(255-v)*k);}D[i]=o[0];D[i+1]=o[1];D[i+2]=o[2];}
  if(dots){const P=NRGB(dots);let n=0;for(const [i] of px){if(((i*2654435761)>>>0)%9===0){D[i]=P[0];D[i+1]=P[1];D[i+2]=P[2];n++;}}}
  g.putImageData(d,0,0);return c;}
// little pictures on a 16x16 grid (each cell is 2x2 pixels of the 32x32 icon)
function nDraw(k,col){const c=mkCanvas(32,32),g=c.getContext('2d');const R=(x,y,w,h,cl)=>{g.fillStyle=cl;g.fillRect(x*2,y*2,w*2,h*2);};const P=(x,y,cl)=>R(x,y,1,1,cl);
  const sh=(h,k2)=>shadeHex(h,k2);const D=(cx,cy,r,cl)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*.8)P(cx+x,cy+y,cl);};
  switch(k){
  case 'shell':D(8,8,6,'#e8dcc8');D(8,8,4,'#d8b890');D(9,8,2,'#b88a60');P(9,8,'#7a5030');R(2,9,4,4,'#e8dcc8');for(let i=0;i<5;i++)P(4+i,3+i%2,'#c8a070');break;
  case 'scute':R(3,4,10,8,'#3faa4a');R(4,3,8,1,'#3faa4a');R(4,12,8,1,'#3faa4a');R(5,5,6,6,'#5ac860');R(7,6,2,4,'#2a7a34');break;
  case 'comb':for(const [x,y] of [[3,3],[7,3],[11,3],[5,7],[9,7],[3,11],[7,11],[11,11]]){R(x,y,3,3,'#e8a020');P(x+1,y+1,'#f8d060');}R(2,2,12,1,'#b87810');break;
  case 'horn':for(let i=0;i<10;i++)R(3+i,11-((i*i)/12|0),2,2+(i>>2),sh('#d8ccb0',.8+i*.03));R(12,2,3,3,'#9a8a70');break;
  case 'chorus2':D(8,9,5,'#d8a8e0');D(7,8,3,'#ecc8f0');P(5,6,'#fff');R(7,2,2,3,'#9a60a8');break;
  case 'chorus':D(8,9,5,'#8a50a0');D(7,8,3,'#a870c0');P(5,7,'#d8a8e0');R(7,2,2,3,'#5a3070');break;
  case 'beans':for(const [x,y] of [[4,5],[9,4],[6,9],[10,9]]){R(x,y,3,4,'#6a4020');P(x+1,y+1,'#8a5a30');}break;
  case 'berries':R(7,2,2,4,'#3c7a2c');R(5,3,6,1,'#3c7a2c');for(const [x,y] of [[4,7],[9,6],[6,10],[10,10]]){D(x+1,y+1,1,'#c0203a');P(x,y,'#f06070');}break;
  case 'gberries':R(7,1,1,15,'#3c7a2c');for(const [x,y] of [[5,4],[9,7],[5,10],[9,12]]){D(x,y,1,'#f0b020');P(x-1,y-1,'#fff0a0');}break;
  case 'beet':D(8,10,4,'#a02030');D(7,9,2,'#c03040');R(7,2,1,4,'#3c9a2c');R(9,2,1,4,'#3c9a2c');R(5,3,2,2,'#3c9a2c');R(10,3,2,2,'#3c9a2c');P(8,15,'#7a1020');break;
  case 'cheese':for(let y=0;y<9;y++)R(3,4+y,Math.min(11,2+y+1),1,'#f2c840');R(3,12,11,2,'#d8a820');for(const [x,y] of [[5,8],[8,10],[10,12],[4,11]])P(x,y,'#c89818');break;
  case 'burger':R(3,4,10,3,'#c8803a');R(4,3,8,1,'#c8803a');P(6,4,'#f8e0a0');P(9,5,'#f8e0a0');R(2,7,12,1,'#3cb040');R(3,8,10,1,'#f2c840');R(3,9,10,2,'#6a3a1a');R(3,11,10,2,'#c8803a');break;
  case 'hotdog':R(2,6,12,5,'#e0a050');R(1,7,14,3,'#b04020');R(2,7,12,1,'#d05030');for(let x=3;x<13;x+=3)P(x,6,'#f0d020');R(2,10,12,1,'#c88840');break;
  case 'fries':for(let i=0;i<6;i++)R(4+i,2+(i%3),1,7,'#f0c840');R(3,7,10,7,'#d02020');R(4,8,8,1,'#f0f0f0');R(6,10,4,2,'#f0c020');break;
  case 'sushi':D(8,9,5,'#202020');D(8,9,4,'#f4f4f4');D(8,9,2,'#f07040');P(7,8,'#ffa080');break;
  case 'donut':D(8,8,6,'#c88840');D(8,8,5,'#f080b0');for(const [x,y] of [[5,5],[11,6],[4,10],[10,11],[7,3]])P(x,y,['#fff','#60c0f0','#f0e040'][(x+y)%3]);D(8,8,1,'rgba(0,0,0,0)');g.clearRect(14,14,4,4);break;
  case 'choco':R(3,3,10,11,'#5a3018');for(let y=4;y<13;y+=3)for(let x=4;x<12;x+=3)R(x,y,2,2,'#7a4a28');R(3,9,10,5,'#d8d8e0');R(3,9,10,1,'#b0b0b8');break;
  case 'icecream':D(8,5,4,'#f8c0d8');P(6,3,'#fff');P(9,4,'#e02040');for(let y=0;y<7;y++)R(5+(y>>1),9+y,6-y,1,'#d8a050');R(6,10,1,1,'#b07830');break;
  case 'pancakes':for(let i=0;i<4;i++){R(2,11-i*2,12,2,'#e0a050');R(2,11-i*2,12,1,'#f0c070');}R(6,3,4,2,'#f8e060');R(5,5,6,1,'#c08020');break;
  case 'waffle':R(2,3,12,11,'#d89a40');for(let y=4;y<13;y+=3)for(let x=3;x<13;x+=3)R(x,y,2,2,'#a86a20');break;
  case 'muffin':D(8,6,5,'#8a4a2a');P(6,4,'#2a1a10');P(10,6,'#2a1a10');for(let y=0;y<6;y++)R(4+(y>>2),9+y,8-(y>>2)*2,1,'#e0e0f0');R(5,10,1,4,'#b0b0c8');R(9,10,1,4,'#b0b0c8');break;
  case 'candyapple':D(8,9,5,'#e01818');D(7,8,3,'#ff4040');P(6,7,'#fff');R(8,1,1,5,'#c8a070');break;
  case 'omelette':D(8,9,6,'#f0d040');D(8,9,4,'#f8e070');for(const [x,y] of [[5,8],[10,10],[8,12]])P(x,y,'#3cb040');R(3,14,10,1,'#c8a020');break;
  case 'sandwich':for(let y=0;y<9;y++)R(3,4+y,Math.min(11,y+2),1,'#e8c888');R(3,7,10,1,'#3cb040');R(3,9,10,1,'#f2c840');R(3,10,10,1,'#d07070');R(3,12,10,1,'#c09050');break;
  case 'cotton':D(8,6,5,'#f8a0d0');D(6,5,3,'#ffc8e8');R(8,10,1,6,'#e8e0d0');break;
  case 'gear':D(8,8,5,'#b8b8b8');for(const [x,y] of [[7,1],[7,13],[1,7],[13,7],[3,3],[11,3],[3,11],[11,11]])R(x,y,2,2,'#9a9a9a');D(8,8,2,'#707070');P(8,8,'rgba(0,0,0,0)');g.clearRect(16,16,2,2);break;
  case 'battery':R(5,3,6,11,'#d8844a');R(6,2,4,1,'#c0c0c0');R(5,3,6,3,'#303030');R(7,8,2,3,'#f0e040');R(6,9,4,1,'#f0e040');break;
  case 'lens':D(8,8,6,'#7a7a7a');D(8,8,5,'#bfe8ff');P(6,5,'#fff');P(5,6,'#fff');break;
  case 'plate':R(2,4,12,8,'#d0d0d0');R(2,4,12,1,'#f0f0f0');R(2,11,12,1,'#909090');for(const [x,y] of [[3,5],[12,5],[3,10],[12,10]])P(x,y,'#808080');break;
  case 'circuit':R(2,3,12,10,'#2a8a3a');R(3,5,10,1,'#e0c040');R(6,5,1,6,'#e0c040');R(10,7,1,5,'#e0c040');R(4,8,3,3,'#303030');R(9,4,3,2,'#303030');break;
  case 'magnet':R(3,3,3,9,'#d03030');R(10,3,3,9,'#d03030');R(3,10,10,3,'#d03030');R(3,2,3,2,'#d8d8d8');R(10,2,3,2,'#d8d8d8');break;
  case 'hook':R(7,2,2,10,'#9a9a9a');R(4,11,8,2,'#9a9a9a');R(3,9,2,3,'#9a9a9a');R(11,9,2,3,'#9a9a9a');R(7,0,2,2,'#a07a48');R(8,0,1,1,'#c8a070');break;
  case 'bandage':R(2,5,12,6,'#f0ece0');R(2,5,12,1,'#ffffff');R(7,6,2,4,'#d02020');R(6,7,4,2,'#d02020');break;
  case 'medkit':R(2,4,12,10,'#e8e8e8');R(6,2,4,2,'#909090');R(7,6,2,6,'#d02020');R(5,8,6,2,'#d02020');R(2,13,12,1,'#a0a0a0');break;
  case 'dynamite':for(let i=0;i<3;i++)R(3+i*3,5,3,9,i===1?'#e03030':'#c02020');R(3,7,9,1,'#3a2a1a');R(7,2,1,3,'#d8c890');P(8,1,'#f0a020');P(7,0,'#ffe040');break;
  case 'smoke':D(8,9,5,'#5a5a5a');D(7,8,3,'#7a7a7a');R(8,2,1,3,'#d8c890');P(9,1,'#f0a020');break;
  case 'watch':D(8,9,5,'#c8a020');D(8,9,4,'#f8f4e0');R(8,6,1,3,'#202020');R(8,9,3,1,'#202020');R(7,2,2,2,'#c8a020');break;
  case 'depth':D(8,8,5,'#808080');D(8,8,4,'#e0f0f8');R(8,4,1,5,'#2060d0');for(let i=0;i<4;i++)P(5+i*2,12,'#202020');break;
  case 'charm':R(7,1,1,4,'#c8a070');D(8,9,4,'#f0e080');for(let i=0;i<6;i++)P(6+(i&1)*3,6+i,'#fffbe0');R(8,7,1,6,'#c8a020');break;
  case 'scroll':R(3,3,10,10,'#e8d8a8');R(2,2,12,2,'#c8a870');R(2,12,12,2,'#c8a870');for(let y=5;y<11;y+=2)R(5,y,6,1,'#9a8060');D(10,11,1,'#c02020');break;
  case 'goggles':R(2,6,12,2,'#3a3a3a');D(5,8,2,'#2a4a2a');D(11,8,2,'#2a4a2a');P(4,7,'#80ff80');P(10,7,'#80ff80');R(7,8,2,1,'#3a3a3a');break;
  case 'scuba':R(3,4,10,8,'#2a7ad8');R(4,5,8,5,'#bfe8ff');P(5,6,'#fff');R(12,3,2,9,'#f0d020');R(2,6,1,3,'#303030');R(13,6,1,3,'#303030');break;
  case 'wboots':R(3,6,4,7,'#f0f0f0');R(9,6,4,7,'#f0f0f0');R(3,12,5,2,'#c8c8d0');R(9,12,5,2,'#c8c8d0');R(3,6,4,1,'#e0c040');R(9,6,4,1,'#e0c040');for(let i=0;i<3;i++){R(1-0,7+i,2,1,'#fffbe0');R(13,7+i,2,1,'#fffbe0');}P(0,7,'#fff');P(15,7,'#fff');break;
  default:D(8,8,5,col);}
  return c;}
{const r0=rebuildIcons;rebuildIcons=function(){r0();for(const k of NEWI){const it=ITEMS[k];if(!it)continue;let c=null;
  if(it.tex&&PACK.icons&&PACK.icons[k])c=PACK.icons[k];else if(it.rc)c=nRecolor(it.rc.src,it.rc.col,it.rc.sel,it.rc.dots);else if(it.draw)c=nDraw(it.draw,it.color);if(!c)continue;
  ICON_RAW[k]=c;ICONS[k]=it.ench?glintIcon(c):c;}};}
// armour on the body: copper and turtle from the pack's iron armour, netherite from its diamond armour
function nArmorRecolor(cv,col,sel){if(!cv)return null;const c=mkCanvas(cv.width,cv.height),g=c.getContext('2d');g.drawImage(cv,0,0);const d=g.getImageData(0,0,c.width,c.height),D=d.data,T=NRGB(col);
  for(let i=0;i<D.length;i+=4){if(D[i+3]<20)continue;const r=D[i]/255,gg=D[i+1]/255,b=D[i+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2,dd=mx-mn,sat=dd<1e-6?0:dd/(1-Math.abs(2*l-1));
    let hue=0;if(dd>0)hue=(mx===r?((gg-b)/dd+6)%6:mx===gg?(b-r)/dd+2:(r-gg)/dd+4)*60;const ok=sel==='gray'?sat<.25:(hue>140&&hue<215&&sat>.1);if(!ok)continue;
    const k=.3+l*1.2;D[i]=Math.min(255,T[0]*k);D[i+1]=Math.min(255,T[1]*k);D[i+2]=Math.min(255,T[2]*k);}g.putImageData(d,0,0);return c;}
{const i0=initEntityTextures;initEntityTextures=function(){const A=PACK.armor||(PACK.armor={});const ir=A.iron,di=A.diamond;
  if(ir&&!A.copper)A.copper={l1:nArmorRecolor(ir.l1,'#c87533','gray'),l2:nArmorRecolor(ir.l2,'#c87533','gray')};
  if(ir&&!A.turtle)A.turtle={l1:nArmorRecolor(ir.l1,'#3faa4a','gray'),l2:null};
  if(di&&!A.netherite)A.netherite={l1:nArmorRecolor(di.l1,'#4a4048','cyan'),l2:nArmorRecolor(di.l2,'#4a4048','cyan')};
  return i0();};}

// ---------- recipes ----------
{const n0=RECIPES.length;const P=(r,k,o,n)=>shaped(r,k,o,n),L=(i,o,n)=>shapeless(i,o,n);const BW='bowl',GB='glass_bottle';
  for(const [t,m] of [['copper','copper_ingot'],['emerald','emerald']]){const K={M:m,S:'stick'};P(['MMM',' S ',' S '],K,t+'_pickaxe');P(['MM','MS',' S'],K,t+'_axe');P(['M','M','S'],K,t+'_sword');P(['M','S','S'],K,t+'_shovel');P(['MM',' S',' S'],K,t+'_hoe');}
  for(const s of ['sword','pickaxe','axe','shovel','hoe'])L(['diamond_'+s,'netherite_ingot'],'netherite_'+s);
  {const K={M:'copper_ingot'};P(['MMM','M M'],K,'copper_helmet');P(['M M','MMM','MMM'],K,'copper_chestplate');P(['MMM','M M','M M'],K,'copper_leggings');P(['M M','M M'],K,'copper_boots');}
  for(const s of ['helmet','chestplate','leggings','boots'])L(['diamond_'+s,'netherite_ingot'],'netherite_'+s);
  L(['netherite_scrap','netherite_scrap','netherite_scrap','netherite_scrap','gold_ingot','gold_ingot','gold_ingot','gold_ingot'],'netherite_ingot');
  L(['copper_ingot'],'copper_nugget',9);P(['NNN','NNN','NNN'],{N:'copper_nugget'},'copper_ingot');L(['iron_ingot'],'iron_nugget',9);P(['NNN','NNN','NNN'],{N:'iron_nugget'},'iron_ingot');
  P(['SSS','S S'],{S:'turtle_scute'},'turtle_helmet');
  L([BW,'beetroot','beetroot','beetroot','beetroot','beetroot','beetroot'],'beetroot_soup');L(['beetroot'],'beetroot_seeds');
  L([BW,'b'+B.MUSH_RED,'b'+B.MUSH_BROWN,'red_dye'],'suspicious_stew');L([GB,'honeycomb','honeycomb'],'honey_bottle');
  // food
  L(['wheat'],'flour');L(['milk_bucket'],'cheese',4);L(['flour','cheese','beetroot'],'pizza',2);L(['bread','cooked_beef','cheese'],'burger');L(['bread','cooked_porkchop'],'hot_dog');
  L(['baked_potato','baked_potato'],'fries',3);L(['raw_fish','wheat'],'sushi',2);L(['flour','sugar','egg'],'donut',2);L(['cocoa_beans','cocoa_beans','sugar'],'chocolate_bar');
  L(['milk_bucket','sugar','snowball'],'ice_cream',3);L(['flour','flour','egg','sugar'],'pancakes',2);L(['flour','egg','honey_bottle'],'waffle',2);L([BW,'seeds_wheat','seeds_wheat','seeds_wheat'],'popcorn');
  L(['apple','sugar','egg','flour'],'apple_pie');L(['sweet_berries','sweet_berries','sugar','egg','flour'],'berry_pie');L(['flour','egg','sugar','sweet_berries'],'muffin',2);
  L(['apple','sugar','stick'],'candy_apple');L(['toast','honey_bottle'],'honey_toast');L(['fried_egg','fried_egg','cheese'],'omelette');L(['bread','cheese','cooked_chicken'],'sandwich');
  L([BW,'carrot','beetroot','potato'],'salad');L([BW,'apple','sweet_berries','glow_berries'],'fruit_salad');L([GB,'cocoa_beans','sugar'],'hot_cocoa');L([GB,'apple','apple'],'apple_juice');
  L([GB,'sweet_berries','sweet_berries','sugar'],'berry_smoothie');L([GB,'sugar','redstone'],'energy_drink');L(['sugar','sugar','stick'],'cotton_candy');
  L(['seeds_pumpkin','seeds_melon','sweet_berries','cocoa_beans'],'trail_mix',2);L(['flour','sugar','cocoa_beans'],'cookie_dough',2);
  // parts
  L(['string','string','string'],'rope');L(['string','string','string','string'],'cloth');P([' N ','NIN',' N '],{N:'iron_nugget',I:'iron_ingot'},'gear',2);
  P(['I','R','C'],{I:'iron_ingot',R:'redstone',C:'copper_ingot'},'battery');P([' G ','G G',' G '],{G:'b'+B.GLASS},'lens',2);L(['iron_ingot','coal','coal'],'steel_ingot');
  L(['slime_ball','sugar'],'glue',2);P(['II'],{I:'iron_ingot'},'iron_plate');L(['copper_ingot','redstone','gold_nugget'],'circuit');
  // gadgets
  L(['iron_ingot','iron_ingot','redstone','battery'],'magnet');L(['rope','rope','iron_ingot','gear'],'grappling_hook');L(['cloth','glue'],'bandage',2);L(['bandage','bandage','speckled_melon','iron_plate'],'med_kit');
  L(['gunpowder','gunpowder','paper','string'],'dynamite',2);L(['gunpowder','coal','paper'],'smoke_bomb',2);L(['clock','gold_nugget','string'],'pocket_watch');L(['compass','redstone','gear'],'depth_meter');
  L(['feather','feather','feather','gold_ingot','string'],'feather_charm');L(['ender_pearl','paper','gold_nugget'],'recall_scroll',2);L(['lens','lens','leather','circuit'],'night_goggles');
  L(['lens','leather','iron_plate','glue'],'scuba_mask');L(['leather_boots','feather','feather','feather','gold_ingot'],'winged_boots');
  // keep only recipes whose ingredients exist in this build
  for(let i=RECIPES.length-1;i>=n0;i--){const R=RECIPES[i];const ids=R.ins?R.ins.flat():Object.values(R.keys).flat();if(!ITEMS[R.out]||ids.some(x=>!ITEMS[x]))RECIPES.splice(i,1);}
  for(let i=n0;i<RECIPES.length;i++)LC_REC.push(lcRecipe(RECIPES[i]));}
Object.assign(SMELT,{raw_copper:'copper_ingot',chorus_fruit:'popped_chorus_fruit',bread:'toast'});
// the console crafting screen
{const T=n=>{const t=LC_TABS.find(x=>x.name===n);return t?t.entries:[];};
  T('Tools and Weapons').push(['Copper Tools',['copper_pickaxe','copper_axe','copper_shovel','copper_sword','copper_hoe']],['Emerald Tools',['emerald_pickaxe','emerald_axe','emerald_shovel','emerald_sword','emerald_hoe']],
    ['Netherite Tools',['netherite_pickaxe','netherite_axe','netherite_shovel','netherite_sword','netherite_hoe']],['Gadgets',['magnet','grappling_hook','dynamite','smoke_bomb','pocket_watch','depth_meter','feather_charm','recall_scroll']],
    ['First Aid',['bandage','med_kit']]);
  T('Armour').push(['Copper Armour',['copper_helmet','copper_chestplate','copper_leggings','copper_boots']],['Netherite Armour',['netherite_helmet','netherite_chestplate','netherite_leggings','netherite_boots']],
    ['Special Gear',['turtle_helmet','night_goggles','scuba_mask','winged_boots']]);
  T('Food').push(['Soups and Stews',['beetroot_soup','suspicious_stew','salad','fruit_salad','popcorn']],['Drinks',['honey_bottle','hot_cocoa','apple_juice','berry_smoothie','energy_drink']],
    ['Meals',['pizza','burger','hot_dog','fries','sushi','omelette','sandwich']],['Sweets',['donut','chocolate_bar','ice_cream','candy_apple','cotton_candy','cookie_dough']],
    ['Baking',['pancakes','waffle','apple_pie','berry_pie','muffin','honey_toast']],['Snacks',['cheese','trail_mix']]);
  T('Materials').push(['Copper',['copper_ingot','copper_nugget']],['Iron Nuggets',['iron_nugget','iron_ingot']],['Netherite Ingot',['netherite_ingot']],['Beetroot Seeds',['beetroot_seeds']],
    ['Parts',['flour','rope','cloth','gear','battery','lens','steel_ingot','glue','iron_plate','circuit']]);}

// ---------- where the Minecraft ones come from ----------
{const x0=extraDrops;extraDrops=function(x,y,z,b,id){x0(x,y,z,b,id);const at=[x+.5,y-.6,z+.5],v=()=>[(Math.random()-.5)*1.5,2.5,(Math.random()-.5)*1.5],r=Math.random(),drop=(i,n=1)=>requestDrop(at,i,n,v());
  const pick=ITEMS[id]&&ITEMS[id].tool==='pickaxe';
  if(b===B.TGRASS){if(r<.04)drop('sweet_berries');else if(r<.07)drop('beetroot');else if(r<.1)drop('beetroot_seeds');}
  else if(b===B.VINE&&r<.1)drop('glow_berries');
  else if(b===B.JLEAVES&&r<.06)drop('cocoa_beans');
  else if(b===B.LEAVES&&r<.015)drop('honeycomb');
  else if(b===B.STONE&&pick&&y<SEA&&r<.06)drop('raw_copper');
  else if(b===B.IRON_ORE&&pick&&r<.3)drop('raw_copper');
  else if(b===B.NETHERRACK&&pick&&r<.01)drop('netherite_scrap');
  else if(B.END_STONE&&b===B.END_STONE&&r<.03)drop('chorus_fruit');
  else if(B.AMETHYST_ORE&&b===B.AMETHYST_ORE&&r<.5)drop('amethyst_shard',1+(Math.random()*2|0));};}
MOB_T.skinwalker.rare.push(['echo_shard',.3],['phantom_membrane',.35]);
LOOT_TABLES.ruin_common.push(['copper_ingot',1,4,.3],['raw_copper',2,6,.3],['sweet_berries',2,6,.3],['honeycomb',1,3,.2],['turtle_scute',1,2,.12],['nautilus_shell',1,1,.08],['rope',1,3,.25],['bandage',1,2,.2]);
LOOT_TABLES.ruin_god.push(['netherite_scrap',1,3,.35],['heart_of_the_sea',1,1,.2],['goat_horn',1,1,.2],['nautilus_shell',1,3,.3],['netherite_ingot',1,1,.1],['med_kit',1,1,.3],['grappling_hook',1,1,.2]);
for(const k in LOOT_TABLES){if(k.startsWith('ruin'))continue;LOOT_TABLES[k].push(['copper_ingot',1,3,.15],['iron_nugget',2,6,.2],['turtle_scute',1,1,.04],['goat_horn',1,1,.03],['nautilus_shell',1,1,.04],['netherite_scrap',1,1,.03]);}
if(typeof JUNK_LOOT!=='undefined')JUNK_LOOT.push(['nautilus_shell',2],['turtle_scute',1]);

// ---------- what the new things do ----------
{const e0=eatFood;eatFood=function(e,id){e0(e,id);const it=ITEMS[id];if(!it)return;
  if(it.bottle&&e===player)giveOrDrop(e,'glass_bottle',1);
  if(id==='honey_bottle'&&e.effects)delete e.effects.poison;
  if(id==='suspicious_stew'){const fx=[['regen',8,0],['speed',8,0],['strength',8,0],['fireres',8,0],['poison',6,0],['weakness',8,0],['invis',8,0]];giveEffect(e,...fx[Math.random()*fx.length|0]);}
  if(id==='chorus_fruit'&&e===player)for(let k=0;k<16;k++){const x=Math.floor(e.pos[0]+(Math.random()-.5)*16),z=Math.floor(e.pos[2]+(Math.random()-.5)*16);
    for(let y=Math.floor(e.pos[1])+8;y>Math.floor(e.pos[1])-8;y--)if(floorOk(x,y,z)&&!getB(x,y,z)&&!getB(x,y+1,z)){spawnParticles(e.pos[0],e.pos[1]+1,e.pos[2],12,[.6,.3,.7],1,'magic');e.pos=[x+.5,y,z+.5];e.vel=[0,0,0];e.fallDist=0;psnd(['mob/endermen/portal','mob/enderman/portal'],e.pos,.8,1);k=99;break;}}};}
const DYN=[];
{const u0=useSpecial;useSpecial=function(p,s){const id=s&&s.id;if(!INF||!p||!p.alive||!id)return u0(p,s);const it=ITEMS[id];const now=performance.now()/1000;
  if(id==='bandage'||id==='med_kit'){if(p.health>=maxHP(p)&&!(p.effects&&p.effects.poison))return true;if(id==='bandage')p.health=Math.min(maxHP(p),p.health+6);else{p.health=maxHP(p);if(p.effects){delete p.effects.poison;delete p.effects.weakness;delete p.effects.slowness;}}
    consume(p,p.sel);sfx('click');spawnParticles(p.pos[0],p.pos[1]+1.2,p.pos[2],8,[1,.3,.3],.8,'magic');return true;}
  if(id==='dynamite'){if((p._dyT||0)>now)return true;p._dyT=now+.6;const e=eye(p),f=fwd(p);DYN.push({pos:e.slice(),vel:[f[0]*14,f[1]*14+3,f[2]*14],t:2,owner:p});consume(p,p.sel);sfx('click');return true;}
  if(id==='smoke_bomb'){spawnParticles(p.pos[0],p.pos[1]+1,p.pos[2],60,[.45,.45,.45],3,'poof');giveEffect(p,'invis',8,0);consume(p,p.sel);return true;}
  if(id==='grappling_hook'){if((p._ghT||0)>now)return true;p._ghT=now+.8;const h=raycastBlock(eye(p),fwd(p),28,true,false);if(!h)return true;const e=eye(p),t=[h.x+.5,h.y+.5,h.z+.5];const d=[t[0]-e[0],t[1]-e[1],t[2]-e[2]];const L=Math.hypot(...d)||1;
    const sp=Math.min(1.6,.5+L*.06);p.mot=[d[0]/L*sp,Math.min(1.3,d[1]/L*sp+.35),d[2]/L*sp];p.fallDist=0;p.onGround=false;psnd(['random/bow'],p.pos,.8,1.4);return true;}
  if(id==='recall_scroll'){if(p._recall)return true;p._recall={t:3,at:p.pos.slice()};chatMsg('Going home... stand still','#c0a0ff',false);return true;}
  if(id==='goat_horn'){if((p._hornT||0)>now)return true;p._hornT=now+7;if(actx){const t=actx.currentTime;for(const f of [196,247,294]){const o=actx.createOscillator(),g=actx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f*.9,t);o.frequency.linearRampToValueAtTime(f,t+.3);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.15);g.gain.exponentialRampToValueAtTime(.0001,t+2.6);o.connect(g);g.connect(masterOut||actx.destination);o.start(t);o.stop(t+2.7);}}return true;}
  return u0(p,s);};}
// every tick: thrown dynamite, the magnet, gear you wear, going home, no fall damage
{let tk=0;const t0=survTick;survTick=function(dt){t0(dt);const p=player;
  for(let i=DYN.length-1;i>=0;i--){const d=DYN[i];d.t-=dt;if(!d.stuck)d.vel[1]-=22*dt;const n=[d.pos[0]+d.vel[0]*dt,d.pos[1]+d.vel[1]*dt,d.pos[2]+d.vel[2]*dt];
    if(getB(Math.floor(n[0]),Math.floor(n[1]),Math.floor(n[2]))&&BD[getB(Math.floor(n[0]),Math.floor(n[1]),Math.floor(n[2]))].solid){d.vel=[0,0,0];d.stuck=true;}else if(!d.stuck)d.pos=n;
    if(Math.random()<.7)spawnParticles(d.pos[0],d.pos[1],d.pos[2],1,[1,.5,.1],.3,'poof');if(d.t<=0){DYN.splice(i,1);explode(d.pos,3,d.owner);}}
  if(!p||!p.alive)return;
  if(p._recall){const R=p._recall;R.t-=dt;if(dist(R.at,p.pos)>.4){p._recall=null;chatMsg('You moved: the scroll fizzled','#c0a0ff',false);}
    else{if(Math.random()<.5)spawnParticles(p.pos[0],p.pos[1]+1,p.pos[2],2,[.6,.4,1],1,'magic');if(R.t<=0){p._recall=null;const i=p.inv.findIndex(s=>s&&s.id==='recall_scroll');if(i>=0)consume(p,i);
      const home=(DIM==='overworld'&&SURV.bedSpawn)?SURV.bedSpawn.slice():SURV.spawn.slice();if(DIM!=='overworld'){chatMsg('The scroll only works in the Overworld','#c0a0ff',false);}else{p.pos=home;p.vel=[0,0,0];p.fallDist=0;if(!chunkReadyAt(home[0],home[2]))SURV.loading=true;sfx('click');}}}}
  const hot=p.inv.slice(0,9).some(s=>s&&s.id==='magnet');if(hot)for(const d of drops){const dx=p.pos[0]-d.pos[0],dy=p.pos[1]+.8-d.pos[1],dz=p.pos[2]-d.pos[2],L=Math.hypot(dx,dy,dz);if(L<9&&L>.3){d.vel=[dx/L*7,dy/L*7+1,dz/L*7];}}
  const A=p.armor||[];const head=A[0]&&A[0].id,feet=A[3]&&A[3].id;
  if(head==='scuba_mask')p.air=300;else if(head==='turtle_helmet'&&p.air<300&&Math.random()<dt*2)p.air=Math.min(300,p.air+1);
  if(feet==='winged_boots'&&((tk+=dt)>1)){tk=0;giveEffect(p,'speed',2,0);}};}
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ig){if(e===player&&cause==='fall'&&e.inv){if(e.inv.some(s=>s&&s.id==='feather_charm'))return false;const A=e.armor||[];if(A[3]&&A[3].id==='winged_boots')amt*=.5;}return h0.call(this,e,amt,src,cause,kb,raw,ig);};}
// night vision goggles: the world is lit as if by day
{const u0=updateEnv;updateEnv=function(dt){u0(dt);const p=player;const A=p&&p.armor;if(A&&A[0]&&A[0].id==='night_goggles'){ENV.skyL=ENV.skyL.map(v=>Math.max(v,.85));ENV.blkL=ENV.blkL.map(v=>Math.max(v,.85));ENV.amb=Math.max(ENV.amb,.35);}};}
// pocket watch and depth meter: a line of text over the hotbar while held
{const h0=drawHUD;drawHUD=function(){h0();const p=player;if(!INF||!p||!p.alive||hideGui||MATCH.mode!=='survival')return;const s=p.inv[p.sel];if(!s)return;let t=null;
  if(s.id==='pocket_watch'){const m=Math.floor(((worldTime+.25)%1)*1440);t='Day '+((GZ.day||0)+1)+'   '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
  else if(s.id==='depth_meter')t='Height '+Math.floor(p.pos[1])+'   '+(DIM==='overworld'?BIOMES[biomeAt(p.pos[0],p.pos[2])].name:DIM==='nether'?'The Nether':'The End');
  if(t)txt(t,W/2,H-214,16,'#ffff80','center');};}
rebuildIcons();rebuildItemAtlas();initEntityTextures();

{const seen={};for(const k in N){if(seen[N[k]])console.error("network code clash: N."+k+" and N."+seen[N[k]]+" are both "+N[k]);seen[N[k]]=k;}}
