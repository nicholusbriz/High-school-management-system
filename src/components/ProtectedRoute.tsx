'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser, getRoleRedirect, getProtectedRoutes, hasRouteAccess } from '@/lib/routing';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await fetchCurrentUser();
        
        if (error || !user) {
          router.push('/');
          return;
        }

        const userRole = user.role?.name?.toLowerCase();

        if (!userRole) {
          router.push('/');
          return;
        }

        // Check if user has access to current route
        const protectedRoutes = getProtectedRoutes();
        const pathname = window.location.pathname;
        
        if (!hasRouteAccess(userRole, pathname, protectedRoutes)) {
          // Redirect to appropriate dashboard based on role
          const redirectPath = getRoleRedirect(userRole);
          router.push(redirectPath);
          return;
        }

        // Check if user has specific allowed roles for this component
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          const redirectPath = getRoleRedirect(userRole);
          router.push(redirectPath);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.push('/');
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
