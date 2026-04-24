import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, MapPin, Truck, CheckCircle2, 
  Map, Calendar, Phone, Activity, Search, 
  Mail, MessageCircle, RefreshCw, AlertCircle, 
  Package, Zap, ArrowRight, ShieldCheck,
  History, Navigation, Clock, Share2, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Input } from "@/components/ui/input";
import { getTracking } from "@/lib/api";
import { LoadingState } from "@/components/shared/feedback/LoadingState";
import { ErrorState } from "@/components/shared/feedback/ErrorState";
import { EmptyState } from "@/components/shared/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedTimeline } from "@/components/features/AnimatedTimeline";

export default function TrackingPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const awb = params.awb || "AWB123456789IN";

  const fetchTracking = async () => {
    try {
      if (!loading) setIsRefreshing(true);
      setError(null);
      const data = await getTracking(awb);
      setTrackingData(data);
    } catch (err: any) {
      setError(err.message || "Invalid Tracking ID");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [awb]);

  const handleCopy = () => {
    navigator.clipboard.writeText(awb);
    showToast("Signal ID Copied: Access key stored in clipboard.", "success");
  };

  const handleRefresh = async () => {
    await fetchTracking();
    showToast("Telemetry Synchronized: Latest status fetched.", "success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-6">
             <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em] animate-pulse">Establishing Secure Uplink...</p>
          </div>
          <div className="mt-16 w-full max-w-4xl space-y-8 opacity-20 grayscale pointer-events-none">
            <Skeleton className="h-24 w-full rounded-[2rem]" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-40 w-full rounded-[2.5rem]" />
                <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-[2rem]" />
                <Skeleton className="h-32 w-full rounded-[2rem]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <ErrorState 
            message={error || "Target signal lost or relocated."} 
            onRetry={fetchTracking}
            title={error?.includes("Invalid") ? "ID Exception" : "Telemetry Failure"}
          />
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="ghost" 
            className="mt-8 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5"
          >
            ← RETURN TO HQ
          </Button>
        </main>
      </div>
    );
  }

  const currentStatus = trackingData.current_status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  
  const events = trackingData.events.map((ev: any, index: number) => {
    const isCompleted = new Date(ev.timestamp) < new Date();
    const isActive = index === 0;
    
    return {
      id: index,
      title: ev.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      location: ev.location,
      date: new Date(ev.timestamp).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: isCompleted ? "completed" : (isActive ? "active" : "upcoming"),
      past: isCompleted && !isActive
    };
  });
  
  const officialEtaObj = new Date(trackingData.official_eta);
  const aiEtaObj = trackingData.ai_eta ? new Date(trackingData.ai_eta) : officialEtaObj;
  const etaFormatted = officialEtaObj.toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          
          {/* MISSION HEADER */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-12 gap-8 border-b border-border/50 pb-12">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-4">
                <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-background/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Truck className="w-8 h-8 relative z-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Mission Stream</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground tracking-tighter uppercase italic">
                    {currentStatus}
                  </h1>
                  <p className="text-lg text-primary font-black mt-1 uppercase tracking-tight">ETA Window: {etaFormatted}</p>
                </div>
              </div>
            </div>

             <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
                <Button onClick={handleCopy} variant="outline" className="h-12 px-6 bg-background border-border/50 text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95">
                  <Copy className="w-3.5 h-3.5 mr-2" /> COPY ID
                </Button>
                <Button onClick={handleRefresh} className="h-12 px-8 bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 group border-none">
                  <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} /> {isRefreshing ? "SYNCING..." : "RE-SYNC"}
                </Button>
                <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-border/50 hover:bg-muted/50">
                   <Share2 className="w-4 h-4" />
                </Button>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left: Mission Progress */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Telemetry Block */}
               <Card className={cn(
                 "glass-card border-none rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl ring-1 ring-primary/10 relative overflow-hidden",
                 "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-transparent before:opacity-50"
               )}>
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 border border-primary/20 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-[ping_3s_infinite]" />
                    <MapPin className="w-6 h-6 relative z-10" />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-0.5">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Last Node Interception</p>
                     <h3 className="font-heading font-black text-2xl text-foreground tracking-tight uppercase italic">{trackingData.current_location}</h3>
                     <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-40">Timestamp: {events[0]?.date || "Awaiting Update"}</p>
                  </div>
                  <div className="px-5 py-2 rounded-xl bg-background/50 border border-border/50">
                     <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Signal Strong</span>
                     </div>
                  </div>
               </Card>

               <div className="glass-card border-none rounded-[3.5rem] p-4 sm:p-10 shadow-2xl ring-1 ring-border/5">
                  <div className="flex items-center justify-between mb-12 px-4">
                     <h2 className="font-heading font-black text-2xl flex items-center gap-3 uppercase tracking-tighter">
                       <Navigation className="w-7 h-7 text-primary" /> Mission Registry
                     </h2>
                     <Badge variant="outline" className="rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.2em] opacity-40">Telemetry Verified</Badge>
                  </div>
                  
                  <div className="relative pl-6 sm:pl-12 pr-4">
                    {/* Progress Bar Line */}
                    <div className="absolute left-[39px] sm:left-[63px] top-8 bottom-16 w-1 bg-muted/20 rounded-full"></div>
                    <div className="absolute left-[39px] sm:left-[63px] top-8 h-1/2 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]"></div>

                    <div className="space-y-12">
                      {events.map((ev: any, i: number) => (
                        <div key={ev.id} className="relative flex items-start gap-8 group/event">
                          <div className={cn(
                            "w-12 h-12 rounded-[1rem] border-4 flex items-center justify-center shrink-0 mt-0.5 shadow-xl relative z-10 transition-all duration-500",
                            ev.status === "completed" ? "bg-primary border-primary/20 text-white translate-x-0" :
                            ev.status === "active" ? "bg-background border-primary border-[4px] scale-110 shadow-primary/20" :
                            "bg-muted/20 border-border/10 grayscale opacity-40"
                          )}>
                            {ev.status === "completed" && <CheckCircle2 className="w-5 h-5 text-white" />}
                            {ev.status === "active" && <Activity className="w-5 h-5 text-primary animate-pulse" />}
                            {ev.status === "upcoming" && <Clock className="w-5 h-5 text-muted-foreground" />}
                          </div>

                          <div className="flex-1 pb-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div>
                                <h3 className={cn(
                                  "font-black text-xl mb-1 tracking-tight uppercase italic transition-colors", 
                                  ev.past || ev.status === "active" ? "text-foreground" : "text-muted-foreground"
                                )}>
                                  {ev.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                   <MapPin className="w-3.5 h-3.5" /> 
                                   {ev.location}
                                </div>
                              </div>
                              <div className="text-left sm:text-right bg-muted/10 sm:bg-transparent px-4 py-2 sm:p-0 rounded-xl border border-border/5 sm:border-none w-full sm:w-auto">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{ev.date.split(",")[0]}</div>
                                <div className="text-sm font-black text-foreground tracking-tighter">{ev.date.split(",")[1]}</div>
                              </div>
                            </div>
                            
                            {ev.status === "active" && (
                               <div className="mt-4 p-4 bg-primary/5 rounded-[1.25rem] border border-primary/10 animate-in slide-in-from-left-4 duration-1000">
                                  <p className="text-xs font-medium text-muted-foreground leading-relaxed italic pr-4">Node interception successful. Assets are currently being routed through the main terminal for final sorting.</p>
                                </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: Sidebar Metrics */}
            <div className="space-y-8">
              
              <Card className="glass-card border-none rounded-[2.5rem] p-8 shadow-xl ring-1 ring-border/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <h3 className="font-heading font-black text-lg mb-6 uppercase tracking-tighter flex items-center gap-2">
                   <Info className="w-5 h-5 text-primary" /> Asset Specs
                </h3>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Transport</span>
                    <span className="text-sm font-black text-foreground uppercase italic tracking-tight">{trackingData.courier}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/10">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Identifier</span>
                    <span className="text-sm font-black text-primary font-mono select-all tracking-tighter uppercase">{trackingData.awb}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/10">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Init Date</span>
                    <span className="text-sm font-black text-foreground uppercase tracking-tight">{events[events.length - 1]?.date.split(",")[0] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Target ETA</span>
                    <span className="text-sm font-black text-primary uppercase italic tracking-tight">{etaFormatted}</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-foreground text-background border-none shadow-2xl shadow-foreground/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-background/10 relative z-10">
                   <h3 className="font-heading font-black text-lg uppercase tracking-tighter">AI FORECAST</h3>
                   <Zap className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div className="flex items-start gap-4 mt-6 relative z-10">
                   <div className="w-12 h-12 bg-background/10 rounded-2xl flex items-center justify-center shrink-0 border border-background/20 group-hover:bg-primary transition-colors duration-500">
                      <Calendar className="w-6 h-6 text-primary group-hover:text-background" />
                   </div>
                   <div>
                     <p className="text-sm font-black text-background uppercase tracking-tight italic">Prediction: {aiEtaObj.toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                     <p className="text-[10px] text-background/50 font-medium leading-relaxed mt-2 pr-2 italic">Neural analysis suggests a 94% confidence interval for this node arrival window.</p>
                   </div>
                </div>
              </Card>

              <div className="glass-card border-none rounded-[2rem] p-6 text-center shadow-lg ring-1 ring-border/5">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Support Uplink Available</p>
                 <div className="flex flex-col gap-3">
                    <Button onClick={() => window.open('tel:18001234567')} variant="outline" className="w-full text-foreground hover:bg-muted font-black text-[10px] uppercase tracking-widest h-12 border-border/50 transition-all hover:scale-105 rounded-xl shadow-sm">
                      <Phone className="w-4 h-4 mr-2" /> VOICE COMMS
                    </Button>
                    <Button onClick={() => window.open('mailto:support@parcel.in')} variant="outline" className="w-full text-foreground hover:bg-muted font-black text-[10px] uppercase tracking-widest h-12 border-border/50 transition-all hover:scale-105 rounded-xl shadow-sm">
                      <Mail className="w-4 h-4 mr-2" /> RAISE TICKET
                    </Button>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
