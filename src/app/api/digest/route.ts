import { NextResponse } from 'next/server'
import { sendDailyDigestEmails } from '@/workers/digest-sender'

export async function POST() {
  try {
    await sendDailyDigestEmails()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Digest error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
