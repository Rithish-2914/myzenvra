import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, DollarSign, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  payment_method?: string;
  payment_status?: string;
  status: string;
  created_at: string;
  events?: Array<{
    id: string;
    status: string;
    notes?: string;
    created_at: string;
  }>;
}

export default function MyOrders() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/my-orders", user?.uid],
    enabled: !!user,
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in to View Orders</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your order history
            </p>
            <Button onClick={() => (window.location.href = "/login")} data-testid="button-login">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => (window.location.href = "/shop")} data-testid="button-shop">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover-elevate" data-testid={`order-${order.id}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(order.created_at), "PPP")}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getStatusColor(order.status)} data-testid={`status-${order.id}`}>
                    {order.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    data-testid={`button-details-${order.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>{order.items.length} item(s)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                      <p>{order.shipping_address.pincode}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground flex flex-wrap justify-between gap-2">
                        <span>
                          {item.name} {item.size && `(${item.size})`} {item.color && `- ${item.color}`}
                        </span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>{format(new Date(selectedOrder.created_at), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold">₹{selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Items</p>
                    <p>{selectedOrder.items.length}</p>
                  </div>
                  {selectedOrder.payment_method && (
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium uppercase">{selectedOrder.payment_method}</p>
                    </div>
                  )}
                  {selectedOrder.payment_status && (
                    <div>
                      <p className="text-muted-foreground">Payment Status</p>
                      <p className="font-medium capitalize">{selectedOrder.payment_status}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p className="text-sm">{selectedOrder.user_name}</p>
                <p className="text-sm">{selectedOrder.shipping_address.address}</p>
                <p className="text-sm">
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pincode}
                </p>
                <p className="text-sm">{selectedOrder.phone}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap justify-between gap-2 text-sm border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.size && <p className="text-muted-foreground">Size: {item.size}</p>}
                        {item.color && <p className="text-muted-foreground">Color: {item.color}</p>}
                      </div>
                      <div className="text-right">
                        <p>x{item.quantity}</p>
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.events && selectedOrder.events.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Order Timeline</h3>
                  <div className="space-y-2">
                    {selectedOrder.events.map((event, idx) => (
                      <div key={event.id} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-muted'}`} />
                          {idx < selectedOrder.events!.length - 1 && (
                            <div className="w-0.5 h-full bg-muted mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex flex-wrap justify-between gap-2">
                            <Badge className={getStatusColor(event.status)} variant="outline">
                              {event.status}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {format(new Date(event.created_at), "PPp")}
                            </span>
                          </div>
                          {event.notes && (
                            <p className="text-muted-foreground mt-1">{event.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
