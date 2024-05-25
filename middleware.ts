import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from "@/util/supabase/middleware";

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;

    // Only apply this middleware to /api routes
    if (url.pathname.startsWith('/api')) {
        const token = request.headers.get('x-secret');

        if (token !== process.env.SECRET) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }
    }

    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.svg|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
