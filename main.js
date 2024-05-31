import { createApp } from 'vue'
import router from './router.js'
import store from './store.js'

// import { init, compress, decompress } from '@bokuweb/zstd-wasm';
import { zlibSync, unzlibSync, gzipSync, gunzipSync, deflateSync, inflateSync } from 'fflate';
import brotliPromise from 'brotli-wasm'; // Import the default export
const brotli = await brotliPromise; // Import is async in browsers due to wasm requirements!

// const brotli = await import("https://unpkg.com/brotli-wasm@3.0.0/index.web.js?module").then(m => m.default);

import { Base64 } from 'js-base64';

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

  const compressedStr = compressForUrl(toCompressStr);
  console.log('compressed (url)', compressedStr.length, compressedStr);
  decompressedStr = decompressFromUrl(compressedStr);
  console.log('decompressed (url)', decompressedStr.length /*, decompressedStr*/);
  console.assert(decompressedStr === toCompressStr, 'URL not equal');

  // Results:
  // GZIP    401
  // ZLIB    389
  // DEFLATE 383
  // BROTLI  348 bytes
})();

function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
  // return Base64.toUint8Array(base64); // both ways work, at least for small strings
}

function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
  // return Base64.fromUint8Array(bytes); // both ways work, at least for small strings
}

function compressForUrl(s, /*for testing*/ brotliPenalty) {
  brotliPenalty = brotliPenalty || 0;
  const toCompress = (typeof s === 'string') ? new TextEncoder().encode(s) : s;
  console.assert(toCompress instanceof Uint8Array, 'string or Uint8Array expected!');

  const compressedDeflate = deflateSync(toCompress, { level: 9 });
  const compressedBrotli = brotli.compress(toCompress, { quality: 11 });

  let compressedEncoded;
  if (compressedDeflate.byteLength < compressedBrotli.byteLength + brotliPenalty) {
    console.log(compressedDeflate.byteLength, 'Deflate bytes');
    compressedEncoded = 'D' + bytesToBase64(compressedDeflate); // unexpected, for most input strings
  } else {
    console.log(compressedBrotli.byteLength, 'Brotli bytes');
    compressedEncoded = 'B' + bytesToBase64(compressedBrotli); // expected
  }
  // base64 -> base64url
  compressedEncoded = compressedEncoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return compressedEncoded;
}

function decompressFromUrl(s, asString) {
  const deflate = s.startsWith('D');
  s = s.substring(1);

  const base64Encoded = s.replace(/-/g, '+').replace(/_/g, '/');
  const padding = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const base64WithPadding = base64Encoded + padding;

  const compressed = base64ToBytes(base64WithPadding);
  console.log(compressed.byteLength, deflate ? 'Deflate' : 'Brotli', 'bytes to decompress');
  const decompressed = deflate ? inflateSync(compressed) : brotli.decompress(compressed);

  return asString === false ? decompressed : new TextDecoder().decode(decompressed);
}
