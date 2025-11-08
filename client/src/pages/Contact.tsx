import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4" data-testid="text-contact-title">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a 
                    href="mailto:myzenvra@gmail.com" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors" 
                    data-testid="link-email"
                  >
                    myzenvra@gmail.com
                  </a>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <a 
                    href="tel:+919030840952" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors" 
                    data-testid="link-phone"
                  >
                    +91 9030840952
                  </a>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Location</h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-location">
                    VIT University<br />
                    Vellore, Tamil Nadu
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
