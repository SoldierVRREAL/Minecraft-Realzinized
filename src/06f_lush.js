// mystical forest tiles from the resource pack: the pack's own grass, leaves and dirt, pushed to a deeper, brighter green (see 02h_lush.js)
function lushRecolor(img,fn){const c=dvFull(img),g=c.getContext('2d'),w=c.width,h=c.height,d=g.getImageData(0,0,w,h),D=d.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(D[i+3]<8)continue;const o=fn(D[i],D[i+1],D[i+2],x*16/w|0,y*16/h|0);if(!o)continue;D[i]=o[0];D[i+1]=o[1];D[i+2]=o[2];}
  g.putImageData(d,0,0);return c;}
const lushL=(r,g,b)=>(r*.3+g*.59+b*.11)/255;
const isGreen=(r,g,b)=>g>r+18&&g>b+10;
DV_TILES['~lush_grass_top']=['grass_top',i=>lushRecolor(i,(r,g,b,x,y)=>{let v=(lushL(r,g,b)-.36)/.34-.06;if(hash2(x,y,914)>.94)v=.98;return lushRamp(v);})];
DV_TILES['~lush_leaves']=['leaves_oak',i=>lushRecolor(i,(r,g,b)=>lushRamp((lushL(r,g,b)-.3)/.42))];
DV_TILES['~lush_tallgrass']=['tallgrass',i=>lushRecolor(i,(r,g,b)=>lushRamp((lushL(r,g,b)-.3)/.45+.08))];
// the side: the pack's dirt stays; its grass edge turns greener and hangs a little lower, with uneven drips
DV_TILES['~lush_grass_side']=['grass_side',i=>{const base=dvFull(i),w=base.width,px=w/16,g=base.getContext('2d');const D=g.getImageData(0,0,w,w).data;
  const c=lushRecolor(i,(r,g2,b)=>isGreen(r,g2,b)?lushRamp((lushL(r,g2,b)-.38)/.3):null);const cg=c.getContext('2d');
  for(let x=0;x<16;x++){const dep=LUSH_DRIP[x];for(let y=0;y<dep;y++){const sx=Math.min(w-1,x*px+(px>>1)),sy=Math.min(w-1,y*px+(px>>1)),k=(sy*w+sx)*4;
      if(isGreen(D[k],D[k+1],D[k+2]))continue;   // the pack already has grass here
      const v=.18+hash2(x,y,917)*.5-(y/dep)*.15;const col=lushRamp(v);cg.fillStyle=`rgb(${col[0]|0},${col[1]|0},${col[2]|0})`;cg.fillRect(x*px,y*px,px,px);}}
  return c;}];
