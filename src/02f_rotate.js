// ================= Rotatable blocks =================
// A turned block is its own block id (like the four stair facings always were): logs and pillars lie along the axis of the face you click,
// furnaces, pumpkins, dispensers... face you, stairs and slabs go upside down / to the top half when you click high on a side or the
// underside of a block, ladders and item frames hang on the wall you click, rails, anvils and signs follow the way you look, and
// repeaters/comparators point away from you. ROT_BASE maps every turned id back to the block (and item) it came from.
const ROT={},ROT_BASE={},TILE_ROT=[];
const rotBase=b=>ROT_BASE[b]||b;
{let id=VB.lastId+1;const rc={};
  // a turned copy of a tile (drawn into the atlas after the source tile, see atlasPost)
  const rotTile=(src,r)=>{const k=src+':'+r;if(rc[k]!=null)return rc[k];const t=TILE_PACK.length;TILE_PACK.push('~rot'+r+'_'+src);NEWT[t]={k:'noise',c:'#808080'};TILE_ROT.push([t,src,r]);return rc[k]=t;};
  const variant=(base,o)=>{const D=BD[base];BD[id]=Object.assign({},D,o);BLOCK_COL[id]=BLOCK_COL[base];ROT_BASE[id]=base;return id++;};
  // logs and pillars: [Y (the block itself), X, Z]
  const axisB=[B.LOG,B.SPRUCE_LOG,B.JLOG,B.BIRCH_LOG,B.ACACIA_LOG,B.DARK_OAK_LOG,B.SAKURA_LOG,B.REDWOOD_LOG,B.BURNT_LOG,B.FROZEN_LOG,B.HAY,B.BONE,B.QUARTZ_PILLAR,B.BASALT].filter(b=>b!=null&&BD[b]);
  for(const b of axisB){const D=BD[b];const top=D.top,bot=D.bottom,side=D.side,rs=rotTile(side,1);
    ROT[b]={kind:'axis',v:[b,variant(b,{faces:[top,bot,rs,rs,rs,rs]}),variant(b,{faces:[rs,rs,side,side,top,bot]})]};}
  // facing blocks: [front +z (the block itself), front -z, front +x, front -x]
  for(const b of [B.FURNACE,B.PUMPKIN,B.JACK,B.DISPENSER,B.DROPPER].filter(b=>b!=null&&BD[b])){const D=BD[b];const fr=D.front,s=D.side,t=D.top,bo=D.bottom;
    ROT[b]={kind:'face',v:[b,variant(b,{faces:[s,s,t,bo,s,fr]}),variant(b,{faces:[fr,s,t,bo,s,s]}),variant(b,{faces:[s,fr,t,bo,s,s]})]};}
  // stairs: the four existing facings + four upside-down ones
  const stairBot=k=>[[0,0,0,1,.5,.5],[.5,0,0,1,.5,1],[0,0,.5,1,.5,1],[0,0,0,.5,.5,1]][k];
  for(const b of [42,46,67,72].concat(XB.stairs)){const down=[];for(let k=0;k<4;k++){const s=[[0,.5,0,1,1,1],stairBot(k)];down.push(variant(b,{shape:s,col:s}));}
    for(let k=1;k<4;k++)ROT_BASE[b+k]=b;ROT[b]={kind:'stair',up:[b,b+1,b+2,b+3],down};}
  // slabs: bottom (the block itself), top, double
  const SLAB_FULL={};
  for(const b of [41,50,65,66].concat(XB.slabs)){const top=variant(b,{shape:[[0,.5,0,1,1,1]],col:[[0,.5,0,1,1,1]]});const dbl=variant(b,{shape:undefined,col:undefined,opaque:true,dbl:b});ROT[b]={kind:'slab',v:[b,top,dbl]};SLAB_FULL[dbl]=b;}
  // ladders and item frames: on the wall at -z, +x, +z, -x
  ROT[37]={kind:'wall',v:[37,38,39,40]};for(let k=1;k<4;k++)ROT_BASE[37+k]=37;
  ROT[B.ITEM_FRAME]={kind:'wall',v:XB.frames};for(let k=1;k<4;k++)ROT_BASE[XB.frames[k]]=B.ITEM_FRAME;
  // things that line up with the way you look: [along z, along x]
  for(const b of XB.rails){const D=BD[b];const rt=rotTile(D.top,1);ROT[b]={kind:'turn',v:[b,variant(b,{top:rt,bottom:rt,side:rt,flatIcon:D.top})]};}
  ROT[B.ANVIL]={kind:'turn',v:[B.ANVIL,B.ANVIL_Z]};ROT_BASE[B.ANVIL_Z]=B.ANVIL;
  ROT[B.SIGN]={kind:'turn',v:XB.signs};ROT_BASE[XB.signs[1]]=B.SIGN;
  // repeaters and comparators: pointing -z, +x, +z, -x
  for(const b of [B.REPEATER,B.COMPARATOR]){const D=BD[b];const v=[b];for(let r=1;r<4;r++)v.push(variant(b,{top:rotTile(D.top,r)}));ROT[b]={kind:'point',v};}
  // the other halves/states of multi-id blocks also lead back to their item
  for(const first of XB.doors)for(let i=1;i<16;i++)ROT_BASE[first+i]=first;
  for(const first of XB.traps)for(let i=1;i<16;i++)ROT_BASE[first+i]=first;
  for(let i=1;i<7;i++)ROT_BASE[XB.cake[i]]=XB.cake[0];ROT_BASE[XB.lever[1]]=XB.lever[0];ROT_BASE[B.CAULDRON_W]=B.CAULDRON;
  for(const k in XB.crops){const ids=XB.crops[k];for(let i=1;i<ids.length;i++)ROT_BASE[ids[i]]=ids[0];}
  ROT_BASE[B.FARMLAND_WET]=B.FARMLAND;
  VB.SLAB_FULL=SLAB_FULL;VB.lastId=id-1;}
// copy the turned tiles into an atlas (procedural or resource pack), S = tile size in pixels
function atlasPost(g,S){g.imageSmoothingEnabled=false;
  for(const [t,src,r] of TILE_ROT){const sx=(src%ACOLS)*S,sy=Math.floor(src/ACOLS)*S,tx=(t%ACOLS)*S,ty=Math.floor(t/ACOLS)*S;
    g.save();g.clearRect(tx,ty,S,S);g.translate(tx+S/2,ty+S/2);g.rotate(r*Math.PI/2);g.drawImage(g.canvas,sx,sy,S,S,-S/2,-S/2,S,S);g.restore();}}
// the placement rules: which id to put down for block `id`, given the player and the raycast hit
function orientFor(id,p,h){const R=ROT[id];if(!R||!h)return id;const fw=fwd(p);const ax=Math.abs(fw[0])>Math.abs(fw[2]);
  const pl=!!h.plant,nx=pl?0:h.px-h.x,ny=pl?1:h.py-h.y,nz=pl?0:h.pz-h.z;const e=eye(p);const hy=e[1]+fw[1]*h.t-h.py;const high=ny===-1||(ny===0&&hy>.5);
  // look direction as 0:-z 1:+x 2:+z 3:-x
  const L=ax?(fw[0]>0?1:3):(fw[2]>0?2:0);
  switch(R.kind){
  case 'axis':return R.v[ny?0:nx?1:2];
  case 'face':return R.v[[0,3,1,2][L]];          // front faces back toward you
  case 'stair':return (high?R.down:R.up)[[0,1,2,3][L]];
  case 'slab':return R.v[high?1:0];
  case 'wall':{let k;if(ny)k=L;else k=nz===1?0:nx===-1?1:nz===-1?2:3;return R.v[k];}
  case 'turn':return R.v[ax?1:0];
  case 'point':return R.v[L];}
  return id;}
atlasCanvas=makeProcAtlas();
