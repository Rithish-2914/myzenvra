import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  customizable?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  category,
  customizable = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addItem({
        productId: id,
        name,
        price,
        image,
        quantity: 1,
      });
      
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = '/customize';
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      data-testid={`card-product-${id}`}
    >
      <Link href={`/product/${id}`}>
        <Card className="overflow-hidden hover-elevate group cursor-pointer">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              data-testid={`img-product-${id}`}
            />
            {customizable && (
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                Customizable
              </Badge>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>

          <div className="p-4">
            <div className="mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide" data-testid={`text-category-${id}`}>
                {category}
              </p>
              <h3 className="text-lg font-medium mt-1" data-testid={`text-name-${id}`}>
                {name}
              </h3>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xl font-semibold" data-testid={`text-price-${id}`}>
                ₹{price}
              </p>
              <Button
                size="sm"
                className="gap-2"
                data-testid={`button-add-cart-${id}`}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </Button>
            </div>

            {customizable && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                data-testid={`button-customize-${id}`}
                onClick={handleCustomize}
              >
                Customize This
              </Button>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
