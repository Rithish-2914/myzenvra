import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, userProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
          <p className="text-sm text-muted-foreground mt-2">Current role: {userProfile?.role || 'customer'}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
