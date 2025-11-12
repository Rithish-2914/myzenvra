import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const blogPosts = [
  {
    id: 1,
    title: "The Rise of Old Money Aesthetics in Gen-Z Fashion",
    excerpt: "Exploring how classic elegance is making a comeback in modern streetwear culture.",
    date: "Nov 1, 2025",
    category: "Fashion Trends",
  },
  {
    id: 2,
    title: "How to Style Oversized Streetwear",
    excerpt: "Tips and tricks for pulling off the oversized look with confidence and style.",
    date: "Oct 28, 2025",
    category: "Style Guide",
  },
  {
    id: 3,
    title: "Behind the Scenes: Starting a Brand from a Dorm",
    excerpt: "Our journey from 3 friends in a shared dorm to fashion entrepreneurs.",
    date: "Oct 20, 2025",
    category: "Brand Story",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4" data-testid="text-blog-title">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Fashion insights, style tips, and our journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-testid={`card-blog-${post.id}`}
            >
              <Card className="overflow-hidden hover-elevate cursor-pointer h-full">
                <div className="aspect-video bg-muted" />
                <div className="p-6">
                  <Badge className="mb-3">{post.category}</Badge>
                  <h3 className="text-xl font-semibold mb-2" data-testid={`text-blog-title-${post.id}`}>
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid={`text-blog-excerpt-${post.id}`}>
                    {post.excerpt}
                  </p>
                  <p className="text-sm text-muted-foreground">{post.date}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
