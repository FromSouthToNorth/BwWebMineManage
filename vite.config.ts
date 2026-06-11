import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { injectSsoSdk } from './vite-plugin/injectSsoSdk'
import { generateVersionJson } from './vite-plugin/generateVersionJson'



export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/WebMineManage',

    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/types/auto-imports.d.ts',
      }),
      injectSsoSdk(),
      generateVersionJson(),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    server: {
      host: '0.0.0.0',
      port: 8080,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
        },
        '/DigitizingMine': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
        },
        '/cas': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
        },
        '/bwmes-boot': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
        },
        '/bwPublic': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
        },
      },
    },

    build: {
      outDir: 'dist/WebMineManage',
      assetsDir: 'static',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'chunk-libs': ['vue', 'vue-router', 'pinia'],
            'chunk-element-plus': ['element-plus'],
            'chunk-vant': ['vant'],
            'chunk-echarts': ['echarts', 'vue-echarts'],
          },
        },
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  }
})
