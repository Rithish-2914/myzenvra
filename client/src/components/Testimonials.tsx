import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import testimonial1 from "@assets/generated_images/Customer_testimonial_portrait_one_9c7164d7.png";
import testimonial2 from "@assets/generated_images/Customer_testimonial_portrait_two_4f280a5b.png";
import testimonial3 from "@assets/generated_images/Customer_testimonial_portrait_three_1e91d8ce.png";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    image: testimonial1,
    rating: 5,
    text: "The quality is amazing! Got my customized hoodie and it's perfect. Love the Old Money vibe.",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    image: testimonial2,
    rating: 5,
    text: "Best oversized tees I've bought. The customization options are endless. Highly recommend!",
  },
  {
    id: 3,
    name: "Ananya Verma",
    image: testimonial3,
    rating: 5,
    text: "Supporting student entrepreneurs and getting premium quality. Win-win! My entire wardrobe is myzenvra now.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4" data-testid="text-testimonials-title">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of happy customers who've upgraded their style with myzenvra
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-testid={`card-testimonial-${testimonial.id}`}
            >
              <Card className="p-6 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold" data-testid={`text-testimonial-name-${testimonial.id}`}>
                      {testimonial.name}
                    </h4>
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground" data-testid={`text-testimonial-text-${testimonial.id}`}>
                  "{testimonial.text}"
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
