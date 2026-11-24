// ================= Battle creator: Mini Games > Battle / Battle Royale (and Host Server on the Battle Servers screen) =================
// A console-style create screen: tick boxes on the left, a description of whatever is selected on the right, then Create Casual or
// Create Competitive. Online, the game is a Photon server (15h_servers.js); unticking Online Game plays offline with bots.
const BC={join:false,jround:0,mode:'battle',online:false,pub:true,invite:false,sel:0,ret:'mini',rep:0,snapT:-9,status:'',err:false,busy:false,cfg:null};
const bcOpen=()=>{const p=$('bcPanel');return !!p&&!p.classList.contains('hidden');};
const isShown=id=>{const p=$(id);return !!p&&!p.classList.contains('hidden');};
const bcAny=()=>isShown('bcPanel')||isShown('bmPanel')||isShown('bmSearch');   // any of the Battle mini game screens on the title screen
const BC_JROUND=['Any','Short','Normal','Long'];
const BC_ROUND={battle:[['Short',300],['Normal',600],['Long',900]],br:[['Short',.2],['Normal',.4],['Long',1]]};
function bcRoundIdx(){const L=BC_ROUND[BC.mode],v=BC.mode==='br'?SET.brLen:SET.roundLen;let b=0;for(let i=1;i<L.length;i++)if(Math.abs(L[i][1]-v)<Math.abs(L[b][1]-v))b=i;return b;}
// the Round Length a hosted game is listed with, for Join's matching: short / normal / long
function bcRlKey(mode){const L=BC_ROUND[mode==='br'?'br':'battle'],v=mode==='br'?SET.brLen:SET.roundLen;let b=0;for(let i=1;i<L.length;i++)if(Math.abs(L[i][1]-v)<Math.abs(L[b][1]-v))b=i;return ['short','normal','long'][b];}
function bcSaveSet(){store('bb_set',JSON.stringify(SET));writeOptions();}
const BC_DESC={
  mode:'Switch between Battle, rounds on the arena maps, and Battle Royale, one big island with a closing border.',
  central:'When ticked, everyone starts the round around the middle of the arena instead of spread out around it.',
  centralBR:'Battle Royale always spreads everyone out, so this only changes Battle.',
  online:'When ticked, your game is a server that other players join with its address. Untick it to play offline against bots.',
  pub:'When ticked, your server is listed in Battle servers online now, so anyone can find and join it. Untick it and only people you give the address to can join.',
  fof:'Photon servers have no friends lists, so this isn\'t available. Use Invite Only to choose exactly who can join.',
  invite:'When ticked, only the players you name in Server Settings can join. You and your operators always can.',
  maps:'Pick the maps the game goes through, one after another.',
  mapsBR:'Battle Royale is always played on its own island.',
  server:'The server address, region, message of the day, player limit and invite list.',
  round:'How long each round lasts.',
  casual:'Create a Casual game: everyone keeps their own skin, and spectators fly around as bats.',
  comp:'Create a Competitive game: skins that could give an advantage, such as see-through ones, are swapped for plain ones, and spectators are invisible to the players still fighting.',
  modeJ:'Switch between looking for Battle games and Battle Royale games.',
  jround:'Only look for games whose rounds are this long. Any matches every game.',
  jcasual:'Join any Casual game with the Round Length you picked: everyone keeps their own skin, and spectators are bats.',
  jcomp:'Join any Competitive game with the Round Length you picked: no skins that give an advantage, and spectators are invisible.',
  tumble:'Tumble: knock everyone through three layers of blocks into the lava. The last player standing wins the round.',
  glide:'Glide: fly an elytra round the course. Fly through rings for points, through the golden checkpoints to finish each lap.',
  ttool:'Snowballs break the block they hit, push players and set off TNT. Shovels break blocks right away but only up close. Both gives everyone one of each.',
  trounds:'How many rounds make a game. Each round has new layers; the most round wins takes the game.',
  gcourse:'The course to fly. Your best Time Attack time on each course is kept.',
  glaps:'How many laps of the course the race is.',
  gscore:'Create a Score Attack race: points for every ring and checkpoint, and a bonus for finishing first, second or third. The most points wins.',
  gtime:'Create a Time Attack race: no points, just the clock. The fastest time wins, and your best time on the course is kept.',
  jtool:'Only look for Tumble games with these tools. Any matches every game.',
  jcourse:'Only look for Glide races on this course. Any matches every course.',
  jtcasual:'Join any Casual Tumble game with the tools you picked.',jtcomp:'Join any Competitive Tumble game with the tools you picked: no skins that give an advantage, and spectators are invisible.',
  jgscore:'Join any Score Attack race on the course you picked.',jgtime:'Join any Time Attack race on the course you picked.'};
const BC_GCOURSES=()=>GLIDE_COURSES.map(c=>c.name);
function bcRows(){const br=BC.mode==='br',on=BC.online;
  const net4=[{k:'online',t:'chk',label:'Online Game',v:()=>on,fn:()=>{BC.online=!BC.online;if(BC.online&&!store('mcr_appid'))dlgPhoton(true);}},
    {k:'pub',t:'chk',label:'Public Game',v:()=>on&&BC.pub&&!BC.invite,off:!on||BC.invite,fn:()=>{BC.pub=!BC.pub;}},
    {k:'fof',t:'chk',label:'Allow friends of friends',v:()=>false,off:true},
    {k:'invite',t:'chk',label:'Invite Only',v:()=>on&&BC.invite,off:!on,fn:()=>{BC.invite=!BC.invite;if(BC.invite&&!(bcCfg().white||[]).length)bcServerDlg();}}];
  const pickSlider=(k,label,labels,idx,set)=>({k,t:'slider',labels,idx,set,lab:label});
  if(BC.mode==='tumble'){if(BC.join)return [{k:'mode',t:'head',desc:'tumble'},pickSlider('jtool','Tools',['Any'].concat(T_TOOLS.map(t=>t[1])),()=>BC.jtool||0,i=>{BC.jtool=i;}),
      {k:'jcasual',t:'btn',label:'Join Casual',desc:'jtcasual',fn:()=>bmSearch(false)},{k:'jcomp',t:'btn',label:'Join Competitive',desc:'jtcomp',fn:()=>bmSearch(true)}];
    return [{k:'mode',t:'head',desc:'tumble'},...net4,{k:'server',t:'btn',label:'Server Settings',off:!on,fn:bcServerDlg},
      pickSlider('ttool','Tools',T_TOOLS.map(t=>t[1]),()=>Math.max(0,T_TOOLS.findIndex(t=>t[0]===SET.tTool)),i=>{SET.tTool=T_TOOLS[i][0];}),
      pickSlider('trounds','Rounds',T_ROUNDS.map(String),()=>Math.max(0,T_ROUNDS.indexOf(+SET.tRounds)),i=>{SET.tRounds=T_ROUNDS[i];}),
      {k:'casual',t:'btn',label:'Create Casual',fn:()=>bcCreate(false)},{k:'comp',t:'btn',label:'Create Competitive',fn:()=>bcCreate(true)}];}
  if(BC.mode==='glide'){if(BC.join)return [{k:'mode',t:'head',desc:'glide'},pickSlider('jcourse','Course',['Any'].concat(BC_GCOURSES()),()=>BC.jcourse||0,i=>{BC.jcourse=i;}),
      {k:'jcasual',t:'btn',label:'Join Score Attack',desc:'jgscore',fn:()=>bmSearch('score')},{k:'jcomp',t:'btn',label:'Join Time Attack',desc:'jgtime',fn:()=>bmSearch('time')}];
    return [{k:'mode',t:'head',desc:'glide'},...net4,{k:'server',t:'btn',label:'Server Settings',off:!on,fn:bcServerDlg},
      pickSlider('gcourse','Course',BC_GCOURSES(),()=>Math.max(0,GLIDE_COURSES.findIndex(c=>c.id===SET.gCourse)),i=>{SET.gCourse=GLIDE_COURSES[i].id;}),
      pickSlider('glaps','Laps',['1','2','3'],()=>clamp((+SET.gLaps||3)-1,0,2),i=>{SET.gLaps=i+1;}),
      {k:'casual',t:'btn',label:'Create Score Attack',desc:'gscore',fn:()=>bcCreate(false,'score')},{k:'comp',t:'btn',label:'Create Time Attack',desc:'gtime',fn:()=>bcCreate(false,'time')}];}
  if(BC.join)return [{k:'mode',t:'head',desc:'modeJ'},{k:'jround',t:'slider',labels:BC_JROUND,idx:()=>BC.jround,set:i=>{BC.jround=i;store('mcr_jround',String(i));}},
    {k:'jcasual',t:'btn',label:'Join Casual',fn:()=>bmSearch(false)},{k:'jcomp',t:'btn',label:'Join Competitive',fn:()=>bmSearch(true)}];
  return [{k:'mode',t:'head'},
    {k:'central',t:'chk',label:'Central Spawn',v:()=>SET.central&&!br,off:br,desc:br?'centralBR':'central',fn:()=>{SET.central=!SET.central;bcSaveSet();}},
    {k:'online',t:'chk',label:'Online Game',v:()=>on,fn:()=>{BC.online=!BC.online;if(BC.online&&!store('mcr_appid'))dlgPhoton(true);}},
    {k:'pub',t:'chk',label:'Public Game',v:()=>on&&BC.pub&&!BC.invite,off:!on||BC.invite,fn:()=>{BC.pub=!BC.pub;}},
    {k:'fof',t:'chk',label:'Allow friends of friends',v:()=>false,off:true},
    {k:'invite',t:'chk',label:'Invite Only',v:()=>on&&BC.invite,off:!on,fn:()=>{BC.invite=!BC.invite;if(BC.invite&&!(bcCfg().white||[]).length)bcServerDlg();}},
    {k:'maps',t:'btn',label:'Select Maps',off:br,desc:br?'mapsBR':'maps',fn:()=>{openOptions('menu','maps');jDirect=true;}},
    {k:'server',t:'btn',label:'Server Settings',off:!on,fn:bcServerDlg},
    {k:'round',t:'slider',labels:BC_ROUND[BC.mode].map(x=>x[0]),idx:bcRoundIdx,set:i=>{const v=BC_ROUND[BC.mode][i][1];if(BC.mode==='br')SET.brLen=v;else SET.roundLen=v;}},
    {k:'casual',t:'btn',label:'Create Casual',fn:()=>bcCreate(false)},
    {k:'comp',t:'btn',label:'Create Competitive',fn:()=>bcCreate(true)}];}
function bcCfg(){if(!BC.cfg)BC.cfg=srvDefaults(true);return BC.cfg;}
// ---- open / close ----
function openBC(mode,ret,join){initAudio();readName();BC.join=!!join;BC.jround=clamp(+store('mcr_jround')||0,0,3);bmHide();BC.mode=['br','tumble','glide'].includes(mode)?mode:'battle';BC.ret=ret||'mini';BC.cfg=srvDefaults(true);BC.pub=BC.cfg.pub!==false;BC.invite=!!BC.cfg.wl;
  BC.online=ret==='mp'||!!store('mcr_appid');BC.status='';BC.err=false;BC.busy=false;
  show('menu');if(!miniOpen)showMini(true);$('menuList').classList.add('hidden');show('bcPanel');$('splash').style.visibility='hidden';bcSnap();
  const rows=bcRows();BC.sel=rows.findIndex(r=>r.k==='casual'||r.k==='jcasual');bcRender();
  setPrompts('prompts',[['A','Select',bcActivate],['B','Back',bcBack]]);}
function bcReset(){hide('bcPanel');$('splash').style.visibility='';$('menuList').classList.remove('hidden');BC.busy=false;}
function bcBack(){sfx('click');bcReset();if(BC.ret==='mp'){hide('menu');openMP('battle');return;}if(BC.ret==='tabs'){bmOpen(BC.join?'join':'create',BC.mode);return;}showMini(true);}
// ---- drawing ----
const bcText=(t,col,sh)=>pxCanvas(t,GS,col,!!sh);
function bcWrap(el,text,col,maxW){el.textContent='';const words=String(text).split(' ');let line='';
  const push=l=>{const c=pxCanvas(l,GS,col,true);c.style.display='block';el.appendChild(c);};
  for(const w of words){const t=line?line+' '+w:w;if(line&&pxCanvas(t,GS,col,true).width>maxW){push(line);line=w;}else line=t;}if(line)push(line);}
function bcCheck(){const S=GS,c=mkCanvas(11*S,11*S),g=c.getContext('2d');const px=(x,y,col)=>{g.fillStyle=col;g.fillRect(x*S,y*S,S,S);};
  const pts=[[1,5],[2,6],[3,7],[4,6],[5,5],[6,4],[7,3],[8,2],[9,1]];   // a tick, two pixels thick with a dark edge, poking out of the top of the box
  for(const [x,y] of pts){px(x,y+2,'#3b3300');px(x+1,y+2,'#3b3300');}for(const [x,y] of pts){px(x,y,'#fff35c');px(x,y+1,'#e0be14');}return c;}
function bcSwords(){const S=GS,c=mkCanvas(22*S,22*S),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(bmIcon(BC.mode,1),2*S,2*S,18*S,18*S);return c;}
function bcRender(){const P=$('bcPanel');if(!P)return;const L=$('bcLeft');L.textContent='';const rows=bcRows();
  if(BC.sel<0||BC.sel>=rows.length||rows[BC.sel].off)BC.sel=rows.findIndex(r=>r.k==='casual'||r.k==='jcasual');
  rows.forEach((r,i)=>{let el;const selC=i===BC.sel;
    if(r.t==='head'){el=document.createElement('div');el.className='bcHead';const f=document.createElement('div');f.className='bcIcon';f.appendChild(bcSwords());
      const lab=document.createElement('div');lab.className='bcHeadT';lab.appendChild(bcText(MG_NAMES[BC.mode]||'Battle',selC?'#ffff55':'#404040',selC));el.append(f,lab);}
    else if(r.t==='chk'){el=document.createElement('div');el.className='bcRow'+(r.off?' off':'');const box=document.createElement('span');box.className='bcBox';if(r.v())box.appendChild(bcCheck());
      el.append(box,bcText(r.label,r.off?'#a0a0a0':selC?'#ffff55':'#404040',selC&&!r.off));}
    else if(r.t==='btn'){el=document.createElement('button');el.className='jb bcBtn'+(r.off?' off':'')+(selC?' sel':'');el._label=r.label;jLabel(el);}
    else if(r.t==='slider'){const n=r.labels.length;el=jSlider(()=>(r.lab||'Round Length')+': '+r.labels[r.idx()],()=>r.idx()/(n-1),v=>r.set(Math.round(v*(n-1))),n-1,()=>{bcSaveSet();});
      el.classList.add('bcBtn');if(selC)el.classList.add('sel');}
    el.dataset.i=i;el.setAttribute('role',r.t==='chk'?'checkbox':'button');if(r.t==='chk')el.setAttribute('aria-checked',String(!!r.v()));if(r.off)el.setAttribute('aria-disabled','true');
    el.addEventListener('mouseenter',()=>{if(BC.sel!==i&&!r.off){BC.sel=i;bcRender();}});
    if(r.t!=='slider')el.addEventListener('click',e=>{e.stopPropagation();if(r.off)return;BC.sel=i;bcActivate();});else el.addEventListener('pointerdown',()=>{BC.sel=i;});
    L.appendChild(el);});
  const st=document.createElement('div');st.className='bcStatus';if(BC.status)bcWrap(st,BC.status,BC.err?'#ff6060':'#404040',200*GS);L.appendChild(st);
  const r=rows[BC.sel]||rows[0];bcWrap($('bcDesc'),BC_DESC[r.desc||r.k]||'',  '#ffffff',122*GS);}
// ---- the picture under the description (battle_art.jpg next to index.html) ----
const BC_ART=new Image();BC_ART.onload=()=>bcSnap();BC_ART.src='battle_art.jpg';
function bcSnap(){const c=$('bcImg');if(!c)return;const g=c.getContext('2d');g.imageSmoothingEnabled=true;
  if(BC_ART.complete&&BC_ART.naturalWidth){g.drawImage(BC_ART,0,0,c.width,c.height);}else{g.fillStyle='#2a3a4a';g.fillRect(0,0,c.width,c.height);}}
// the menu rescales with the window: redraw the creator at the new size and keep its button prompts
{const rl=refreshLCE;refreshLCE=function(){const r=rl.apply(this,arguments);if(bcOpen()){bcRender();setPrompts('prompts',[['A','Select',bcActivate],['B','Back',bcBack]]);}if(isShown('bmPanel'))bmRender();if(isShown('bmSearch'))bmSearchShow();return r;};}
// ---- input ----
function bcMove(d){const rows=bcRows();let i=BC.sel;for(let n=0;n<rows.length;n++){i=(i+d+rows.length)%rows.length;if(!rows[i].off)break;}if(i!==BC.sel){BC.sel=i;sfx('click');bcRender();}}
function bcActivate(){const r=bcRows()[BC.sel];if(!r||r.off||BC.busy)return;if(r.t==='head'){if(BC.mode!=='battle'&&BC.mode!=='br')return;sfx('click');BC.mode=BC.mode==='br'?'battle':'br';bcRender();return;}
  if(r.t==='slider')return;sfx('click');r.fn&&r.fn();if(bcOpen())bcRender();}
function bcSide(d){const r=bcRows()[BC.sel];if(!r)return;if(r.t==='head'){bcActivate();return;}if(r.t!=='slider')return;const i=clamp(r.idx()+d,0,r.labels.length-1);if(i===r.idx())return;
  r.set(i);bcSaveSet();sfx('click');bcRender();}
const bcFree=()=>bcOpen()&&$('srvDlg').classList.contains('hidden')&&$('jOpt').classList.contains('hidden')&&$('dressPanel').classList.contains('hidden');
document.addEventListener('keydown',e=>{if(bmKey(e))return;if(!bcFree()||(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)))return;const c=e.code;
  if(c==='ArrowDown'||c==='KeyS'){bcMove(1);e.preventDefault();}else if(c==='ArrowUp'||c==='KeyW'){bcMove(-1);e.preventDefault();}
  else if(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD'){bcSide(c==='ArrowLeft'||c==='KeyA'?-1:1);e.preventDefault();}
  else if(c==='Enter'||c==='Space'){bcActivate();e.preventDefault();}else if(c==='Escape'||c==='Backspace'){bcBack();e.preventDefault();}
  e.stopImmediatePropagation();},true);
function bcPad(E,nav,navX,dt){if(bmPad(E,nav,navX,dt))return;if(!bcFree())return;BC.rep-=dt;if((nav||navX)&&BC.rep<=0){if(nav)bcMove(nav);else bcSide(navX);BC.rep=.22;}if(!nav&&!navX)BC.rep=0;if(E('a'))bcActivate();if(E('b'))bcBack();}
// ---- Server Settings (address, region, MOTD, players, invite list) ----
function bcServerDlg(){const cur=bcCfg();
  dlgShow(`<h3>Server Settings</h3><div class="form">
    <label for="bs_room">Server Address</label><input id="bs_room" type="text" maxlength="40" spellcheck="false" autocomplete="off">
    <label for="bs_reg">Region</label><select id="bs_reg">${PHOTON_REGIONS.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join('')}</select>
    <label for="bs_motd">MOTD</label><input id="bs_motd" type="text" maxlength="80" autocomplete="off">
    <label for="bs_max">Max Players</label><select id="bs_max">${[2,3,4,5,6,8,10,12,16,20].map(n=>`<option value="${n}">${n}</option>`).join('')}</select>
    <label for="bs_inv">Invited Players</label><input id="bs_inv" type="text" maxlength="400" spellcheck="false" autocomplete="off" placeholder="names, separated by commas"></div>
    <div class="note">Players join with this address: <span class="addr" id="bs_addr"></span>. Invited players only matter when Invite Only is ticked.</div>
    <div class="row"><button class="btn small" data-ok id="bs_ok">Done</button><button class="btn small" data-cancel id="bs_cancel">Cancel</button></div>`,b=>{
    const q=s=>b.querySelector(s);q('#bs_room').value=cur.room;q('#bs_reg').value=cur.region||'us';q('#bs_motd').value=cur.motd;q('#bs_max').value=String(cur.max);q('#bs_inv').value=(cur.white||[]).join(', ');
    const upd=()=>{const a=parseAddr(q('#bs_room').value+':'+q('#bs_reg').value);q('#bs_addr').textContent=a?a.full:'(type an address)';q('#bs_ok').disabled=!a;};
    upd();q('#bs_room').addEventListener('input',upd);q('#bs_reg').addEventListener('change',upd);
    q('#bs_cancel').addEventListener('click',()=>{sfx('click');dlgClose();bcRender();});
    q('#bs_ok').addEventListener('click',()=>{const a=parseAddr(q('#bs_room').value+':'+q('#bs_reg').value);if(!a)return;sfx('click');
      Object.assign(cur,{room:a.room,region:a.region,full:a.full,motd:q('#bs_motd').value.trim().slice(0,80)||'A Battle Server',max:+q('#bs_max').value,
        white:[...new Set(q('#bs_inv').value.split(/[,\s]+/).map(s=>s.trim().toLowerCase()).filter(Boolean))].slice(0,50)});dlgClose();bcRender();});});}
// ---- Create Casual / Create Competitive ----
function bcCreate(comp,gmode){if(BC.busy)return;SET.mode=BC.mode;SET.comp=!!comp;if(gmode)SET.gMode=gmode;bcSaveSet();
  if(!BC.online){bcReset();try{srvBrowseStop();}catch(e){}showMini(false);startBattleSolo();return;}
  if(!store('mcr_appid')){BC.status='Set your Photon App ID first, then press Create again.';BC.err=true;bcRender();dlgPhoton(true);return;}
  const c=bcCfg(),a=parseAddr(c.room+':'+(c.region||'us'));if(!a){BC.status='Pick a server address in Server Settings.';BC.err=true;bcRender();return;}
  const cfg=Object.assign({},c,{room:a.room,region:a.region,full:a.full,pub:BC.pub&&!BC.invite,wl:BC.invite,white:c.white||[],bans:c.bans||{},ops:c.ops||[]});
  BC.busy=true;BC.status='Starting the server '+a.full+'...';BC.err=false;bcRender();try{srvBrowseStop();}catch(e){}
  srvStart(cfg,'battle',BC.mode,null,msg=>{BC.busy=false;BC.status=msg;BC.err=true;if(bcOpen())bcRender();});}
// the server started (or the game left the menu some other way): the creator closes
{const tm=toMenu;toMenu=function(){bcReset();bmHide();return tm.apply(this,arguments);};}
setInterval(()=>{if(bcAny()&&MATCH.state!=='menu'){bcReset();bmHide();}},250);
// ---- Competitive rules ----
// skins with see-through parts on the body (they make a player harder to see) are swapped for a plain one
const FAIR={};
function skinFair(key){if(FAIR[key]!=null)return FAIR[key];if(key.startsWith('gen:'))return FAIR[key]=true;const T=skinTex(key);if(!T||!T.img||key.startsWith('?'))return true;
  try{const I=T.img,s=I.width/64,c=mkCanvas(I.width,I.height),g=c.getContext('2d');g.drawImage(I,0,0);const d=g.getImageData(0,0,I.width,I.height).data;
    const boxes=[[0,8,32,8],[0,20,56,12]].concat(I.height>=I.width?[[16,52,32,12]]:[]);let holes=0;
    for(const [x0,y0,w,h] of boxes)for(let y=y0*s;y<(y0+h)*s;y++)for(let x=x0*s;x<(x0+w)*s;x++)if(d[(y*I.width+x)*4+3]<128)holes++;
    return FAIR[key]=holes<=4*s*s;}catch(e){return FAIR[key]=true;}}
function fairSkin(e){if(!SET.comp||MATCH.state==='menu'||!e||e.kind!=='player'||skinFair(e.skin||''))return e.skin;return 'gen:'+e.name;}
// spectators are invisible (and silent) to the players still fighting
const compHidesBats=()=>SET.comp&&MATCH.state==='play'&&player&&player.alive;

// ================= Create / Join / Friends: the screen before the create options =================
// Create: pick Battle or Battle Royale, then the create options above.  Join: pick a Round Length, then Join Casual or Join Competitive
// finds a matching public game in your Photon region (spectating if a round is under way).  Friends: public games hosted by, or
// with, players you have played with before. Photon has no friends lists, so this game remembers who you have played with.
const BM={tab:'create',sel:0,browse:null,rooms:null,err:null,rep:0,search:null};
const BM_TABS=[['create','Create'],['join','Join'],['friends','Friends']];
function bmOpen(tab,mode){initAudio();readName();bcReset();show('menu');if(!miniOpen)showMini(true);$('menuList').classList.add('hidden');$('splash').style.visibility='hidden';
  show('bmPanel');BM.tab=tab||'create';BM.sel=Math.max(0,['battle','br','tumble','glide'].indexOf(mode));bmTabChanged();}
function bmHide(){hide('bmPanel');hide('bmSearch');bmBrowseStop();if(BM.search){clearTimeout(BM.search.to);BM.search=null;}}
function bmBack(){sfx('click');bmHide();$('splash').style.visibility='';$('menuList').classList.remove('hidden');showMini(true);}
function bmBrowseStop(){if(BM.browse){BM.browse.close();BM.browse=null;}}
function bmTabChanged(){bmBrowseStop();BM.rooms=null;BM.err=null;
  if(BM.tab==='friends'){BM.sel=0;const app=store('mcr_appid');if(app)BM.browse=photonBrowse(app,homeRegion(),(list,rtt,err)=>{if(err){BM.err=err;}else{BM.rooms=list;BM.err=null;}if(isShown('bmPanel'))bmRender();});}
  bmRender();setPrompts('prompts',[['A','Select',bmActivate],['B','Back',bmBack],['LB','Tab',()=>bmTab(-1)],['RB','Tab',()=>bmTab(1)]]);}
function bmTab(d){const i=BM_TABS.findIndex(t=>t[0]===BM.tab);BM.tab=BM_TABS[(i+d+3)%3][0];sfx('click');bmTabChanged();}
// players you've been in a game with, most recent first (names, lower case)
function recentPlayers(){try{return JSON.parse(store('mcr_recent')||'[]');}catch(e){return [];}}
setInterval(()=>{if(!online||!net)return;const me=myName.toLowerCase();const now=net.list().map(m=>String(m.name).toLowerCase()).filter(n=>n&&n!==me);if(!now.length)return;
  const r=recentPlayers();const next=[...new Set(now.concat(r))].slice(0,100);if(next.join()!==r.join())store('mcr_recent',JSON.stringify(next));},5000);
function bmFriendGames(){if(!BM.rooms)return [];const rec=new Set(recentPlayers());rec.delete(myName.toLowerCase());
  return BM.rooms.filter(r=>r.p&&r.p.m==='battle'&&+r.p.pub&&r.p.v===GAME_VERSION).map(r=>{const pl=String(r.p.pl||'').split('\n').filter(Boolean);const friends=pl.filter(n=>rec.has(n.toLowerCase()));
    return {r,friends};}).filter(x=>x.friends.length).sort((a,b)=>b.friends.length-a.friends.length);}
function bmRows(){if(BM.tab==='friends')return bmFriendGames().map(x=>({friend:x}));return [{mode:'battle'},{mode:'br'},{mode:'tumble'},{mode:'glide'}];}
// each game's icon: crossed swords (Battle), a bow (Battle Royale), a shovel crossed with a snowball (Tumble), a pair of elytra wings (Glide)
const bmIcon=(mode,sc)=>{const S=sc||GS,c=mkCanvas(16*S,16*S),g=c.getContext('2d');g.imageSmoothingEnabled=false;const D=(ic,flip,x=0,y=0,w=16)=>{if(!ic)return;g.save();if(flip){g.translate(16*S,0);g.scale(-1,1);}g.drawImage(ic,x*S,y*S,w*S,w*S);g.restore();};
  if(mode==='glide')D(glideIcon());else if(mode==='tumble'){D(ICONS.diamond_shovel);D(ICONS.snowball,false,7,7,9);}else if(mode==='br')D(ICONS.bow);else{D(ICONS.diamond_sword);D(ICONS.diamond_sword,true);}return c;};
function bmRender(){const T=$('bmTabs');T.textContent='';
  for(const [k,label] of BM_TABS){const b=document.createElement('button');b.className='bmTab'+(k===BM.tab?' on':'');b.appendChild(pxCanvas(label,GS,k===BM.tab?'#404040':'#606060',false));b.setAttribute('aria-pressed',String(k===BM.tab));
    b.addEventListener('click',()=>{if(BM.tab!==k){BM.tab=k;sfx('click');bmTabChanged();}});T.appendChild(b);}
  const L=$('bmList');L.textContent='';const rows=bmRows();if(BM.sel>=rows.length)BM.sel=Math.max(0,rows.length-1);
  rows.forEach((row,i)=>{const el=document.createElement('button');el.className='bmRow'+(i===BM.sel?' sel':'');const selC=i===BM.sel;
    if(row.friend){const {r,friends}=row.friend,p=r.p;el.appendChild(bmIcon(p.bm));const t=document.createElement('span');t.className='bmTxt';
      t.appendChild(pxCanvas(friends.slice(0,2).join(', ')+(friends.length>2?' +'+(friends.length-2):''),GS,selC?'#ffff55':'#e0e0e0',true));
      const sub=pxCanvas(battleTag(p).trim()+'  '+r.n+'/'+r.max,GS,selC?'#ffffa0':'#c0c0c0',true);sub.className='bmSub';t.appendChild(sub);el.appendChild(t);}
    else{el.append(bmIcon(row.mode),pxCanvas(MG_NAMES[row.mode]||'Battle',GS,selC?'#ffff55':'#e0e0e0',true));}
    el.addEventListener('mouseenter',()=>{if(BM.sel!==i){BM.sel=i;bmRender();}});el.addEventListener('click',()=>{BM.sel=i;bmActivate();});L.appendChild(el);});
  const N=$('bmNote');N.textContent='';let note='';
  if(BM.tab==='friends'){if(!store('mcr_appid'))note='Set your Photon App ID (Play Online, then Photon Settings) to see games your friends are playing.';
    else if(BM.err)note=BM.err;else if(!BM.rooms)note='Looking for your friends\' games...';
    else if(!rows.length)note=recentPlayers().length?'None of the players you have played with are in a public Battle game right now.':'Players you play online with show up here when they are in a public Battle game.';}
  if(note)bcWrap(N,note,'#404040',196*GS);}
function bmActivate(){const row=bmRows()[BM.sel];if(!row)return;sfx('click');
  if(row.friend){const r=row.friend.r;bmHide();$('splash').style.visibility='';$('menuList').classList.remove('hidden');const reg=homeRegion();srvJoin(r.name+(reg!=='us'?':'+reg:''),r.name);return;}
  if(BM.tab==='join')openBC(row.mode,'tabs',true);else openBC(row.mode,'tabs');}
function bmOpenMode(m){bmOpen('create',m);BM.sel=Math.max(0,['battle','br','tumble','glide'].indexOf(m));bmRender();}
// ---- Join Casual / Join Competitive: find a matching public game ----
function bmSearchShow(){const t=$('bmSearchT');t.textContent='';t.appendChild(pxCanvas('Searching for games',GS,'#ffffff',true));setPrompts('prompts',[['B','Cancel',bmSearchCancel]]);}
function bmSearchCancel(){sfx('click');if(BM.search){clearTimeout(BM.search.to);BM.search=null;}bmBrowseStop();hide('bmSearch');openBC(BC.mode,'tabs',true);}
function bmSearch(comp){const app=store('mcr_appid');if(!app){BC.status='Set your Photon App ID first, then try again.';BC.err=true;bcRender();dlgPhoton(true);return;}
  const mode=BC.mode,want=BC.jround?BC_JROUND[BC.jround].toLowerCase():null,reg=homeRegion();bcReset();$('menuList').classList.add('hidden');$('splash').style.visibility='hidden';show('bmSearch');bmSearchShow();
  bmBrowseStop();const S={to:null,found:false};BM.search=S;
  const fail=msg=>{if(BM.search!==S)return;BM.search=null;bmBrowseStop();hide('bmSearch');openBC(mode,'tabs',true);BC.status=msg;BC.err=true;bcRender();};
  S.to=setTimeout(()=>fail('Photon did not answer. Check your internet connection and the App ID.'),15000);
  // give the lobby a moment so the whole list is in, then pick: games in the lobby first (you play from the start), then the busiest
  let first=0;BM.browse=photonBrowse(app,reg,(list,rtt,err)=>{if(BM.search!==S||S.found)return;if(err){clearTimeout(S.to);fail(err);return;}if(!first){first=perfT;return;}if(perfT-first<1.2)return;
    const jt=BC.jtool?T_TOOLS[BC.jtool-1]:null,jc=BC.jcourse?GLIDE_COURSES[BC.jcourse-1]:null;
    const ok=list.filter(r=>{const p=r.p||{};if(!(p.m==='battle'&&+p.pub&&r.open!==false&&r.n<r.max&&p.v===GAME_VERSION&&(p.bm||'battle')===mode))return false;
      if(mode==='glide')return (p.gm||'score')===comp&&(!jc||p.gc===jc.id);if(!!+p.cp!==!!comp)return false;if(mode==='tumble')return !jt||p.tt===jt[0];return !want||(p.rl||'normal')===want;});
    const kind=mode==='glide'?(comp==='time'?'Time Attack':'Score Attack')+' races'+(jc?' on '+jc.name:''):(comp?'Competitive':'Casual')+' '+MG_NAMES[mode]+' games'+(mode==='tumble'&&jt?' with '+jt[1].toLowerCase():mode!=='tumble'&&want?' with '+BC_JROUND[BC.jround]+' rounds':'');
    clearTimeout(S.to);if(!ok.length){fail('No '+kind+' found. Try other options, or Create a game.');return;}
    ok.sort((a,b)=>((a.p.st==='lobby')-(b.p.st==='lobby'))*-10+(b.n-a.n));const r=ok[0];S.found=true;BM.search=null;bmBrowseStop();hide('bmSearch');
    $('splash').style.visibility='';$('menuList').classList.remove('hidden');srvJoin(r.name+(reg!=='us'?':'+reg:''),r.name);});
  setTimeout(()=>{if(BM.search===S&&BM.browse&&!first)first=perfT;},2500);}
// ---- keys and controller for the tabs and the search screen ----
function bmMove(d){const n=bmRows().length;if(!n)return;BM.sel=(BM.sel+d+n)%n;sfx('click');bmRender();}
const bmFree=()=>$('srvDlg').classList.contains('hidden')&&$('jOpt').classList.contains('hidden')&&$('dressPanel').classList.contains('hidden');
function bmKey(e){if(!bmFree()||(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)))return false;const c=e.code;
  if(isShown('bmSearch')){if(c==='Escape'||c==='Backspace')bmSearchCancel();e.preventDefault();e.stopImmediatePropagation();return true;}
  if(!isShown('bmPanel'))return false;
  if(c==='ArrowDown'||c==='KeyS')bmMove(1);else if(c==='ArrowUp'||c==='KeyW')bmMove(-1);
  else if(c==='ArrowLeft'||c==='KeyA'||c==='KeyQ')bmTab(-1);else if(c==='ArrowRight'||c==='KeyD'||c==='KeyE'||c==='Tab')bmTab(1);
  else if(c==='Enter'||c==='Space')bmActivate();else if(c==='Escape'||c==='Backspace')bmBack();else return false;
  e.preventDefault();e.stopImmediatePropagation();return true;}
function bmPad(E,nav,navX,dt){if(!bmFree())return false;if(isShown('bmSearch')){if(E('b'))bmSearchCancel();return true;}if(!isShown('bmPanel'))return false;
  BM.rep-=dt;if(nav&&BM.rep<=0){bmMove(nav);BM.rep=.22;}if(!nav)BM.rep=0;if(E('lb'))bmTab(-1);if(E('rb'))bmTab(1);if(E('a'))bmActivate();if(E('b'))bmBack();return true;}
