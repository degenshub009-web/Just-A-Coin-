export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  try {
    const apiKey = process.env.MSK_API_KEY || ''
    const response = await fetch('https://api.msktechnology.com.au/stats', {
      headers: {
        'x-api-key': apiKey,
      },
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch from MSK API' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=180, stale-while-revalidate=59',
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
