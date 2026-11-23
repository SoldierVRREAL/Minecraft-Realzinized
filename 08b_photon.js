// ================= Photon Realtime multiplayer: join anyone using the same App ID =================
// Everyone who types the same Photon Realtime App ID (and picks the same game) lands in the same room: Connect joins an open
// room for that game, or makes one if there is none. Photon only carries the messages; the game's own host rules (earliest
// player is host, host hands over if they leave) work exactly as with the relay, so MeshNet runs on top of this transport.
const PHOTON_VERSION='mcr-1';
function photonOK(){return typeof Photon!=='undefined'&&Photon.LoadBalancing&&Photon.LoadBalancing.LoadBalancingClient;}
function photonTransport(appId,region,mode){
  const t={lbc:null,actorFrom:new Map(),closed:false,url:'Photon '+region,
    open(ok,fail){if(!photonOK()){fail('The Photon library did not load.');return;}
      const LBC=Photon.LoadBalancing.LoadBalancingClient,S=LBC.State;let c;
      try{c=new LBC(Photon.ConnectionProtocol.Wss,appId,PHOTON_VERSION);}catch(e){fail('Photon could not start: '+e.message);return;}
      t.lbc=c;try{c.setLogLevel(Photon.LogLevel.ERROR);}catch(e){}
      let done=false;const finish=(good,msg)=>{if(done)return;done=true;clearTimeout(to);if(good)ok();else{t.closed=true;try{c.disconnect();}catch(e){}fail(msg);}};
      const to=setTimeout(()=>finish(false,'Photon did not answer. Check the App ID (it must be a Realtime app) and your internet connection.'),15000);
      const join=()=>{c.joinRandomOrCreateRoom({expectedCustomRoomProperties:{m:mode}},undefined,{customGameProperties:{m:mode},propsListedInLobby:['m'],maxPlayers:16,isVisible:true,isOpen:true});};
      c.onStateChange=st=>{t.onstate&&t.onstate(LBC.StateToName(st));
        if(st===S.JoinedLobby)join();
        else if(st===S.Joined)finish(true);
        else if(st===S.Disconnected||st===S.Error){if(!done)finish(false,'Photon closed the connection. Check that the App ID is a Photon Realtime App ID.');else if(!t.closed)t.onlost&&t.onlost();}};
      c.onError=(code,msg)=>{finish(false,'Photon error '+code+(msg?': '+msg:'')+(code===32767||/auth/i.test(String(msg))?' (App ID not accepted)':''));};
      c.onOperationResponse=(code,msg)=>{if(code&&code!==0&&!done&&code!==32760)finish(false,'Photon refused: '+(msg||code));};
      c.onEvent=(code,data,actorNr)=>{if(code!==1||!data)return;if(typeof data==='string'){try{data=JSON.parse(data);}catch(e){return;}}if(typeof data.from==='number')t.actorFrom.set(actorNr,data.from);t.onmessage&&t.onmessage(data);};
      c.onActorLeave=a=>{const id=t.actorFrom.get(a&&a.actorNr);if(id!=null){t.actorFrom.delete(a.actorNr);t.onmessage&&t.onmessage({t:'bye',from:id});}};
      try{c.connectToRegionMaster(region||'us');}catch(e){finish(false,'Photon could not connect: '+e.message);}},
    post(o){const c=t.lbc;if(!c||!c.isJoinedToRoom())return;const R=Photon.LoadBalancing.Constants.ReceiverGroup;try{c.raiseEvent(1,o,{receivers:o.t==='hb'?R.All:R.Others});}catch(e){}},
    close(){t.closed=true;try{t.lbc&&t.lbc.disconnect();}catch(e){}}};
  return t;}
class PhotonNet extends MeshNet{constructor(appId,region,mode,name){const tr=photonTransport(appId,region,mode);super('photon',name,tr,{kind:'photon',hb:1000,timeout:8000,listen:1800,room:'photon-'+mode});
  this.mode=mode;tr.onlost=()=>this.onFail&&this.onFail('Lost the connection to Photon.');}}
