// ================= Minecarts on rails, boats, and riding =================
// Vehicles are "object" creatures: no AI, never despawn, saved with the world. Whoever rides a vehicle drives it on their own
// machine and tells the host where it is (N.RIDE); everything else is moved by the host and sent with the other creatures.
// Minecarts follow rails like the real game (slopes, curves, powered rails boost or brake, detector rails switch on, activator
// rails tip riders out or light TNT carts). Boats float, go where you look, and break if they crash at speed.

// ---------- rails: the shape a new rail takes, and neighbours turning to meet it ----------
const RAIL_SHAPE_OF=(nsh,ewh,conn)=>{const [n,e,s,w]=[conn.includes(0),conn.includes(1),conn.includes(2),conn.includes(3)];
  if(s&&e&&!n&&!w)return 6;if(s&&w&&!n&&!e)return 7;if(n&&w&&!s&&!e)return 8;if(n&&e&&!s&&!w)return 9;
  if(n||s){if(nsh===0)return 4;if(nsh===2)return 5;return 0;}if(e||w){if(ewh===1)return 2;if(ewh===3)return 3;return 1;}return 0;};
function railR(x,y,z){const r=RSK(getB(x,y,z));return r&&r.k==='rail'?r:null;}
// the DIRS4 sides a rail's shape leads to (and whether that end is raised)
function railEnds(shape){return RAIL_EXITS[shape].map(e=>[DIRS4.findIndex(d=>d[0]===e[0]&&d[2]===e[2]),e[1]]);}
// a rail next to (x,y,z) on side i, at the same height, one up, or one down
function railNear(x,y,z,i){const [dx,,dz]=DIRS4[i];for(const dy of [0,1,-1]){const r=railR(x+dx,y+dy,z+dz);if(r)return {x:x+dx,y:y+dy,z:z+dz,r,dy};}return null;}
// does the rail at n lead back toward (x,y,z)?
function railPointsAt(n,x,z){return railEnds(n.r.shape).some(([i])=>n.x+DIRS4[i][0]===x&&n.z+DIRS4[i][2]===z);}
function railFree(n){// a rail with an end that leads nowhere can turn to meet a new one
  return railEnds(n.r.shape).filter(([i])=>!railNear(n.x,n.y,n.z,i)).length>0;}
function railShapeFor(x,y,z,type,L,forced){const cand=[];for(let i=0;i<4;i++){const n=railNear(x,y,z,i);if(!n)continue;if(forced&&forced.includes(i)){cand.push([i,n]);continue;}if(railPointsAt(n,x,z)||railFree(n))cand.push([i,n]);}
  let pick=[];const has=i=>cand.find(c=>c[0]===i);
  if(has(0)&&has(2))pick=[has(0),has(2)];else if(has(1)&&has(3))pick=[has(1),has(3)];
  else if(type==='normal'&&cand.length>=2){const c=cand.slice(0,2);if(c[0][0]%2!==c[1][0]%2)pick=c;else pick=[c[0]];}
  else if(cand.length)pick=[cand[0]];
  const conn=pick.map(c=>c[0]);if(!conn.length)conn.push(L%2?1:0);if(conn.length===1)conn.push((conn[0]+2)%4);
  // a raised end where the neighbour is one block up
  let nsh=-1,ewh=-1;for(const [i,n] of pick)if(n.dy===1){if(i%2===0)nsh=i;else ewh=i;}
  let s=RAIL_SHAPE_OF(nsh,ewh,conn);if(type!=='normal'&&s>5)s=conn[0]%2?1:0;return s;}
function railPlaceShape(item,X,Y,Z,L){const type=BD[item].rs.type;const s=railShapeFor(X,Y,Z,type,L);
  // neighbours that should now turn toward this rail
  setTimeout(()=>{for(let i=0;i<4;i++){const n=railNear(X,Y,Z,i);if(!n)continue;const pts=railPointsAt(n,X,Z);if(!pts&&!railFree(n))continue;
    const others=railEnds(n.r.shape).map(e=>e[0]).filter(j=>j!==(i+2)%4&&railNear(n.x,n.y,n.z,j));const want=others.slice(0,1).concat([(i+2)%4]);
    const ns=railShapeFor(n.x,n.y,n.z,n.r.type,L,want);const id=RS.rail[n.r.type][n.r.on?1:0][ns];if(id&&getB(n.x,n.y,n.z)!==id)setBlockNet(n.x,n.y,n.z,id);}},0);
  return RS.rail[type][0][s];}

// ---------- vehicles as objects ----------
const VEH_MODELS={
  minecart:{b0:{p:[0,22,0],r:[HP2,0,0],b:[[-10,-8,-1,20,16,2,0,10]]},b5:{p:[0,22,0],r:[-HP2,0,0],b:[[-9,-7,-1,18,14,1,44,10]]},
    b1:{p:[-9,22,0],r:[0,Math.PI*1.5,0],b:[[-8,-9,-1,16,8,2,0,0]]},b2:{p:[9,22,0],r:[0,HP2,0],b:[[-8,-9,-1,16,8,2,0,0]]},
    b3:{p:[0,22,-7],r:[0,Math.PI,0],b:[[-8,-9,-1,16,8,2,0,0]]},b4:{p:[0,22,7],b:[[-8,-9,-1,16,8,2,0,0]]}},
  boat:{b0:{p:[0,24,0],r:[HP2,0,0],b:[[-12,-8,-3,24,16,4,0,8]]},b1:{p:[-11,24,0],r:[0,Math.PI*1.5,0],b:[[-10,-7,-1,20,6,2,0,0]]},b2:{p:[11,24,0],r:[0,HP2,0],b:[[-10,-7,-1,20,6,2,0,0]]},
    b3:{p:[0,24,-9],r:[0,Math.PI,0],b:[[-10,-7,-1,20,6,2,0,0]]},b4:{p:[0,24,9],b:[[-10,-7,-1,20,6,2,0,0]]}}};
Object.assign(MOB_MODELS,VEH_MODELS);
const CART_TYPES={normal:{item:'minecart',block:null},chest:{item:'chest_minecart',block:'b8'},furnace:{item:'furnace_minecart',block:'b118'},tnt:{item:'tnt_minecart',block:'b'+B.TNT},
  hopper:{item:'hopper_minecart',block:'b'+B.HOPPER},command:{item:'command_block_minecart',block:'b'+B.COMMAND_BLOCK}};
for(const [k,t] of [['minecart',{name:'Minecart',hp:4,hw:.49,eh:.7,model:'minecart',col:'#7a7a7a'}],['boat',{name:'Boat',hp:4,hw:.7,eh:.6,model:'boat',col:'#8a6a3a'}]]){
  MOB_T[k]=Object.assign({kind:'object',spd:0,drops:[],persist:true,noAI:true},t);MOB_TYPES.push(k);MOB_TEXKEYS.push(k);}
for(const k in CART_TYPES)VEHICLE_ITEMS[CART_TYPES[k].item]='cart:'+k;VEHICLE_ITEMS.boat='boat';
{const l0=packLoadMobs;packLoadMobs=async function(get){const r=await l0(get);const M=PACK.mobs||(PACK.mobs={});
  for(const [k,p] of [['minecart','minecart'],['boat','boat']]){const img=await get('textures/entity/'+p+'.png');if(img)M[k]=imgToCanvas(img,64,32,0,0,img.width,img.height);}return r||1;};}
// object creatures never count toward the creature caps and never despawn
const isObj=e=>e&&MOB_T[e.mob]&&MOB_T[e.mob].kind==='object';

// ---------- riding ----------
const SEAT={minecart:-.35,boat:-.28};
function riderOf(v){if(!v.riderId)return null;return ents.find(e=>e.id===v.riderId&&e.alive)||null;}
function vehicleOf(p){return p&&p.riding&&mobs.includes(p.riding)&&p.riding.alive?p.riding:null;}
function mount(p,v){if(v.riderId&&v.riderId!==p.id)return false;if(vehicleOf(p))dismount(p);p.riding=v;v.riderId=p.id;v.localRide=true;p.flying=false;p.sneak=false;sfx('pick',{vol:.4});
  if(net&&!isHost())netSend(N.RIDE,{id:v.id,on:1},'host');return true;}
function dismount(p,quiet){const v=p.riding;p.riding=null;if(!v)return;if(v.riderId===p.id)v.riderId=null;v.localRide=false;v.net=null;
  // step off to a free side
  const sides=[[1,0],[-1,0],[0,1],[0,-1],[0,0]];for(const [dx,dz] of sides){const x=Math.floor(v.pos[0]+dx),z=Math.floor(v.pos[2]+dz),y=Math.floor(v.pos[1]+.6);if(!getB(x,y,z)&&!getB(x,y+1,z)){p.pos=[x+.5,y,z+.5];break;}}
  p.mot=[0,0,0];p.vel=[0,0,0];p.fallDist=0;if(net&&!isHost())netSend(N.RIDE,{id:v.id,on:0},'host');}
// ---------- physics ----------
function cartRail(e){const x=Math.floor(e.pos[0]),z=Math.floor(e.pos[2]);let y=Math.floor(e.pos[1]+.05);let r=railR(x,y,z);if(!r){r=railR(x,y-1,z);if(r)y--;}return r?{x,y,z,r}:null;}
function railSeg(R){const ex=RAIL_EXITS[R.r.shape];const P=e=>[R.x+.5+e[0]*.5,R.y+e[1]+.0625,R.z+.5+e[2]*.5];const a=P(ex[0]),b=P(ex[1]);
  // straight rails are lines through the middle of the block
  const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const L=Math.hypot(...d);return {a,b,d:d.map(v=>v/L),L};}
function vehStep(e,dt,inp){if(e.mob==='minecart')cartStep(e,dt,inp);else if(e.mob==='boat')boatStep(e,dt,inp);}
function cartStep(e,dt,inp){if(!e.v)e.v=[0,0,0];const R=cartRail(e);const rider=riderOf(e);
  if(R){const S=railSeg(R);let s=e.v[0]*S.d[0]+e.v[1]*S.d[1]+e.v[2]*S.d[2];
    // downhill
    s-=S.d[1]*9.8*dt;
    // a rider leaning forward pushes a slow cart
    if(inp&&inp.fw>0){const ry=(rider||player).yaw;const f=[-Math.sin(ry),0,-Math.cos(ry)];const along=f[0]*S.d[0]+f[2]*S.d[2];if(Math.abs(s)<3)s+=Math.sign(along||1)*Math.abs(along)*4*dt;}
    // furnace carts push themselves
    if(e.cart==='furnace'&&e.fuel>0){e.fuel-=dt;const dir=e.push||1;s+=dir*Math.max(0,4-Math.abs(s))*dt*3;if(Math.random()<dt*8)spawnParticles(e.pos[0],e.pos[1]+1,e.pos[2],1,[.4,.4,.4],.5);}
    const r=R.r;
    if(r.type==='golden'){if(r.on){if(Math.abs(s)<.2){// start off a powered rail away from a solid block
          const back=[[S.a,-1],[S.b,1]].find(([p])=>{const bx=Math.floor(p[0]+(p[0]-R.x-.5)*.2),bz=Math.floor(p[2]+(p[2]-R.z-.5)*.2);return rsCond(getB(bx,R.y,bz));});if(back)s=-back[1]*2;}
        else s+=Math.sign(s)*16*dt;}else{s*=Math.pow(.5,dt*20);if(Math.abs(s)<.1)s=0;}}
    if(r.type==='detector'&&!r.on){rsSet(R.x,R.y,R.z,RS.rail.detector[1][r.shape]);rsFlush();}
    if(r.type==='detector')e.onDet=[R.x,R.y,R.z];
    if(r.type==='activator'&&r.on){if(rider&&rider===player){dismount(player);}if(e.cart==='tnt')cartBoom(e);if(e.cart==='command')cmdCartRun(e);}
    // friction and the speed limit (8 blocks a second)
    s*=Math.pow(rider?.997:.96,dt*20);s=Math.max(-8,Math.min(8,s));if(Math.abs(s)<.005)s=0;
    // move along the rail; past its end the cart carries on into the next block
    const rel=[e.pos[0]-S.a[0],e.pos[1]-S.a[1],e.pos[2]-S.a[2]];const t=Math.max(0,Math.min(1,((rel[0]*S.d[0]+rel[1]*S.d[1]+rel[2]*S.d[2])/S.L)));let T=t+s*dt/S.L;
    // stop at the end of the line
    if(T<0||T>1){const end=T<0?0:1;const ex=RAIL_EXITS[r.shape][end];const nx=R.x+ex[0],nz=R.z+ex[2];const ny=R.y+ex[1];
      const goes=railR(nx,ny,nz)||railR(nx,ny-1,nz)||(ex[1]===0&&railR(nx,ny+1,nz))||railR(nx,ny+1,nz);
      if(!goes&&!rsCond(getB(nx,ny,nz))){/* off the end: leave the rail */}
      else if(!goes){T=end;s=-s*.3;}}
    const P=[S.a[0]+S.d[0]*S.L*T,S.a[1]+S.d[1]*S.L*T,S.a[2]+S.d[2]*S.L*T];e.pos=[P[0],P[1]-.0625+.001,P[2]];
    e.v=[S.d[0]*s,S.d[1]*s,S.d[2]*s];e.onRail=true;
    // which way the cart faces (yaw) and leans (on slopes)
    if(s!==0||e.railYaw==null){const yaw=Math.atan2(S.d[0],S.d[2]);e.railYaw=yaw;}e.tiltX=Math.asin(Math.max(-1,Math.min(1,S.d[1])));
    e.bodyYaw=e.railYaw;e.headYaw=e.railYaw;}
  else{// off the rails: fall and slide to a stop
    e.onRail=false;e.tiltX=0;e.mot=[e.v[0]/20,e.v[1]/20,e.v[2]/20];e.mot[1]-=.04*dt*20;e.fallDist=0;moveEntity(e,e.mot[0]*dt*20,e.mot[1]*dt*20,e.mot[2]*dt*20);
    e.v=[e.mot[0]*20*(e.onGround?Math.pow(.5,dt*20):1),e.mot[1]*20,e.mot[2]*20*(e.onGround?Math.pow(.5,dt*20):1)];if(e.onGround)e.v[1]=0;}
  if(e.onDet&&!(R&&R.x===e.onDet[0]&&R.y===e.onDet[1]&&R.z===e.onDet[2])){const [x,y,z]=e.onDet;e.onDet=null;const r=railR(x,y,z);
    if(r&&r.type==='detector'&&r.on&&!mobs.some(m=>m!==e&&m.onDet&&m.onDet[0]===x&&m.onDet[1]===y&&m.onDet[2]===z))rsLater(10,x,y,z,()=>{const c=railR(x,y,z);if(c&&c.on&&!mobs.some(m=>m.onDet&&m.onDet[0]===x&&m.onDet[1]===y&&m.onDet[2]===z))rsSet(x,y,z,RS.rail.detector[0][c.shape]);},'det');}
  // walking into an empty cart pushes it
  if(!rider)for(const q of ents){if(!q.alive||q.kind!=='player'||vehicleOf(q))continue;const dx=e.pos[0]-q.pos[0],dz=e.pos[2]-q.pos[2];const d=Math.hypot(dx,dz);if(d<.9&&Math.abs(q.pos[1]-e.pos[1])<1.2&&d>.01){e.v[0]+=dx/d*dt*6;e.v[2]+=dz/d*dt*6;}}
  // hopper carts collect items, TNT carts blow up in fire or on a hard landing
  if(e.cart==='hopper'&&rsAuth()&&(e.hopT=(e.hopT||0)+dt)>.4){e.hopT=0;const c=chests.get(e.ck);if(c){for(const d of drops){if(d.dead||dist(d.pos,e.pos)>1.2)continue;if(contAdd(c.items,{id:d.id,count:1})){d.count--;if(d.count<=0)hopperEat(d);contPush(e.ck);}break;}
      const t=takeOne(Math.floor(e.pos[0]),Math.floor(e.pos[1])+1,Math.floor(e.pos[2]));if(t&&contAdd(c.items,t.s)){t.done();contPush(e.ck);}}}
  if(e.cart==='tnt'&&(e.fire>0||e.inLava))cartBoom(e);}
function cartBoom(e){if(!rsAuth()||e.boomed)return;e.boomed=true;const sp=Math.hypot(...(e.v||[0,0,0]));removeMob(e);netSend(N.MOBDIE,{id:e.id,s:1});explode([e.pos[0],e.pos[1]+.5,e.pos[2]],4+Math.min(1.5,sp/8),null);}
function cmdCartRun(e){if(!e.cmd||e.cmdT>perfT)return;e.cmdT=perfT+.2;try{serverCmd({id:null,ent:player,name:'@',local:true},e.cmd);}catch(err){}}
// boats: float on water, go where the rider looks, and break on a hard crash
function waterTop(x,y,z){const b=getB(x,y,z);if(!isWaterB(b))return null;let t=y;while(isWaterB(getB(x,t+1,z)))t++;return t+.9;}
function boatStep(e,dt,inp){if(!e.v)e.v=[0,0,0];const x=Math.floor(e.pos[0]),z=Math.floor(e.pos[2]);let wt=null;for(const dy of [0,-1,1]){const w=waterTop(x,Math.floor(e.pos[1]+.2)+dy,z);if(w!=null){wt=w;break;}}
  const rider=riderOf(e);const inWater=wt!=null&&e.pos[1]<wt+.3;
  if(inWater){e.v[1]+=((wt-.1)-e.pos[1])*20*dt;e.v[1]*=Math.pow(.6,dt*20);}else e.v[1]-=24*dt;
  if(inp&&rider){const yaw=rider.yaw;const want=inp.fw;const f=[-Math.sin(yaw),-Math.cos(yaw)];const acc=inWater?(want>0?7:want<0?-3:0):(want>0?1.5:0);e.v[0]+=f[0]*acc*dt;e.v[2]+=f[1]*acc*dt;}
  const drag=inWater?.99:(e.onGround?.5:.95);e.v[0]*=Math.pow(drag,dt*20);e.v[2]*=Math.pow(drag,dt*20);const sp=Math.hypot(e.v[0],e.v[2]);if(sp>8){e.v[0]*=8/sp;e.v[2]*=8/sp;}
  if(sp>.4)e.bodyYaw=Math.atan2(-e.v[0],-e.v[2])+Math.PI/2;e.headYaw=e.bodyYaw;
  e.mot=[0,0,0];e.onGround=false;e.fallDist=0;moveEntity(e,e.v[0]*dt,e.v[1]*dt,e.v[2]*dt);if(e.onGround||(inWater&&Math.abs(e.v[1])<.2))e.v[1]=Math.max(e.v[1],e.onGround?0:e.v[1]);
  // crashing into the shore at speed breaks a boat into planks and sticks
  if(e.collidedH&&sp>5&&rsAuth()&&!e.broke){e.broke=true;removeMob(e);netSend(N.MOBDIE,{id:e.id,s:1});if(rider===player)dismount(player);hostSpawnDrop(e.pos,'b6',3);hostSpawnDrop(e.pos,'stick',2);psnd(['random/break','dig/wood1'],e.pos,.6);}}
// the local rider drives (physics of the player is replaced while riding)
{const p0=physics;physics=function(e,dt,wx,wz){const v=e===player&&vehicleOf(e);if(!v)return p0(e,dt,wx,wz);
  if(e.sneak&&!e.wasSneakRide){e.wasSneakRide=true;dismount(e);return 0;}e.wasSneakRide=e.sneak;
  const f=[-Math.sin(e.yaw),-Math.cos(e.yaw)];const fw=wx*f[0]+wz*f[1];const inp={fw:Math.abs(fw)<.05?0:Math.sign(fw),st:0,jump:e.jump};
  if(typeof rideControl==='function'&&rideControl(e,v,dt,inp)){}else vehStep(v,dt,inp);
  v.rpos=v.pos.slice();const seat=typeof rideSeat==='function'?rideSeat(v):(SEAT[v.mob]||0);e.pos=[v.pos[0],v.pos[1]+seat,v.pos[2]];e.rpos=e.pos.slice();e.prev=e.pos.slice();
  e.mot=[0,0,0];e.vel=[0,0,0];e.fallDist=0;e.onGround=true;e.sprint=false;
  // tell the host where the vehicle is
  if(net&&!isHost()&&(v.rideSendT=(v.rideSendT||0)-dt)<=0){v.rideSendT=.05;netSend(N.RIDE,{id:v.id,p:v.pos.map(q=>+q.toFixed(3)),y:+(v.bodyYaw||0).toFixed(3),v:(v.v||[0,0,0]).map(q=>+q.toFixed(2))},'host');}
  return 0;};}
// guests ignore the host's idea of where their own vehicle is
{const s0=pushSnap;pushSnap=function(e){if(e&&e.localRide)return;return s0.apply(this,arguments);};}
// host: creatures move by themselves, unless a remote player is driving them
{const u0=updateMob;updateMob=function(e,dt){const T=MOB_T[e.mob];
  if(T.kind==='object'){if(!chunkReadyAt(e.pos[0],e.pos[2]))return;const r=riderOf(e);if(r&&r!==player){e.rpos=e.pos.slice();return;}if(r===player)return;
    if(T.noAI){vehStep(e,dt,null);e.rpos=e.pos.slice();}else if(typeof objUpdate==='function')objUpdate(e,dt);return;}
  if(e.riderId){const r=riderOf(e);if(r&&r!==player){e.rpos=e.pos.slice();return;}if(r===player)return;if(!r)e.riderId=null;}
  return u0(e,dt);};}
N.RIDE=72;
NET_X[N.RIDE]=(d,from)=>{const v=mobs.find(m=>m.id===d.id);if(!v||!isHost())return;const pid='p'+from;
  if(d.on===1){if(!v.riderId)v.riderId=pid;return;}if(d.on===0){if(v.riderId===pid)v.riderId=null;return;}
  if(v.riderId!==pid)return;v.pos=d.p;v.bodyYaw=d.y;v.headYaw=d.y;v.v=d.v;v.rpos=v.pos.slice();};
// ---------- creatures' extra state rides along with the creature updates ----------
function mobExtra(e){const o={};if(e.riderId)o.r=e.riderId;if(e.cart&&e.cart!=='normal')o.c=e.cart;if(e.customName)o.n=e.customName;if(e.saddle)o.s=1;if(e.harmor)o.a=e.harmor;if(e.var!=null)o.v=e.var;
  if(e.leash)o.l=e.leash;if(e.hchest)o.h=1;if(e.stand)o.st=e.stand;if(e.tame)o.t=1;if(e.paint!=null)o.pt=[e.paint,e.face];if(e.tiltX)o.tx=+e.tiltX.toFixed(2);if(e.fuel>0)o.f=1;if(e.hstats)o.hs=e.hstats;if(e.hck)o.hk=e.hck;if(e.maxHp&&MOB_T[e.mob]&&MOB_T[e.mob].horse)o.mh=e.maxHp;return o;}
function mobExtraApply(e,o){o=o||{};e.riderId=o.r||null;e.cart=o.c||(e.mob==='minecart'?'normal':undefined);e.customName=o.n||null;e.saddle=!!o.s;e.harmor=o.a||null;if(o.v!=null)e.var=o.v;e.leash=o.l||null;e.hchest=!!o.h;
  if(o.st)e.stand=o.st;e.tame=!!o.t;if(o.pt){e.paint=o.pt[0];e.face=o.pt[1];}e.tiltX=o.tx||0;e.fuelOn=!!o.f;if(o.hs)e.hstats=o.hs;if(o.hk)e.hck=o.hk;if(o.mh)e.maxHp=o.mh;
  if(player&&e.riderId===player.id&&!vehicleOf(player)){/* the host still thinks we ride it */}}
{const s0=sendMobs;sendMobs=function(dt){if(!net||!isHost())return;const ns0=netSend;let sent=null;netSend=function(code,d){if(code===N.MOBS&&Array.isArray(d)){for(const a of d){const e=mobs.find(m=>m.id===a[0]);if(e){const x=mobExtra(e);if(Object.keys(x).length)a[18]=x;}}}return ns0.apply(this,arguments);};
  try{s0(dt);}finally{netSend=ns0;}};}
{const m0=mobNet;mobNet=function(code,d,from,fromHost){m0(code,d,from,fromHost);if(code===N.MOBS&&fromHost&&!isHost())for(const a of d){const e=mobs.find(m=>m.id===a[0]);if(e)mobExtraApply(e,a[18]);}};}

// ---------- breaking objects: no death animation, just the item (and anything inside) ----------
{const d0=mobDie;mobDie=function(e,src,cause){const T=MOB_T[e.mob];if(!T||T.kind!=='object'||!e.alive)return d0(e,src,cause);
  e.alive=false;const by=src&&src.kind==='player'?src:null;const keep=by&&by.gm==='creative';
  if(dropAuth()&&!keep){const items=typeof objDrops==='function'?objDrops(e):[];for(const [id,n] of items)hostSpawnDrop([e.pos[0],e.pos[1]+.2,e.pos[2]],id,n);}
  if(e.ck){const c=chests.get(e.ck);if(c&&dropAuth()&&!keep)for(const s of c.items)if(s)hostSpawnDrop(e.pos,s.id,s.count);chests.delete(e.ck);}
  const r=riderOf(e);if(r===player)dismount(player,true);removeMob(e);netSend(N.MOBDIE,{id:e.id,s:1});psnd(['dig/wood1','random/break'],e.pos,.4);};}
function objDrops(e){if(e.mob==='minecart')return [[CART_TYPES[e.cart||'normal'].item,1]];if(e.mob==='boat')return [['boat',1]];return typeof objDrops2==='function'?objDrops2(e):[];}
// ---------- placing vehicles ----------
let cartSeq=0;
function spawnVehicle(kind,pos,yaw,extra){const e=spawnMob(kind.startsWith('cart:')?'minecart':kind,pos,{yaw});e.v=[0,0,0];e.bodyYaw=e.headYaw=yaw||0;
  if(kind.startsWith('cart:')){e.cart=kind.slice(5);if(e.cart==='chest'||e.cart==='hopper'){e.ck=pk3(-30000000,cartSeq++%100000,-30000000-(Date.now()%100000));chests.set(e.ck,{x:-30000000,y:0,z:0,items:new Array(e.cart==='chest'?27:5).fill(null),cart:true});}}
  Object.assign(e,extra||{});return e;}
function dispenseVehicle(id,x,y,z,f){const k=VEHICLE_ITEMS[id];if(!k)return false;if(k==='boat'){const w=waterTop(x,y,z)!=null||waterTop(x,y-1,z)!=null;if(!w)return false;spawnVehicle('boat',[x+.5,y+.2,z+.5],0);return true;}
  const r=railR(x,y,z)||railR(x,y-1,z);if(!r)return false;spawnVehicle(k,[x+.5,(railR(x,y,z)?y:y-1)+.07,z+.5],0);return true;}
// using vehicles: get in, fuel furnace carts, open chest carts
{const i0=mobInteract;mobInteract=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival')return i0(p,s);const m=lookMob(p,3.5);if(!m||!isObj(m))return i0(p,s);const id=s&&s.id;
  if(m.mob==='minecart'){
    if(m.cart==='furnace'&&(id==='coal'||id==='charcoal')){consume(p,p.sel);const f=fwd(p);m.fuel=(m.fuel||0)+180;const R=cartRail(m);if(R){const S=railSeg(R);m.push=Math.sign(f[0]*S.d[0]+f[2]*S.d[2])||1;}if(!dropAuth())netSend(N.MOBUSE,{id:m.id,a:'fuel',by:p.id},'host');p.swing=1;return true;}
    if(m.cart==='chest'||m.cart==='hopper'){const c=chests.get(m.ck);if(c){chestOpen=c;sfx('chest');document.exitPointerLock&&document.exitPointerLock();show('chestUI');const lab=$('chestSub').querySelector('.lab');if(lab)pxSet(lab,m.cart==='chest'?'Minecart with Chest':'Minecart with Hopper','#404040',false);renderChest();return true;}}
    if(m.cart==='command'){if(p.gm==='creative')askText('Command for this minecart (runs on a powered activator rail):',m.cmd||'',v=>{m.cmd=v.replace(/^\//,'');});return true;}
    if(m.cart==='normal'&&!p.sneak){mount(p,m);return true;}return true;}
  if(m.mob==='boat'&&!p.sneak){mount(p,m);return true;}
  return i0(p,s);};}
{const a0=mobAct;mobAct=function(e,a,by){if(a==='fuel'&&e.mob==='minecart'){e.fuel=(e.fuel||0)+180;return;}return a0(e,a,by);};}
{const u0=useSpecial;useSpecial=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival')return u0(p,s);const id=s&&s.id;const k=id&&VEHICLE_ITEMS[id];
  if(k){const h=raycastBlock(eye(p),fwd(p),4.5,true,true);const cre=p.gm==='creative';
    if(k==='boat'){const r=rayFluidOrSolid(eye(p),fwd(p),5);if(r&&(isWaterB(r.b)||(BD[r.b]&&BD[r.b].solid))){const top=isWaterB(r.b)?(waterTop(r.x,r.y,r.z)||r.y+.9)-.45:r.y+1.05;const pos=[r.x+.5,top,r.z+.5];
        const e=spawnVehicle('boat',pos,p.yaw);if(!dropAuth())netSend(N.MOBUSE,{id:'new',a:'veh:boat',p:pos,y:p.yaw,by:p.id},'host');if(!cre)consume(p,p.sel);p.swing=1;}return true;}
    if(h){const R=railR(h.x,h.y,h.z)?{x:h.x,y:h.y,z:h.z}:null;if(!R)return true;const S=railSeg(cartRailAt(h.x,h.y,h.z));const pos=[h.x+.5,h.y+.07,h.z+.5];
      if(dropAuth()){const e=spawnVehicle(k,pos,Math.atan2(S.d[0],S.d[2]));}else netSend(N.MOBUSE,{id:'new',a:'veh:'+k,p:pos,y:0,by:p.id},'host');if(!cre)consume(p,p.sel);p.swing=1;}return true;}
  return u0(p,s);};}
const cartRailAt=(x,y,z)=>({x,y,z,r:railR(x,y,z)});
// a guest placing a vehicle: the host makes it (mobUse with id 'new')
{const m0=mobNet;mobNet=function(code,d,from,fromHost){if(code===N.MOBUSE&&d&&d.id==='new'&&typeof d.a==='string'&&d.a.startsWith('veh:')){if(isHost()&&Array.isArray(d.p))spawnVehicle(d.a.slice(4),d.p,d.y||0);return;}return m0(code,d,from,fromHost);};}
// ---------- drawing ----------
function drawVehicle(e){const T=MOB_T[e.mob];const TX=MOB_TEX[e.mob];if(!TX)return;const M=mobMesh(T.model,TX.h);const rp=e.rpos||e.pos;const by=(e.bodyYaw||0);
  // minecarts and boats are drawn like the real game: turned to their direction, tipped on slopes, shaking when hit
  const shake=e.hurtT>0?Math.sin(e.hurtT*40)*.15:0;
  const base=chain(M4.tr(rp[0],rp[1],rp[2]),M4.ry(by+(e.mob==='minecart'?HP2:HP2)),M4.rx(e.mob==='minecart'?-(e.tiltX||0):0),M4.rz(shake));
  const MD=MOB_MODELS[T.model];const mat=n=>{const P=MD[n].p,r=MD[n].r||[0,0,0];return chain(base,M4.tr(-P[0]/16,(24-P[1])/16,P[2]/16),M4.rz(r[2]),M4.ry(-r[1]),M4.rx(-r[0]));};
  gl.uniform1f(PT.u.bright,mobBright(e));gl.uniform1f(PT.u.hurt,0);for(const n in M)drawMesh(M[n],mat(n),TX.tex);
  const blk=e.mob==='minecart'&&CART_TYPES[e.cart||'normal'].block;if(blk){const hm=heldMesh(blk);if(hm)drawMesh(hm.mesh,chain(base,M4.tr(0,.5,0),M4.sc(.75,.75,.75)),hm.tex);}}
{const d0=drawMob;drawMob=function(e){if(isObj(e)){if(typeof drawObject==='function'&&drawObject(e))return;drawVehicle(e);return;}return d0(e);};}
// the rider sits: legs forward
{const h0=drawHumanoid;drawHumanoid=function(e){const sit=e===player?!!vehicleOf(player):mobs.some(m=>m.riderId===e.id&&m.alive);if(sit){e.sitPose=true;}else e.sitPose=false;return h0(e);};}
// creature caps and despawning leave objects (and tamed or named creatures) alone
{const d0=mobDespawn;mobDespawn=function(dt){const keep=mobs.filter(m=>MOB_T[m.mob].persist||m.customName||m.tame||m.riderId||m.leash);for(const m of keep)m._own=m.owner,m.owner=m.owner||'keep';d0(dt);for(const m of keep)if(m.owner==='keep')m.owner=m._own||null;};}
// ---------- saving: vehicles, horses, armour stands, paintings... (per dimension) ----------
const ENT_SAVE=e=>({t:e.mob,p:e.pos.map(v=>+v.toFixed(3)),y:+(e.bodyYaw||0).toFixed(3),hp:e.health,x:Object.assign(mobExtra(e),{r:undefined,ck:e.ck,fuel:e.fuel,push:e.push,cmd:e.cmd,owner:e.owner&&e.owner!=='keep'?e.owner:undefined,
  hs:e.hstats,temper:e.temper,inv:e.hinv})});
function keepEnt(e){return e.alive&&(MOB_T[e.mob].persist||e.customName||e.tame||e.leash);}
function entLoad(s){if(!MOB_T[s.t])return;const e=spawnMob(s.t,s.p,{yaw:s.y,hp:s.hp});const x=s.x||{};mobExtraApply(e,x);e.riderId=null;e.ck=x.ck;e.fuel=x.fuel;e.push=x.push;e.cmd=x.cmd;if(x.owner)e.owner=x.owner;e.hstats=x.hs;e.temper=x.temper;e.hinv=x.inv;e.bodyYaw=e.headYaw=s.y;e.v=[0,0,0];return e;}
XSAVE.push({save:(d,snap)=>{const all={};for(const dm of DIMS)all[dm]=(DIMDATA[dm]&&DIMDATA[dm].xents)||[];all[DIM]=mobs.filter(keepEnt).map(ENT_SAVE);d.xents=all;},
  reset:()=>{for(const dm of DIMS)if(DIMDATA[dm])DIMDATA[dm].xents=[];},
  load:o=>{const all=o.xents||{};for(const dm of DIMS){if(!DIMDATA[dm])DIMDATA[dm]={edits:new Map(),chests:new Map(),furn:new Map(),drops:[]};DIMDATA[dm].xents=all[dm]||[];}
    if(net&&!isHost())return;for(const s of (DIMDATA[DIM]&&DIMDATA[DIM].xents)||[])entLoad(s);}});
{const t0=travelTo;travelTo=function(dim,pos,opt){if(!INF||!player)return t0(dim,pos,opt);const from=DIM;if(vehicleOf(player))dismount(player,true);const list=mobs.filter(keepEnt).map(ENT_SAVE);
  const r=t0(dim,pos,opt);if(DIMDATA[from])DIMDATA[from].xents=list;else DIMDATA[from]={xents:list};if(!net||isHost()||dimLocal())for(const s of (DIMDATA[dim]&&DIMDATA[dim].xents)||[])entLoad(s);if(DIMDATA[dim])DIMDATA[dim].xents=[];return r;};}
{const o0=onDeath;onDeath=function(m){if(player&&m&&m.id===player.id&&vehicleOf(player))dismount(player,true);return o0(m);};}
