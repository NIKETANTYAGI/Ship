import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin, Package, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('domestic');
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [weight, setWeight] = useState('');

  const handleGetRates = () => {
    if (tab === 'international') {
      navigate('/international');
    } else {
      const params = new URLSearchParams();
      if (pickup) params.append('pickup', pickup);
      if (delivery) params.append('delivery', delivery);
      if (weight) params.append('weight', weight);
      navigate(`/compare?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3"></div>

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[75vh]">
            
            {/* Left Content */}
            <div className="flex flex-col gap-6 max-w-2xl">
              <Badge variant="outline" className="w-fit text-primary border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium rounded-full shadow-sm">
                India's Unified Shipping Hub
              </Badge>
              
              <h1 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.1] text-foreground tracking-tight">
                Ship anything, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  anywhere across the globe.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                Compare rates from Delhivery, Bluedart, XpressBees & 10+ partners. Book instantly. Track in real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button onClick={() => navigate('/compare')} size="lg" className="h-14 px-8 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-lg font-semibold rounded-xl text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-105 group">
                  Compare Rates <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => navigate('/track/SR2024031500123')} size="lg" variant="outline" className="h-14 px-8 text-lg font-medium rounded-xl border-border bg-background/50 backdrop-blur-sm lg:hover:bg-background shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  Track Shipment
                </Button>
              </div>

              {/* Trust Bar Inline */}
              <div className="flex items-center gap-8 mt-8 pt-8 border-t border-border/60">
                <div>
                  <div className="font-heading font-bold text-2xl text-foreground">27k+</div>
                  <div className="text-sm text-muted-foreground font-medium">Pincodes</div>
                </div>
                <div>
                  <div className="font-heading font-bold text-2xl text-foreground">10+</div>
                  <div className="text-sm text-muted-foreground font-medium">Partners</div>
                </div>
                <div>
                  <div className="font-heading font-bold text-2xl text-foreground">99%</div>
                  <div className="text-sm text-muted-foreground font-medium">SLA Match</div>
                </div>
              </div>
            </div>

            {/* Right Content - Rate Calculator Widget */}
            <div className="relative w-full max-w-lg mx-auto lg:ml-auto">
              {/* Floating elements behind card */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]"></div>
              
              <Card className="relative bg-card/80 backdrop-blur-2xl border border-border p-8 rounded-[1.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]">
                <div className="flex gap-4 mb-8">
                  <div onClick={() => setTab('domestic')} className={`flex-1 pb-3 text-center border-b-2 cursor-pointer font-semibold transition-colors ${tab === 'domestic' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Domestic</div>
                  <div onClick={() => setTab('international')} className={`flex-1 pb-3 text-center border-b-2 cursor-pointer font-semibold transition-colors ${tab === 'international' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>International</div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pickup</label>
                       <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-tertiary"></div>
                         <Input 
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            placeholder="Pincode e.g 400001" 
                            className="h-12 pl-8 border-border bg-background shadow-sm focus-visible:ring-primary/20" 
                         />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery</label>
                       <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"></div>
                         <Input 
                            value={delivery}
                            onChange={(e) => setDelivery(e.target.value)}
                            placeholder="Pincode e.g 110001" 
                            className="h-12 pl-8 border-border bg-background shadow-sm focus-visible:ring-primary/20" 
                         />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parcel Details</label>
                     <div className="flex flex-col sm:flex-row gap-4">
                       <Input 
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Weight (kg)" 
                          type="number" 
                          step="0.1" 
                          className="h-12 border-border bg-background shadow-sm flex-1 focus-visible:ring-primary/20"
                       />
                     </div>
                  </div>

                  <Button onClick={handleGetRates} className="w-full h-14 mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-lg shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1">
                    Get Best Rates
                  </Button>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Powered by 10+ logistics partners</span>
                </div>
              </Card>
            </div>
          </div>
          
        </div>
      </main>

      <FeatureBento />
      <FaqAccordion />
    </div>
  );
}
