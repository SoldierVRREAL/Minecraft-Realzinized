// ================= Locator bar (like Java 1.21.6): a bar above the hotbar with a coloured dot for every other player =================
// The dot sits where that player is relative to where you look (the bar spans 120 degrees; players behind you pin to the ends).
// Far players get smaller dots, an arrow shows when they are well above or below you, and looking straight at a dot shows the name and distance.
const LOC={fov:Math.PI*2/3,lastName:null,nameT:0};
function locColor(e){let h=0;const s=String(e.id);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return PLAYER_COLORS[1+Math.abs(h)%15];}
function drawLocatorBar(G){const p=player;if(!p||MATCH.state!=='play')return;
  const others=ents.filter(e=>e!==p&&e.kind==='player'&&e.alive&&!e.spectator);
  const left=G.hx,w=G.S*9,h=G.barH,y=G.barTop;
  // the bar itself: dark track with a lighter centre notch (drawn even with nobody else around, like vanilla shows the empty bar)
  if(!others.length&&!online)return;
  hc.fillStyle='rgba(0,0,0,.7)';hc.fillRect(left-1,y-1,w+2,h+2);hc.fillStyle='rgba(60,60,60,.85)';hc.fillRect(left,y,w,h);
  hc.fillStyle='rgba(255,255,255,.35)';hc.fillRect(Math.round(left+w/2)-1,y,2,h);
  const eyeP=(p.rpos||p.pos);let centre=null,cd=1e9;
  const dots=[];
  for(const e of others){const ep=e.rpos||e.pos;const dx=ep[0]-eyeP[0],dz=ep[2]-eyeP[2],dy=ep[1]-eyeP[1];const d=Math.hypot(dx,dz,dy);
    let a=Math.atan2(-dx,-dz)-p.yaw;while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;   // 0 = straight ahead, + = to the left
    const f=clamp(-a/(LOC.fov/2),-1,1),edge=Math.abs(a)>LOC.fov/2;
    const r=Math.max(h*.45,h*1.25*(d<16?1:d<64?.85:d<256?.7:.55));
    dots.push({e,x:left+w/2+f*(w/2-r),r,d,dy,edge});if(!edge&&Math.abs(a)<.06&&d<cd){cd=d;centre={e,d};}}
  dots.sort((a,b)=>b.d-a.d);   // nearest drawn last (on top)
  for(const o of dots){const col=locColor(o.e),cx=Math.round(o.x),cy=y+h/2;hc.globalAlpha=o.edge?.55:1;
    hc.fillStyle='#000';hc.beginPath();hc.arc(cx,cy,o.r+1.5,0,7);hc.fill();hc.fillStyle=col;hc.beginPath();hc.arc(cx,cy,o.r,0,7);hc.fill();
    hc.fillStyle='rgba(255,255,255,.45)';hc.beginPath();hc.arc(cx-o.r*.3,cy-o.r*.3,o.r*.35,0,7);hc.fill();
    if(Math.abs(o.dy)>4){const up=o.dy>0,ay=up?cy-o.r-4:cy+o.r+4,s=Math.max(3,o.r*.7);hc.fillStyle=col;hc.beginPath();
      if(up){hc.moveTo(cx,ay-s);hc.lineTo(cx+s,ay);hc.lineTo(cx-s,ay);}else{hc.moveTo(cx,ay+s);hc.lineTo(cx+s,ay);hc.lineTo(cx-s,ay);}hc.fill();}
    if(o.edge){const s=Math.max(3,o.r*.6),dir=o.x>left+w/2?1:-1,ax=cx+dir*(o.r+3);hc.fillStyle=col;hc.beginPath();hc.moveTo(ax+dir*s,cy);hc.lineTo(ax,cy-s);hc.lineTo(ax,cy+s);hc.fill();}
    hc.globalAlpha=1;}
  // looking straight at someone: their name and how far away they are, just under the hotbar
  if(centre){LOC.lastName=centre;LOC.nameT=1;}else LOC.nameT=Math.max(0,LOC.nameT-dtFrame*2);
  if(LOC.nameT>0&&LOC.lastName){const c=LOC.lastName;hc.globalAlpha=Math.min(1,LOC.nameT*2);txt(`${c.e.name}  ${Math.round(c.d)}m`,W/2,G.hy+G.S+18,14,locColor(c.e),'center');hc.globalAlpha=1;}
}
