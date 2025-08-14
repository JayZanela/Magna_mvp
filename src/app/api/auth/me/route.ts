import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    )
  }
})