import { Link } from "wouter";
import { ShoppingCart, Menu, X, Sun, Moon, User, LogOut, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import logoImage from "@assets/Document-removebg-preview_1762878973331.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [cartCount] = useState(0);
  const { user, userProfile, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navLinksLeft = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Customized Gifts", path: "/customized-gifts" },
  ];

  const navLinksRight = [
    { name: "Customize", path: "/customize" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <AnnouncementBanner />
      <header className="sticky top-0 z-50 bg-card border-b border-card-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" data-testid="link-home">
            <span className="text-2xl font-serif font-bold tracking-tight cursor-pointer">
              myzenvra
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-wrap">
            {navLinksLeft.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`link-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
            
            <div className="mx-1" data-testid="brand-logo">
              <img 
                src={logoImage} 
                alt="ANVZ Logo" 
                className="h-12.5 w-auto dark:invert"
              />
            </div>
            
            {navLinksRight.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`link-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              data-testid="button-theme-toggle"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex gap-2"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.displayName || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLocation('/profile')}
                    data-testid="menu-profile"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocation('/my-orders')}
                    data-testid="menu-orders"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setLocation('/admin')}
                        data-testid="menu-admin"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout();
                      toast({ title: "Logged out successfully" });
                      setLocation('/');
                    }}
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="hidden md:flex"
                  data-testid="button-login"
                >
                  Login
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-card-border bg-card">
          <nav className="px-4 py-4 flex flex-col gap-2">
            {[...navLinksLeft, ...navLinksRight].map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="border-t border-card-border my-2" />
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {user.displayName || user.email}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setLocation('/profile');
                    setMobileMenuOpen(false);
                  }}
                  data-testid="link-mobile-profile"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setLocation('/my-orders');
                    setMobileMenuOpen(false);
                  }}
                  data-testid="link-mobile-orders"
                >
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setLocation('/admin');
                      setMobileMenuOpen(false);
                    }}
                    data-testid="link-mobile-admin"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={async () => {
                    await logout();
                    toast({ title: "Logged out successfully" });
                    setMobileMenuOpen(false);
                    setLocation('/');
                  }}
                  data-testid="link-mobile-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <div className="border-t border-card-border my-2" />
                <Link href="/login">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="link-mobile-login"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
      </header>
    </>
  );
}
