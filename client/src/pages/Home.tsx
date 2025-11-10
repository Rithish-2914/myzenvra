import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryShowcase from "@/components/CategoryShowcase";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <CategoryShowcase />
      <Testimonials />
      <Footer />
    </div>
  );
}
