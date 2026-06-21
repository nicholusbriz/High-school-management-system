import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role-based route protection
const protectedRoutes = {
  '/dashboard': ['admin', 'department_head'],
  '/users': ['admin', 'department_head'],
  '/courses': ['admin', 'department_head', 'teacher'],
  '/classes': ['admin', 'department_head', 'teacher'],
  '/reports': ['admin', 'department_head'],
  '/settings': ['admin', 'department_head', 'teacher', 'student', 'parent'],
  '/attendance': ['admin', 'department_head', 'teacher'],
  '/grades': ['admin', 'department_head', 'teacher', 'student'],
  '/assignments': ['admin', 'department_head', 'teacher', 'student'],
  '/welcome': ['admin', 'department_head', 'teacher', 'student', 'parent'],
  '/teacher/dashboard': ['teacher'],
  '/teacher/classes': ['teacher'],
  '/student/dashboard': ['student'],
  '/student/classes': ['student'],
  '/parent/dashboard': ['parent'],
  '/department-head/dashboard': ['department_head'],
};

// Role-based redirects
const roleRedirects: Record<string, string> = {
  admin: '/dashboard',
  department_head: '/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Allow public routes
  if (pathname === '/' || pathname === '/login') {
    // If user is already logged in, redirect to their dashboard
    if (token) {
      // In a real app, you'd decode the token to get the role
      // For now, redirect to welcome page
      return NextResponse.redirect(new URL('/welcome', request.url));
    }
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/', request.url));
    }

    // In a real app, you'd decode the JWT token to get the user's role
    // and check if they have access to the route
    // For now, we'll allow all authenticated users
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
