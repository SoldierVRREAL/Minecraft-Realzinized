// ================= Atmosphere: experience, weather (rain, snow, thunder), ambient sounds, and the ending =================
// ---------- experience ----------
const XP={total:0,level:0,prog:0,lvSnd:0};
const XPORBS=[];
function xpNeed(L){return L>=30?9*L-158:L>=15?5*L-38:2*L+7;}
function xpRecalc(){let t=XP.total,L=0;while(L<1000&&t>=xpNeed(L)){t-=xpNeed(L);L++;}const was=XP.level;XP.level=L;XP.prog=t/xpNeed(L);return L>was;}
function xpDrop(pos,amount,burst){amount=Math.round(amount);let n=0;const sizes=[2477,1237,617,307,149,73,37,17,7,3,1];
  while(amount>0&&n<40){let v=1;for(const s of sizes)if(amount>=s){v=s;break;}if(n===39)v=amount;amount-=v;n++;
    XPORBS.push({pos:[pos[0]+(Math.random()-.5)*.6,pos[1]+.3,pos[2]+(Math.random()-.5)*.6],vel:[(Math.random()-.5)*(burst?6:2.5),2+Math.random()*(burst?5:2),(Math.random()-.5)*(burst?6:2.5)],val:v,age:0,ph:Math.random()*6});}}
function xpTick(dt){const p=player;for(const o of XPORBS){o.age+=dt;o.vel[1]-=12*dt;
    if(p&&p.alive&&o.age>.3){const d=[p.pos[0]-o.pos[0],p.pos[1]+.9-o.pos[1],p.pos[2]-o.pos[2]];const L=Math.hypot(...d);if(L<8){const k=(1-L/8)**2*40*dt;o.vel[0]+=d[0]/L*k;o.vel[1]+=d[1]/L*k+12*dt*.5;o.vel[2]+=d[2]/L*k;}
      if(L<1.1){o.dead=true;XP.total+=o.val;const up=xpRecalc();psnd(['random/orb'],null,.25,(.55+Math.random()*.5)*1.4);if(up&&XP.level%5===0&&XP.level>0)psnd(['random/levelup'],null,.6,1);}}
    for(let k=0;k<3;k++){const nx=o.pos[k]+o.vel[k]*dt;const t=o.pos.slice();t[k]=nx;if(solid(Math.floor(t[0]),Math.floor(t[1]-.1),Math.floor(t[2]))){o.vel[k]*=k===1?-.3:.5;}else o.pos[k]=nx;}
    o.vel[0]*=Math.exp(-2*dt);o.vel[2]*=Math.exp(-2*dt);if(o.age>300)o.dead=true;}
  for(let i=XPORBS.length-1;i>=0;i--)if(XPORBS[i].dead)XPORBS.splice(i,1);}
function drawXPOrbs(){if(!XPORBS.length)return;useBox(VP,camPos);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.uniform1f(PB.u.lit,0);
  for(const o of XPORBS){const s=.12+Math.min(.18,Math.log2(o.val+1)*.03);const c=.5+.5*Math.sin(perfT*6+o.ph);box(chain(M4.tr(o.pos[0],o.pos[1],o.pos[2]),M4.ry(perfT*2+o.ph),M4.sc(s,s,s)),[.5+c*.5,1,.2],.85);
    box(chain(M4.tr(o.pos[0],o.pos[1],o.pos[2]),M4.sc(s*1.7,s*1.7,s*1.7)),[.6,1,.3],.18);}
  gl.disable(gl.BLEND);gl.uniform1f(PB.u.lit,1);useTex(VP,camPos);}
function drawXPBar(){const p=player;if(!p||!p.alive||p.gm==='creative'||hideGui)return;const G=hudGeom(),S=G.S;const w=S*9-S*.1,x=G.hx+S*.05,h=Math.max(4,Math.round(S*.1)),y=G.hy-h-Math.round(S*.12);
  hc.save();hc.fillStyle='#0a0a0a';hc.fillRect(x-1,y-1,w+2,h+2);hc.fillStyle='#2a3a10';hc.fillRect(x,y,w,h);hc.fillStyle='#80ff20';hc.fillRect(x,y,w*XP.prog,h);
  hc.fillStyle='rgba(0,0,0,.35)';for(let i=1;i<18;i++)hc.fillRect(x+w*i/18,y,1,h);
  if(XP.level>0){const t=String(XP.level);hc.font=`bold ${Math.round(S*.32)}px monospace`;hc.textAlign='center';hc.fillStyle='#000';for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])hc.fillText(t,W/2+dx*2,y-3+dy*2);hc.fillStyle='#80ff20';hc.fillText(t,W/2,y-3);}
  hc.restore();}
// ores give experience when mined with the right tool
const ORE_XP={};{for(const [k,a,b] of [['COAL_ORE',0,2],['DIAMOND_ORE',3,7],['QUARTZ_ORE',2,5],['RUBY_ORE',3,7],['SAPPHIRE_ORE',3,7],['MYTHRIL_ORE',4,8],['AMETHYST_ORE',4,8],['CRYSTAL_ORE',1,3]])if(B[k]!=null)ORE_XP[B[k]]=[a,b];}
{const b0=breakBlock;breakBlock=function(x,y,z,who){const b=getB(x,y,z);b0(x,y,z,who);if(INF&&who===player&&who.gm!=='creative'&&ORE_XP[b]){const h=who.inv[who.sel];const d=mineDrops(b,h?h.id:null);if(d&&d!=='b'+b){const [a,c]=ORE_XP[b];const n=a+(Math.random()*(c-a+1)|0);if(n>0)xpDrop([x+.5,y+.2,z+.5],n);}}};}
// dying spills some of it
{const d0=onDeath;onDeath=function(m){const e=entById(m.id);const me=e===player&&e.alive&&MATCH.mode==='survival';d0(m);if(me&&player.gm!=='creative'){const v=Math.min(100,XP.level*7);if(v>0)xpDrop(player.pos,v);XP.total=0;xpRecalc();}};}

// ---------- weather ----------
const WEATHER={on:false,thunder:false,rain:0,dark:0,t:420+Math.random()*900,flash:0,bolt:null,nextBolt:8,sndT:0,muffle:1};
const DRY_BIOMES=new Set(['desert','savanna','ashen']);
function weatherTick(dt){if(DIM!=='overworld'){WEATHER.rain=0;WEATHER.dark=0;return;}
  if(isHost()){WEATHER.t-=dt;if(WEATHER.t<=0){WEATHER.on=!WEATHER.on;WEATHER.thunder=WEATHER.on&&Math.random()<.3;WEATHER.t=WEATHER.on?240+Math.random()*420:600+Math.random()*1200;if(net)netSend(N.WTIME,{t:worldTime});}}
  WEATHER.rain+=((WEATHER.on?1:0)-WEATHER.rain)*Math.min(1,dt*.15);WEATHER.dark+=((WEATHER.thunder?1:0)-WEATHER.dark)*Math.min(1,dt*.15);
  WEATHER.flash=Math.max(0,WEATHER.flash-dt*2.5);if(WEATHER.bolt){WEATHER.bolt.t-=dt;if(WEATHER.bolt.t<=0)WEATHER.bolt=null;}
  const p=player;if(!p)return;
  const bk=BIOMES[biomeAt(p.pos[0],p.pos[2])].k;const dry=DRY_BIOMES.has(bk);const exposed=(lightAt(Math.floor(camPos[0]),Math.floor(camPos[1]+.5),Math.floor(camPos[2]))>>4)>=13;
  if(WEATHER.rain>.3&&!dry&&p.fire>0&&exposed)p.fire=0;
  // sound of the rain
  WEATHER.sndT-=dt;if(WEATHER.rain>.15&&!dry&&WEATHER.sndT<=0&&!snowyHere()){WEATHER.sndT=1.6+Math.random()*.6;psnd(['ambient/weather/rain'],null,(exposed?.22:.07)*WEATHER.rain,exposed?1:.6);}
  // lightning
  if(WEATHER.thunder&&WEATHER.rain>.6){WEATHER.nextBolt-=dt;if(WEATHER.nextBolt<=0){WEATHER.nextBolt=6+Math.random()*22;
      const a=Math.random()*6.283,r=10+Math.random()*90;const x=Math.floor(p.pos[0]+Math.cos(a)*r),z=Math.floor(p.pos[2]+Math.sin(a)*r);if(chunkReadyAt(x,z))lightningAt(x,surfY(x,z)+1,z,isHost()||!net);}}}
function lightningAt(x,y,z,auth){WEATHER.bolt={x:x+.5,y,z:z+.5,t:.35,seed:Math.random()*1000};WEATHER.flash=1;const d=camPos?Math.hypot(camPos[0]-x,camPos[2]-z):50;
  setTimeout(()=>{psnd(d<40?['ambient/weather/thunder']:['ambient/weather/thunder'],null,Math.max(.25,1-d/160),d<40?1:.8)||(actx&&noiseHit(2.5,200,.5,.6*Math.max(.2,1-d/160),'lowpass'));},Math.min(4000,d/0.12));
  if(auth){if(!getB(x,y,z)&&(BD[getB(x,y-1,z)]||{}).solid&&!DRY_BIOMES.has(BIOMES[biomeAt(x,z)].k)&&sDiff()>0)lightFire(x,y,z);for(const e of hitList())if(e.alive&&dist(e.pos,[x+.5,y,z+.5])<3)damage(e,5,null,'lightning',null,true,[['ignite',8,0]]);if(net)netSend(N.WX,{x,y,z});}}
Object.assign(N,{WX:65});
{const o0=onNetEvent;onNetEvent=function(code,d,from){if(code===N.WX&&d&&MATCH.mode==='survival'){if(DIM==='overworld')lightningAt(d.x,d.y,d.z,false);return;}return o0(code,d,from);};}
function snowyHere(){if(!camPos)return false;const b=BIOMES[biomeAt(camPos[0],camPos[2])];return b.cold||camPos[1]>SEA+44;}
function weatherEnv(dt){const r=WEATHER.rain,k=1-.42*r-.25*WEATHER.dark;if(r<.01&&WEATHER.flash<.01)return;
  const g=v=>{const l=(v[0]+v[1]+v[2])/3;return v.map(c=>(c*.55+l*.45)*k);};ENV.zen=g(ENV.zen);ENV.hor=g(ENV.hor);ENV.fog=g(ENV.fog);ENV.sunStr*=1-.85*r;ENV.glow*=1-r;
  ENV.skyL=ENV.skyL.map(c=>c*(1-.3*r-.2*WEATHER.dark));SKYMUL*=1-.25*r;ENV.fogF=Math.max(30,ENV.fogF*(1-.3*r));ENV.fogN*=1-.5*r;
  if(WEATHER.flash>0){const f=WEATHER.flash*.8;ENV.zen=ENV.zen.map(c=>c+f*.6);ENV.hor=ENV.hor.map(c=>c+f*.5);ENV.fog=ENV.fog.map(c=>c+f*.4);ENV.skyL=ENV.skyL.map(c=>c+f*.7);}}
// rain streaks and snowflakes around the camera, only where the sky is open
function drawWeather(){if(DIM!=='overworld'||WEATHER.rain<.05||!camPos||!INF)return;const bk=BIOMES[biomeAt(camPos[0],camPos[2])].k;if(DRY_BIOMES.has(bk))return;const snow=snowyHere();
  useBox(VP,camPos);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform1f(PB.u.lit,0);
  const n=Math.round((snow?160:220)*WEATHER.rain*[.35,.7,1][OPT.particles|0]);const R=10,cx=Math.floor(camPos[0]),cz=Math.floor(camPos[2]);const L=snow?.9:6;const sp=snow?2.2:14;
  for(let i=0;i<n;i++){const hx=hash2(i,7,3),hz=hash2(i,8,3),ph=hash2(i,9,3);const x=cx+Math.floor((hx-.5)*R*2)+.5+(hash2(i,10,3)-.5)*.8,z=cz+Math.floor((hz-.5)*R*2)+.5+(hash2(i,11,3)-.5)*.8;
    const top=camPos[1]+12;const ground=surfaceH[(Math.floor(z)&ZM)*WX+(Math.floor(x)&XM)]+1;if(ground>camPos[1]+10)continue;const span=top-Math.max(ground,camPos[1]-12);if(span<=0)continue;
    const y=top-((perfT*sp+ph*span)%span);if(y<ground)continue;
    const wx=snow?Math.sin(perfT*1.3+i)*.3:0;
    if(snow)box(chain(M4.tr(x+wx,y,z),M4.ry(i),M4.sc(.07,.07,.07)),[1,1,1],.85);else box(chain(M4.tr(x,y,z),M4.sc(.03,L*.12,.03)),[.65,.72,.9],.4);
    if(!snow&&y-ground<.4&&Math.random()<.05)spawnParticles(x,ground+.05,z,1,[.7,.75,.9],.6);}
  if(WEATHER.bolt){const b=WEATHER.bolt;let px=b.x,pz=b.z;const segs=14;gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    for(let s=0;s<segs;s++){const y0=b.y+(segs-s)*8,y1=y0-8;const nx=px+(hash2(s,b.seed|0,1)-.5)*3,nz=pz+(hash2(s,b.seed|0,2)-.5)*3;const mx=(px+nx)/2,mz=(pz+nz)/2,len=Math.hypot(nx-px,8,nz-pz);
      const m=chain(M4.tr(mx,(y0+y1)/2,mz),M4.ry(Math.atan2(nx-px,nz-pz)),M4.rx(Math.atan2(Math.hypot(nx-px,nz-pz),8)),M4.sc(.25,len,.25));box(m,[.85,.85,1],.9);px=nx;pz=nz;}}
  gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(PB.u.lit,1);}
{const d0=drawMobs;drawMobs=function(fogF){d0(fogF);if(MATCH.mode==='survival')drawWeather();};}

// ---------- ambient sounds ----------
const AMBS={cave:30+Math.random()*60,dim:6,water:false,uw:3,fire:2,lava:3};
function ambientTick(dt){const p=player;if(!p||!actx||!camPos||SURV.loading)return;
  const cx=Math.floor(camPos[0]),cy=Math.floor(camPos[1]),cz=Math.floor(camPos[2]);const L=lightAt(cx,cy,cz);
  // caves: the occasional eerie sound when it is dark and enclosed
  AMBS.cave-=dt;if(AMBS.cave<=0){AMBS.cave=60+Math.random()*120;if(DIM==='overworld'&&(L>>4)<6&&(L&15)<8&&cy<SEA+10)psnd(['ambient/cave/cave'],[cx+(Math.random()-.5)*16,cy,cz+(Math.random()-.5)*16],.6,1);}
  // underwater
  const inW=isWaterB(getB(cx,Math.floor(camPos[1]),cz));if(inW!==AMBS.water){AMBS.water=inW;psnd([inW?'ambient/underwater/enter':'ambient/underwater/exit'],null,.4,1);}
  if(inW){AMBS.uw-=dt;if(AMBS.uw<=0){AMBS.uw=3+Math.random()*6;const g=['ambient/underwater/additions/bubbles','ambient/underwater/additions/water','ambient/underwater/additions/driplets','ambient/underwater/additions/animal','ambient/underwater/additions/dark'];psnd([g[Math.random()*g.length|0]],null,.3,1);}}
  // the Nether's rumble, the End's hum
  AMBS.dim-=dt;if(AMBS.dim<=0){if(DIM==='nether'){AMBS.dim=6+Math.random()*10;tone('sine',38+Math.random()*12,30,4,.08);if(Math.random()<.5)psnd(['ambient/cave/cave'],null,.25,.55);else if(Math.random()<.25&&!mobs.some(m=>m.mob==='ghast'))tone('sine',330,180,2,.02);}
    else if(DIM==='end'){AMBS.dim=10+Math.random()*14;tone('sine',55,52,6,.05);tone('triangle',110,108,5,.012);}else AMBS.dim=8;}
  // fire crackles, lava pops
  AMBS.fire-=dt;AMBS.lava-=dt;if(AMBS.fire<=0||AMBS.lava<=0){let f=null,l=null;for(let i=0;i<70;i++){const x=cx+((Math.random()*17|0)-8),y=cy+((Math.random()*9|0)-4),z=cz+((Math.random()*17|0)-8);const b=getB(x,y,z);if(b===B.FIRE&&!f)f=[x,y,z];else if(b===B.LAVA&&!getB(x,y+1,z)&&!l)l=[x,y,z];}
    if(AMBS.fire<=0){AMBS.fire=1.5+Math.random()*2;if(f)psnd(['fire/fire'],f,.5,1);}if(AMBS.lava<=0){AMBS.lava=2+Math.random()*4;if(l){psnd(Math.random()<.6?['liquid/lavapop']:['liquid/lava'],l,.5,1);spawnParticles(l[0]+.5,l[1]+1,l[2]+.5,2,[1,.5,.1],1.5);}}}}
{const t0=survTick;survTick=function(dt){t0(dt);if(INF&&!SURV.loading){weatherTick(dt);ambientTick(dt);}};}

// ---------- the ending ----------
const END_TEXT=[
  'THE END','',
  'You found a world made of blocks and learned to shape it.',
  'You built a shelter before the first night, and lit it against the dark.',
  'You went down into the burning world below, and came back carrying fire.',
  'You followed the eyes across mountains and rivers to the place under the ground,',
  'and opened the door to the island at the edge of everything.','',
  'The dragon has fallen. The island is quiet now.','',
  'But the world you came from is still out there,',
  'with mountains you have not climbed, rivers you have not followed,',
  'and all the things you have not built yet.','',
  'It was always yours to explore. It still is.','','Wake up, and go home.','','',
  'Minecraft:realzanized','Thank you for playing.'];
function showEndCredits(done){document.exitPointerLock&&document.exitPointerLock();let el=document.getElementById('endCredits');if(el)el.remove();
  el=document.createElement('div');el.id='endCredits';el.style.cssText='position:fixed;inset:0;z-index:9999;background:#000;color:#e8e8e8;font-family:monospace;overflow:hidden;display:flex;justify-content:center';
  const inner=document.createElement('div');inner.style.cssText='position:absolute;top:100%;width:min(720px,92vw);text-align:center;font-size:clamp(14px,2.2vw,20px);line-height:2.1';
  for(const l of END_TEXT){const d=document.createElement('div');d.textContent=l||' ';if(l==='THE END'){d.style.cssText='font-size:clamp(28px,5vw,48px);color:#c070ff;letter-spacing:6px;margin-bottom:24px';}if(l==='Minecraft:realzanized')d.style.color='#80ff20';inner.appendChild(d);}
  const btn=document.createElement('button');btn.textContent='Continue';btn.style.cssText='position:fixed;bottom:28px;right:28px;padding:10px 22px;font:inherit;font-size:16px;background:#333;color:#fff;border:2px solid #888;cursor:pointer';
  el.append(inner,btn);document.body.appendChild(el);let y=window.innerHeight,last=performance.now(),run=true;
  const step=t=>{if(!run)return;const dt=(t-last)/1000;last=t;y-=dt*38;inner.style.top=y+'px';if(y<-inner.offsetHeight-40)y=window.innerHeight;requestAnimationFrame(step);};requestAnimationFrame(step);
  const close=()=>{if(!run)return;run=false;el.remove();try{done&&done();}catch(e){console.error(e);}if(MATCH.state==='play'&&!paused)lockPointer();};btn.addEventListener('click',close);
  tone('sine',220,220,6,.03);setTimeout(()=>tone('sine',330,330,6,.025),1500);}

// ---------- menus: the new blocks in Creative, the new recipes on the crafting tabs, new loading tips ----------
{for(const k of ['BIRCH_LOG','BIRCH_LEAVES','ACACIA_LOG','ACACIA_LEAVES','DARK_OAK_LOG','DARK_OAK_LEAVES','SPRUCE_LEAVES','CACTUS','REEDS','ALLIUM','BLUE_ORCHID','AZURE','OXEYE','TULIP_RED','TULIP_ORANGE','TULIP_WHITE','TULIP_PINK',
    'MUSH_RED','MUSH_BROWN','TALLGRASS2','LARGE_FERN','LILAC','ROSE_BUSH','PEONY','COARSE_DIRT','RED_SAND','MYCELIUM','QUARTZ_ORE','NETHER_WART','END_STONE','SOUL','OBSIDIAN'])if(B[k]!=null)NATURE.add(B[k]);
  for(const k of ['BED','SPAWNER','DRAGON_EGG','NB_FENCE','END_FRAME','FIRE'])if(B[k]!=null)DECOR.add(B[k]);CRE.cats=null;
  const T=n=>LC_TABS.find(t=>t.name===n).entries;const b=k=>'b'+B[k];
  const pl=T('Structures').find(e=>e[0]==='Planks');if(pl)pl[1].push(b('BIRCH_PLANKS'),b('ACACIA_PLANKS'),b('DARK_OAK_PLANKS'));
  T('Structures').push(['Nether Brick Fence',[b('NB_FENCE')]],['Glowstone',['b17']]);
  T('Materials').push(['Blaze Powder',['blaze_powder']],['Eye of Ender',['ender_eye']],['Gold',['gold_nugget','gold_ingot']]);
  T('Decoration').push(['Bed',[b('BED')]]);
  SURV_TIPS.push('Build a frame of obsidian 4 wide and 5 tall, then light it with Flint and Steel to open a Nether Portal.','Pour water onto still lava to make obsidian.',
    'Blazes guard Nether Fortresses. Their rods make Blaze Powder; add an Ender Pearl for an Eye of Ender.','Throw an Eye of Ender: it flies toward a stronghold, deep underground.',
    'Sleep in a bed to skip the night and set where you come back. Beds do not work in the Nether or the End.','The Ender Dragon heals from the crystals on the obsidian pillars. Break them first.');}
// first visits feel like milestones
{const t0=travelTo;travelTo=function(dim,pos,opt={}){const first=!(SURV.visited||(SURV.visited={}))[dim];SURV.visited[dim]=true;t0(dim,pos,opt);
    if(first&&!opt.quiet&&dim!=='overworld')setTimeout(()=>{if(DIM===dim)SURV.toast={t:5,txt:dim==='nether'?'We Need to Go Deeper':'The End?'};},4500);};}
