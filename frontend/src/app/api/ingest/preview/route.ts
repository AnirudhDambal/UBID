import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db_type, field_mappings } = body

    // Mock preview data with normalisation and FPE
    const mockPreviewRows = [
      {
        business_name: 'Rajesh Sharma Industries',
        pan_encrypted: '••••••••K',
        pincode: '560001',
      },
      {
        business_name: 'Tech Solutions Pvt Ltd',
        pan_encrypted: '••••••••F',
        pincode: '400001',
      },
      {
        business_name: 'Green Packaging Company',
        pan_encrypted: '••••••••M',
        pincode: '560034',
      },
    ]

    return NextResponse.json({
      success: true,
      preview_rows: mockPreviewRows,
      row_count: mockPreviewRows.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Preview failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
