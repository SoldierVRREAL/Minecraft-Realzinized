// ---------- everyone on a server runs the same version ----------
// Every client builds the world from the seed itself, so two different versions of the game build different terrain:
// a host with an old tab still open and a player on the new page saw different biomes and trees. Now a server only lets in
// players on its own version, and a page that has been open a long time notices when a new version is out.
const verCmp=(a,b)=>{const A=String(a).split('.').map(Number),B=String(b).split('.').map(Number);for(let i=0;i<Math.max(A.length,B.length);i++){const d=(A[i]||0)-(B[i]||0);if(d)return d;}return 0;};
{const p0=srvProps;srvProps=function(){const p=p0();p.gv=GAME_VER;return p;};}
{const s0=netSend;netSend=function(code,data,to){if(code===N.HELLO&&data&&!data.gv&&net&&!isHost())data=Object.assign({},data,{gv:GAME_VER});return s0(code,data,to);};}
{const o0=onNetEvent;onNetEvent=function(code,d,from){
  if(code===N.HELLO&&SRV.hosting&&isHost()&&net&&d&&String(d.gv||'')!==GAME_VER){const theirs=d.gv||'an older version';const older=!d.gv||verCmp(d.gv,GAME_VER)<0;
    srvKick(from,older?'This server is on version '+GAME_VER+' and you have '+theirs+'.\nReload the page (Ctrl+Shift+R, or pull down to refresh on a phone) to update, then join again.'
      :'This server is still on version '+GAME_VER+' and you have '+theirs+'.\nAsk the host to reload their page to update.');
    chatMsg((d.n||'Someone')+' could not join: they have version '+theirs+(older?'':' (newer than yours: reload to update)'),'#ffcc55',false);return;}
  return o0(code,d,from);};}
// the server list marks servers on another version
{const r0=srvRender;srvRender=function(force){r0(force);const box=$('srvList');if(!box)return;for(const row of box.querySelectorAll('[data-key]')){const k=row.dataset.key;
    const all=srvRows();const r=all.rows.concat(all.pub).find(x=>x.key===k);const st=r&&srvStatus(r.addr);const gv=st&&st.r&&st.r.p&&st.r.p.gv;const m=row.querySelector('.smotd,.motd');
    if(gv&&gv!==GAME_VER&&m&&!m.dataset.v){m.dataset.v=1;m.textContent+='  (version '+gv+')';m.style.color='#ffcc55';}}};}
// a new version is out: say so (checks the page itself every 10 minutes, only on a web address)
const VERCHK={seen:null};
function verCheck(){if(!/^https?:$/.test(location.protocol))return;const url=location.href.split('#')[0].split('?')[0]+'?v='+Date.now();
  fetch(url,{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>{const m=/GAME_VER='([0-9.]+)'/.exec(t||'');if(!m||verCmp(m[1],GAME_VER)<=0||VERCHK.seen===m[1])return;VERCHK.seen=m[1];
    let bar=$('verBar');if(!bar){bar=document.createElement('div');bar.id='verBar';bar.style.cssText='position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:500;background:rgba(0,0,0,.82);color:#ffff55;border:2px solid #555;padding:6px 10px;font:14px monospace;display:flex;gap:10px;align-items:center';document.body.appendChild(bar);}
    bar.innerHTML='Version '+esc(m[1])+' is out. <button class="btn small" id="verGo">Reload</button><button class="btn small" id="verNo">Later</button>';
    $('verGo').onclick=()=>{if(survival()&&!online)try{saveWorld();}catch(e){}location.reload();};$('verNo').onclick=()=>bar.remove();
    if(MATCH.state!=='menu')chatMsg('Version '+m[1]+' of the game is out. Save, then reload the page to update. Players on the new version can\'t join an older server.','#ffff55',false);}).catch(()=>{});}
setTimeout(verCheck,60000);setInterval(verCheck,600000);
