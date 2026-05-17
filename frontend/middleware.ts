import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sis-token')?.value;
  const role = request.cookies.get('sis-role')?.value;
  const { pathname } = request.nextUrl;

  // 1. If trying to access login and already has token, redirect to dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL(`/${role?.toLowerCase()}`, request.url));
  }

  // 2. Protect dashboard routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/instructor') || pathname.startsWith('/ta') || pathname.startsWith('/student')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based protection
    if (pathname.startsWith('/admin') && role !== 'Admin') {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith('/instructor') && role !== 'Instructor') {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith('/ta') && role !== 'TA') {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith('/student') && role !== 'Student') {
      return NextResponse.redirect(new URL(`/${role?.toLowerCase()}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/ta/:path*',
    '/student/:path*',
    '/login',
  ],
};
