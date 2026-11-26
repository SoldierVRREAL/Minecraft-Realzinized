// ================= Photon Realtime multiplayer: servers by address, like Minecraft's server list =================
// A "server" is a Photon room whose name is the server address. The player who opens their world to a server creates the room
// (and is its host); everyone else joins it by address from the Multiplayer screen. Rooms are listed in Photon's lobby with a few
// small properties (MOTD, icon, player names...) so the server list can show them, and their player counts and ping, without joining.
// Photon only carries the messages; MeshNet runs on top of it exactly as before (the earliest member is the host).
const PHOTON_VERSION='mcr-2';
const GAME_VERSION='1.4';
const PHOTON_REGIONS=[['us','Americas'],['usw','US West'],['eu','Europe'],['asia','Asia'],['jp','Japan'],['au','Australia'],['sa','South America'],['kr','Korea'],['in','India'],['za','South Africa'],['uae','UAE'],['cae','Canada East']];
function photonOK(){return typeof Photon!=='undefined'&&Photon.LoadBalancing&&Photon.LoadBalancing.LoadBalancingClient;}
// what Photon's error codes mean to a player
function photonErrText(code,msg,creating){
  if(code===32758)return 'Unknown server: nobody is hosting that address right now. Check the address, and that the host has opened their world.';
  if(code===32765)return 'The server is full.';
  if(code===32764)return 'The server is not accepting players right now.';
  if(code===32766)return creating?'That server address is already in use. Pick a different address.':'That server address is already in use.';
  if(code===32767||/auth/i.test(String(msg)))return 'Photon did not accept the App ID. Check it in Photon Settings (it must be a Photon Realtime App ID).';
  if(code===32757)return 'The Photon app has reached its player limit (CCU). Try again later.';
  return 'Photon refused the connection'+(msg?': '+msg:' (error '+code+')')+'.';}
// opts.create = {name, max, props, listed}: make a new server.   opts.join = name: join that server.   neither: quick play (old behaviour)
// Keeping servers alive:
//  - Photon Cloud disconnects a client that pushes about 500 KB through it in a short time. A world's join snapshot (every block ever
//    changed) grows past that as a world gets played, so big messages are compressed, cut into small parts and sent at a gentle pace.
//    Everything after a big message waits its turn, so nobody receives events out of order.
//  - If the connection drops (Wi-Fi blip, phone screen off, tab asleep) we reconnect and rejoin the same server instead of closing it.
const PH_PART=24000,PH_GAP=110;
async function phZip(s){if(typeof CompressionStream==='undefined')return null;try{const st=new Blob([s]).stream().pipeThrough(new CompressionStream('deflate-raw'));const b=new Uint8Array(await new Response(st).arrayBuffer());
  let out='';for(let i=0;i<b.length;i+=0x8000)out+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(out);}catch(e){return null;}}
async function phUnzip(s){const bin=atob(s),b=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)b[i]=bin.charCodeAt(i);
  const st=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return await new Response(st).text();}
function photonTransport(appId,region,mode,opts={}){
  const t={lbc:null,actorFrom:new Map(),closed:false,reconnecting:false,graceUntil:0,url:'Photon '+region,room:null,lastProps:null,isOpen:true,
    q:[],pumping:false,parts:new Map(),inbox:new Map(),pid:1,
    // one connection: name server -> master -> lobby -> join or create the room. cb(err) or cb(null, client)
    _connect(how,cb){const LBC=Photon.LoadBalancing.LoadBalancingClient,S=LBC.State;let c;
      try{c=new LBC(Photon.ConnectionProtocol.Wss,appId,PHOTON_VERSION);}catch(e){cb('Photon could not start: '+e.message);return;}
      try{c.setLogLevel(Photon.LogLevel.ERROR);}catch(e){}
      let done=false,step=how;const finish=err=>{if(done)return;done=true;clearTimeout(to);if(err){try{c.disconnect();}catch(e){}cb(err,null);}else cb(null,c);};
      const to=setTimeout(()=>finish('Timed out: Photon did not answer. Check your internet connection and the App ID.'),15000);
      const go=()=>{try{
        if(step==='join')c.joinRoom(t.room||opts.join);
        else if(step==='create'){const o=opts.create;c.createRoom(t.room||o.name,{maxPlayers:o.max||8,customGameProperties:Object.assign({},o.props||{},t.lastProps||{}),propsListedInLobby:o.listed||Object.keys(o.props||{}),isVisible:true,isOpen:t.isOpen,emptyRoomLiveTime:20000});}
        else c.joinRandomOrCreateRoom({expectedCustomRoomProperties:{m:mode}},undefined,{customGameProperties:{m:mode},propsListedInLobby:['m'],maxPlayers:16,isVisible:true,isOpen:true});}
        catch(e){finish('Photon could not join: '+e.message);}};
      c.onStateChange=st=>{if(!done&&!t.reconnecting)t.onstate&&t.onstate(LBC.StateToName(st));
        if(st===S.JoinedLobby)go();
        else if(st===S.Joined)finish(null);
        else if(st===S.Disconnected||st===S.Error){if(!done)finish('Photon closed the connection. Check that the App ID is a Photon Realtime App ID.');else if(c===t.lbc&&!t.closed)t.reconnect();}};
      c.onError=(code,msg)=>{if(!done)finish(photonErrText(code,msg,step==='create'));};
      c.onOperationResponse=(code,msg)=>{if(!code||code===0||done||code===32760)return;
        // the host coming back: its server emptied and expired, so open it again (or it is still there, so join it)
        if(t.reopen&&code===32758&&step==='join'){step='create';go();return;}
        if(t.reopen&&code===32766&&step==='create'){step='join';go();return;}
        finish(photonErrText(code,msg,step==='create'));};
      c.onEvent=(code,data,actorNr)=>{if(c!==t.lbc||code!==1||!data)return;if(typeof data==='string'){try{data=JSON.parse(data);}catch(e){return;}}if(typeof data.from==='number')t.actorFrom.set(actorNr,data.from);t.recv(data);};
      // Photon saw a player go: they may only have dropped for a moment, so they get a grace period (a real leave sends its own "bye" first)
      c.onActorLeave=a=>{if(c!==t.lbc)return;const id=t.actorFrom.get(a&&a.actorNr);if(id!=null){t.actorFrom.delete(a.actorNr);t.recv({t:'bye',from:id,will:1});}};
      try{c.connectToRegionMaster(region||'us');}catch(e){finish('Photon could not connect: '+e.message);}},
    open(ok,fail){if(!photonOK()){fail('The Photon library did not load.');return;}const how=opts.join?'join':opts.create?'create':'random';
      t._connect(how,(err,c)=>{if(err){t.closed=true;fail(err);return;}t.lbc=c;try{t.room=c.myRoom().name||null;}catch(e){}if(!t.room)t.room=opts.join||(opts.create&&opts.create.name)||null;t.reopen=!!opts.create;ok();});},
    // dropped: keep trying to get back into the same server for a while; the game carries on meanwhile
    reconnect(){if(t.closed||t.reconnecting)return;t.reconnecting=true;const old=t.lbc;t.lbc=null;try{old&&old.disconnect();}catch(e){}t.actorFrom.clear();
      t.onreconnecting&&t.onreconnecting();const t0=performance.now(),limit=t.reopen?90000:24000;let n=0;
      const again=()=>{if(t.closed)return;if(performance.now()-t0>limit){t.reconnecting=false;t.onlost&&t.onlost();return;}n++;
        t._connect(t.room?'join':'random',(err,c)=>{if(t.closed){try{c&&c.disconnect();}catch(e){}return;}
          if(err){NK.wait(Math.min(5000,700*n)).then(again);return;}
          t.lbc=c;t.reconnecting=false;t.graceUntil=performance.now()+8000;
          if(t.reopen&&t.lastProps)t.setProps(t.lastProps);if(t.reopen&&!t.isOpen)t.setOpen(false);
          t.onreconnected&&t.onreconnected(performance.now()-t0);t.pump();});};
      NK.wait(400).then(again);},
    // ---- sending: small messages go straight out; big ones are compressed and cut into parts; order is always kept ----
    _raise(o,to){const c=t.lbc;if(!c||!c.isJoinedToRoom())return false;const R=Photon.LoadBalancing.Constants.ReceiverGroup;
      const opt={receivers:o.t==='hb'?R.All:R.Others};if(to){const nrs=[];for(const [nr,id] of t.actorFrom)if(to.includes(id))nrs.push(nr);if(nrs.length===to.length)opt.targetActors=nrs;}
      try{c.raiseEvent(1,o,opt);}catch(e){}return true;},
    post(o){if(t.closed)return;if(o.t==='bye'){t._raise(o);return;}   // leaving: say so at once
if(t.reconnecting||!t.lbc){if(o.t==='ev'&&t.q.length<400)t.q.push(o);return;}   // while reconnecting, game events wait (heartbeats don't)
      if(!t.q.length&&!t.pumping){let s;try{s=JSON.stringify(o);}catch(e){return;}if(s.length<=PH_PART){t._raise(o,o.to);return;}}
      t.q.push(o);t.pump();},
    async pump(){if(t.pumping)return;t.pumping=true;try{while(t.q.length&&!t.closed){if(t.reconnecting||!t.lbc)break;const o=t.q[0];let s;try{s=JSON.stringify(o);}catch(e){t.q.shift();continue;}
        if(s.length<=PH_PART){t.q.shift();t._raise(o,o.to);continue;}
        const z=await phZip(s);const body=z||s;const n=Math.ceil(body.length/PH_PART),pid=t.pid++;
        for(let i=0;i<n;i++){if(t.closed)return;while((t.reconnecting||!t.lbc)&&!t.closed)await NK.wait(200);
          t._raise({t:'part',from:o.from,pid,i,n,z:z?1:0,to:o.to||null,s:body.slice(i*PH_PART,(i+1)*PH_PART)},o.to);if(i<n-1)await NK.wait(PH_GAP);}
        t.q.shift();await NK.wait(PH_GAP);}}finally{t.pumping=false;}},
    // ---- receiving: put parts back together; one sender's messages are handed on in the order they were sent ----
    recv(m){const id=m.from;let box=t.inbox.get(id);if(!box){box={busy:false,q:[]};t.inbox.set(id,box);}
      if(box.busy){box.q.push(m);return;}t._take(m,box);},
    _take(m,box){if(m.t!=='part'){t.onmessage&&t.onmessage(m);return;}
      if(m.to&&t.myId&&!m.to.includes(t.myId))return;
      const k=m.from+':'+m.pid;let P=t.parts.get(k);if(!P){P={n:m.n,got:0,s:new Array(m.n),z:m.z,at:performance.now()};t.parts.set(k,P);}
      if(P.s[m.i]==null){P.s[m.i]=m.s;P.got++;}if(P.got<P.n)return;t.parts.delete(k);const body=P.s.join('');
      const done=txt=>{let o=null;try{o=JSON.parse(txt);}catch(e){}if(o)t.onmessage&&t.onmessage(o);box.busy=false;while(box.q.length&&!box.busy)t._take(box.q.shift(),box);};
      if(!P.z){done(body);return;}box.busy=true;phUnzip(body).then(done,()=>done(''));},
    setProps(p){t.lastProps=Object.assign({},t.lastProps||{},p);const c=t.lbc;try{const r=c&&c.isJoinedToRoom()&&c.myRoom();if(r)r.setCustomProperties(p);}catch(e){}},
    setOpen(open){t.isOpen=open;const c=t.lbc;try{const r=c&&c.isJoinedToRoom()&&c.myRoom();if(r&&r.setIsOpen)r.setIsOpen(open);}catch(e){}},
    props(){try{const r=t.lbc&&t.lbc.myRoom();return r?(r.getCustomProperties?r.getCustomProperties():r._customProperties||{}):{};}catch(e){return {};}},
    rtt(){const c=t.lbc;try{return c?(c.getRtt?c.getRtt():0):0;}catch(e){return 0;}},
    // Photon's keep-alive normally runs on page timers, which background tabs slow to a crawl: ping from the steady clock too
    keepAlive(now){const c=t.lbc;if(!c||t.reconnecting||!document.hidden)return;if(now-(t._ka||0)<2000)return;t._ka=now;
      for(const p of [c.gamePeer,c.masterPeer])try{if(p&&p.isConnected&&p.isConnected()&&p._ping)p._ping(false);}catch(e){}
      // stale half-built messages (a sender that vanished mid-way) are dropped
      for(const [k,P] of t.parts)if(now-P.at>60000)t.parts.delete(k);},
    close(){t.closed=true;t.q.length=0;const c=t.lbc;if(t.reopen)try{const r=c&&c.isJoinedToRoom()&&c.myRoom();if(r){r.setIsOpen&&r.setIsOpen(false);r.setIsVisible&&r.setIsVisible(false);}}catch(e){}   // a closed server leaves the list at once
      try{c&&c.disconnect();}catch(e){}}};
  NK.on(now=>t.keepAlive(now));
  return t;}
class PhotonNet extends MeshNet{constructor(appId,region,mode,name,opts){const tr=photonTransport(appId,region,mode,opts);super('photon',name,tr,{kind:'photon',hb:1000,timeout:20000,grace:20000,listen:opts&&opts.create?400:1800,room:'photon-'+mode});
  tr.myId=this.myId;this.mode=mode;this.region=region;this.addr=opts&&(opts.join||(opts.create&&opts.create.name))||null;this.creator=!!(opts&&opts.create);
  tr.onlost=()=>this.onFail&&this.onFail('Lost the connection to Photon.');
  tr.onreconnecting=()=>{this.onReconnecting&&this.onReconnecting();};
  tr.onreconnected=down=>{const now=Date.now();for(const m of this.members.values())m.seen=now;this.beat();this.onReconnected&&this.onReconnected(down);};}}
// ---- the server list: a lobby connection that watches every listed server in one region ----
function photonBrowse(appId,region,onList){let c,closed=false;const LBC=photonOK()&&Photon.LoadBalancing.LoadBalancingClient;
  if(!LBC){onList(null,0,'The Photon library did not load.');return {close(){}};}
  try{c=new LBC(Photon.ConnectionProtocol.Wss,appId,PHOTON_VERSION);}catch(e){onList(null,0,'Photon could not start: '+e.message);return {close(){}};}
  try{c.setLogLevel(Photon.LogLevel.ERROR);}catch(e){}
  const t0=performance.now();let rtt=0,got=false;
  const emit=()=>{if(closed)return;let rooms=[];try{rooms=(c.availableRooms()||[]).filter(r=>!r.removed).map(r=>({name:r.name,n:r.playerCount,max:r.maxPlayers,open:r.isOpen,p:r.getCustomProperties?r.getCustomProperties():(r._customProperties||{})}));}catch(e){}
    try{const v=c.masterPeer&&c.masterPeer.getRtt&&c.masterPeer.getRtt();if(v>0)rtt=v;}catch(e){}onList(rooms,rtt||Math.round((performance.now()-t0)/4),null);};
  const S=LBC.State;
  c.onStateChange=st=>{if(st===S.JoinedLobby){got=true;setTimeout(emit,250);}else if((st===S.Disconnected||st===S.Error)&&!closed&&!got)onList(null,0,'Can\'t connect to Photon. Check your internet connection and the App ID.');};
  c.onRoomList=()=>emit();c.onRoomListUpdate=()=>emit();
  c.onError=(code,msg)=>{if(!closed)onList(null,0,photonErrText(code,msg));};
  try{c.connectToRegionMaster(region||'us');}catch(e){onList(null,0,'Photon could not connect: '+e.message);}
  const iv=setInterval(()=>{if(got)emit();},3000);
  return {close(){closed=true;clearInterval(iv);try{c.disconnect();}catch(e){}}};}
