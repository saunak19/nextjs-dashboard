import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    console.log(`Middleware running for path: ${pathname}`);

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isLoggedIn = !!token;
    const userRole = token?.role as 'user' | 'admin' | 'superadmin' | undefined;

    if (pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/dashboard')) {
        if (!isLoggedIn) {
            console.log('User not logged in. Redirecting to /login');
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/products')) {
            if (userRole !== 'admin' && userRole !== 'superadmin') {
                return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
            }
        }

        if (pathname.startsWith('/dashboard/superadmin')) {
            if (userRole !== 'superadmin') {
                return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
            }
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};