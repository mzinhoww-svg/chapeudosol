import re,sys
src=open(sys.argv[1]).read()
m={'18f490166ef39bd9e470bbcfa643609f':'/img/logo.png','2d4392cf140feed9126ba3acf207b273':'/img/hero_reg.jpg','3f2a6abdc8e0bb25370095aaaf50076f':'/img/hero3d.jpg',
'72878f03fa29d6296697fc305120edce':'/img/concept_sunset.jpg','0ab34f0807e6c62cab383f45639eaec1':'/img/concept_farm.jpg','521262570e929a9819e4668d6489d1bc':'/img/concept_docks.jpg',
'6257b6e92dc834d8776c79fba8127f70':'/logos/assai.png','0c19deee808150d7d0e89986ff4bc034':'/logos/ambev.png','7589870c6b0371b837f18f2b29c1d97d':'/logos/brf.png','ec3318a12c9c6634892f3fb3c25d6013':'/logos/seara.png',
'a8ddfe7f31c39e0d8d1b6ff90fd8303e':'/logos/atacadao.png','f46546746e857bc0e3013bcaf84217ed':'/logos/energisa.png','d78649e6fcf230e97b26f91b378ce5ce':'/logos/ufmt.png','726eea4df6d1f6085c8c3d45c28da99d':'/logos/ifmt.png','c3f64f927b1bd5ad4db417a19830ea2f':'/logos/unemat.png',
'f5e82a836afa9d067b04e9d54b6a5cb8':'/video/hero_poster.jpg'}
a=src.index('<div style="font-family: Inter')
b=src.index('</x-dc>')
h=src[a:b]
# video sources
h=re.sub(r'<source src="/_blob/90ef[^"]*" type="video/mp4">','<source src="/video/hero_mobile.mp4" type="video/mp4" media="(max-width: 700px)"><source src="/video/hero_desktop.webm" type="video/webm"><source src="/video/hero_desktop.mp4" type="video/mp4">',h)
for k,v in m.items(): h=h.replace('/_blob/'+k,v)
h=h.replace('https://claude.ai/artifact/E99EffRhgKBEWPkUy7d7QZ','/mapa/index.html')
assert '/_blob/' not in h, re.findall(r'/_blob/\w+',h)
# form card -> slot
i=h.index('<div style="grid-column: span 6; background: rgba(255,255,255,.06)')
j=h.index('<div style="border-top: 1px solid rgba(255,255,255,.1);">')
# card ends right before closing of grid div: "</div></div>" then footer
card_end=h.rindex('</div></div>',i,j)  # closes card + grid
h=h[:i]+'<div id="form-slot" style="grid-column: span 6;"></div>'+h[card_end+6:]
open('components/home.html','w').write(h)
print(len(h))
