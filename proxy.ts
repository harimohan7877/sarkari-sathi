import { NextRequest, NextResponse } from 'next/server';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  // Protected routes — redirect to auth if no session cookie
  const protectedPaths = ['/dashboard', '/payment'];
  const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (isProtected) {
    // Check for Supabase auth cookie
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    
    const authCookie = req.cookies.get('sb-access-token') || 
                       req.cookies.get(`sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`);
    
    // If no auth cookie found, redirect to /auth
    if (!authCookie && !Array.from(req.cookies.getAll()).some(c => c.name.includes('sb-') && c.name.includes('auth'))) {
      const redirectUrl = new URL('/auth', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/payment/:path*']
};
