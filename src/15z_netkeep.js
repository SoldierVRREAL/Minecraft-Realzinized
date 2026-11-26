// ---------- keeping servers open ----------
// On every tick of the steady clock (08c_netkeep.js): send the heartbeat if the page's own timer has fallen behind (background tab),
// and while the tab is hidden and its frames have stopped, keep the world running at 20 ticks a second, so the host's world doesn't freeze for everyone else.
NK.on(now=>{if(!net||net.left)return;
  if(now-(net.lastBeat||0)>(net.opt.hb||1000)*1.4)net.beat();
  if(document.hidden&&online&&MATCH.state!=='menu'&&player&&now-lastDraw>300){   // only when the page's own frames have stopped
    const dt=(now-last)/1000;if(dt>=.045){last=now;const d=Math.min(.05,dt);perfT+=d;dtFrame=d;try{update(d);}catch(e){}}}});
// tell the player what is going on when the connection hiccups (instead of the server just closing)
MeshNet.prototype.onReconnecting=function(){if(net===this&&MATCH.state!=='menu')chatMsg(this.isHost&&SRV.hosting?'Connection to Photon lost for a moment. Keeping the server open and reconnecting...':'Connection lost for a moment. Reconnecting to the server...','#ffff55',false);};
MeshNet.prototype.onReconnected=function(){if(net===this&&MATCH.state!=='menu')chatMsg('Reconnected.','#55ff55',false);};
