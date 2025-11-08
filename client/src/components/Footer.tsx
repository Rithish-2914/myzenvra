import { Link } from "wouter";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-card-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">myzenvra</h3>
            <p className="text-sm text-muted-foreground">
              Old Money meets Modern Drip. Crafted by VIT students for Gen-Z.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-shop">All Products</Link></li>
              <li><Link href="/shop?category=hoodies" className="text-muted-foreground hover:text-foreground transition-colors">Hoodies</Link></li>
              <li><Link href="/shop?category=tees" className="text-muted-foreground hover:text-foreground transition-colors">Tees</Link></li>
              <li><Link href="/customize" className="text-muted-foreground hover:text-foreground transition-colors">Customize</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">About Us</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/bulk-orders" className="text-muted-foreground hover:text-foreground transition-colors">Bulk Orders</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/customer-service" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-support">Customer Service</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-card-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} myzenvra. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-social-instagram">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-twitter">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-facebook">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-email">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
