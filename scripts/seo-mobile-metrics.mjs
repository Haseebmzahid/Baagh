import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4183'],{stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes('4183'))resolve()});server.on('error',reject)});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const results=[];
for(const path of ['/','/everyday-fresh','/signature','/product/mangoes/chaunsa','/fruit-intelligence/apple','/our-story']){
 const page=await browser.newPage({viewport:{width:375,height:812},isMobile:true,deviceScaleFactor:2});
 await page.addInitScript(()=>{window.__seoVitals={lcp:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__seoVitals.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__seoVitals.cls+=e.value}).observe({type:'layout-shift',buffered:true});});
 await page.goto('http://127.0.0.1:4183'+path,{waitUntil:'load'});await page.waitForTimeout(3500);
 results.push({path,...await page.evaluate(()=>({...window.__seoVitals,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,ttfb:performance.getEntriesByType('navigation')[0]?.responseStart,notes:'Single local unthrottled mobile viewport; software WebGL; not field Core Web Vitals. INP not measured.'}))});await page.close();
}
await writeFile('docs/verification/seo/mobile-lab-metrics.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();server.kill();
