import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle audio files with proper Range support
  if (request.nextUrl.pathname.startsWith('/sounds/')) {
    const response = NextResponse.next()
    
    // Set proper headers for audio files
    response.headers.set('Accept-Ranges', 'bytes')
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    
    // Set content type based on file extension
    if (request.nextUrl.pathname.endsWith('.mp3')) {
      response.headers.set('Content-Type', 'audio/mpeg')
    } else if (request.nextUrl.pathname.endsWith('.m4a')) {
      response.headers.set('Content-Type', 'audio/mp4')
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/sounds/:path*',
}