// ================= Creative mode =================
// Every block and item from a tabbed menu, flying (double-tap jump), instant breaking with no drops, blocks never run out,
// no damage or hunger (only the void), and monsters leave you alone. Chosen per world when it is made, and switchable with
// the Game Mode button in the pause menu or the /gamemode chat command (online, only the host can switch).
const CRE={tab:0,q:'',list:[],cats:null,lastSpace:-1,scroll:0};
const creative=()=>!!(player&&player.gm==='creative'&&INF&&MATCH.mode==='survival');
const NATURE=new Set([1,2,3,4,5,7,13,15,16,27,30,31,32,33,34,35,36,51,58,64,76,77,78,79,81,82,83,84,85,86,87,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,
  104,105,106,107,108,109,110,111,112,113,114,115,116,B.PUMPKIN,B.MELON,B.CLAY,B.GRANITE,B.DIORITE,B.ANDESITE]);
const DECOR=new Set([8,11,17,29,37,53,54,55,56,117,118,B.TNT,B.BOOKSHELF,B.HAY,B.JACK,B.SEA_LANTERN,B.JUKEBOX,B.NOTEBLOCK,B.LAMP,B.SAKURA_LANTERN,B.GLOW_LAMP,B.MYTHRIL_LANTERN]);
function creCats(){if(CRE.cats)return CRE.cats;const all=Object.keys(ITEMS).filter(k=>!ITEMS[k].base&&ICONS[k]&&k!=='b28');
  const blockOf=k=>ITEMS[k].type==='block'?ITEMS[k].block:-1;const isWool=k=>/Wool$/.test(ITEMS[k].name);
  const tabs=[
    {name:'Building Blocks',icon:'b20',f:k=>{const b=blockOf(k);return b>=0&&!NATURE.has(b)&&!DECOR.has(b)&&!isWool(k);}},
    {name:'Decoration Blocks',icon:'b'+B.SAKURA_LANTERN,f:k=>{const b=blockOf(k);return b>=0&&(DECOR.has(b)||isWool(k));}},
    {name:'Natural Blocks',icon:'b'+B.SAKURA_GRASS,f:k=>NATURE.has(blockOf(k))},
    {name:'Tools and Gadgets',icon:'diamond_pickaxe',f:k=>{const it=ITEMS[k];return (it.type==='weapon'&&it.tool!=='sword')||it.type==='gadget';}},
    {name:'Combat',icon:'diamond_sword',f:k=>{const it=ITEMS[k];return (it.type==='weapon'&&it.tool==='sword')||it.type==='bow'||it.type==='ammo'||it.type==='armor'||(it.type==='splash'&&!it.egg)||k==='totem';}},
    {name:'Food and Potions',icon:'apple',f:k=>{const it=ITEMS[k];return it.type==='food'||it.type==='potion';}},
    {name:'Materials',icon:'diamond',f:k=>{const it=ITEMS[k];return it.type==='mat'&&k!=='totem'||it.egg;}},
    {name:'Search Items',icon:'compass',search:true,f:()=>true}];
  for(const t of tabs)t.items=all.filter(t.f);return CRE.cats=tabs;}
function creItems(){const T=creCats()[CRE.tab];if(!T.search)return T.items;const q=CRE.q.trim().toLowerCase();return q?T.items.filter(k=>ITEMS[k].name.toLowerCase().includes(q)):T.items;}
function creativeRender(){const p=player,box=$('craftTop');box.textContent='';const S=GS;
  pxSet($('craftHead'),creCats()[CRE.tab].name,'#404040',false);
  const wrap=document.createElement('div');wrap.className='lsub cre';
  // tabs (plus one that switches to the survival inventory for armour)
  const tabs=document.createElement('div');tabs.className='lctabs cretabs';
  creCats().forEach((T,t)=>{const b=document.createElement('div');b.className='lctab'+(t===CRE.tab?' on':'');b.title=T.name;const c=mkCanvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;if(ICONS[T.icon])g.drawImage(ICONS[T.icon],0,0,32,32);b.appendChild(c);
    b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();CRE.tab=t;CRE.scroll=0;sfx('click');craftRender();if(T.search)setTimeout(()=>{const s=$('creSearch');if(s)s.focus();},0);});tabs.appendChild(b);});
  {const b=document.createElement('div');b.className='lctab';b.title='Survival Inventory (armour)';const c=mkCanvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;if(ICONS.b8)g.drawImage(ICONS.b8,0,0,32,32);b.appendChild(c);
    b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();CR.mode='inv';sfx('click');craftRender();});tabs.appendChild(b);}
  wrap.appendChild(tabs);
  if(creCats()[CRE.tab].search){const s=document.createElement('input');s.id='creSearch';s.className='cresearch';s.placeholder='Search...';s.value=CRE.q;s.autocomplete='off';
    s.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){s.blur();}});s.addEventListener('input',()=>{CRE.q=s.value;CRE.scroll=0;crePalette();});wrap.appendChild(s);}
  const pal=document.createElement('div');pal.id='crePal';pal.className='lgrid crepal';pal.addEventListener('scroll',()=>{CRE.scroll=pal.scrollTop;});wrap.appendChild(pal);
  const row=document.createElement('div');row.className='crerow';const tl=document.createElement('div');tl.className='lab left';pxSet(tl,'Destroy Item','#404040',false);const tr=document.createElement('div');tr.className='lgrid';tr.style.gridTemplateColumns='calc(var(--S)*18px)';
  const trash=slotDiv('x',0,null);trash.classList.add('cretrash');tr.appendChild(trash);row.append(tl,tr);wrap.appendChild(row);
  box.appendChild(wrap);crePalette();
  const ig=$('cInv');ig.textContent='';for(let i=9;i<36;i++)ig.appendChild(slotDiv('p',i,p.inv[i]));const hb=$('cHot');hb.textContent='';for(let i=0;i<9;i++)hb.appendChild(slotDiv('p',i,p.inv[i],i===p.sel?'sel':''));
  setPrompts('craftPrompts',[['Click','Take a stack'],['Right click','Take one'],['Shift','Straight into inventory'],['1-9','Put in hotbar'],['E','Exit',()=>chestClose(true)]]);
  craftCursor();}
function crePalette(){const pal=$('crePal');if(!pal)return;pal.textContent='';CRE.list=creItems();
  CRE.list.forEach((id,i)=>{const d=slotDiv('c',i,{id,count:1});pal.appendChild(d);});
  if(!CRE.list.length){const n=document.createElement('div');n.className='lab';pxSet(n,'No items found','#404040',false);pal.appendChild(n);}
  pal.scrollTop=CRE.scroll;}
function creClick(kind,i,right,shift){const p=player;
  if(kind==='x'){if(CR.cur){CR.cur=null;sfx('click');}else if(shift){p.inv.fill(null);sfx('click');}craftRender();return;}
  const id=CRE.list[i];if(!id)return;
  if(CR.cur){CR.cur=null;sfx('click');craftRender();return;}   // dropping a held stack onto the menu throws it away, like Java
  const n=right?1:stackMax(id);
  if(shift){addItem(p,id,n);sfx('pick');}else{CR.cur={id,count:n};sfx('click');}
  craftRender();}
{const sc=slotClick;slotClick=function(kind,i,right,shift){if(CR.mode==='creative'&&(kind==='c'||kind==='x'))return creClick(kind,i,right,shift);return sc(kind,i,right,shift);};}
{const cr=craftRender;craftRender=function(){if(CR.open&&CR.mode==='creative')return creativeRender();cr();
  if(CR.open&&CR.mode==='inv'&&creative()){const b=document.createElement('button');b.className='sbtn';pxSet(b,'Creative Items','#404040',false);
    b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();CR.mode='creative';sfx('click');craftRender();});$('craftTop').appendChild(b);}};}
// number keys over a menu item put a full stack in that hotbar slot
addEventListener('keydown',e=>{if(!CR.open||CR.mode!=='creative'||!CR.hover||CR.hover[0]!=='c')return;if(!e.code.startsWith('Digit'))return;const n=+e.code.slice(5)-1;if(n<0||n>8)return;
  const id=CRE.list[CR.hover[1]];if(!id)return;player.inv[n]={id,count:stackMax(id)};sfx('click');e.stopImmediatePropagation();craftRender();},true);
// ---- breaking: instant, one block every quarter second while held (swords don't break blocks, like Java) ----
function creativeMine(p,dt){p.creT=(p.creT||0)-dt;if(lmbEdge)p.creT=0;if(p.creT>0)return;const h=raycastBlock(eye(p),fwd(p),5,true,true);if(!h)return;
  const held=p.inv[p.sel];if(held&&ITEMS[held.id]&&ITEMS[held.id].tool==='sword')return;breakBlock(h.x,h.y,h.z,p);p.swing=1;p.creT=.25;}
// ---- flying: double-tap jump ----
addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||!locked||chatUI||chestOpen)return;const p=player;if(!creative()||!p.alive)return;
  if(perfT-CRE.lastSpace<.3){p.flying=!p.flying;CRE.lastSpace=-1;if(p.flying&&p.mot)p.mot[1]=Math.max(p.mot[1],.05);}else CRE.lastSpace=perfT;});
// touch and gamepad: double-tap the jump button
function creFlyEdge(p){const rise=p.jump&&!p._jPrev;p._jPrev=p.jump;if(!rise||!(touchActive||padActive))return;if(perfT-CRE.lastSpace<.3){p.flying=!p.flying;CRE.lastSpace=-1;}else CRE.lastSpace=perfT;}
// ---- pick block: middle click puts the block you look at in your hand ----
document.addEventListener('mousedown',e=>{if(e.button!==1||!locked||!player||!player.alive||MATCH.mode!=='survival')return;e.preventDefault();const p=player;
  const h=raycastBlock(eye(p),fwd(p),creative()?5:4.5,true,true);if(!h)return;let b=h.b;if(b>=37&&b<=40)b=37;if(b>=42&&b<=45)b=42;if(b>=46&&b<=49)b=46;if(b>=67&&b<=70)b=67;if(b>=72&&b<=75)b=72;
  const id='b'+b;if(!ITEMS[id])return;const have=p.inv.findIndex((s,i)=>i<9&&s&&s.id===id);if(have>=0){p.sel=have;selShow=2;return;}if(!creative())return;
  let slot=p.inv[p.sel]?p.inv.findIndex((s,i)=>i<9&&!s):p.sel;if(slot<0)slot=p.sel;p.inv[slot]={id,count:stackMax(id)};p.sel=slot;selShow=2;sfx('click');});
// ---- switching game mode ----
function setGameMode(m,quiet){const p=player;if(!p)return;p.gm=m==='creative'?'creative':'survival';if(p.gm!=='creative')p.flying=false;else{p.health=maxHP(p);p.food=20;p.fire=0;}
  if(CR.open&&(CR.mode==='creative'||CR.mode==='inv'))chestClose(false);if(!quiet)chatMsg('Your game mode has been updated to '+(p.gm==='creative'?'Creative':'Survival')+' Mode','#aaaaaa',false);gmBtnRefresh();}
function canSwitchMode(){return MATCH.mode==='survival'&&(!online||isHost()||!!SRV.amOp);}
function gmBtnRefresh(){const b=$('gmBtn');if(!b)return;const on=MATCH.mode==='survival'&&MATCH.state==='play'&&!!player;b.classList.toggle('hidden',!on);if(on){setLbtn(b,'Game Mode: '+(player.gm==='creative'?'Creative':'Survival'));b.disabled=!canSwitchMode();b.title=canSwitchMode()?'':'Only the host can change game modes online';}}
$('gmBtn').addEventListener('click',()=>{if(!canSwitchMode()||!player)return;sfx('click');const g=player.gm==='creative'?'survival':'creative';if(online&&!isHost())runCommand('/gamemode '+g);else setGameMode(g);});
{const sh=show;show=function(id){if(id==='pause')gmBtnRefresh();sh(id);};}
// chat commands live in 15h_servers.js (they run on the server host, with operator permissions)
