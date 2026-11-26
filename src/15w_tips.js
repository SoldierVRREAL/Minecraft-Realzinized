// ---------- item names when you point at a slot in any menu ----------
// The tooltip used to live inside the chest screen, so it stayed invisible in the inventory, crafting and furnace screens.
// It now sits on the page itself, follows the mouse in every menu, and on touch screens a tap on a slot shows the name for a moment.
{const tip=$('invTip');document.body.appendChild(tip);tip.style.zIndex='400';
  let tapUntil=0,shown=null;
  const MENUS='#chestUI,#craftUI,#lceCraft';
  const menuOpen=()=>[...document.querySelectorAll(MENUS)].some(m=>!m.classList.contains('hidden'));
  function fill(d){const n=d.dataset.n,en=d.dataset.e||'';const k=n+'|'+en+'|'+d.dataset.a;if(shown===k)return;shown=k;
    pxSet(tip,n,d.dataset.a==='1'?'#55ffff':'#ffffff');
    if(en)for(const l of en.split('|'))tip.appendChild(l[0]==='~'?pxCanvas(l.slice(1),GS,'#7f9fff'):l[0]==='!'?pxCanvas(l.slice(1),GS,'#ff6060'):pxCanvas(l,GS,'#aaaaaa'));}
  function place(x,y,above){tip.classList.remove('hidden');const w=tip.offsetWidth,h=tip.offsetHeight;
    let L=above?x-w/2:x+14,T=above?y-h-10:y-h-4;L=Math.max(4,Math.min(innerWidth-w-4,L));if(T<4)T=above?y+12:y+16;T=Math.min(innerHeight-h-4,T);
    tip.style.left=L+'px';tip.style.top=T+'px';}
  function hide(){tip.classList.add('hidden');shown=null;}
  // runs after the menus' own handlers, so it has the last word
  document.addEventListener('mousemove',e=>{if(performance.now()<tapUntil){if(shown)tip.classList.remove('hidden');return;}if(!menuOpen()){if(!tip.classList.contains('hidden'))hide();return;}
    const d=e.target.closest&&e.target.closest('.slot');if(d&&d.dataset.n){fill(d);place(e.clientX,e.clientY,false);}else hide();});
  document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||!menuOpen())return;const d=e.target.closest&&e.target.closest('.slot');
    if(!d||!d.dataset.n){hide();return;}fill(d);const r=d.getBoundingClientRect();place(r.left+r.width/2,r.top,true);tapUntil=performance.now()+1600;
    clearTimeout(tip._t);tip._t=setTimeout(()=>{if(performance.now()>=tapUntil)hide();},1650);},true);
  {const r0=renderChest;renderChest=function(){const r=r0.apply(this,arguments);if(performance.now()<tapUntil&&shown)tip.classList.remove('hidden');return r;};}   // a tap that moves an item redraws the chest
  setInterval(()=>{if(!tip.classList.contains('hidden')&&!menuOpen())hide();},250);}
