import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ShoppingBag } from "lucide-react";

export default function CustomizeChoice() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-page-title">
            Customize Your Way
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose how you want to create your custom streetwear
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/custom-print")}>
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 rounded-md bg-primary/10 mb-4">
                <Upload className="w-8 h-8 text-primary" data-testid="icon-upload" />
              </div>
              <CardTitle className="text-2xl" data-testid="text-option1-title">Upload Your Design</CardTitle>
              <CardDescription data-testid="text-option1-description">
                Create from scratch with your own artwork
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Upload your image, text, or design and we'll print it on the garment of your choice. 
                Perfect for completely custom creations and unique ideas.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center" data-testid="text-feature1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Upload your own images or artwork
                </li>
                <li className="flex items-center" data-testid="text-feature2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Add custom text in any font
                </li>
                <li className="flex items-center" data-testid="text-feature3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Choose color, size, and garment type
                </li>
                <li className="flex items-center" data-testid="text-feature4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  We handle printing and fulfillment
                </li>
              </ul>
              <Button className="w-full" size="lg" data-testid="button-upload">
                Start Custom Print
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/shop")}>
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 rounded-md bg-accent/10 mb-4">
                <ShoppingBag className="w-8 h-8 text-accent-foreground" data-testid="icon-shop" />
              </div>
              <CardTitle className="text-2xl" data-testid="text-option2-title">Customize Existing Products</CardTitle>
              <CardDescription data-testid="text-option2-description">
                Personalize our curated collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Browse our shop and add your personal touch to our premium streetwear pieces. 
                Add your name, custom text, or upload an image to make it yours.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center" data-testid="text-feature5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground mr-2"></span>
                  Choose from our curated collection
                </li>
                <li className="flex items-center" data-testid="text-feature6">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground mr-2"></span>
                  Add custom names or text
                </li>
                <li className="flex items-center" data-testid="text-feature7">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground mr-2"></span>
                  Upload personal images
                </li>
                <li className="flex items-center" data-testid="text-feature8">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground mr-2"></span>
                  Instant preview of your design
                </li>
              </ul>
              <Button variant="outline" className="w-full" size="lg" data-testid="button-shop">
                Browse Shop
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
