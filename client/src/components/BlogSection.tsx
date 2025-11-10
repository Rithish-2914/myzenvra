import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, ArrowRight } from "lucide-react";

const FEATURED_BLOGS = [
  {
    id: 1,
    title: "The Rise of Gen-Z Streetwear Culture",
    excerpt: "Explore how Gen-Z is redefining fashion with bold statements, sustainability, and self-expression.",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop",
    date: "Nov 5, 2024",
    category: "Fashion Trends"
  },
  {
    id: 2,
    title: "How to Style Oversized Hoodies",
    excerpt: "Master the art of styling oversized hoodies for every occasion, from casual to street-chic.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop",
    date: "Nov 3, 2024",
    category: "Style Guide"
  },
  {
    id: 3,
    title: "Behind the Scenes: VIT Student Designers",
    excerpt: "Meet the talented students bringing creativity and innovation to luxury streetwear.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
    date: "Oct 28, 2024",
    category: "Community"
  }
];

export default function BlogSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-blog-title">
              Latest from Our Blog
            </h2>
            <p className="text-muted-foreground">
              Stay updated with trends, style tips, and behind-the-scenes stories
            </p>
          </div>
          <Link href="/blog">
            <Button variant="outline" data-testid="button-view-all-blogs">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_BLOGS.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover-elevate" data-testid={`card-blog-${blog.id}`}>
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  data-testid={`img-blog-${blog.id}`}
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                    {blog.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{blog.date}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-lg line-clamp-2" data-testid={`text-blog-title-${blog.id}`}>
                  {blog.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {blog.excerpt}
                </p>
                <Link href={`/blog/${blog.id}`}>
                  <Button variant="ghost" size="sm" className="p-0 h-auto" data-testid={`button-read-blog-${blog.id}`}>
                    Read More
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
