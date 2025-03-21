'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../types/user';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication check is complete and user is not logged in, redirect to login
    if (!loading && !isLoggedIn) {
      router.push('/login');
      return;
    }

    // If a specific permission is required, check if user has it
    if (!loading && isLoggedIn && requiredPermission) {
      if (!hasPermission(user, requiredPermission)) {
        // Redirect to home if user doesn't have required permission
        router.push('/');
      }
    }
  }, [loading, isLoggedIn, router, user, requiredPermission]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not logged in or doesn't have permission, show nothing (will redirect)
  if (!isLoggedIn || (requiredPermission && !hasPermission(user, requiredPermission))) {
    return null;
  }

  // If logged in and has permission (or no permission required), show the children
  return <>{children}</>;
} 