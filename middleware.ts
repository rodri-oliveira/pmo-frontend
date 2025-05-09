// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
//     return NextResponse.next();
//   }

//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//   if (!token) {
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('callbackUrl', pathname); 
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|images|login).*)',
//   ],
// };

// Deixe o arquivo assim por enquanto para desativar o middleware:
export default function middleware() {}
export const config = { matcher: [] };
