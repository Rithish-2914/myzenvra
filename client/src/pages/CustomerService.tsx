import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Package, CreditCard, RefreshCw } from "lucide-react";

export default function CustomerService() {
  const services = [
    {
      icon: Package,
      title: "Track Your Order",
      description: "Get real-time updates on your order status and delivery.",
      action: "Track Now",
    },
    {
      icon: RefreshCw,
      title: "Returns & Exchanges",
      description: "Easy 7-day return policy for non-customized items.",
      action: "Learn More",
    },
    {
      icon: CreditCard,
      title: "Payment Issues",
      description: "Need help with payment or refunds? We're here to help.",
      action: "Contact Support",
    },
    {
      icon: HelpCircle,
      title: "General Support",
      description: "Have questions? Our team is ready to assist you.",
      action: "Get Help",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4" data-testid="text-service-title">
            Customer Service
          </h1>
          <p className="text-lg text-muted-foreground">
            We're here to help with any questions or concerns
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="p-6" data-testid={`card-service-${index}`}>
              <service.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              <Button variant="outline" data-testid={`button-service-${index}`}>
                {service.action}
              </Button>
            </Card>
          ))}
        </div>
        
        <Card className="p-8 text-center bg-muted">
          <h2 className="text-2xl font-serif font-bold mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is available Monday to Friday, 9 AM - 6 PM IST
          </p>
          <Button size="lg" data-testid="button-contact-support">
            Contact Support
          </Button>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
