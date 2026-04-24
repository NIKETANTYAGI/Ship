import { MapPin, ShieldCheck, Zap, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FeatureBento() {
  return (
    <section className="py-24 bg-background relative border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-5xl tracking-tight text-foreground mb-4">
            Shipping Intelligence, built for <span className="text-primary">everyone</span>.
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Stop guessing which courier is best. Our platform automatically finds the cheapest, fastest, and most reliable option for your specific pincode.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* GPS Tracking Card - Dark Theme */}
          <Card className="md:col-span-2 bg-foreground text-background dark:bg-card dark:text-foreground p-8 rounded-3xl relative overflow-hidden border-0 shadow-2xl flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-colors duration-500"></div>
            
            <div className="relative z-10 max-w-md">
              <div className="w-12 h-12 bg-background/10 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-3 text-background dark:text-foreground">Live Precision Tracking</h3>
              <p className="text-background/70 dark:text-muted-foreground text-lg leading-relaxed mb-8 italic">
                Watch your parcel move on a live map. Our AI predicts exact delivery windows based on historical courier data for your route.
              </p>
            </div>
            
            {/* Mock UX Graphic inside card */}
            <div className="relative z-10 w-full bg-background/5 border border-background/10 rounded-2xl p-4 mt-auto">
              <div className="flex items-center gap-4">
                <div className="relative w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
                <div className="text-sm font-medium text-background/80 dark:text-muted-foreground/80">Out for delivery • Reaching by 4:30 PM</div>
              </div>
              <div className="w-full h-1 bg-background/10 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/60 w-[85%] rounded-full transition-all duration-1000"></div>
              </div>
            </div>
          </Card>

          {/* Swift Evidence Vault Card */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 rounded-3xl relative overflow-hidden border-0 shadow-xl group">
            <div className="absolute top-0 right-0 w-full h-full bg-primary/20 opacity-20 mix-blend-overlay"></div>
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 bg-background/10 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-primary-foreground/80" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-3 text-primary-foreground uppercase italic tracking-tighter">Evidence Vault</h3>
              <p className="text-primary-foreground/80 text-lg leading-relaxed flex-1 italic">
                Upload a photo before shipping. We generate a tamper-proof SHA-256 hash. Zero weight disputes.
              </p>
              
              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-primary-foreground/60 uppercase tracking-widest italic">
                 <Zap className="w-4 h-4 text-primary-foreground" /> Instant dispute resolution
              </div>
            </div>
          </Card>

          {/* Pincode Reach */}
          <Card className="bg-muted/50 border border-border/40 p-8 rounded-3xl hover:border-primary/30 transition-all hover:bg-muted/80 group">
            <div className="w-12 h-12 bg-background rounded-xl shadow-sm flex items-center justify-center mb-6 text-primary border border-border/10 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">27,000+ Pincodes</h3>
            <p className="text-muted-foreground italic">From Metros to Tier-3 towns, we cover 99% of India.</p>
          </Card>

          {/* Machine Learning */}
          <Card className="bg-muted/50 border border-border/40 p-8 rounded-3xl hover:border-primary/30 transition-all hover:bg-muted/80 group">
            <div className="w-12 h-12 bg-background rounded-xl shadow-sm flex items-center justify-center mb-6 text-primary border border-border/10 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading mb-2 uppercase italic tracking-tighter text-foreground">AI Delivery Insights</h3>
            <p className="text-muted-foreground italic">We expose real SLA times vs promised SLA to help you choose the best courier.</p>
          </Card>

          {/* COD Support */}
          <Card className="bg-muted/50 border border-border/40 p-8 rounded-3xl hover:border-primary/30 transition-all hover:bg-muted/80 group">
            <div className="w-12 h-12 bg-background rounded-xl shadow-sm flex items-center justify-center mb-6 text-emerald-500 border border-border/10 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">Fast COD Remittance</h3>
            <p className="text-muted-foreground italic">Get Cash on Delivery payments settled directly to your bank account twice a week.</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
