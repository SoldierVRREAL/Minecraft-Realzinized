// ================= Redstone blocks: every state is its own block id =================
// dust (16 power levels, shape from its connections), redstone torches (standing and on walls), levers, buttons and pressure plates,
// repeaters (4 facings x 4 delays x on/off x locked), comparators, lamps, pistons and their heads (6 facings), dispensers and droppers
// (6 facings), hoppers (5 facings), rails (every shape, powered/detector/activator on and off), daylight sensors.
// The ids from 2.6 (repeater, comparator, rails, lever, redstone torch, dispenser...) are reused for the matching states.
const DIRS4=[[0,0,-1],[1,0,0],[0,0,1],[-1,0,0]];                 // 0:-z 1:+x 2:+z 3:-x
const F6=[[0,-1,0],[0,1,0],[0,0,-1],[0,0,1],[-1,0,0],[1,0,0]];    // down up north south west east
const RS={dust:[],torch:{stand:[],wall:[]},lever:[],button:{stone:[],wood:[]},plate:{},rep:[],comp:[],lamp:[],piston:{n:[],s:[]},head:{n:[],s:[]},
  rail:{},disp:{d:[],r:[]},hopper:[],daylight:[]};
const rotTileG=(()=>{const rc={};return (src,r)=>{r=((r%4)+4)%4;if(!r)return src;const k=src+':'+r;if(rc[k]!=null)return rc[k];const t=TILE_PACK.length;TILE_PACK.push('~rot'+r+'_'+src);NEWT[t]={k:'noise',c:'#808080'};TILE_ROT.push([t,src,r]);return rc[k]=t;};})();
// turn a box (built against the -z wall / pointing -z) by k quarter turns about the vertical axis: -z -> +x -> +z -> -x
function turnBox(b,k){k=((k%4)+4)%4;let [x0,y0,z0,x1,y1,z1]=b;let of=b[7]?b[7].slice():null;
  for(let i=0;i<k;i++){[x0,z0,x1,z1]=[1-z1,x0,1-z0,x1];if(of)of=[-of[2],of[1],of[0]];}
  const o=[Math.min(x0,x1),y0,Math.min(z0,z1),Math.max(x0,x1),y1,Math.max(z0,z1)];if(b[6]!=null||of)o[6]=b[6];if(of)o[7]=of;return o;}
// turn a box built for "up" to face F6 direction f
function faceBox6(b,f){const P=(x,y,z)=>f===1?[x,y,z]:f===0?[x,1-y,z]:f===2?[x,z,1-y]:f===3?[x,z,y]:f===4?[1-y,x,z]:[y,x,z];
  const a=P(b[0],b[1],b[2]),c=P(b[3],b[4],b[5]);const o=[Math.min(a[0],c[0]),Math.min(a[1],c[1]),Math.min(a[2],c[2]),Math.max(a[0],c[0]),Math.max(a[1],c[1]),Math.max(a[2],c[2])];if(b[6]!=null)o[6]=b[6];return o;}
{let id=VB.lastId+1;const T=n=>{const i=TILE_PACK.indexOf(n);if(i>=0)return i;TILE_PACK.push(n);NEWT[TILE_PACK.length-1]={k:'noise',c:'#a02020'};return TILE_PACK.length-1;};
  const mk=(o,reuse)=>{const i=reuse!=null?reuse:id++;const top=o.top!=null?o.top:o.t,side=o.side!=null?o.side:o.t;const D=Object.assign({},o);delete D.t;delete D.bc;def(i,top,side,o.bottom!=null?o.bottom:top,D);BLOCK_COL[i]=o.bc||'#a02020';return i;};
  const base=(i,b)=>{if(i!==b)ROT_BASE[i]=b;};
  const stone=BD[B.STONE].side,planks=BD[B.PLANKS].side,cob=BD[B.COBBLE].side;
  // ---- dust: power 0..15 (the shape comes from rsDustBoxes in 15s) ----
  for(let L=0;L<16;L++){const c=T('~rsd_c'+L),l=T('~rsd_l'+L);const lz=rotTileG(l,1);
    const i=mk({t:c,solid:false,opaque:false,pick:true,dyn:(x,y,z)=>rsDustBoxes(x,y,z,L),shape:[[0,0,0,1,1/64,1]],rs:{k:'dust',lvl:L},dust:[c,l,lz],flatIcon:c,bc:'#a01010',sup:[0,-1,0]},L?null:B.RS_DUST);
    RS.dust.push(i);base(i,B.RS_DUST);}
  // ---- redstone torches: standing, and on the wall at DIRS4[a] ----
  {const on=T('redstone_torch_on'),off=T('redstone_torch_off');
    const torch=(lit,a)=>{const t=lit?on:off;const box=a<0?[7/16,0,7/16,9/16,10/16,9/16]:turnBox([7/16,3/16,0,9/16,13/16,2/16,null,[0,-3/16,7/16]],a);
      return {t,solid:false,opaque:false,pick:true,light:lit?7:0,shape:[box],flatIcon:on,rs:{k:'torch',on:lit,a},sup:a<0?[0,-1,0]:DIRS4[a].slice(),bc:'#c01010'};};
    RS.torch.stand=[mk(torch(0,-1)),mk(torch(1,-1),B.RS_TORCH)];for(let a=0;a<4;a++)RS.torch.wall.push([mk(torch(0,a)),mk(torch(1,a))]);
    [RS.torch.stand[0]].concat(...RS.torch.wall).forEach(i=>base(i,B.RS_TORCH));}
  // ---- levers: attached to the block at F6[s] (0 floor, 1 ceiling, 2..5 walls) ----
  {const lv=T('lever');
    const lever=(s,on)=>{const up=[[5/16,0,4/16,11/16,3/16,12/16,cob],(on?[7/16,3/16,9/16,9/16,11/16,11/16,lv,[0,-1/16,-2/16]]:[7/16,3/16,5/16,9/16,11/16,7/16,lv,[0,-1/16,2/16]])];
      // "up" geometry is the floor lever; turn it to sit on the support's face
      const f=s===0?1:s===1?0:[3,2,5,4][s-2];const sh=up.map(b=>{const r=faceBox6(b,f);if(b[7])r[7]=b[7];return r;});
      return {t:lv,solid:false,opaque:false,pick:true,shape:sh,flatIcon:lv,rs:{k:'lever',on,s},sup:F6[s].slice(),bc:'#806040'};};
    for(let s=0;s<6;s++)RS.lever.push([mk(lever(s,0),s===0?XB.lever[0]:null),mk(lever(s,1),s===0?XB.lever[1]:null)]);
    RS.lever.flat().forEach(i=>base(i,XB.lever[0]));}
  // ---- buttons: stone and wood, attached at F6[s] ----
  for(const [kind,t,N] of [['stone',stone,'Stone Button'],['wood',planks,'Wooden Button']]){
    for(let s=0;s<6;s++){const pair=[];for(const on of [0,1]){const dep=on?1/16:2/16;const up=[5/16,0,6/16,11/16,dep,10/16];const f=s===0?1:s===1?0:[3,2,5,4][s-2];const b=faceBox6(up,f);
        pair.push(mk({t,solid:false,opaque:false,pick:true,shape:[b],rs:{k:'button',on,s,wood:kind==='wood'},sup:F6[s].slice(),bc:'#8a8a8a',flatIcon:t}));}RS.button[kind].push(pair);}
    const item=RS.button[kind][2][0];BLOCK_NAMES[item]=N;B[kind==='stone'?'STONE_BUTTON':'WOOD_BUTTON']=item;RS.button[kind].flat().forEach(i=>base(i,item));}
  // ---- pressure plates ----
  for(const [kind,t,N] of [['stone',stone,'Stone Pressure Plate'],['wood',planks,'Wooden Pressure Plate'],['gold',BD[B.GOLDB].side,'Light Weighted Pressure Plate'],['iron',BD[B.IRON_BLOCK].side,'Heavy Weighted Pressure Plate']]){
    const p=[];for(const on of [0,1]){const b=[1/16,0,1/16,15/16,on?1/32:1/16,15/16];p.push(mk({t,solid:false,opaque:false,pick:true,shape:[b],rs:{k:'plate',on,type:kind},sup:[0,-1,0],bc:'#9a9a9a'}));}
    RS.plate[kind]=p;BLOCK_NAMES[p[0]]=N;B['PLATE_'+kind.toUpperCase()]=p[0];base(p[1],p[0]);}
  // ---- repeaters: facing f = the side the signal leaves from (0:-z 1:+x 2:+z 3:-x) ----
  {const ton=T('redstone_torch_on'),toff=T('redstone_torch_off'),bed=BD[B.BEDROCK]?BD[B.BEDROCK].side:stone;const ss=BD[41].side,st=BD[41].top;
    const tb=(c,on,h)=>[7/16,2/16,c-1/16,9/16,(h||7)/16,c+1/16,on?ton:toff,[0,3/16,.5-c]];
    for(let f=0;f<4;f++){RS.rep[f]=[];for(let d=1;d<=4;d++){RS.rep[f][d]=[];for(const on of [0,1]){RS.rep[f][d][on]=[];for(const lock of [0,1]){
      const top=rotTileG(T(on?'repeater_on':'repeater_off'),f);const rc=(6+(d-1)*2+1)/16;
      const bx=[[0,0,0,1,2/16,1],tb(3/16,on)].concat(lock?[[2/16,2/16,rc-1/16,14/16,4/16,rc+1/16,bed]]:[tb(rc,on)]).map(b=>turnBox(b,f));
      const reuse=d===1&&!on&&!lock?(f===0?B.REPEATER:ROT[B.REPEATER].v[f]):null;
      RS.rep[f][d][on][lock]=mk({top,side:ss,bottom:st,solid:true,opaque:false,shape:bx,col:[[0,0,0,1,2/16,1]],itemFlat:true,rs:{k:'rep',f,d,on,lock},sup:[0,-1,0],bc:'#a0a0a0'},reuse);base(RS.rep[f][d][on][lock],B.REPEATER);}}}}}
  // ---- comparators: sub = subtract mode, on = output above 0 ----
  {const ton=T('redstone_torch_on'),toff=T('redstone_torch_off');const ss=BD[41].side,st=BD[41].top;
    const tb=(x,z,on,h)=>[x-1/16,2/16,z-1/16,x+1/16,h/16,z+1/16,on?ton:toff,[.5-x,(7-h+3)/16,.5-z]];
    for(let f=0;f<4;f++){RS.comp[f]=[];for(const sub of [0,1]){RS.comp[f][sub]=[];for(const on of [0,1]){const top=rotTileG(T(on?'comparator_on':'comparator_off'),f);
      const bx=[[0,0,0,1,2/16,1],tb(5/16,12/16,on,7),tb(11/16,12/16,on,7),tb(8/16,3/16,sub,5)].map(b=>turnBox(b,f));
      const reuse=!sub&&!on?(f===0?B.COMPARATOR:ROT[B.COMPARATOR].v[f]):null;
      RS.comp[f][sub][on]=mk({top,side:ss,bottom:st,solid:true,opaque:false,shape:bx,col:[[0,0,0,1,2/16,1]],itemFlat:true,rs:{k:'comp',f,sub,on},sup:[0,-1,0],bc:'#a0a0a0'},reuse);base(RS.comp[f][sub][on],B.COMPARATOR);}}}}
  delete ROT[B.REPEATER];delete ROT[B.COMPARATOR];
  // ---- redstone lamp (the old always-lit lamp block stays as it was) ----
  RS.lamp=[mk({t:T('redstone_lamp_off'),rs:{k:'lamp',on:0},bc:'#6a4a2a'}),mk({t:T('redstone_lamp_on'),light:15,rs:{k:'lamp',on:1},bc:'#e0b060'})];base(RS.lamp[0],B.LAMP);base(RS.lamp[1],B.LAMP);
  // ---- pistons: f = F6 direction of the head; faces [+x,-x,+y,-y,+z,-z] ----
  {const side=T('piston_side'),bot=T('piston_bottom'),inner=T('piston_inner');const FRONT=[3,2,5,4,1,0];const OPP=[1,0,3,2,5,4];
    // which way the side picture is turned on the x/y/z faces so its head end points along the piston
    const R=[[2,2,2],[0,0,0],[3,0,0],[1,2,0],[0,3,3],[0,1,1]];   // [x faces, y faces, z faces]
    const faces=(f,front,back)=>{const r=R[f];const o=[rotTileG(side,r[0]),rotTileG(side,r[0]),rotTileG(side,r[1]),rotTileG(side,r[1]),rotTileG(side,r[2]),rotTileG(side,r[2])];o[FRONT[f]]=front;o[OPP[FRONT[f]]]=back;return o;};
    for(const [k,tn,key] of [['n','piston_top_normal','PISTON'],['s','piston_top_sticky','STICKY_PISTON']]){const top=T(tn);
      for(let f=0;f<6;f++){const ret=mk({t:side,faces:faces(f,top,bot),rs:{k:'piston',f,ext:0,sticky:k==='s'},bc:'#8a7a5a'},f===1?B[key]:null);
        const eb=faceBox6([0,0,0,1,12/16,1],f);const ext=mk({t:side,faces:faces(f,inner,bot),opaque:false,shape:[eb],col:[eb],rs:{k:'piston',f,ext:1,sticky:k==='s'},bc:'#8a7a5a'});
        const hb=[faceBox6([0,12/16,0,1,1,1],f),faceBox6([6/16,-4/16,6/16,10/16,12/16,10/16],f)];
        const head=mk({t:side,faces:faces(f,top,top),opaque:false,shape:hb,col:hb,rs:{k:'head',f,sticky:k==='s'},bc:'#8a7a5a'});
        RS.piston[k][f]=[ret,ext];RS.head[k][f]=head;base(ret,B[key]);base(ext,B[key]);base(head,B[key]);}}}
  // ---- dispensers and droppers facing any of the six ways ----
  {const fs=BD[B.DISPENSER].side,ft=BD[B.DISPENSER].top;const FRONT=[3,2,5,4,1,0];
    for(const [k,key,tv] of [['d','DISPENSER','dispenser_front_vertical'],['r','DROPPER','dropper_front_vertical']]){const fh=BD[B[key]].front,fv=T(tv);const R=ROT[B[key]].v;
      for(let f=0;f<6;f++){const old={3:B[key],2:R[1],5:R[2],4:R[3]}[f];let fc;
        if(f<2){fc=[ft,ft,ft,ft,ft,ft];fc[FRONT[f]]=fv;}else{fc=[fs,fs,ft,ft,fs,fs];fc[FRONT[f]]=fh;}
        RS.disp[k][f]=mk({t:fs,top:ft,bottom:ft,faces:fc,rs:{k:'disp',f,drop:k==='r'},bc:'#707070'},old);base(RS.disp[k][f],B[key]);}
      delete ROT[B[key]];}}
  // ---- hoppers: spout down, or toward DIRS4[a] ----
  {const H=BD[B.HOPPER];const top=H.shape.slice(0,6);const sp=[6/16,4/16,0,10/16,8/16,4/16];
    RS.hopper=[B.HOPPER];BD[B.HOPPER].rs={k:'hopper',a:-1};for(let a=0;a<4;a++){const s=top.concat([turnBox(sp,a)]);RS.hopper.push(mk({t:H.side,top:H.top,bottom:H.bottom,opaque:false,shape:s,col:H.col,itemFlat:true,rs:{k:'hopper',a},bc:'#4a4a4a'}));base(RS.hopper[a+1],B.HOPPER);}}
  // ---- daylight sensors (normal and inverted) ----
  {const D=BD[B.DAYLIGHT];D.rs={k:'daylight',inv:0};const inv=mk({t:D.side,top:T('daylight_detector_inverted_top'),bottom:D.bottom,opaque:false,shape:D.shape,col:D.col,rs:{k:'daylight',inv:1},bc:'#8a9ab0'});RS.daylight=[B.DAYLIGHT,inv];base(inv,B.DAYLIGHT);}
  // ---- rails: shapes 0 N-S, 1 E-W, 2..5 sloping up to the E, W, N, S, 6..9 curves SE SW NW NE ----
  {const h=1/16;const flat=(t)=>[[0,h,0],[1,h,0],[1,h,1],[0,h,1],t];
    const slope=(t,hi)=>{const Y=(x,z)=>h+(hi==='E'?x:hi==='W'?1-x:hi==='N'?1-z:z);return [[0,Y(0,0),0],[1,Y(1,0),0],[1,Y(1,1),1],[0,Y(0,1),1],t];};
    const kinds=[['normal','rail_normal',null,XB.rails[0]],['golden','rail_golden','rail_golden_powered',XB.rails[1]],['detector','rail_detector','rail_detector_powered',XB.rails[2]],['activator','rail_activator','rail_activator_powered',XB.rails[3]]];
    for(const [k,offT,onT,item] of kinds){RS.rail[k]=[];const old=[item,ROT[item].v[1]];
      for(const on of onT?[0,1]:[0]){RS.rail[k][on]=[];const ns=T(on?onT:offT),ew=rotTileG(ns,1);
        const n=k==='normal'?10:6;for(let s=0;s<n;s++){let q;
          if(s===0)q=flat(ns);else if(s===1)q=flat(ew);else if(s<6)q=slope(s<4?ew:ns,['E','W','N','S'][s-2]);else{const cv=T('rail_normal_turned');q=flat(rotTileG(cv,s-6));}
          const reuse=!on&&s<2?old[s]:null;
          const i=mk({t:ns,solid:false,opaque:false,pick:true,quads:[q],shape:undefined,flatIcon:T(offT),rail:true,rs:{k:'rail',type:k,shape:s,on},sup:[0,-1,0],bc:'#8a8070'},reuse);
          if(BD[i].shape)delete BD[i].shape;RS.rail[k][on][s]=i;base(i,item);}}
      delete ROT[item];}}
  // ---- note blocks: one id per pitch (0..24) ----
  {const N0=BD[B.NOTEBLOCK];RS.notes=[B.NOTEBLOCK];for(let n=1;n<25;n++){const i=id++;BD[i]=Object.assign({},N0);BLOCK_COL[i]=BLOCK_COL[B.NOTEBLOCK];RS.notes.push(i);base(i,B.NOTEBLOCK);}}
  VB.lastId=id-1;}
// the redstone dust pictures: the pack's grey dust tinted for each power level (as the real game colours it)
function rsDustColor(L){const f=L/15;const r=L?f*.6+.4:.3,g=Math.max(0,f*f*.7-.5),b=Math.max(0,f*f*.6-.7);const h=v=>('0'+Math.round(Math.min(1,v)*255).toString(16)).slice(-2);return '#'+h(r)+h(g)+h(b);}
atlasCanvas=makeProcAtlas();
