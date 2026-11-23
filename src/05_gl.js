// ================= WebGL =================
const cv=$('gl'),hud=$('hud'),hc=hud.getContext('2d');
const gl=cv.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:false});
if(!gl){document.body.innerHTML='<p style="color:#fff;padding:20px;font-family:monospace">WebGL is not available in this browser.</p>';throw new Error('no webgl');}
function prog(vs,fs){const p=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh);}
  gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const u={},a={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const x=gl.getActiveUniform(p,i);u[x.name.replace('[0]','')]=gl.getUniformLocation(p,x.name);}
  const m=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);for(let i=0;i<m;i++){const x=gl.getActiveAttrib(p,i);a[x.name]=gl.getAttribLocation(p,x.name);}return {p,u,a};}
const FOG_GLSL=`uniform vec3 fogC;uniform float fogN;uniform float fogF;`;
const PB=prog(`attribute vec3 p;attribute vec3 n;uniform mat4 vp;uniform mat4 m;uniform vec3 cam;varying float l;varying float vd;
void main(){vec4 w=m*vec4(p,1.);gl_Position=vp*w;vec3 nn=normalize((m*vec4(n,0.)).xyz);l=.6+.4*max(dot(nn,normalize(vec3(.4,1.,.3))),0.);vd=length(w.xyz-cam);}`,
`precision mediump float;uniform vec4 col;${FOG_GLSL}uniform float lit;varying float l;varying float vd;
void main(){float f=clamp((vd-fogN)/(fogF-fogN),0.,1.);vec3 c=col.rgb*mix(1.,l,lit);gl_FragColor=vec4(mix(c,fogC,f),col.a);}`);
// textured meshes: skins, armor, bats, extruded items
const PT=prog(`attribute vec3 p;attribute vec3 n;attribute vec2 t;uniform mat4 vp;uniform mat4 m;uniform vec3 cam;varying vec2 vt;varying float l;varying float vd;
void main(){vec4 w=m*vec4(p,1.);gl_Position=vp*w;vec3 nn=normalize((m*vec4(n,0.)).xyz);l=.55+.45*max(dot(nn,normalize(vec3(.4,1.,.3))),0.)+.1*nn.y;vd=length(w.xyz-cam);vt=t;}`,
`precision mediump float;uniform sampler2D tex;uniform vec4 tint;uniform float hurt;uniform float bright;uniform float glint;uniform float gph;uniform vec2 gs;${FOG_GLSL}varying vec2 vt;varying float l;varying float vd;
void main(){vec4 c=texture2D(tex,vt);if(c.a<.1)discard;c*=tint;if(glint>0.){float k=(vt.x*gs.x+vt.y*gs.y)*1.5+gph;float s=.5+.5*sin(k*6.2831);s=s*s*s;c.rgb+=vec3(.45,.22,.9)*glint*(.18+.85*s);}vec3 rgb=mix(c.rgb*l*bright,vec3(1.,.15,.1),hurt*.55);float f=clamp((vd-fogN)/(fogF-fogN),0.,1.);gl_FragColor=vec4(mix(rgb,fogC,f),c.a);}`);
const PS=prog(`attribute vec3 p;uniform mat4 vp;varying vec3 d;void main(){d=p;vec4 q=vp*vec4(p,1.);gl_Position=q.xyww;}`,
`precision mediump float;uniform sampler2D tex;varying vec3 d;uniform float face;void main(){gl_FragColor=texture2D(tex,vec2(0.,0.));}`);
function mkTex(src,repeat){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
let atlasTex=mkTex(atlasCanvas);
function reuploadAtlas(){gl.deleteTexture(atlasTex);let src=atlasCanvas;
  if(!OPT.fancy){src=mkCanvas(atlasCanvas.width,atlasCanvas.height);const g=src.getContext('2d');g.drawImage(atlasCanvas,0,0);const T=atlasCanvas.width/ACOLS;   // Fast graphics: opaque leaves
    for(const t of [6,52,64,74,93]){const x=(t%ACOLS)*T,y=Math.floor(t/ACOLS)*T;g.globalCompositeOperation='destination-over';g.fillStyle=({6:'#1f3d12',52:'#17400a',64:'#c86a98',74:'#16340f',93:'#7aa2bc'})[t];g.fillRect(x,y,T,T);}g.globalCompositeOperation='source-over';}
  atlasTex=mkTex(src);}

// ---- world chunk meshes (opaque/cutout + translucent water) ----
let chunks=[];
const FSHADE=[.8,.8,1,.5,.65,.65],AOK=[.5,.66,.83,1];
const LB=[];function rebuildLB(){const g=OPT.bright;for(let l=0;l<16;l++){const v=.05+.95*Math.pow(.8,15-l);LB[l]=v+(1-Math.pow(1-v,4)-v)*g;}}rebuildLB();
// Compact world vertices, 16 bytes: int16 x,y,z (local to the chunk, 1/128 block), pad, uint16 u,v, uint8 sky light, block light, shade*AO, flags.
// flags = face*16 + emissive*8 + wave (1 leaves, 2 plant tops, 3 water surface). Quads share one index buffer.
function vbAlloc(o,cap){const buf=new ArrayBuffer(cap*16);const u8=new Uint8ClampedArray(buf);if(o.u8)u8.set(o.u8.subarray(0,o.n*16));o.buf=buf;o.u8=u8;o.i16=new Int16Array(buf);o.u16=new Uint16Array(buf);o.cap=cap;}
function vbNew(cap){const o={n:0};vbAlloc(o,cap);return o;}
const VBO_=vbNew(1<<15),VBW_=vbNew(1<<13);
function pv(o,x,y,z,u,v,s,b,sh,f){if(o.n>=o.cap)vbAlloc(o,o.cap*2);const n=o.n++,k=n*8;o.i16[k]=(x*128+.5)|0;o.i16[k+1]=(y*128+.5)|0;o.i16[k+2]=(z*128+.5)|0;o.u16[k+4]=u*65535;o.u16[k+5]=v*65535;const j=n*16+12;o.u8[j]=s*255;o.u8[j+1]=b*255;o.u8[j+2]=sh*255;o.u8[j+3]=f;}
const MAXQ=16383;const quadIdx=gl.createBuffer();{const a=new Uint16Array(MAXQ*6);for(let q=0;q<MAXQ;q++){a.set([q*4,q*4+1,q*4+2,q*4,q*4+2,q*4+3],q*6);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,quadIdx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,a,gl.STATIC_DRAW);}
const CORN=[[0,0],[1,0],[1,1],[0,1]];
const _l=[0,0,0],_F=[0,0,0],_a=[0,0,0],_c=[0,0,0],_e=[0,0,0],QV=[[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]],QAO=[0,0,0,0];
const ORD0=[0,1,2,3],ORD1=[1,2,3,0];
function emitQuad(o,flip,f){const ord=flip?ORD1:ORD0;for(let n=0;n<4;n++){const q=QV[ord[n]];pv(o,q[0],q[1],q[2],q[3],q[4],q[5],q[6],q[7],q[8]|f);}}
const CULLS=new Uint8Array(256);function refreshCull(){for(let b=0;b<256;b++){const N=BD[b];CULLS[b]=N&&!N.cross&&!N.shape&&N.opaque&&N.render?1:0;}}
// mesh blocks in x0..x0+15, z0..z0+15, y0..y1 into the scratch buffers (positions local to x0,z0).
// The blocks and light around the chunk are copied into small padded arrays first so every neighbour lookup is plain index math.
const PB_=new Uint8Array(18*18*132),PL_=new Uint8Array(18*18*132),PO_=new Uint8Array(18*18*132);
const AXO=[1,324,18];
function meshRegion(x0,z0,y0,y1){
  if(!OPQ[B.STONE]){refreshLightTables();}if(!CULLS[B.STONE])refreshCull();
  const o=VBO_,w=VBW_;o.n=0;w.n=0;const AS=ACOLS*TILE;const plane=WX*WZ;
  const ymn=Math.max(0,y0),ymx=Math.min(WY-1,y1),NY=ymx-ymn+3;const outL=INF||(mapInfo&&mapInfo.skyLight)?0xF0:0;
  for(let pz=0;pz<18;pz++)for(let px=0;px<18;px++){const x=x0+px-1,z=z0+pz-1;const ok=INF?inBInf(x,0,z):(x>=0&&z>=0&&x<WX&&z<WZ);const base=ok?((z&ZM)*WX+(x&XM)):0;const out=!INF&&!ok?1:0;
    for(let ly=0;ly<NY;ly++){const y=ymn+ly-1,k=(ly*18+pz)*18+px;PO_[k]=out;
      if(!ok||y<0||y>=WY){PB_[k]=0;PL_[k]=y>=WY?0xF0:outL;}else{const i=y*plane+base;PB_[k]=world[i];PL_[k]=light[i];}}}
  const pxMax=INF?16:Math.min(16,WX-x0),pzMax=INF?16:Math.min(16,WZ-z0);const smoothOn=OPT.smooth;
  for(let ly=1;ly<NY-1;ly++){const y=ymn+ly-1;for(let pz=1;pz<=pzMax;pz++)for(let px=1;px<=pxMax;px++){const k=(ly*18+pz)*18+px;
    const b=PB_[k];if(!b)continue;const D=BD[b];if(!D.render)continue;const lx=px-1,lz=pz-1,x=x0+lx,z=z0+lz;const em=D.light>=7?8:0;
    if(D.cross){const tx=(D.side%ACOLS)*TILE,ty=Math.floor(D.side/ACOLS)*TILE;const L=PL_[k];const sl=LB[(L>>4)&15],bl=Math.min(1,LB[L&15]*1.05);const j=(hash2(x,z,5)-.5)*.3;
      const u0=(tx+.02)/AS,u1=(tx+TILE-.02)/AS,v0=(ty+.02)/AS,v1=(ty+TILE-.02)/AS;const sh=em?1:.9,s1=em?1:sl,b1=em?1:bl;
      for(let q=0;q<2;q++){const ax=.15,az=q?.85:.15,bx=.85,bz=q?.15:.85;
        pv(o,lx+ax+j,y+1,lz+az,u0,v0,s1,b1,sh,32+em+2);pv(o,lx+bx+j,y+1,lz+bz,u1,v0,s1,b1,sh,32+em+2);pv(o,lx+bx+j,y,lz+bz,u1,v1,s1,b1,sh,32+em+2);pv(o,lx+ax+j,y,lz+az,u0,v1,s1,b1,sh,32+em+2);}continue;}
    if(D.shape){const Lo=PL_[k],Lu=PL_[k+324];const sl=LB[Math.max(Lo>>4,Lu>>4)&15],bl=Math.min(1,LB[Math.max(Lo&15,Lu&15)]);
      for(const bx of (D.fence?fenceBoxes(x,y,z,false):D.shape))for(let f=0;f<6;f++){const d=f>>1,s=(f&1)?-1:1;const u=(d+1)%3,v=(d+2)%3;const lo=bx,hi=[bx[3],bx[4],bx[5]];
        const plane2=s>0?hi[d]:lo[d];
        if((s>0&&plane2>=1)||(s<0&&plane2<=0)){const nb=PB_[k+s*AXO[d]];if(nb&&BD[nb].opaque&&!BD[nb].shape)continue;}
        const tile=bx[6]!=null?bx[6]:d==1?(s>0?D.top:D.bottom):(f==4?D.front:D.side);const tx=(tile%ACOLS)*TILE,ty=Math.floor(tile/ACOLS)*TILE;
        for(let c=0;c<4;c++){const cu=CORN[c][0],cv2=CORN[c][1];_l[d]=plane2;_l[u]=cu?hi[u]:lo[u];_l[v]=cv2?hi[v]:lo[v];
          let tu,tv;if(d==1){tu=_l[0];tv=_l[2];}else if(d==0){tu=_l[2];tv=1-_l[1];}else{tu=_l[0];tv=1-_l[1];}
          const q=QV[c];q[0]=lx+_l[0];q[1]=y+_l[1];q[2]=lz+_l[2];q[3]=(tx+.02+tu*(TILE-.04))/AS;q[4]=(ty+.02+tv*(TILE-.04))/AS;q[5]=em?1:sl;q[6]=em?1:bl;q[7]=em?1:FSHADE[f];q[8]=f*16+em;}
        emitQuad(o,false,0);}
      continue;}
    const wave=D.leaves?1:0,liq=D.liquid,opq=D.opaque;
    for(let f=0;f<6;f++){
      const d=f>>1,s=(f&1)?-1:1;if(d===1&&s<0&&y===0)continue;const Fi=k+s*AXO[d];
      const nb=PB_[Fi];
      if(liq){if(nb===b||(nb&&OPQ[nb]))continue;if(liq==='water'&&nb&&BD[nb].solid&&OPQ[nb])continue;}
      else if(nb){if(CULLS[nb])continue;if(nb===b){const N=BD[nb];if(!N.cross&&!N.shape&&N.render)continue;}}
      if(opq&&PO_[Fi])continue;
      const tile=d==1?(s>0?D.top:D.bottom):(f==4?D.front:D.side);
      const tx=(tile%ACOLS)*TILE,ty=Math.floor(tile/ACOLS)*TILE;
      const u=(d+1)%3,v=(d+2)%3,AU=AXO[u],AV=AXO[v];
      const L=PL_[Fi];const sl=em?1:LB[(L>>4)&15],bl=em?1:Math.max(D.glow||0,Math.min(1,LB[L&15]*1.05));
      const topW=liq&&PB_[k+324]!==b;
      for(let c=0;c<4;c++){const cu=CORN[c][0],cv2=CORN[c][1];_l[0]=_l[1]=_l[2]=0;_l[d]=s>0?1:0;_l[u]=cu;_l[v]=cv2;
        let ao=3;if(!em&&!liq&&smoothOn){const su=cu?AU:-AU,sv=cv2?AV:-AV;const s1=OPQ[PB_[Fi+su]],s2=OPQ[PB_[Fi+sv]],cc=OPQ[PB_[Fi+su+sv]];ao=(s1&&s2)?0:3-(s1+s2+cc);}
        QAO[c]=ao;
        let tu,tv;if(d==1){tu=_l[0];tv=_l[2];}else if(d==0){tu=_l[2];tv=1-_l[1];}else{tu=_l[0];tv=1-_l[1];}
        const yy=topW&&_l[1]===1?.875:_l[1];
        const q=QV[c];q[0]=lx+_l[0];q[1]=y+yy;q[2]=lz+_l[2];q[3]=(tx+.02+tu*(TILE-.04))/AS;q[4]=(ty+.02+tv*(TILE-.04))/AS;q[5]=sl;q[6]=bl;q[7]=em?1:FSHADE[f]*AOK[ao];
        q[8]=f*16+em+(liq==='water'&&topW&&f===2?3:wave);}
      emitQuad(liq==='water'?w:o,QAO[0]+QAO[2]<QAO[1]+QAO[3],0);
    }
  }}
  return {o,w};}
function uploadChunkMesh(key,m,ci,cj){let c=chunks[key];if(!c){c={buf:gl.createBuffer(),wbuf:gl.createBuffer(),count:0,wcount:0};chunks[key]=c;}c.ci=ci;c.cj=cj;c.slot=INF?key:null;c.ox=ci*16;c.oz=cj*16;
  gl.bindBuffer(gl.ARRAY_BUFFER,c.buf);gl.bufferData(gl.ARRAY_BUFFER,m.o.u8.subarray(0,m.o.n*16),gl.STATIC_DRAW);c.count=m.o.n;
  gl.bindBuffer(gl.ARRAY_BUFFER,c.wbuf);gl.bufferData(gl.ARRAY_BUFFER,m.w.n?m.w.u8.subarray(0,m.w.n*16):new Uint8Array(16),gl.STATIC_DRAW);c.wcount=m.w.n;}
function buildChunk(ci,cj){const nc=Math.ceil(WX/16);uploadChunkMesh(cj*nc+ci,meshRegion(ci*16,cj*16,0,WY-1),ci,cj);}
function buildMesh(){if(INF){for(let s=0;s<cst.length;s++)if(cst[s]>=3)cdirty[s]=1;return;}for(const c of chunks)if(c){gl.deleteBuffer(c.buf);gl.deleteBuffer(c.wbuf);}chunks=[];const nc=Math.ceil(WX/16),nr=Math.ceil(WZ/16);for(let j=0;j<nr;j++)for(let i=0;i<nc;i++)buildChunk(i,j);}
function rebuildAt(x,z){if(INF)return;const set=new Set();for(const dx of [-1,0,1])for(const dz of [-1,0,1]){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=WX||zz>=WZ)continue;set.add((xx>>4)+','+(zz>>4));}for(const k of set){const [i,j]=k.split(',').map(Number);buildChunk(i,j);}}

// ---- unit cube for solid-colour boxes ----
const cubeBuf=gl.createBuffer();
{const v=[];const faces=[[[1,0,0],[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]]],[[-1,0,0],[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]],
 [[0,1,0],[[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]]],[[0,-1,0],[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]],
 [[0,0,1],[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],[[0,0,-1],[[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]]]];
 for(const [n,c] of faces)for(const i of [0,1,2,0,2,3])v.push(...c[i],...n);gl.bindBuffer(gl.ARRAY_BUFFER,cubeBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);}

// ---- textured box meshes using Minecraft's box-UV layout ----
// px units; box origin (x0,y0,z0) size (w,h,d); uv origin (u,v); texture size tw x th; inflate in px
function boxUV(out,x0,y0,z0,w,h,d,u,v,tw,th,inf=0,mirror=false){
  const X0=x0-inf,Y0=y0-inf,Z0=z0-inf,X1=x0+w+inf,Y1=y0+h+inf,Z1=z0+d+inf;
  const quad=(P,n,u0,v0,uw,vh)=>{ // P: 4 corners in order TL,TR,BR,BL as seen on texture
    let U=[u0,u0+uw,u0+uw,u0];if(mirror)U=[u0+uw,u0,u0,u0+uw];const V=[v0,v0,v0+vh,v0+vh];
    for(const i of [0,1,2,0,2,3])out.push(P[i][0]/16,P[i][1]/16,P[i][2]/16,n[0],n[1],n[2],U[i]/tw,V[i]/th);};
  const R=mirror?-1:1;
  // front (-z): texture left = +x
  quad([[X1,Y1,Z0],[X0,Y1,Z0],[X0,Y0,Z0],[X1,Y0,Z0]],[0,0,-1],u+d,v+d,w,h);
  // right side (+x): texture left = +z(back)
  quad(mirror?[[X0,Y1,Z1],[X0,Y1,Z0],[X0,Y0,Z0],[X0,Y0,Z1]]:[[X1,Y1,Z1],[X1,Y1,Z0],[X1,Y0,Z0],[X1,Y0,Z1]],[R,0,0],u,v+d,d,h);
  // left side (-x)
  quad(mirror?[[X1,Y1,Z0],[X1,Y1,Z1],[X1,Y0,Z1],[X1,Y0,Z0]]:[[X0,Y1,Z0],[X0,Y1,Z1],[X0,Y0,Z1],[X0,Y0,Z0]],[-R,0,0],u+d+w,v+d,d,h);
  // back (+z)
  quad([[X0,Y1,Z1],[X1,Y1,Z1],[X1,Y0,Z1],[X0,Y0,Z1]],[0,0,1],u+2*d+w,v+d,w,h);
  // top (+y)
  quad([[X1,Y1,Z1],[X0,Y1,Z1],[X0,Y1,Z0],[X1,Y1,Z0]],[0,1,0],u+d,v,w,d);
  // bottom (-y)
  quad([[X1,Y0,Z0],[X0,Y0,Z0],[X0,Y0,Z1],[X1,Y0,Z1]],[0,-1,0],u+d+w,v,w,d);
}
function meshFrom(arr){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);return {buf:b,count:arr.length/8};}
// player model parts (pivot in px, feet at y=0, facing -z)
function makePlayerModel(slim){
  const P={};const A=(name,fn)=>{const o=[];fn(o);P[name]=meshFrom(o);};const aw=slim?3:4;
  A('head',o=>boxUV(o,-4,0,-4,8,8,8,0,0,64,64));A('hat',o=>boxUV(o,-4,0,-4,8,8,8,32,0,64,64,.5));
  A('body',o=>boxUV(o,-4,-12,-2,8,12,4,16,16,64,64));A('jacket',o=>boxUV(o,-4,-12,-2,8,12,4,16,32,64,64,.25));
  A('rarm',o=>boxUV(o,-1,-10,-2,aw,12,4,40,16,64,64));A('rsleeve',o=>boxUV(o,-1,-10,-2,aw,12,4,40,32,64,64,.25));
  A('larm',o=>boxUV(o,-aw+1,-10,-2,aw,12,4,32,48,64,64));A('lsleeve',o=>boxUV(o,-aw+1,-10,-2,aw,12,4,48,48,64,64,.25));
  A('rleg',o=>boxUV(o,-2,-12,-2,4,12,4,0,16,64,64));A('rpants',o=>boxUV(o,-2,-12,-2,4,12,4,0,32,64,64,.25));
  A('lleg',o=>boxUV(o,-2,-12,-2,4,12,4,16,48,64,64));A('lpants',o=>boxUV(o,-2,-12,-2,4,12,4,0,48,64,64,.25));
  return P;
}
function makeArmorModel(){const P={};const A=(name,fn)=>{const o=[];fn(o);P[name]=meshFrom(o);};
  A('head',o=>boxUV(o,-4,0,-4,8,8,8,0,0,64,32,1));A('body',o=>boxUV(o,-4,-12,-2,8,12,4,16,16,64,32,1));
  A('rarm',o=>boxUV(o,-1,-10,-2,4,12,4,40,16,64,32,1));A('larm',o=>boxUV(o,-3,-10,-2,4,12,4,40,16,64,32,1,true));
  A('rleg',o=>boxUV(o,-2,-12,-2,4,12,4,0,16,64,32,1));A('lleg',o=>boxUV(o,-2,-12,-2,4,12,4,0,16,64,32,1,true));
  A('body2',o=>boxUV(o,-4,-12,-2,8,12,4,16,16,64,32,.5));A('rleg2',o=>boxUV(o,-2,-12,-2,4,12,4,0,16,64,32,.5));A('lleg2',o=>boxUV(o,-2,-12,-2,4,12,4,0,16,64,32,.5,true));
  return P;}
function makeBatModel(){const P={};const A=(name,fn)=>{const o=[];fn(o);P[name]=meshFrom(o);};
  A('head',o=>boxUV(o,-3,-3,-3,6,6,6,0,0,64,64));A('rear',o=>boxUV(o,-4,-6,-2,3,4,1,24,0,64,64));A('lear',o=>boxUV(o,1,-6,-2,3,4,1,24,0,64,64,0,true));
  A('body',o=>boxUV(o,-3,4,-3,6,12,6,0,16,64,64));A('rwing',o=>boxUV(o,-12,1,1.5,10,16,1,42,0,64,64));A('rtip',o=>boxUV(o,-8,1,0,8,12,1,24,16,64,64));
  A('lwing',o=>boxUV(o,2,1,1.5,10,16,1,42,0,64,64,0,true));A('ltip',o=>boxUV(o,0,1,0,8,12,1,24,16,64,64,0,true));return P;}
function makeChestModel(){const P={};const A=(name,fn)=>{const o=[];fn(o);P[name]=meshFrom(o);};
  A('base',o=>boxUV(o,-7,0,-7,14,10,14,0,19,64,64));A('lid',o=>boxUV(o,-7,0,-14,14,5,14,0,0,64,64));A('knob',o=>boxUV(o,-1,-2,-15,2,4,1,0,0,64,64));return P;}
const MODELS={wide:makePlayerModel(false),slim:makePlayerModel(true),armor:makeArmorModel(),bat:makeBatModel(),chest:makeChestModel()};

// ---- extruded item meshes (like held items in Minecraft) built from 32x32 icons, stored in an item atlas ----
const ITEM_CELL=32,ITEM_COLS=16,ITEM_ROWS=32;let itemAtlas=mkCanvas(ITEM_CELL*ITEM_COLS,ITEM_CELL*ITEM_ROWS),itemTex=null,itemMesh={},itemSlot={};
function rebuildItemAtlas(){
  const g=itemAtlas.getContext('2d');g.clearRect(0,0,itemAtlas.width,itemAtlas.height);g.imageSmoothingEnabled=false;let i=0;itemSlot={};
  for(const k in ITEMS){const cx=(i%ITEM_COLS)*ITEM_CELL,cy=Math.floor(i/ITEM_COLS)*ITEM_CELL;g.drawImage(ICON_RAW[k]||ICONS[k],cx,cy,ITEM_CELL,ITEM_CELL);itemSlot[k]=[cx,cy];i++;}
  if(itemTex)gl.deleteTexture(itemTex);itemTex=mkTex(itemAtlas);for(const k in itemMesh)gl.deleteBuffer(itemMesh[k].buf);itemMesh={};
}
// block items render as little 3D blocks (their real shape), everything else as extruded sprites
const blockItemMesh={};
function heldMesh(id){const it=ITEMS[id];const b=it&&it.type==='block'?it.block:0;const D=b&&BD[b];
  if(!D||D.cross||D.liquid||!D.render&&!D.tileEnt||b===B.CHEST)return {mesh:getItemMesh(id),tex:itemTex,block:false};
  if(!blockItemMesh[b]){const o=[];const boxes=D.fence?[[6/16,0,6/16,10/16,1,10/16]]:D.shape||[[0,0,0,1,1,1]];
    const uvT=(t,u,v)=>[((t%ACOLS)+.002+u*.996)/ACOLS,(Math.floor(t/ACOLS)+.002+v*.996)/ACOLS];
    for(const bx of boxes){const [x0,y0,z0,x1,y1,z1]=bx;const tile=f=>bx[6]!=null?bx[6]:f===2?D.top:f===3?D.bottom:f===4?(D.front!=null?D.front:D.side):D.side;
      const faces=[[[x1,y1,z1],[x1,y1,z0],[x1,y0,z0],[x1,y0,z1],[1,0,0],0],[[x0,y1,z0],[x0,y1,z1],[x0,y0,z1],[x0,y0,z0],[-1,0,0],1],[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[0,1,0],2],
        [[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[x0,y0,z0],[0,-1,0],3],[[x1,y1,z0],[x0,y1,z0],[x0,y0,z0],[x1,y0,z0],[0,0,-1],4],[[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],[x0,y0,z1],[0,0,1],5]];
      for(const [P0,P1,P2,P3,n,fi] of faces){const t=tile(fi);const uv=q=>{if(fi<2)return uvT(t,fi===0?1-q[2]:q[2],1-q[1]);if(fi<4)return uvT(t,q[0],fi===2?q[2]:1-q[2]);return uvT(t,fi===4?1-q[0]:q[0],1-q[1]);};
        for(const q of [P0,P1,P2,P0,P2,P3]){o.push(q[0]-.5,q[1]-.5,q[2]-.5,...n,...uv(q));}}}
    blockItemMesh[b]=meshFrom(o);}
  return {mesh:blockItemMesh[b],tex:atlasTex,block:true};}
function getItemMesh(id){
  if(itemMesh[id])return itemMesh[id];const [cx,cy]=itemSlot[id];const data=itemAtlas.getContext('2d').getImageData(cx,cy,ITEM_CELL,ITEM_CELL).data;
  const N=ITEM_CELL,A=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&data[(y*N+x)*4+3]>40;const o=[];const W=itemAtlas.width,H=itemAtlas.height;const th=1/N;const S=1/N;
  const push=(p,n,uv)=>o.push(p[0],p[1],p[2],n[0],n[1],n[2],uv[0],uv[1]);
  const q=(a,b,c,d,n,ua,ub,uc,ud)=>{for(const [p,uv] of [[a,ua],[b,ub],[c,uc],[a,ua],[c,uc],[d,ud]])push(p,n,uv);};
  const U=x=>(cx+.02+x*(N-.04)/N)/W,V=y=>(cy+.02+y*(N-.04)/N)/H;
  q([-.5,.5,th],[.5,.5,th],[.5,-.5,th],[-.5,-.5,th],[0,0,1],[U(0),V(0)],[U(N),V(0)],[U(N),V(N)],[U(0),V(N)]);
  q([.5,.5,-th],[-.5,.5,-th],[-.5,-.5,-th],[.5,-.5,-th],[0,0,-1],[U(N),V(0)],[U(0),V(0)],[U(0),V(N)],[U(N),V(N)]);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!A(x,y))continue;const X0=-.5+x*S,X1=X0+S,Y1=.5-y*S,Y0=Y1-S;const uv=[U(x+.5),V(y+.5)];
    if(!A(x-1,y))q([X0,Y1,-th],[X0,Y1,th],[X0,Y0,th],[X0,Y0,-th],[-1,0,0],uv,uv,uv,uv);
    if(!A(x+1,y))q([X1,Y1,th],[X1,Y1,-th],[X1,Y0,-th],[X1,Y0,th],[1,0,0],uv,uv,uv,uv);
    if(!A(x,y-1))q([X0,Y1,-th],[X1,Y1,-th],[X1,Y1,th],[X0,Y1,th],[0,1,0],uv,uv,uv,uv);
    if(!A(x,y+1))q([X0,Y0,th],[X1,Y0,th],[X1,Y0,-th],[X0,Y0,-th],[0,-1,0],uv,uv,uv,uv);}
  return itemMesh[id]=meshFrom(o);
}

// ---- drawing helpers ----
let curVP=null,curCam=[0,0,0],curFog={c:[.5,.7,.9],n:60,f:110};
function useBox(vp,cam){gl.useProgram(PB.p);gl.bindBuffer(gl.ARRAY_BUFFER,cubeBuf);gl.enableVertexAttribArray(PB.a.p);gl.vertexAttribPointer(PB.a.p,3,gl.FLOAT,false,24,0);
  gl.enableVertexAttribArray(PB.a.n);gl.vertexAttribPointer(PB.a.n,3,gl.FLOAT,false,24,12);
  gl.uniformMatrix4fv(PB.u.vp,false,vp);gl.uniform3fv(PB.u.cam,cam);gl.uniform3fv(PB.u.fogC,curFog.c);gl.uniform1f(PB.u.fogN,curFog.n);gl.uniform1f(PB.u.fogF,curFog.f);gl.uniform1f(PB.u.lit,1);}
function box(m,col,a=1){gl.uniformMatrix4fv(PB.u.m,false,m);gl.uniform4f(PB.u.col,col[0],col[1],col[2],a);gl.drawArrays(gl.TRIANGLES,0,36);}
function useTex(vp,cam){gl.useProgram(PT.p);gl.uniformMatrix4fv(PT.u.vp,false,vp);gl.uniform3fv(PT.u.cam,cam);gl.uniform3fv(PT.u.fogC,curFog.c);gl.uniform1f(PT.u.fogN,curFog.n);gl.uniform1f(PT.u.fogF,curFog.f);
  gl.uniform4f(PT.u.tint,1,1,1,1);gl.uniform1f(PT.u.hurt,0);gl.uniform1f(PT.u.bright,1);gl.uniform1f(PT.u.glint,0);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(PT.u.tex,0);}
// enchantment glint: a drifting purple shimmer added in the entity shader (gs = how many texture 'cells' span the UV range, so the bands suit the item/armour size)
const ITEM_GS=[ITEM_COLS,ITEM_ROWS],ARMOR_GS=[4,4];
function glintOn(gs){gl.uniform1f(PT.u.glint,1);gl.uniform2f(PT.u.gs,gs[0],gs[1]);gl.uniform1f(PT.u.gph,(perfT*.7)%1);}
function glintOff(){gl.uniform1f(PT.u.glint,0);}
function drawMesh(mesh,m,tex){gl.bindTexture(gl.TEXTURE_2D,tex);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buf);
  gl.enableVertexAttribArray(PT.a.p);gl.vertexAttribPointer(PT.a.p,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(PT.a.n);gl.vertexAttribPointer(PT.a.n,3,gl.FLOAT,false,32,12);
  gl.enableVertexAttribArray(PT.a.t);gl.vertexAttribPointer(PT.a.t,2,gl.FLOAT,false,32,24);gl.uniformMatrix4fv(PT.u.m,false,m);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
