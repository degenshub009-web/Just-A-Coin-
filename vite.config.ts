import { defineConfig, loadEnv, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

const MSK_STATS_URL = 'https://api.msktechnology.com.au/stats'
/** Must match MSK API rate limit (1 request per minute). */
const MSK_API_CACHE_MS = 60_000

type MskCacheEntry = { time: number; status: number; body: string }

function mskStatsApiPlugin(apiKey: string): Plugin {
  let cache: MskCacheEntry | null = null

  const serveStats = async (_req: IncomingMessage, res: ServerResponse) => {
    const now = Date.now()

    if (cache && now - cache.time < MSK_API_CACHE_MS) {
      res.statusCode = cache.status
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(MSK_API_CACHE_MS / 1000)}`)
      res.setHeader('X-MSK-Cache', 'HIT')
      res.end(cache.body)
      return
    }

    if (!apiKey) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'MSK_API_KEY is not configured in .env' }))
      return
    }

    try {
      const response = await fetch(MSK_STATS_URL, {
        headers: { 'x-api-key': apiKey },
      })
      const body = await response.text()
      cache = { time: now, status: response.status, body }
      res.statusCode = response.status
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(MSK_API_CACHE_MS / 1000)}`)
      res.setHeader('X-MSK-Cache', 'MISS')
      res.end(body)
    } catch (error) {
      console.error('[msk-stats-api] fetch failed:', error)
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Failed to reach MSK API' }))
    }
  }

  const mount = (middlewares: { use: (path: string, handler: typeof serveStats) => void }) => {
    middlewares.use('/api/stats', serveStats)
  }

  return {
    name: 'msk-stats-api',
    configureServer(server) {
      mount(server.middlewares)
    },
    configurePreviewServer(server) {
      mount(server.middlewares)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [mskStatsApiPlugin(env.MSK_API_KEY || '')],
  }
})
