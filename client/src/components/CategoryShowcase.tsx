import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import hoodieImage from "@assets/generated_images/Beige_oversized_hoodie_product_4620f57a.png";
import teeImage from "@assets/generated_images/Black_oversized_tee_product_ed114e4f.png";
import pantsImage from "@assets/generated_images/Beige_pants_product_photo_aa3f69e8.png";

const categories = [
  { id: 1, name: "Hoodies", image: hoodieImage, items: "12+ styles" },
  { id: 2, name: "Oversized Tees", image: teeImage, items: "15+ styles" },
  { id: 3, name: "Pants", image: pantsImage, items: "8+ styles" },
  { id: 4, name: "Accessories", image: hoodieImage, items: "10+ items" },
];

export default function CategoryShowcase() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground">
            Discover our curated collections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              data-testid={`card-category-${category.id}`}
            >
              <Card className="overflow-hidden cursor-pointer hover-elevate group">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold mb-1" data-testid={`text-category-name-${category.id}`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.items}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
