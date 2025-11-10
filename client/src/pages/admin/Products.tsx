import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "./Dashboard";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"] as const;

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
    images: [""],
    color_images: {} as Record<string, string[]>,
    customizable: false,
    gift_type: "none" as "none" | "watches" | "eyewear" | "frames" | "accessories",
    stock_quantity: "0",
    available_sizes: { S: true, M: true, L: true, XL: true } as Record<string, boolean>,
    colors: ["Beige", "Black", "White"],
    tags: [] as string[],
    featured: false,
    active: true,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/products', { all: 'true' }],
  });

  const { data: categories = [] } = useQuery<any[]>({
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
    
    const validImages = formData.images.filter(img => img.trim() !== "");
    if (validImages.length === 0) {
      toast({ title: "Error", description: "At least one image is required", variant: "destructive" });
      return;
    }
    if (validImages.length > 5) {
      toast({ title: "Error", description: "Maximum 5 images allowed", variant: "destructive" });
      return;
    }

    const selectedSizes = Object.entries(formData.available_sizes)
      .filter(([_, selected]) => selected)
      .map(([size]) => size);

    // Build color_images object, filtering out empty URLs
    const colorImages: Record<string, string[]> = {};
    Object.entries(formData.color_images).forEach(([color, urls]) => {
      const validUrls = urls.filter(url => url.trim() !== "");
      if (validUrls.length > 0) {
        colorImages[color] = validUrls;
      }
    });

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      images: validImages,
      color_images: Object.keys(colorImages).length > 0 ? colorImages : undefined,
      available_sizes: selectedSizes,
      tags: formData.tags.map(tag => tag.trim().toLowerCase()),
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
    
    const images = product.images && product.images.length > 0
      ? product.images
      : product.image_url
      ? [product.image_url]
      : [""];

    const sizesMap: Record<string, boolean> = {};
    ALL_SIZES.forEach(size => {
      sizesMap[size] = product.available_sizes?.includes(size) || 
                       product.sizes?.includes(size) || 
                       false;
    });

    // Load color_images if they exist
    const colorImages: Record<string, string[]> = {};
    if (product.color_images) {
      Object.entries(product.color_images).forEach(([color, urls]) => {
        colorImages[color] = Array.isArray(urls) ? [...urls] : [];
      });
    }

    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price.toString(),
      category_id: product.category_id || "",
      images: images,
      color_images: colorImages,
      customizable: product.customizable,
      gift_type: product.gift_type || "none",
      stock_quantity: product.stock_quantity.toString(),
      available_sizes: sizesMap,
      colors: product.colors || ["Beige", "Black", "White"],
      tags: product.tags || [],
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
      images: [""],
      color_images: {},
      customizable: false,
      gift_type: "none" as "none" | "watches" | "eyewear" | "frames" | "accessories",
      stock_quantity: "0",
      available_sizes: { S: true, M: true, L: true, XL: true },
      colors: ["Beige", "Black", "White"],
      tags: [],
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
                <Label>Product Images (1-5 images)</Label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        placeholder="https://..."
                        data-testid={`input-image-${index}`}
                      />
                      {formData.images.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            setFormData({ ...formData, images: newImages });
                          }}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, images: [...formData.images, ""] })}
                      data-testid="button-add-image"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Color-Specific Images (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload images for specific colors. When a customer selects a color, they'll see these images instead of the default images.
                </p>
                <div className="space-y-4">
                  {formData.colors.map((color) => (
                    <div key={color} className="border rounded-md p-4">
                      <Label className="mb-2 block font-semibold">{color}</Label>
                      <div className="space-y-2">
                        {(formData.color_images[color] || []).map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={url}
                              onChange={(e) => {
                                const newColorImages = { ...formData.color_images };
                                if (!newColorImages[color]) newColorImages[color] = [];
                                const newUrls = [...newColorImages[color]];
                                newUrls[index] = e.target.value;
                                newColorImages[color] = newUrls;
                                setFormData({ ...formData, color_images: newColorImages });
                              }}
                              placeholder={`https://... (${color} image)`}
                              data-testid={`input-color-image-${color}-${index}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newColorImages = { ...formData.color_images };
                                if (newColorImages[color]) {
                                  newColorImages[color] = newColorImages[color].filter((_, i) => i !== index);
                                  if (newColorImages[color].length === 0) {
                                    delete newColorImages[color];
                                  }
                                }
                                setFormData({ ...formData, color_images: newColorImages });
                              }}
                              data-testid={`button-remove-color-image-${color}-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newColorImages = { ...formData.color_images };
                            if (!newColorImages[color]) newColorImages[color] = [];
                            newColorImages[color].push("");
                            setFormData({ ...formData, color_images: newColorImages });
                          }}
                          data-testid={`button-add-color-image-${color}`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add {color} Image
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="gift_type">Gift Type (for Customized Gifts)</Label>
                <Select
                  value={formData.gift_type}
                  onValueChange={(value: "none" | "watches" | "eyewear" | "frames" | "accessories") => 
                    setFormData({ ...formData, gift_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gift type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Regular Product)</SelectItem>
                    <SelectItem value="watches">Custom Watches</SelectItem>
                    <SelectItem value="eyewear">Custom Eyewear</SelectItem>
                    <SelectItem value="frames">Photo Frames</SelectItem>
                    <SelectItem value="accessories">Custom Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Available Sizes</Label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {ALL_SIZES.map((size) => (
                    <div key={size} className="flex items-center gap-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={formData.available_sizes[size]}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            available_sizes: {
                              ...formData.available_sizes,
                              [size]: checked as boolean,
                            },
                          });
                        }}
                        data-testid={`checkbox-size-${size}`}
                      />
                      <Label htmlFor={`size-${size}`} className="cursor-pointer">{size}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (for product recommendations)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" data-testid={`badge-tag-${index}`}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = formData.tags.filter((_, i) => i !== index);
                          setFormData({ ...formData, tags: newTags });
                        }}
                        className="ml-1"
                        data-testid={`button-remove-tag-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Enter tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const tag = input.value.trim().toLowerCase();
                        if (tag && !formData.tags.includes(tag)) {
                          setFormData({ ...formData, tags: [...formData.tags, tag] });
                          input.value = "";
                        }
                      }
                    }}
                    data-testid="input-tags"
                  />
                </div>
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
                  {(product.images?.[0] || product.image_url) && (
                    <img 
                      src={product.images?.[0] || product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-primary mb-2">₹{product.price}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.tags?.slice(0, 3).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
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
