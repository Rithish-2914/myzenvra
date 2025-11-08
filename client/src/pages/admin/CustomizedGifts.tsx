import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Watch, Glasses, Frame, Gift, Pencil } from "lucide-react";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "./Dashboard";
import { useLocation } from "wouter";

function CustomizedGiftsPage() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', { all: 'true', gift_type: selectedType }],
  });

  const giftTypes = [
    { id: 'watches', name: 'Custom Watches', icon: Watch, color: 'bg-blue-100 text-blue-700' },
    { id: 'eyewear', name: 'Custom Eyewear', icon: Glasses, color: 'bg-purple-100 text-purple-700' },
    { id: 'frames', name: 'Photo Frames', icon: Frame, color: 'bg-green-100 text-green-700' },
    { id: 'accessories', name: 'Custom Accessories', icon: Gift, color: 'bg-orange-100 text-orange-700' },
  ];

  const filteredProducts = products?.filter((p: any) => {
    if (!selectedType) return p.gift_type && p.gift_type !== 'none';
    return p.gift_type === selectedType;
  });

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Customized Gifts Management</h1>
          <Button onClick={() => setLocation('/admin/products')} data-testid="button-manage-products">
            Manage All Products
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className={`cursor-pointer hover-elevate ${!selectedType ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedType(null)}
            data-testid="filter-all"
          >
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-semibold">All Gift Items</div>
              <div className="text-2xl font-bold text-primary mt-2">
                {products?.filter((p: any) => p.gift_type && p.gift_type !== 'none').length || 0}
              </div>
            </CardContent>
          </Card>

          {giftTypes.map((type) => {
            const Icon = type.icon;
            const count = products?.filter((p: any) => p.gift_type === type.id).length || 0;
            const isSelected = selectedType === type.id;
            
            return (
              <Card
                key={type.id}
                className={`cursor-pointer hover-elevate ${isSelected ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedType(type.id)}
                data-testid={`filter-${type.id}`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-md ${type.color} mb-2`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="font-semibold text-sm">{type.name}</div>
                  <div className="text-2xl font-bold mt-2">{count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedType 
                ? `${giftTypes.find(t => t.id === selectedType)?.name} Products` 
                : 'All Customized Gift Products'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading products...</p>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: any) => {
                  const giftType = giftTypes.find(t => t.id === product.gift_type);
                  const TypeIcon = giftType?.icon || Gift;
                  
                  return (
                    <Card key={product.id} className="overflow-hidden" data-testid={`product-${product.id}`}>
                      <div className="aspect-square bg-muted relative">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {giftType?.name}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{product.name}</h3>
                        <p className="text-2xl font-bold text-primary mb-2">₹{product.price}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span>Stock: {product.stock_quantity}</span>
                          <Badge variant={product.active ? "default" : "secondary"}>
                            {product.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <Button 
                          className="w-full" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation('/admin/products')}
                          data-testid={`edit-${product.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit in Products
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No customized gift products found
                </p>
                <Button onClick={() => setLocation('/admin/products')} data-testid="button-add-gift-product">
                  Add Gift Products
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• To add a new customized gift, go to <strong>Manage All Products</strong> and set the <strong>Gift Type</strong> field</p>
              <p>• Available gift types: Custom Watches, Custom Eyewear, Photo Frames, Custom Accessories</p>
              <p>• Products with a gift type will automatically appear in the Customized Gifts page on the frontend</p>
              <p>• Regular products should have gift type set to "None (Regular Product)"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function Page() {
  return (
    <AdminRoute>
      <CustomizedGiftsPage />
    </AdminRoute>
  );
}
