import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const session = getSessionCookie(request, { cookiePrefix: "shiksha" });

  if (!session) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*"],
};


const PUBLIC_ROUTES = new Set([
  "/",
  "/guide",
  "/changelog",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-policy",
  "/time-blog",
  "/founder",
  "/why-shiksha",
  "/why-us",
  "/support",
]);

const PUBLIC_PREFIXES = [
  "/blogs",
  "/pricing",
  "/industries",
  "/about",
  "/contact",
  "/features",
  "/sign-in",
  "/sign-up",
  "/select-organization",
  "/accept-invitation",
  "/api/webhooks/",
  "/api/auth/", // BetterAuth API routes — must be public
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/verify/certificate",
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

// Detect if request is from a search engine crawler
function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const crawlers = [
    "googlebot", "bingbot", "slurp", "duckduckbot",
    "baiduspider", "yandexbot", "sogou", "exabot",
    "facebot", "ia_archiver",
  ];
  const ua = userAgent.toLowerCase();
  return crawlers.some((crawler) => ua.includes(crawler));
}
