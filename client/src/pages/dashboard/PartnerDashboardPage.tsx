import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Truck, PackageCheck, TrendingUp, Star, BarChart3,
  Settings, MapPin, PhoneCall, Upload, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const metrics = [
    { label: "Pickups Today", value: "248", icon: Truck, color: "bg-blue-500/10 text-blue-500" },
    { label: "Successful Deliveries", value: "1,842", icon: PackageCheck, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Revenue Share (MTD)", value: "₹48,200", icon: TrendingUp, color: "bg-purple-500/10 text-purple-600" },
    { label: "Avg. Rating", value: "4.3 ★", icon: Star, color: "bg-amber-500/10 text-amber-600" },
  ];

  const serviceZones = [
    { zone: "Mumbai — 400001 to 400099", status: "Active", sla: "24h", coverage: "Full" },
    { zone: "Delhi — 110001 to 110099", status: "Active", sla: "48h", coverage: "Full" },
    { zone: "Bangalore — 560001 to 560099", status: "Active", sla: "36h", coverage: "Partial" },
    { zone: "Hyderabad — 500001 to 500099", status: "Inactive", sla: "—", coverage: "—" },
  ];

  const tabs = ["overview", "zones", "campaigns", "settings"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="relative w-10 h-10 bg-tertiary text-white rounded-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-background/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700"></div>
                  <Truck className="w-5 h-5" />
                </div>
                <h1 className="text-3xl font-heading font-extrabold text-foreground">Courier Partner Portal</h1>
              </div>
              <div className="ml-13 flex items-center gap-2 mt-1">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-xs font-bold uppercase">Verified Partner</Badge>
                <span className="text-muted-foreground text-sm font-medium">· Delhivery (Mumbai Hub)</span>
              </div>
            </div>
            <Button variant="outline" className="bg-card border-border shadow-sm font-semibold">
              <PhoneCall className="w-4 h-4 mr-2" /> Contact PARCEL Team
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors",
                  activeTab === tab ? "bg-foreground text-background" : "bg-card text-muted-foreground border border-border/60 hover:bg-muted/40"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* KPI Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map(m => (
              <Card key={m.label} className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-sm rounded-2xl p-5 flex items-center gap-4 glass-card hover:scale-[1.02] transition-transform">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", m.color)}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{m.label}</div>
                  <div className="text-xl font-heading font-extrabold">{m.value}</div>
                </div>
              </Card>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Service Zone Card */}
              <Card className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-sm rounded-2xl overflow-hidden glass-card">
                <div className="p-5 border-b border-border/50 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Service Zones
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-primary h-8">Edit Zones</Button>
                </div>
                <div className="divide-y divide-border/60">
                  {serviceZones.map(z => (
                    <div key={z.zone} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{z.zone}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">SLA: {z.sla} · Coverage: {z.coverage}</div>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] font-bold uppercase",
                        z.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground"
                      )}>
                        {z.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-sm rounded-2xl p-6 glass-card">
                <h3 className="font-heading font-bold text-lg mb-5">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Update Pickup Slots", icon: Settings, color: "bg-blue-500/10 text-blue-500" },
                    { label: "Upload Rate Sheet", icon: Upload, color: "bg-purple-500/10 text-purple-600" },
                    { label: "View Analytics", icon: BarChart3, color: "bg-amber-500/10 text-amber-600", action: () => navigate("/admin") },
                    { label: "Mark Delivered", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500" },
                  ].map(action => (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className={cn("flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group text-center")}
                    >
                      <div className="w-14 h-14 bg-background/20 rounded-2xl flex items-center justify-center group-hover:bg-background group-hover:text-primary transition-all duration-500 shadow-xl">
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">{action.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab !== "overview" && (
              <Card className="bg-card border-border shadow-sm rounded-2xl p-12 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="font-semibold text-foreground capitalize">{activeTab} — Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-1">This section is under development.</p>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
