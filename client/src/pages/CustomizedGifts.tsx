import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Watch, Glasses, Frame } from "lucide-react";

export default function CustomizedGifts() {
  const giftCategories = [
    {
      id: 'watches',
      name: 'Custom Watches',
      description: 'Premium timepieces with personalized engravings',
      icon: Watch,
      items: []
    },
    {
      id: 'eyewear',
      name: 'Custom Eyewear',
      description: 'Designer frames with custom details',
      icon: Glasses,
      items: []
    },
    {
      id: 'frames',
      name: 'Photo Frames',
      description: 'Elegant frames with custom engravings',
      icon: Frame,
      items: []
    },
    {
      id: 'accessories',
      name: 'Custom Accessories',
      description: 'Unique accessories personalized for you',
      icon: Gift,
      items: []
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold mb-4" data-testid="text-customized-gifts-title">
              Customized Gifts
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our collection of pre-customized luxury items. Each piece is carefully crafted 
              with unique designs and premium materials, ready to make the perfect gift.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {giftCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="hover-elevate" data-testid={`card-category-${category.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{category.name}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      data-testid={`button-browse-${category.id}`}
                    >
                      Browse Collection
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-card border border-card-border rounded-md p-8 text-center">
            <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-3">
              Premium Pre-Customized Items Coming Soon
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're curating an exclusive collection of luxury watches, designer eyewear, 
              elegant photo frames, and unique accessories. Each item will feature custom 
              designs and premium materials to make your gift truly special.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">Luxury Watches</Badge>
              <Badge variant="secondary">Designer Eyewear</Badge>
              <Badge variant="secondary">Custom Frames</Badge>
              <Badge variant="secondary">Unique Accessories</Badge>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
