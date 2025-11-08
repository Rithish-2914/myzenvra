import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { useState } from "react";

export default function BulkOrders() {
  const [formData, setFormData] = useState({
    organization: "",
    contactName: "",
    email: "",
    phone: "",
    quantity: "",
    details: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Bulk order inquiry:", formData);
  };

  const benefits = [
    "Special bulk pricing discounts",
    "Custom branding and logos",
    "Priority production and delivery",
    "Dedicated account manager",
    "Flexible payment terms",
    "Free design consultation",
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4" data-testid="text-bulk-title">
            Bulk Orders for Colleges & Offices
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get special pricing on bulk orders. Perfect for college fests, office teams, and group events.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Why Choose Us for Bulk Orders?</h2>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3" data-testid={`benefit-${index}`}>
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            
            <Card className="p-6 mt-8 bg-muted">
              <h3 className="font-semibold mb-4">Pricing Tiers</h3>
              <div className="space-y-2 text-sm">
                <p>50-100 units: 10% off</p>
                <p>100-250 units: 15% off</p>
                <p>250+ units: 20% off + free shipping</p>
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Request a Quote</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="organization">Organization Name</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    required
                    data-testid="input-organization"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    required
                    data-testid="input-contact-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    data-testid="input-phone"
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Estimated Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    data-testid="input-quantity"
                  />
                </div>
                
                <div>
                  <Label htmlFor="details">Order Details</Label>
                  <Textarea
                    id="details"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Tell us about your requirements..."
                    rows={4}
                    data-testid="textarea-details"
                  />
                </div>
                
                <Button type="submit" className="w-full" data-testid="button-submit">
                  Submit Inquiry
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
