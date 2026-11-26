// ---------- skinwalkers ----------
// Stay awake two whole days (no bed) and they start coming at night. A skinwalker takes the skin and the name of one of the
// players and stands at a distance, watching, looking exactly like them. When it sees you looking at it (or you come close, or hit it)
// it twists and stretches into its true shape, screams, and hunts you with a boss bar. Daylight drives it away.
MOB_T.skinwalker={name:'Skinwalker',hp:80,hw:.3,eh:1.8,model:'skinwalker',kind:'hostile',spd:.6,chase:1.25,dmg:6,drops:[['bone',2,5]],rare:[['golden_apple',.3],['ender_pearl',.4],['totem',.06]],col:'#6a645a',fireproof:true,noEgg:true};
MOB_TYPES.push('skinwalker');
MOB_SND.skinwalker={hurt:['mob/endermen/hit','mob/enderman/hit'],death:['mob/endermen/death','mob/enderman/death']};
const SW={slept:0,warned:-1,spawnT:20};
const SW_T=2.6,SW_FLIP=1.6;   // transformation length, moment the true shape bursts out
const swAwake=()=>GZ.day-SW.slept;
XSAVE.push({save:d=>{d.swSlept=SW.slept;},reset:()=>{SW.slept=0;SW.warned=-1;},load:o=>{SW.slept=o.swSlept!=null?o.swSlept:(GZ.day||0);SW.warned=-1;}});
// sleeping through a night resets the count
{const t0=survTick;survTick=function(dt){const was=SLEEP.on;t0(dt);if(was&&!SLEEP.on)SW.slept=GZ.day;
  if(MATCH.mode==='survival'&&DIM==='overworld'&&swAwake()>=2&&dayAmt()<.3&&SW.warned!==GZ.day&&isHost()){SW.warned=GZ.day;
    chatMsg(swAwake()>=3?'You have not slept in '+swAwake()+' days. They know your face now.':'You have not slept in two days. Something is out there, watching.','#b04040');}};}

// ---------- spawning (host) ----------
function swSpawnTick(dt){if(DIM!=='overworld'||sDiff()===0||swAwake()<2||dayAmt()>.25)return;SW.spawnT-=dt;if(SW.spawnT>0)return;SW.spawnT=12+Math.random()*10;
  const have=mobs.filter(m=>m.alive&&m.mob==='skinwalker').length;if(have>=(swAwake()>=4?2:1)||Math.random()>.45)return;
  const players=ents.filter(e=>e.kind==='player'&&e.alive&&!e.spectator&&e.gm!=='creative'&&!e.bat);if(!players.length)return;
  const prey=players[Math.random()*players.length|0];const copy=ents.filter(e=>e.kind==='player'&&!e.bat);const who=copy[Math.random()*copy.length|0]||prey;
  for(let k=0;k<12;k++){const a=Math.random()*6.283,r=22+Math.random()*14;const x=Math.floor(prey.pos[0]+Math.cos(a)*r),z=Math.floor(prey.pos[2]+Math.sin(a)*r);if(!chunkReadyAt(x,z))continue;
    const y=surfY(x,z)+1;if(y<2||!floorOk(x,y,z)||!openAt(x,y+2,z))continue;if(players.some(q=>Math.hypot(q.pos[0]-x,q.pos[2]-z)<18))continue;
    const e=spawnMob('skinwalker',[x+.5,y,z+.5]);e.sw={st:'d',skin:who.skin||('gen:'+who.name),name:who.name,t:0,target:prey.id};e.eh=1.8;return e;}}
{const s0=mobSpawnTick;mobSpawnTick=function(dt){s0(dt);if(MATCH.mode==='survival')swSpawnTick(dt);};}
// /summon skinwalker (and spawn eggs) start out disguised as the nearest player
function swInit(e){if(e.sw)return e.sw;const q=nearestPlayer(e,200)||player;e.sw={st:'d',skin:(q&&q.skin)||'pack:steve',name:(q&&q.name)||'Steve',t:0,target:q&&q.id};e.eh=1.8;return e.sw;}

// ---------- behaviour (host) ----------
function swLooksAt(p,e){const o=eye(p),f=fwd(p);const c=[e.pos[0]-o[0],e.pos[1]+1.2-o[1],e.pos[2]-o[2]];const L=Math.hypot(...c)||1;return (f[0]*c[0]+f[1]*c[1]+f[2]*c[2])/L>.965;}
function swFace(e,t,dt){const fx=t.pos[0]-e.pos[0],fz=t.pos[2]-e.pos[2];const want=Math.atan2(-fx,-fz);e.bodyYaw+=angTo(e.bodyYaw,want)*Math.min(1,dt*3);
  e.headYaw=e.bodyYaw+clamp(angTo(e.bodyYaw,want),-1.2,1.2);e.yaw=e.headYaw;const fy=(t.pos[1]+1.5)-(e.pos[1]+e.eh*.85);e.pitch=clamp(Math.atan2(fy,Math.hypot(fx,fz)),-1,1);}
function swVanish(e){spawnParticles(e.pos[0],e.pos[1]+1,e.pos[2],30,[.08,.07,.07],1.6,'poof');e.alive=false;e.gone=true;}
function swUpdate(e,dt){const S=swInit(e);if(!chunkReadyAt(e.pos[0],e.pos[2])){e.rpos=e.pos;return;}
  e.fire=0;if(S.st!=='h'){tickEffects(e,dt);if(!e.alive)return;}
  // daylight drives it off
  if(dayAmt()>.5&&(lightAt(Math.floor(e.pos[0]),Math.floor(e.pos[1]+1.5),Math.floor(e.pos[2]))>>4)>=12){swVanish(e);return;}
  let T=entById(S.target);if(!T||!T.alive||T.gm==='creative'||T.spectator||T.bat||dist(T.pos,e.pos)>96){T=nearestPlayer(e,64);S.target=T?T.id:null;}
  if(S.st==='d'){let wx=0,wz=0,spd=.5;e.sneak=false;
    if(T){const dx=T.pos[0]-e.pos[0],dz=T.pos[2]-e.pos[2],hd=Math.hypot(dx,dz);
      if(hd>26){wx=dx;wz=dz;spd=.8;}else if(hd<11){wx=-dx;wz=-dz;spd=.55;}   // keeps its distance, watching
      e.sneak=hd<20&&Math.sin(perfT*.7+e.pos[0])>.7;   // now and then it crouches, like a player would
      if(hd<7||(hd<30&&swLooksAt(T,e)&&canSee(e,T))){S.st='t';S.t=0;swCry(e,0);}}
    else{e.ai.wt=(e.ai.wt||0)-dt;if(!e.ai.goal||e.ai.wt<=0){e.ai.wt=4+Math.random()*5;e.ai.goal=[e.pos[0]+(Math.random()-.5)*12,0,e.pos[2]+(Math.random()-.5)*12];}wx=e.ai.goal[0]-e.pos[0];wz=e.ai.goal[2]-e.pos[2];if(Math.hypot(wx,wz)<.8)wx=wz=0;}
    const L=Math.hypot(wx,wz);if(L>.01){wx/=L;wz/=L;}if((wx||wz)&&e.collidedH&&e.onGround)e.jump=true;else e.jump=false;
    e.spdK=spd*(e.sneak?.4:1);physics(e,dt,wx,wz);
    if(T)swFace(e,T,dt);else if(wx||wz){e.bodyYaw+=angTo(e.bodyYaw,Math.atan2(-wx,-wz))*Math.min(1,dt*6);e.headYaw=e.yaw=e.bodyYaw;}
    return;}
  if(S.st==='t'){const was=S.t;S.t+=dt;e.sneak=false;e.jump=false;e.spdK=0;physics(e,dt,0,0);if(T)swFace(e,T,dt*.5);
    if(was<SW_FLIP&&S.t>=SW_FLIP){e.eh=2.7;swCry(e,1);}
    if(S.t>=SW_T){S.st='h';S.t=0;e.target=T||null;}
    return;}
  // hunting: the normal monster chase, locked onto its prey, with long leaps
  e.eh=2.7;e.target=T||null;e.ai.t=1;
  if(T&&e.onGround){const dx=T.pos[0]-e.pos[0],dz=T.pos[2]-e.pos[2],hd=Math.hypot(dx,dz);if(hd>3.5&&hd<10&&Math.random()<dt*.7){e.mot[1]=.55;e.mot[0]+=dx/hd*.45;e.mot[2]+=dz/hd*.45;swCry(e,2);}}
  S.growl=(S.growl||4)-dt;if(S.growl<=0){S.growl=4+Math.random()*5;swCry(e,2);}
  return swU0(e,dt);}
const swU0=updateMob;
updateMob=function(e,dt){if(e.mob==='skinwalker')return swUpdate(e,dt);return swU0(e,dt);};
// hitting it gives it away; it takes less damage while it changes
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ig){if(e&&e.mob==='skinwalker'&&e.alive){const S=swInit(e);if(S.st==='d'){S.st='t';S.t=0;swCry(e,0);amt*=.5;}else if(S.st==='t')amt*=.3;}return h0.call(this,e,amt,src,cause,kb,raw,ig);};}

// sounds: a made-up shriek (oscillators) on top of the pack's enderman stare / scream, pitched down
function swCry(e,kind){if(typeof netSend==='function'&&net&&isHost())netSend(N.SWCRY,{id:e.id,k:kind});swCryLocal(e,kind);}
function swCryLocal(e,kind){if(!actx||!camPos)return;const d=dist(e.pos,camPos);if(d>48)return;const v=Math.max(0,1-d/48);
  if(kind===0)psnd(['mob/endermen/stare','mob/enderman/stare'],e.pos,.9,.6);
  if(kind===1)psnd(['mob/endermen/scream','mob/enderman/scream'],e.pos,1,.45);
  if(kind===2){psnd(['mob/endermen/idle','mob/enderman/idle','mob/zombie/say'],e.pos,.8,.5);return;}
  const t=actx.currentTime,out=masterOut||actx.destination;const len=kind===0?SW_FLIP:1.2;
  const o=actx.createOscillator(),o2=actx.createOscillator(),g=actx.createGain(),f=actx.createBiquadFilter();o.type='sawtooth';o2.type='square';
  if(kind===0){o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(38,t+len);o2.frequency.setValueAtTime(220,t);o2.frequency.exponentialRampToValueAtTime(660,t+len);}
  else{o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(45,t+len);o2.frequency.setValueAtTime(900,t);o2.frequency.exponentialRampToValueAtTime(300,t+len);}
  f.type='lowpass';f.frequency.value=1400;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22*v,t+.15);g.gain.exponentialRampToValueAtTime(.0001,t+len);
  o.connect(f);o2.connect(f);f.connect(g);g.connect(out);o.start(t);o2.start(t);o.stop(t+len+.05);o2.stop(t+len+.05);}
N.SWCRY=74;NET_X[N.SWCRY]=(d,from,fromHost)=>{if(!fromHost)return;const e=mobs.find(m=>m.id===d.id);if(e)swCryLocal(e,d.k);};

// ---------- network: guests learn its disguise and state ----------
{const x0=mobExtra;mobExtra=function(e){const o=x0(e);if(e.mob==='skinwalker'&&e.sw)o.sw=[e.sw.st,e.sw.skin,e.sw.name,+e.sw.t.toFixed(2)];return o;};}
{const a0=mobExtraApply;mobExtraApply=function(e,o){a0(e,o);if(e.mob!=='skinwalker'||!o||!o.sw)return;const [st,skin,name,t]=o.sw;
  if(!e.sw)e.sw={};const S=e.sw;if(S.st!==st||Math.abs((S.t||0)-t)>.3)e.swAt=perfT;else if(S.st==='t')e.swAt=perfT;S.st=st;S.skin=skin;S.name=name;S.t=t;e.eh=st==='d'||(st==='t'&&t<SW_FLIP)?1.8:2.7;};}
// how far through the change it is, smooth on every screen
function swPhase(e){const S=e.sw;if(!S)return 0;if(S.st==='d')return 0;if(S.st==='h')return SW_T;if(isHost()||dimLocal())return S.t;return Math.min(SW_T,S.t+(perfT-(e.swAt||perfT)));}

// ---------- the true shape: a gaunt, stooped thing, far too tall, with arms down to its knees ----------
let SW_MESH=null;
function swTexture(){const c=mkCanvas(64,64),g=c.getContext('2d');const h=hash2;const img=g.createImageData(64,64);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=h(x,y,331)*.5+h(x>>1,y>>1,332)*.3+h(x>>2,y>>3,333)*.2;let r=120+n*40,gg=112+n*36,b=100+n*30;if(h(x,y,334)>.9){r*=.6;gg*=.58;b*=.55;}
    const i=(y*64+x)*4;img.data[i]=r;img.data[i+1]=gg;img.data[i+2]=b;img.data[i+3]=255;}
  g.putImageData(img,0,0);const R=(x,y,w,hh,c2)=>{g.fillStyle=c2;g.fillRect(x,y,w,hh);};
  // head (uv 0,0; 6x9x6): sunken black eyes with red pupils, a long split mouth with teeth
  R(6+0,6+2,6,1,'rgba(40,30,25,.6)');R(6+1,6+3,2,2,'#140c0c');R(6+3+0,6+3,2,2,'#140c0c');R(6+1,6+3,1,1,'#ff2a1a');R(6+4,6+3,1,1,'#ff2a1a');
  R(6+1,6+6,4,3,'#100808');for(let i=0;i<4;i++){R(6+1+i,6+6,1,1,'#e8e0c8');R(6+1+i,6+8,1,1,i%2?'#e8e0c8':'#100808');}
  R(0,0,24,6,'rgba(20,14,12,.35)');   // darker scalp
  // body (uv 0,16; 8x14x4): ribs on the chest
  for(let i=0;i<5;i++)R(4+1,16+4+3+i*2,6,1,'rgba(45,32,28,.75)');R(4+3,16+4+2,2,12,'rgba(60,45,40,.5)');
  // arms (uv 32,0; 3x26x3) and legs (uv 48,0; 3x22x3): blackened claws and feet
  R(32,3+21,12,5,'#1a1210');R(32,3+22,12,1,'#d8d0c0');R(48,3+18,12,4,'#2a201a');
  R(60,60,4,4,'#ff3020');   // eye glow pixels
  return c;}
function swMeshes(){if(SW_MESH)return SW_MESH;const A=f=>{const o=[];f(o);return meshFrom(o);};
  SW_MESH={tex:mkTex(swTexture()),
    head:A(o=>boxUV(o,-3,0,-4,6,9,6,0,0,64,64)),body:A(o=>boxUV(o,-4,0,-2,8,14,4,0,16,64,64)),
    rarm:A(o=>boxUV(o,-1.5,-25,-1.5,3,26,3,32,0,64,64)),larm:A(o=>boxUV(o,-1.5,-25,-1.5,3,26,3,32,0,64,64,0,true)),
    rleg:A(o=>boxUV(o,-1.5,-22,-1.5,3,22,3,48,0,64,64)),lleg:A(o=>boxUV(o,-1.5,-22,-1.5,3,22,3,48,0,64,64,0,true)),
    eyes:A(o=>{boxUV(o,-2,3,-4.25,1,1,.3,60,60,64,64);boxUV(o,1,3,-4.25,1,1,.3,60,60,64,64);})};
  return SW_MESH;}
// its stolen shape: the player model with the copied skin, which can be stretched while it changes
function swDrawFake(e,ph){const S=skinTex(e.sw.skin||'pack:steve'),M=S.slim?MODELS.slim:MODELS.wide;limbTick(e);
  const rp=e.rpos||e.pos,by=e.bodyYaw==null?e.yaw:e.bodyYaw;const k=ph<=.5?0:Math.min(1,(ph-.5)/(SW_FLIP-.5));const tilt=ph>0?Math.min(1,ph/.5)*.9:0;
  const j=k>0?()=>(Math.random()-.5)*.06*k:()=>0;const sx=1-.25*k,sy=1+.5*k;
  const base=chain(M4.tr(rp[0]+j(),rp[1]-(e.sneak?.125:0),rp[2]+j()),M4.ry(by+j()*4),M4.sc(.9375*sx,.9375*sy,.9375*sx));
  const headYaw=(e.headYaw==null?e.yaw:e.headYaw)-by,headPitch=-(e.pitch||0);const ls=(e.limbSwing||0)*.6662,la=ph>0?0:(e.limbAmt||0);
  let rX=Math.cos(ls+Math.PI)*la*.5*2,lX=Math.cos(ls)*la*.5*2;const rlX=Math.cos(ls)*1.4*la,llX=Math.cos(ls+Math.PI)*1.4*la;
  if(k>0){rX=-.3*k+j()*6;lX=-.3*k+j()*6;}
  const sk=e.sneak;const P=(x,y,z,X,Y,Z)=>[M4.tr(x/16,y/16,z/16),M4.rz(Z),M4.ry(-Y),M4.rx(-X)];const arm=M4.sc(1,1+.8*k,1);
  const parts={head:chain(base,...P(0,24-(sk?1:0),0,headPitch+j()*8,-headYaw,tilt+j()*8),M4.sc(1+.2*k,1+.3*k,1+.2*k)),body:chain(base,M4.tr(0,24/16,0),M4.rx(sk?-.5:0)),
    rarm:chain(base,...P(5,22,0,rX,0,.05+.25*k),arm),larm:chain(base,...P(-5,22,0,lX,0,-.05-.25*k),arm),
    rleg:chain(base,...P(1.9,12+(sk?3:0),sk?4:.1,rlX,0,0)),lleg:chain(base,...P(-1.9,12+(sk?3:0),sk?4:.1,llX,0,0))};
  setEntLight(e.pos);gl.uniform1f(PT.u.hurt,e.hurtT>0?1:0);if(k>0)gl.uniform4f(PT.u.tint,1-.55*k,1-.62*k,1-.62*k,1);
  for(const [m,ov] of [['head','hat'],['body','jacket'],['rarm','rsleeve'],['larm','lsleeve'],['rleg','rpants'],['lleg','lpants']]){drawMesh(M[m],parts[m],S.tex);drawMesh(M[ov],parts[m],S.tex);}
  gl.uniform4f(PT.u.tint,1,1,1,1);gl.uniform1f(PT.u.hurt,0);
  if(k>0&&Math.random()<k*.6)spawnParticles(rp[0],rp[1]+.6+Math.random()*1.4,rp[2],1,[.06,.05,.05],.8,'poof');}
function swDrawTrue(e,ph){const SM=swMeshes();limbTick(e);const rp=e.rpos||e.pos,by=e.bodyYaw==null?e.yaw:e.bodyYaw;
  const rise=ph<SW_T?Math.min(1,.55+(ph-SW_FLIP)/(SW_T-SW_FLIP)*.45):1;const tilt=e.deathT!=null?Math.min(1,Math.sqrt(e.deathT*1.8))*HP2:0;
  const base=chain(M4.tr(rp[0],rp[1],rp[2]),M4.ry(by),M4.rz(tilt),M4.sc(1,rise,1));
  const ls=(e.limbSwing||0)*.6662,la=Math.min(1,e.limbAmt||0);const hY=-((e.headYaw==null?e.yaw:e.headYaw)-by),hX=-(e.pitch||0);
  const sw=e.swing>0?Math.sin((1-e.swing)*Math.PI):0;const twitch=Math.sin(perfT*23)*.05+(Math.random()<.02?(Math.random()-.5)*.5:0);
  const hunch=.38;const body=chain(base,M4.tr(0,22/16,0),M4.rx(-hunch));
  const reach=ph<SW_T?(1-(ph-SW_FLIP)/(SW_T-SW_FLIP))*1.2:0;   // arms flung out as it rises
  const P=(x,y,z,X,Y,Z)=>[M4.tr(x/16,y/16,z/16),M4.rz(Z),M4.ry(-Y),M4.rx(-X)];
  const parts={body,head:chain(body,...P(0,14,-1,hX+hunch*.6,hY,twitch)),
    rarm:chain(body,...P(5.5,13,0,Math.cos(ls+Math.PI)*1.1*la-sw*1.6-hunch*.5,0,.12+reach)),larm:chain(body,...P(-5.5,13,0,Math.cos(ls)*1.1*la-sw*1.6-hunch*.5,0,-.12-reach)),
    rleg:chain(base,...P(2.2,22,0,Math.cos(ls)*1.2*la,0,0)),lleg:chain(base,...P(-2.2,22,0,Math.cos(ls+Math.PI)*1.2*la,0,0))};
  setEntLight(e.pos);gl.uniform1f(PT.u.hurt,e.hurtT>0||e.deathT!=null?1:0);
  for(const k of ['body','head','rarm','larm','rleg','lleg'])drawMesh(SM[k],parts[k],SM.tex);
  gl.uniform1f(PT.u.bright,1.6);drawMesh(SM.eyes,parts.head,SM.tex);gl.uniform1f(PT.u.hurt,0);}
{const d0=drawMob;drawMob=function(e){if(e.mob!=='skinwalker')return d0(e);if(e.gone)return;const S=e.sw||swInit(e);const ph=swPhase(e);
  if(S.st==='d'||(S.st==='t'&&ph<SW_FLIP)){swDrawFake(e,ph);return;}
  if(S.st==='t'&&!e._swBurst){e._swBurst=true;const rp=e.rpos||e.pos;spawnParticles(rp[0],rp[1]+1.2,rp[2],40,[.05,.04,.04],2,'poof');spawnParticles(rp[0],rp[1]+1.4,rp[2],16,[.8,.05,.05],1.5,'magic');}
  swDrawTrue(e,ph);};}
// while disguised it carries the stolen name over its head, like a real player
{const h0=drawHUD;drawHUD=function(){h0();if(!INF||!player||hideGui||MATCH.mode!=='survival')return;
  for(const m of mobs){if(m.mob!=='skinwalker'||!m.alive||!m.sw)continue;if(!(m.sw.st==='d'||(m.sw.st==='t'&&swPhase(m)<SW_FLIP)))continue;if(dist(m.pos,camPos)>48)continue;
    const rp=m.rpos||m.pos;nameTagMC({pos:[rp[0],rp[1],rp[2]],name:m.sw.name,sneak:m.sneak,bat:false},'#ffffff');}};}
// boss bars for every skinwalker that has shown itself nearby (under the Ender Dragon's, if that is up too)
{const b0=drawBossBar;drawBossBar=function(){b0();if(!INF||!player||hideGui)return;let y=22+(DIM==='end'&&mobs.some(m=>m.mob==='dragon'&&m.alive)?30:0);
  for(const m of mobs){if(m.mob!=='skinwalker'||!m.alive||!m.sw||m.sw.st==='d'||swPhase(m)<SW_FLIP*.8||dist(m.pos,camPos)>64)continue;
    const w=Math.min(420,W*.6),x=(W-w)/2;hc.save();txt('Skinwalker',W/2,y-6,16,'#ff5050','center');
    hc.fillStyle='rgba(30,0,0,.85)';hc.fillRect(x,y,w,8);const f=Math.max(0,m.health/m.maxHp);const gr=hc.createLinearGradient(0,y,0,y+8);gr.addColorStop(0,'#ff4a3a');gr.addColorStop(1,'#9a0d0d');hc.fillStyle=gr;hc.fillRect(x,y,w*f,8);
    hc.strokeStyle='#000';hc.lineWidth=1;hc.strokeRect(x+.5,y+.5,w-1,7);for(let i=1;i<20;i++){hc.fillStyle='rgba(0,0,0,.35)';hc.fillRect(x+w*i/20,y,1,8);}hc.restore();y+=30;}};}

// /summon <creature> (host or Creative): handy for meeting a skinwalker without staying up two days
{const c0=serverCmd;serverCmd=function(S,text){const a=text.replace(/^\//,'').trim().split(/\s+/);if((a[0]||'').toLowerCase()!=='summon')return c0(S,text);
  const reply=(t,col='#aaaaaa')=>{if(S.local)chatMsg(t,col,false);else netSend(N.CHAT,{t,c:col},S.id);};
  if(!S.local&&!(S.ent&&S.ent.gm==='creative'))return reply('Only the host or a player in Creative can summon.','#ff5555');
  if(MATCH.mode!=='survival'||!INF)return reply('Summoning only works in Survival worlds.','#ff5555');
  const type=(a[1]||'').toLowerCase().replace('minecraft:','');if(!MOB_T[type]||MOB_T[type].kind==='object')return reply('Usage: /summon <creature>, for example /summon skinwalker','#ff5555');
  const p=S.ent||player;const yaw=p.yaw||0;const pos=[p.pos[0]-Math.sin(yaw)*4,p.pos[1],p.pos[2]-Math.cos(yaw)*4];const e=spawnMob(type,pos);if(type==='skinwalker')swInit(e);reply('Summoned '+MOB_T[type].name);};}

// the new items need icons, and no two network messages may share a number
rebuildIcons();rebuildItemAtlas();
{const seen={};for(const k in N){if(seen[N[k]])console.error('network code clash: N.'+k+' and N.'+seen[N[k]]+' are both '+N[k]);seen[N[k]]=k;}}
