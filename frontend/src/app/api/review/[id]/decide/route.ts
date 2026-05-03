import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, reason } = body

    // Validate input
    if (!action || !['approve', 'reject', 'defer', 'request-data'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Mock: Record decision (in a real app, this would update the database)
    console.log(`Review task ${id}: ${action} - Reason: ${reason}`)

    return NextResponse.json({
      success: true,
      taskId: id,
      action,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record decision: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
