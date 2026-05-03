import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    server: {
      proxy: {
        '/api/stats': {
          target: 'https://api.msktechnology.com.au/stats',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/stats/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (env.MSK_API_KEY) {
                proxyReq.setHeader('x-api-key', env.MSK_API_KEY)
              }
            })
          }
        }
      }
    }
  }
})
