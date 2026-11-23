// ================= Textures for the new blocks and items, made from the loaded resource pack's own art =================
// The pack (Template Resource Pack 1.8) has no sakura wood, rubies tools, cobalt armour etc., so each one is made from the closest
// pack texture, recoloured onto a palette: sakura planks = the pack's oak planks in pink, ruby sword = the pack's diamond sword
// with a ruby blade, ore textures = the pack's diamond ore with new gems, staves = the pack's blaze rod with a gem on top...
function dvCanvas(img){const w=img.width,h=img.width;const c=mkCanvas(w,h),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,0,w,h,0,0,w,h);return c;}
const dvHSV=(r,g,b)=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,d,mx];};
const dvLum=(r,g,b)=>.299*r+.587*g+.114*b;
// remap the chosen pixels' brightness onto a palette (dark -> light)
function dvPal(img,pal,sel){const c=dvCanvas(img),g=c.getContext('2d'),w=c.width,h=c.height;const im=g.getImageData(0,0,w,h),D=im.data;const P=typeof pal==='string'?PAL(pal):pal;
  let mn=255,mx=0;const pick=new Uint8Array(w*h);
  for(let i=0;i<w*h;i++){const r=D[i*4],gg=D[i*4+1],b=D[i*4+2],a=D[i*4+3];if(a<10)continue;if(sel&&!sel(r,gg,b,i%w,(i/w)|0,w))continue;pick[i]=1;const l=dvLum(r,gg,b);if(l<mn)mn=l;if(l>mx)mx=l;}
  const span=Math.max(1,mx-mn);
  for(let i=0;i<w*h;i++){if(!pick[i])continue;const t=(dvLum(D[i*4],D[i*4+1],D[i*4+2])-mn)/span*(P.length-1);const k=Math.min(P.length-2,Math.floor(t)),f=t-k;const A=P[k],Bc=P[k+1];
    D[i*4]=A[0]+(Bc[0]-A[0])*f;D[i*4+1]=A[1]+(Bc[1]-A[1])*f;D[i*4+2]=A[2]+(Bc[2]-A[2])*f;}
  g.putImageData(im,0,0);return c;}
function dvTint(img,hex){return tintCanvas(dvCanvas(img),hex);}
const selSat=th=>(r,g,b)=>dvHSV(r,g,b)[1]>th;
const selHue=(a,b2,th)=>(r,g,b)=>{const [h,s]=dvHSV(r,g,b);return s>th&&h>=a&&h<=b2;};
const selNotBrown=(r,g,b)=>{const [h,s]=dvHSV(r,g,b);return !(h>=10&&h<=50&&s>25);};
// put sprite b (scaled to half size) in the top right of sprite a
function dvTop(a,b,scale=.56){const w=a.width,c=dvCanvas(a),g=c.getContext('2d');g.imageSmoothingEnabled=false;const s=Math.round(w*scale);g.drawImage(b,0,0,b.width,b.width,w-s,0,s,s);return c;}
const PALS={sakuraBark:'2e1a1c 4a2c2e 5c3638 6e4244 7e4e50',sakuraRing:'3a2224 6e4244 c88490 e6b0b8 f0c4cc',sakura:'b8508a d86a9e f093c0 f8b0d4 ffd6ec',sakuraPlank:'7a4a50 b87a7e d89a9c e8b0b0 f4c8c4',
  crystal:'123a88 1f58b8 3f8cf0 7cc0ff c8ecff',redBark:'3a140a 5a2416 82381f a64a28 c06040',redRing:'4a1c10 82381f b06040 d48a64 e8a880',redPlank:'5a2214 8a3a24 ae5434 c86a44 d8845a',
  ash:'4a484c 5e5c62 76747a 8e8c94 a8a6ae',basalt:'1c1c22 2a2a30 3a3a42 4c4c56 60606a',burnt:'0c0a08 1a1410 2a221a 3e3428 54483a',burntTop:'1a1410 3a3026 6a5a4a 8a7a6a',magma:'3a0e04 6a1a06 c8460c f07818 ffc050',
  glowMoss:'241a3c 3a2a5a 54389a 7a54d0 8ae8ff',glowCap:'0e2e80 1e48b0 3a7ae0 70c0ff c0ecff',frozenBark:'3e4a58 5a6a7a 7a8a9c 9eb0c4 c8dcf0',frozenRing:'5a6a7a 8a9aac c8e6f4 e8f8ff',
  ruby:'4a0610 8a0c18 c81828 f03848 ff8898',sapphire:'0a1450 1a2a9a 2a50e0 5a88ff a8c8ff',cobalt:'0e1c38 1c3a6a 2a5aa0 4a80d0 8ab8f0',mythril:'3a7a70 70c8b8 a8f0e0 d8fff6 ffffff',
  amethyst:'2a0a4a 4a1a80 7a34c0 a860f0 d8b0ff',rawIron:'4a2e20 7a5038 a8785a d0a080 ecc4a8',rawGold:'6a4a08 a87a10 e0b020 f5d43a fff080',brass:'4a3010 7a5818 b08a30 d8b450 f0d880',
  iceRod:'2a4a7a 4a78b0 80b8f0 c0e4ff',fireRod:'3a0a04 6a1a08 a83010 d86020',darkRod:'1a0a2a 3a1a5a 5a2a8a 7a44b0',pinkRod:'5a2a36 8a4a5a b87a8a',mint:'2a6a60 5ab0a0 90e0d0 c8fff0 ffffff',pink:'a85a7a d880a8 f0a8c8 ffd0e4',
  glowBlue:'0e3a6a 2a70b0 50b0e8 90e8ff d8ffff',candy:'4a80c0 80b8f0 b8dcff e8f6ff'};
// block tiles: TILE_PACK name -> [source texture (1.8 blocks/), how to recolour]
const DV_TILES={cherry_log:['log_oak',i=>dvPal(i,PALS.sakuraBark)],cherry_log_top:['log_oak_top',i=>dvPal(i,PALS.sakuraRing)],cherry_leaves:['leaves_oak',i=>dvPal(i,PALS.sakura)],cherry_planks:['planks_oak',i=>dvPal(i,PALS.sakuraPlank)],
  '~sakura_grass':['grass_top',i=>{const c=dvTint(i,'#79c05a'),g=c.getContext('2d'),w=c.width;const im=g.getImageData(0,0,w,w);for(let y=0;y<w;y++)for(let x=0;x<w;x++){const p=procTileX(67,(x*16/w)|0,(y*16/w)|0);if(p[0]>200&&p[1]<200){const k=(y*w+x)*4;im.data[k]=p[0];im.data[k+1]=p[1];im.data[k+2]=p[2];}}g.putImageData(im,0,0);return c;}],
  '~crystal':['diamond_block',i=>dvPal(i,PALS.crystal)],'~crystal_ore':['diamond_ore',i=>dvPal(i,PALS.crystal,selSat(25))],'~crystal_grass_top':['grass_top',i=>dvTint(i,'#3cc4cc')],
  '~crystal_grass_side':['grass_side',(i,ov)=>{const c=dvCanvas(i);if(ov){c.getContext('2d').drawImage(dvTint(ov,'#3cc4cc'),0,0,c.width,c.width);}return c;}],
  '~redwood_log':['log_spruce',i=>dvPal(i,PALS.redBark)],'~redwood_log_top':['log_spruce_top',i=>dvPal(i,PALS.redRing)],'~redwood_leaves':['leaves_spruce',i=>dvTint(i,'#3a6a2a')],'~redwood_planks':['planks_spruce',i=>dvPal(i,PALS.redPlank)],
  '~ash':['sand',i=>dvPal(i,PALS.ash)],basalt_side:['stone_andesite',i=>dvPal(i,PALS.basalt)],basalt_top:['stone_andesite_smooth',i=>dvPal(i,PALS.basalt)],
  '~burnt_log':['log_oak',i=>dvPal(i,PALS.burnt)],'~burnt_log_top':['log_oak_top',i=>dvPal(i,PALS.burntTop)],magma:['netherrack',i=>dvPal(i,PALS.magma)],
  '~glow_moss_top':['mycelium_top',i=>dvPal(i,PALS.glowMoss)],'~glow_moss_side':['mycelium_side',i=>dvPal(i,PALS.glowMoss,selNotBrown)],'~glow_cap':['mushroom_block_skin_red',i=>dvPal(i,PALS.glowCap,selSat(40))],
  '~glow_plant':['tallgrass',i=>dvTint(i,'#70f0ff')],'~glow_shroom':['mushroom_red',i=>dvPal(i,PALS.amethyst,selSat(40))],
  '~frozen_log':['log_spruce',i=>dvPal(i,PALS.frozenBark)],'~frozen_log_top':['log_spruce_top',i=>dvPal(i,PALS.frozenRing)],'~frozen_leaves':['leaves_spruce',i=>dvTint(i,'#cfeaf8')],
  '~ruby_ore':['diamond_ore',i=>dvPal(i,PALS.ruby,selSat(25))],'~sapphire_ore':['diamond_ore',i=>dvPal(i,PALS.sapphire,selSat(25))],'~cobalt_ore':['iron_ore',i=>dvPal(i,PALS.cobalt,selSat(25))],
  '~mythril_ore':['diamond_ore',i=>dvPal(i,PALS.mythril,selSat(25))],'~amethyst_steel_ore':['diamond_ore',i=>dvPal(i,PALS.amethyst,selSat(25))],'~fern':['fern',i=>dvTint(i,'#5a9e3a')],
  '~ruby_block':['diamond_block',i=>dvPal(i,PALS.ruby)],'~sapphire_block':['diamond_block',i=>dvPal(i,PALS.sapphire)],'~cobalt_block':['iron_block',i=>dvPal(i,PALS.cobalt)],'~mythril_block':['iron_block',i=>dvPal(i,PALS.mythril)],'~amethyst_steel_block':['diamond_block',i=>dvPal(i,PALS.amethyst)]};
Object.assign(TILE_ALT,{podzol_top:'dirt_podzol_top',podzol_side:'dirt_podzol_side',grass_block_snow:'grass_side_snowed',packed_ice:'ice_packed',dead_bush:'deadbush',mushroom_stem:'mushroom_block_skin_stem',furnace_front:'furnace_front_off'});
async function packDeriveTiles(get,tiles){const blk=n=>get('textures/blocks/'+n+'.png');const ov=await blk('grass_side_overlay');let n=0;
  for(let t=0;t<TILE_PACK.length;t++){if(tiles[t])continue;const r=DV_TILES[TILE_PACK[t]];if(!r)continue;const src=await blk(r[0]);if(!src)continue;try{tiles[t]=r[1](src,ov);n++;}catch(e){}}return n;}
// items: id -> async (get) => canvas
const DV_ITEMS={};
const dvItem=(id,src,fn)=>{DV_ITEMS[id]=[src,fn];};
dvItem('sapphire','items/diamond',i=>dvPal(i,PALS.sapphire));dvItem('amethyst_steel','items/prismarine_shard',i=>dvPal(i,PALS.amethyst));dvItem('crystal_shard','items/prismarine_crystals',i=>dvPal(i,PALS.crystal));
dvItem('raw_iron','items/flint',i=>dvPal(i,PALS.rawIron));dvItem('raw_gold','items/flint',i=>dvPal(i,PALS.rawGold));dvItem('raw_cobalt','items/flint',i=>dvPal(i,PALS.cobalt));dvItem('raw_mythril','items/flint',i=>dvPal(i,PALS.mythril));
dvItem('cobalt_ingot','items/iron_ingot',i=>dvPal(i,PALS.cobalt));dvItem('mythril_ingot','items/iron_ingot',i=>dvPal(i,PALS.mythril));
for(const [t,pal] of [['ruby',PALS.ruby],['amethyst',PALS.amethyst],['mythril',PALS.mythril]])for(const tool of ['sword','axe','pickaxe','shovel'])dvItem(t+'_'+tool,'items/diamond_'+tool,i=>dvPal(i,pal,selHue(120,220,18)));
for(const s of ['helmet','chestplate','leggings','boots'])dvItem('cobalt_'+s,'items/iron_'+s,i=>dvPal(i,PALS.cobalt));
dvItem('sakura_mochi','items/cookie',i=>dvPal(i,PALS.pink));dvItem('glow_stew','items/mushroom_stew',i=>dvPal(i,PALS.glowBlue,selNotBrown));dvItem('crystal_candy','items/sugar',i=>dvPal(i,PALS.candy));
dvItem('glider','items/feather',i=>dvPal(i,PALS.mint));dvItem('ore_scanner','items/compass',i=>dvPal(i,PALS.sapphire));
// staves: the pack's blaze rod in a new colour with a gem on top
const DV_STAFF={builder_wand:[PALS.brass,'items/emerald',i=>dvPal(i,PALS.crystal)],blink_staff:[PALS.darkRod,'items/ender_eye',null],fire_staff:[PALS.fireRod,'items/fireball',null],
  frost_wand:[PALS.iceRod,'items/snowball',null],sakura_staff:[PALS.pinkRod,'blocks/flower_tulip_pink',null],spyglass:[PALS.brass,'items/diamond',i=>dvPal(i,PALS.iceRod)],grapple:['3a3a40 6a6a72 9a9aa4 c8c8d0','items/lead',null]};
async function packDeriveItems(get,icons){let n=0;const tex=p=>get('textures/'+p+'.png');
  for(const id in DV_ITEMS){if(icons[id]||!ITEMS[id])continue;const [src,fn]=DV_ITEMS[id];const img=await tex(src);if(!img)continue;try{icons[id]=imgToCanvas(fn(img),32,32,0,0,img.width,img.width);n++;}catch(e){}}
  const rod=await tex('items/blaze_rod');
  for(const id in DV_STAFF){if(icons[id]||!ITEMS[id]||!rod)continue;const [pal,top,fn]=DV_STAFF[id];const t=await tex(top);if(!t)continue;try{let c;
      if(id==='grapple'){c=dvTop(dvPal(rod,pal),t,.62);}else c=dvTop(dvPal(rod,pal),fn?fn(t):t);icons[id]=imgToCanvas(c,32,32,0,0,c.width,c.width);n++;}catch(e){}}
  // magnet: drawn in the pack's style (16x16 pixels, dark outline)
  if(!icons.magnet&&ITEMS.magnet){const m=['................','..kkkk....kkkk..','..krrk....krrk..','..krrk....krrk..','..kwwk....kwwk..','..kwwk....kwwk..','..krrk....krrk..','..krrk....krrk..',
    '..krrk....krrk..','..krrrk..krrrk..','...krrrkkrrrk...','....krrrrrrk....','.....kkkkkk.....','................','................','................'];
    const c=mkCanvas(16,16),g=c.getContext('2d');const col={k:'#2a0a0a',r:'#d03030',w:'#e8e8e8'};m.forEach((row,y)=>[...row].forEach((ch,x)=>{if(col[ch]){g.fillStyle=ch==='r'&&x%3===0?'#b02020':col[ch];g.fillRect(x,y,1,1);}}));icons.magnet=imgToCanvas(c,32,32,0,0,16,16);n++;}
  return n;}
async function packDeriveArmor(get){if(PACK.armor.cobalt)return 0;const l1=await get('textures/models/armor/iron_layer_1.png'),l2=await get('textures/models/armor/iron_layer_2.png');if(!l1&&!l2)return 0;
  PACK.armor.cobalt={l1:l1?imgToCanvas(dvPal(dvFull(l1),PALS.cobalt),64,32,0,0,l1.width,l1.height):null,l2:l2?imgToCanvas(dvPal(dvFull(l2),PALS.cobalt),64,32,0,0,l2.width,l2.height):null};return 1;}
function dvFull(img){const c=mkCanvas(img.width,img.height);c.getContext('2d').drawImage(img,0,0);return c;}
