import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/../../shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const { toast } = useToast();
  const { addItem } = useCart();
  const [, setLocation] = useLocation();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState<string>("");

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  // Set default image when product loads or color changes
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (product) {
      // Check if there are color-specific images
      if (product.color_images && product.color_images[color]?.length > 0) {
        setCurrentImage(product.color_images[color][0]);
      } else {
        // Fallback to default image
        setCurrentImage(product.images?.[0] || "");
      }
    }
  };

  // Set initial image when product loads
  useEffect(() => {
    if (product) {
      const defaultImg = product.images?.[0] || "";
      setCurrentImage(defaultImg);
      // Auto-select first color if available
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        const firstColor = product.colors[0];
        setSelectedColor(firstColor);
        if (product.color_images && product.color_images[firstColor]?.length > 0) {
          setCurrentImage(product.color_images[firstColor][0]);
        }
      }
    }
  }, [product]);

  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products', product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      const response = await fetch(`/api/products?category=${product.category_id}`);
      if (!response.ok) throw new Error('Failed to fetch related products');
      const products = await response.json();
      return products.filter((p: Product) => p.id !== productId).slice(0, 4);
    },
    enabled: !!product?.category_id,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (product.available_sizes && product.available_sizes.length > 0 && !selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }

    try {
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: currentImage || product.images[0],
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      
      setTimeout(() => {
        setLocation('/cart');
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-muted-foreground">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Product Not Found</h1>
            <Link href="/shop">
              <Button data-testid="button-back-shop">Back to Shop</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted">
            <img
              src={currentImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="img-product-main"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-4xl font-serif font-bold mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              <p className="text-3xl font-semibold" data-testid="text-product-price">
                ₹{product.price}
              </p>
            </div>

            {product.customizable && (
              <Badge className="w-fit mb-4" data-testid="badge-customizable">
                Customizable
              </Badge>
            )}

            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground" data-testid="text-product-description">
                  {product.description}
                </p>
              </div>
            )}

            {product.available_sizes && product.available_sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((size: string) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleColorChange(color)}
                      data-testid={`button-color-${color}`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-decrease-quantity"
                >
                  -
                </Button>
                <span className="text-lg font-medium w-12 text-center" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  data-testid="button-increase-quantity"
                >
                  +
                </Button>
              </div>
              {product.stock_quantity < 10 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  Only {product.stock_quantity} left in stock
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <Button
                className="flex-1 gap-2"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                data-testid="button-add-wishlist"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {product.customizable && (
              <Link href="/customize">
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  data-testid="button-customize"
                >
                  Customize This Product
                </Button>
              </Link>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-serif font-bold mb-8" data-testid="text-related-title">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  price={relatedProduct.price}
                  image={relatedProduct.images[0]}
                  category={(relatedProduct as any).categories?.name || ""}
                  customizable={relatedProduct.customizable}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
