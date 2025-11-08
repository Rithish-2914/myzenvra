import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import teamPhoto from "@assets/generated_images/VIT_founders_team_photo_f93af424.png";

export default function About() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="text-about-title">
            Our Story
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Three VIT students building a Gen-Z luxury brand merging Old Money aesthetics with modern drips and gifts
          </p>
        </motion.div>

        <div className="mb-16">
          <Card className="overflow-hidden">
            <img
              src={teamPhoto}
              alt="myzenvra founders"
              className="w-full h-96 object-cover"
              data-testid="img-team"
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-4">The Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              Started in our VIT dorm rooms, myzenvra was born from a simple idea: luxury fashion shouldn't be exclusive. We wanted to create a brand that celebrates the timeless elegance of Old Money aesthetics while embracing the bold, expressive nature of Gen-Z streetwear.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-4">Why Customization?</h2>
            <p className="text-muted-foreground leading-relaxed">
              We believe fashion is personal. That's why every piece can be customized to reflect your unique style. From uploading your own designs to choosing custom colors and text, we give you the tools to create something truly yours.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Quality First", desc: "Premium fabrics and construction in every piece" },
            { title: "Student-Led", desc: "Built by students, for the modern generation" },
            { title: "Affordable Luxury", desc: "High-end aesthetics at accessible prices" },
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
