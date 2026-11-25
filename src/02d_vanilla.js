// ================= Vanilla blocks for the full game: more trees and plants, flowing water and lava, the Nether, the End, portals, beds =================
// ids 174.. ; atlas tiles continue after 02c. Only the resource pack's own textures are used (1.8 "blocks/" names); nothing that exists is changed.
const MINE_DROP_LATE=[];
const VB={};          // extra info: VB.waterF[level], VB.lavaF[level], bed ids...
{let id=174,t=TILE_PACK.length;
  const tile=(name,draw)=>{TILE_PACK.push(name);NEWT[t]=draw||{k:'noise',c:'#808080'};return t++;};
  const blk=(key,name,col,tiles,o={})=>{const [top,side,bottom,front]=tiles;def(id,top,side,bottom==null?top:bottom,Object.assign(front!=null?{front}:{},o));if(name)BLOCK_NAMES[id]=name;BLOCK_COL[id]=col;B[key]=id;return id++;};
  const cross=(key,name,col,tname,o={})=>{const tt=tile(tname,{k:'plant',c:col});return blk(key,name,col,[tt,tt,tt],Object.assign({solid:false,opaque:false,cross:true},o));};
  // ---- trees: birch, spruce leaves, acacia, dark oak ----
  for(const [k,N,lc,pc,pn] of [['BIRCH','Birch','#d8d4c8','#c8b77a','birch'],['ACACIA','Acacia','#6a5f55','#ad5d32','acacia'],['DARK_OAK','Dark Oak','#3c2e1a','#4f3218','big_oak']]){
    const ls=tile('log_'+pn,{k:'bark',c:lc}),lt=tile('log_'+pn+'_top',{k:'ring',c:pc});blk(k+'_LOG',N+' Log',lc,[lt,ls,lt]);
    const lv=tile('leaves_'+pn,{k:'leaves',c:'#4a8a2a'});blk(k+'_LEAVES',N+' Leaves','#4a8a2a',[lv,lv,lv],{opaque:false,leaves:true});
    const pl=tile('planks_'+pn,{k:'plank',c:pc});blk(k+'_PLANKS',N+' Planks',pc,[pl,pl,pl]);}
  {const lv=tile('leaves_spruce',{k:'leaves',c:'#3a6a3a'});blk('SPRUCE_LEAVES','Spruce Leaves','#3a6a3a',[lv,lv,lv],{opaque:false,leaves:true});}
  // ---- plants ----
  {const cs=tile('cactus_side',{k:'cactus',c:'#2a7a2a'}),ct=tile('cactus_top',{k:'noise',c:'#3a8a3a'}),cb=tile('cactus_bottom',{k:'noise',c:'#8aa050'});
    blk('CACTUS','Cactus','#2a7a2a',[ct,cs,cb],{opaque:false,shape:[[1/16,0,1/16,15/16,1,15/16]],col:[[1/16,0,1/16,15/16,1,15/16]],cactus:true});}
  cross('REEDS','Sugar Cane','#8ac060','reeds');
  for(const [k,N,c,tn] of [['ALLIUM','Allium','#b878e0','flower_allium'],['BLUE_ORCHID','Blue Orchid','#30a0e0','flower_blue_orchid'],['AZURE','Azure Bluet','#e0e8f0','flower_houstonia'],
    ['OXEYE','Oxeye Daisy','#f0f0e0','flower_oxeye_daisy'],['TULIP_RED','Red Tulip','#e03020','flower_tulip_red'],['TULIP_ORANGE','Orange Tulip','#f08020','flower_tulip_orange'],['TULIP_WHITE','White Tulip','#f0f0f0','flower_tulip_white'],['TULIP_PINK','Pink Tulip','#f0a0c0','flower_tulip_pink']])cross(k,N,c,tn);
  cross('MUSH_RED','Red Mushroom','#d03028','mushroom_red');cross('MUSH_BROWN','Brown Mushroom','#9a7050','mushroom_brown',{light:1});
  // two-block-tall plants: lower and upper halves are separate blocks
  for(const [k,N,c,tn] of [['TALLGRASS2','Tall Grass','#5a9a3a','grass'],['LARGE_FERN','Large Fern','#4a8a3a','fern'],['LILAC','Lilac','#c090c8','syringa'],['ROSE_BUSH','Rose Bush','#c83030','rose'],['PEONY','Peony','#e0a8d0','paeonia']]){
    cross(k,N,c,'double_plant_'+tn+'_bottom',{tall:1});cross(k+'_TOP',null,c,'double_plant_'+tn+'_top',{tall:2});}
  {const t1=tile('coarse_dirt',{k:'noise',c:'#77553b'});blk('COARSE_DIRT','Coarse Dirt','#77553b',[t1,t1,t1]);}
  {const t1=tile('red_sand',{k:'noise',c:'#a95821'});blk('RED_SAND','Red Sand','#a95821',[t1,t1,t1]);}
  {const mt=tile('mycelium_top',{k:'noise',c:'#6f6268'}),ms=tile('mycelium_side',{k:'noise',c:'#7a6a6a'});blk('MYCELIUM','Mycelium','#6f6268',[mt,ms,2]);}
  // ---- the Nether ----
  {const t1=tile('quartz_ore',{k:'ore',c:'#e8e0d8'});blk('QUARTZ_ORE','Nether Quartz Ore','#b06a5a',[t1,t1,t1]);}
  cross('NETHER_WART','Nether Wart','#a02020','nether_wart_stage_2');
  {const nb=BD[B.NETHER_BRICK].side;blk('NB_FENCE','Nether Brick Fence','#3a1c20',[nb,nb,nb],{opaque:false,fence:true,shape:[[6/16,0,6/16,10/16,1,10/16]],col:[[6/16,0,6/16,10/16,1.5,10/16]]});}
  {const pt=tile('portal',{k:'portal',c:'#6a20d0'});
    blk('PORTAL_X','Nether Portal','#7a30e0',[pt,pt,pt],{solid:false,opaque:false,light:11,portal:'x',shape:[[0,0,6/16,1,1,10/16]]});
    blk('PORTAL_Z',null,'#7a30e0',[pt,pt,pt],{solid:false,opaque:false,light:11,portal:'z',shape:[[6/16,0,0,10/16,1,1]]});}
  {const t1=tile('mob_spawner',{k:'cage',c:'#2a3a4a'});blk('SPAWNER','Monster Spawner','#2a3a4a',[t1,t1,t1],{opaque:false});}
  {const t1=tile('fire_layer_0',{k:'fire',c:'#f08020'});blk('FIRE','Fire','#f08020',[t1,t1,t1],{solid:false,opaque:false,cross:true,light:15,fire:true});}
  // ---- the End ----
  {const ft=tile('endframe_top',{k:'noise',c:'#3a6a5a'}),fs=tile('endframe_side',{k:'noise',c:'#c8c890'}),fe=tile('endframe_eye',{k:'eye',c:'#2a8a70'});const es=BD[B.END_STONE].side;
    blk('END_FRAME','End Portal Frame','#3a6a5a',[ft,fs,es],{opaque:false,shape:[[0,0,0,1,13/16,1]],col:[[0,0,0,1,13/16,1]]});
    blk('END_FRAME_EYE',null,'#3a6a5a',[ft,fs,es],{opaque:false,shape:[[0,0,0,1,13/16,1],[4/16,13/16,4/16,12/16,1,12/16,fe]],col:[[0,0,0,1,1,1]],light:1});
    const ep=tile('~end_portal',{k:'stars',c:'#0a0a18'});
    blk('END_PORTAL','End Portal','#0a0a18',[ep,ep,ep],{solid:false,opaque:false,light:15,endPortal:true,shape:[[0,0,0,1,12/16,1]]});}
  {const t1=tile('dragon_egg',{k:'noise',c:'#180c20'});
    const egg=[[6,15,6,10,16,10],[5,14,5,11,15,11],[4,13,4,12,14,12],[3,11,3,13,13,13],[2,8,2,14,11,14],[1,3,1,15,8,15],[2,1,2,14,3,14],[3,0,3,13,1,13]].map(a=>a.map(v=>v/16));
    blk('DRAGON_EGG','Dragon Egg','#180c20',[t1,t1,t1],{opaque:false,shape:egg,col:[[1/16,0,1/16,15/16,1,15/16]],light:1});}
  // ---- flowing water and lava: one block per level (1 = next to the source .. 7 = the thin edge, 8 = falling) ----
  VB.waterF=[B.WATER];VB.lavaF=[B.LAVA];
  BD[B.WATER].flow=0;BD[B.LAVA].flow=0;BD[B.WATER].lh=.875;BD[B.LAVA].lh=.875;
  for(let L=1;L<=8;L++){const W=BD[B.WATER],La=BD[B.LAVA];const lh=L===8?.875:Math.max(.12,(8-L)/9);
    def(id,W.top,W.side,W.bottom,{solid:false,opaque:false,liquid:'water',flow:L,lh});BLOCK_COL[id]=BLOCK_COL[B.WATER];VB.waterF[L]=id;MINE_DROP_LATE.push([id,null]);id++;
    def(id,La.top,La.side,La.bottom,{solid:false,opaque:false,liquid:'lava',light:15,flow:L,lh});BLOCK_COL[id]=BLOCK_COL[B.LAVA];VB.lavaF[L]=id;MINE_DROP_LATE.push([id,null]);id++;}
  // ---- beds: 4 facings x (foot, head); the top art is turned to match ----
  {const sides={fs:tile('bed_feet_side',{k:'bedside',c:'#8a2020'}),hs:tile('bed_head_side',{k:'bedside',c:'#8a2020'}),fe:tile('bed_feet_end',{k:'bedside',c:'#8a2020'}),he:tile('bed_head_end',{k:'bedside',c:'#8a2020'})};
    const tops={f:[tile('bed_feet_top',{k:'bedtop',c:'#b02828'})],h:[tile('bed_head_top',{k:'bedtop',c:'#b02828',pillow:1})]};
    for(let r=1;r<4;r++){tops.f[r]=tile('~bed_feet_top_r'+r,{k:'bedtop',c:'#b02828',rot:r});tops.h[r]=tile('~bed_head_top_r'+r,{k:'bedtop',c:'#b02828',pillow:1,rot:r});}
    VB.bed=[];const plank=BD[B.PLANKS].side;
    for(let f=0;f<4;f++)for(const part of ['f','h']){const o={opaque:false,bed:part,facing:f,shape:[[0,3/16,0,1,9/16,1],[0,0,0,3/16,3/16,3/16,plank],[13/16,0,13/16,1,3/16,1,plank],[13/16,0,0,1,3/16,3/16,plank],[0,0,13/16,3/16,3/16,1,plank]],col:[[0,0,0,1,9/16,1]]};
      blk(part==='f'&&f===0?'BED':'BED_'+part+f,part==='f'&&f===0?'Bed':null,'#b02828',[tops[part][(f+1)%4],part==='f'?sides.fs:sides.hs,plank,part==='f'?sides.fe:sides.he],o);VB.bed.push(id-1);}}
  VB.lastId=id-1;
}
const isWaterB=b=>!!b&&BD[b]&&BD[b].liquid==='water',isLavaB=b=>!!b&&BD[b]&&BD[b].liquid==='lava';
const isSourceB=b=>b===B.WATER||b===B.LAVA;
// procedural stand-ins (only when no resource pack is loaded)
{const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];const sh=(c,f)=>c.map(v=>Math.max(0,Math.min(255,v*f|0)));
  const prev=procTileX;
  procTileX=function(t,x,y){const D=NEWT[t];if(!D||!['bark','ring','leaves','plant','cactus','ore','portal','cage','fire','eye','stars','bedside','bedtop'].includes(D.k))return prev(t,x,y);
    const c=D.c?hx(D.c):[128,128,128];const n=hash2(x,y,t*7+3);
    switch(D.k){
    case 'bark':return sh(c,(x%4===0?.75:.95)+n*.15);
    case 'ring':{const r=Math.hypot(x-7.5,y-7.5);return sh(c,(r%3<1?.8:1)+n*.1);}
    case 'leaves':return n<.18?[0,0,0,0]:sh(c,.75+n*.4);
    case 'plant':{const stem=Math.abs(x-7.5)<1&&y>6;const head=Math.hypot(x-7.5,y-5)<3;return stem?[60,130,40]:head?sh(c,.9+n*.2):[0,0,0,0];}
    case 'cactus':return x===1||x===14?[0,0,0,0]:(x+y)%5===0?[220,220,180]:sh(c,.85+n*.25);
    case 'ore':return n<.2?sh(c,1):[110,50,45].map(v=>v*(.85+n*.3)|0);
    case 'portal':{const v=Math.sin((x+y)*.7)*.5+.5;return [90+v*60|0,20+v*30|0,180+v*60|0];}
    case 'cage':return (x%4===0||y%4===0)?[40,50,60]:[0,0,0,0];
    case 'fire':{const hgt=16-y;return hgt<4+n*10?[255,120+n*100|0,20]:[0,0,0,0];}
    case 'eye':return Math.hypot(x-7.5,y-7.5)<3?[30,140,110]:[0,0,0,0];
    case 'stars':return n<.04?[200,220,255]:[8+n*10|0,10+n*10|0,24+n*16|0];
    case 'bedside':return y<8?sh(c,.9+n*.15):y<12?[200,190,170]:[110,80,50];
    case 'bedtop':{const r=D.rot|0;const sx=r===1?y:r===2?15-x:r===3?15-y:x;return D.pillow&&sx>=8?[230,230,230]:sh(c,.9+n*.15);}}
    return prev(t,x,y);};}
atlasCanvas=makeProcAtlas();
