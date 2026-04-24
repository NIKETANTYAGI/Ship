import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Search, Download, Plus, Eye, Package, 
  AlertCircle, CheckCircle2, Navigation, 
  ArrowRight, Filter, ChevronDown, RefreshCcw,
  Activity, ListFilter, BoxSelect, History,
  ArrowUpRight, Clock, MapPin, Zap
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { MOCK_SHIPMENTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");

  const tabs = ["ALL", "IN TRANSIT", "EXCEPTIONS", "DELIVERED"];

  const filteredShipments = MOCK_SHIPMENTS.filter((ship) => {
    if (tab === "IN TRANSIT" && ship.status !== "In Transit" && ship.status !== "Out for Delivery") return false;
    if (tab === "EXCEPTIONS" && ship.status !== "Exception" && ship.status !== "Return Pending") return false;
    if (tab === "DELIVERED" && ship.status !== "Delivered") return false;

    if (search) {
      const q = search.toLowerCase();
      if (!ship.awb.toLowerCase().includes(q) && !ship.toCity.toLowerCase().includes(q) && !ship.fromCity.toLowerCase().includes(q) && !ship.courier.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleExportCSV = () => {
    showToast("CSV Exported: System record generated successfully.", "success");
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("delivered")) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (s.includes("exception") || s.includes("return") || s.includes("fail")) return <AlertCircle className="w-5 h-5 text-rose-500" />;
    return <Zap className="w-5 h-5 text-blue-500" />;
  };

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("delivered")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s.includes("exception") || s.includes("return") || s.includes("fail")) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Activity className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Logistics Telemetry</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter text-foreground mb-3">
                SHIPMENT <span className="text-primary italic">HUB</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg">
                Monitor all global nodes and active transmissions in real-time.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <Button 
                onClick={handleExportCSV} 
                variant="outline" 
                className="flex-1 lg:flex-none h-14 bg-background border-border/40 hover:bg-muted font-black rounded-2xl px-6 text-xs tracking-widest uppercase transition-all shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" /> DATA EXPORT
              </Button>
              <Link to="/compare" className="flex-1 lg:flex-none">
                <Button className="h-14 bg-foreground text-background hover:bg-primary hover:text-white font-black rounded-2xl px-8 text-xs tracking-widest uppercase transition-all shadow-xl shadow-primary/10 ring-1 ring-primary/20 group">
                  <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" /> NEW SIGNAL
                </Button>
              </Link>
            </div>
          </div>

          <Card className="bg-transparent border-none overflow-visible">
            
            {/* SEARCH & FILTERS CONTROLS */}
            <div className="glass-card border-none rounded-[2.5rem] p-6 mb-8 flex flex-col xl:flex-row justify-between items-center gap-6 shadow-xl ring-1 ring-border/5">
              
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto p-1.5 bg-muted/20 rounded-[1.5rem] border border-border/10">
                {tabs.map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "px-6 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.1em] relative overflow-hidden",
                      tab === t 
                        ? "bg-foreground text-background shadow-lg scale-105" 
                        : "bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search & Meta */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="relative w-full sm:w-80 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Search AWB or Terminal..." 
                    className="pl-12 h-14 bg-muted/20 border-border/20 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/40 font-bold placeholder:font-medium transition-all" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 group-focus-within:opacity-100 transition-opacity">
                     <div className="px-1.5 py-0.5 border border-border/40 rounded text-[10px] font-bold tracking-tighter shadow-sm bg-background">CMD</div>
                     <div className="px-1.5 py-0.5 border border-border/40 rounded text-[10px] font-bold tracking-tighter shadow-sm bg-background">F</div>
                  </div>
                </div>
                
                <Button variant="outline" className="h-14 w-14 p-0 rounded-2xl border-border/20 hover:bg-muted/20 shrink-0">
                   <ListFilter className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* SHIPMENT LIST */}
            <div className="space-y-4">
              {filteredShipments.length === 0 ? (
                <div className="glass-card border-none rounded-[3rem] py-32 text-center animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                  <div className="w-24 h-24 bg-muted/40 text-muted-foreground/30 rounded-full flex items-center justify-center mb-6 border border-border/20 relative">
                     <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20 scale-150" />
                     <Package className="w-10 h-10 relative z-10" />
                  </div>
                  <h3 className="font-heading font-black text-2xl mb-2 uppercase tracking-tighter">Zero Signals Detected</h3>
                  <p className="text-muted-foreground font-medium max-w-xs mx-auto">Our sensors found no active transmissions matching your protocol parameters.</p>
                  <Button onClick={() => {setTab("ALL"); setSearch("");}} variant="link" className="mt-6 text-primary font-black uppercase tracking-widest text-xs hover:no-underline hover:opacity-80 transition-all flex items-center gap-2">
                     <RefreshCcw className="w-3 h-3" /> RESET ALL SCAN FILTERS
                  </Button>
                </div>
              ) : (
                filteredShipments.map((ship, idx) => (
                  <div 
                    key={ship.awb} 
                    className="glass-card border-none rounded-[2rem] p-6 hover:bg-muted/30 transition-all group relative overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 ring-1 ring-border/5"
                    onClick={() => navigate(`/track/${ship.awb}`)}
                  >
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                      
                      {/* Identity & Status */}
                      <div className="flex items-center gap-6 w-full lg:w-1/4">
                        <div className={cn(
                          "w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 border transition-all duration-500",
                          getStatusStyles(ship.status),
                          "group-hover:scale-110 shadow-lg"
                        )}>
                          {getStatusIcon(ship.status)}
                        </div>
                        <div className="space-y-1">
                          <div className="font-mono font-black text-xl tracking-tighter text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            {ship.awb}
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                             <Clock className="w-3 h-3" />
                             {new Date(ship.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Logistics Route */}
                      <div className="flex-1 w-full flex items-center gap-8 relative px-4">
                         <div className="flex-1 text-center lg:text-left space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] opacity-40">Origin</p>
                            <p className="font-black text-lg tracking-tight truncate">{ship.fromCity}</p>
                         </div>
                         <div className="flex flex-col items-center gap-1.5 px-4 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-border to-transparent relative">
                               <div className="absolute top-1/2 left-0 w-2 h-2 bg-primary rounded-full -translate-y-1/2 animate-[ping_3s_infinite]" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-primary" />
                         </div>
                         <div className="flex-1 text-center lg:text-right space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] opacity-40">Destination</p>
                            <p className="font-black text-lg tracking-tight truncate">{ship.toCity}</p>
                         </div>
                      </div>

                      {/* Technical Specs */}
                      <div className="w-full lg:w-1/4 flex flex-col md:flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-border/10 pt-6 lg:pt-0 lg:pl-10">
                         <div className="flex flex-col items-center lg:items-end gap-2">
                             <Badge variant="outline" className={cn("rounded-lg font-black text-[9px] tracking-[0.15em] uppercase px-4 py-1.5 border transition-all", getStatusStyles(ship.status))}>
                                {ship.status.replace(/_/g, ' ')}
                             </Badge>
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">{ship.courier}</span>
                                <div className="h-1 w-1 rounded-full bg-border" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">{ship.weight}</span>
                             </div>
                         </div>
                         <div className="flex items-center lg:items-end flex-col">
                            <div className="font-black text-2xl tracking-tighter text-foreground">₹{(ship.total_paise / 100).toFixed(2)}</div>
                            <div className="text-[9px] font-black text-primary uppercase tracking-[0.3em] opacity-60">Value Consumed</div>
                         </div>
                      </div>

                      {/* Actions Overlay Hover UI */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 hidden lg:block">
                         <div className="w-12 h-12 rounded-full border border-primary/20 bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all">
                            <ArrowUpRight className="w-6 h-6" />
                         </div>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-12 text-center flex flex-col items-center gap-6">
               <div className="px-6 py-2 rounded-full bg-muted/20 border border-border/5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                 Displaying {filteredShipments.length} <span className="mx-2 text-border">/</span> {MOCK_SHIPMENTS.length} total nodes synchronized
               </div>
               
               <div className="flex items-center gap-3">
                  <Button variant="outline" className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-border/40 hover:bg-muted/20 transition-all opacity-40 hover:opacity-100 disabled:opacity-20 cursor-not-allowed">
                     Previous Page
                  </Button>
                  <Button variant="outline" className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest bg-foreground text-background border-none hover:bg-primary hover:text-white transition-all shadow-xl shadow-foreground/5 active:scale-95 disabled:opacity-20 cursor-not-allowed">
                     Continue Stream
                  </Button>
               </div>
            </div>

          </Card>
        </div>
      </main>

    </div>
  );
}
