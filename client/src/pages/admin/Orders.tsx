import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Search, Calendar, DollarSign, MapPin } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  user_email: string;
  user_name: string;
  phone: string;
  shipping_address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ orders: Order[]; total: number }>({
    queryKey: ["/api/admin/orders", { status: statusFilter, search: searchQuery }],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: string; status: string; notes: string }) => {
      await apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setSelectedOrder(null);
      setNewStatus("");
      setStatusNotes("");
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: newStatus,
      notes: statusNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Orders Management</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Orders Management</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-orders"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Orders Found</h2>
            <p className="text-muted-foreground">
              No orders match your current filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover-elevate" data-testid={`order-${order.id}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(order.created_at), "PPP")}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                      }}
                      data-testid={`button-manage-${order.id}`}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Customer</p>
                    <p className="text-sm">{order.user_name}</p>
                    <p className="text-sm text-muted-foreground">{order.user_email}</p>
                    <p className="text-sm text-muted-foreground">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Shipping</p>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p>{order.shipping_address.address}</p>
                        <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                        <p>{order.shipping_address.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{order.items.length} item(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-bold">${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => {
          setSelectedOrder(null);
          setNewStatus("");
          setStatusNotes("");
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h3>
                <p className="text-sm text-muted-foreground">{selectedOrder.user_name} - {selectedOrder.user_email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status" data-testid="select-new-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this status update..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  data-testid="input-status-notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(null);
                    setNewStatus("");
                    setStatusNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || updateStatusMutation.isPending}
                  data-testid="button-update-status"
                >
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
