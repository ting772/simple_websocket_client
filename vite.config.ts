import { fileURLToPath, URL } from 'node:url'
import { extname } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import electron from 'vite-plugin-electron/simple'

let imageReg = /jpg|png|jpeg/i
let cssReg = /css/i

let mediaReg = /ogg/i

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, './')
  return {
    plugins: [
      vue(),
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
    ].concat(
      process.env.APP_TYPE == 'ELECTRON' ?
        [
          electron({
            main: {
              // Shortcut of `build.lib.entry`
              entry: 'electron/main.ts',
            },
            preload: {
              // Shortcut of `build.rollupOptions.input`
              input: 'electron/preload.ts',
            },
            // Optional: Use Node.js API in the Renderer process
            renderer: {},
          })
        ] :
        [
          vueDevTools(),
        ]
    ),
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
      //@ts-ignore
      outDir: env.VITE_WEB_BUILD_DIST,
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
      // minify: false
    }
  }
})
