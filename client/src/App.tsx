import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import CustomizedGifts from "@/pages/CustomizedGifts";
import Customize from "@/pages/Customize";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import CustomerService from "@/pages/CustomerService";
import BulkOrders from "@/pages/BulkOrders";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import MyOrders from "@/pages/MyOrders";
import Wishlist from "@/pages/Wishlist";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import AdminLogin from "@/pages/admin/Login";
import AdminIndex from "@/pages/admin/Index";
import AdminProducts from "@/pages/admin/Products";
import AdminCategories from "@/pages/admin/Categories";
import AdminCustomizedGifts from "@/pages/admin/CustomizedGifts";
import AdminOrders from "@/pages/admin/Orders";
import AdminMessages from "@/pages/admin/Messages";
import AdminUsers from "@/pages/admin/Users";
import AdminAnalytics from "@/pages/admin/Analytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/customized-gifts" component={CustomizedGifts} />
      <Route path="/customize" component={Customize} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contact" component={Contact} />
      <Route path="/customer-service" component={CustomerService} />
      <Route path="/bulk-orders" component={BulkOrders} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminIndex} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/customized-gifts" component={AdminCustomizedGifts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
