import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { AppRole, CLERK_ROLE_MAP, getRequiredRoles, isAllowed, ROLE_HOMEPAGE } from './lib/rbac';

// Make sure that the `/api/webhooks/(.*)` route is not protected here
// Never change this proxy.ts to middleware.ts its nextjs 16 framework
const isPublicRoute = createRouteMatcher([
  '/',
  '/guide',
  '/changelog',
  '/privacy-policy',
  '/terms-and-conditions',
  '/refund-policy',
  '/blogs(.*)',
  '/time-blog',
  '/pricing(.*)',
  '/industries(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/features(.*)',
  '/founder',
  '/why-shiksha',
  '/why-us',
  '/support',
  '/select-organization(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
  '/api/(.*)',
  '/robots.txt(.*)',
  '/sitemap.xml',
  '/favicon.ico',
]);

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

// Detect if request is from a search engine crawler
function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;

  const crawlers = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'sogou',
    'exabot',
    'facebot',
    'ia_archiver',
  ];

  const ua = userAgent.toLowerCase();
  return crawlers.some((crawler) => ua.includes(crawler));
}
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get('user-agent');

  // Set the pathname in headers so it's accessible in server components like not-found.tsx
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  // CRITICAL: Allow all crawlers on public routes WITHOUT any auth checks
  if (isPublicRoute(req)) {
    // If it's a crawler, skip ALL Clerk processing
    if (isCrawler(userAgent)) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    // For regular users, also skip auth on public routes
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const { userId, orgId, orgRole } = await auth();

  // If user is authenticated but has no organization and trying to access protected routes
  // middleware.ts
  if (userId && !orgId && isProtectedRoute(req)) {
    const pathname = req.nextUrl.pathname;

    // Prevent redirect loop
    if (pathname.startsWith('/select-organization')) {
      return NextResponse.next();
    }

    const selectOrgUrl = new URL('/select-organization', req.url);
    selectOrgUrl.searchParams.set('returnUrl', req.url);
    return NextResponse.redirect(selectOrgUrl);
  }

  // Map Clerk role → AppRole (fallback: student — safest default)
  const role: AppRole = CLERK_ROLE_MAP[orgRole ?? ''] ?? 'student';

  // Check permission from rbac.ts config
  const requiredRoles = getRequiredRoles(pathname);

  if (requiredRoles !== null && !isAllowed(role, requiredRoles)) {
    // Send them to their own homepage, not a generic error
    return NextResponse.redirect(new URL(ROLE_HOMEPAGE[role], req.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    // Standard Clerk v6 matcher — skips static files and Next internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
