// ================= Horses, donkeys and mules; saddled pigs; leads; name tags; armour stands =================
// Horses live on plains and savannas. Ride a wild one to tame it (it throws you off until it trusts you; feeding it helps), then
// saddle it to steer: it goes where you look, hold Jump to charge a leap. Horse armour protects it. Donkeys and mules carry a chest.
// Saddled pigs can be ridden and steered with a Carrot on a Stick. Leads tie animals to you or to a fence. Name a Name Tag on an
// anvil, then use it on a creature: named creatures stay. Armour stands hold a full set of armour.

// ---------- the 1.8 horse model (128x128 texture) ----------
const MOB_TEXSZ={horse:[128,128],horse_saddle:[128,128],horse_mule:[128,128],horse_chest:[128,128],armor_stand:[64,64]};
{const m0=mobMesh;mobMesh=function(model,th){const S=MOB_TEXSZ[model];if(!S)return m0(model,th);const k=model+':'+th;if(MOB_MESH[k])return MOB_MESH[k];const M=MOB_MODELS[model],out={};
  for(const n in M){const o=[];for(const [x,y,z,w,h,d,u,v,inf,mir] of M[n].b)boxUV(o,-(x+w),-(y+h),z,w,h,d,u,v,S[0],S[1],inf||0,!!mir);out[n]=meshFrom(o);}return MOB_MESH[k]=out;};}
{const HR=.5235988,h=(b)=>b;   // head parts share the head's pivot and tilt
  MOB_MODELS.horse={
    head:{p:[0,4,-10],r:[HR,0,0],b:[[-2.5,-10,-1.5,5,5,7,0,0],[-2,-10,-7,4,3,6,24,18],[-2,-7,-6.5,4,2,5,24,27],[-2.05,-9.8,-2,4,14,8,0,12],[-1,-11.5,5,2,16,4,58,0],[.45,-12,4,2,3,1,0,0],[-2.45,-12,4,2,3,1,0,0]]},
    body:{p:[0,11,9],b:[[-5,-8,-19,10,10,24,0,34]]},
    tail:{p:[0,3,14],r:[-1.134464,0,0],b:[[-1,-1,0,2,2,3,44,0],[-1.5,-2,3,3,4,7,38,7],[-1.5,-4.5,9,3,4,7,24,3]]},
    bl:{p:[4,9,11],b:[[-2.5,-2,-2.5,4,9,5,78,29],[-2,7,-1.5,3,5,3,78,43],[-2.5,12.1,-2,4,3,4,78,51]]},
    br:{p:[-4,9,11],b:[[-1.5,-2,-2.5,4,9,5,96,29],[-1,7,-1.5,3,5,3,96,43],[-1.5,12.1,-2,4,3,4,96,51]]},
    fl:{p:[4,9,-8],b:[[-1.9,-1,-2.1,3,8,4,44,29],[-1.9,7,-1.6,3,5,3,44,41],[-2.4,12.1,-2.1,4,3,4,44,51]]},
    fr:{p:[-4,9,-8],b:[[-1.1,-1,-2.1,3,8,4,60,29],[-1.1,7,-1.6,3,5,3,60,41],[-1.6,12.1,-2.1,4,3,4,60,51]]}};
  // the mule/donkey head has long ears instead of short ones
  MOB_MODELS.horse_mule={head:{p:[0,4,-10],r:[HR,0,0],b:[[-2.5,-10,-1.5,5,5,7,0,0],[-2,-10,-7,4,3,6,24,18],[-2,-7,-6.5,4,2,5,24,27],[-2.05,-9.8,-2,4,14,8,0,12],[-1,-11.5,5,2,16,4,58,0],[-2,-16,4,2,7,1,0,12],[0,-16,4,2,7,1,0,12]]}};
  MOB_MODELS.horse_saddle={saddle:{p:[0,2,2],b:[[-5,0,-3,10,1,8,80,0],[-1.5,-1,-3,3,1,2,106,9],[-4,-1,3,8,1,2,80,9]]},ropeL:{p:[5,3,2],b:[[-.5,0,-.5,1,6,1,70,0],[-.5,6,-1,1,2,2,74,0]]},ropeR:{p:[-5,3,2],b:[[-.5,0,-.5,1,6,1,80,0],[-.5,6,-1,1,2,2,74,4]]},
    face:{p:[0,4,-10],r:[HR,0,0],b:[[1.5,-8,-4,1,2,2,74,13],[-2.5,-8,-4,1,2,2,74,13]]},reins:{p:[0,4,-10],b:[[2.6,-6,-6,0,3,16,44,10],[-2.6,-6,-6,0,3,16,44,5]]}};
  MOB_MODELS.horse_chest={cl:{p:[-7.5,3,10],r:[0,HP2,0],b:[[-3,0,0,8,8,3,0,34]]},cr:{p:[4.5,3,10],r:[0,HP2,0],b:[[-3,0,0,8,8,3,0,47]]}};}
const HORSE_COLS=['white','creamy','chestnut','brown','black','gray','darkbrown'],HORSE_MARKS=[null,'white','whitefield','whitedots','blackdots'];
for(const [k,t] of [['horse',{name:'Horse',col:'#8a5a2a'}],['donkey',{name:'Donkey',col:'#7a6a5a'}],['mule',{name:'Mule',col:'#5a3a2a'}]]){
  MOB_T[k]=Object.assign({hp:22,hw:.7,eh:1.6,model:'horse',kind:'passive',spd:.35,flee:1,drops:[['leather',0,2]],snd:null,horse:true},t);MOB_TYPES.push(k);}
PASSIVE_BY.savanna=(PASSIVE_BY.savanna||['cow','sheep','chicken']).concat(['horse','horse','horse']);PASSIVE_BY.plains.push('horse','donkey');
// textures: the colour, its markings and any armour, layered like the real game
let HORSE_SRC={},HORSE_TEX={};
{const l0=packLoadMobs;packLoadMobs=async function(get){const r=await l0(get);HORSE_SRC={};const g=async n=>{const i=await get('textures/entity/horse/'+n+'.png');return i?imgToCanvas(i,128,128,0,0,i.width,i.height):null;};
  for(const c of HORSE_COLS)HORSE_SRC['c_'+c]=await g('horse_'+c);for(const m of HORSE_MARKS)if(m)HORSE_SRC['m_'+m]=await g('horse_markings_'+m);
  for(const a of ['iron','gold','diamond'])HORSE_SRC['a_'+a]=await g('armor/horse_armor_'+a);HORSE_SRC.donkey=await g('donkey');HORSE_SRC.mule=await g('mule');
  const ps=await get('textures/entity/pig/pig_saddle.png');if(ps)(PACK.mobs||(PACK.mobs={})).pig_saddle=imgToCanvas(ps,64,32,0,0,ps.width,ps.height);
  const st=await get('textures/entity/armorstand/wood.png');if(st)(PACK.mobs||(PACK.mobs={})).armor_stand=imgToCanvas(st,64,64,0,0,st.width,st.height);
  return r||1;};}
MOB_TEXKEYS.push('pig_saddle','armor_stand');
{const i0=initMobTextures;initMobTextures=function(){i0();for(const k in HORSE_TEX)gl.deleteTexture(HORSE_TEX[k].tex);HORSE_TEX={};};}
function horseTex(e){const v=e.var||0;const col=e.mob==='donkey'?'donkey':e.mob==='mule'?'mule':'c_'+HORSE_COLS[v%7];const mk=e.mob==='horse'?HORSE_MARKS[Math.floor(v/7)%5]:null;const ar=e.mob==='horse'?e.harmor:null;
  const key=col+'|'+mk+'|'+ar;if(HORSE_TEX[key])return HORSE_TEX[key];const c=mkCanvas(128,128),g=c.getContext('2d');
  const base=HORSE_SRC[col];if(base)g.drawImage(base,0,0);else{g.fillStyle=MOB_T[e.mob].col;g.fillRect(0,0,128,128);g.fillStyle='rgba(0,0,0,.15)';for(let i=0;i<300;i++)g.fillRect(Math.random()*128|0,Math.random()*128|0,2,2);}
  if(mk&&HORSE_SRC['m_'+mk])g.drawImage(HORSE_SRC['m_'+mk],0,0);if(ar&&HORSE_SRC['a_'+ar])g.drawImage(HORSE_SRC['a_'+ar],0,0);
  return HORSE_TEX[key]={tex:mkTex(c),h:128};}
// a new horse rolls its looks, speed, jump and health
function horseInit(e){if(e.hstats)return;const r=Math.random;e.var=e.mob==='horse'?(r()*7|0)+7*(r()*5|0):0;
  e.hstats={spd:(.1125+r()*.1125+r()*.1125)*0.9,jump:.4+r()*.2+r()*.2+r()*.2,hp:15+(r()*8|0)+(r()*9|0)};if(e.mob!=='horse'){e.hstats.spd=.175;e.hstats.jump=.5;}e.maxHp=e.hstats.hp;e.health=Math.min(e.health,e.maxHp);e.temper=0;}
{const s0=spawnMob;spawnMob=function(type,pos,o){const e=s0(type,pos,o);if(MOB_T[type]&&MOB_T[type].horse&&!(o&&o.id))horseInit(e);if(type==='armor_stand'&&!e.stand)e.stand={a:[null,null,null,null]};return e;};}
// drawing a horse: legs walk, the head bobs, tack and chests when it has them
function drawHorse(e){const tx=horseTex(e);limbTick(e);const rp=e.rpos||e.pos;const by=e.bodyYaw==null?e.yaw:e.bodyYaw;const S=(e.mob==='donkey'?.87:e.mob==='mule'?.92:1)*(e.baby?.5:1);
  const tilt=e.deathT!=null?Math.min(1,Math.sqrt(e.deathT*1.8))*HP2:0;const rear=e.rearT>0?Math.sin(Math.min(1,e.rearT)*Math.PI)*.8:0;
  const base=chain(M4.tr(rp[0],rp[1],rp[2]),M4.ry(by),M4.rz(tilt),M4.tr(0,0,-.5),M4.rx(rear),M4.tr(0,0,.5),M4.sc(S,S,S));
  const ls=(e.limbSwing||0)*.6662,la=Math.min(1,e.limbAmt||0),C=Math.cos;const run=vehicleRider(e)?1.4:1;
  const R={head:[-(e.pitch||0)*.5+(la>.1?Math.sin(ls)*.05:0),-((e.headYaw==null?e.yaw:e.headYaw)-by)*.5,0],fl:[C(ls)*run*la,0,0],fr:[C(ls+Math.PI)*run*la,0,0],bl:[C(ls+Math.PI)*run*la,0,0],br:[C(ls)*run*la,0,0],tail:[la*.3,Math.sin(perfT*1.5)*.1,0]};
  const draw=(model)=>{const M=mobMesh(model,128),MD=MOB_MODELS[model];for(const n in M){const P=MD[n].p,r0=MD[n].r||[0,0,0],r=R[n]||(n==='face'||n==='reins'?R.head:[0,0,0]);
      const mm=chain(base,M4.tr(-P[0]/16,(24-P[1])/16,P[2]/16),M4.rz(r0[2]+r[2]),M4.ry(-(r0[1]+r[1])),M4.rx(-(r0[0]+r[0])));drawMesh(M[n],mm,tx.tex);}};
  gl.uniform1f(PT.u.bright,mobBright(e));gl.uniform1f(PT.u.hurt,(e.hurtT>0||e.deathT!=null)?1:0);
  const M=mobMesh('horse',128),MD=MOB_MODELS.horse;for(const n in M){if(n==='head'&&e.mob!=='horse')continue;const P=MD[n].p,r0=MD[n].r||[0,0,0],r=R[n]||[0,0,0];drawMesh(M[n],chain(base,M4.tr(-P[0]/16,(24-P[1])/16,P[2]/16),M4.rz(r0[2]+r[2]),M4.ry(-(r0[1]+r[1])),M4.rx(-(r0[0]+r[0]))),tx.tex);}
  if(e.mob!=='horse')draw('horse_mule');if(e.saddle)draw('horse_saddle');if(e.hchest)draw('horse_chest');}
const vehicleRider=e=>!!e.riderId;
{const d0=drawMob;drawMob=function(e){const T=MOB_T[e.mob];if(T&&T.horse){drawHorse(e);return;}d0(e);
  // a saddle on a pig
  if(e.mob==='pig'&&e.saddle&&MOB_TEX.pig_saddle&&PACK.mobs&&PACK.mobs.pig_saddle){const M=mobMesh('pig',MOB_TEX.pig_saddle.h);const rp=e.rpos||e.pos;const by=e.bodyYaw==null?e.yaw:e.bodyYaw;const S=e.baby?.5:1;
    const base=chain(M4.tr(rp[0],rp[1],rp[2]),M4.ry(by),M4.sc(S*1.01,S*1.01,S*1.01));const MD=MOB_MODELS.pig;for(const n of ['body']){const P=MD[n].p,r=MD[n].r||[0,0,0];drawMesh(M[n],chain(base,M4.tr(-P[0]/16,(24-P[1])/16,P[2]/16),M4.rz(r[2]),M4.ry(-r[1]),M4.rx(-r[0])),MOB_TEX.pig_saddle.tex);}}};}

// ---------- riding creatures ----------
function rideSeat(v){if(MOB_T[v.mob]&&MOB_T[v.mob].horse)return .62*(v.mob==='donkey'?.87:v.mob==='mule'?.92:1);if(v.mob==='pig')return -.12;return SEAT[v.mob]||0;}
const JUMPBAR={v:0,on:false};
function rideControl(p,v,dt,inp){const T=MOB_T[v.mob];if(!T||(!T.horse&&v.mob!=='pig'))return false;
  if(!v.mot)v.mot=[0,0,0];let wx=0,wz=0;const yaw=p.yaw;const f=[-Math.sin(yaw),-Math.cos(yaw)],rgt=[Math.cos(yaw),-Math.sin(yaw)];
  if(T.horse){if(!v.tame){// a wild horse wanders and soon throws its rider
      v.buckT=(v.buckT||0)+dt;if(v.buckT>2+Math.random()*2){v.buckT=0;if(Math.random()*100<(v.temper||0)){v.tame=true;v.tameBy=p.id;spawnParticles(v.pos[0],v.pos[1]+1.6,v.pos[2],10,[1,.3,.4],1.5);chatMsg('The '+T.name+' trusts you now. Put a saddle on it to ride it.','#88ddff',false);if(net&&!isHost())netSend(N.MOBUSE,{id:v.id,a:'tamed',by:p.id},'host');}
        else{v.temper=Math.min(100,(v.temper||0)+5);v.rearT=1;dismount(p);if(net&&!isHost())netSend(N.MOBUSE,{id:v.id,a:'temper',by:p.id},'host');return true;}}
      v.rearT=Math.max(0,(v.rearT||0)-dt);}
    else if(v.saddle){const fw=inp.fw,st=(keyDown('KeyD')?1:0)-(keyDown('KeyA')?1:0)+(touchActive?touchIn.st:0);const k=fw<0?.25:1;wx=(f[0]*fw*k+rgt[0]*st*.5);wz=(f[1]*fw*k+rgt[1]*st*.5);v.bodyYaw=yaw;v.headYaw=yaw;v.yaw=yaw;v.pitch=p.pitch;
      // hold Jump to charge, let go to leap
      if(p.jump&&v.onGround){JUMPBAR.on=true;JUMPBAR.v=Math.min(1,JUMPBAR.v+dt*1.1);}
      else if(JUMPBAR.on){JUMPBAR.on=false;if(v.onGround&&JUMPBAR.v>.1){const pw=JUMPBAR.v>=.9?1:.4+JUMPBAR.v*.6;v.mot[1]=(v.hstats?v.hstats.jump:.7)*pw;v.mot[0]+=f[0]*.4*pw;v.mot[2]+=f[1]*.4*pw;}JUMPBAR.v=0;}}
  }else{// a saddled pig goes where you look while you hold a carrot on a stick
    const s=p.inv[p.sel];if(s&&s.id==='carrot_on_a_stick'){wx=f[0];wz=f[1];v.bodyYaw=yaw;v.headYaw=yaw;v.yaw=yaw;if(v.boostT>0){v.boostT-=dt;}}}
  // the creature's own legs (Minecraft's walking physics, at its speed)
  const spd=T.horse?(v.hstats?v.hstats.spd:.2):.2*(v.boostT>0?2:1);const L=Math.hypot(wx,wz);if(L>1){wx/=L;wz/=L;}
  v.in={wx:wx*.98,wz:wz*.98,jump:false,attr:spd};v.spdK=1;v.acc=(v.acc||0)+dt;let n=0;while(v.acc>=TICK&&n<5){v.acc-=TICK;mcTick(v);n++;}if(n===5)v.acc=0;
  v.limbAmt=Math.min(1,Math.hypot(v.mot[0],v.mot[2])*4);v.limbSwing=(v.limbSwing||0)+v.limbAmt*dt*20*.6;
  if(net&&!isHost()&&(v.rideSendT=(v.rideSendT||0)-dt)<=0){v.rideSendT=.05;netSend(N.RIDE,{id:v.id,p:v.pos.map(q=>+q.toFixed(3)),y:+(v.bodyYaw||0).toFixed(3),v:[0,0,0]},'host');}
  return true;}
const keyDown=k=>!!keys[k]&&(locked||padActive);
// the jump bar replaces the experience bar while riding a horse
{const x0=drawXPBar;drawXPBar=function(){const v=vehicleOf(player);if(!v||!MOB_T[v.mob].horse||!v.saddle)return x0();const G=hudGeom(),S=G.S;const w=S*9-S*.1,x=G.hx+S*.05,h=Math.max(4,Math.round(S*.1)),y=G.hy-h-Math.round(S*.12);
  hc.save();hc.fillStyle='#0a0a0a';hc.fillRect(x-1,y-1,w+2,h+2);hc.fillStyle='#2a2a40';hc.fillRect(x,y,w,h);hc.fillStyle=JUMPBAR.v>=.9?'#ff8040':'#6080ff';hc.fillRect(x,y,w*JUMPBAR.v,h);hc.restore();
  // the horse's health over the food bar
  const hp=Math.ceil(v.health/2),mx=Math.ceil(v.maxHp/2);hc.save();hc.font=`${Math.round(S*.3)}px monospace`;hc.textAlign='right';hc.fillStyle='#ff6060';hc.fillText('♥'.repeat(Math.min(10,hp))+'♡'.repeat(Math.max(0,Math.min(10,mx)-Math.min(10,hp))),G.hx+S*9,y-S*.9);hc.restore();};}

// ---------- using creatures: ride, tame, saddle, armour, chests, feed, leads, name tags ----------
const HORSE_FOOD={wheat:[2,3],sugar:[1,3],apple:[3,3],golden_carrot:[4,5],golden_apple:[10,10],['b'+B.HAY]:[20,0]};
function namedTag(s){return s&&s.id==='name_tag'&&s.tag&&s.tag.name?s.tag.name:null;}
{const i0=mobInteract;mobInteract=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival')return i0(p,s);const m=lookMob(p,3.5);if(!m)return i0(p,s);const id=s&&s.id;const T=MOB_T[m.mob];
  const act=(a)=>{if(isHost()||dimLocal()||!net)mobAct(m,a,p);else netSend(N.MOBUSE,{id:m.id,a,by:p.id},'host');};
  // name tags (named on an anvil)
  if(id==='name_tag'){const n=namedTag(s);if(!n){chatMsg('Name the Name Tag on an Anvil first.','#aaaaaa',false);return true;}if(T.kind==='object'&&m.mob!=='armor_stand')return true;act('name:'+n);consume(p,p.sel);p.swing=1;return true;}
  // leads
  if(id==='lead'&&!m.leash&&(T.kind==='passive'||m.mob==='ice_wolf')&&!m.riderId){act('leash');consume(p,p.sel);p.swing=1;sfx('pick',{vol:.4});return true;}
  if(m.leash===p.id&&!id){act('unleash');giveOrDrop(p,'lead',1);return true;}
  if(T.horse){const food=HORSE_FOOD[id];
    if(food&&(m.health<m.maxHp||!m.tame)){act('feed:'+id);consume(p,p.sel);p.swing=1;sfx('eat');return true;}
    if(m.tame&&id==='saddle'&&!m.saddle){act('saddle');consume(p,p.sel);p.swing=1;sfx('pick',{vol:.5});return true;}
    if(m.tame&&m.mob==='horse'&&/_horse_armor$/.test(id||'')&&!m.harmor){act('harmor:'+id);consume(p,p.sel);p.swing=1;sfx('pick',{vol:.5});return true;}
    if(m.tame&&m.mob!=='horse'&&id==='b8'&&!m.hchest){act('hchest');consume(p,p.sel);p.swing=1;return true;}
    if(p.sneak&&m.tame){// take things back off: the chest's contents (donkeys and mules), then armour, then the saddle
      if(m.hchest&&m.hck){const c=chests.get(m.hck);if(c){chestOpen=c;sfx('chest');document.exitPointerLock&&document.exitPointerLock();show('chestUI');const lab=$('chestSub').querySelector('.lab');if(lab)pxSet(lab,T.name,'#404040',false);renderChest();return true;}}
      if(m.harmor){giveOrDrop(p,m.harmor==='gold'?'golden_horse_armor':m.harmor+'_horse_armor',1);act('harmor:');return true;}
      if(m.saddle){giveOrDrop(p,'saddle',1);act('unsaddle');return true;}return true;}
    if(!m.baby&&!m.riderId){mount(p,m);return true;}
    return true;}
  if(m.mob==='pig'){if(id==='saddle'&&!m.saddle&&!m.baby){act('saddle');consume(p,p.sel);p.swing=1;return true;}
    if(m.saddle&&!m.riderId&&!p.sneak){mount(p,m);return true;}}
  if(m.mob==='armor_stand')return standUse(p,m,s);
  return i0(p,s);};}
{const a0=mobAct;mobAct=function(e,a,by){
  if(a.startsWith('name:')){e.customName=a.slice(5).slice(0,32);e.name=e.customName;return;}
  if(a==='leash'){e.leash=by?by.id:null;return;}if(a==='unleash'){e.leash=null;return;}
  if(a==='saddle'){e.saddle=true;return;}if(a==='unsaddle'){e.saddle=false;return;}
  if(a.startsWith('harmor:')){const id=a.slice(7);e.harmor=id?(id.startsWith('golden')?'gold':id.split('_')[0]):null;return;}
  if(a==='hchest'){e.hchest=true;e.hck=pk3(-30000001,cartSeq++%100000,-30000001-(Date.now()%100000));chests.set(e.hck,{x:-30000001,y:0,z:0,items:new Array(15).fill(null),cart:true});return;}
  if(a==='tamed'){e.tame=true;e.tameBy=by&&by.id;return;}if(a==='temper'){e.temper=Math.min(100,(e.temper||0)+5);e.rearT=1;return;}
  if(a.startsWith('feed:')){const f=HORSE_FOOD[a.slice(5)]||[1,0];e.health=Math.min(e.maxHp,e.health+f[0]);e.temper=Math.min(100,(e.temper||0)+f[1]);spawnParticles(e.pos[0],e.pos[1]+1.6,e.pos[2],5,[.4,1,.4],1);return;}
  if(a.startsWith('stand:')){standSet(e,a.slice(6));return;}
  return a0(e,a,by);};}
// pigs: a right click with the carrot on a stick while riding is a burst of speed
{const u0=useSpecial;useSpecial=function(p,s){const v=vehicleOf(p);if(v&&v.mob==='pig'&&s&&s.id==='carrot_on_a_stick'){if(!(v.boostT>0)){v.boostT=2;wearHeld(p,7);p.swing=1;}return true;}return u0(p,s);};}
// creatures with something on them drop it
{const d0=mobDie;mobDie=function(e,src,cause){if(e.alive&&dropAuth()&&!isObj(e)){const at=[e.pos[0],e.pos[1]-.4,e.pos[2]];if(e.saddle)hostSpawnDrop(at,'saddle',1);if(e.harmor)hostSpawnDrop(at,e.harmor==='gold'?'golden_horse_armor':e.harmor+'_horse_armor',1);
    if(e.hchest){hostSpawnDrop(at,'b8',1);const c=chests.get(e.hck);if(c)for(const s of c.items)if(s)hostSpawnDrop(at,s.id,s.count,undefined,undefined,undefined,s.tag);chests.delete(e.hck);}if(e.leash)hostSpawnDrop(at,'lead',1);}
  const r=e.riderId&&player&&e.riderId===player.id;if(r)dismount(player,true);return d0(e,src,cause);};}
// horse armour protects the horse
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ii){if(e&&e.harmor&&amt>0){const k={iron:5,gold:7,diamond:11}[e.harmor]||0;amt*=1-k*.04;}return h0(e,amt,src,cause,kb,raw,ii);};}
// leads: animals follow their holder (or stay by the fence they are tied to); too far and the lead snaps
function leashPos(e){if(!e.leash)return null;if(e.leash.startsWith('f:'))return e.leash.slice(2).split(',').map(Number).map((v,i)=>i===1?v+.5:v+.5);const h=ents.find(q=>q.id===e.leash&&q.alive);return h?[h.pos[0],h.pos[1]+1,h.pos[2]]:null;}
{const u0=updateMob;updateMob=function(e,dt){e.leashTempt=null;if(e.leash&&e.alive){const hp=leashPos(e);if(!hp){if(dropAuth())hostSpawnDrop(e.pos,'lead',1);e.leash=null;}else{const d=dist(hp,e.pos);
      if(d>10){if(dropAuth())hostSpawnDrop(e.pos,'lead',1);e.leash=null;sfx('pick',{pos:e.pos,vol:.4});}
      else if(d>4){e.leashTempt={pos:[hp[0],hp[1]-1,hp[2]],alive:true};if(d>6&&e.mot){const k=.02*(d-6);e.mot[0]+=(hp[0]-e.pos[0])/d*k;e.mot[2]+=(hp[2]-e.pos[2])/d*k;}}}}
  const r=u0(e,dt);return r;};}
// tying to a fence: right click a fence while animals are on your lead
{const u0=useSpecial;useSpecial=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival')return u0(p,s);const h=raycastBlock(eye(p),fwd(p),4.5);
  if(h&&BD[h.b]&&BD[h.b].fence&&!p.sneak){const mine=mobs.filter(m=>m.leash===p.id);if(mine.length){for(const m of mine){const a='leashf:'+h.x+','+h.y+','+h.z;if(isHost()||dimLocal()||!net)m.leash='f:'+h.x+','+h.y+','+h.z;else netSend(N.MOBUSE,{id:m.id,a,by:p.id},'host');}sfx('pick',{vol:.4});return true;}
    const tied=mobs.filter(m=>m.leash==='f:'+h.x+','+h.y+','+h.z);if(tied.length){for(const m of tied){if(isHost()||dimLocal()||!net)m.leash=p.id;else netSend(N.MOBUSE,{id:m.id,a:'leash',by:p.id},'host');}return true;}}
  return u0(p,s);};}
{const a0=mobAct;mobAct=function(e,a,by){if(a.startsWith('leashf:')){e.leash='f:'+a.slice(7);return;}return a0(e,a,by);};}
// a fence that goes drops the leads tied to it
{const c0=blockChanged;blockChanged=function(x,y,z,was,b){c0(x,y,z,was,b);if(was&&BD[was]&&BD[was].fence&&!(b&&BD[b].fence)){const k='f:'+x+','+y+','+z;for(const m of mobs)if(m.leash===k){m.leash=null;if(dropAuth())hostSpawnDrop([x+.5,y,z+.5],'lead',1);}}};}
// drawing leads: a sagging rope from the animal to the hand or the fence knot
function drawLeads(){const list=mobs.filter(m=>m.alive&&m.leash);if(!list.length)return;useBox(VP,camPos);
  for(const m of list){const rp=m.rpos||m.pos;const a=[rp[0],rp[1]+(m.eh||1)*.8,rp[2]];let b;if(m.leash.startsWith('f:')){const [x,y,z]=m.leash.slice(2).split(',').map(Number);b=[x+.5,y+.6,z+.5];box(chain(M4.tr(x+.5,y+.6,z+.5),M4.sc(.2,.25,.2)),[.45,.3,.15],1);}
    else{const h=ents.find(q=>q.id===m.leash&&q.alive);if(!h)continue;const hp=h.rpos||h.pos;b=h===player&&!thirdPerson()?[hp[0]-Math.sin(h.yaw)*.4+Math.cos(h.yaw)*.25,hp[1]+1.2,hp[2]-Math.cos(h.yaw)*.4-Math.sin(h.yaw)*.25]:[hp[0],hp[1]+1.1,hp[2]];}
    const n=16,L=dist(a,b);for(let i=0;i<=n;i++){const t=i/n;const sag=Math.sin(t*Math.PI)*Math.min(.8,L*.08);box(chain(M4.tr(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-sag,a[2]+(b[2]-a[2])*t),M4.sc(.06,.06,.06)),[.4,.28,.15],1);}}
  useTex(VP,camPos);}
const thirdPerson=()=>typeof camMode!=='undefined'&&camMode>0;
{const d0=drawXPOrbs;drawXPOrbs=function(){d0();drawLeads();};}
// named creatures show their name when you look at them
{const h0=drawHUD;drawHUD=function(){h0();if(!INF||!player||hideGui)return;const m=lookMob(player,8);if(m&&m.customName){const rp=m.rpos||m.pos;nameTagMC({pos:[rp[0],rp[1]+(m.eh||1)-1.8+.1,rp[2]],name:m.customName,sneak:false,bat:false},'#ffffff');}};}
// the anvil names Name Tags (and anything else) for a level
{const a0=useAnvil;useAnvil=function(p,h){const s=p.inv[p.sel];if(s&&s.id==='name_tag'){const cre=p.gm==='creative';if(!cre&&XP.level<1){chatMsg('You need 1 experience level to rename.','#ff5555',false);return;}
    askText('New name for the '+ITEMS[s.id].name+':',(s.tag&&s.tag.name)||'',v=>{const cur=p.inv[p.sel];if(!cur||cur!==s)return;if(v){cur.tag=Object.assign({},cur.tag||{},{name:v.slice(0,32)});}else if(cur.tag){delete cur.tag.name;if(!Object.keys(cur.tag).length)delete cur.tag;}
      if(!cre)xpSpend(1);psnd(['random/anvil_use','block/anvil/use'],[h.x,h.y,h.z],.6,1);});return;}return a0(p,h);};}

// ---------- armour stands ----------
MOB_MODELS.armor_stand={head:{p:[0,0,0],b:[[-1,-7,-1,2,7,2,0,0]]},body:{p:[0,0,0],b:[[-6,0,-1.5,12,3,3,0,26],[-3,3,-1,2,7,2,16,0],[1,3,-1,2,7,2,48,16],[-4,10,-1,8,2,2,0,48]]},
  rarm:{p:[-5,2,0],r:[-.26,0,.17],b:[[-2,-2,-1,2,12,2,24,0]]},larm:{p:[5,2,0],r:[-.17,0,-.17],b:[[0,-2,-1,2,12,2,32,16,0,true]]},
  rleg:{p:[-1.9,12,0],b:[[-1,0,-1,2,11,2,8,0]]},lleg:{p:[1.9,12,0],b:[[-1,0,-1,2,11,2,40,16,0,true]]},base:{p:[0,12,0],b:[[-6,11,-6,12,1,12,0,32]]}};
MOB_T.armor_stand={name:'Armor Stand',hp:2,hw:.25,eh:1.975,model:'armor_stand',kind:'object',spd:0,drops:[],persist:true,col:'#a2824e'};MOB_TYPES.push('armor_stand');
function objDrops2(e){if(e.mob==='armor_stand'){const o=[['armor_stand',1]];for(const a of (e.stand&&e.stand.a)||[])if(a)o.push([a,1]);return o;}if(e.mob==='painting')return [['painting',1]];return [];}
function objUpdate(e,dt){if(e.mob==='armor_stand'){// it falls if nothing holds it up
    if(!e.mot)e.mot=[0,0,0];e.mot[1]-=.08*dt*20;e.mot[0]=e.mot[2]=0;e.fallDist=0;moveEntity(e,0,e.mot[1]*dt*20,0);if(e.onGround)e.mot[1]=0;e.rpos=e.pos.slice();}}
function standSet(e,code){// code: "slot:id" (id empty = take off)
  const [i,id]=code.split(':');if(!e.stand)e.stand={a:[null,null,null,null]};e.stand.a[+i]=id||null;}
function standUse(p,m,s){const it=s&&ITEMS[s.id];const send=a=>{if(isHost()||dimLocal()||!net)standSet(m,a);else netSend(N.MOBUSE,{id:m.id,a:'stand:'+a,by:p.id},'host');};
  if(!m.stand)m.stand={a:[null,null,null,null]};
  if(it&&it.type==='armor'){const i=it.slot;const old=m.stand.a[i];send(i+':'+s.id);consume(p,p.sel);if(old)giveOrDrop(p,old,1);p.swing=1;sfx('pick',{vol:.5});return true;}
  // empty hand: take the piece at the height you clicked
  const o=eye(p),d=fwd(p);const t=rayBox(o,d,...entBox(m,.1));const hy=t>=0?o[1]+d[1]*t-m.pos[1]:1;const want=hy>1.6?0:hy>.95?1:hy>.45?2:3;
  let i=m.stand.a[want]?want:m.stand.a.findIndex(a=>!!a);if(i<0)return true;const old=m.stand.a[i];send(i+':');giveOrDrop(p,old,1);sfx('pick',{vol:.5});return true;}
function drawStand(e){const TX=MOB_TEX.armor_stand;const rp=e.rpos||e.pos;const by=e.bodyYaw||0;const shake=e.hurtT>0?Math.sin(e.hurtT*30)*.2:0;const base=chain(M4.tr(rp[0],rp[1],rp[2]),M4.ry(by+shake));
  const MD=MOB_MODELS.armor_stand;const mat=n=>{const P=MD[n].p,r=MD[n].r||[0,0,0];return chain(base,M4.tr(-P[0]/16,(24-P[1])/16,P[2]/16),M4.rz(r[2]),M4.ry(-r[1]),M4.rx(-r[0]));};
  gl.uniform1f(PT.u.bright,mobBright(e));gl.uniform1f(PT.u.hurt,0);if(TX){const M=mobMesh('armor_stand',64);for(const n in M)drawMesh(M[n],mat(n),TX.tex);}
  // armour, placed like it is on a player
  const A=MODELS.armor;const P=(x,y,z,X,Y,Z)=>[M4.tr(x/16,y/16,z/16),M4.rz(Z),M4.ry(-Y),M4.rx(-X)];
  const parts={head:chain(base,...P(0,24,0,0,0,0)),body:chain(base,M4.tr(0,24/16,0)),rarm:chain(base,...P(5,22,0,-.26,0,.17)),larm:chain(base,...P(-5,22,0,-.17,0,-.17)),rleg:chain(base,...P(1.9,12,0,0,0,0)),lleg:chain(base,...P(-1.9,12,0,0,0,0))};
  (e.stand&&e.stand.a||[]).forEach((a,i)=>{if(!a||!ITEMS[a])return;const it=ITEMS[a];const T=ARMOR_TEX[it.tier];if(!T)return;if(T.tint)gl.uniform4f(PT.u.tint,...T.tint,1);
    if(i===0)drawMesh(A.head,parts.head,T.l1);if(i===1){drawMesh(A.body,parts.body,T.l1);drawMesh(A.rarm,parts.rarm,T.l1);drawMesh(A.larm,parts.larm,T.l1);}
    if(i===2){drawMesh(A.body2,parts.body,T.l2);drawMesh(A.rleg2,parts.rleg,T.l2);drawMesh(A.lleg2,parts.lleg,T.l2);}if(i===3){drawMesh(A.rleg,parts.rleg,T.l1);drawMesh(A.lleg,parts.lleg,T.l1);}
    gl.uniform4f(PT.u.tint,1,1,1,1);});}
function drawObject(e){if(e.mob==='armor_stand'){drawStand(e);return true;}if(e.mob==='painting'&&typeof drawPainting==='function'){drawPainting(e);return true;}return false;}
// placing an armour stand: on top of a block, turned to face you (in 45 degree steps, like the real game)
{const u0=useSpecial;useSpecial=function(p,s){if(!INF||!p.alive||MATCH.mode!=='survival')return u0(p,s);if(s&&s.id==='armor_stand'){const h=raycastBlock(eye(p),fwd(p),4.5,true,true);
    if(h&&h.py-h.y===1&&!getB(h.px,h.py,h.pz)&&!getB(h.px,h.py+1,h.pz)){const yaw=Math.round((p.yaw+Math.PI)/(Math.PI/4))*(Math.PI/4);const pos=[h.px+.5,h.py,h.pz+.5];
      if(dropAuth()){const e=spawnMob('armor_stand',pos,{yaw});e.bodyYaw=e.headYaw=yaw;e.stand={a:[null,null,null,null]};}else netSend(N.MOBUSE,{id:'new',a:'veh:armor_stand',p:pos,y:yaw,by:p.id},'host');
      if(p.gm!=='creative')consume(p,p.sel);p.swing=1;}return true;}return u0(p,s);};}
for(const k of ['saddle','lead','name_tag','iron_horse_armor','golden_horse_armor','diamond_horse_armor','armor_stand','minecart','chest_minecart','furnace_minecart','tnt_minecart','hopper_minecart','command_block_minecart','boat'])if(ITEMS[k])delete ITEMS[k].tip;
ITEMS.name_tag.tip=['Name it on an Anvil, then use it on a creature'];ITEMS.lead.tip=['Use it on an animal to lead it; on a fence to tie it'];ITEMS.saddle.tip=['Put it on a tamed horse or a pig to ride it'];
ITEMS.carrot_on_a_stick.tip=['Steers a saddled pig you ride; right click for a burst of speed'];
for(const k of ['iron','golden','diamond'])ITEMS[k+'_horse_armor'].tip=['Protects a tamed horse'];
ITEMS.boat.tip=['Place it on water and ride it'];for(const k in CART_TYPES)if(ITEMS[CART_TYPES[k].item])ITEMS[CART_TYPES[k].item].tip=['Place it on a rail'];
