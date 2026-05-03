import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db_type } = body

    // Simulate pipeline execution
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return NextResponse.json({
      success: true,
      auto_merged: Math.floor(Math.random() * 50) + 30,
      queued: Math.floor(Math.random() * 30) + 15,
      new_ubids: Math.floor(Math.random() * 100) + 80,
      duration: 3245,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Pipeline failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
