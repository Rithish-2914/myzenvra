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
              <li><Link href="/shop"><a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-shop">All Products</a></Link></li>
              <li><Link href="/shop?category=hoodies"><a className="text-muted-foreground hover:text-foreground transition-colors">Hoodies</a></Link></li>
              <li><Link href="/shop?category=tees"><a className="text-muted-foreground hover:text-foreground transition-colors">Tees</a></Link></li>
              <li><Link href="/customize"><a className="text-muted-foreground hover:text-foreground transition-colors">Customize</a></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about"><a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">About Us</a></Link></li>
              <li><Link href="/blog"><a className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></Link></li>
              <li><Link href="/bulk-orders"><a className="text-muted-foreground hover:text-foreground transition-colors">Bulk Orders</a></Link></li>
              <li><Link href="/contact"><a className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/customer-service"><a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-support">Customer Service</a></Link></li>
              <li><Link href="/faq"><a className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></Link></li>
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
