import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Globe, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"domestic" | "international" | "both">("both");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl tracking-tight text-foreground mb-6">
              Transparent pricing.<br />
              <span className="text-primary">Zero hidden fees.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              We aggregate rates from India's top couriers to give you enterprise-grade shipping discounts from day one.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-card rounded-full p-1 border border-border shadow-sm">
              <button 
                onClick={() => setView("domestic")}
                className={cn("px-6 py-2.5 rounded-full text-sm font-semibold transition-all", view === "domestic" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground")}
              >
                Domestic
              </button>
              <button 
                onClick={() => setView("international")}
                className={cn("px-6 py-2.5 rounded-full text-sm font-semibold transition-all", view === "international" ? "bg-tertiary text-white shadow-md" : "text-muted-foreground hover:text-foreground")}
              >
                International
              </button>
              <button 
                onClick={() => setView("both")}
                className={cn("px-6 py-2.5 rounded-full text-sm font-semibold transition-all", view === "both" ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground")}
              >
                Compare Both
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {/* Domestic Card */}
            {(view === "domestic" || view === "both") && (
              <Card className="relative p-8 rounded-[2rem] border-0 shadow-lg bg-card overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary group-hover:w-3 transition-all duration-300"></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
                      <Package className="w-5 h-5" /> Domestic Shipping
                    </div>
                    <div className="font-heading text-4xl font-bold">From ₹45 <span className="text-sm text-muted-foreground font-medium">/500g</span></div>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {["Standard (3-5 days)", "Express (1-2 days)", "Same Day Delivery (Metro)", "Heavy / LTL Surface Cargo"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground font-medium">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-muted-foreground font-medium pt-2 border-t border-border/50">
                    <span className="font-semibold text-foreground">Partners:</span> Delhivery, DTDC, XpressBees...
                  </li>
                </ul>

                <Button onClick={() => navigate('/compare')} className="w-full h-14 bg-gradient-to-r from-[#a33900] to-[#cc4900] hover:from-[#8c3100] hover:to-[#a33900] text-lg font-semibold rounded-xl text-white shadow-lg shadow-primary/25">
                  Book Domestic
                </Button>
              </Card>
            )}

            {/* International Card */}
            {(view === "international" || view === "both") && (
              <Card className="relative p-8 rounded-[2rem] border-0 shadow-lg bg-card overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-tertiary group-hover:w-3 transition-all duration-300"></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-tertiary font-semibold mb-2">
                      <Globe className="w-5 h-5" /> International Shipping
                    </div>
                    <div className="font-heading text-4xl font-bold">From ₹750 <span className="text-sm text-muted-foreground font-medium">/docs</span></div>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {["Economy (5-10 days)", "Standard (3-5 days)", "Express (1-3 days)", "Customs Clearance Included"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground font-medium">
                      <div className="w-5 h-5 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-muted-foreground font-medium pt-2 border-t border-border/50">
                    <span className="font-semibold text-foreground">Partners:</span> DHL, FedEx, UPS, Aramex
                  </li>
                </ul>

                <Button onClick={() => navigate('/international')} className="w-full h-14 bg-tertiary hover:bg-tertiary/90 text-lg font-semibold rounded-xl text-white shadow-lg shadow-tertiary/25 transition-all">
                  Book International
                </Button>
              </Card>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
            <Card className="p-8 bg-primary/5 border-l-4 border-l-primary border-y-0 border-r-0 rounded-2xl">
              <h3 className="font-heading text-xl font-bold mb-2">Expanding in India?</h3>
              <p className="text-muted-foreground">Open your business to 27,000+ pincodes instantly. We handle RTOs and fast COD remittance so you can focus on growth.</p>
            </Card>
            <Card className="p-8 bg-tertiary/5 border-l-4 border-l-tertiary border-y-0 border-r-0 rounded-2xl">
              <h3 className="font-heading text-xl font-bold mb-2">Going Global?</h3>
              <p className="text-muted-foreground">Ship to 220 countries seamlessly. Generate commercial invoices automatically and get enterprise rates on air freight.</p>
            </Card>
          </div>
        </div>
        <FaqAccordion />
      </main>
    </div>
  );
}
