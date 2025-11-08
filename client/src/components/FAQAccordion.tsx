import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: 1,
    question: "What makes myzenvra different from other streetwear brands?",
    answer: "We're a student-led brand from VIT that combines Old Money aesthetics with modern Gen-Z streetwear. Every piece is customizable, and we focus on oversized fits and premium quality at affordable prices.",
  },
  {
    id: 2,
    question: "How does customization work?",
    answer: "You can upload your own designs, add custom text, choose colors, and select sizes. Our team will print your design on premium quality fabric and deliver it within 7-10 days.",
  },
  {
    id: 3,
    question: "What are your shipping times?",
    answer: "Standard orders ship within 2-3 business days. Custom orders take 7-10 business days as they're made to order. We offer free shipping on orders above ₹1999.",
  },
  {
    id: 4,
    question: "Do you offer bulk discounts for colleges or offices?",
    answer: "Yes! We offer special pricing for bulk orders. Visit our Bulk Orders page or contact us directly for a custom quote.",
  },
  {
    id: 5,
    question: "What's your return policy?",
    answer: "We offer 7-day returns for non-customized products. Due to their personalized nature, custom items cannot be returned unless there's a manufacturing defect.",
  },
];

export default function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={`item-${faq.id}`} data-testid={`accordion-faq-${faq.id}`}>
          <AccordionTrigger className="text-left" data-testid={`button-faq-${faq.id}`}>
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground" data-testid={`text-faq-answer-${faq.id}`}>
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
