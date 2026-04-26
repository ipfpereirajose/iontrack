import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware entirely for static assets — these never need auth
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/downloads") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — single lightweight JWT decode, no DB call
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Route protection (no DB call needed, just check if session exists) ---

  const isProtectedAdmin =
    path.startsWith("/admin") && !path.includes("/login");
  const isProtectedLab = path.startsWith("/lab") && !path.includes("/login");
  const isProtectedPortal =
    path.startsWith("/portal") && !path.includes("/login");

  if (!user) {
    // Not logged in → redirect to the corresponding login
    if (isProtectedAdmin)
      return NextResponse.redirect(new URL("/admin/login", request.url));
    if (isProtectedLab)
      return NextResponse.redirect(new URL("/lab/login", request.url));
    if (isProtectedPortal)
      return NextResponse.redirect(new URL("/portal/login", request.url));
    return response;
  }

  // Logged in → redirect away from login pages
  // Role check is intentionally moved to individual layouts (no DB call in middleware)
  if (path.endsWith("/login")) {
    // Check cookie-based role hint set at login time (no DB needed)
    const roleHint = request.cookies.get("iontrack_role")?.value;
    if (roleHint === "superadmin")
      return NextResponse.redirect(new URL("/admin", request.url));
    if (roleHint === "lab_admin" || roleHint === "lab_tech")
      return NextResponse.redirect(new URL("/lab", request.url));
    if (roleHint === "company_manager" || roleHint === "toe")
      return NextResponse.redirect(new URL("/portal", request.url));
    // No hint? Just let them through, the page will redirect
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
