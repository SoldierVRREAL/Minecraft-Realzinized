// ---------- a steady clock that keeps running when the tab is in the background ----------
// Browsers slow page timers to once a second in background tabs, and to once a MINUTE after a few minutes there.
// That starved the multiplayer heartbeats and Photon's keep-alive, so servers closed when the host tabbed away for a while.
// A tiny worker's timers are not slowed like that; it ticks every 50 ms and the page does its network upkeep on each tick.
const NK={subs:[],waits:[],t:performance.now(),ok:false};
NK.on=fn=>NK.subs.push(fn);
// a promise that resolves after about ms (paced by the worker, so it also works in the background)
NK.wait=ms=>new Promise(r=>{if(!NK.ok){setTimeout(r,ms);return;}NK.waits.push([performance.now()+ms,r]);});
(function(){try{const src='setInterval(function(){postMessage(0)},50)';const w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
  w.onmessage=()=>{const now=performance.now();NK.t=now;
    if(NK.waits.length){const due=NK.waits.filter(x=>x[0]<=now);NK.waits=NK.waits.filter(x=>x[0]>now);for(const x of due)x[1]();}
    for(const f of NK.subs){try{f(now);}catch(e){}}};
  NK.w=w;NK.ok=true;}catch(e){NK.ok=false;}})();
