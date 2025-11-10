import { type MouseEvent, useState, useEffect } from "react";
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
  images?: string[];
  category: string;
  customizable?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  images,
  category,
  customizable = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const allImages = images && images.length > 0 ? images : [image];

  useEffect(() => {
    allImages.forEach(img => {
      const imgElement = new Image();
      imgElement.src = img;
    });
  }, [allImages]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (allImages.length <= 1) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateYVal = ((x - centerX) / centerX) * 10;
    const rotateXVal = ((centerY - y) / centerY) * 10;
    
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
    
    const imageIndex = Math.floor((x / rect.width) * allImages.length);
    setCurrentImageIndex(Math.min(imageIndex, allImages.length - 1));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setCurrentImageIndex(0);
  };

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addItem({
        productId: id,
        name,
        price,
        image: allImages[0],
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

  const handleCustomize = (e: MouseEvent) => {
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
          <div 
            className="relative aspect-[3/4] overflow-hidden bg-muted"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              perspective: '1000px',
            }}
          >
            <div
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
              className="w-full h-full"
            >
              <img
                src={allImages[currentImageIndex]}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                data-testid={`img-product-${id}`}
              />
            </div>
            {customizable && (
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground z-10">
                Customizable
              </Badge>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentImageIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
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
