import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion() {
  const faqs = [
    {
      question: "How do I know which courier is best for my route?",
      answer: "When you enter your pickup and delivery pincodes, our rate comparison engine instantly queries 10+ logistics partners. It then sorts them by Price, Speed, and our proprietary 'AI Reliability Insight' which uses historical data to tell you whether the courier actually delivers on time.",
    },
    {
      question: "What is the Evidence Vault?",
      answer: "Weight disputes are a common issue in shipping. Evidence Vault lets you upload a 10-second video or photo of your packed parcel on our weighing scale. We generate a SHA-256 tamper-proof hash. If a courier raises a weight dispute, this evidence is automatically submitted to resolve it in your favor.",
    },
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Yes, COD is available for domestic shipments across 20,000+ pincodes. You can collect COD amounts easily, and we remit the collected funds to your registered bank account bi-weekly.",
    },
    {
      question: "Can I ship internationally using PARCEL?",
      answer: "Absolutely! We've partnered with DHL, FedEx, and Aramex to offer heavily discounted international rates. You can ship to 220+ countries, with full support for commercial invoices and customs declarations right from our dashboard.",
    },
    {
      question: "Is there a minimum volume commitment?",
      answer: "No. PARCEL is built for everyone—from an individual sending a gift to their parents, to a D2C brand shipping 1,000 orders a day. You only pay for what you ship, with zero monthly platform fees.",
    }
  ];

  return (
    <section className="py-24 bg-muted/10 border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-5xl tracking-tight text-foreground mb-4 uppercase italic">
            FREQUENTLY ASKED <span className="text-primary not-italic">QUESTIONS</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium italic opacity-60">
            Everything you need to know about the platform protocols.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
        <Accordion className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border/10 px-6 py-2 bg-background/50 backdrop-blur-sm rounded-[1.5rem] transition-all hover:bg-background shadow-sm hover:shadow-md">
              <AccordionTrigger className="text-left font-black text-lg hover:no-underline uppercase italic tracking-tight gap-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2 pb-6 italic opacity-80">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </div>
      </div>
    </section>
  );
}
