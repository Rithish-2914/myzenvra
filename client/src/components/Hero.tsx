import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/Hero_banner_luxury_lifestyle_4f7b2d5c.png";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight"
          data-testid="text-hero-title"
        >
          Old Money Meets Modern Drip
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          data-testid="text-hero-subtitle"
        >
          Luxury Gen-Z streetwear with customizable designs. Oversized hoodies, tees, and gifts crafted by VIT students for the modern generation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="text-base px-8 py-6 backdrop-blur-sm bg-primary hover:bg-primary/90 border border-primary-border"
            data-testid="button-customize-drip"
          >
            Customize Your Drip
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 backdrop-blur-sm bg-white/10 border-2 border-white text-white hover:bg-white/20"
            data-testid="button-shop-collection"
          >
            Shop Collection
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
