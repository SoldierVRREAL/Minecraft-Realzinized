// ================= Chat commands (T or / to open chat) =================
// Like a Minecraft server, every command runs on the host. In single player all commands work (like a world with cheats on);
// online, the host is always an operator and can /op other players; everyone can use /help /list /msg /me.
function runCommand(m){if(!online||!net||isHost())serverCmd({id:null,ent:player,name:myName,local:true},m);else netSend(N.CMD,{c:m},'host');}
const GM_NAMES={survival:'survival',s:'survival','0':'survival',creative:'creative',c:'creative','1':'creative'};
const gmLabel=g=>g==='creative'?'Creative Mode':'Survival Mode';
function serverCmd(S,text){const a=text.replace(/^\//,'').trim().split(/\s+/);const c=(a[0]||'').toLowerCase();const C=SRV.cfg;
  const reply=(t,col='#aaaaaa')=>{if(S.local)chatMsg(t,col,false);else netSend(N.CHAT,{t,c:col},S.id);};
  const all=(t,col='#aaaaaa')=>{chatMsg(t,col,false);if(net)netSend(N.CHAT,{t,c:col});};
  const isOp=()=>!online||(S.local&&isHost())||!!(C&&(C.ops||[]).includes(String(S.name).toLowerCase()));
  const needOp=()=>{if(isOp())return true;reply('You do not have permission to use this command. Ask the host to /op you.','#ff5555');return false;};
  const players=()=>ents.filter(e=>e.kind==='player');
  const find=n=>{if(!n)return null;if(n==='@s')return S.ent;if(n==='@p'){let b=null,bd=1e9;for(const e of players()){if(e===S.ent)continue;const d=S.ent?dist(e.pos,S.ent.pos):0;if(d<bd){bd=d;b=e;}}return b;}
    const lo=n.toLowerCase();return players().find(e=>e.name.toLowerCase()===lo)||players().find(e=>e.name.toLowerCase().startsWith(lo))||null;};
  const netId=e=>+String(e.id).slice(1);const isMe=e=>e===player;
  const usage=u=>reply('Usage: '+u,'#ff5555');const notFound=n=>reply('No player was found'+(n?' called '+n:''),'#ff5555');
  const cfgSave=()=>{if(SRV.hosting)srvCfgChanged();};const online1=()=>{if(SRV.hosting&&C)return true;reply('That command only works on a server you are hosting.','#ff5555');return false;};
  const setGM=(e,g)=>{if(isMe(e))setGameMode(g,true);else{netSend(N.SETGM,{gm:g},netId(e));const d=SRV.players[e.name.toLowerCase()];if(d)d.gm=g;}e.gm=g;};
  const tpTo=(e,p)=>{if(isMe(e)){player.pos=p.slice();player.mot=[0,0,0];player.vel=[0,0,0];player.fallDist=0;GZ.tp=perfT;}else netSend(N.TPTO,{p},netId(e));};
  switch(c){
  case 'help':case '?':reply('Commands: /list, /msg <player> <message>, /me <action>'+(isOp()?', /gamemode <mode> [player], /defaultgamemode <mode>, /tp, /time set|add, /say, /seed'+(online?', /kick, /ban, /pardon, /banlist, /op, /deop, /whitelist, /stop':''):''));return;
  case 'list':{const ps=players();reply(`There are ${ps.length} of a max of ${C?C.max:(online?16:1)} players online: ${ps.map(e=>e.name).join(', ')}`);return;}
  case 'msg':case 'tell':case 'w':{const t=find(a[1]);const msg=a.slice(2).join(' ').slice(0,100);if(!a[1]||!msg)return usage('/msg <player> <message>');if(!t)return notFound(a[1]);
    reply(`You whisper to ${t.name}: ${msg}`,'#aaaaaa');if(isMe(t))chatMsg(`${S.name} whispers to you: ${msg}`,'#aaaaaa',false);else netSend(N.CHAT,{t:`${S.name} whispers to you: ${msg}`,c:'#aaaaaa'},netId(t));return;}
  case 'me':{const msg=a.slice(1).join(' ').slice(0,100);if(!msg)return usage('/me <action>');all(`* ${S.name} ${msg}`,'#ffffff');return;}
  case 'say':{if(!needOp())return;const msg=a.slice(1).join(' ').slice(0,100);if(!msg)return usage('/say <message>');all(`[${S.name}] ${msg}`,'#ff55ff');return;}
  case 'gamemode':case 'gm':{if(!needOp())return;if(MATCH.mode!=='survival')return reply('Game modes only work in Survival worlds.','#ff5555');const g=GM_NAMES[(a[1]||'').toLowerCase()];
    if(!g)return usage('/gamemode <survival|creative> [player]');const t=a[2]?find(a[2]):S.ent;if(!t)return notFound(a[2]);setGM(t,g);
    if(t===S.ent)reply('Set own game mode to '+gmLabel(g));else{reply(`Set ${t.name}'s game mode to ${gmLabel(g)}`);if(isMe(t))chatMsg('Your game mode has been updated to '+gmLabel(g),'#aaaaaa',false);else netSend(N.CHAT,{t:'Your game mode has been updated to '+gmLabel(g),c:'#aaaaaa'},netId(t));}return;}
  case 'defaultgamemode':{if(!needOp()||!online1())return;const g=GM_NAMES[(a[1]||'').toLowerCase()];if(!g)return usage('/defaultgamemode <survival|creative>');C.gm=g;cfgSave();reply('The default game mode is now '+gmLabel(g));return;}
  case 'time':{if(!needOp())return;const sub=(a[1]||'').toLowerCase();const named={day:1000,noon:6000,sunset:12000,night:13000,midnight:18000,sunrise:23000};
    let ticks=null;if(sub==='set')ticks=named[(a[2]||'').toLowerCase()]!=null?named[a[2].toLowerCase()]:(/^\d+$/.test(a[2]||'')?+a[2]:null);
    else if(sub==='add'&&/^\d+$/.test(a[2]||''))ticks=Math.round(worldTime*24000)+ +a[2];else if(sub==='query'){return reply('The time is '+Math.round(worldTime*24000));}
    if(ticks==null)return usage('/time <set|add> <day|noon|night|midnight|ticks>');worldTime=(ticks%24000)/24000;if(net)netSend(N.WTIME,{t:worldTime});reply('Set the time to '+(ticks%24000));return;}
  case 'tp':case 'teleport':{if(!needOp())return;if(MATCH.mode!=='survival')return reply('Teleporting only works in Survival worlds.','#ff5555');
    const g=a.slice(1),co=x=>/^(~(-?\d+(\.\d+)?)?|-?\d+(\.\d+)?)$/.test(x),rel=(base,xs)=>xs.map((x,i)=>x.startsWith('~')?base[i]+(+(x.slice(1)||0)):+x);let who=S.ent,to=null,label='';
    if(g.length===3&&g.every(co)){to=rel(who.pos,g);}
    else if(g.length===4&&g.slice(1).every(co)){who=find(g[0]);if(!who)return notFound(g[0]);to=rel(who.pos,g.slice(1));}
    else if(g.length===1||g.length===2){if(g.length===2){who=find(g[0]);if(!who)return notFound(g[0]);}const t=find(g[g.length-1]);if(!t)return notFound(g[g.length-1]);to=t.pos.slice();label=t.name;}
    if(!to||!who)return usage('/tp <player> | /tp <player> <player> | /tp [player] <x> <y> <z>');tpTo(who,to);reply(`Teleported ${who.name} to `+(label||to.map(v=>v.toFixed(1)).join(', ')));return;}
  case 'seed':{if(!needOp())return;if(MATCH.mode!=='survival')return reply('There is no seed in the Battle mini game.','#ff5555');reply('Seed: ['+WSEED+']');return;}
  case 'kick':{if(!needOp()||!online1())return;const t=find(a[1]);if(!a[1])return usage('/kick <player> [reason]');if(!t)return notFound(a[1]);if(isMe(t))return reply('You can\'t kick the server host. Use /stop to close the server.','#ff5555');
    const r=a.slice(2).join(' ')||'Kicked by an operator';srvKick(netId(t),r);all(`Kicked ${t.name}: ${r}`);return;}
  case 'ban':{if(!needOp()||!online1())return;if(!a[1])return usage('/ban <player> [reason]');const lo=a[1].toLowerCase();if(lo===myName.toLowerCase())return reply('You can\'t ban the server host.','#ff5555');
    const r=a.slice(2).join(' ')||'Banned by an operator';C.bans=C.bans||{};const t=find(a[1]);const nm=t?t.name:a[1];C.bans[nm.toLowerCase()]=r;cfgSave();
    if(t&&!isMe(t))srvKick(netId(t),'You are banned from this server.\nReason: '+r);all(`Banned ${nm}: ${r}`);return;}
  case 'pardon':case 'unban':{if(!needOp()||!online1())return;if(!a[1])return usage('/pardon <player>');const lo=a[1].toLowerCase();if(!C.bans||C.bans[lo]==null)return reply('Nothing changed. The player isn\'t banned','#ff5555');delete C.bans[lo];cfgSave();reply('Unbanned '+a[1]);return;}
  case 'banlist':{if(!needOp()||!online1())return;const l=Object.keys(C.bans||{});reply(l.length?`There are ${l.length} ban(s): ${l.join(', ')}`:'There are no bans');return;}
  case 'op':case 'deop':{if(!needOp()||!online1())return;if(!a[1])return usage('/'+c+' <player>');const t=find(a[1]);const nm=t?t.name:a[1];const lo=nm.toLowerCase();C.ops=C.ops||[];
    if(c==='op'){if(C.ops.includes(lo))return reply('Nothing changed. The player already is an operator','#ff5555');C.ops.push(lo);reply('Made '+nm+' a server operator');}
    else{if(!C.ops.includes(lo))return reply('Nothing changed. The player is not an operator','#ff5555');C.ops=C.ops.filter(x=>x!==lo);reply('Made '+nm+' no longer a server operator');}
    cfgSave();if(t&&!isMe(t))netSend(N.CHAT,{t:c==='op'?'You are now a server operator':'You are no longer a server operator',c:'#aaaaaa'},netId(t));return;}
  case 'whitelist':{if(!needOp()||!online1())return;const sub=(a[1]||'').toLowerCase();C.white=C.white||[];
    if(sub==='on'){C.wl=true;cfgSave();return reply('Whitelist is now turned on');}if(sub==='off'){C.wl=false;cfgSave();return reply('Whitelist is now turned off');}
    if(sub==='list')return reply(C.white.length?`There are ${C.white.length} whitelisted player(s): ${C.white.join(', ')}`:'There are no whitelisted players');
    if((sub==='add'||sub==='remove')&&a[2]){const lo=a[2].toLowerCase();if(sub==='add'){if(!C.white.includes(lo))C.white.push(lo);reply('Added '+a[2]+' to the whitelist');}else{C.white=C.white.filter(x=>x!==lo);reply('Removed '+a[2]+' from the whitelist');}cfgSave();return;}
    return usage('/whitelist <on|off|list|add|remove> [player]');}
  case 'stop':{if(!(S.local&&SRV.hosting))return reply(SRV.hosting||!online?'Only the host can stop the server.':'You can only stop a server you are hosting.','#ff5555');reply('Stopping the server');srvStop('Server closed');return;}
  default:reply('Unknown command. Type /help for a list of commands.','#ff5555');}}
