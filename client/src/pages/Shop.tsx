import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { Product, Category } from "@/../../shared/schema";

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/products?category=${selectedCategory}`
        : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8" data-testid="text-shop-title">
          Shop All Products
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                isLoading={categoriesLoading}
              />
            </div>
          </aside>
          
          <main className="lg:col-span-3">
            {productsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image_url}
                    category={(product as any).categories?.name || ""}
                    customizable={product.customizable}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
