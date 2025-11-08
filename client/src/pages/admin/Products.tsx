import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "./Dashboard";

function ProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
    customizable: false,
    stock_quantity: "0",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Black", "White"],
    featured: false,
    active: true,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', { all: 'true' }],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/products', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product created successfully" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PUT', `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product updated successfully" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };

    if (isEditing && editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setIsEditing(true);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price.toString(),
      category_id: product.category_id || "",
      image_url: product.image_url,
      customizable: product.customizable,
      stock_quantity: product.stock_quantity.toString(),
      sizes: product.sizes || ["S", "M", "L", "XL"],
      colors: product.colors || ["Beige", "Black", "White"],
      featured: product.featured,
      active: product.active,
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: "",
      category_id: "",
      image_url: "",
      customizable: false,
      stock_quantity: "0",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Beige", "Black", "White"],
      featured: false,
      active: true,
    });
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <Button onClick={() => setIsEditing(!isEditing)} data-testid="button-add-product">
            <Plus className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Add Product"}
          </Button>
        </div>

        {isEditing && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated from name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.customizable}
                    onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                  />
                  Customizable
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isEditing && editingProduct ? "Update Product" : "Create Product"}
                </Button>
                {isEditing && <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>}
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsLoading ? (
            <p>Loading products...</p>
          ) : (
            products?.map((product: any) => (
              <Card key={product.id} className="p-4">
                <div className="aspect-square bg-muted rounded-md mb-4 overflow-hidden">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-primary mb-2">₹{product.price}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Stock: {product.stock_quantity} | {product.active ? "Active" : "Inactive"}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete this product?")) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Products() {
  return (
    <AdminRoute>
      <ProductsPage />
    </AdminRoute>
  );
}
