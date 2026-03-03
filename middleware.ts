import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BLOCKED_PATHS = [
  "/api/auth/",
  "/api/payment/",
  "/api/portfolio",
  "/api/analytics/",
  "/api/admin/",
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  for (const blocked of BLOCKED_PATHS) {
    if (path.startsWith(blocked) || path === blocked) {
      return new NextResponse(null, { status: 404 });
    }
  }

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://checkout.razorpay.com; frame-src https://api.razorpay.com;"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
