// ================= Java Edition combat (1.9 and later) in Battle and Battle Royale =================
// Survival, Tumble and Glide keep the console-style 1.8 combat. In Battle and Battle Royale:
// - Attack cooldown: every weapon has an attack speed (sword 1.6/s, axes 0.8-1.0, pickaxe 1.2, hand 4). Damage scales with how charged
//   the swing is (20% to 100%, by the square of the charge). Swinging at nothing, or switching items, starts the cooldown again. The
//   crosshair shows the charge, and the held item dips and rises with it.
// - A fully charged hit while falling is a critical (x1.5), but not while sprinting. A charged hit while sprinting knocks back further;
//   a charged hit standing or walking with a sword sweeps (1 damage and a push to everyone right beside the target).
// - Swords no longer block. Shields do: put one in your off hand (F swaps it with the item in your hand), hold right-click to raise
//   it (it takes a quarter of a second), and it stops all damage from melee hits and arrows coming from the front, pushing melee
//   attackers back. An axe hit disables a raised shield for 5 seconds. Shields wear out (336 uses' worth).
// - The 1.9 damage values: swords 4-7, axes 7-9, and so on (ItemSword / ItemAxe / ItemTool attack damage + 1).
const javaCombat=()=>MATCH.mode==='battle'||MATCH.mode==='br';
Object.assign(N,{SHB:62});
const J_TIERS={wood:0,golden:0,stone:1,iron:2,diamond:3};
const J_DMG={sword:[4,5,6,7],axe:[7,9,9,9],pickaxe:[2,3,4,5],shovel:[2.5,3.5,4.5,5.5]};
const J_AXE_SPEED=[.8,.8,.9,1];   // wood, stone, iron, diamond (gold: 1.0)
function jTier(id){const m=/^(wood|golden|stone|iron|diamond)_/.exec(id||'');return m?m[1]:null;}
function jBaseDmg(id){const it=id&&ITEMS[id];if(!it||it.type!=='weapon')return 1;const base=id.replace(/_e_.*$/,''),tr=jTier(base),t=J_DMG[it.tool];
  if(t&&tr)return t[J_TIERS[tr]];return Math.max(1,(it.dmg||1)-1);}
function atkSpeed(id){const it=id&&ITEMS[id];if(!it||it.type!=='weapon')return 4;const base=id.replace(/_e_.*$/,''),tr=jTier(base);
  if(it.tool==='sword')return 1.6;if(it.tool==='axe')return tr==='golden'?1:J_AXE_SPEED[J_TIERS[tr]||0];if(it.tool==='pickaxe')return 1.2;if(it.tool==='shovel')return 1;return 1.6;}
// EntityPlayer.getCooledAttackStrength: (ticks since the last swing + 0.5) / cooldown period, capped at 1
function atkStrength(e){const s=e.inv&&e.inv[e.sel];const period=20/atkSpeed(s&&s.id);return clamp(((e.cdT==null?99:e.cdT)*20+.5)/period,0,1);}
// keep the cooldown counting, and restart it whenever the held item changes
{const k0=tickOwned;tickOwned=function(e,dt,moved){if(javaCombat()){e.cdT=(e.cdT==null?99:e.cdT)+dt;const s=e.inv&&e.inv[e.sel],id=s?s.id:null;if(id!==e.cdHeld){e.cdHeld=id;e.cdT=0;}
  if(e.shieldCD>0)e.shieldCD=Math.max(0,e.shieldCD-dt);if(e.using==='shield')e.useT=(e.useT||0)+dt;}return k0.apply(this,arguments);};}
// ---- attacking ----
{const d0=doAttack;doAttack=function(e,target){if(!javaCombat())return d0.apply(this,arguments);
  if(!e.isLocal&&e.atkCD>0)return;if(e.using==='shield'&&e.isLocal)return;   // you can't attack with your shield up
  const f=atkStrength(e);
  if(!e.isLocal&&e.ai){if(f<(e.ai.cdWant||.92))return;e.ai.cdWant=botCdWant();}   // bots wait for their swing to charge, as well as their difficulty lets them
  e.atkCD=e.isLocal?0:.12;e.swing=1;e.cdT=0;
  const t=target!==undefined?target:meleeTarget(e,3);if(!t)return;exhaust(e,.1);
  const held=e.inv[e.sel],hid=held&&held.id,it=hid&&ITEMS[hid];
  let base=jBaseDmg(hid);const st=e.effects.strength,wk=e.effects.weakness;if(st)base+=3*(st.amp+1);if(wk)base-=4*(wk.amp+1);base=Math.max(0,base);
  const sharp=it&&it.type==='weapon'?enchLvl(hid,'sharpness'):0;const ench=(sharp?.5*sharp+.5:0)*f;
  let dmg=base*(.2+f*f*.8);const strong=f>.9;
  let kb=it&&it.type==='weapon'?enchLvl(hid,'knockback'):0;const sprintKB=!!(e.sprint&&strong);if(sprintKB)kb++;
  const crit=strong&&(e.fallDist||0)>0&&!e.onGround&&!onLadder(e)&&!e.inWater&&!e.effects.blind&&!e.sprint;if(crit)dmg*=1.5;dmg+=ench;
  const hsp=Math.hypot(e.vel?e.vel[0]:0,e.vel?e.vel[2]:0);
  const sweep=strong&&!crit&&!sprintKB&&e.onGround&&hsp<4.5&&it&&it.tool==='sword';
  const fa=enchLvl(hid,'fire_aspect');const fx=fa?[['ignite',4*fa,0]]:[];
  if(e.effects.invis)delete e.effects.invis;
  const at=t.pos;sfx(crit?'crit':sprintKB?'atkknock':sweep?'atksweep':strong?'atkstrong':'atkweak',{pos:at});
  if(crit)spawnParticles(at[0],at[1]+1.2,at[2],14,[1,1,1],4,'crit');
  damage(t,dmg,e,'melee',[t.pos[0]-e.pos[0],t.pos[2]-e.pos[2],kb,-Math.sin(e.yaw),-Math.cos(e.yaw)],false,fx.length?fx:undefined);
  if(kb>0&&e.mot){e.mot[0]*=.6;e.mot[2]*=.6;e.sprint=false;}
  if(sweep){const fw=[-Math.sin(e.yaw),-Math.cos(e.yaw)];spawnParticles(e.pos[0]+fw[0]*1.2,e.pos[1]+1,e.pos[2]+fw[1]*1.2,8,[1,1,1],2.5,'poof');
    for(const o of hitList()){if(o===e||o===t||!o.alive||o.spectator)continue;if(Math.abs(o.pos[0]-t.pos[0])>1.3||Math.abs(o.pos[2]-t.pos[2])>1.3||Math.abs(o.pos[1]-t.pos[1])>.6)continue;
      if(dist(o.pos,e.pos)>=3)continue;damage(o,1,e,'melee',[fw[0],fw[1],0]);}}
};}
function botCdWant(){const D=DIFF[SET.difficulty|0]||DIFF[1];return clamp(.55+D.acc*.4+(Math.random()-.5)*.15,.5,1);}
// ---- shields ----
// LivingEntity.isDamageSourceBlocked: raised for 5 ticks, the attack is melee or a projectile, and it comes from in front
function shieldBlocks(e,src,cause){if(!javaCombat()||!e||e.using!=='shield'||!src||src===e||(cause!=='melee'&&cause!=='arrow'))return false;if(owned(e)&&(e.useT||0)<.25)return false;
  const dx=src.pos[0]-e.pos[0],dz=src.pos[2]-e.pos[2],l=Math.hypot(dx,dz)||1,lx=-Math.sin(e.yaw),lz=-Math.cos(e.yaw);return (dx*lx+dz*lz)/l>0;}
{const h0=hurt;hurt=function(e,amt,src,cause,kb,raw,ignore){if(e.alive&&MATCH.state==='play'&&!(MATCH.preT>0)&&shieldBlocks(e,src,cause)){shieldHit(e,amt,src,cause);return false;}return h0.apply(this,arguments);};}
function shieldStack(e){const s=e.inv[e.sel];if(s&&s.id==='shield')return {s,main:true};if(e.off&&e.off.id==='shield')return {s:e.off,main:false};return null;}
function shieldHit(e,amt,src,cause){sfx('shieldblock',{pos:e.pos});
  const sh=shieldStack(e);if(sh&&amt>=3){sh.s.dmg=(sh.s.dmg||0)+1+Math.floor(amt);if(sh.s.dmg>=336){if(sh.main)e.inv[e.sel]=null;else e.off=null;e.using=null;sfx('shieldbreak',{pos:e.pos});}}
  if(cause!=='melee')return;
  // the attacker is pushed back; an axe also knocks the shield down for 5 seconds
  const dx=src.pos[0]-e.pos[0],dz=src.pos[2]-e.pos[2];if(owned(src))knockback(src,dx,dz);else netSend(N.SHB,{a:src.id,d:[dx,dz]});
  const w=src.heldHint||(src.inv&&src.inv[src.sel]&&src.inv[src.sel].id);if(w&&ITEMS[w]&&ITEMS[w].tool==='axe'){e.shieldCD=5;e.using=null;sfx('shieldbreak',{pos:e.pos});}}
{const o0=onNetEvent;onNetEvent=function(code,d,from){if(code===N.SHB){const a=d&&entById(d.a);if(a&&owned(a)&&a.alive&&Array.isArray(d.d))knockback(a,d.d[0],d.d[1]);return;}return o0.apply(this,arguments);};}
// ---- the player: F swaps hands, right-click raises the shield, swords don't block ----
document.addEventListener('keydown',e=>{if(e.code!=='KeyF'||!javaCombat()||MATCH.state!=='play'||!player||!player.alive||chestOpen||e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  if(typeof chatOpen!=='undefined'&&chatOpen)return;swapHands(player);});
function swapHands(p){const a=p.inv[p.sel],b=p.off||null;p.inv[p.sel]=b;p.off=a;if(p.using==='shield')p.using=null;sfx('pick',{vol:.5});}
// a right-click: the main hand goes first if its item does something; otherwise the off hand (like Java)
function mainUses(p){const s=p.inv[p.sel],it=s&&ITEMS[s.id];if(!it)return false;
  return it.type==='food'&&(p.food<20||it.always)||it.type==='potion'||it.type==='splash'||(it.type==='bow'&&hasItem(p,'arrow')>=0)||it.type==='block'&&canBuild()||it.type==='armor';}
function wantsShield(p){const s=p.inv[p.sel],it=s&&ITEMS[s.id];if(it&&it.type==='shield')return true;return !!(p.off&&p.off.id==='shield'&&!mainUses(p));}
{const u0=updatePlayer;updatePlayer=function(dt){const p=player;if(!javaCombat()||MATCH.state!=='play'||!p||!p.alive||MATCH.preT>0)return u0.apply(this,arguments);
  const s=p.inv[p.sel],it=s&&ITEMS[s.id];const active=(locked||padActive||touchActive)&&!chestOpen;const chest=typeof lookChest==='function'&&lookChest();
  const shield=active&&rmb&&!chest&&wantsShield(p)&&!(p.shieldCD>0);
  if(shield){if(p.using!=='shield'){p.using='shield';p.useT=0;}}else if(p.using==='shield')p.using=null;
  const swordRmb=active&&rmb&&!chest&&it&&it.tool==='sword';
  if(shield||swordRmb||p.using==='shield'){const R=rmb,L=lmb,LE=lmbEdge;rmb=false;rmbEdge=false;if(p.using==='shield'){lmb=false;lmbEdge=false;}
    try{return u0.apply(this,arguments);}finally{rmb=R;lmb=L;lmbEdge=false;if(p.using!=='shield'&&shield){p.using='shield';}}}
  // swinging at the air (no target in reach) still starts the cooldown, as in Java
  if(active&&lmbEdge&&!meleeTarget(p,3)&&!(it&&it.type==='bow')){p.cdT=0;}
  return u0.apply(this,arguments);};}
// a new round: no off-hand item, shields ready
{const a0=applyStart;applyStart=function(){const r=a0.apply(this,arguments);for(const e of ents){e.off=null;e.offId=null;e.shieldCD=0;e.cdT=99;e.cdHeld=undefined;if(e.using==='shield')e.using=null;}return r;};}
// ---- bots: keep a shield in the off hand and raise it when someone squares up to them ----
{const b0=updateBot;updateBot=function(b,dt){if(!javaCombat())return b0.apply(this,arguments);
  if(!b.off){const i=b.inv.findIndex(s=>s&&s.id==='shield');if(i>=0){b.off=b.inv[i];b.inv[i]=null;}}
  const ai=b.ai||{};ai.shT=(ai.shT||0)-dt;
  if(b.off&&b.off.id==='shield'&&!(b.shieldCD>0)&&MATCH.state==='play'&&!(MATCH.preT>0)&&b.alive){
    let near=null,nd=1e9;for(const e of aliveList()){if(e===b)continue;const d=dist(e.pos,b.pos);if(d<nd){nd=d;near=e;}}
    const D=DIFF[SET.difficulty|0]||DIFF[1];
    if(near&&nd<4.2&&(atkStrength(b)<.6||atkStrength(near)>.9)&&ai.shT<=0&&Math.random()<D.acc*dt*3){b.using='shield';b.useT=0;ai.shT=.5+Math.random()*.7;ai.shUntil=perfT+ai.shT;}
    if(b.using==='shield'&&(perfT>(ai.shUntil||0)||!near||nd>6))b.using=null;}
  else if(b.using==='shield')b.using=null;
  if(b.using==='shield'){const r=b0.apply(this,arguments);if(b.using!=='shield'&&perfT<(ai.shUntil||0))b.using='shield';return r;}
  return b0.apply(this,arguments);};}
// ---- HUD: the off-hand slot beside the hotbar, the shield's cooldown, and the attack indicator under the crosshair ----
{const h0=drawHotbar;drawHotbar=function(){h0.apply(this,arguments);if(!javaCombat()||!player)return;const p=player,G=hudGeom(),S=G.S,u=S/20;
  const x=G.hx-S*1.45,y=G.hy;hc.fillStyle='rgba(0,0,0,.55)';hc.fillRect(x-u,y-u,S+2*u,S+2*u);hc.fillStyle='rgba(139,139,139,.42)';hc.fillRect(x+u,y+u,S-2*u,S-2*u);
  hc.fillStyle='rgba(55,55,55,.75)';hc.fillRect(x+u,y+u,S-2*u,u);hc.fillRect(x+u,y+u,u,S-2*u);
  const s=p.off;if(s&&ICONS[s.id]){hc.drawImage(ICONS[s.id],x+S*.14,y+S*.14,S*.72,S*.72);if(s.count>1)txt(String(s.count),x+S-4,y+S-5,13,'#fff','right');
    if(s.dmg){const f=1-s.dmg/336;hc.fillStyle='#000';hc.fillRect(x+S*.16,y+S*.8,S*.68,S*.08);hc.fillStyle=`hsl(${Math.round(f*120)},90%,50%)`;hc.fillRect(x+S*.16,y+S*.8,S*.68*f,S*.05);}}
  if(p.shieldCD>0){const k=p.shieldCD/5;const sh=shieldStack(p);if(sh){const sx=sh.main?G.hx+p.sel*S:x;hc.fillStyle='rgba(255,255,255,.5)';hc.fillRect(sx+u,y+u+(S-2*u)*(1-k),S-2*u,(S-2*u)*k);}}
  if(MATCH.state!=='play'||!p.alive||chestOpen)return;
  // the attack indicator (vanilla "Crosshair" setting): a bar while charging, a small sword when charged and aimed at someone in reach
  const f=atkStrength(p),k=Math.max(2,Math.round(S/20)),cx=Math.round(W/2),cy=Math.round(H/2);
  if(f<1){const w=16*k,h=4*k,bx=cx-w/2,by=cy+9*k;hc.fillStyle='rgba(30,30,30,.75)';hc.fillRect(bx,by,w,h);hc.fillStyle='#e8e8e8';hc.fillRect(bx+k,by+k,Math.round((w-2*k)*f),h-2*k);}
  else if(meleeTarget(p,3)&&20/atkSpeed(p.inv[p.sel]&&p.inv[p.sel].id)>5){const P=['....##','...#.#','..#.#.','##.#..','.##...','#.##..'];hc.fillStyle='#e8e8e8';
    P.forEach((r,j)=>[...r].forEach((c,i)=>{if(c==='#')hc.fillRect(cx-3*k+i*k,cy+8*k+j*k,k,k);}));}};}
// ---- first person: the off-hand item at the bottom left; a raised shield comes up in front of you ----
function drawOffHand(proj,pre){if(!javaCombat())return;const p=player;const s=p&&p.off;const mainShield=p&&p.inv[p.sel]&&p.inv[p.sel].id==='shield';if(!s||mainShield&&p.using==='shield')return;
  const it=ITEMS[s.id];if(!it)return;const R=Math.PI/180,up=p.using==='shield'?Math.min(1,(p.useT||0)/.25):0;
  useTex(proj,[0,0,0]);gl.uniform1f(PT.u.fogF,1e9);gl.uniform1f(PT.u.fogN,1e8);setEntLight(p.pos);
  const hm=heldMesh(s.id);const base=pre||M4.id();
  const m=it.type==='shield'?chain(base,M4.tr(-.58+up*.34,-.52+up*.24,-.95+up*.15),M4.ry((30-up*26)*R),M4.rz(-4*R),M4.sc(.78,.78,.78))
    :chain(base,M4.tr(-.56,-.52,-.72),M4.ry(-45*R),M4.sc(.4,.4,.4),M4.sc(-1,1,1),M4.sc(2,2,2),M4.tr(0,.25,.125),M4.ry(-135*R),M4.rz(25*R),M4.sc(1.7,1.7,1.7),M4.sc(.5,.5,.5));
  drawMesh(hm.mesh,m,hm.tex);}
{const p0=promptLabels;promptLabels=function(){const out=p0.apply(this,arguments);const p=player;if(!javaCombat()||MATCH.state!=='play'||!p||!p.alive||!Array.isArray(out))return out;
  const res=out.filter(x=>!(x&&x[1]==='Block'&&!wantsShield(p)));if(wantsShield(p)&&!res.some(x=>x&&x[1]==='Block'))res.splice(1,0,[padActive?'LT':'RMB','Block']);
  if(!padActive&&(p.off||p.inv[p.sel]))res.push(['F','Swap Hands']);return res;};}
