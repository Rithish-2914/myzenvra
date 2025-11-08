import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryShowcase from "@/components/CategoryShowcase";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <CategoryShowcase />
      
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                Design Your Own
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Unleash your creativity with our customization options. Upload your designs, add text, choose colors, and create something uniquely yours.
              </p>
              <Link href="/customize">
                <Button size="lg" data-testid="button-start-customizing">
                  Start Customizing
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-muted rounded-lg aspect-square flex items-center justify-center"
            >
              <p className="text-muted-foreground">Product Preview</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Testimonials />
      <Footer />
    </div>
  );
}
