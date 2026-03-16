import { Resend } from 'resend'

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface LeadForDigest {
  title: string
  subreddit: string
  intentScore: number
  painSummary: string
  url: string
}

export async function sendDailyDigest(
  email: string,
  leads: LeadForDigest[]
) {
  const topLeads = leads.slice(0, 10)

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">🔥 Today's Top Intent Signals</h1>
      <p style="color: #666;">Here are the highest intent posts from your watchlists:</p>
      
      ${topLeads
        .map(
          (lead, i) => `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid ${
          lead.intentScore >= 8 ? '#22c55e' : lead.intentScore >= 5 ? '#eab308' : '#6b7280'
        };">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="background: ${
              lead.intentScore >= 8 ? '#dcfce7' : lead.intentScore >= 5 ? '#fef9c3' : '#f3f4f6'
            }; color: ${
              lead.intentScore >= 8 ? '#16a34a' : lead.intentScore >= 5 ? '#ca8a04' : '#4b5563'
            }; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
              Score: ${lead.intentScore}
            </span>
            <span style="color: #666; font-size: 12px;">r/${lead.subreddit}</span>
          </div>
          <h3 style="margin: 8px 0; color: #1a1a1a;">${lead.title}</h3>
          <p style="color: #666; font-size: 14px; margin: 0;">${lead.painSummary}</p>
          <a href="${lead.url}" style="display: inline-block; margin-top: 12px; color: #2563eb; text-decoration: none;">View Post →</a>
        </div>
      `
        )
        .join('')}
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">
        Sent by <a href="https://intentradar.com" style="color: #2563eb;">IntentRadar</a> — AI Buyer Intent Detection
      </p>
    </div>
  `

  try {
    await getResend().emails.send({
      from: 'IntentRadar <digest@intentradar.com>',
      to: email,
      subject: `🔥 ${topLeads.length} High-Intent Leads Today`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send digest:', error)
    return { success: false, error }
  }
}
