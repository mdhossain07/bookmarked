import React, { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that handles authentication-based routing
 *
 * @param children - The component(s) to render if access is allowed
 * @param redirectTo - Where to redirect if access is denied (default: '/login')
 * @param requireAuth - Whether authentication is required (default: true)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading, checkAuthentication } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Check authentication when component mounts (only for protected routes)
  useEffect(() => {
    const performAuthCheck = async () => {
      if (requireAuth && !authChecked && !isCheckingAuth) {
        setIsCheckingAuth(true);
        await checkAuthentication();
        setAuthChecked(true);
        setIsCheckingAuth(false);
      } else if (!requireAuth) {
        // For public routes, mark as checked without API call
        setAuthChecked(true);
      }
    };

    performAuthCheck();
  }, [requireAuth, authChecked, isCheckingAuth, checkAuthentication]);

  // Show loading state while checking authentication
  if (isLoading || (requireAuth && (!authChecked || isCheckingAuth))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated
  // (useful for login/register pages)
  if (!requireAuth && isAuthenticated) {
    // Get the intended destination from state, or default to dashboard
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
};

/**
 * Higher-order component version of ProtectedRoute
 */
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, "children">
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

/**
 * Component for routes that should only be accessible to unauthenticated users
 * (like login and register pages)
 */
export const PublicOnlyRoute: React.FC<{
  children: ReactNode;
  redirectTo?: string;
}> = ({ children, redirectTo = "/dashboard" }) => {
  return (
    <ProtectedRoute requireAuth={false} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
