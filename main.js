import { createApp } from 'vue'
import router from './router.js'
import store from './store.js'

// import { init, compress, decompress } from '@bokuweb/zstd-wasm';
import { zlibSync, unzlibSync, gzipSync, gunzipSync, deflateSync, inflateSync } from 'fflate';
import brotliPromise from 'brotli-wasm'; // Import the default export
const brotli = await brotliPromise; // Import is async in browsers due to wasm requirements!

// const brotli = await import("https://unpkg.com/brotli-wasm@3.0.0/index.web.js?module").then(m => m.default);

export const vue = createApp({
  template: /*html*/`<router-view />`
})

vue.use(store)
vue.use(router)

if (document.getElementById('app')) {
  vue.mount('#app')
}

// (async () => {
//   await init('./zstd.wasm');
//   const toCompressStr = 'Hello zstd!!';
//   console.log('toCompressStr', toCompressStr);
//   const toCompress = new TextEncoder().encode(toCompressStr);
//   console.log('toCompress', toCompress);
//   const compressed = compress(toCompress, 10);
//   console.log('compressed', compressed);
//   const decompressed = decompress(compressed);
//   console.log('decompressed', decompressed);
//   console.log('decompressedStr', new TextDecoder().decode(decompressed));
// })();


(async () => {
  const toCompressStr = `import { createApp } from 'vue'
import router from './router.js'
import store from './store.js'

// import { init, compress, decompress } from '@bokuweb/zstd-wasm';
import { zlibSync, unzlibSync, gzipSync, gunzipSync, deflateSync, inflateSync } from 'fflate';

export const vue = createApp({
  template: /*html*/'<router-view />'
})

vue.use(store)
vue.use(router)

if (document.getElementById('app')) {
  vue.mount('#app')
}

import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const App = defineAsyncComponent(() => import('./component-app.js'))

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/',
    components: {
      default: App,
    },
  }]
})

export default router`;
  // console.log('toCompressStr', toCompressStr.length);

  const toCompress = new TextEncoder().encode(toCompressStr);
  console.log('toCompress', toCompress.byteLength, toCompress);
  let compressed = zlibSync(toCompress, { level: 9 });
  console.log('compressed ZLIB', compressed.byteLength, compressed);
  let decompressed = unzlibSync(compressed);
  console.log('decompressed', decompressed);
  let decompressedStr = new TextDecoder().decode(decompressed);
  // console.log('decompressedStr', decompressedStr);
  console.assert(decompressedStr === toCompressStr, 'ZLIB not equal');

  compressed = gzipSync(toCompress, { level: 9 });
  console.log('compressed GZIP', compressed.byteLength, compressed);
  decompressed = gunzipSync(compressed);
  console.log('decompressed', decompressed);
  decompressedStr = new TextDecoder().decode(decompressed);
  // console.log('decompressedStr', decompressedStr);
  console.assert(decompressedStr === toCompressStr, 'GZIP not equal');

  compressed = deflateSync(toCompress, { level: 9 });
  console.log('compressed DEFLATE', compressed.byteLength, compressed);
  decompressed = inflateSync(compressed);
  console.log('decompressed', decompressed);
  decompressedStr = new TextDecoder().decode(decompressed);
  // console.log('decompressedStr', decompressedStr);
  console.assert(decompressedStr === toCompressStr, 'DEFLATE not equal');

  // Decompresses to string instead of Uint8Array?!
  // compressed = new Uint8Array(LZMA.compress(toCompress, 9));
  // console.log('compressed LZMA', compressed.byteLength, compressed);
  // decompressed = LZMA.decompress(compressed);
  // console.log('decompressed', decompressed);
  // decompressedStr = new TextDecoder().decode(decompressed);
  // // console.log('decompressedStr', decompressedStr);
  // console.assert(decompressedStr === toCompressStr, 'LZMA not equal');

  compressed = brotli.compress(toCompress, { quality: 11 });
  console.log('compressed BROTLI', compressed.byteLength, compressed);
  decompressed = brotli.decompress(compressed);
  console.log('decompressed', decompressed);
  decompressedStr = new TextDecoder().decode(decompressed);
  // console.log('decompressedStr', decompressedStr);
  console.assert(decompressedStr === toCompressStr, 'BROTLI not equal');

  // Results:
  // GZIP    401
  // ZLIB    389
  // DEFLATE 383
  // BROTLI  348 bytes
})();
