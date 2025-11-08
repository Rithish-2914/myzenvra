import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

export default function Wishlist() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist", { user_id: user?.uid }],
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/wishlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (product: WishlistItem["products"]) => {
      await apiRequest("POST", "/api/cart", {
        user_id: user?.uid,
        product_id: product.id,
        quantity: 1,
      });
    },
    onSuccess: (_, product) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in to View Wishlist</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to save your favorite items
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
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="w-full h-64 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground mb-4">
              Save your favorite items to your wishlist
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
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground">{items.length} item(s)</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="hover-elevate" data-testid={`wishlist-item-${item.product_id}`}>
            <CardContent className="p-4">
              <div className="relative mb-4">
                <img
                  src={item.products.image_url}
                  alt={item.products.name}
                  className="w-full h-64 object-cover rounded-md"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => removeMutation.mutate(item.id)}
                  disabled={removeMutation.isPending}
                  data-testid={`button-remove-${item.product_id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="font-semibold mb-2 line-clamp-2">{item.products.name}</h3>
              <p className="text-xl font-bold mb-4">${item.products.price.toFixed(2)}</p>
              
              {item.products.stock_quantity > 0 ? (
                <Button
                  className="w-full"
                  onClick={() => addToCartMutation.mutate(item.products)}
                  disabled={addToCartMutation.isPending}
                  data-testid={`button-add-to-cart-${item.product_id}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              ) : (
                <Button className="w-full" variant="secondary" disabled>
                  Out of Stock
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
