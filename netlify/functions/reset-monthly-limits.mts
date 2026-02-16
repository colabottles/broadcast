import type { Config } from '@netlify/functions'

export default async (req: Request) => {
  const cronSecret = process.env.CRON_SECRET
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://brdcst.netlify.app'

  try {
    const response = await fetch(`${siteUrl}/api/cron/reset-monthly-limits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export const config: Config = {
  schedule: '0 0 1 * *' // Run at midnight UTC on the 1st of every month
}