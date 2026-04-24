import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Package, 
  Wallet, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  MoreVertical,
  Trash2,
  Settings,
  Filter,
  RefreshCcw,
  Zap,
  Activity,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "shipment",
    title: "Shipment Out for Delivery",
    message: "Your shipment #AWB829103IN is out for delivery in Mumbai hub.",
    time: "2 hours ago",
    read: false,
    icon: Package,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  },
  {
    id: 2,
    type: "wallet",
    title: "Protocol Credit Recharged",
    message: "₹500.00 successfully added to your secure wallet ledger.",
    time: "5 hours ago",
    read: true,
    icon: Wallet,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  },
  {
    id: 3,
    type: "kyc",
    title: "Identity Protocol Verified",
    message: "Congratulations! Your identity verification is complete. Node limits upgraded.",
    time: "1 day ago",
    read: true,
    icon: ShieldCheck,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  },
  {
    id: 4,
    type: "shipment",
    title: "Terminal Delay Detected",
    message: "Shipment #AWB716254IN is delayed due to weather conditions at the gateway.",
    time: "2 days ago",
    read: true,
    icon: Clock,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  }
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-all duration-500">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* REGISTRY HEADER */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/10 pb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Activity className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Signal Logs</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter flex items-center gap-4 uppercase">
                ALERT <span className="text-primary italic">REGISTRY</span>
              </h1>
              <p className="text-muted-foreground font-medium text-lg mt-2 max-w-lg leading-relaxed">System telemetry and account lifecycle events decoded in real-time.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={markAllRead}
                className="h-14 px-8 rounded-2xl border-border/40 bg-background font-black text-xs uppercase tracking-widest hover:bg-muted transition-all shadow-sm"
              >
                SYNC ALL AS READ
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="h-14 w-14 rounded-2xl border-border/40 hover:bg-muted/50"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {notifications.length === 0 ? (
              <div className="glass-card border-none rounded-[3rem] py-32 text-center animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6 relative">
                   <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20 scale-150" />
                   <Bell className="w-10 h-10 text-muted-foreground/30 relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Zero Pending Signals</h3>
                <p className="text-muted-foreground font-medium italic">All system nodes are currently operational and silent.</p>
                <Button onClick={() => navigate("/dashboard")} variant="link" className="mt-8 text-primary font-black uppercase tracking-widest text-xs hover:no-underline">
                   RETURN TO COMMAND CENTER
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {notifications.map((notif) => (
                  <Card 
                    key={notif.id} 
                    className={cn(
                      "glass-card border-none rounded-[2.5rem] p-6 shadow-xl ring-1 ring-border/5 hover:bg-muted/30 transition-all flex items-start gap-6 group relative overflow-hidden cursor-default",
                      !notif.read && "ring-primary/20 shadow-primary/5 bg-primary/[0.02]"
                    )}
                  >
                    {!notif.read && (
                      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary animate-pulse" />
                    )}
                    
                    <div className={cn(
                        "w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 shadow-lg",
                        notif.color
                    )}>
                      <notif.icon className="w-7 h-7" />
                    </div>

                    <div className="flex-1 min-w-0 pr-12 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className={cn(
                            "font-black text-xl tracking-tight uppercase transition-colors", 
                            !notif.read ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {notif.title}
                        </h4>
                        {!notif.read && <Badge className="bg-primary text-white text-[9px] px-2 py-0.5 border-0 h-4 font-black tracking-widest animate-pulse">LIVE</Badge>}
                      </div>
                      <p className={cn(
                          "text-base leading-relaxed max-w-xl transition-colors", 
                          !notif.read ? "text-foreground/80 font-medium" : "text-muted-foreground/60"
                      )}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                         <div className="px-3 py-1 rounded-lg bg-muted/20 border border-border/10 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {notif.time}
                         </div>
                         <div className="h-1 w-1 rounded-full bg-border" />
                         <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{notif.type}</span>
                      </div>
                    </div>

                    <div className="absolute right-6 top-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteNotification(notif.id)}
                        className="h-10 w-10 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="mt-16 flex flex-col items-center gap-8">
             <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
             <Button 
               variant="ghost" 
               onClick={() => navigate("/dashboard")}
               className="text-muted-foreground font-black text-xs uppercase tracking-widest hover:text-primary hover:bg-transparent flex items-center gap-2 group"
             >
               <History className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO HEADQUARTERS
             </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
