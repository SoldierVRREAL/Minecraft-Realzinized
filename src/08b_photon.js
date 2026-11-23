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
function photonTransport(appId,region,mode,opts={}){
  const t={lbc:null,actorFrom:new Map(),closed:false,url:'Photon '+region,
    open(ok,fail){if(!photonOK()){fail('The Photon library did not load.');return;}
      const LBC=Photon.LoadBalancing.LoadBalancingClient,S=LBC.State;let c;
      try{c=new LBC(Photon.ConnectionProtocol.Wss,appId,PHOTON_VERSION);}catch(e){fail('Photon could not start: '+e.message);return;}
      t.lbc=c;try{c.setLogLevel(Photon.LogLevel.ERROR);}catch(e){}
      let done=false;const finish=(good,msg)=>{if(done)return;done=true;clearTimeout(to);if(good)ok();else{t.closed=true;try{c.disconnect();}catch(e){}fail(msg);}};
      const to=setTimeout(()=>finish(false,'Timed out: Photon did not answer. Check your internet connection and the App ID.'),15000);
      const join=()=>{try{
        if(opts.join)c.joinRoom(opts.join);
        else if(opts.create){const o=opts.create;c.createRoom(o.name,{maxPlayers:o.max||8,customGameProperties:o.props||{},propsListedInLobby:o.listed||Object.keys(o.props||{}),isVisible:true,isOpen:true,emptyRoomLiveTime:0});}
        else c.joinRandomOrCreateRoom({expectedCustomRoomProperties:{m:mode}},undefined,{customGameProperties:{m:mode},propsListedInLobby:['m'],maxPlayers:16,isVisible:true,isOpen:true});}
        catch(e){finish(false,'Photon could not join: '+e.message);}};
      c.onStateChange=st=>{t.onstate&&t.onstate(LBC.StateToName(st));
        if(st===S.JoinedLobby)join();
        else if(st===S.Joined)finish(true);
        else if(st===S.Disconnected||st===S.Error){if(!done)finish(false,'Photon closed the connection. Check that the App ID is a Photon Realtime App ID.');else if(!t.closed)t.onlost&&t.onlost();}};
      c.onError=(code,msg)=>{finish(false,photonErrText(code,msg,!!opts.create));};
      c.onOperationResponse=(code,msg)=>{if(code&&code!==0&&!done&&code!==32760)finish(false,photonErrText(code,msg,!!opts.create));};
      c.onEvent=(code,data,actorNr)=>{if(code!==1||!data)return;if(typeof data==='string'){try{data=JSON.parse(data);}catch(e){return;}}if(typeof data.from==='number')t.actorFrom.set(actorNr,data.from);t.onmessage&&t.onmessage(data);};
      c.onActorLeave=a=>{const id=t.actorFrom.get(a&&a.actorNr);if(id!=null){t.actorFrom.delete(a.actorNr);t.onmessage&&t.onmessage({t:'bye',from:id});}};
      try{c.connectToRegionMaster(region||'us');}catch(e){finish(false,'Photon could not connect: '+e.message);}},
    post(o){const c=t.lbc;if(!c||!c.isJoinedToRoom())return;const R=Photon.LoadBalancing.Constants.ReceiverGroup;try{c.raiseEvent(1,o,{receivers:o.t==='hb'?R.All:R.Others});}catch(e){}},
    // the host keeps the server's lobby listing (player names, MOTD...) up to date
    setProps(p){const c=t.lbc;try{const r=c&&c.isJoinedToRoom()&&c.myRoom();if(r)r.setCustomProperties(p);}catch(e){}},
    setOpen(open){const c=t.lbc;try{const r=c&&c.isJoinedToRoom()&&c.myRoom();if(r&&r.setIsOpen)r.setIsOpen(open);}catch(e){}},
    props(){try{const r=t.lbc&&t.lbc.myRoom();return r?(r.getCustomProperties?r.getCustomProperties():r._customProperties||{}):{};}catch(e){return {};}},
    rtt(){const c=t.lbc;try{return c?(c.getRtt?c.getRtt():0):0;}catch(e){return 0;}},
    close(){t.closed=true;try{t.lbc&&t.lbc.disconnect();}catch(e){}}};
  return t;}
class PhotonNet extends MeshNet{constructor(appId,region,mode,name,opts){const tr=photonTransport(appId,region,mode,opts);super('photon',name,tr,{kind:'photon',hb:1000,timeout:8000,listen:opts&&opts.create?400:1800,room:'photon-'+mode});
  this.mode=mode;this.region=region;this.addr=opts&&(opts.join||(opts.create&&opts.create.name))||null;this.creator=!!(opts&&opts.create);tr.onlost=()=>this.onFail&&this.onFail('Lost the connection to Photon.');}}
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
