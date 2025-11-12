import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, Sparkles, Heart } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4" data-testid="text-about-title">
            About Myzenvra
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Where Gen-Z creativity meets luxury streetwear
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">Friends with a Vision</h3>
            <p className="text-sm text-muted-foreground">
              Every piece is designed and created by 3 friends who started from a small shared dorm, bringing fresh perspectives to streetwear.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">Fully Customizable</h3>
            <p className="text-sm text-muted-foreground">
              Make it yours with our customization options. Add your own designs, text, and personal touches.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">Premium Quality</h3>
            <p className="text-sm text-muted-foreground">
              Oversized hoodies, tees, and gifts crafted with premium materials for the modern generation.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/about">
            <Button variant="outline" size="lg" data-testid="button-learn-more">
              Learn More About Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
