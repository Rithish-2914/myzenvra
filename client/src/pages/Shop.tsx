import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import hoodieImage from "@assets/generated_images/Beige_oversized_hoodie_product_4620f57a.png";
import teeImage from "@assets/generated_images/Black_oversized_tee_product_ed114e4f.png";
import pantsImage from "@assets/generated_images/Beige_pants_product_photo_aa3f69e8.png";

const products = [
  { id: "1", name: "Oversized Beige Hoodie", price: 2499, image: hoodieImage, category: "Hoodies", customizable: true },
  { id: "2", name: "Black Oversized Tee", price: 1299, image: teeImage, category: "Tees", customizable: true },
  { id: "3", name: "Wide Leg Beige Pants", price: 2199, image: pantsImage, category: "Pants", customizable: false },
  { id: "4", name: "Classic White Hoodie", price: 2399, image: hoodieImage, category: "Hoodies", customizable: true },
  { id: "5", name: "Gold Print Tee", price: 1399, image: teeImage, category: "Tees", customizable: true },
  { id: "6", name: "Black Cargo Pants", price: 2299, image: pantsImage, category: "Pants", customizable: false },
];

export default function Shop() {
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
              <ProductFilters />
            </div>
          </aside>
          
          <main className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
