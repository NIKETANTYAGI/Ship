import { Card } from "@/components/ui/card";
import { TrendingDown, IndianRupee, Truck, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_COURIERS } from "@/lib/mockData";
import { useMemo } from "react";

interface SavingsBannerProps {
  selectedPrice?: number;
  className?: string;
}

export function SavingsBanner({ selectedPrice, className }: SavingsBannerProps) {
  // Memoize calculations from MOCK_COURIERS
  const { averagePrice, cheapestPrice, prices } = useMemo(() => {
    const pricesList = MOCK_COURIERS.map(c => c.price);
    const avg = Math.round(pricesList.reduce((a, b) => a + b, 0) / pricesList.length);
    const cheap = Math.min(...pricesList);
    return { averagePrice: avg, cheapestPrice: cheap, prices: pricesList };
  }, []);
  
  // If no price selected, use the cheapest as default for calculation
  const currentPrice = selectedPrice || cheapestPrice;
  
  const savings = averagePrice - currentPrice;

  return (
    <Card className={cn("bg-card border-primary/10 p-5 rounded-2xl shadow-sm overflow-hidden relative group", className)}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingDown className="w-16 h-16 text-primary" />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-background shadow-sm border border-border flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-foreground">Savings Intelligence</h3>
            <p className="text-xs text-muted-foreground font-medium">Real-time market price comparison</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          <div className="text-center md:text-left">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 flex items-center justify-center md:justify-start gap-1">
              💰 Market Avg
            </div>
            <div className="font-heading font-bold text-lg text-foreground/70 line-through decoration-muted-foreground/30">₹{averagePrice}</div>
          </div>

          <div className="text-center md:text-left">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 flex items-center justify-center md:justify-start gap-1">
              🚚 Your Price
            </div>
            <div className="font-heading font-extrabold text-xl text-foreground">₹{currentPrice}</div>
          </div>

          <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-xl border border-primary/10 shadow-sm">
            {savings > 0 ? (
              <>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <PartyPopper className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-primary tracking-wider">You Saved</div>
                  <div className="font-heading font-extrabold text-xl text-primary leading-tight">₹{savings}</div>
                </div>
              </>
            ) : (
              <div className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Best price already selected
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    )
}
