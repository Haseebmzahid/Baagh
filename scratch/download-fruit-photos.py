import urllib.request,re,pathlib,json
pages={'mango':'https://unsplash.com/photos/yellow-and-red-fruit-lot-vTXtQ8ZBzvY','citrus':'https://unsplash.com/photos/orange-fruits-ChSvFCbU4pY','mixed':'https://unsplash.com/photos/assorted-fresh-fruits-including-grapes-mango-and-orange-eToe7d2YfqI'}
out=pathlib.Path('public/images/fruit');out.mkdir(parents=True,exist_ok=True)
credits=[]
for name,page in pages.items():
 url='https://images.unsplash.com/'+{'mango':'photo-1605027990121-cbae9e0642df','citrus':'photo-1564050988016-522e96f274c6','mixed':'photo-1764390745408-74f0dbbb5bca'}[name]+'?auto=format&fit=crop&w=1400&q=82&fm=webp'
 urllib.request.urlretrieve(url,out/(name+'.webp'))
 credits.append({'file':name+'.webp','page':page,'download':url,'license':'https://unsplash.com/license'})
 print(name,(out/(name+'.webp')).stat().st_size)
for name,url,page in [('apple','https://images.unsplash.com/photo-1559028924-8767fe6527fd?auto=format&fit=crop&w=1400&q=82&fm=webp','https://unsplash.com/photos/red-apple-close-up-photography-7VF3G2Wk3mY'),('pomegranate','https://images.unsplash.com/photo-1449831438585-6f419654d73e?auto=format&fit=crop&w=1400&q=82&fm=webp','https://unsplash.com/photos/pomegranate-and-orange-fruits-SHJMuYQSRn8')]:
 filename=name+'.webp'
 urllib.request.urlretrieve(url,out/filename)
 credits.append({'file':filename,'page':page,'download':url,'license':'https://unsplash.com/license'})
 print(name,(out/filename).stat().st_size)
(out/'sources.json').write_text(json.dumps(credits,indent=2)+'\n')
