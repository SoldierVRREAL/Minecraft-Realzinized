// ================= Unique tools: grappling hook, builder's wand, magnet, spyglass, compass, clock, staves, ore scanner, glider =================
const GZ={cd:{},grapple:null,scan:null,bolt:null,day:0};
const gcool=(k,t)=>{const n=perfT;if((GZ.cd[k]||0)>n)return false;GZ.cd[k]=n+t;return true;};
// march along a ray, stopping at fluids too (raycastBlock only stops at solid blocks)
function rayAny(o,d,maxD){for(let t=0;t<maxD;t+=.2){const x=Math.floor(o[0]+d[0]*t),y=Math.floor(o[1]+d[1]*t),z=Math.floor(o[2]+d[2]*t);const b=getB(x,y,z);if(b&&(BD[b].solid||BD[b].liquid))return {x,y,z,b,t};}return null;}
function useGadget(p,s){const id=s.id,it=ITEMS[id];const o=eye(p),d=fwd(p);let used=false;
  switch(id){
  case 'grapple':{const h=raycastBlock(o,d,32);if(!h){sfx('click',{vol:.4});break;}GZ.grapple={t:[o[0]+d[0]*h.t,o[1]+d[1]*h.t,o[2]+d[2]*h.t],time:0};sfx('bow');used=true;break;}
  case 'builder_wand':{const h=raycastBlock(o,d,6);if(!h)break;const n=[h.px-h.x,h.py-h.y,h.pz-h.z];const b=h.b;const need='b'+b;if(!ITEMS[need]){chatMsg("The wand can't copy that block.",'#ffaa55',false);break;}
    const ax=n[0]?[1,2]:n[1]?[0,2]:[0,1];let placed=0;
    for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const q=[h.x,h.y,h.z];q[ax[0]]+=a;q[ax[1]]+=c;if(getB(q[0],q[1],q[2])!==b)continue;const t=[q[0]+n[0],q[1]+n[1],q[2]+n[2]];const cur=getB(t[0],t[1],t[2]);if(cur&&!BD[cur].liquid&&!BD[cur].cross)continue;
      const si=p.inv.findIndex(x=>x&&x.id===need);if(si<0)break;if(placeBlock(t[0],t[1],t[2],b)){consume(p,si);placed++;}}
    if(placed){used=true;spawnParticles(h.px+.5,h.py+.5,h.pz+.5,10,[1,.9,.4],2,'magic');}else chatMsg('You need '+ITEMS[need].name+' in your inventory.','#ffaa55',false);break;}
  case 'blink_staff':{if(!gcool('blink',1.2))break;let t=12;const h=raycastBlock(o,d,12);if(h)t=Math.max(0,h.t-.8);let dest=null;
    for(let k=t;k>=1;k-=.5){const x=o[0]+d[0]*k,y=o[1]+d[1]*k-1.5,z=o[2]+d[2]*k;for(const up of [0,1,2]){const fy=Math.floor(y)+up;if(!solid(Math.floor(x),fy,Math.floor(z))&&!solid(Math.floor(x),fy+1,Math.floor(z))){dest=[x,fy,z];break;}}if(dest)break;}
    if(!dest)break;spawnParticles(p.pos[0],p.pos[1]+1,p.pos[2],20,[.6,.3,.9],2,'magic');p.pos=dest;p.vel=[0,0,0];p.mot=[0,0,0];p.fallDist=0;GZ.tp=perfT;spawnParticles(dest[0],dest[1]+1,dest[2],20,[.6,.3,.9],2,'magic');sfx('splash',{vol:.6});used=true;break;}
  case 'fire_staff':{if(!gcool('fire',.6))break;const bh=raycastBlock(o,d,24);const maxT=bh?bh.t:24;let best=null,bt=maxT;for(const t of hitList()){if(t===p||!t.alive)continue;const tt=rayBox(o,d,...entBox(t,.2));if(tt>=0&&tt<bt){bt=tt;best=t;}}
    GZ.bolt={from:o.slice(),to:[o[0]+d[0]*bt,o[1]+d[1]*bt,o[2]+d[2]*bt],t:.25};for(let k=1;k<bt;k+=.8)spawnParticles(o[0]+d[0]*k,o[1]+d[1]*k-.2,o[2]+d[2]*k,1,[1,.5,.1],.3);
    if(best)damage(best,5,p,'magic',[best.pos[0]-p.pos[0],best.pos[2]-p.pos[2],0,-Math.sin(p.yaw),-Math.cos(p.yaw)],false,[['ignite',5,0]]);sfx('bow',{vol:.8});used=true;break;}
  case 'frost_wand':{if(!gcool('frost',.8))break;const h=rayAny(o,d,20);if(!h)break;let n=0;for(let dy=-3;dy<=3;dy++)for(let dz=-4;dz<=4;dz++)for(let dx=-4;dx<=4;dx++){if(dx*dx+dy*dy*1.5+dz*dz>17)continue;const x=h.x+dx,y=h.y+dy,z=h.z+dz;const b=getB(x,y,z);
      if(b===B.WATER&&!getB(x,y+1,z)){setBlockNet(x,y,z,B.ICE);n++;}else if(b===B.WATER&&n<60&&Math.random()<.5){setBlockNet(x,y,z,B.ICE);n++;}else if(b===B.LAVA){setBlockNet(x,y,z,B.OBSIDIAN);n++;}}
    spawnParticles(h.x+.5,h.y+1,h.z+.5,30,[.85,.95,1],3);sfx('glass',{vol:.5});used=n>0;break;}
  case 'sakura_staff':{if(!gcool('heal',20)){chatMsg('The Sakura Staff is recharging...','#ffaacc',false);break;}p.health=Math.min(maxHP(p),p.health+6);giveEffect(p,'regen',8,0);spawnParticles(p.pos[0],p.pos[1]+1.2,p.pos[2],30,[1,.7,.85],2.5);sfx('orb');used=true;break;}
  case 'ore_scanner':{if(!gcool('scan',15)){chatMsg('The Ore Scanner is recharging...','#88aaff',false);break;}const list=[];const cx=Math.floor(p.pos[0]),cy=Math.floor(p.pos[1]),cz=Math.floor(p.pos[2]);
    for(let dy=-16;dy<=16;dy++)for(let dz=-16;dz<=16;dz++)for(let dx=-16;dx<=16;dx++){const b=getB(cx+dx,cy+dy,cz+dz);if(ORE_BLOCKS.has(b)&&b!==59)list.push([cx+dx,cy+dy,cz+dz,b]);}
    GZ.scan={list,t:15};chatMsg(`Ore Scanner: ${list.length} ores nearby.`,'#88aaff',false);sfx('orb');used=true;break;}
  }
  if(used)wearHeld(p,1);return true;}
// colours the scanner outlines use
const ORE_GLOW={104:[1,.2,.25],105:[.25,.4,1],106:[.25,.5,.9],107:[.6,1,.9],108:[.75,.35,1],109:[.2,.2,.2],110:[.85,.65,.5],111:[1,.85,.2],112:[.4,1,.95],84:[.4,.7,1]};
function gadgetTick(dt){const p=player;if(!p||!p.alive)return;const s=p.inv[p.sel],id=s&&s.id;
  // grappling hook: pull toward the hook point
  if(GZ.grapple){const g=GZ.grapple;g.time+=dt;const e=eye(p);const v=[g.t[0]-e[0],g.t[1]-e[1]+.6,g.t[2]-e[2]];const L=Math.hypot(...v);
    if(L<1.4||g.time>3||p.sneak||id!=='grapple'){GZ.grapple=null;}else{const sp=Math.min(1.1,.35+g.time*.9);p.mot=[v[0]/L*sp,v[1]/L*sp+.04,v[2]/L*sp];p.fallDist=0;GZ.tp=perfT;}}
  // magnet
  if(id==='magnet')for(const d of drops){if(d.age<.6||d.dead)continue;const v=[p.pos[0]-d.pos[0],p.pos[1]+.6-d.pos[1],p.pos[2]-d.pos[2]];const L=Math.hypot(...v);if(L>10||L<.4)continue;const k=Math.min(L,dt*9)/L;d.pos[0]+=v[0]*k;d.pos[1]+=v[1]*k;d.pos[2]+=v[2]*k;d.vel=[0,0,0];}
  // glider: hold jump while falling
  if(id==='glider'&&!p.onGround&&p.jump&&p.mot&&p.mot[1]<-.06&&!p.inWater){p.mot[1]=-.06;const f=[-Math.sin(p.yaw),-Math.cos(p.yaw)];p.mot[0]+=(f[0]*.4-p.mot[0])*Math.min(1,dt*3);p.mot[2]+=(f[1]*.4-p.mot[2])*Math.min(1,dt*3);p.fallDist=0;
    if(Math.random()<.3)spawnParticles(p.pos[0],p.pos[1]+1.6,p.pos[2],1,[.8,1,.95],.2);}
  // spyglass: hold right click
  if(p.using==='spy'&&(!rmb||id!=='spyglass'))p.using=null;
  if(GZ.scan){GZ.scan.t-=dt;if(GZ.scan.t<=0)GZ.scan=null;}if(GZ.bolt){GZ.bolt.t-=dt;if(GZ.bolt.t<=0)GZ.bolt=null;}}
// rope, fire bolt and scanner outlines (drawn after the world)
function drawGadgetFX(){if(!player)return;useBox(VP,camPos);gl.uniform1f(PB.u.lit,0);
  const line=(a,b,col,w,al)=>{const v=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const L=Math.hypot(...v);if(L<.01)return;const yaw=Math.atan2(v[0],v[2]),pit=Math.asin(clamp(v[1]/L,-1,1));
    box(chain(M4.tr((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),M4.ry(yaw),M4.rx(-pit),M4.sc(w,w,L)),col,al);};
  if(GZ.grapple){const e=eye(player);line([e[0],e[1]-.4,e[2]],GZ.grapple.t,[.45,.32,.2],.05,1);box(chain(M4.tr(...GZ.grapple.t),M4.sc(.2,.2,.2)),[.6,.6,.62]);}
  if(GZ.bolt){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);line(GZ.bolt.from,GZ.bolt.to,[1,.55,.15],.12,GZ.bolt.t*4);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.BLEND);}
  if(GZ.scan&&GZ.scan.list.length){gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);const a=Math.min(1,GZ.scan.t/2)*.45;
    for(const [x,y,z,b] of GZ.scan.list){if(getB(x,y,z)!==b)continue;box(chain(M4.tr(x+.5,y+.5,z+.5),M4.sc(.98,.98,.98)),ORE_GLOW[b]||[1,1,1],a);}
    gl.depthMask(true);gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);}}
// compass and clock read-outs on the HUD
function drawGadgetHUD(){const p=player;if(!p||!p.alive||!survival())return;const s=p.inv[p.sel],id=s&&s.id;
  if(id==='compass'){const sp=SURV.spawn;const dx=sp[0]-p.pos[0],dz=sp[2]-p.pos[2];const dist=Math.round(Math.hypot(dx,dz));const ang=Math.atan2(-dx,-dz)-p.yaw;const cx=W/2,cy=110;
    hc.save();hc.translate(cx,cy);hc.fillStyle='rgba(0,0,0,.45)';hc.beginPath();hc.arc(0,0,26,0,7);hc.fill();hc.rotate(-ang);hc.fillStyle='#e03030';hc.beginPath();hc.moveTo(0,-20);hc.lineTo(6,4);hc.lineTo(-6,4);hc.fill();hc.fillStyle='#ddd';hc.beginPath();hc.moveTo(0,18);hc.lineTo(6,4);hc.lineTo(-6,4);hc.fill();hc.restore();
    txt(dist<3?'Spawn is here':`Spawn: ${dist} blocks`,cx,cy+44,16,'#ffffff','center');}
  if(id==='clock'){const h=(worldTime*24+6)%24;const hh=Math.floor(h),mm=Math.floor((h-hh)*60);const night=h<6||h>=18.5;
    txt(`Day ${GZ.day+1}  ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}  ${night?'Night':h<9?'Morning':h<16?'Day':'Evening'}`,W/2,100,18,night?'#aab8ff':'#ffe080','center');}}
