import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, Clock, Info, ArrowRight, ShieldCheck, 
  Zap, Activity, Sparkles, TrendingUp, Filter,
  ChevronRight, RefreshCw, AlertCircle, Loader2,
  Navigation, Globe, Search, Radar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";
import { useToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/shared/feedback/LoadingState";
import { ErrorState } from "@/components/shared/feedback/ErrorState";
import { EmptyState } from "@/components/shared/feedback/EmptyState";
import { BookingStepper } from "@/components/features/BookingStepper";
import { motion, AnimatePresence } from "framer-motion";

interface Rate {
  id: string;
  name: string;
  price: number;
  etaDays: string;
  actualAvgDays: string;
  rating: number;
  recommendation?: string;
}

export default function CourierSelection() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { selectedCourier, setCourier, pickup: bPickup, delivery: bDelivery, packageDetails: bPackage, fetchRates } = useBooking();
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("PRICE");

  const filters = ["ALL", "EXPRESS", "ECONOMY", "AIR"];
  const sorts = ["PRICE", "SPEED", "RATING"];

  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRates();
      // Ensure data is array
      setRates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Uplink synchronization failure: Could not retrieve terminal rates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleSelect = async (rate: Rate) => {
    setIsSelecting(true);
    try {
      setCourier(rate);
      showToast(`${rate.name} assigned to mission node.`, "success");
      navigate('/book/address');
    } catch (err) {
      showToast("Assignment Error: Failed to lock terminal node.", "error");
    } finally {
      setIsSelecting(false);
    }
  };

  const finalRates = useMemo(() => {
    let filtered = [...rates];
    if (filter !== "ALL") {
      filtered = filtered.filter(r => 
        r.name.toUpperCase().includes(filter) || 
        (filter === "EXPRESS" && parseInt(r.etaDays) <= 2)
      );
    }
    
    if (sort === "PRICE") filtered.sort((a, b) => a.price - b.price);
    if (sort === "SPEED") filtered.sort((a, b) => parseInt(a.etaDays) - parseInt(b.etaDays));
    if (sort === "RATING") filtered.sort((a, b) => b.rating - a.rating);
    
    return filtered;
  }, [rates, filter, sort]);

  const cheapestRate = useMemo(() => rates.length > 0 ? [...rates].sort((a, b) => a.price - b.price)[0] : null, [rates]);
  const fastestRate = useMemo(() => rates.length > 0 ? [...rates].sort((a, b) => parseInt(a.etaDays) - parseInt(b.etaDays))[0] : null, [rates]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 pb-32">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10">
        
        {/* MISSION HEADER */}
        <div className="mb-12 border-b border-border/10 pb-12">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                 <Globe className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Logistics Engine 2.4</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter uppercase italic">
             NODE <span className="text-primary not-italic">SELECTION</span>
           </h1>
           <p className="text-muted-foreground font-medium text-lg mt-2 max-w-2xl">Establish an uplink with a logistics provider for your transmission route.</p>
        </div>

        <BookingStepper />
        
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          
          {/* Left: Rate Engine (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {!loading && !error && rates.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                 {/* AI Best Value Card */}
                 <Card className="glass-card border-none rounded-[2.5rem] p-6 relative overflow-hidden group shadow-xl ring-1 ring-primary/20 bg-primary/[0.03]">
                    <div className="absolute top-0 right-0 p-4">
                       <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Best Protocol Yield</p>
                    <div className="flex items-end gap-2 mb-2">
                       <span className="text-3xl font-black tracking-tighter uppercase italic">{cheapestRate?.name}</span>
                       <Badge className="mb-1 bg-emerald-500 text-white border-none text-[10px] font-black tracking-widest uppercase">98% OPTIMAL</Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground italic mb-6">Neural analysis suggests this route as the highest financial efficiency.</p>
                    <Button onClick={() => cheapestRate && handleSelect(cheapestRate)} variant="outline" className="w-full h-12 rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white font-black text-xs uppercase tracking-widest">
                       INITIALIZE UPLINK
                    </Button>
                 </Card>

                 {/* Express Card */}
                 <Card className="glass-card border-none rounded-[2.5rem] p-6 relative overflow-hidden group shadow-xl ring-1 ring-blue-500/20 bg-blue-500/[0.03]">
                    <div className="absolute top-0 right-0 p-4">
                       <Zap className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Maximum Transmission Speed</p>
                    <div className="flex items-end gap-2 mb-2">
                       <span className="text-3xl font-black tracking-tighter uppercase italic">{fastestRate?.name}</span>
                       <Badge className="mb-1 bg-blue-500 text-white border-none text-[10px] font-black tracking-widest uppercase">{fastestRate?.etaDays} DAYS</Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground italic mb-6">Priority routing protocol active. Instant node handovers confirmed.</p>
                    <Button onClick={() => fastestRate && handleSelect(fastestRate)} variant="outline" className="w-full h-12 rounded-xl border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-xs uppercase tracking-widest">
                       INITIALIZE UPLINK
                    </Button>
                 </Card>
              </div>
            )}

            {error && (
              <ErrorState onRetry={loadRates} message={error} title="Protocol Error" />
            )}

            {!error && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card border-none p-6 rounded-[2rem] shadow-lg ring-1 ring-border/5">
                <div className="flex flex-wrap gap-2">
                  {filters.map(f => (
                    <button 
                      key={f} 
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border",
                        filter === f ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-background border-border/40 text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex gap-6 items-center border-t md:border-t-0 pt-4 md:pt-0 border-border/10 w-full md:w-auto">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">SORT BY:</span>
                  <div className="flex gap-2">
                    {sorts.map(s => (
                      <button 
                        key={s} 
                        onClick={() => setSort(s)}
                        className={cn(
                          "px-4 py-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest", 
                          sort === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-6 relative min-h-[500px]">
                {[1,2,3,4].map(i => (
                  <Card key={i} className="glass-card border-none rounded-[2.5rem] p-8 opacity-40 grayscale blur-[1px]">
                    <div className="flex items-center gap-6">
                      <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-3">
                         <Skeleton className="h-6 w-48" />
                         <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-12 w-32 rounded-xl" />
                    </div>
                  </Card>
                ))}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                   <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Syncing Global Fleet Telemetry...</p>
                </div>
              </div>
            ) : !error && (
              <div className="space-y-4">
                {finalRates.length === 0 ? (
                  <EmptyState title="Mission Obstructed" description="No available routes detected for these coordinates." icon={Navigation} onAction={() => navigate('/book/address')} />
                ) : finalRates.map((rate, idx) => (
                  <Card 
                    key={rate.id} 
                    onClick={() => handleSelect(rate)}
                    className={cn(
                      "glass-card border-none p-8 rounded-[2.5rem] transition-all duration-500 group cursor-pointer relative shadow-xl hover:shadow-2xl overflow-hidden", 
                      selectedCourier?.id === rate.id ? "ring-2 ring-primary bg-primary/[0.03]" : "ring-1 ring-border/5 hover:ring-primary/40"
                    )}
                  >
                    {!rate.recommendation && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />}
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                      {/* Courier Identity */}
                      <div className="flex items-center gap-6 w-full sm:w-1/3">
                        <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center border border-border/10 shrink-0 group-hover:scale-110 transition-transform">
                          <Truck className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {rate.id === cheapestRate?.id && <Badge className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-none px-2 h-4">Optimal Value</Badge>}
                            {rate.id === fastestRate?.id && <Badge className="text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border-none px-2 h-4">High Velocity</Badge>}
                          </div>
                          <h4 className="font-heading font-extrabold text-xl text-foreground tracking-tight uppercase italic group-hover:text-primary transition-colors">{rate.name}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                            <TrendingUp className="w-3 h-3" /> Node Rating: {rate.rating}
                          </div>
                        </div>
                      </div>

                      {/* Technical Specs */}
                      <div className="flex-1 grid grid-cols-2 gap-4 w-full border-y sm:border-y-0 sm:border-x border-border/10 py-6 sm:py-0 sm:px-6">
                        <div>
                          <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest mb-1 flex items-center gap-1.5">
                            <Clock className="w-2.5 h-2.5 opacity-40" /> SLA TARGET
                          </div>
                          <div className="font-heading font-extrabold text-lg text-foreground tracking-tight uppercase italic">{rate.etaDays} DAYS</div>
                        </div>
                        <div>
                          <div className="text-[8px] uppercase font-bold text-primary tracking-widest mb-1 flex items-center gap-1.5">
                            <Activity className="w-2.5 h-2.5" /> PROBABILISTIC ETA
                          </div>
                          <div className="font-heading font-extrabold text-lg text-primary tracking-tight uppercase italic">{rate.actualAvgDays} DAYS</div>
                        </div>
                      </div>

                      {/* Pricing Meta */}
                      <div className="flex items-center gap-6 w-full sm:w-auto text-center sm:text-right">
                        <div className="flex-1 sm:flex-none">
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">CONTRACT VALUE</p>
                          <div className="font-heading font-extrabold text-2xl text-foreground tracking-tighter italic">₹{rate.price}</div>
                        </div>
                        <Button 
                          disabled={isSelecting} 
                          className="h-14 px-8 bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary transition-all active:scale-95 group/btn border-none"
                        >
                          {isSelecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "ENGAGE"}
                          <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Order Matrix (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="glass-card border-none rounded-[3rem] p-8 shadow-2xl ring-1 ring-border/5 sticky top-28 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Search className="w-12 h-12" />
              </div>
              <h3 className="font-heading font-black text-2xl mb-8 border-b border-border/10 pb-4 uppercase tracking-tighter italic">MANIFEST</h3>
              
              <div className="relative space-y-10 pl-6">
                <div className="absolute left-[3px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-muted to-blue-500 rounded-full"></div>
                
                <div className="relative">
                  <div className="absolute -left-[27px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">ORIGIN NODE</p>
                  <p className="text-sm font-black text-foreground tracking-tight">{bPickup?.pincode} <span className="text-muted-foreground font-medium opacity-40 mx-2">/</span> MUMB-MH</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[27px] top-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10"></div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">DESTINATION NODE</p>
                  <p className="text-sm font-black text-foreground tracking-tight">{bDelivery?.pincode} <span className="text-muted-foreground font-medium opacity-40 mx-2">/</span> DELH-NCR</p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-border/10 space-y-6">
                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ASSET MASS</span>
                  <span className="text-sm font-black text-foreground">{bPackage?.weight} <span className="text-xs opacity-40">KG</span></span>
                </div>
                
                <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-start gap-4">
                   <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                   <div>
                      <h4 className="text-[11px] font-black uppercase tracking-tight text-primary">VAULT PROTECTION</h4>
                      <p className="text-[10px] font-medium text-muted-foreground leading-relaxed mt-1 italic">Security hash will be cached during the Evidence Uplink phase.</p>
                   </div>
                </div>
              </div>
            </Card>

            <div className="px-6 text-center">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Global Logistics Protocol Active</p>
            </div>
          </div>
        </div>
      </main>

      {/* STICKY ACTION OVERLAY */}
      <AnimatePresence>
        {selectedCourier && (
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-3xl border-t border-primary/20 p-6 shadow-[0_-20px_50px_rgba(255,87,34,0.1)] z-50 transition-all duration-500"
          >
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                   <Truck className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-primary">Terminal Selected</span>
                  </div>
                  <span className="text-2xl font-heading font-black text-foreground tracking-tighter uppercase italic">{selectedCourier.name}</span>
                </div>
                <div className="h-10 w-px bg-border/20 hidden md:block" />
                <div>
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Contract Total</span>
                   <span className="text-3xl font-heading font-black text-primary tracking-tighter">₹{selectedCourier.price}</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/book/address')} 
                className="w-full md:w-auto h-16 px-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-[0_15px_40px_rgba(255,87,34,0.3)] transition-all hover:scale-[1.03] active:scale-95 text-lg group uppercase italic tracking-tight"
              >
                PROCEED TO COORDINATES
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
