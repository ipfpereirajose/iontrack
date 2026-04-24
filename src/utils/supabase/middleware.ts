import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect routes and redirect based on role
  const path = request.nextUrl.pathname;

  if (user) {
    // If user is logged in, check role and redirect from logins
    // Use a standard client (not SSR) to avoid cookie configuration requirements for this admin check
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (path.includes('/login')) {
      if (profile?.role === 'superadmin') return NextResponse.redirect(new URL('/admin', request.url));
      if (['lab_admin', 'lab_tech'].includes(profile?.role)) return NextResponse.redirect(new URL('/lab', request.url));
      if (['company_manager', 'toe'].includes(profile?.role)) return NextResponse.redirect(new URL('/portal', request.url));
    }

    // Role-based path protection
    if (path.startsWith('/admin') && profile?.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (path.startsWith('/lab') && !['lab_admin', 'lab_tech', 'superadmin'].includes(profile?.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (path.startsWith('/portal') && !['company_manager', 'toe', 'superadmin'].includes(profile?.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // If not logged in and trying to access protected routes
    if (path.startsWith('/admin') && !path.includes('/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (path.startsWith('/lab') && !path.includes('/login')) {
      return NextResponse.redirect(new URL('/lab/login', request.url));
    }
    if (path.startsWith('/portal') && !path.includes('/login')) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  return response;
}
