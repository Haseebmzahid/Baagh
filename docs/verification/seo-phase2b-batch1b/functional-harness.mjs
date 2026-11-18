import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from '@playwright/test';
const root=resolve('dist');const config=JSON.parse(await readFile('vercel.json','utf8'));
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;let file=resolve(root,`.${path}`);if(!file.startsWith(root+sep)&&file!==root){res.statusCode=403;return res.end();}try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');}catch{const route=config.rewrites.find(r=>r.source===path)??config.rewrites.find(r=>r.source.startsWith('/((')&&new RegExp(`^${r.source}$`).test(path));if(route)file=resolve(root,`.${route.destination}`);}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.html':'text/html','.xml':'application/xml','.txt':'text/plain','.json':'application/json'})[extname(file)]??'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;


const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[];
try{for(const [width,height]of [[1440,900],[768,1024],[390,844],[375,812]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(origin+'/everyday-fresh');await page.locator('h1').waitFor();
 await page.getByRole('group',{name:'Choose a fruit',exact:true}).getByRole('button',{name:/Kinnow/}).click();
 if(!await page.locator('.everyday-showcase-caption h2').textContent().then(s=>s.includes('Kinnow')))throw Error('fruit selection');
 await page.locator('.everyday-product-grid').getByRole('button',{name:'Add Chaunsa Mango to basket',exact:true}).click();
 await page.getByRole('button',{name:'Close basket',exact:true}).click();
 const saved=await page.evaluate(()=>localStorage.getItem('baagh.basket.v1'));
 await page.reload();if(await page.evaluate(()=>localStorage.getItem('baagh.basket.v1'))!==saved)throw Error('saved basket');
 await page.locator('.everyday-product-grid').getByRole('link',{name:'Chaunsa Mango',exact:true}).click();await page.locator('h1').waitFor();if(!page.url().endsWith('/product/mangoes/chaunsa'))throw Error('product navigation');await page.goBack();await page.locator('h1').waitFor();await page.goForward();await page.locator('h1').waitFor();
 await page.goto(origin+'/signature');await page.locator('h1').waitFor();
 await page.locator('.presentation-box').scrollIntoViewIfNeeded();
 if(width<768){await page.getByRole('button',{name:'Show the box closed',exact:true}).click();if(await page.locator('.presentation-box').evaluate(e=>getComputedStyle(e).getPropertyValue('--box-open').trim())!=='0')throw Error('box closed');await page.getByRole('button',{name:'Show the box open',exact:true}).click();}
 else {const scroll=await page.locator('.presentation-box').evaluate(e=>Number(e.style.getPropertyValue('--box-scroll')));if(!(scroll>0))throw Error('box scroll');}
 await page.emulateMedia({reducedMotion:'reduce'});if(await page.locator('.presentation-box').evaluate(e=>getComputedStyle(e).getPropertyValue('--box-open').trim())!=='1')throw Error('reduced box');
 await page.getByRole('button',{name:'Corporate gifting',exact:true}).click();await page.locator('#quote').waitFor();
 await page.goto(origin+'/our-story');await page.getByRole('link',{name:'Shop the collection',exact:true}).click();await page.locator('h1').waitFor();if(!page.url().endsWith('/everyday-fresh'))throw Error('story navigation');
 const rail=page.locator('.everyday-categories');if(width<768){await rail.evaluate(e=>e.scrollLeft=100);if(await rail.evaluate(e=>e.scrollLeft)<=0)throw Error('rail scroll');}
 results.push({width,status:'PASS',errors});await context.close();
}}catch(e){results.push({status:'FAIL',error:String(e)});process.exitCode=1;}finally{await browser.close();await new Promise(r=>server.close(r));}
await mkdir('docs/verification/seo-phase2b-batch1b/functional',{recursive:true});await writeFile('docs/verification/seo-phase2b-batch1b/functional/results.json',JSON.stringify(results,null,2));console.log(results);
