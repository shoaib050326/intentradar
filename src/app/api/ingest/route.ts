import { NextResponse } from 'next/server'
import { ingestAndScore } from '@/workers/ingestor'

export async function POST() {
  try {
    await ingestAndScore()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ingestion error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
