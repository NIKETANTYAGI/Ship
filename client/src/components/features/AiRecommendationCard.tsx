import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Courier {
  id: number | string;
  name: string;
  price: number;
  etaDays: number;
  rating: number;
  [key: string]: any;
}

interface AiRecommendationCardProps {
  rates: Courier[];
}

export function AiRecommendationCard({ rates }: AiRecommendationCardProps) {
  if (!rates || rates.length === 0) return null;

  // 1. Cheapest
  const cheapest = [...rates].sort((a, b) => a.price - b.price)[0];

  // 2. Fastest
  const fastest = [...rates].sort((a, b) => a.etaDays - b.etaDays)[0];

  // 3. Best Value (Balance of Rating and Price)
  // Simple heuristic: rating / price * 1000 (higher is better)
  const bestValue = [...rates].sort((a, b) => {
    const scoreA = (a.rating * 10) / (a.price / 100);
    const scoreB = (b.rating * 10) / (b.price / 100);
    return scoreB - scoreA;
  })[0];

  const recommendations = [
    {
      label: "Cheapest",
      courier: cheapest,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      label: "Fastest",
      courier: fastest,
      icon: <Zap className="w-4 h-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      label: "Best Value",
      courier: bestValue,
      icon: <ShieldCheck className="w-4 h-4" />,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20"
    }
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 p-6 rounded-3xl shadow-xl shadow-primary/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
          <Sparkles className="w-8 h-8 text-primary/10 animate-pulse" />
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
            <h3 className="font-heading font-bold text-lg text-foreground leading-tight">AI Smartshelf</h3>
            <p className="text-xs text-muted-foreground font-medium">Personalized recommendations for your shipment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div 
            key={rec.label}
            className={cn(
              "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
              rec.bgColor,
              rec.borderColor,
              rec.courier.name === bestValue.name && rec.label === "Best Value" ? "ring-2 ring-primary/20 shadow-lg shadow-primary/10" : "shadow-sm"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className={cn("bg-card border-none font-bold text-[10px] uppercase tracking-wider", rec.color)}>
                <span className="flex items-center gap-1">{rec.icon} {rec.label}</span>
              </Badge>
              {rec.label === "Best Value" && (
                  <Badge className="bg-primary text-white text-[10px] font-bold border-none">RECOMMENDED</Badge>
              )}
            </div>
            
            <h4 className="font-heading font-extrabold text-xl text-foreground mb-1">{rec.courier.name}</h4>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-heading font-bold text-foreground">₹{rec.courier.price}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">{rec.courier.etaDays} Days Delivery</div>
              </div>
              <div className="text-xs font-bold text-yellow-500 flex items-center gap-0.5">
                  {rec.courier.rating} ★
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-center gap-2">
        <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <span className="text-primary">⭐ AI Recommends:</span>
            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs uppercase tracking-widest">{bestValue.name}</span>
        </div>
      </div>
    </Card>
  );
}
