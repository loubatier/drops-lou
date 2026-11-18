import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/cookie";

export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_NAME)) return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/drops", "/drops/:path*"],
};
