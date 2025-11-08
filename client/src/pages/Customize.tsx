import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomizeForm from "@/components/CustomizeForm";
import { Card } from "@/components/ui/card";

export default function Customize() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-customize-title">
            Customize Your Drip
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create something unique. Upload your design, choose your style, and make it yours.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="aspect-square bg-muted flex items-center justify-center">
              <p className="text-muted-foreground" data-testid="text-preview">Live Preview</p>
            </Card>
          </div>
          
          <div>
            <CustomizeForm />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
