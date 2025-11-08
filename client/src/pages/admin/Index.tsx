import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, MessageSquare, TrendingUp } from "lucide-react";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "./Dashboard";

function AdminIndexPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const stats = [
    {
      name: "Total Products",
      value: analytics?.counts?.products || 0,
      icon: Package,
      color: "text-blue-600",
    },
    {
      name: "Total Orders",
      value: analytics?.counts?.orders || 0,
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      name: "Customizations",
      value: analytics?.counts?.customizations || 0,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      name: "Inquiries",
      value: analytics?.counts?.contactInquiries || 0,
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {analytics?.recentOrders?.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b border-border pb-2">
                  <div>
                    <p className="font-medium">{order.user_name}</p>
                    <p className="text-sm text-muted-foreground">{order.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.total_amount}</p>
                    <p className="text-sm text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-primary">₹{analytics?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <p className="text-xl font-semibold">
                  ₹{analytics?.counts?.orders > 0 
                    ? Math.round(analytics.totalRevenue / analytics.counts.orders).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminIndex() {
  return (
    <AdminRoute>
      <AdminIndexPage />
    </AdminRoute>
  );
}
