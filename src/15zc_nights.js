// ---------- long nights ----------
// Three days without sleep. Forests go black with fog. Something that looks like a player walks in ("PlayerNNNN joined the game"),
// copies how you move, repeats what people said and makes noises. And a face comes to watch you. Look at it for five minutes
// and if you are still out in the open when time is up, it comes for you. Sleeping in a bed ends all of it.
// (Not in the news or the README on purpose.)
const NT={awake:0,sendT:0,mimicT:30,said:[]};
N.NTS=75;N.NTSND=76;
const ntAwake=()=>(isHost()||!online)?swAwake():NT.awake;
const ntOn=()=>MATCH.mode==='survival'&&INF&&DIM==='overworld'&&ntAwake()>=3&&!SLEEP.on;
const ntNight=()=>dayAmt()<.3;
// a column is "outside" unless a solid, opaque block (not leaves or glass) is somewhere above your head
function ntOutside(p){const x=Math.floor(p.pos[0]),z=Math.floor(p.pos[2]);for(let y=Math.floor(p.pos[1]+1.9);y<Math.min(INF_WY,Math.floor(p.pos[1])+64);y++){const D=BD[getB(x,y,z)];if(D&&D.solid&&D.opaque)return false;}return true;}

// the ground under the trees (surfY finds the tree tops in a forest)
function ntGround(x,z){for(let y=surfY(x,z)+1;y>2;y--){const D=BD[getB(x,y-1,z)];if(D&&D.solid&&D.opaque&&!getB(x,y,z)&&!getB(x,y+1,z))return y;}return -1;}
// ---------- the sound ----------
let ND_BUF=null,ND_LOAD=false;
function ndBuf(){if(ND_BUF||ND_LOAD||!actx)return ND_BUF;ND_LOAD=true;try{const s=atob(ND_SND.split(',')[1]),b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i);
  actx.decodeAudioData(b.buffer).then(x=>{ND_BUF=x;},()=>{ND_LOAD=false;});}catch(e){ND_LOAD=false;}return null;}
function ndPlay(o){const B=ndBuf();if(!B||!actx)return;let v=o.vol==null?1:o.vol;if(o.pos&&camPos){const d=dist(o.pos,camPos);if(d>48)return;v*=1-d/48;}if(v<=.01)return;
  const s=actx.createBufferSource(),g=actx.createGain(),f=actx.createBiquadFilter();s.buffer=B;s.playbackRate.value=o.rate||1;f.type='lowpass';f.frequency.value=o.lp||20000;
  const t=actx.currentTime,dur=o.dur||B.duration/(o.rate||1);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.fade||.05));g.gain.setValueAtTime(v,t+Math.max(.06,dur-.4));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(masterOut||actx.destination);const off=o.off!=null?o.off:0;s.start(t,Math.min(B.duration-.1,off));s.stop(t+dur+.05);}
function ntSound(k,pos){if(k==='whisper')ndPlay({vol:.3,rate:.45+Math.random()*.15,lp:900,off:Math.random()*11,dur:1.6+Math.random()*1.6,fade:.4,pos});
  else if(k==='distant')ndPlay({vol:.4,rate:.75,lp:500,off:Math.random()*9,dur:4,fade:.8,pos});
  else if(k==='steps'){for(let i=0;i<4;i++)setTimeout(()=>psnd(['step/grass','step/gravel','step/stone'],pos,.7,.85),i*330);}
  else if(k==='scream')ndPlay({vol:1,rate:1,fade:.02});}
function ntSoundAll(k,pos){ntSound(k,pos);if(net&&isHost())netSend(N.NTSND,{k,p:pos});}
NET_X[N.NTS]=(d,from,fromHost)=>{if(fromHost&&d)NT.awake=+d.a||0;};
NET_X[N.NTSND]=(d,from,fromHost)=>{if(fromHost&&d)ntSound(d.k,d.p);};
function ntChatAll(t,c){chatMsg(t,c,false);if(net&&isHost())netSend(N.CHAT,{t,c});}
function ntSayAll(name,msg){chat.push({t:10,txt:'<'+name+'> '+msg,col:'#ffffff'});if(chat.length>8)chat.shift();if(net&&isHost())netSend(N.CHAT,{p:1,n:name,m:msg});}

// ---------- black fog in every forest while it lasts ----------
const NT_FOG={};for(const b of [BIO.forest,BIO.birch,BIO.dark]){const D=BIOMES[b];NT_FOG[b]={fog:D.fog,fogK:D.fogK,part:D.part,sky:D.sky};}
let ntFogOn=false;
// the biome fog alone stays pale in daylight, so the forests are darkened here too: black mist close in, a black sky above the trees
{let fk=0;const u0=updateEnv;updateEnv=function(dt){u0(dt);const inF=INF&&camPos&&ntOn()&&LUSH_BIOMES.has(biomeAt(camPos[0],camPos[2]));fk+=((inF?1:0)-fk)*Math.min(1,dt*.6);if(fk<.01)return;
  const K=[.004,.004,.006];ENV.fog=mixv(ENV.fog,K,fk);ENV.hor=mixv(ENV.hor,K,fk);ENV.zen=mixv(ENV.zen,K,fk*.9);ENV.skyL=mixv(ENV.skyL,[.12,.12,.15],fk*.75);ENV.sunStr*=1-fk*.8;
  ENV.fogF=ENV.fogF+(Math.min(ENV.fogF,15)-ENV.fogF)*fk;ENV.fogN=ENV.fogN+(Math.min(ENV.fogN,1)-ENV.fogN)*fk;};}
function ntFog(){const want=ntOn();if(want===ntFogOn)return;ntFogOn=want;for(const b in NT_FOG){const D=BIOMES[b];if(want)Object.assign(D,{fog:[.004,.004,.006],fogK:.16,part:null,sky:[.02,.02,.03]});else Object.assign(D,NT_FOG[b]);}}

// ---------- the one that looks like a player ----------
MOB_T.mimic={name:'Player',hp:20,hw:.3,eh:1.8,model:'mimic',kind:'mimic',spd:.6,dmg:0,drops:[],col:'#333',noEgg:true,fireproof:true};
MOB_TYPES.push('mimic');MOB_SND.mimic={};
function ntMimicSpawn(){const players=ents.filter(e=>e.kind==='player'&&e.alive&&!e.spectator&&!e.bat);if(!players.length)return;
  const prey=players[Math.random()*players.length|0];const copy=players[Math.random()*players.length|0];
  for(let k=0;k<14;k++){const a=(prey.yaw||0)+Math.PI+(Math.random()-.5)*2.2,r=18+Math.random()*8;   // somewhere behind them
    const x=Math.floor(prey.pos[0]-Math.sin(a)*r),z=Math.floor(prey.pos[2]-Math.cos(a)*r);if(!chunkReadyAt(x,z))continue;const y=ntGround(x,z);
    if(y<2||!floorOk(x,y,z))continue;
    const e=spawnMob('mimic',[x+.5,y,z+.5]);const name='Player'+(1000+Math.random()*9000|0);
    e.mi={skin:copy.skin||('gen:'+copy.name),name,target:prey.id,seen:0,snd:6+Math.random()*8,say:25+Math.random()*40,hist:[]};e.sw={st:'d',skin:e.mi.skin,name,t:0};
    ntChatAll(name+' joined the game','#ffff55');return e;}}
function ntMimicGone(e,quiet){if(e.gone)return;e.alive=false;e.gone=true;if(!quiet&&e.mi)ntChatAll(e.mi.name+' left the game','#ffff55');}
const NT_LINES=['hello?','who is there','i can see you','why are you still awake','come outside','sleep','behind you','dont look','its getting dark','we are all here','you left the door open'];
function ntMimicUpdate(e,dt){const S=e.mi;if(!S){ntMimicGone(e,true);return;}if(!chunkReadyAt(e.pos[0],e.pos[2])){e.rpos=e.pos;return;}
  if(!ntOn()||(!ntNight()&&dayAmt()>.5)){ntMimicGone(e,false);return;}
  let T=entById(S.target);if(!T||!T.alive||T.bat||dist(T.pos,e.pos)>80){T=nearestPlayer(e,80);S.target=T?T.id:null;}if(!T){ntMimicGone(e,false);return;}
  const dx=T.pos[0]-e.pos[0],dz=T.pos[2]-e.pos[2],hd=Math.hypot(dx,dz);
  if(hd<6){ntMimicGone(e,false);return;}
  // it copies what its target does, a moment later
  S.hist.push([perfT,!!T.sneak]);while(S.hist.length&&perfT-S.hist[0][0]>.9)S.hist.shift();e.sneak=S.hist.length?S.hist[0][1]:false;
  const looked=swLooksAt(T,e)&&canSee(e,T);S.seen=looked?S.seen+dt:Math.max(0,S.seen-dt*.5);if(S.seen>3.5){ntMimicGone(e,false);return;}
  let wx=0,wz=0,spd=.6;if(!looked){if(hd>22){wx=dx;wz=dz;spd=.8;}else if(hd<12){wx=-dx;wz=-dz;}}
  const L=Math.hypot(wx,wz);if(L>.01){wx/=L;wz/=L;}e.jump=!!((wx||wz)&&e.collidedH&&e.onGround);e.spdK=spd*(e.sneak?.35:1);physics(e,dt,wx,wz);swFace(e,T,dt);
  S.snd-=dt;if(S.snd<=0){S.snd=14+Math.random()*22;const k=['whisper','steps','distant','whisper'][Math.random()*4|0];ntSoundAll(k,[e.pos[0],e.pos[1]+1.6,e.pos[2]]);}
  S.say-=dt;if(S.say<=0){S.say=45+Math.random()*70;const pool=NT.said.filter(m=>m.n.toLowerCase()!==S.name.toLowerCase());
    const msg=pool.length&&Math.random()<.7?pool[Math.random()*pool.length|0].m:NT_LINES[Math.random()*NT_LINES.length|0];ntSayAll(S.name,msg);}}
// what real players said, so it can say it back
{let seen=0;setInterval(()=>{for(const c of chat){if(c._nt)continue;c._nt=1;const m=/^<([^>]{1,16})> (.{1,100})$/.exec(c.txt||'');if(!m)continue;if(mobs.some(e=>e.mob==='mimic'&&e.mi&&e.mi.name===m[1]))continue;NT.said.push({n:m[1],m:m[2]});if(NT.said.length>30)NT.said.shift();}},1000);}
{const u0=updateMob;updateMob=function(e,dt){if(e.mob==='mimic')return ntMimicUpdate(e,dt);return u0(e,dt);};}
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ig){if(e&&e.mob==='mimic'){if(isHost())ntMimicGone(e,false);return false;}return h0.call(this,e,amt,src,cause,kb,raw,ig);};}
{const s0=mobSpawnTick;mobSpawnTick=function(dt){s0(dt);if(!ntOn()||!ntNight()){NT.mimicT=Math.max(NT.mimicT,20);return;}
  if(mobs.some(m=>m.alive&&m.mob==='mimic'))return;NT.mimicT-=dt;if(NT.mimicT>0)return;NT.mimicT=40+Math.random()*80;ntMimicSpawn();};}
{const x0=mobExtra;mobExtra=function(e){const o=x0(e);if(e.mob==='mimic'&&e.mi)o.mi=[e.mi.skin,e.mi.name];return o;};}
{const a0=mobExtraApply;mobExtraApply=function(e,o){a0(e,o);if(e.mob==='mimic'&&o&&o.mi){e.sw={st:'d',skin:o.mi[0],name:o.mi[1],t:0};}};}
{const d0=drawMob;drawMob=function(e){if(e.mob!=='mimic')return d0(e);if(e.gone||!e.sw)return;swDrawFake(e,0);};}

// ---------- the face ----------
const FACE={st:null,t:0,pos:null,wait:null,done:false,a:1,js:0,img:null,tex:null,mesh:null,drone:null};
{const im=new Image();im.onload=()=>{FACE.img=im;};im.src=ND_IMG;}
function faceMesh(){if(FACE.mesh||!FACE.img)return FACE.mesh;const c=mkCanvas(512,256),g=c.getContext('2d');g.drawImage(FACE.img,0,0,256,256);
  const d=g.getImageData(0,0,256,256);for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4;const r=Math.hypot((x-128)/118,(y-128)/126);const l=d.data[i]/255;   // the dark around the face fades out
    d.data[i+3]=r>1?0:(l>.05||r<.82)?255:0;}
  g.putImageData(d,0,0);FACE.tex=mkTex(c);const o=[];boxUV(o,-8,-8,0,16,16,0,0,0,32,16);FACE.mesh=meshFrom(o);return FACE.mesh;}
function facePlace(){const p=player;const a=(p.yaw||0)+(Math.random()<.5?-1:1)*(.7+Math.random()*.5);const r=24;
  FACE.pos=[p.pos[0]-Math.sin(a)*r,p.pos[1]+1.6+2.5,p.pos[2]-Math.cos(a)*r];}
function faceOff(silent){if(FACE.st&&!silent)chatMsg(FACE.name+' left the game','#ffff55',false);FACE.st=null;FACE.pos=null;if(FACE.drone){try{FACE.drone.stop();}catch(e){}FACE.drone=null;}}
function faceDrone(){if(!actx||FACE.drone)return;try{const o=actx.createOscillator(),g=actx.createGain(),f=actx.createBiquadFilter();o.type='sawtooth';o.frequency.value=38;f.type='lowpass';f.frequency.value=120;g.gain.value=.035;
  o.connect(f);f.connect(g);g.connect(masterOut||actx.destination);o.start();FACE.drone=o;}catch(e){}}
function faceTick(dt){const p=player;
  const on=ntOn()||(FACE.forced!=null&&MATCH.mode==='survival'&&INF&&DIM==='overworld');
  if(!p||!p.alive||!on||MATCH.state!=='play'){if(FACE.st)faceOff(true);if(!on){FACE.wait=null;FACE.forced=null;}return;}
  if(FACE.forced!=null&&!FACE.st){FACE.done=false;FACE.wait=0;}
  else if(dayAmt()>.5&&!FACE.st){FACE.done=false;FACE.wait=null;return;}
  if(!FACE.st){if(FACE.done||(!ntNight()&&FACE.forced==null))return;if(FACE.wait==null)FACE.wait=40+Math.random()*100;FACE.wait-=dt;if(FACE.wait>0||(!ntOutside(p)&&FACE.forced==null))return;
    FACE.st='watch';FACE.t=0;FACE.a=1;FACE.name='Player'+(1000+Math.random()*9000|0);facePlace();faceDrone();chatMsg(FACE.name+' joined the game','#ffff55',false);ntSound('distant',FACE.pos);FACE.nextSnd=20;return;}
  FACE.t+=dt;
  if(FACE.st==='watch'){const d=dist(FACE.pos,p.pos);if(d>46||d<8)facePlace();
    FACE.nextSnd-=dt;if(FACE.nextSnd<=0){FACE.nextSnd=18+Math.random()*25;ntSound('whisper',FACE.pos);}
    const RT=FACE.forced!=null?FACE.forced:300;if(FACE.drone)try{FACE.drone.frequency.value=38+FACE.t/RT*30;}catch(e){}
    if(FACE.t>=RT){if(ntOutside(p)){FACE.st='rush';FACE.rt=0;FACE.from=FACE.pos.slice();ntSound('scream');}else{FACE.st='fade';FACE.ft=0;}}}
  else if(FACE.st==='rush'){FACE.rt+=dt;const k=Math.min(1,FACE.rt/1.1),e=eye(p),f=fwd(p);const to=[e[0]+f[0]*1.2,e[1]+f[1]*1.2,e[2]+f[2]*1.2];
    FACE.pos=[FACE.from[0]+(to[0]-FACE.from[0])*k*k,FACE.from[1]+(to[1]-FACE.from[1])*k*k,FACE.from[2]+(to[2]-FACE.from[2])*k*k];
    if(k>=1){FACE.forced=null;FACE.js=1.7;hurt(p,12,null,'magic');giveEffect(p,'slowness',8,1);giveEffect(p,'weakness',8,0);FACE.done=true;faceOff(false);}}
  else if(FACE.st==='fade'){FACE.ft+=dt;FACE.a=Math.max(0,1-FACE.ft/3);if(FACE.ft>=3){FACE.forced=null;FACE.done=true;faceOff(false);}}}
// drawn in the world, through the fog
{const m0=drawMobs;drawMobs=function(fogF){m0(fogF);if(!FACE.st||!FACE.pos||!camPos)return;const M=faceMesh();if(!M)return;useTex(VP,camPos);
  const dx=camPos[0]-FACE.pos[0],dz=camPos[2]-FACE.pos[2];const near=FACE.st==='rush'?1+FACE.rt*2.5:1;const S=11*near;
  gl.uniform1f(PT.u.fogN,1e8);gl.uniform1f(PT.u.fogF,1e9);gl.uniform1f(PT.u.bright,1.15);gl.uniform4f(PT.u.tint,1,1,1,FACE.a);
  gl.disable(gl.DEPTH_TEST);   // it is seen through the trees
  drawMesh(M,chain(M4.tr(FACE.pos[0],FACE.pos[1],FACE.pos[2]),M4.ry(Math.atan2(-dx,-dz)),M4.sc(S,S,S)),FACE.tex);
  gl.enable(gl.DEPTH_TEST);
  gl.uniform4f(PT.u.tint,1,1,1,1);useTex(VP,camPos);};}
// the logic every frame, the fake name tag over the player-looking one, and the scare
{const h0=drawHUD;drawHUD=function(){h0();const dt=Math.min(.1,dtFrame||.016);ntFog();if(!(paused&&!online))faceTick(dt);
  if(isHost()&&net&&(NT.sendT-=dt)<=0){NT.sendT=5;netSend(N.NTS,{a:swAwake()});}
  if(!INF||!player||hideGui)return;
  for(const m of mobs){if(m.mob!=='mimic'||!m.alive||!m.sw||dist(m.pos,camPos)>40)continue;const rp=m.rpos||m.pos;nameTagMC({pos:[rp[0],rp[1],rp[2]],name:m.sw.name,sneak:m.sneak,bat:false},'#ffffff');}
  if(FACE.js>0&&FACE.img){FACE.js-=dt;hc.save();hc.fillStyle='#000';hc.fillRect(0,0,W,H);const s=Math.max(W,H)*1.15*(1+(1.7-FACE.js)*.08),j=()=>(Math.random()-.5)*W*.04;
    hc.globalAlpha=Math.random()<.15?.6:1;hc.drawImage(FACE.img,(W-s)/2+j(),(H-s)/2+j(),s,s);if(Math.random()<.3){hc.globalAlpha=.25;hc.fillStyle='#600';hc.fillRect(0,0,W,H);}hc.restore();}};}

// a way for the owner to test it: /summon face [seconds until it rushes, default 300]. Host or Creative only, and not listed anywhere.
{const c0=serverCmd;serverCmd=function(S,text){const a=text.replace(/^\//,'').trim().split(/\s+/);if((a[0]||'').toLowerCase()!=='summon'||(a[1]||'').toLowerCase()!=='face')return c0(S,text);
  const reply=(t,col='#aaaaaa')=>{if(S.local)chatMsg(t,col,false);else netSend(N.CHAT,{t,c:col},S.id);};
  if(!S.local)return reply('Usage: /summon <creature>, for example /summon skinwalker','#ff5555');
  if(MATCH.mode!=='survival'||!INF||DIM!=='overworld')return reply('That only works in the Overworld of a Survival world.','#ff5555');
  const n=parseFloat(a[2]);if(FACE.st)faceOff(true);FACE.forced=n>0?Math.min(3600,n):300;FACE.done=false;FACE.wait=0;};}
