// ================= Survival crafting: recipes, 2x2 inventory grid, crafting table (3x3), furnace, chests, tool abilities and durability =================
// ---------- recipes ----------
const PLANKS=['b6','b52','b80','b88'],COBBLE=['b9','b91'];
const RECIPES=[];
// shaped: rows of keys (space = empty); keys map to an item id or a list of accepted ids. Mirrored shapes match too.
function shaped(rows,keys,out,n=1){RECIPES.push({rows,keys,out,n});}
function shapeless(ins,out,n=1){RECIPES.push({ins,out,n});}
for(const [log,pl] of [['b4','b6'],['b51','b52'],['b64','b6'],['b78','b80'],['b86','b88'],['b102','b52']])shapeless([log],pl,4);
shapeless(['b92'],'coal',1);
shaped(['P','P'],{P:PLANKS},'stick',4);
shaped(['PP','PP'],{P:PLANKS},'b117');
shaped(['PPP','P P','PPP'],{P:PLANKS},'b8');
shaped(['CCC','C C','CCC'],{C:COBBLE},'b118');
shaped(['C','S'],{C:['coal','crystal_shard'],S:'stick'},'b54',4);
shaped(['PPP'],{P:'b6'},'b50',6);shaped(['SSS'],{S:'b20'},'b66',6);shaped(['SSS'],{S:'b19'},'b65',6);
shaped(['PSP','PSP'],{P:PLANKS,S:'stick'},'b53',3);
shaped(['SS','SS'],{S:'b3'},'b20',4);shaped(['SS','SS'],{S:'b7'},'b19');shaped(['SS','SS'],{S:'b20'},'b22',1);
shaped(['CC','CC'],{C:'crystal_shard'},'b83');shaped(['GG','GG'],{G:'b98'},'b17');shaped(['GG','GG'],{G:'b97'},'b17');
shapeless(['b9','b76'],'b14');shapeless(['b20','b76'],'b21');
shaped(['GGG','GAG','GGG'],{G:'gold_ingot',A:'apple'},'golden_apple');
// storage blocks and back
for(const [m,b] of [['coal','b59'],['gold_ingot','b23'],['diamond','b24'],['ruby','b119'],['sapphire','b120'],['cobalt_ingot','b121'],['mythril_ingot','b122'],['amethyst_steel','b123']]){
  shaped(['MMM','MMM','MMM'],{M:m},b);shapeless([b],m,9);}
// tools: wood, stone, iron, gold, diamond, ruby, amethyst steel, mythril
const TOOL_MATS=[['wood',PLANKS],['stone',COBBLE],['iron','iron_ingot'],['golden','gold_ingot'],['diamond','diamond'],['ruby','ruby'],['amethyst','amethyst_steel'],['mythril','mythril_ingot']];
for(const [t,m] of TOOL_MATS){const K={M:m,S:'stick'};
  shaped(['MMM',' S ',' S '],K,t+'_pickaxe');shaped(['MM','MS',' S'],K,t+'_axe');shaped(['M','M','S'],K,t+'_sword');shaped(['M','S','S'],K,t+'_shovel');}
// armour: iron, gold, diamond, cobalt
for(const [t,m] of [['iron','iron_ingot'],['golden','gold_ingot'],['diamond','diamond'],['cobalt','cobalt_ingot']]){const K={M:m};
  shaped(['MMM','M M'],K,t+'_helmet');shaped(['M M','MMM','MMM'],K,t+'_chestplate');shaped(['MMM','M M','M M'],K,t+'_leggings');shaped(['M M','M M'],K,t+'_boots');}
// sapphire enchanting: any sword, axe, pickaxe, shovel or armour piece + a sapphire = the next enchantment level
function sapphireEnchant(id){const it=ITEMS[id];if(!it)return null;const base=it.base||id;const kind=it.tool==='pickaxe'||it.tool==='shovel'?'efficiency':it.tool==='sword'||it.tool==='axe'?'sharpness':it.type==='armor'?'protection':it.type==='bow'?'power':null;
  if(!kind)return null;const lv=enchLvl(id,kind);if(lv>=3)return null;const out=enchId(base,kind+(lv+1));return ITEMS[out]?out:null;}
// match the grid (array of n*n stacks) against the recipes: returns {out,n} or null
function matchRecipe(grid,n){const ids=grid.map(s=>s?s.id:null);let r0=n,r1=-1,c0=n,c1=-1;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(ids[r*n+c]){r0=Math.min(r0,r);r1=Math.max(r1,r);c0=Math.min(c0,c);c1=Math.max(c1,c);}
  if(r1<0)return null;const H=r1-r0+1,W=c1-c0+1;const at=(r,c)=>ids[(r0+r)*n+c0+c];const full=ids.filter(Boolean);
  if(full.length===2){const sap=full.indexOf('sapphire');if(sap>=0){const e=sapphireEnchant(full[1-sap]);if(e)return {out:e,n:1};}}
  const ok=(k,id)=>Array.isArray(k)?k.includes(id):k===id;
  for(const R of RECIPES){
    if(R.ins){if(R.ins.length!==full.length)continue;const left=full.slice();let good=true;for(const k of R.ins){const i=left.findIndex(id=>ok(k,id));if(i<0){good=false;break;}left.splice(i,1);}if(good)return {out:R.out,n:R.n};continue;}
    if(R.rows.length!==H||R.rows[0].length!==W)continue;
    for(const mirror of [false,true]){let good=true;
      for(let r=0;r<H&&good;r++)for(let c=0;c<W;c++){const ch=R.rows[r][mirror?W-1-c:c];const id=at(r,c);if(ch===' '){if(id){good=false;break;}}else if(!id||!ok(R.keys[ch],id)){good=false;break;}}
      if(good)return {out:R.out,n:R.n};}}
  return null;}
// ---------- furnace ----------
const SMELT={raw_iron:'iron_ingot',raw_gold:'gold_ingot',raw_cobalt:'cobalt_ingot',raw_mythril:'mythril_ingot',b7:'b11',b9:'b3',b4:'coal',b51:'coal',b64:'coal',b78:'coal',b86:'coal',b102:'coal',b19:'b62',b20:'b60',b90:'b91',b84:'crystal_shard'};
const FUEL={coal:80,b59:800,stick:5,b117:15,b8:15,b53:15,b92:20,b93:40};for(const p of PLANKS)FUEL[p]=15;for(const l of ['b4','b51','b64','b78','b86','b102'])FUEL[l]=15;
const COOK_T=8;let FURN=new Map();
function furnAt(k){let f=FURN.get(k);if(!f){f={in:null,fuel:null,out:null,burn:0,burnMax:0,cook:0};FURN.set(k,f);}return f;}
function tickFurnaces(dt){for(const [k,f] of FURN){const can=f.in&&SMELT[f.in.id]&&(!f.out||(f.out.id===SMELT[f.in.id]&&f.out.count<(ITEMS[f.out.id].stack||64)));
    if(f.burn<=0&&can&&f.fuel&&FUEL[f.fuel.id]){f.burn=f.burnMax=FUEL[f.fuel.id];f.fuel.count--;if(!f.fuel.count)f.fuel=null;}
    if(f.burn>0){f.burn-=dt;if(can){f.cook+=dt;if(f.cook>=COOK_T){f.cook=0;const o=SMELT[f.in.id];if(f.out)f.out.count++;else f.out={id:o,count:1};f.in.count--;if(!f.in.count)f.in=null;}}else f.cook=0;}
    else f.cook=Math.max(0,f.cook-dt*2);}
  if(CR.open&&CR.mode==='furnace'&&(CR.tickT=(CR.tickT||0)+dt)>.25){CR.tickT=0;craftRender();}}
// ---------- chests you place ----------
function survChestAdd(x,y,z){const k=key(x,y,z);if(!chests.has(k))chests.set(k,{x,y,z,rot:null,lid:0,lidPrev:0,items:new Array(CHEST_SLOTS).fill(null)});}
function survContainerGone(x,y,z,was){const k=key(x,y,z);
  if(was===B.CHEST){const c=chests.get(k);if(c){if(dropAuth())for(const s of c.items)if(s)hostSpawnDrop([x+.5,y,z+.5],s.id,s.count);chests.delete(k);if(chestOpen===c)chestClose(false);}}
  if(was===B.FURNACE){const f=FURN.get(k);if(f){for(const s of [f.in,f.fuel,f.out])if(s)requestDrop([x+.5,y-.5,z+.5],s.id,s.count);FURN.delete(k);if(CR.open&&CR.fk===k)craftClose();}}}
// ---------- durability and the new tools' abilities ----------
function wearHeld(p,n){const s=p.inv[p.sel];if(!s||MATCH.mode!=='survival'||p.gm==='creative')return;const m=maxDur(s.id);if(!m)return;s.dmg=(s.dmg||0)+n;
  if(s.dmg>=m){p.inv[p.sel]=null;sfx('glass',{vol:.6});chatMsg('Your '+ITEMS[s.id].name+' broke!','#ffaa55',false);spawnParticles(p.pos[0],p.pos[1]+1.2,p.pos[2],10,[.6,.6,.6],2);}}
const cobaltSet=e=>MATCH.mode==='survival'&&e.armor&&e.armor.every(a=>a&&ITEMS[a]&&ITEMS[a].tier===COBALT_TIER);
// a block was broken with tool id: the extra blocks the ability takes (they drop items too)
const LOG_BLOCKS=new Set([4,51,64,78,86,92,102,96]),ORE_BLOCKS=new Set([104,105,106,107,108,109,110,111,112,84,59]);
function abilityBreak(x,y,z,b,id,p){const tier=toolTier(id),it=ITEMS[id];if(!it)return;let extra=[];
  if(tier==='mythril'&&((it.tool==='pickaxe'&&ORE_BLOCKS.has(b))||(it.tool==='axe'&&LOG_BLOCKS.has(b)))){const max=it.tool==='axe'?128:32;const seen=new Set([key(x,y,z)]);const q=[[x,y,z]];
    while(q.length&&extra.length<max){const [cx,cy,cz]=q.shift();for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy&&!dz)continue;const nx=cx+dx,ny=cy+dy,nz=cz+dz,k=key(nx,ny,nz);if(seen.has(k))continue;seen.add(k);
      if(getB(nx,ny,nz)===b){extra.push([nx,ny,nz]);q.push([nx,ny,nz]);}}}}
  else if(tier==='amethyst'&&(it.tool==='pickaxe'||it.tool==='shovel')){const f=fwd(p);const ax=Math.abs(f[0]),ay=Math.abs(f[1]),az=Math.abs(f[2]);const m=ay>ax&&ay>az?1:ax>az?0:2;
    const ok=it.tool==='pickaxe'?PICK_BLOCKS:SHOVEL_BLOCKS;for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){if(!a&&!c)continue;const d=m===0?[0,a,c]:m===1?[a,0,c]:[a,c,0];const nx=x+d[0],ny=y+d[1],nz=z+d[2];const nb=getB(nx,ny,nz);
      if(nb&&ok.has(nb)&&mineTime(nb,id)!=null&&nb!==B.CHEST&&nb!==B.FURNACE)extra.push([nx,ny,nz]);}}
  for(const [ex,ey,ez] of extra){const nb=getB(ex,ey,ez);if(!nb)continue;setBlockNet(ex,ey,ez,0);survDrop(ex,ey,ez,nb,id);wearHeld(p,1);if(!p.inv[p.sel])break;}
  if(extra.length)sfx('dig',{pos:[x,y,z],mat:blockMat(b)});}
function survDrop(x,y,z,b,id){extraDrops(x,y,z,b,id);let d=mineDrops(b,id);if(!d)return;if(toolTier(id)==='ruby'&&ITEMS[id].tool==='pickaxe'&&SMELT[d])d=SMELT[d];
  requestDrop([x+.5,y-.6,z+.5],d,1,[(Math.random()-.5)*1.5,2.5,(Math.random()-.5)*1.5]);if(BD[b].leaves&&Math.random()<.06)requestDrop([x+.5,y-.6,z+.5],b===B.LEAVES?'apple':'stick',1);}
// ---------- the crafting / furnace screen ----------
const CR={open:false,mode:'inv',n:2,grid:[],cur:null,fk:null,hover:null};
function craftOpen(mode,fk){if(!player||!player.alive)return false;CR.open=true;CR.mode=mode;CR.n=mode==='table'?3:2;CR.grid=new Array(CR.n*CR.n).fill(null);CR.fk=fk||null;CR.cur=null;
  chestOpen={inv:true,craft:true};sfx(mode==='inv'?'click':'chest');document.exitPointerLock&&document.exitPointerLock();show('craftUI');craftRender();return true;}
function giveBack(s){if(!s)return;if(stackMax(s.id)===1&&ITEMS[s.id].type!=='armor'){const f=player.inv.findIndex(x=>!x);if(f>=0){player.inv[f]=s;return;}requestDrop([player.pos[0],player.pos[1]+.4,player.pos[2]],s.id,1);return;}
  const left=addItem(player,s.id,s.count);if(left)requestDrop([player.pos[0],player.pos[1]+.4,player.pos[2]],s.id,left);}
function craftClose(){if(!CR.open)return;CR.open=false;for(const s of CR.grid)giveBack(s);CR.grid=[];giveBack(CR.cur);CR.cur=null;hide('craftUI');$('cursorItem').textContent='';}
function craftResult(){if(CR.mode==='furnace')return null;return matchRecipe(CR.grid,CR.n);}
function stackCanvas(s){const c=slotCanvas(s.id,s.count);const m=maxDur(s.id);if(s.dmg&&m){const g=c.getContext('2d'),S=GS,f=1-s.dmg/m;g.fillStyle='#000';g.fillRect(3*S,15*S,13*S,2*S);
    g.fillStyle=`hsl(${Math.round(f*120)},90%,50%)`;g.fillRect(3*S,15*S,Math.max(1,Math.round(13*S*f)),S);}return c;}
function slotDiv(kind,i,s,extra){const d=document.createElement('div');d.className='slot'+(extra?' '+extra:'');d.dataset.k=kind;d.dataset.i=i;if(s&&ITEMS[s.id]){d.dataset.n=ITEMS[s.id].name;d.dataset.e=itemTipLines(s.id).join('|');d.dataset.a=ITEMS[s.id].ench?1:0;d.appendChild(stackCanvas(s));}return d;}
function craftSlots(){const f=CR.mode==='furnace'?furnAt(CR.fk):null;return {f};}
function craftRender(){if(!CR.open)return;const box=$('craftTop');box.textContent='';const S=GS;const p=player;
  pxSet($('craftHead'),CR.mode==='table'?'Crafting':CR.mode==='furnace'?'Furnace':(myName||'Inventory'),'#404040',false);
  if(CR.mode!=='table'&&CR.mode!=='furnace'){const a=document.createElement('div');a.className='lsub';const l=document.createElement('div');l.className='lab left';pxSet(l,'Armour','#404040',false);
    const g=document.createElement('div');g.className='lgrid g4';p.armor.forEach((id,i)=>g.appendChild(slotDiv('a',i,id?{id,count:1}:null)));a.append(l,g);box.appendChild(a);}
  const c=document.createElement('div');c.className='lsub';const l=document.createElement('div');l.className='lab left';pxSet(l,CR.mode==='furnace'?'Smelting':'Crafting','#404040',false);c.appendChild(l);
  const row=document.createElement('div');row.className='crow';
  if(CR.mode==='furnace'){const f=furnAt(CR.fk);const col=document.createElement('div');col.className='fcol';col.appendChild(slotDiv('fi',0,f.in));
      const fl=document.createElement('canvas');fl.width=fl.height=14;const fg=fl.getContext('2d');const bf=f.burnMax?Math.max(0,f.burn/f.burnMax):0;fg.fillStyle='#555';fg.fillRect(3,2,8,11);fg.fillStyle='#ff9a20';fg.fillRect(3,2+11*(1-bf),8,11*bf);fg.fillStyle='#ffe060';fg.fillRect(5,4+11*(1-bf),4,Math.max(0,9*bf));fl.className='fflame';col.appendChild(fl);
      col.appendChild(slotDiv('ff',0,f.fuel));row.appendChild(col);row.appendChild(arrowCanvas(f.cook/COOK_T));row.appendChild(slotDiv('fo',0,f.out,'big'));}
  else{const b=document.createElement('button');b.className='sbtn';pxSet(b,'Open Crafting (C)','#404040',false);b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();lcOpen(true);});
    const g=document.createElement('div');g.className='lgrid';g.style.gridTemplateColumns='repeat(2,calc(var(--S)*18px))';for(let i=0;i<4;i++){const ic=lcIconSlot(['b6','b117','stick','b54'][i]);ic.classList.add('dim');g.appendChild(ic);}row.append(g,b);}
  c.appendChild(row);box.appendChild(c);
  // inventory: the backpack (9-35) above the hotbar (0-8)
  const ig=$('cInv');ig.textContent='';for(let i=9;i<36;i++)ig.appendChild(slotDiv('p',i,p.inv[i]));const hb=$('cHot');hb.textContent='';for(let i=0;i<9;i++)hb.appendChild(slotDiv('p',i,p.inv[i],i===p.sel?'sel':''));
  setPrompts('craftPrompts',[['Click','Pick up / place'],['Right click','Split / place one'],['Shift','Quick move']].concat(CR.mode==='inv'?[['C','Crafting',()=>lcOpen(true)]]:[]).concat([['E','Exit',()=>chestClose(true)]]));
  craftCursor();}
function arrowCanvas(f){const c=document.createElement('canvas');c.width=22;c.height=15;c.className='carrow';const g=c.getContext('2d');g.fillStyle='#8b8b8b';g.fillRect(0,5,15,5);g.beginPath();g.moveTo(14,0);g.lineTo(22,7.5);g.lineTo(14,15);g.fill();
  if(f>0){g.save();g.beginPath();g.rect(0,0,22*Math.min(1,f),15);g.clip();g.fillStyle='#ffffff';g.fillRect(0,5,15,5);g.beginPath();g.moveTo(14,0);g.lineTo(22,7.5);g.lineTo(14,15);g.fill();g.restore();}return c;}
let crMouse=[0,0];
function craftCursor(){const el=$('cursorItem');el.textContent='';if(!CR.cur)return;el.appendChild(stackCanvas(CR.cur));el.style.left=(crMouse[0]-9*GS)+'px';el.style.top=(crMouse[1]-9*GS)+'px';}
// where a slot lives: returns [get, set, maxStack, accepts(stack)]
function slotRef(kind,i){const p=player,f=CR.fk?furnAt(CR.fk):null;
  if(kind==='p')return [()=>p.inv[i],v=>{p.inv[i]=v;},64,()=>true];
  if(kind==='g')return [()=>CR.grid[i],v=>{CR.grid[i]=v;},64,()=>true];
  if(kind==='fi')return [()=>f.in,v=>{f.in=v;},64,()=>true];
  if(kind==='ff')return [()=>f.fuel,v=>{f.fuel=v;},64,s=>!!FUEL[s.id]];
  if(kind==='fo')return [()=>f.out,v=>{f.out=v;},64,()=>false];
  if(kind==='a')return [()=>p.armor[i]?{id:p.armor[i],count:1}:null,v=>{p.armor[i]=v?v.id:null;},1,s=>ITEMS[s.id].type==='armor'&&ITEMS[s.id].slot===i];
  return null;}
const stackMax=id=>Math.max(1,ITEMS[id].stack||1);
const sameStack=(a,b)=>a&&b&&a.id===b.id&&!a.dmg&&!b.dmg;
function slotClick(kind,i,right,shift){const p=player;
  if(kind==='o'){const r=craftResult();if(!r)return;const take=()=>{for(let k=0;k<CR.grid.length;k++){const s=CR.grid[k];if(!s)continue;s.count--;if(!s.count)CR.grid[k]=null;}};
    if(shift){let guard=64;while(guard--){const r2=craftResult();if(!r2||r2.out!==r.out)break;if(!invRoom(p,r2.out))break;take();const left=addItem(p,r2.out,r2.n);if(left)requestDrop([p.pos[0],p.pos[1]+.4,p.pos[2]],r2.out,left);}}
    else{if(CR.cur&&(CR.cur.id!==r.out||CR.cur.count+r.n>stackMax(r.out)))return;take();if(CR.cur)CR.cur.count+=r.n;else CR.cur={id:r.out,count:r.n};}
    sfx('pick');craftRender();return;}
  const ref=slotRef(kind,i);if(!ref)return;const [get,set,cap,acc]=ref;let s=get();
  if(kind==='fo'){if(!s)return;if(shift){const left=addItem(p,s.id,s.count);set(left?{id:s.id,count:left}:null);}else if(!CR.cur){CR.cur=s;set(null);}else if(CR.cur.id===s.id){const m=Math.min(s.count,stackMax(s.id)-CR.cur.count);CR.cur.count+=m;s.count-=m;set(s.count?s:null);}sfx('pick');craftRender();return;}
  if(shift&&s){ // quick move
    if(kind==='p'&&CR.mode==='furnace'){const f=furnAt(CR.fk);const tgt=FUEL[s.id]&&!SMELT[s.id]?'fuel':'in';const cur=f[tgt];if(!cur){f[tgt]=s;set(null);}else if(sameStack(cur,s)){const m=Math.min(s.count,stackMax(s.id)-cur.count);cur.count+=m;s.count-=m;set(s.count?s:null);}}
    else if(kind==='p'){const range=i<9?[9,36]:[0,9];set(null);let left=s.count;
      for(let j=range[0];j<range[1]&&left;j++){const t=p.inv[j];if(sameStack(t,s)&&t.count<stackMax(s.id)){const m=Math.min(left,stackMax(s.id)-t.count);t.count+=m;left-=m;}}
      for(let j=range[0];j<range[1]&&left;j++)if(!p.inv[j]){p.inv[j]=Object.assign({},s,{count:left});left=0;}
      if(left)set(Object.assign({},s,{count:left}));}
    else if(kind==='a'){const f=p.inv.findIndex(x=>!x);if(f>=0){p.inv[f]=s;set(null);}}
    else{set(null);giveBack(s);}
    sfx('pick');craftRender();return;}
  if(!CR.cur){if(!s)return;if(right&&s.count>1){const h=Math.ceil(s.count/2);CR.cur=Object.assign({},s,{count:h});s.count-=h;set(s);}else{CR.cur=s;set(null);}}
  else{const c=CR.cur;if(!acc(c))return;
    if(!s){if(right){set(Object.assign({},c,{count:1}));c.count--;}else{const m=Math.min(c.count,cap===1?1:stackMax(c.id));set(Object.assign({},c,{count:m}));c.count-=m;}if(!c.count)CR.cur=null;}
    else if(sameStack(s,c)){const room=Math.min(cap,stackMax(c.id))-s.count;const m=Math.min(room,right?1:c.count);s.count+=m;c.count-=m;set(s);if(!c.count)CR.cur=null;}
    else if(c.count<=cap){set(c);CR.cur=s;}}
  sfx('click');craftRender();}
$('craftUI').addEventListener('mousedown',e=>{const d=e.target.closest('.slot');if(!d){if(e.target.id==='craftUI'&&CR.cur){const c=CR.cur;CR.cur=null;const fd=fwd(player);requestDrop([player.pos[0],player.pos[1]+.4,player.pos[2]],c.id,c.count,[fd[0]*5,fd[1]*5+2,fd[2]*5]);craftRender();}return;}
  e.preventDefault();slotClick(d.dataset.k,+d.dataset.i,e.button===2,e.shiftKey);});
$('craftUI').addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('mousemove',e=>{crMouse=[e.clientX,e.clientY];if(!CR.open)return;const el=$('cursorItem');if(CR.cur){el.style.left=(e.clientX-9*GS)+'px';el.style.top=(e.clientY-9*GS)+'px';}
  const d=e.target.closest&&e.target.closest('#craftUI .slot');CR.hover=d?[d.dataset.k,+d.dataset.i]:null;const tip=$('invTip');const n=d&&d.dataset.n;
  if(n&&!CR.cur){pxSet(tip,n,d.dataset.a==='1'?'#55ffff':'#ffffff');const en=d.dataset.e;if(en)for(const l of en.split('|'))tip.appendChild(l[0]==='~'?pxCanvas(l.slice(1),GS,'#7f9fff'):l[0]==='!'?pxCanvas(l.slice(1),GS,'#ff6060'):pxCanvas(l,GS,'#aaaaaa'));
    tip.classList.remove('hidden');tip.style.left=(e.clientX+12*GS/2+6)+'px';tip.style.top=(e.clientY-12*GS)+'px';}else tip.classList.add('hidden');});
// number keys swap the hovered slot with that hotbar slot; Escape closes
addEventListener('keydown',e=>{if(!CR.open)return;if(e.code==='Escape'){chestClose(true);e.preventDefault();return;}
  if(e.code.startsWith('Digit')&&CR.hover&&CR.hover[0]==='p'){const n=+e.code.slice(5)-1;if(n<0||n>8)return;const i=CR.hover[1];const t=player.inv[n];player.inv[n]=player.inv[i];player.inv[i]=t;craftRender();}},true);
// ---------- name tags in Survival ----------
function survNameTags(){for(const e of ents){if(e===player||!e.alive||e.kind!=='player'||e.effects.invis)continue;const d=dist(camPos,e.rpos||e.pos);if(d>(e.sneak?8:64))continue;nameTagMC(e,'#ffffff');}}
