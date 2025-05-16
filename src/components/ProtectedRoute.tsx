import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from '../lib/supabase';

type ProtectedRouteProps = {
  user: User | null;
  children: ReactNode;
};

function ProtectedRoute({ user, children }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;