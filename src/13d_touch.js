// ================= mobile / touch controls =================
// Pocket-edition style: a square stick on the left, pixel-art buttons on the right (sprint and attack beside a column of
// jump, sneak and use), small buttons for pause, inventory, drop and chat. Drag anywhere on the right to look; a quick tap
// on the world attacks, holding still on it uses the held item. Hotbar slots are tappable. All the art is drawn here.
let touchActive=false;const touchIn={fw:0,st:0,jump:false,sneak:false,sprint:false};
if(OPT.tSize==null)OPT.tSize=1;if(!OPT.tMove)OPT.tMove='stick';if(OPT.tAlpha==null)OPT.tAlpha=.8;if(OPT.tSens==null)OPT.tSens=1;
function wantTouch(){if(OPT.mobile==='on')return true;if(OPT.mobile==='off')return false;return ('ontouchstart' in window||navigator.maxTouchPoints>0)&&matchMedia('(pointer: coarse)').matches;}
function applyTouchSetting(){touchActive=wantTouch();document.body.classList.toggle('touch',touchActive);if(touchActive&&document.pointerLockElement)document.exitPointerLock();applyTouchLook();}
const TUI=$('touchUI');
function applyTouchLook(){TUI.style.setProperty('--ts',OPT.tSize);TUI.style.setProperty('--ta',OPT.tAlpha);}

// ---------- pixel art ----------
// paint a grid of characters with a palette and return a data URL (drawn 1 pixel per cell; CSS scales it up crisply)
function pxURL(rows,pal){const h=rows.length,w=rows[0].length,c=mkCanvas(w,h),g=c.getContext('2d');
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=rows[y][x];if(pal[k]){g.fillStyle=pal[k];g.fillRect(x,y,1,1);}}return 'url('+c.toDataURL()+')';}
// a bevelled button face: black outline with cut corners, light top-left edge, dark bottom edge
function btnRows(n,pressed){const r=[];for(let y=0;y<n;y++){let s='';for(let x=0;x<n;x++){
    const edge=x===0||y===0||x===n-1||y===n-1,corner=(x<2&&y<2&&x+y<2)||(x>n-3&&y<2&&(n-1-x)+y<2)||(x<2&&y>n-3&&x+(n-1-y)<2)||(x>n-3&&y>n-3&&(n-1-x)+(n-1-y)<2);
    if(corner&&!(x===1&&y===1)&&!(x===n-2&&y===1)&&!(x===1&&y===n-2)&&!(x===n-2&&y===n-2)){s+='.';continue;}
    if(edge||(x===1&&y===1)||(x===n-2&&y===1)||(x===1&&y===n-2)||(x===n-2&&y===n-2)){s+='k';continue;}
    if(pressed){s+=(y===1||x===1)?'d':(y>=n-3)?'f':'f';continue;}
    s+=(y>=n-3)?'d':(y===1||x===1)?'h':(x===n-2)?'s':'f';}r.push(s);}return r;}
const TPAL={k:'#111',h:'#a4a4a4',f:'#6e6e6e',s:'#5a5a5a',d:'#3c3c3c'};
const TPAL_ON={k:'#111',h:'#c8c8c8',f:'#8f8f8f',s:'#7c7c7c',d:'#5e5e5e'};
const TPAL_LIT={k:'#111',h:'#b8d6a8',f:'#6f8f60',s:'#5f7d52',d:'#3c5232'};
// the stick: a light frame with a paler inner ring around a darker well
function joyRows(n){const r=[];for(let y=0;y<n;y++){let s='';for(let x=0;x<n;x++){const e=Math.min(x,y,n-1-x,n-1-y);const cx=Math.min(x,n-1-x),cy=Math.min(y,n-1-y);
    if(cx+cy<2){s+='.';continue;}if(e===0||(cx+cy===2&&e<=1)){s+='k';continue;}
    s+=e<=2?(y<n/2&&x<n/2?'a':'b'):e<=5?'w':e===6?'c':'g';}r.push(s);}return r;}
const JPAL={k:'#111',a:'#e2e2e2',b:'#c9c9c9',w:'#f1f1f1',c:'#a9a9a9',g:'rgba(120,120,120,.55)'};
// icons, black on the grey face (with a faint highlight under each pixel so they read on any background)
const TICONS={
  jump:['....##....','...####...','..######..','.########.','....##....','....##....','....##....','..........','.########.','.########.'],
  sneak:['....##....','....##....','....##....','.########.','..######..','...####...','....##....','..........','.########.','.########.'],
  sprint:['##...##...','.##...##..','..##...##.','...##...##','..##...##.','.##...##..','##...##...'],
  attack:['........##','.......###','......###.','.....###..','.#..###...','..####....','...##.....','..####....','.##..#....','##........'],
  use:['....##....','....##....','..........','..........','##..##..##','##..##..##','..........','..........','....##....','....##....'],
  pause:['..........','.###..###.','.###..###.','.###..###.','.###..###.','.###..###.','.###..###.','.###..###.','.###..###.','..........'],
  inv:['..........','..........','..........','..........','##..##..##','##..##..##','..........','..........','..........','..........'],
  drop:['.######...','.#....#...','.#....#...','.######...','....##....','....##....','..######..','...####...','....##....','..........'],
  chat:['..........','.########.','.#......#.','.#.####.#.','.#......#.','.#.###..#.','.#......#.','.####.###.','.....##...','.....#....'],
  ready:['..........','.........#','........##','.......##.','#.....##..','##...##...','.##.##....','..###.....','...#......','..........'],
  list:['..........','.########.','..........','..........','.########.','..........','..........','.########.','..........','..........']};
function iconURL(rows){const h=rows.length,w=rows[0].length;const sh=rows.map((r,y)=>[...r].map((c,x)=>c==='#'?'#':(y>0&&rows[y-1][x]==='#'?'l':'.')).join(''));return pxURL(sh,{'#':'#151515',l:'rgba(255,255,255,.18)'});}
{const R=TUI.style;R.setProperty('--tbtn',pxURL(btnRows(20,false),TPAL));R.setProperty('--tbtnOn',pxURL(btnRows(20,true),TPAL_ON));R.setProperty('--tbtnLit',pxURL(btnRows(20,false),TPAL_LIT));
  R.setProperty('--tjoy',pxURL(joyRows(40),JPAL));R.setProperty('--tknob',pxURL(btnRows(18,false),TPAL));R.setProperty('--tknobOn',pxURL(btnRows(18,true),TPAL_ON));
  for(const [id,ic] of [['tJump','jump'],['tSneak','sneak'],['tSprint','sprint'],['tAttack','attack'],['tUse','use'],['tPause','pause'],['tInv','inv'],['tDrop','drop'],['tChat','chat'],['tReady','ready'],['tList','list']])
    $(id).querySelector('i').style.backgroundImage=iconURL(TICONS[ic]);}
applyTouchLook();

// ---------- buttons ----------
function tBtn(id,fn,up){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();el.classList.add('on');try{el.setPointerCapture(e.pointerId);}catch(_){}
    if(navigator.vibrate&&OPT.tBuzz!==false)try{navigator.vibrate(8);}catch(_){}fn(el,e);});
  const rel=e=>{if(!el.classList.contains('on'))return;el.classList.remove('on');if(up)up(el,e);};el.addEventListener('pointerup',rel);el.addEventListener('pointercancel',rel);el.addEventListener('lostpointercapture',rel);
  el.addEventListener('contextmenu',e=>e.preventDefault());}
const fakeKey=code=>{document.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true})),60);};
tBtn('tJump',()=>{touchIn.jump=true;},()=>{touchIn.jump=false;});
tBtn('tAttack',()=>{lmb=true;lmbEdge=true;},()=>{lmb=false;});
tBtn('tUse',()=>{rmb=true;rmbEdge=true;},()=>{rmb=false;});
// sneak and sprint: a tap toggles them on and off; holding works as a hold
let sneakT=0,sprintT=0;
tBtn('tSneak',()=>{sneakT=performance.now();touchIn.sneak=player&&player.flying?true:!touchIn.sneak;},el=>{if((player&&player.flying)||performance.now()-sneakT>350)touchIn.sneak=false;el.classList.toggle('lit',touchIn.sneak);});
tBtn('tSprint',()=>{sprintT=performance.now();touchIn.sprint=!touchIn.sprint;},el=>{if(performance.now()-sprintT>350)touchIn.sprint=false;el.classList.toggle('lit',touchIn.sprint);});
tBtn('tInv',()=>{if(!player)return;if(chestOpen){chestClose(false);return;}if(!player.alive){spectate.mode='follow';spectate.idx++;return;}if(MATCH.state==='play'){if(!tryOpenChest())openInv();}});
// drop: a tap drops one, holding drops the whole stack
let dropHold=null;
tBtn('tDrop',()=>{if(player&&!player.alive){spectate.mode='bat';return;}fakeKey('KeyQ');dropHold=setTimeout(()=>{const p=player;if(!p||!p.alive||MATCH.state==='lobby')return;const s=p.inv[p.sel];if(!s||s.count<=0)return;
  const d=fwd(p);requestDrop([p.pos[0],p.pos[1]+.4,p.pos[2]],s.id,s.count,[d[0]*6,d[1]*6+2,d[2]*6]);p.inv[p.sel]=null;if(navigator.vibrate)try{navigator.vibrate(20);}catch(_){}},500);},()=>clearTimeout(dropHold));
tBtn('tChat',()=>{if(typeof openChat==='function'&&player&&!chatUI)openChat('');});
tBtn('tReady',()=>fakeKey('KeyR'));tBtn('tList',()=>fakeKey('Tab'));
tBtn('tPause',()=>{if(!online)paused=true;show('pause');});

// ---------- the stick: stays in one place bottom-left; the knob follows the thumb inside its frame ----------
let stickId=null,stickO=[0,0];const SB=$('tStickBase'),SK=$('tStickKnob');
$('tStickZone').addEventListener('pointerdown',e=>{e.preventDefault();if(OPT.tMove==='dpad'||stickId!=null)return;const r=SB.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;
  if(Math.abs(e.clientX-cx)>r.width*.95||Math.abs(e.clientY-cy)>r.height*.95)return;   // only touches on or near the stick
  stickId=e.pointerId;stickO=[cx,cy];try{e.target.setPointerCapture(e.pointerId);}catch(_){}SB.classList.add('on');moveStick(e);});
function moveStick(e){const R=SB.offsetWidth*.3||50;const dx=e.clientX-stickO[0],dy=e.clientY-stickO[1];
  const kx=clamp(dx,-R,R),ky=clamp(dy,-R,R);SK.style.transform=`translate(${kx}px,${ky}px)`;   // the knob stays inside the square frame
  let st=dx/R,fw=-dy/R;const L=Math.hypot(st,fw);if(L>1){st/=L;fw/=L;}if(L<.15){st=0;fw=0;}touchIn.st=st;touchIn.fw=fw;
  // push past the top of the frame to sprint
  if(-dy>R*1.3&&Math.abs(dx)<R*.7)touchIn.autoSprint=true;else if(fw<.7)touchIn.autoSprint=false;}
$('tStickZone').addEventListener('pointermove',e=>{if(e.pointerId===stickId)moveStick(e);});
const stickEnd=e=>{if(e.pointerId!==stickId)return;stickId=null;touchIn.fw=0;touchIn.st=0;touchIn.autoSprint=false;SK.style.transform='';SB.classList.remove('on');};
$('tStickZone').addEventListener('pointerup',stickEnd);$('tStickZone').addEventListener('pointercancel',stickEnd);

// ---------- the D-pad (Options > Controls > Touch Movement): arrows you can slide between; up-left and up-right appear while
// walking forward; double-tap forward to sprint; the middle is sneak ----------
const DP=$('tDpad');let dpId=null,dpCell=-1,dpUpT=0,dpSneakT=0;
const DP_CELLS=[[1,1,'ul'],[0,1,'u'],[-1,1,'ur'],[1,0,'l'],null,[-1,0,'r'],null,[0,-1,'d'],null];   // [strafe-left, forward]
function dpAt(e){const r=DP.getBoundingClientRect();const cx=Math.floor((e.clientX-r.left)/(r.width/3)),cy=Math.floor((e.clientY-r.top)/(r.height/3));if(cx<0||cy<0||cx>2||cy>2)return -1;return cy*3+cx;}
function dpSet(c){if(c===dpCell)return;const up=c===1||c===0||c===2;
  if(c===1&&dpCell!==0&&dpCell!==2){const now=performance.now();if(now-dpUpT<420)touchIn.autoSprint=true;dpUpT=now;}
  if(!up)touchIn.autoSprint=false;
  dpCell=c;const C=c>=0?DP_CELLS[c]:null;
  if(C&&(C[2]!=='ul'&&C[2]!=='ur'||DP.classList.contains('up'))){touchIn.st=-C[0];touchIn.fw=C[1];if(C[0]&&C[1]){touchIn.st*=.7071;touchIn.fw*=.7071;}}else{touchIn.st=0;touchIn.fw=0;}
  DP.classList.toggle('up',up&&(c!==0&&c!==2||DP.classList.contains('up')));
  for(const el of DP.children)el.classList.toggle('on',+el.dataset.c===c);
  if(c>=0&&navigator.vibrate&&OPT.tBuzz!==false)try{navigator.vibrate(6);}catch(_){}}
DP.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const c=dpAt(e);
  if(c===4){dpSneakT=performance.now();touchIn.sneak=player&&player.flying?true:!touchIn.sneak;DP.children[4].classList.add('on');try{DP.setPointerCapture(e.pointerId);}catch(_){}dpId='s'+e.pointerId;return;}
  if(dpId!=null)return;dpId=e.pointerId;try{DP.setPointerCapture(e.pointerId);}catch(_){}dpSet(c);});
DP.addEventListener('pointermove',e=>{if(e.pointerId!==dpId)return;dpSet(dpAt(e));});
const dpEnd=e=>{if(dpId==='s'+e.pointerId){dpId=null;DP.children[4].classList.remove('on');if((player&&player.flying)||performance.now()-dpSneakT>350)touchIn.sneak=false;return;}
  if(e.pointerId!==dpId)return;dpId=null;dpSet(-1);DP.classList.remove('up');};
DP.addEventListener('pointerup',dpEnd);DP.addEventListener('pointercancel',dpEnd);
{const ic={ul:['#######...','######....','#####.....','######....','###.###...','##...###..','#.....###.','.......###','........##','..........'],
    u:TICONS.jump.slice(0,7),d:TICONS.sneak.slice(0,7).reverse().map(r=>r).reverse(),
    l:['...#......','..##......','.#########','##########','.#########','..##......','...#......'],r:['......#...','......##..','#########.','##########','#########.','......##..','......#...']};
  ic.ur=ic.ul.map(r=>[...r].reverse().join(''));ic.d=['....##....','....##....','....##....','.########.','..######..','...####...','....##....'];
  ic.u=['....##....','...####...','..######..','.########.','....##....','....##....','....##....'];
  DP_CELLS.forEach((C,i)=>{const el=DP.children[i];if(i===4){el.querySelector('i').style.backgroundImage=iconURL(TICONS.sneak);return;}if(!C)return;el.querySelector('i').style.backgroundImage=iconURL(ic[C[2]]);});}
function applyMoveMode(){const d=OPT.tMove==='dpad';DP.classList.toggle('hidden',!d);SB.classList.toggle('hidden',d);}
applyMoveMode();
Object.defineProperty(touchIn,'sprintNow',{get(){return touchIn.sprint||touchIn.autoSprint;}});

// ---------- looking (right side): drag to turn; a quick tap attacks, a long still press uses the held item ----------
const looks=new Map();
$('tLook').addEventListener('pointerdown',e=>{e.preventDefault();try{e.target.setPointerCapture(e.pointerId);}catch(_){}
  const G=hudGeom(),S=G.S,hx=G.hx,hy=G.hy;   // tapping the hotbar selects a slot
  if(player&&e.clientY>=hy-4&&e.clientY<=hy+S+4&&e.clientX>=hx&&e.clientX<=hx+S*9){player.sel=clamp(Math.floor((e.clientX-hx)/S),0,8);player.using=null;selShow=2;return;}
  const L={x:e.clientX,y:e.clientY,t:performance.now(),moved:0,held:false};L.timer=setTimeout(()=>{if(L.moved<12){L.held=true;rmb=true;rmbEdge=true;if(navigator.vibrate)try{navigator.vibrate(12);}catch(_){}}},380);looks.set(e.pointerId,L);});
$('tLook').addEventListener('pointermove',e=>{const L=looks.get(e.pointerId);if(!L||!player)return;const dx=e.clientX-L.x,dy=e.clientY-L.y;L.x=e.clientX;L.y=e.clientY;L.moved+=Math.abs(dx)+Math.abs(dy);
  if(!player.alive&&spectate.mode==='follow')return;
  // a little acceleration: slow drags aim finely, fast swipes turn quickly
  const sp=Math.hypot(dx,dy),acc=1+Math.min(1.2,sp/40);lookDelta(dx*1.5*OPT.tSens*acc,dy*1.5*OPT.tSens*acc);});
const lookEnd=e=>{const L=looks.get(e.pointerId);if(!L)return;clearTimeout(L.timer);looks.delete(e.pointerId);if(L.held){rmb=false;return;}
  if(L.moved<12&&performance.now()-L.t<300){lmb=true;lmbEdge=true;setTimeout(()=>{lmb=false;},60);}};
$('tLook').addEventListener('pointerup',lookEnd);$('tLook').addEventListener('pointercancel',lookEnd);

// ---------- show the controls only while actually playing ----------
const TOUCH_BLOCK=['deathPanel','newsPanel','menu','chestUI','pause','results','lobbyPanel','jOpt','optPanel','packPanel','dressPanel','lbPanel','loading','lceCraft','craftUI','worldPanel','mpPanel','srvDlg','discPanel','endCredits'];   // any screen on top hides the controls (so its buttons can be tapped)
const ICON_FOR={tInv:['inv','list'],tDrop:['drop','list']};
let touchLast='';
function tickTouch(){const on=touchActive&&player&&(MATCH.state==='play'||MATCH.state==='lobby'||MATCH.state==='over')&&!TOUCH_BLOCK.some(id=>{const el=$(id);return el&&!el.classList.contains('hidden');})&&!(typeof chatUI!=='undefined'&&chatUI);
  TUI.classList.toggle('hidden',!on);if(!on)return;
  const alive=player.alive,lobby=MATCH.state==='lobby';
  for(const [id,v] of [['tAttack',!lobby],['tUse',alive&&!lobby],['tSneak',alive],['tSprint',alive&&!lobby],['tJump',true],['tInv',!lobby||!alive],['tDrop',alive&&!lobby||!alive],['tReady',lobby],['tList',lobby&&online],['tChat',!!online]])$(id).classList.toggle('hidden',!v);
  // while flying the column turns into up/down; while dead the small buttons switch the spectator camera
  const key=(player.flying?'f':'w')+(alive?'a':'d');if(key!==touchLast){touchLast=key;
    $('tInv').querySelector('i').style.backgroundImage=iconURL(TICONS[alive?'inv':'sprint']);$('tDrop').querySelector('i').style.backgroundImage=iconURL(TICONS[alive?'drop':'use']);}
  $('tSneak').classList.toggle('lit',touchIn.sneak&&!player.flying);DP.children[4].classList.toggle('lit',touchIn.sneak&&!player.flying);$('tSprint').classList.toggle('lit',!!touchIn.sprintNow);}
addEventListener('resize',applyTouchSetting);applyTouchSetting();
