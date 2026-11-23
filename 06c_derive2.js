// ================= Pack-made art for the new blocks, items and the mobs =================
Object.assign(PALS,{iceBrick:'4a76b6 6a96d6 8ab2ea b0d0f8 dcecff',snowB:'a8b4c2 c8d2de e2e8f0 f4f7fb ffffff',deer:'2e1c10 5a3a20 8a5a32 b47a48 dcb888',iceWolf:'3a5a7a 6a90b8 a8c8e8 d8ecff ffffff',
  crystalSpider:'0a1a40 123a88 2a6ad0 6ab4ff c8ecff',glowCow:'1a2a5a 2a4a9a 3a7ae0 70c0ff c0ecff',ember:'3a0a04 8a1a08 d84010 f07020 ffb040',radar:'0a3a1a 1a6a30 30a050 60e080 b0ffc8',egg:'c8a040 e8c860 f8e8a0 fffbe8'});
Object.assign(DV_TILES,{'~crystal_bricks':['stonebrick',i=>dvPal(i,PALS.crystal)],'~basalt_bricks':['stonebrick',i=>dvPal(i,PALS.basalt)],'~ash_bricks':['stonebrick',i=>dvPal(i,PALS.ash)],
  '~ice_bricks':['stonebrick',i=>dvPal(i,PALS.iceBrick)],'~snow_bricks':['stonebrick',i=>dvPal(i,PALS.snowB)],'~magma_bricks':['stonebrick',i=>dvPal(i,PALS.magma)],
  '~sakura_lantern':['glowstone',i=>dvPal(i,PALS.sakura)],'~glow_lamp':['redstone_lamp_on',i=>dvPal(i,PALS.glowBlue)],'~mythril_lantern':['sea_lantern',i=>dvPal(i,PALS.mint)]});
dvItem('frost_fang','items/ghast_tear',i=>dvPal(i,PALS.iceRod));dvItem('crystal_silk','items/string',i=>dvPal(i,PALS.crystal));dvItem('glow_spores','items/glowstone_dust',i=>dvPal(i,PALS.glowBlue));
dvItem('fried_egg','items/egg',i=>dvPal(i,PALS.egg));dvItem('frost_berry','items/nether_wart',i=>dvPal(i,PALS.iceRod));dvItem('ember_pepper','items/carrot',i=>dvPal(i,PALS.ember,selNotBrown));
dvItem('crystal_apple','items/apple',i=>dvPal(i,PALS.crystal,selSat(40)));dvItem('spore_bread','items/bread',i=>dvPal(i,PALS.glowMoss));dvItem('magma_jerky','items/beef_cooked',i=>dvPal(i,PALS.magma));
dvItem('totem','items/nether_star',i=>dvPal(i,PALS.brass));dvItem('mob_radar','items/compass',i=>dvPal(i,PALS.radar));dvItem('frost_dagger','items/iron_sword',i=>dvPal(i,PALS.iceRod,selNotBrown));
dvItem('magma_hammer','items/iron_axe',i=>dvPal(i,PALS.magma,selNotBrown));dvItem('crystal_bow','items/bow_standby',i=>dvPal(i,PALS.crystal,selNotBrown));
dvItem('spore_bomb','items/fireworks_charge',i=>dvPal(i,PALS.amethyst));dvItem('frost_bomb','items/snowball',i=>dvPal(i,PALS.iceRod));
// ---- mob skins: the pack's own entity textures; the new mobs are recoloured vanilla ones ----
const MOB_SRC={pig:'pig/pig',cow:'cow/cow',sheep:'sheep/sheep',sheep_fur:'sheep/sheep_fur',chicken:'chicken',zombie:'zombie/zombie',skeleton:'skeleton/skeleton',spider:'spider/spider',spider_eyes:'spider_eyes',
  creeper:'creeper/creeper',wolf:'wolf/wolf',wolf_angry:'wolf/wolf_angry',wolf_collar:'wolf/wolf_collar',magma:'slime/magmacube',mooshroom:'cow/mooshroom'};
// dvPal for a whole (non-square) entity texture
function mobPal(src,pal){const w=src.width,h=src.height,c=mkCanvas(w,h),g=c.getContext('2d');g.drawImage(src,0,0);const sq=mkCanvas(w,w);sq.getContext('2d').drawImage(c,0,0);
  // dvPal works on squares: run it on a square copy (the rest stays transparent) and keep the original height
  const out=dvPal(sq,pal);const r=mkCanvas(w,h);r.getContext('2d').drawImage(out,0,0);return r;}
async function packLoadMobs(get){const raw={};let n=0;
  for(const k in MOB_SRC){const img=await get('textures/entity/'+MOB_SRC[k]+'.png');if(img){raw[k]=dvFull(img);n++;}}
  if(!n)return 0;const M=PACK.mobs={};const fit=c=>{const h=Math.round(64*c.height/c.width);return imgToCanvas(c,64,h,0,0,c.width,c.height);};
  for(const k in raw)M[k]=fit(raw[k]);
  if(raw.cow)M.deer=fit(mobPal(raw.cow,PALS.deer));
  if(raw.spider)M.crystal_spider=fit(mobPal(raw.spider,PALS.crystalSpider));
  if(raw.wolf)M.ice_wolf=fit(mobPal(raw.wolf,PALS.iceWolf));
  if(raw.wolf_angry)M.ice_wolf_angry=fit(mobPal(raw.wolf_angry,PALS.iceWolf));
  if(raw.mooshroom)M.glowshroom=fit(mobPal(raw.mooshroom,PALS.glowCow));
  if(raw.spider_eyes){M.crystal_spider_eyes=fit(tintCanvas(dvFull(raw.spider_eyes),'#60e0ff'));}
  return n?1:0;}
