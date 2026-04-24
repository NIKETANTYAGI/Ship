import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  MapPin,
  Truck,
  Clock,
  CreditCard,
  User,
  Phone,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  History,
  Info
} from "lucide-react";
import { getShipmentDetail } from "@/lib/api";
import { LoadingState } from "@/components/shared/feedback/LoadingState";
import { ErrorState } from "@/components/shared/feedback/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AnimatedTimeline } from "@/components/features/AnimatedTimeline";

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShipmentDetail(id!);
      setShipment(data);
    } catch (err: any) {
      setError(err.message || "Shipment not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-32 max-w-5xl">
        <div className="flex flex-col items-center justify-center space-y-8">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em] animate-pulse">Syncing Telemetry Data...</p>
        </div>
        <div className="mt-16 space-y-6 opacity-20 grayscale">
            <Skeleton className="h-32 w-full rounded-[2rem]" />
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-[600px] md:col-span-2 rounded-[2.5rem]" />
              <div className="space-y-6">
                <Skeleton className="h-64 rounded-[2rem]" />
                <Skeleton className="h-32 rounded-[2rem]" />
              </div>
            </div>
        </div>
      </main>
    </div>
  );

  if (error || !shipment) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <ErrorState message={error || "Terminal response timed out"} onRetry={fetchDetail} title="Logic Exception" />
        <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mt-8 font-black text-xs uppercase tracking-widest text-primary hover:bg-primary/5">
          <ArrowLeft className="w-4 h-4 mr-2" /> REVERT TO COMMAND CENTER
        </Button>
      </main>
    </div>
  );

  const statusLabel = shipment.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  
  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s.includes('fail') || s.includes('exception')) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    if (s.includes('transit')) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          
          {/* HIGH-FIDELITY HEADER */}
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="flex items-start gap-6">
              <Button onClick={() => navigate(-1)} variant="outline" size="icon" className="w-12 h-12 rounded-2xl bg-background border-border/40 shadow-sm shrink-0 hover:bg-muted group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Signal Transmission Active</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground tracking-tighter flex items-center gap-3 uppercase">
                  <Package className="w-8 h-8 text-primary" /> NODE #{shipment.awb || shipment.id.slice(0,8)}
                </h1>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Synchronized on {new Date(shipment.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge className={cn(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] border transition-all",
                getStatusStyles(shipment.status)
              )}>
                {shipment.status === 'failed_attempt' ? "Attempt Exception" : statusLabel}
              </Badge>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Protocol: P2P-SECURE</div>
            </div>
          </div>

          {shipment.status === 'failed_attempt' && (
            <Card className="glass-card mb-12 p-8 border-none rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-rose-500/5 ring-1 ring-rose-500/20 animate-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-rose-500/20">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="text-xl font-black text-rose-500 uppercase tracking-tighter">Delivery Exception Detected</h3>
                  </div>
                  <p className="text-muted-foreground font-medium leading-relaxed max-w-md">The target recipient was offline at the destination node. Automatic retry scheduled for the next logistics window.</p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Button className="flex-1 md:flex-none h-14 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl px-10 text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20">
                  RESCHEDULE
                </Button>
                <Button variant="outline" className="flex-1 md:flex-none h-14 border-rose-500/20 bg-background text-rose-500 font-black rounded-2xl px-8 text-xs uppercase tracking-widest hover:bg-rose-500/5">
                  UPLINK HELP
                </Button>
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Col: Timeline & Addresses */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Timeline Section */}
              <div className="glass-card border-none rounded-[3rem] p-8 shadow-xl ring-1 ring-border/5">
                <div className="flex items-center gap-3 mb-8">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-black text-lg uppercase tracking-tighter">Transmission Registry</h3>
                </div>
                <AnimatedTimeline currentStatus={statusLabel} className="bg-transparent border-none p-0 shadow-none mb-0" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Pickup Card */}
                <Card className="glass-card border-none p-8 rounded-[2.5rem] shadow-lg ring-1 ring-border/5 relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center gap-2 mb-6 text-primary/60 font-black uppercase tracking-[0.2em] text-[10px]">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    Origin Node
                  </div>
                  <h4 className="font-black text-foreground text-xl mb-3 tracking-tight">{shipment.pickup_address.name}</h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed italic pr-4">{shipment.pickup_address.address}</p>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="px-4 py-2 bg-muted/20 border border-border/10 rounded-xl inline-block w-fit">
                      <span className="font-black text-foreground text-xs uppercase">{shipment.pickup_address.city}, {shipment.pickup_address.pincode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-muted-foreground tracking-widest uppercase opacity-60">
                      <Phone className="w-3.5 h-3.5" /> +91 {shipment.pickup_address.phone}
                    </div>
                  </div>
                </Card>

                {/* Delivery Card */}
                <Card className="glass-card border-none p-8 rounded-[2.5rem] shadow-lg ring-1 ring-border/5 relative overflow-hidden group">
                  <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center gap-2 mb-6 text-primary/60 font-black uppercase tracking-[0.2em] text-[10px]">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    Terminal Node
                  </div>
                  <h4 className="font-black text-foreground text-xl mb-3 tracking-tight">{shipment.delivery_address.name}</h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed italic pr-4">{shipment.delivery_address.address}</p>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="px-4 py-2 bg-muted/20 border border-border/10 rounded-xl inline-block w-fit">
                      <span className="font-black text-foreground text-xs uppercase">{shipment.delivery_address.city}, {shipment.delivery_address.pincode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-muted-foreground tracking-widest uppercase opacity-60">
                      <Phone className="w-3.5 h-3.5" /> +91 {shipment.delivery_address.phone}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Item Details */}
              <Card className="glass-card border-none p-8 rounded-[3rem] shadow-lg ring-1 ring-border/5">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-heading font-black text-xl flex items-center gap-3 uppercase tracking-tighter">
                      <FileText className="w-6 h-6 text-primary" /> Payload Specifications
                    </h3>
                    <div className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black text-primary uppercase tracking-[0.2em]">Verified Secure</div>
                </div>
                <div className="grid sm:grid-cols-3 gap-10">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Classification</p>
                    <p className="text-lg font-black text-foreground tracking-tight uppercase italic">{shipment.content_type || "Standard Asset"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Mass Index</p>
                    <p className="text-lg font-black text-foreground tracking-tight">{shipment.weight >= 1000 ? `${(shipment.weight/1000).toFixed(1)} KG` : `${shipment.weight} G`}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Node Protection</p>
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-lg tracking-tight">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      ₹{shipment.insured_value || "0"}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Col: Payment & Sidebar */}
            <div className="space-y-8">
              
              <Card className="glass-card border-none p-8 rounded-[2.5rem] shadow-xl ring-1 ring-border/5">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-heading font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" /> Ledger Details
                    </h3>
                    <Info className="w-4 h-4 text-muted-foreground/30" />
                </div>
                <div className="space-y-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Protocol Fee</span>
                      <span className="font-black text-foreground">₹{shipment.total_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Protection Premium</span>
                      <span className="font-black text-foreground">₹0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Resource Tax (18%)</span>
                      <span className="font-black text-foreground">₹{(shipment.total_price * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="pt-6 border-t border-border/10 flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-primary tracking-[0.3em]">Total Consumed</span>
                        <div className="text-3xl font-heading font-black text-foreground tracking-tighter">₹{(shipment.total_price * 1.18).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 rounded-2xl p-4 flex items-center gap-3 border border-emerald-500/20 mt-4 animate-in fade-in duration-1000">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Transaction Decrypted & Settled</span>
                    </div>
                </div>
              </Card>

              <button
                className="w-full glass-card border-none p-8 bg-primary text-white rounded-[2.5rem] shadow-2xl shadow-primary/20 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => navigate(`/track/${shipment.awb}`)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-background/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-2 font-mono">Live Telemetry</p>
                    <h4 className="font-heading font-black text-2xl tracking-tighter uppercase italic">NODE TRACKER</h4>
                  </div>
                  <div className="w-14 h-14 bg-background/20 rounded-2xl flex items-center justify-center group-hover:bg-background group-hover:text-primary transition-all duration-500 shadow-xl">
                      <Activity className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] relative z-10">
                  ACCESS SECURE STREAM <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <div className="glass-card border-none rounded-[2rem] p-6 shadow-lg ring-1 ring-border/5">
                <div className="flex items-center gap-2 mb-6">
                    <History className="w-4 h-4 text-muted-foreground/40" />
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Support Uplink</p>
                </div>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-between font-black text-[10px] tracking-widest uppercase h-12 border-border/40 rounded-xl hover:bg-muted/20">
                    REPORT EXCEPTION <ChevronRight className="w-4 h-4 opacity-30" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between font-black text-[10px] tracking-widest uppercase h-12 border-border/40 rounded-xl hover:bg-muted/20">
                    LEDGER INVOICE <ChevronRight className="w-4 h-4 opacity-30" />
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
