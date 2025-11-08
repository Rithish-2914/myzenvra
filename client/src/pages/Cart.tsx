import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const cartItems: any[] = [];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8" data-testid="text-cart-title">
          Shopping Cart
        </h1>
        
        {cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-6" data-testid="text-empty-cart">
              Your cart is empty
            </p>
            <Link href="/shop">
              <Button data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any) => (
                <Card key={item.id} className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-md" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-lg font-semibold mt-2">₹{item.price}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="text-total">₹0</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button className="w-full" data-testid="button-checkout">
                    Proceed to Checkout
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
