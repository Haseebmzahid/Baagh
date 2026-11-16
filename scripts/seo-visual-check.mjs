import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4180'],{stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes('4180'))resolve()});server.on('error',reject)});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const results=[];
for(const width of [1440,375]) {
 const page=await browser.newPage({viewport:{width,height:width===375?812:900},reducedMotion:'reduce'});
 for(const [name,path] of [['shop','/everyday-fresh'],['signature','/signature'],['product','/product/mangoes/chaunsa'],['about','/our-story']]){
 await page.goto('http://127.0.0.1:4180'+path);await page.locator('h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
 const prefix=`docs/verification/seo/${process.argv[2]||'before'}-${name}-${width}`;
 await page.screenshot({path:prefix+'.png',animations:'disabled'});
 results.push({name,width,html:await page.locator('body').innerText(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }await page.close();
}await writeFile(`docs/verification/seo/${process.argv[2]||'before'}-visual.json`,JSON.stringify(results,null,2));await browser.close();server.kill();
