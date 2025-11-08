import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { data: session, isLoading } = useQuery({
    queryKey: ['/api/admin/session'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session?.authenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}
