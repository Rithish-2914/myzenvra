import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Gift,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/logout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/session'] });
      toast({ title: "Logged out successfully" });
      setLocation("/admin/login");
    },
  });

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Categories", path: "/admin/categories", icon: FolderOpen },
    { name: "Customized Gifts", path: "/admin/customized-gifts", icon: Gift },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Customizations", path: "/admin/customizations", icon: Settings },
    { name: "Inquiries", path: "/admin/inquiries", icon: MessageSquare },
    { name: "Analytics", path: "/admin/analytics", icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-card-border bg-card">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold">myzenvra</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => logoutMutation.mutate()}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
