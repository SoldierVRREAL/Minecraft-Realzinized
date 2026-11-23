// ================= Anti-cheat: block the developer tools, and reload the page if they are opened or the game is tampered with =================
// When it trips, the page reloads straight away WITHOUT saving, so nothing changed from the console is kept.
const GUARD={tripped:false,speedHits:0,last:null};
function guardTrip(why){if(GUARD.tripped)return;GUARD.tripped=true;try{sessionStorage.setItem('mcr_guard',why);}catch(e){}try{if(net)net.leave();}catch(e){}location.reload();}
(function(){
  if(navigator.webdriver)return;   // automated test browsers
  // keyboard shortcuts for the developer tools / view source
  addEventListener('keydown',e=>{const k=(e.key||'').toUpperCase(),mod=e.ctrlKey||e.metaKey;
    if(e.code==='F12'||(mod&&e.shiftKey&&['I','J','C','K','E'].includes(k))||(mod&&e.altKey&&['I','J','C','U'].includes(k))||(mod&&k==='U')){e.preventDefault();e.stopImmediatePropagation();}},true);
  addEventListener('contextmenu',e=>e.preventDefault(),true);
  // the developer tools are open: a debugger statement only pauses (and so takes time) while they are
  const probe=Function('debugger');
  setInterval(()=>{const t=performance.now();probe();if(performance.now()-t>150)guardTrip('devtools');},1000);
  // things the game itself never does
  setInterval(()=>{const p=player;if(!p||MATCH.state!=='play')return;
    if(p.alive&&p.health>maxHP(p)+.01)return guardTrip('health');
    for(const s of p.inv.concat(p.armor.map(a=>a?{id:a,count:1}:null))){if(!s)continue;const it=ITEMS[s.id];if(!it||!(s.count>=1)||s.count!==Math.floor(s.count)||s.count>Math.max(64,it.stack||1))return guardTrip('items');}
    if(p.food>20||p.sat>20)return guardTrip('food');},700);
  // moving faster than anything in the game allows (teleports from the Blink Staff, grappling hook and respawning are allowed)
  setInterval(()=>{const p=player;if(!p||!p.alive||MATCH.state!=='play'||spectate.mode==='follow'){GUARD.last=null;return;}const now=performance.now(),pos=p.pos.slice();
    if(GUARD.last){const dt=(now-GUARD.last.t)/1000,d=Math.hypot(pos[0]-GUARD.last.p[0],pos[2]-GUARD.last.p[2]);const recent=typeof GZ!=='undefined'&&perfT-(GZ.tp||-99)<1.5;
      if(!recent&&dt>0&&dt<1&&d/dt>45){if(++GUARD.speedHits>=3)return guardTrip('speed');}else GUARD.speedHits=Math.max(0,GUARD.speedHits-.2);}
    GUARD.last={t:now,p:pos};},250);
})();
// after a reload caused by the guard, say why on the title screen
(()=>{let why=null;try{why=sessionStorage.getItem('mcr_guard');sessionStorage.removeItem('mcr_guard');}catch(e){}if(!why)return;
  const d=document.createElement('div');d.className='guardmsg';d.textContent=why==='devtools'?'The game was reloaded because the developer tools were opened. Cheating is not allowed.':'The game was reloaded because cheating was detected.';
  document.body.appendChild(d);setTimeout(()=>d.remove(),9000);})();
