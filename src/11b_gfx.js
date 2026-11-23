// ================= Minecraft:realzanized graphics: presets (Potato .. PEAK), world shader, sky, shadows, bloom, day/night, ambient particles =================
// Presets. Potato: half resolution, short view, flat lighting. PEAK: full resolution, long view, sun shadows, bloom,
// waving plants, reflective water, volumetric-looking sky with clouds.
const GFX_PRESETS={
  potato:{name:'Potato',res:.5,chunks:3,smooth:false,wave:false,shadows:false,bloom:false,waterfx:false,skyClouds:false,fancy:false,particles:0,fps:2},
  low:{name:'Low',res:.75,chunks:5,smooth:true,wave:false,shadows:false,bloom:false,waterfx:false,skyClouds:false,fancy:true,particles:1,fps:1},
  high:{name:'High',res:1,chunks:8,smooth:true,wave:true,shadows:false,bloom:false,waterfx:true,skyClouds:true,fancy:true,particles:2,fps:0},
  peak:{name:'PEAK',res:1,chunks:12,smooth:true,wave:true,shadows:true,bloom:true,waterfx:true,skyClouds:true,fancy:true,particles:2,fps:0}};
const GFX_ORDER=['potato','low','high','peak'];
if(!OPT.gfx){const weak=(navigator.hardwareConcurrency||4)<=2||/Mobi|Android/i.test(navigator.userAgent)||(navigator.deviceMemory&&navigator.deviceMemory<=2);OPT.gfx=weak?'low':'high';}
if(OPT.chunks==null)OPT.chunks=GFX_PRESETS[OPT.gfx].chunks;
const G_=()=>GFX_PRESETS[OPT.gfx]||GFX_PRESETS.high;
function applyPreset(k){const P=GFX_PRESETS[k];OPT.gfx=k;OPT.chunks=P.chunks;OPT.smooth=P.smooth;OPT.fancy=P.fancy;OPT.particles=P.particles;OPT.fps=P.fps;saveOpt();
  try{reuploadAtlas();}catch(e){}resize();gfxRebuild();if(INF){const need=infRingFor(OPT.chunks);if(need!==WX&&typeof restartSurvivalStream==='function')restartSurvivalStream();else{infRD=Math.min(OPT.chunks,infMaxRD());buildMesh();}}else if(mapInfo)buildMesh();}
const resScale=()=>G_().res;

// ---------- world shader (compiled per preset) ----------
const WORLD_VS=`attribute vec3 p;attribute vec2 t;attribute vec3 l;attribute float f;
uniform mat4 vp;uniform vec3 off;uniform vec3 cam;uniform float time;
varying vec2 vt;varying vec3 vl;varying float vd;varying vec3 wp;varying float vf;
#ifdef SHADOW
uniform mat4 svp;varying vec4 vsh;
#endif
void main(){vec3 w=off+p*(1./128.);float wv=mod(f,8.);
#ifdef WAVE
  if(wv>.5&&wv<1.5){w.x+=sin(time*1.7+w.x*.7+w.y*.5)*.03;w.z+=cos(time*1.3+w.z*.6+w.y*.4)*.03;}
  else if(wv>1.5&&wv<2.5&&fract(t.y*16.)<.5){w.x+=sin(time*2.1+w.x*.9+w.z*.7)*.08;w.z+=cos(time*1.7+w.z*.8+w.x*.3)*.06;}
  else if(wv>2.5){w.y+=(sin(time*1.3+w.x*.6+w.z*.3)+sin(time*1.9-w.z*.7+w.x*.25))*.03-.06;}
#endif
  gl_Position=vp*vec4(w,1.);vt=t;vl=l;vd=length(w-cam);wp=w;vf=f;
#ifdef SHADOW
  float fc=floor(f/16.);vec3 N=fc<.5?vec3(1.,0.,0.):fc<1.5?vec3(-1.,0.,0.):fc<2.5?vec3(0.,1.,0.):fc<3.5?vec3(0.,-1.,0.):fc<4.5?vec3(0.,0.,1.):vec3(0.,0.,-1.);
  vsh=svp*vec4(w+N*.07,1.);
#endif
}`;
const WORLD_FS=`precision mediump float;
uniform sampler2D tex;uniform vec3 fogC;uniform float fogN;uniform float fogF;uniform float alpha;uniform float cut;
uniform vec3 skyL;uniform vec3 blkL;uniform float amb;uniform float water;uniform vec3 cam;uniform vec3 sunDir;uniform float sunStr;uniform float time;uniform vec3 skyZ;uniform vec3 sunCol;
varying vec2 vt;varying vec3 vl;varying float vd;varying vec3 wp;varying float vf;
#ifdef SHADOW
uniform sampler2D shTex;uniform float shTexel;varying vec4 vsh;
float unpackD(vec4 c){return dot(c,vec4(1.,1./255.,1./65025.,1./16581375.));}
float shadowAt(vec3 c,float bias){float s=0.;for(int i=-1;i<=1;i+=2)for(int j=-1;j<=1;j+=2){vec2 o=vec2(float(i),float(j))*shTexel*.75;s+=c.z-bias>unpackD(texture2D(shTex,c.xy+o))?0.:1.;}return s*.25;}
#endif
vec3 faceN(float fc){if(fc<.5)return vec3(1.,0.,0.);if(fc<1.5)return vec3(-1.,0.,0.);if(fc<2.5)return vec3(0.,1.,0.);if(fc<3.5)return vec3(0.,-1.,0.);if(fc<4.5)return vec3(0.,0.,1.);return vec3(0.,0.,-1.);}
void main(){vec4 c=texture2D(tex,vt);if(c.a<cut)discard;
  float vfi=floor(vf+.5);float fc=floor(vfi/16.);float em=mod(floor(vfi/8.),2.);float wv=mod(vfi,8.);
  vec3 sk=skyL;
#ifdef SHADOW
  if(sunStr>0.&&vl.x>.25){vec3 N=faceN(fc);float ndl=dot(N,sunDir);float d=0.;
    if(ndl>0.){vec3 sc=vsh.xyz/vsh.w*.5+.5;if(sc.x>0.&&sc.x<1.&&sc.y>0.&&sc.y<1.&&sc.z<1.)d=shadowAt(sc,.0006+.0012*(1.-ndl));else d=1.;d*=smoothstep(0.,.25,ndl);}
    if(wv>.5&&wv<2.5)d=max(d,.55);
    sk*=mix(1.,.58+.62*d,sunStr);}
#endif
  vec3 lt=max(vl.x*sk,vl.y*blkL);lt=max(lt,vec3(amb))*vl.z;if(em>.5)lt=vec3(1.15);
  vec3 col=c.rgb*lt;float a=alpha<1.?c.a*alpha:1.;
#ifdef WATERFX
  if(water>.5&&wv>2.5){vec3 V=normalize(cam-wp);
    float dx=cos(time*1.3+wp.x*.6+wp.z*.3)*.6*.03+cos(time*1.9-wp.z*.7+wp.x*.25)*.25*.03,dz=cos(time*1.3+wp.x*.6+wp.z*.3)*.3*.03-cos(time*1.9-wp.z*.7+wp.x*.25)*.7*.03;
    vec3 N=normalize(vec3(-dx*8.,1.,-dz*8.)+vec3(sin(wp.x*3.1+time*2.)*.03,0.,cos(wp.z*2.7+time*1.7)*.03));
    float fr=pow(1.-max(dot(N,V),0.),3.);vec3 R=reflect(-V,N);float sp=pow(max(dot(R,sunDir),0.),90.)*sunStr*vl.x;
    vec3 refl=mix(fogC,skyZ,clamp(R.y*1.5,0.,1.))*max(vl.x,.15);
    col=mix(col,refl,clamp(fr*.75+.12,0.,.85))+sunCol*sp*1.4;a=mix(.72,.96,fr);}
#endif
  float fg=clamp((vd-fogN)/(fogF-fogN),0.,1.);fg=fg*fg*(3.-2.*fg);
  gl_FragColor=vec4(mix(col,fogC,fg),a);}`;
let PWX=null,PSD=null,PSKY=null,PBR=null,PBL=null,PCO=null,PPT=null;
function gfxRebuild(){const G=G_();const defs=(G.wave?'#define WAVE\n':'')+(G.shadows?'#define SHADOW\n':'')+(G.waterfx?'#define WATERFX\n':'');
  const hp=G.shadows?'precision highp float;':'precision mediump float;';
  try{PWX=prog(defs+WORLD_VS,defs+WORLD_FS.replace('precision mediump float;',hp));}catch(e){console.warn('world shader fallback',e);PWX=prog(WORLD_VS,WORLD_FS);}
  if(!PSKY)PSKY=prog(`attribute vec2 q;varying vec2 uv;void main(){uv=q;gl_Position=vec4(q,.9999,1.);}`,SKY_FS(true));
  if(G.shadows&&!PSD)PSD=prog(`attribute vec3 p;attribute vec2 t;attribute float f;uniform mat4 svp;uniform vec3 off;varying vec2 vt;varying float vf;void main(){gl_Position=svp*vec4(off+p*(1./128.),1.);vt=t;vf=f;}`,
    `precision highp float;uniform sampler2D tex;varying vec2 vt;varying float vf;void main(){float wv=mod(floor(vf+.5),8.);if(wv>1.5&&wv<2.5)discard;if(wv<.5&&texture2D(tex,vt).a<.4)discard;vec4 e=fract(gl_FragCoord.z*vec4(1.,255.,65025.,16581375.));e-=e.yzww*vec4(1./255.,1./255.,1./255.,0.);gl_FragColor=e;}`);
  if(G.bloom&&!PBR){const VS=`attribute vec2 q;varying vec2 uv;void main(){uv=q*.5+.5;gl_Position=vec4(q,0.,1.);}`;
    PBR=prog(VS,`precision mediump float;uniform sampler2D src;uniform vec2 px;varying vec2 uv;void main(){vec3 c=vec3(0.);for(int i=0;i<2;i++)for(int j=0;j<2;j++)c+=texture2D(src,uv+(vec2(float(i),float(j))-.5)*px).rgb;c*=.25;float l=dot(c,vec3(.3,.59,.11));gl_FragColor=vec4(c*smoothstep(.62,1.,l)*1.2,1.);}`);
    PBL=prog(VS,`precision mediump float;uniform sampler2D src;uniform vec2 dir;varying vec2 uv;void main(){vec3 c=texture2D(src,uv).rgb*.227;c+=(texture2D(src,uv+dir*1.385).rgb+texture2D(src,uv-dir*1.385).rgb)*.316;c+=(texture2D(src,uv+dir*3.231).rgb+texture2D(src,uv-dir*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}`);
    PCO=prog(VS,`precision mediump float;uniform sampler2D src;uniform sampler2D blm;uniform float vig;uniform float sat;uniform vec3 grade;varying vec2 uv;void main(){vec3 c=texture2D(src,uv).rgb;vec3 b=texture2D(blm,uv).rgb;c+=b*.9;
      float l=dot(c,vec3(.3,.59,.11));c=mix(vec3(l),c,sat);c*=grade;c=c*(1.+c*.12)/(1.+c*.55)*1.28;vec2 d=uv-.5;c*=1.-dot(d,d)*vig;gl_FragColor=vec4(c,1.);}`);}
  if(!PPT)PPT=prog(`attribute vec3 p;attribute vec4 c;uniform mat4 vp;uniform float ps;uniform vec3 cam;varying vec4 vc;void main(){gl_Position=vp*vec4(p,1.);float d=length(p-cam);gl_PointSize=ps*c.a/max(d,.5);vc=c;}`,
    `precision mediump float;varying vec4 vc;void main(){vec2 d=gl_PointCoord-.5;if(dot(d,d)>.25)discard;gl_FragColor=vec4(vc.rgb,.85);}`);
}
const SKY_FS=clouds=>`precision mediump float;varying vec2 uv;uniform vec3 R;uniform vec3 U;uniform vec3 F;uniform vec3 zen;uniform vec3 hor;uniform vec3 sunDir;uniform vec3 sunCol;uniform float night;uniform float time;uniform float cloudOn;uniform float glow;uniform vec3 glowC;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=vn(p)*a;p=p*2.03+vec2(17.,9.);a*=.5;}return s;}
void main(){vec3 d=normalize(F+uv.x*R+uv.y*U);float h=d.y;
  vec3 col=mix(hor,zen,smoothstep(-.02,.55,h));if(h<0.)col=mix(hor,hor*.55,smoothstep(0.,-.4,h));
  float sd=dot(d,sunDir);float md=dot(d,-sunDir);
  col+=glowC*glow*pow(max(sd,0.),6.)*(1.-smoothstep(0.,.5,h));
  col+=sunCol*(pow(max(sd,0.),600.)*2.+pow(max(sd,0.),40.)*.25)*(1.-night);
  if(sd>.9992)col=mix(col,vec3(1.,.97,.85),1.-night*.6);
  if(md>.9994){col=mix(col,vec3(.86,.88,.95),.9*night+.15);}col+=vec3(.5,.55,.7)*pow(max(md,0.),300.)*night*.6;
  if(night>.05&&h>0.){vec3 q=floor(d*260.);float s=h2(q.xy+q.z*13.1);if(s>.9975){float tw=.6+.4*sin(time*3.+s*90.);col+=vec3(tw)*night*smoothstep(0.,.2,h);}}
  if(cloudOn>.5&&h>.01){vec2 cp=d.xz/(h+.06)*1.6+vec2(time*.012,time*.004);float n=fb(cp);float cov=smoothstep(.48,.72,n)*smoothstep(.01,.18,h);
    vec3 cc=mix(vec3(.08,.09,.13),vec3(1.,.99,.97),1.-night*.9);cc=mix(cc,glowC,glow*.35*(1.-smoothstep(0.,.4,h)));cc*=.82+.25*fb(cp*2.+3.);col=mix(col,cc,cov*.9);}
  gl_FragColor=vec4(col,1.);}`;
const triBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,triBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
function drawTri(P){gl.bindBuffer(gl.ARRAY_BUFFER,triBuf);gl.enableVertexAttribArray(P.a.q);gl.vertexAttribPointer(P.a.q,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,3);gl.disableVertexAttribArray(P.a.q);}

// ---------- day / night (Survival) ----------
let worldTime=.06;const DAY_LEN=1200;   // a day lasts 20 minutes; 0 = sunrise, .25 noon, .5 sunset
function sunVec(){const a=worldTime*Math.PI*2;const v=[Math.cos(a),Math.sin(a),.3];const l=Math.hypot(...v);return [v[0]/l,v[1]/l,v[2]/l];}
function dayAmt(){return smooth01(-.16,.22,Math.sin(worldTime*Math.PI*2));}
const mixv=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
let bioFog=[.72,.83,.98],bioSky=null,bioK=1,bioPart=null,bioName='',SKYMUL=1;
const ENV={zen:[.3,.55,.95],hor:[.7,.83,.98],fog:[.7,.83,.98],skyL:[1,1,1],blkL:[1,1,1],sun:[0,1,0],sunStr:1,sunCol:[1,.9,.7],night:0,glow:0,glowC:[1,.5,.3],fogN:40,fogF:100,amb:.12};
function updateEnv(dt){
  const d=dayAmt();const s=Math.sin(worldTime*Math.PI*2);SKYMUL=.14+.86*d;
  // biome under the camera, blended over a couple of seconds
  if(INF){const b=BIOMES[biomeAt(camPos[0],camPos[2])];const k=Math.min(1,dt*.8);bioFog=mixv(bioFog,b.fog,k);bioSky=mixv(bioSky||[.3,.55,.95],b.sky||[.3,.55,.95],k);bioK+=((b.fogK||1)-bioK)*k;bioPart=b.part||null;bioName=b.name;}
  const zenD=mixv([.28,.52,.95],bioSky||[.28,.52,.95],.5),horD=mixv([.66,.8,.98],bioFog,.6);
  let zen=mixv([.008,.012,.035],zenD,d),hor=mixv([.025,.035,.08],horD,d);
  const sunset=(1-smooth01(0,.32,Math.abs(s)))*(s>-.2?1:0);hor=mixv(hor,[1,.52,.3],sunset*.55);
  ENV.zen=zen;ENV.hor=hor;ENV.fog=hor.slice();ENV.glow=sunset;ENV.glowC=[1,.45,.22];ENV.night=1-d;
  const sv=sunVec();ENV.sun=s>-.05?sv:[-sv[0],-sv[1],-sv[2]];ENV.sunStr=s>-.05?smooth01(-.05,.15,s):smooth01(.05,.3,-s)*.35;
  ENV.sunCol=mixv([1,.6,.35],[1,.95,.85],smooth01(0,.4,s));
  ENV.skyL=mixv([.16,.19,.32],mixv([1,.8,.68],[1,.98,.95],smooth01(.05,.4,s)),d);
  ENV.blkL=G_().fancy?[1.05,.93,.78]:[1,1,1];ENV.amb=.06;
  // distance fog: render distance, biome mist, caves and water
  const far=Math.max(24,Math.min(infRD,infMaxRD())*16-6);let fF=bioK<.99?Math.max(34,far*bioK):far,fN=fF*(bioK<.99?.05:.6);
  if(INF&&player){const L=lightAt(Math.floor(camPos[0]),Math.floor(camPos[1]),Math.floor(camPos[2]));const sky=(L>>4)/15;const cave=1-smooth01(.15,.7,sky);
    if(camPos[1]<SEA-4&&cave>0){ENV.fog=mixv(ENV.fog,[.03,.03,.045],cave);fF=mixv([fF,0,0],[Math.min(fF,72),0,0],cave)[0];fN=fF*.35;}
    const ib=getB(Math.floor(camPos[0]),Math.floor(camPos[1]),Math.floor(camPos[2]));if(ib===B.WATER){ENV.fog=[.04*SKYMUL+.01,.16*SKYMUL+.02,.38*SKYMUL+.04];fN=0;fF=22;}else if(ib===B.LAVA){ENV.fog=[.9,.3,.05];fN=0;fF=3;}}
  ENV.fogN=fN;ENV.fogF=fF;}

// ---------- frustum culling ----------
const FRP=new Float32Array(24);
function frustumFrom(m){for(let i=0;i<3;i++)for(let s=0;s<2;s++){const k=(i*2+s)*4,sg=s?-1:1;FRP[k]=m[3]+sg*m[i];FRP[k+1]=m[7]+sg*m[4+i];FRP[k+2]=m[11]+sg*m[8+i];FRP[k+3]=m[15]+sg*m[12+i];}}
function boxVisible(x0,y0,z0,x1,y1,z1){for(let k=0;k<24;k+=4){const a=FRP[k],b=FRP[k+1],c=FRP[k+2];if(a*(a>0?x1:x0)+b*(b>0?y1:y0)+c*(c>0?z1:z0)+FRP[k+3]<0)return false;}return true;}

// ---------- drawing the world ----------
function bindWorldAttribs(P,c,buf,batch){gl.bindBuffer(gl.ARRAY_BUFFER,buf);const o=batch*MAXQ*4*16;
  gl.enableVertexAttribArray(P.a.p);gl.vertexAttribPointer(P.a.p,3,gl.SHORT,false,16,o);
  if(P.a.t!=null){gl.enableVertexAttribArray(P.a.t);gl.vertexAttribPointer(P.a.t,2,gl.UNSIGNED_SHORT,true,16,o+8);}
  if(P.a.l!=null){gl.enableVertexAttribArray(P.a.l);gl.vertexAttribPointer(P.a.l,3,gl.UNSIGNED_BYTE,true,16,o+12);}
  if(P.a.f!=null){gl.enableVertexAttribArray(P.a.f);gl.vertexAttribPointer(P.a.f,1,gl.UNSIGNED_BYTE,false,16,o+15);}}
function unbindWorldAttribs(P){for(const k of ['t','l','f'])if(P.a[k]!=null)gl.disableVertexAttribArray(P.a[k]);}
function drawChunkList(P,water,maxD){gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,quadIdx);let n=0;
  for(const c of chunks){if(!c)continue;const cnt=water?c.wcount:c.count;if(!cnt)continue;const dx=c.ox+8-camPos[0],dz=c.oz+8-camPos[2];if(dx*dx+dz*dz>(maxD+24)*(maxD+24))continue;
    const top=INF&&c.slot!=null?cmaxY[c.slot]+2:WY+2;if(!boxVisible(c.ox,-1,c.oz,c.ox+16,top,c.oz+16))continue;
    gl.uniform3f(P.u.off,c.ox,0,c.oz);for(let b=0;b*MAXQ*4<cnt;b++){const q=Math.min(MAXQ,(cnt>>2)-b*MAXQ);bindWorldAttribs(P,c,water?c.wbuf:c.buf,b);gl.drawElements(gl.TRIANGLES,q*6,gl.UNSIGNED_SHORT,0);}n++;}
  return n;}
function worldUniforms(P,maxD){const fog=curFog;gl.useProgram(P.p);gl.uniformMatrix4fv(P.u.vp,false,VP);gl.uniform3fv(P.u.cam,camPos);gl.uniform3fv(P.u.fogC,fog.c);gl.uniform1f(P.u.fogN,fog.n);gl.uniform1f(P.u.fogF,fog.f);
  gl.uniform1f(P.u.time,perfT);gl.uniform1f(P.u.alpha,1);gl.uniform1f(P.u.cut,.4);gl.uniform1f(P.u.water,0);
  if(INF){gl.uniform3fv(P.u.skyL,ENV.skyL);gl.uniform3fv(P.u.blkL,ENV.blkL);gl.uniform1f(P.u.amb,ENV.amb);gl.uniform3fv(P.u.sunDir,ENV.sun);gl.uniform1f(P.u.sunStr,ENV.sunStr);gl.uniform3fv(P.u.skyZ,ENV.zen);gl.uniform3fv(P.u.sunCol,ENV.sunCol);}
  else{const k=mapInfo&&mapInfo.dark?(mapInfo.skyMul||0):1;gl.uniform3f(P.u.skyL,k,k,k);gl.uniform3f(P.u.blkL,1,1,1);gl.uniform1f(P.u.amb,mapInfo&&mapInfo.dark?(mapInfo.ambient||.07):.12);
    const sd=[-.45,.85,-.25],l=Math.hypot(...sd);gl.uniform3f(P.u.sunDir,sd[0]/l,sd[1]/l,sd[2]/l);gl.uniform1f(P.u.sunStr,mapInfo&&mapInfo.dark?0:1);gl.uniform3fv(P.u.skyZ,mapInfo?mapInfo.sky:[.5,.7,1]);gl.uniform3f(P.u.sunCol,1,.95,.85);}
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlasTex);gl.uniform1i(P.u.tex,0);
  if(P.u.shTex){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,SHADOW.tex);gl.uniform1i(P.u.shTex,1);gl.uniformMatrix4fv(P.u.svp,false,SHADOW.vp);gl.uniform1f(P.u.shTexel,1/SHADOW.size);gl.activeTexture(gl.TEXTURE0);}}
function drawWorld(maxD){if(!PWX)gfxRebuild();const P=PWX;frustumFrom(VP);worldUniforms(P,maxD);const n=drawChunkList(P,false,maxD);unbindWorldAttribs(P);return n;}
function drawWater(maxD){const P=PWX;worldUniforms(P,maxD);gl.uniform1f(P.u.alpha,.99);gl.uniform1f(P.u.cut,0);gl.uniform1f(P.u.water,1);drawChunkList(P,true,maxD);unbindWorldAttribs(P);}

// ---------- sky dome ----------
function drawSkyDome(fov,aspect){if(!PSKY)gfxRebuild();const P=PSKY;gl.useProgram(P.p);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);
  const cy=Math.cos(camYaw),sy=Math.sin(camYaw),cp=Math.cos(camPitch),sp=Math.sin(camPitch);const th=Math.tan(fov/2);
  const F=[-sy*cp,sp,-cy*cp],Rt=[cy,0,-sy],U=[sy*sp,cp,cy*sp];
  gl.uniform3f(P.u.F,F[0],F[1],F[2]);gl.uniform3f(P.u.R,Rt[0]*th*aspect,Rt[1]*th*aspect,Rt[2]*th*aspect);gl.uniform3f(P.u.U,U[0]*th,U[1]*th,U[2]*th);
  gl.uniform3fv(P.u.zen,ENV.zen);gl.uniform3fv(P.u.hor,ENV.fog);gl.uniform3fv(P.u.sunDir,sunVec());gl.uniform3fv(P.u.sunCol,ENV.sunCol);gl.uniform1f(P.u.night,ENV.night);gl.uniform1f(P.u.time,perfT);
  gl.uniform1f(P.u.cloudOn,G_().skyClouds&&OPT.clouds?1:0);gl.uniform1f(P.u.glow,ENV.glow);gl.uniform3fv(P.u.glowC,ENV.glowC);
  drawTri(P);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);}

// ---------- sun shadows (PEAK) ----------
const SHADOW={size:2048,fbo:null,tex:null,vp:M4.id(),t:0};
function ensureShadow(){if(SHADOW.fbo)return;const S=SHADOW.size;SHADOW.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,SHADOW.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  const rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,S,S);
  SHADOW.fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,SHADOW.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,SHADOW.tex,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
function lookAtM(eye,tgt,up){const f=[tgt[0]-eye[0],tgt[1]-eye[1],tgt[2]-eye[2]];let l=Math.hypot(...f);f[0]/=l;f[1]/=l;f[2]/=l;let s=[f[1]*up[2]-f[2]*up[1],f[2]*up[0]-f[0]*up[2],f[0]*up[1]-f[1]*up[0]];l=Math.hypot(...s);s=s.map(v=>v/l);
  const u=[s[1]*f[2]-s[2]*f[1],s[2]*f[0]-s[0]*f[2],s[0]*f[1]-s[1]*f[0]];const o=M4.id();o[0]=s[0];o[4]=s[1];o[8]=s[2];o[1]=u[0];o[5]=u[1];o[9]=u[2];o[2]=-f[0];o[6]=-f[1];o[10]=-f[2];
  o[12]=-(s[0]*eye[0]+s[1]*eye[1]+s[2]*eye[2]);o[13]=-(u[0]*eye[0]+u[1]*eye[1]+u[2]*eye[2]);o[14]=f[0]*eye[0]+f[1]*eye[1]+f[2]*eye[2];return o;}
function orthoM(l,r,b,t,n,f){const o=M4.id();o[0]=2/(r-l);o[5]=2/(t-b);o[10]=-2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);return o;}
function shadowPass(){if(!G_().shadows||ENV.sunStr<=0||!PSD)return;ensureShadow();const S=SHADOW.size,R=72;const sd=ENV.sun;
  // snap the centre to shadow-map texels so edges don't crawl as you move
  const up=Math.abs(sd[1])>.95?[0,0,1]:[0,1,0];const base=lookAtM([0,0,0],[-sd[0],-sd[1],-sd[2]],up);const c=xform(base,camPos);const tx=2*R/S;c[0]=Math.round(c[0]/tx)*tx;c[1]=Math.round(c[1]/tx)*tx;
  const V=base.slice();V[12]-=c[0];V[13]-=c[1];V[14]+=0;const Pm=orthoM(-R,R,-R,R,-c[2]-160,-c[2]+160);SHADOW.vp=M4.mul(Pm,V);
  gl.bindFramebuffer(gl.FRAMEBUFFER,SHADOW.fbo);gl.viewport(0,0,S,S);gl.depthMask(true);gl.colorMask(true,true,true,true);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  const P=PSD;gl.useProgram(P.p);gl.uniformMatrix4fv(P.u.svp,false,SHADOW.vp);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlasTex);gl.uniform1i(P.u.tex,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,quadIdx);frustumFrom(SHADOW.vp);
  for(const c2 of chunks){if(!c2||!c2.count)continue;if(Math.abs(c2.ox+8-camPos[0])>R+40||Math.abs(c2.oz+8-camPos[2])>R+40)continue;if(!boxVisible(c2.ox,-1,c2.oz,c2.ox+16,WY,c2.oz+16))continue;gl.uniform3f(P.u.off,c2.ox,0,c2.oz);
    for(let b=0;b*MAXQ*4<c2.count;b++){const q=Math.min(MAXQ,(c2.count>>2)-b*MAXQ);bindWorldAttribs(P,c2,c2.buf,b);gl.drawElements(gl.TRIANGLES,q*6,gl.UNSIGNED_SHORT,0);}}
  unbindWorldAttribs(P);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}

// ---------- post processing: bloom + grading (PEAK) ----------
const POST={w:0,h:0,fbo:null,tex:null,b1:null,b2:null};
function mkTarget(w,h,depth){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
  if(depth){const rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);return {t,f,w,h};}
function postOn(){return INF&&G_().bloom&&PBR&&MATCH.state!=='menu';}
function postBegin(){if(!postOn())return false;const w=cv.width,h=cv.height;if(POST.w!==w||POST.h!==h){POST.w=w;POST.h=h;POST.main=mkTarget(w,h,true);POST.b1=mkTarget(w>>2,h>>2,false);POST.b2=mkTarget(w>>2,h>>2,false);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,POST.main.f);gl.viewport(0,0,w,h);gl.depthMask(true);return true;}
function postEnd(){gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.depthMask(true);const b1=POST.b1,b2=POST.b2;
  gl.bindFramebuffer(gl.FRAMEBUFFER,b1.f);gl.viewport(0,0,b1.w,b1.h);gl.useProgram(PBR.p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,POST.main.t);gl.uniform1i(PBR.u.src,0);gl.uniform2f(PBR.u.px,1/POST.w*2,1/POST.h*2);drawTri(PBR);
  for(let i=0;i<2;i++){gl.bindFramebuffer(gl.FRAMEBUFFER,b2.f);gl.useProgram(PBL.p);gl.bindTexture(gl.TEXTURE_2D,b1.t);gl.uniform1i(PBL.u.src,0);gl.uniform2f(PBL.u.dir,1/b1.w*(1+i),0);drawTri(PBL);
    gl.bindFramebuffer(gl.FRAMEBUFFER,b1.f);gl.bindTexture(gl.TEXTURE_2D,b2.t);gl.uniform2f(PBL.u.dir,0,1/b1.h*(1+i));drawTri(PBL);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.useProgram(PCO.p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,POST.main.t);gl.uniform1i(PCO.u.src,0);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,b1.t);gl.uniform1i(PCO.u.blm,1);gl.activeTexture(gl.TEXTURE0);
  const n=ENV.night;gl.uniform1f(PCO.u.vig,.55);gl.uniform1f(PCO.u.sat,1.12-n*.25);gl.uniform3f(PCO.u.grade,1.02+ENV.glow*.05,1,1-ENV.glow*.04+n*.06);drawTri(PCO);gl.enable(gl.DEPTH_TEST);}

// ---------- ambient particles: sakura petals, ash, snow, spores, crystal sparkles ----------
const AMB={n:0,max:900,pos:new Float32Array(900*3),vel:new Float32Array(900*3),col:new Float32Array(900*4),life:new Float32Array(900),buf:null,cbuf:null,kind:null};
const AMB_KIND={petal:{c:[[1,.72,.86],[.98,.6,.8],[1,.85,.93]],n:260,fall:.9,sway:1.4,size:9},ash:{c:[[.42,.4,.4],[.3,.28,.28],[.65,.62,.6],[.9,.45,.15]],n:700,fall:.6,sway:2.6,size:6,wind:4},
  snow:{c:[[1,1,1],[.92,.96,1]],n:600,fall:1.6,sway:.8,size:7},spore:{c:[[.5,.9,1],[.75,.6,1],[.4,1,.9]],n:260,fall:-.2,sway:.6,size:6,glow:1},
  sparkle:{c:[[.6,.85,1],[.85,.95,1],[.4,.7,1]],n:220,fall:-.05,sway:.3,size:6,glow:1},mote:{c:[[.95,.92,.7],[.85,.9,.75]],n:160,fall:.05,sway:.4,size:5,glow:1}};
function updateAmbient(dt){const G=G_();if(!INF||G.particles===0||!OPT.particles||MATCH.state==='menu'){AMB.n=0;return;}
  const K=AMB_KIND[bioPart];const want=K?Math.round(K.n*[0,.4,1][Math.min(2,OPT.particles)]):0;AMB.kind=bioPart;
  for(let i=0;i<AMB.n;i++){AMB.life[i]-=dt;const k=i*3;if(AMB.life[i]<=0||Math.abs(AMB.pos[k]-camPos[0])>26||Math.abs(AMB.pos[k+2]-camPos[2])>26||(AMB.pos[k+1]-camPos[1])<-14){const j=--AMB.n;
      for(let q=0;q<3;q++){AMB.pos[k+q]=AMB.pos[j*3+q];AMB.vel[k+q]=AMB.vel[j*3+q];}for(let q=0;q<4;q++)AMB.col[i*4+q]=AMB.col[j*4+q];AMB.life[i]=AMB.life[j];i--;continue;}
    const t=perfT+i;AMB.pos[k]+=(AMB.vel[k]+Math.sin(t*1.3)*(K?K.sway:.5))*dt;AMB.pos[k+1]+=AMB.vel[k+1]*dt;AMB.pos[k+2]+=(AMB.vel[k+2]+Math.cos(t*1.1)*(K?K.sway:.5))*dt;
    const b=getB(Math.floor(AMB.pos[k]),Math.floor(AMB.pos[k+1]),Math.floor(AMB.pos[k+2]));if(b&&BD[b].solid)AMB.life[i]=Math.min(AMB.life[i],.4);}
  let spawn=K?Math.min(want-AMB.n,Math.ceil(want*dt*.6)+2):0;
  while(spawn-->0&&AMB.n<AMB.max){const i=AMB.n++,k=i*3;const x=camPos[0]+(Math.random()-.5)*44,z=camPos[2]+(Math.random()-.5)*44;let y=camPos[1]+(K.fall>0?6+Math.random()*12:-4+Math.random()*12);
    const L=lightAt(Math.floor(x),Math.floor(y),Math.floor(z));if((L>>4)<10&&!K.glow){AMB.n--;continue;}
    AMB.pos[k]=x;AMB.pos[k+1]=y;AMB.pos[k+2]=z;AMB.vel[k]=(K.wind||0)+(Math.random()-.5)*.5;AMB.vel[k+1]=-K.fall*(.6+Math.random()*.8);AMB.vel[k+2]=(K.wind||0)*.4+(Math.random()-.5)*.5;
    const c=K.c[Math.random()*K.c.length|0];const lit=K.glow?1:Math.max(.25,SKYMUL);AMB.col[i*4]=c[0]*lit;AMB.col[i*4+1]=c[1]*lit;AMB.col[i*4+2]=c[2]*lit;AMB.col[i*4+3]=K.size*(.7+Math.random()*.6);AMB.life[i]=6+Math.random()*8;}}
function drawAmbient(){if(!AMB.n||!PPT)return;if(!AMB.buf){AMB.buf=gl.createBuffer();AMB.cbuf=gl.createBuffer();}const P=PPT;gl.useProgram(P.p);gl.uniformMatrix4fv(P.u.vp,false,VP);gl.uniform3fv(P.u.cam,camPos);gl.uniform1f(P.u.ps,cv.height/24);
  gl.bindBuffer(gl.ARRAY_BUFFER,AMB.buf);gl.bufferData(gl.ARRAY_BUFFER,AMB.pos.subarray(0,AMB.n*3),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(P.a.p);gl.vertexAttribPointer(P.a.p,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,AMB.cbuf);gl.bufferData(gl.ARRAY_BUFFER,AMB.col.subarray(0,AMB.n*4),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(P.a.c);gl.vertexAttribPointer(P.a.c,4,gl.FLOAT,false,0,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,AMB.n);gl.depthMask(true);gl.disable(gl.BLEND);gl.disableVertexAttribArray(P.a.c);}
window.__resScale=resScale;resize();gfxRebuild();
