if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,l)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let o={};const u=e=>i(e,r),a={module:{uri:r},exports:o,require:u};s[r]=Promise.all(n.map((e=>a[e]||u(e)))).then((e=>(l(...e),o)))}}define(["./workbox-157fe50b"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"apple-touch-icon.png",revision:"26e53bb981d06c8069ffd9d2a14fce0e"},{url:"assets/@fontsource.f66d05e7.css",revision:null},{url:"assets/@vue.6f8187b0.js",revision:null},{url:"assets/gameLoop.e4f6da08.js",revision:null},{url:"assets/index.11ff2253.js",revision:null},{url:"assets/index.bb01d78a.css",revision:null},{url:"assets/lz-string.bfbf8ec3.js",revision:null},{url:"assets/nanoevents.1080beb7.js",revision:null},{url:"assets/sortablejs.1710774d.js",revision:null},{url:"assets/unofficial-galaxy-sdk.21372393.js",revision:null},{url:"assets/vue-next-select.61e76cb4.js",revision:null},{url:"assets/vue-next-select.9e6f4164.css",revision:null},{url:"assets/vue-textarea-autosize.35804eaf.js",revision:null},{url:"assets/vue-toastification.1a6e2f15.js",revision:null},{url:"assets/vue-toastification.4b5f8ac8.css",revision:null},{url:"assets/vue.dd1aac1f.js",revision:null},{url:"assets/vuedraggable.9e421876.js",revision:null},{url:"assets/workbox-window.4a8794bb.js",revision:null},{url:"favicon.ico",revision:"17ca81220ce659a68edf54973007d245"},{url:"favicon.svg",revision:"e7fbc1de2ee954d535deb05379a505de"},{url:"index.html",revision:"3c2c6d285d1936de2b64d24b8421e342"},{url:"pwa-192x192.png",revision:"a16785d9e890858c5b508e0ef6954aaf"},{url:"pwa-512x512.png",revision:"b84004b93fd62ef6599ff179372861a1"},{url:"favicon.ico",revision:"17ca81220ce659a68edf54973007d245"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"apple-touch-icon.png",revision:"26e53bb981d06c8069ffd9d2a14fce0e"},{url:"pwa-192x192.png",revision:"a16785d9e890858c5b508e0ef6954aaf"},{url:"pwa-512x512.png",revision:"b84004b93fd62ef6599ff179372861a1"},{url:"manifest.webmanifest",revision:"374c797507c3d3cb356898edf6b772a3"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
