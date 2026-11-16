import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:375,height:812},isMobile:true});
const results=[];
for(const path of ['/','/everyday-fresh','/signature','/product/mangoes/chaunsa','/product/citrus/kinnow','/product/apples/apple','/product/seasonal/anaar',...['chaunsa','kinnow','apple','anaar'].map(f=>'/fruit-intelligence/'+f),'/our-story','/contact','/privacy-policy','/cookies','/terms','/delivery','/returns','/help','/robots.txt','/sitemap.xml','/not-a-real-route']) {
 const errors=[]; const listener=e=>errors.push(e.message);page.on('pageerror',listener);
 try {const r=await page.goto('https://baagh.vercel.app'+path,{waitUntil:'domcontentloaded',timeout:30000});const html=await r.text(); await page.waitForTimeout(1200);
 results.push({path,status:r.status(),contentType:r.headers()['content-type'],xRobotsTag:r.headers()['x-robots-tag']??null,initialTitle:html.match(/<title>(.*?)<\/title>/s)?.[1],emptyRoot:/<div id="root"><\/div>/.test(html),initialDescription:/name="description"/.test(html),initialCanonical:/rel="canonical"/.test(html),initialSocial:/property="og:/.test(html),initialSchema:/application\/ld\+json/.test(html),renderedTitle:await page.title(),text:(await page.locator('body').innerText()).slice(0,350),errors});
 if(path==='/everyday-fresh')await page.screenshot({path:'docs/verification/seo/production-before.png'});
 }catch(e){results.push({path,error:e.message});}page.off('pageerror',listener);
}
await writeFile('docs/verification/seo/production-audit.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({path,status,emptyRoot,initialCanonical,error})=>({path,status,emptyRoot,initialCanonical,error})),null,2));await browser.close();
