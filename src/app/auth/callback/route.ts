import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Use the request URL's origin to build the redirect URL
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Fallback to home if something goes wrong
  return NextResponse.redirect(new URL("/", request.url));
}
