import glob,os
d=os.path.dirname(os.path.abspath(__file__))
js='\n'.join(open(f).read() for f in sorted(glob.glob(d+'/src/[0-9]*.js')))
shell=open(d+'/src/shell.html').read()
photon=open(d+'/vendor/photon-realtime.js').read()
out=shell.replace('/*__PHOTON__*/',photon).replace('/*__SCRIPT__*/',js)
open(d+'/index.html','w').write(out)
open(d+'/all.js','w').write('{\n'+js+'\n}')
print(len(js))
