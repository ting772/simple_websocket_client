import { fileURLToPath, URL } from 'node:url'
import { extname } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

let imageReg = /jpg|png|jpeg/i
let cssReg = /css/i
let mediaReg = /ogg/i

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      include: [
        /\.(t|js)s$/,
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      "dts": true,
      // global imports to register
      imports: [
        'vue',
        "vue-router"
      ],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      include: [
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      "dts": true,
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@imgs': fileURLToPath(new URL('./src/assets/imgs/', import.meta.url)),
    },
    extensions: [
      ".vue",
      ".ts",
      ".js",
      ".json"
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: function manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return null;
        },
        assetFileNames(assetInfo) {
          let name = assetInfo.names[0]
          let ext = extname(name)
          let dir = ''
          if (imageReg.test(ext)) {
            dir = 'imgs/'
          } else if (cssReg.test(ext)) {
            dir = 'css/'
          } else if (mediaReg.test(ext)) {
            dir = 'media/'
          }
          return `assets/${dir}[name]-[hash][extname]`
        }
      }
    },
  }
})
