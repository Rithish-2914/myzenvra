import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { Product, Category } from "@/../../shared/schema";

export default function Shop() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryFromUrl = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
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

  const products = useMemo(() => {
    return allProducts.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
  }, [allProducts, priceRange]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handlePriceRangeChange = (range: number[]) => {
    setPriceRange(range);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8" data-testid="text-shop-title">
          Shop All Products
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <ProductFilters 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                priceRange={priceRange}
                onPriceRangeChange={handlePriceRangeChange}
                isLoading={categoriesLoading}
              />
            </div>
          </aside>
          
          <main className="flex-1 min-w-0">
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
                    image={product.images[0] || ''}
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
