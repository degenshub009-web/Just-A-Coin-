export const config = {
  runtime: 'edge',
}

/** MSK API allows 1 request per minute — CDN cache must not go below this. */
const CACHE_SECONDS = 60

export default async function handler(_req: Request) {
  try {
    const apiKey = process.env.MSK_API_KEY || ''
    const response = await fetch('https://api.msktechnology.com.au/stats', {
      headers: {
        'x-api-key': apiKey,
      },
    })

    const body = await response.text()

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
