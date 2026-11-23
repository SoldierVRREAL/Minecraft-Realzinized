// ================= Console-style crafting (Legacy Console Edition): group tabs, a row of craftable items, ingredient preview =================
// More recipes: bows and arrows, the unique tools, new foods
shaped([' SV','S V',' SV'],{S:'stick',V:'b76'},'bow');
shaped(['C','S','S'],{C:'crystal_shard',S:'stick'},'arrow',4);
shaped(['  I',' V ','S  '],{I:'iron_ingot',V:'b76',S:'stick'},'grapple');
shaped(['  C',' G ','S  '],{C:'crystal_shard',G:'gold_ingot',S:'stick'},'builder_wand');
shaped(['C C','I I',' I '],{C:'cobalt_ingot',I:'iron_ingot'},'magnet');
shaped(['G','C','G'],{G:'gold_ingot',C:'crystal_shard'},'spyglass');
shaped([' I ','IRI',' I '],{I:'iron_ingot',R:'ruby'},'compass');
shaped([' G ','GRG',' G '],{G:'gold_ingot',R:'ruby'},'clock');
shaped(['  C',' A ','S  '],{C:'crystal_shard',A:'amethyst_steel',S:'stick'},'blink_staff');
shaped(['  M',' R ','S  '],{M:'b93',R:'ruby',S:'stick'},'fire_staff');
shaped(['  P',' Q ','S  '],{P:'b101',Q:'sapphire',S:'stick'},'frost_wand');
shaped(['  F',' P ','S  '],{F:'b81',P:'b80',S:'stick'},'sakura_staff');
shaped(['ICI','IQI'],{I:'iron_ingot',C:'crystal_shard',Q:'sapphire'},'ore_scanner');
shaped(['M M','MMM'],{M:'mythril_ingot'},'glider');
shapeless(['b81','b81','apple'],'sakura_mochi');shapeless(['b98','b97','b96'],'glow_stew');shapeless(['crystal_shard','apple'],'crystal_candy');
const TIERS8=['wood','stone','iron','golden','diamond','ruby','amethyst','mythril'],ARM4=['iron','golden','diamond','cobalt'];
const LC_TABS=[
  {name:'Structures',icon:'b6',entries:[['Planks',['b6','b52','b80','b88']],['Crafting Table',['b117']],['Chest',['b8']],['Furnace',['b118']],['Stone Bricks',['b20','b22','b21']],['Sandstone',['b19']],
    ['Mossy Cobblestone',['b14']],['Crystal Block',['b83']],['Glowstone',['b17']],['Storage Blocks',['b59','b23','b24','b119','b120','b121','b122','b123']]]},
  {name:'Tools and Weapons',icon:'iron_pickaxe',entries:[['Pickaxe',TIERS8.map(t=>t+'_pickaxe')],['Shovel',TIERS8.map(t=>t+'_shovel')],['Axe',TIERS8.map(t=>t+'_axe')],['Sword',TIERS8.map(t=>t+'_sword')],
    ['Bow',['bow']],['Arrows',['arrow']],['Sapphire Enchanting','sapphire']].concat(GADGETS.map(g=>[g[1],[g[0]]]))},
  {name:'Food',icon:'apple',entries:[['Golden Apple',['golden_apple']],['Sakura Mochi',['sakura_mochi']],['Glow Stew',['glow_stew']],['Crystal Candy',['crystal_candy']]]},
  {name:'Armour',icon:'iron_chestplate',entries:[['Helmet',ARM4.map(t=>t+'_helmet')],['Chestplate',ARM4.map(t=>t+'_chestplate')],['Leggings',ARM4.map(t=>t+'_leggings')],['Boots',ARM4.map(t=>t+'_boots')]]},
  {name:'Materials',icon:'stick',entries:[['Sticks',['stick']],['Torches',['b54']],['Coal',['coal']],['Ingots and Gems',['gold_ingot','diamond','ruby','sapphire','cobalt_ingot','mythril_ingot','amethyst_steel']]]},
  {name:'Decoration',icon:'b53',entries:[['Fence',['b53']],['Slabs',['b50','b66','b65']],['Mossy Stone Bricks',['b21']],['Chiseled Stone Bricks',['b22']]]}];
// a recipe as the console screen shows it: 3x3 picture of keys, and how many of each it takes
function lcRecipe(R){if(R.ins){const grid=new Array(9).fill(null);const need=[];R.ins.forEach((k,i)=>{grid[i]=k;const o=Array.isArray(k)?k:[k];const ex=need.find(n=>n.opts.join()===o.join());if(ex)ex.count++;else need.push({opts:o,count:1});});
    return {out:R.out,n:R.n,grid,need,small:R.ins.length<=4};}
  const grid=new Array(9).fill(null),need=[];const H=R.rows.length,W=R.rows[0].length;
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){const ch=R.rows[r][c];if(ch===' ')continue;const k=R.keys[ch];grid[r*3+c]=k;const o=Array.isArray(k)?k:[k];const ex=need.find(n=>n.opts.join()===o.join());if(ex)ex.count++;else need.push({opts:o,count:1});}
  return {out:R.out,n:R.n,grid,need,small:H<=2&&W<=2};}
const LC_REC=RECIPES.map(lcRecipe);
const invCount=id=>player.inv.reduce((a,s)=>a+(s&&s.id===id?s.count:0),0);
function lcHave(rec){const used={};for(const nd of rec.need){let left=nd.count;for(const o of nd.opts){const av=invCount(o)-(used[o]||0);const t=Math.min(av,left);if(t>0){used[o]=(used[o]||0)+t;left-=t;}}if(left>0)return false;}return true;}
// which key in each picture slot to show: the option you have most of
function lcPick(k){if(!k)return null;if(!Array.isArray(k))return k;let best=k[0],bv=-1;for(const o of k){const v=invCount(o);if(v>bv){bv=v;best=o;}}return best;}
function lcMissing(rec){const used={};const miss=new Array(9).fill(false);rec.grid.forEach((k,i)=>{if(!k)return;const opts=Array.isArray(k)?k:[k];let ok=false;for(const o of opts){if(invCount(o)-(used[o]||0)>0){used[o]=(used[o]||0)+1;ok=true;break;}}miss[i]=!ok;});return miss;}
// sapphire enchanting: one variant per enchantable thing you carry
function lcSapphireVariants(){const out=[];const seen=new Set();for(const s of player.inv){if(!s||seen.has(s.id))continue;const e=sapphireEnchant(s.id);if(!e)continue;seen.add(s.id);
    out.push({out:e,n:1,grid:[s.id,'sapphire',null,null,null,null,null,null,null],need:[{opts:[s.id],count:1},{opts:['sapphire'],count:1}],small:true,keepDmg:s.id});}
  if(!out.length)out.push({out:'iron_pickaxe_e_efficiency1',n:1,grid:['iron_pickaxe','sapphire',null,null,null,null,null,null,null],need:[{opts:['iron_pickaxe'],count:1},{opts:['sapphire'],count:1}],small:true});return out;}
const LC={open:false,small:false,tab:1,idx:[0,0,0,0,0,0],vari:{},desc:false};
function lcEntries(t){const T=LC_TABS[t];const out=[];for(const [name,outs] of T.entries){let vars=outs==='sapphire'?lcSapphireVariants():outs.flatMap(o=>LC_REC.filter(r=>r.out===o));
    if(LC.small)vars=vars.filter(v=>v.small);if(vars.length)out.push({name,vars});}return out;}
function lcCur(){const E=lcEntries(LC.tab);if(!E.length)return null;const i=clamp(LC.idx[LC.tab],0,E.length-1);LC.idx[LC.tab]=i;const e=E[i];const key=LC.tab+':'+e.name;
  if(LC.vari[key]==null){const can=e.vars.findIndex(lcHave);LC.vari[key]=can>=0?can:0;}const v=((LC.vari[key]%e.vars.length)+e.vars.length)%e.vars.length;return {E,e,i,key,rec:e.vars[v],v};}
function lcOpen(small){if(!player||!player.alive)return false;if(CR.open)craftClose();LC.open=true;LC.small=!!small;LC.desc=false;chestOpen={inv:true,lce:true};sfx(small?'click':'chest');
  document.exitPointerLock&&document.exitPointerLock();show('lceCraft');lcRender();return true;}
function lcClose(){if(!LC.open)return;LC.open=false;hide('lceCraft');$('invTip').classList.add('hidden');}
function lcIconSlot(id,count,cls){const d=document.createElement('div');d.className='slot'+(cls?' '+cls:'');if(id&&ICONS[id]){d.appendChild(slotCanvas(id,count||1));d.dataset.n=ITEMS[id].name;d.dataset.e=itemTipLines(id).join('|');d.dataset.a=ITEMS[id].ench?1:0;}return d;}
function lcRender(){if(!LC.open)return;const S=GS;
  // tabs
  const tabs=$('lcTabs');tabs.textContent='';LC_TABS.forEach((T,t)=>{const b=document.createElement('div');b.className='lctab'+(t===LC.tab?' on':'');const c=mkCanvas(32,32);const g=c.getContext('2d');g.imageSmoothingEnabled=false;if(ICONS[T.icon])g.drawImage(ICONS[T.icon],0,0,32,32);
    b.appendChild(c);b.title=T.name;b.addEventListener('mousedown',e=>{e.preventDefault();LC.tab=t;sfx('click');lcRender();});tabs.appendChild(b);});
  pxSet($('lcTitle'),LC_TABS[LC.tab].name,'#404040',false);
  const C=lcCur();const row=$('lcRow');row.textContent='';
  if(C)C.E.forEach((e,i)=>{const key=LC.tab+':'+e.name;const v=LC.vari[key]==null?Math.max(0,e.vars.findIndex(lcHave)):((LC.vari[key]%e.vars.length)+e.vars.length)%e.vars.length;const r=e.vars[v];
    const d=lcIconSlot(r.out,1,(i===C.i?'sel':'')+(lcHave(r)?'':' dim'));d.dataset.i=i;d.dataset.k='lc';
    if(i===C.i&&e.vars.length>1){const up=document.createElement('i');up.className='lcup';const dn=document.createElement('i');dn.className='lcdn';d.append(up,dn);}row.appendChild(d);});
  // ingredients
  const grid=$('lcGrid');grid.textContent='';const n=LC.small?2:3;grid.style.gridTemplateColumns=`repeat(${n},calc(var(--S)*18px))`;
  if(C){const miss=lcMissing(C.rec);for(let r=0;r<n;r++)for(let c=0;c<n;c++){const k=C.rec.grid[r*3+c];const d=lcIconSlot(lcPick(k),1,k&&miss[r*3+c]?'miss':'');if(k&&miss[r*3+c]){const w=document.createElement('b');w.className='warn';w.textContent='!';d.appendChild(w);}grid.appendChild(d);}
    pxSet($('lcName'),ITEMS[C.rec.out].name+(C.rec.n>1?' x'+C.rec.n:''),'#404040',false);}
  else pxSet($('lcName'),LC.small?'Use a Crafting Table for more':'','#404040',false);
  const out=$('lcOut');out.textContent='';const can=C&&lcHave(C.rec);{const ag=$('lcArrow').getContext('2d');ag.clearRect(0,0,22,15);ag.fillStyle=can?'#ffffff':'#8b8b8b';ag.fillRect(0,5,15,5);ag.beginPath();ag.moveTo(14,0);ag.lineTo(22,7.5);ag.lineTo(14,15);ag.fill();}out.className='slot big'+(C&&!can?' miss':'');if(C){out.appendChild(slotCanvas(C.rec.out,C.rec.n));out.dataset.n=ITEMS[C.rec.out].name;out.dataset.e=itemTipLines(C.rec.out).join('|');if(!can){const w=document.createElement('b');w.className='warn';w.textContent='!';out.appendChild(w);}}
  const desc=$('lcDesc');desc.classList.toggle('hidden',!LC.desc||!C);if(LC.desc&&C){desc.textContent='';const it=ITEMS[C.rec.out];const lines=[].concat((it.tip||[]),[(it.type==='weapon'&&it.dmg?'Attack damage '+it.dmg:''),(maxDur(C.rec.out)?'Uses: '+maxDur(C.rec.out):''),
    'Needs: '+C.rec.need.map(nd=>nd.count+' '+(ITEMS[lcPick(nd.opts)]||{name:'?'}).name).join(', ')]).filter(Boolean);for(const l of lines){const c=pxCanvas(l,Math.max(1,Math.round(S/2)),'#404040',false);desc.appendChild(c);}}
  // inventory
  const inv=$('lcInv'),hot=$('lcHot');inv.textContent='';hot.textContent='';for(let i=9;i<36;i++){const s=player.inv[i];inv.appendChild(s?slotDivStack(s):lcIconSlot(null));}for(let i=0;i<9;i++){const s=player.inv[i];hot.appendChild(s?slotDivStack(s,i===player.sel?'sel':''):lcIconSlot(null,0,i===player.sel?'sel':''));}
  setPrompts('lcPrompts',[['Click','Craft',()=>lcCraft(false)],['A/D','Item'],['W/S','Material'],['Q/R','Change Group'],['F','Show Description',()=>{LC.desc=!LC.desc;lcRender();}],['Esc','Exit',()=>chestClose(true)]]);}
function slotDivStack(s,cls){const d=document.createElement('div');d.className='slot'+(cls?' '+cls:'');d.appendChild(stackCanvas(s));d.dataset.n=ITEMS[s.id].name;d.dataset.e=itemTipLines(s.id).join('|');d.dataset.a=ITEMS[s.id].ench?1:0;return d;}
function lcCraft(all){const C=lcCur();if(!C)return;let made=0;const p=player;
  for(let k=0;k<(all?64:1);k++){const rec=C.rec;if(!lcHave(rec))break;if(!invRoom(p,rec.out)&&!(rec.keepDmg))break;let dmg=0;
    for(const nd of rec.need){let left=nd.count;const opts=nd.opts.slice().sort((a,b)=>invCount(b)-invCount(a));for(const o of opts){for(let i=0;i<p.inv.length&&left;i++){const s=p.inv[i];if(!s||s.id!==o)continue;if(rec.keepDmg===o&&s.dmg)dmg=s.dmg;const t=Math.min(left,s.count);s.count-=t;left-=t;if(!s.count)p.inv[i]=null;}if(!left)break;}}
    if(rec.keepDmg){const f=p.inv.findIndex(x=>!x);const st={id:rec.out,count:1};if(dmg)st.dmg=dmg;if(f>=0)p.inv[f]=st;else requestDrop([p.pos[0],p.pos[1]+.4,p.pos[2]],rec.out,1);}
    else{const left=addItem(p,rec.out,rec.n);if(left)requestDrop([p.pos[0],p.pos[1]+.4,p.pos[2]],rec.out,left);}
    made++;if(rec.keepDmg)break;}
  if(made){sfx('pick');if(C.e.name==='Sapphire Enchanting')LC.vari[C.key]=0;}else sfx('click',{vol:.4});lcRender();}
function lcMove(dx,dy,dt){const C=lcCur();if(dt){LC.tab=(LC.tab+dt+LC_TABS.length)%LC_TABS.length;sfx('click');lcRender();return;}if(!C)return;
  if(dx){LC.idx[LC.tab]=(C.i+dx+C.E.length)%C.E.length;sfx('click');}if(dy&&C.e.vars.length>1){LC.vari[C.key]=(C.v+dy+C.e.vars.length)%C.e.vars.length;sfx('click');}lcRender();}
$('lceCraft').addEventListener('mousedown',e=>{const d=e.target.closest('.slot');if(!d)return;e.preventDefault();
  if(d.id==='lcOut'){lcCraft(e.shiftKey);return;}
  if(d.dataset.k==='lc'){const i=+d.dataset.i;const C=lcCur();if(C&&C.i===i){if(e.button===2)lcMove(0,1,0);else lcCraft(e.shiftKey);}else{LC.idx[LC.tab]=i;sfx('click');lcRender();}}});
$('lceCraft').addEventListener('contextmenu',e=>e.preventDefault());
$('lceCraft').addEventListener('wheel',e=>{if(!LC.open)return;e.preventDefault();lcMove(0,e.deltaY>0?1:-1,0);},{passive:false});
$('lceCraft').addEventListener('mousemove',e=>{const d=e.target.closest('.slot');const tip=$('invTip');const n=d&&d.dataset.n;
  if(n){pxSet(tip,n,d.dataset.a==='1'?'#55ffff':'#ffffff');const en=d.dataset.e;if(en)for(const l of en.split('|'))tip.appendChild(l[0]==='~'?pxCanvas(l.slice(1),GS,'#7f9fff'):l[0]==='!'?pxCanvas(l.slice(1),GS,'#ff6060'):pxCanvas(l,GS,'#aaaaaa'));
    tip.classList.remove('hidden');tip.style.left=(e.clientX+12*GS/2+6)+'px';tip.style.top=(e.clientY-12*GS)+'px';}else tip.classList.add('hidden');});
addEventListener('keydown',e=>{if(!LC.open)return;const c=e.code;let used=true;
  if(c==='Escape'||c==='KeyC')chestClose(true);else if(c==='ArrowLeft'||c==='KeyA')lcMove(-1,0,0);else if(c==='ArrowRight'||c==='KeyD')lcMove(1,0,0);
  else if(c==='ArrowUp'||c==='KeyW')lcMove(0,-1,0);else if(c==='ArrowDown'||c==='KeyS')lcMove(0,1,0);else if(c==='KeyQ'||(c==='Tab'&&e.shiftKey))lcMove(0,0,-1);else if(c==='KeyR'||c==='Tab')lcMove(0,0,1);
  else if(c==='Space'||c==='Enter')lcCraft(e.shiftKey);else if(c==='KeyF'){LC.desc=!LC.desc;lcRender();}else used=false;
  if(used){e.preventDefault();e.stopPropagation();}},true);
// C opens crafting (2x2 recipes) anywhere in Survival; the crafting table opens the full list
addEventListener('keydown',e=>{if(e.code!=='KeyC'||LC.open||!survival()||!player||!player.alive||e.target&&e.target.tagName==='INPUT')return;if(chestOpen&&!chestOpen.craft)return;if(chestOpen&&chestOpen.craft)chestClose(false);lcOpen(true);});
