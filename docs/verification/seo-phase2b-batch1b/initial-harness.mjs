import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from '@playwright/test';
const root=resolve('dist');const config=JSON.parse(await readFile('vercel.json','utf8'));
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;if(path==='/favicon.ico'){res.statusCode=204;return res.end();}let file=resolve(root,`.${path}`);if(!file.startsWith(root+sep)&&file!==root){res.statusCode=403;return res.end();}try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');}catch{const route=config.rewrites.find(r=>r.source===path)??config.rewrites.find(r=>r.source.startsWith('/((')&&new RegExp(`^${r.source}$`).test(path));if(route)file=resolve(root,`.${route.destination}`);}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.html':'text/html','.xml':'application/xml','.txt':'text/plain','.json':'application/json'})[extname(file)]??'application/octet-stream');let data;try{data=await readFile(file);}catch{data=await readFile(resolve('dist',`.${path}`));}res.end(data);}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;


const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const out='docs/verification/seo-phase2b-batch1b/initial';await mkdir(out,{recursive:true});const results=[];
const measure=page=>page.evaluate(()=>({h1:document.querySelector('h1').getBoundingClientRect().toJSON(),padding:getComputedStyle(document.querySelector('.baagh-page-container')).paddingLeft,overflow:document.documentElement.scrollWidth>innerWidth,categories:document.querySelector('.everyday-categories')?{display:getComputedStyle(document.querySelector('.everyday-categories')).display,columns:getComputedStyle(document.querySelector('.everyday-categories')).gridTemplateColumns,scroll:document.querySelector('.everyday-categories').scrollWidth>document.querySelector('.everyday-categories').clientWidth}:null,collections:document.querySelectorAll('.signature-collection').length,controls:document.querySelectorAll('.presentation-box-controls').length,canvases:document.querySelectorAll('canvas').length}));
try{for(const [width,height] of [[1440,900],[768,1024],[390,844],[375,812]])for(const route of ['/everyday-fresh','/signature','/our-story']){
 const errors=[];const item={route,width,height};
 for(const js of [false,true]){
 const context=await browser.newContext({viewport:{width,height},javaScriptEnabled:js,reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(js)await page.addInitScript(()=>{localStorage.setItem('baagh.basket.v1',JSON.stringify({version:1,lines:[{productId:'chaunsa',packId:'2kg',quantity:2}]}));window.__writes=[];const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){window.__writes.push(k);return original.call(this,k,v);};});
 let release;const gate=new Promise(r=>release=r);
 if(js)await page.route('**/*.js',async r=>{await gate;await r.continue();});
 await page.goto(origin+route,{waitUntil:'commit'});await page.locator('h1').waitFor();await page.locator('link[href^="/assets/"]').waitFor({state:'attached'});await page.waitForTimeout(1000);await page.evaluate(()=>document.fonts.ready);
 if(js)await page.evaluate(()=>{window.__page=document.querySelector('.responsive-commercial');window.__root=document.getElementById('root');window.__child=window.__root.firstChild;window.__h1=document.querySelector('h1');});
 const before=await measure(page);
 if(!js){item.noJS=before;await page.screenshot({path:`${out}/${route.slice(1)}-${width}-nojs.png`,fullPage:true,timeout:60000});}
 else{item.before=before;release();await page.waitForTimeout(2000);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));item.after=await measure(page);item.identity=await page.evaluate(()=>({page:window.__page===document.querySelector('.responsive-commercial'),h1:window.__h1===document.querySelector('h1'),child:window.__child===document.getElementById('root').firstChild,recoverable:window.__baaghHydrationErrors??[],root:window.__root===document.getElementById('root'),writes:window.__writes,saved:JSON.parse(localStorage.getItem('baagh.basket.v1'))}));}
 await context.close();
 }
 item.errors=errors;item.pass=!item.noJS.overflow&&!item.after.overflow&&item.identity.root&&item.identity.writes.length===0&&item.identity.saved.lines[0].quantity===2&&item.identity.page&&item.identity.h1&&item.identity.child&&!item.identity.recoverable.length&&!errors.length&&item.noJS.padding===item.after.padding&&Math.abs(item.noJS.h1.y-item.after.h1.y)<1;
 results.push(item);await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(route,width,item.pass,item.errors);
}}finally{await browser.close();await new Promise(r=>server.close(r));}
if(results.some(r=>!r.pass))process.exitCode=1;
