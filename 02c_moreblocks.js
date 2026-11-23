// ================= More blocks: TNT, coloured wool, bookshelves, pumpkins, melons, clay, lanterns, biome bricks, stone types... =================
// ids 124.. ; atlas tiles 119..  (plain names are looked up in the resource pack, ~names are made from pack art in 06c_derive2.js)
const MB_WOOLS=[['orange','Orange','#e07a26'],['magenta','Magenta','#c050c0'],['light_blue','Light Blue','#6a8ad0'],['yellow','Yellow','#d8c428'],['lime','Lime','#48b83a'],['pink','Pink','#e08aa4'],
  ['gray','Gray','#424242'],['silver','Light Gray','#9a9ea0'],['cyan','Cyan','#2a7a90'],['purple','Purple','#8038b0'],['blue','Blue','#2a3a96'],['brown','Brown','#5a3a22'],['green','Green','#3a5220'],['black','Black','#1c1818']];
const NEWT={};   // tile -> how to draw it without a pack
{let id=124,t=119;
  const tile=(name,draw)=>{TILE_PACK.push(name);NEWT[t]=draw;return t++;};
  const blk=(key,name,col,tiles,o={})=>{const [top,side,bottom,front]=tiles;def(id,top,side,bottom==null?top:bottom,Object.assign(front!=null?{front}:{},o));BLOCK_NAMES[id]=name;BLOCK_COL[id]=col;B[key]=id;return id++;};
  // TNT
  const tt=tile('tnt_top',{k:'tnt_top'}),ts=tile('tnt_side',{k:'tnt_side'}),tb=tile('tnt_bottom',{k:'tnt_top'});
  blk('TNT','TNT','#d03a2a',[tt,ts,tb]);
  // wool in every colour (white and red already exist)
  for(const [k,N,c] of MB_WOOLS){const w=tile('wool_colored_'+k,{k:'wool',c});blk('WOOL_'+k.toUpperCase(),N+' Wool',c,[w,w,w]);}
  blk('BOOKSHELF','Bookshelf','#8a6a3a',[7,tile('bookshelf',{k:'books'}),7]);
  {const t1=tile('hay_block_top',{k:'hay_top'}),t2=tile('hay_block_side',{k:'hay'});blk('HAY','Hay Bale','#c8a828',[t1,t2,t1]);}
  {const pt=tile('pumpkin_top',{k:'pumpkin_top'}),ps=tile('pumpkin_side',{k:'pumpkin'}),pf=tile('pumpkin_face_off',{k:'pumpkin_face',lit:false}),pl=tile('pumpkin_face_on',{k:'pumpkin_face',lit:true});
    blk('PUMPKIN','Pumpkin','#d8862a',[pt,ps,pt,pf]);blk('JACK','Jack o\'Lantern','#f0a030',[pt,ps,pt,pl],{light:15});}
  {const mt=tile('melon_top',{k:'melon_top'}),ms=tile('melon_side',{k:'melon'});blk('MELON','Melon','#5a9a2a',[mt,ms,mt]);}
  const plain=(key,name,col,tname,draw,o)=>{const t1=tile(tname,draw);return blk(key,name,col,[t1,t1,t1],o);};
  plain('CLAY','Clay','#a0a6b4','clay',{k:'noise',c:'#a0a6b4'});
  plain('TERRACOTTA','Terracotta','#985e44','hardened_clay',{k:'noise',c:'#985e44'});
  plain('IRON_BLOCK','Block of Iron','#dcdcdc','iron_block',{k:'metal',c:'#dcdcdc'});
  plain('LAPIS_BLOCK','Lapis Lazuli Block','#2a4a9a','lapis_block',{k:'metal',c:'#2a4a9a'});
  plain('NETHER_BRICK','Nether Bricks','#3a1c20','nether_brick',{k:'bricks',c:'#3a1c20'});
  plain('END_STONE','End Stone','#dcdca0','end_stone',{k:'noise',c:'#dcdca0'});
  plain('PRISMARINE','Prismarine','#5aa898','prismarine_rough',{k:'noise',c:'#5aa898'});
  plain('PRISM_BRICKS','Prismarine Bricks','#68b4a0','prismarine_bricks',{k:'bricks',c:'#68b4a0'});
  plain('DARK_PRISM','Dark Prismarine','#2a5a4a','prismarine_dark',{k:'bricks',c:'#2a5a4a'});
  plain('SEA_LANTERN','Sea Lantern','#d0e8e0','sea_lantern',{k:'lamp',c:'#d0e8e0'},{light:15});
  {const jt=tile('jukebox_top',{k:'metal',c:'#6a4a32'}),js=tile('jukebox_side',{k:'plank',c:'#6a4a32'});blk('JUKEBOX','Jukebox','#6a4a32',[jt,js,js]);}
  plain('NOTEBLOCK','Note Block','#6a4a32','noteblock',{k:'plank',c:'#6a4a32'});
  plain('LAMP','Redstone Lamp','#e0b060','redstone_lamp_on',{k:'lamp',c:'#e0b060'},{light:15});
  plain('CRYSTAL_BRICKS','Crystal Bricks','#3f8cf0','~crystal_bricks',{k:'bricks',c:'#3f8cf0'},{light:6});
  plain('BASALT_BRICKS','Basalt Bricks','#3a3a42','~basalt_bricks',{k:'bricks',c:'#3a3a42'});
  plain('ASH_BRICKS','Ash Bricks','#76747a','~ash_bricks',{k:'bricks',c:'#76747a'});
  plain('ICE_BRICKS','Ice Bricks','#8ab2ea','~ice_bricks',{k:'bricks',c:'#8ab2ea'});
  plain('SNOW_BRICKS','Snow Bricks','#e6ecf2','~snow_bricks',{k:'bricks',c:'#e6ecf2'});
  plain('MAGMA_BRICKS','Magma Bricks','#a83a10','~magma_bricks',{k:'bricks',c:'#a83a10'},{light:6});
  plain('SAKURA_LANTERN','Sakura Lantern','#f5a8cf','~sakura_lantern',{k:'lamp',c:'#f5a8cf'},{light:15});
  plain('GLOW_LAMP','Glowshroom Lamp','#50b0e8','~glow_lamp',{k:'lamp',c:'#50b0e8'},{light:15});
  plain('MYTHRIL_LANTERN','Mythril Lantern','#b8f8e8','~mythril_lantern',{k:'lamp',c:'#b8f8e8'},{light:15});
  {const qs=tile('quartz_block_lines',{k:'lines',c:'#ebe6dc'}),qt=tile('quartz_block_lines_top',{k:'noise',c:'#ebe6dc'});blk('QUARTZ_PILLAR','Quartz Pillar','#ebe6dc',[qt,qs,qt]);}
  {const cs=tile('quartz_block_chiseled',{k:'bricks',c:'#ebe6dc'}),ct=tile('quartz_block_chiseled_top',{k:'noise',c:'#ebe6dc'});blk('QUARTZ_CHISELED','Chiseled Quartz Block','#ebe6dc',[ct,cs,ct]);}
  for(const [k,N,c] of [['granite','Granite','#9a6a58'],['diorite','Diorite','#c8c8c8'],['andesite','Andesite','#868688']]){
    plain(k.toUpperCase(),N,c,'stone_'+k,{k:'noise',c});plain('P_'+k.toUpperCase(),'Polished '+N,c,'stone_'+k+'_smooth',{k:'polished',c});}
}
// procedural stand-ins for the new tiles when no resource pack is loaded
{const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];const sh=(c,f)=>c.map(v=>Math.max(0,Math.min(255,v*f|0)));
  const prev=procTileX;
  procTileX=function(t,x,y){const D=NEWT[t];if(!D)return prev(t,x,y);const h=hash2;const c=D.c?hx(D.c):[128,128,128];const n=h(x,y,t*7+3);
    switch(D.k){
    case 'tnt_side':if(y>=5&&y<=10)return y===5||y===10?[40,40,40]:(x%5===0?[30,30,30]:[235,235,235]);return x%4===0?[150,30,20]:[200+n*30|0,50,40];
    case 'tnt_top':{const r=Math.hypot(x-7.5,y-7.5);if(r<2)return [40,40,40];return (x+y)%4===0?[150,30,20]:[200+n*20|0,50,40];}
    case 'wool':return sh(c,.85+cl(x,y,t,2)*.3);
    case 'books':{if(y<2||y>13||y===7||y===8)return sh([162,130,78],.8+n*.3);const cols=[[150,40,30],[40,70,140],[60,120,40],[150,120,40],[90,40,110]];return x%3===0?[40,30,20]:sh(cols[(x/3|0)%5],.8+n*.3);}
    case 'hay':return (x+((y/4)|0))%4===0?[150,110,20]:sh([210,180,50],.85+n*.25);
    case 'hay_top':return Math.hypot(x-7.5,y-7.5)%3<1?[160,120,30]:sh([210,180,50],.85+n*.2);
    case 'pumpkin':return x%4===0?[170,90,20]:sh([220,130,30],.85+n*.2);
    case 'pumpkin_top':return Math.hypot(x-7.5,y-7.5)<2?[90,110,30]:sh([210,120,28],.85+n*.2);
    case 'pumpkin_face':{const eye=(y>=4&&y<=6)&&((x>=3&&x<=5)||(x>=10&&x<=12)),mouth=y>=9&&y<=11&&x>=3&&x<=12&&!(y===9&&x%3===0);if(eye||mouth)return D.lit?[255,220,90]:[40,24,10];return x%4===0?[170,90,20]:sh([220,130,30],.85+n*.2);}
    case 'melon':return (x%4<2)?[60,120,30]:sh([120,170,40],.85+n*.2);
    case 'melon_top':return Math.hypot(x-7.5,y-7.5)%4<1.5?[70,130,30]:sh([110,160,40],.85+n*.2);
    case 'metal':{const e=x===0||y===0||x===15||y===15;return e?sh(c,.7):sh(c,.95+n*.12);}
    case 'plank':return y%4===0?sh(c,.7):sh(c,.85+n*.25);
    case 'bricks':{const row=y>>2,off=(row&1)?4:0;const mortar=y%4===3||((x+off)%8===7);return mortar?sh(c,.6):sh(c,.85+n*.3);}
    case 'lamp':{const e=x===0||y===0||x===15||y===15;if(e)return sh(c,.55);const g=(x%5===0||y%5===0);return g?sh(c,.8):sh(c,1.05+n*.15);}
    case 'lines':return x%4===0?sh(c,.85):sh(c,.97+n*.05);
    case 'polished':{const e=x===0||y===0||x===15||y===15;return e?sh(c,.78):sh(c,.95+n*.08);}
    default:return sh(c,.85+cl(x,y,t,2.5)*.25+n*.1);}};}
atlasCanvas=makeProcAtlas();
