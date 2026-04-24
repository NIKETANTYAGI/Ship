import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Truck, CheckCircle, Plus, Search, 
  ShieldCheck, Settings, History, Globe, Wallet,
  Zap, Activity, Sparkles, LayoutGrid, Clock,
  ChevronRight, ArrowUpRight, TrendingUp, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { getDashboardData } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/context/ToastContext";

interface Shipment {
  id: string;
  db_id: string;
  courier: string;
  status: string;
  price: number;
  date: string;
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
  if (s.includes("transit") || s.includes("out")) return "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
  if (s.includes("fail") || s.includes("cancel") || s.includes("exception")) return "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
  return "bg-slate-500/10 text-slate-500 border-slate-500/20";
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState("All");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, savings: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData(1, 10, filter);
      
      const mappedShipments = (data.shipments || []).map((s: any) => {
        const formatStatus = (st: string) => {
          if (st === "cancelled") return "Failed";
          return st.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        };

        return {
          id: s.awb_number || s.shipment_id,
          db_id: s.shipment_id,
          courier: s.courier_name || s.courier_id,
          status: formatStatus(s.status),
          price: s.total_paise / 100,
          date: new Date(s.created_at || new Date()).toLocaleString('en-US', { day: '2-digit', month: 'short' })
        };
      });
      
      setShipments(mappedShipments);
      if (data.pagination) {
        setStats(prev => ({ ...prev, total: data.pagination.total }));
      }
    } catch (err: any) {
      showToast("Sync Error: Command Center failed to retrieve uplink data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filter]);

  const inTransitCount = useMemo(() => 
    shipments.filter(s => s.status.toLowerCase().includes('transit') || s.status.toLowerCase().includes('out')).length, 
    [shipments]
  );

  const deliveredCount = useMemo(() => 
    shipments.filter(s => s.status.toLowerCase().includes('delivered')).length, 
    [shipments]
  );

  const profileCompleteness = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    if (user.name) score += 25;
    if (user.email) score += 25;
    if (user.kycVerified) score += 50;
    return score;
  }, [user]);

  const quickActions = [
    { title: "Book Parcel", icon: Plus, link: "/compare", color: "text-primary bg-primary/10", desc: "Dispatch new" },
    { title: "Vault", icon: ShieldCheck, link: "/book/evidence", color: "text-blue-500 bg-blue-500/10", desc: "Security logs" },
    { title: "Lexicon", icon: Globe, link: "/profile/addresses", color: "text-purple-500 bg-purple-500/10", desc: "Manage nodes" },
    { title: "Finances", icon: Wallet, link: "/finances", color: "text-emerald-500 bg-emerald-500/10", desc: "Wallet flux" },
    { title: "Protocol", icon: Activity, link: "/profile/kyc", color: "text-amber-500 bg-amber-500/10", desc: "Identity" },
    { title: "Engine", icon: Settings, link: "/profile", color: "text-slate-500 bg-slate-500/10", desc: "Configure" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10 pb-20">
        
        {/* COMMAND HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h1 className="text-5xl font-heading font-black tracking-tighter mb-2 animate-in fade-in slide-in-from-left duration-700">
              COMMAND <span className="text-primary italic">CENTER</span>
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm tracking-widest uppercase opacity-70">
                Welcome back, Operator {user?.name?.split(' ')[0] || 'User'} <span className="mx-2">•</span> Uplink Active
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
             <div className="flex-1 lg:flex-none glass-card border-none px-6 py-3 rounded-2xl flex items-center gap-4 group cursor-help transition-all hover:bg-muted/30">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                   <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Revenue Yield</p>
                   <p className="text-lg font-black tracking-tight">₹{user?.moneySaved || 540} saved</p>
                </div>
             </div>
             <Button 
               onClick={() => navigate('/compare')} 
               className="flex-1 lg:flex-none h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-10 shadow-[0_15px_40px_rgba(255,87,34,0.3)] transition-all hover:scale-[1.03] active:scale-95 text-lg group"
             >
               <Plus className="w-6 h-6 mr-2 transition-transform group-hover:rotate-90" />
               DISPATCH PARCEL
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* STATS MATRIX (Left 8) */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Nodes", value: stats.total || shipments.length, icon: BoxSelect, color: "text-primary bg-primary/10" },
                { label: "Neural Link", value: inTransitCount, icon: Zap, color: "text-blue-500 bg-blue-500/10" },
                { label: "Protocol End", value: deliveredCount, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
                { label: "Wallet Flux", value: `₹${user?.wallet || 0}`, icon: Wallet, color: "text-amber-500 bg-amber-500/10", highlight: true },
              ].map((stat, i) => (
                <div key={i} className={cn(
                  "p-6 group cursor-default transition-all duration-300 relative overflow-hidden glass-card rounded-[2.5rem] border-border/50",
                  stat.highlight && "bg-primary/5 ring-2 ring-primary/20 border-primary/30"
                )}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-border/40 shadow-sm transition-transform group-hover:-translate-y-1", stat.color)}>
                    {stat.icon && <stat.icon className="w-6 h-6" />}
                  </div>
                  <div className="text-3xl font-black text-foreground tracking-tighter leading-none mb-2">
                    {loading ? <Skeleton className="h-8 w-16" /> : stat.value}
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* OPERATION HUB */}
            <section className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h3 className="font-heading font-black text-2xl tracking-tight flex items-center gap-3">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                    OPERATION HUB
                  </h3>
                  <div className="h-[1px] flex-1 bg-border/20 mx-6 hidden md:block" />
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {quickActions.map((action, i) => (
                    <Link key={i} to={action.link} className="group flex flex-col items-center">
                      <div className="w-full aspect-square glass-card rounded-3xl p-6 flex items-center justify-center mb-3 transition-all group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:-translate-y-2 group-hover:bg-muted/40 relative overflow-hidden border-border/30 group-hover:border-primary/50">
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br transition-opacity", action.color.split(' ')[1])} />
                        <action.icon className={cn("w-8 h-8 relative z-10 transition-transform group-hover:scale-110", action.color.split(' ')[0])} />
                      </div>
                      <span className="text-[11px] font-black text-foreground tracking-widest uppercase">{action.title}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mt-0.5">{action.desc}</span>
                    </Link>
                  ))}
               </div>
            </section>

            {/* SIGNAL LEDGER (Recent Shipments) */}
            <Card className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-border/50">
              <div className="p-8 border-b border-border/40 flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-2xl tracking-tighter">SIGNAL LEDGER</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Recent telemetry logs</p>
                  </div>
                </div>
                <Link to="/shipments">
                  <Button variant="ghost" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                    View Complete Flux <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                   <thead className="bg-muted/10 border-b border-border/20">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Identity / AWB</th>
                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Uplink</th>
                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">System Status</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Operation</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border/20">
                      {!loading && shipments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                             <div className="flex flex-col items-center gap-4 opacity-40">
                                <Package className="w-16 h-16" />
                                <p className="font-black text-sm uppercase tracking-widest">No active signals detected</p>
                             </div>
                          </td>
                        </tr>
                      ) : (loading ? [1,2,3] : shipments).map((ship: any, idx) => (
                        <tr key={ship.id || idx} className="hover:bg-muted/20 transition-all duration-300 group">
                           <td className="px-8 py-6">
                              <div className="font-mono font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                                {loading ? <Skeleton className="h-6 w-32" /> : ship.id}
                              </div>
                              <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">
                                {loading ? <Skeleton className="h-3 w-20 mt-1" /> : ship.date}
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                 <div className="font-black text-sm uppercase tracking-tighter text-muted-foreground">
                                   {loading ? <Skeleton className="h-5 w-24" /> : ship.courier}
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              {loading ? (
                                <Skeleton className="h-7 w-28 rounded-full" />
                              ) : (
                                <Badge variant="outline" className={cn("rounded-lg font-black text-[9px] tracking-widest uppercase px-3 py-1.5 border transition-all", getStatusColor(ship.status))}>
                                   {ship.status}
                                </Badge>
                              )}
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-3">
                                 <Button 
                                   onClick={() => navigate(`/shipments/${ship.db_id}`)}
                                   variant="ghost" 
                                   size="sm" 
                                   className="rounded-lg font-black text-[10px] tracking-widest uppercase hover:bg-primary/10 hover:text-primary"
                                 >
                                   Access
                                 </Button>
                                 <Button 
                                   onClick={() => navigate(`/track/${ship.id}`)}
                                   variant="outline" 
                                   size="sm" 
                                   className="rounded-lg font-black text-[10px] tracking-widest uppercase border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all"
                                 >
                                   Track
                                 </Button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* RIGHT SIDEBAR (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* PROTOCOL STATUS (Profile Completion) */}
            <Card className="glass-card rounded-[3rem] p-10 relative overflow-hidden group border-border/50">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none transition-transform group-hover:scale-125" />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="font-heading font-black text-2xl tracking-tighter">PROTOCOL STATUS</h3>
                     <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center font-black text-xs text-primary bg-primary/5">
                        {profileCompleteness}%
                     </div>
                  </div>
                  
                  <div className="space-y-8">
                     <div className="relative h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(255,87,34,0.5)]" 
                          style={{ width: `${profileCompleteness}%` }} 
                        />
                     </div>

                     <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                          Your operator clearance is at <span className="text-foreground font-black underline decoration-primary/30 underline-offset-4">{profileCompleteness}%</span>. 
                          Finalize your Identity Protocol (KYC) to unlock full neural uplink and international logistics.
                        </p>
                        <Button 
                          onClick={() => navigate('/profile/kyc')} 
                          className="w-full h-14 bg-foreground text-background hover:bg-primary hover:text-white font-black rounded-2xl transition-all active:scale-95 text-xs tracking-widest shadow-xl group"
                        >
                          INITIALIZE IDENTITY UPLOAD
                          <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                     </div>
                  </div>
               </div>
            </Card>

            {/* WALLET WIDGET */}
            <Card 
              onClick={() => navigate('/finances')}
              className="glass-card rounded-[3rem] p-8 flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-all border-border/50 hover:border-primary/30"
            >
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Wallet className="w-8 h-8" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-60">Logistics Credits</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter">₹{user?.wallet || 0}</p>
                 </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted/40 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                 <Plus className="w-5 h-5" />
              </div>
            </Card>

            {/* SECURITY ADVISORY (Alert Section) */}
            <div className="glass-card rounded-[3rem] p-8 space-y-4 bg-blue-500/5 border-blue-500/30">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" />
                  <h4 className="font-heading font-black text-lg tracking-tight">SECURITY ADVISORY</h4>
               </div>
               <p className="text-xs font-semibold text-muted-foreground leading-relaxed opacity-80">
                 The <span className="text-blue-500 font-black">Evidence Vault</span> has secured 100% of your recent transmissions. Your cross-chain logistics hash is verified and active.
               </p>
               <Link to="/book/evidence" className="block">
                  <Button variant="link" className="p-0 text-blue-500 font-black text-[10px] tracking-widest uppercase flex items-center gap-1 hover:no-underline hover:gap-2 transition-all">
                    System Intelligence <ArrowUpRight className="w-3 h-3" />
                  </Button>
               </Link>
            </div>

            {/* QUICK SUPPORT TIP */}
            <div className="px-4 py-2 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
               <Info className="w-4 h-4 text-muted-foreground" />
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                 System Version: 2.4.0-STABLE <span className="mx-2">|</span> Nodes: Online
               </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Add these custom icons to handle the mapping if BoxSelect is not the right one
const BoxSelect = (props: any) => (
  <svg 
    {...props} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
  >
    <path d="M5 3a2 2 0 0 0-2 2" />
    <path d="M19 3a2 2 0 0 1 2 2" />
    <path d="M21 19a2 2 0 0 1-2 2" />
    <path d="M5 21a2 2 0 0 1-2-2" />
    <path d="M9 3h1" />
    <path d="M14 3h1" />
    <path d="M3 9v1" />
    <path d="M21 9v1" />
    <path d="M3 14v1" />
    <path d="M21 14v1" />
    <path d="M9 21h1" />
    <path d="M14 21h1" />
    <rect x="8" y="8" width="8" height="8" rx="1" />
  </svg>
);
