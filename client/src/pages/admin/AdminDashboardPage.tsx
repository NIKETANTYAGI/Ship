import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users, User, Package, TrendingUp, AlertCircle, Search, Eye, ShieldCheck,
  Truck, DollarSign, Activity, Settings, RefreshCw, CheckCircle2, XCircle
} from "lucide-react";
import { MOCK_SHIPMENTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { getAdminRevenueStats, getCourierConfigs, updateCourierConfig, downloadAdminReport } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { FileDown, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, courierData] = await Promise.all([
          getAdminRevenueStats(),
          getCourierConfigs()
        ]);
        setStats(statsData);
        setCouriers(courierData);
      } catch (err) {
        console.error("Admin data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await downloadAdminReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SwiftRoute_System_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      showToast("Report generated and downloaded.", "success");
    } catch (err) {
      showToast("Failed to generate report.", "error");
    } finally {
      setExporting(false);
    }
  };

  const kpis = [
    { label: "Shipments Today", value: stats?.metrics?.total_shipments || "0", change: "+12%", up: true, icon: Package, color: "bg-blue-500/10 text-blue-500" },
    { label: "Active Partners", value: couriers.filter(c => c.is_active).length.toString(), change: "Stable", up: true, icon: Truck, color: "bg-purple-500/10 text-purple-500" },
    { label: "Revenue (Today)", value: `₹${((stats?.metrics?.total_gmv_paise || 0) / 100).toLocaleString()}`, change: "+18%", up: true, icon: DollarSign, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "ARPS", value: `₹${((stats?.metrics?.arps_paise || 0) / 100).toFixed(0)}`, change: "Flat", up: false, icon: Activity, color: "bg-rose-500/10 text-rose-500" },
  ];

  const filteredShipments = MOCK_SHIPMENTS.filter(s =>
    !search || s.awb.toLowerCase().includes(search.toLowerCase()) || s.toCity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-foreground text-white rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h1 className="text-3xl font-heading font-extrabold text-foreground">Admin Control Panel</h1>
              </div>
              <p className="text-muted-foreground text-sm font-medium ml-13">Platform operations overview.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={exporting}
                className="bg-card border-border hover:bg-muted text-foreground font-bold flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                {exporting ? "Exporting..." : "Download Report"}
              </Button>
              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-bold tracking-wider flex items-center gap-2 px-4 py-2 h-10">
                <Activity className="w-4 h-4 animate-pulse" /> All Systems Operational
              </Badge>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {kpis.map(kpi => (
              <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden glass-card p-5 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border/10", kpi.color)}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</div>
                  <div className="text-2xl font-heading font-extrabold text-foreground">{kpi.value}</div>
                  <div className={cn("text-xs font-bold mt-1", kpi.up ? "text-emerald-600" : "text-rose-500")}>
                    {kpi.change} vs yesterday
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Courier Partner Status */}
              <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden glass-card">
              <div className="p-5 border-b border-border/60 flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Courier Partners</h3>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary h-8">
                  <Settings className="w-4 h-4 mr-1" /> Manage
                </Button>
              </div>
              <div className="divide-y divide-border/60">
                {couriers.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/20">
                    <div>
                      <div className="font-bold text-sm">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{c.code} · {c.rating || 4.5} rating</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.is_active ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Shipments */}
            <div className="lg:col-span-2">
                <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden glass-card">
                <div className="p-5 border-b border-border/60 flex items-center justify-between gap-4">
                  <h3 className="font-heading font-bold text-lg shrink-0">Live Shipments</h3>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AWB or city..." className="pl-9 h-9 bg-muted/30" />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="divide-y divide-border/60">
                  {filteredShipments.map(ship => (
                    <div key={ship.awb} className="flex items-center justify-between p-4 hover:bg-muted/20 group">
                      <div>
                        <div className="font-mono font-bold text-sm">{ship.awb}</div>
                        <div className="text-xs text-muted-foreground">{ship.fromCity} → {ship.toCity} via {ship.courier}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase",
                          ship.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          ship.status === "Exception" || ship.status === "Return Pending" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        )}>
                          {ship.status}
                        </Badge>
                        <Button onClick={() => navigate(`/track/${ship.awb}`)} variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pending KYC Requests - NEW */}
              <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden mt-8 glass-card">
                <div className="p-5 border-b border-border/40 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Pending KYC Approvals
                  </h3>
                  <Badge className="bg-primary/10 text-primary border border-primary/20 uppercase text-[10px] font-extrabold px-3 py-1">3 Pending</Badge>
                </div>
                <div className="divide-y divide-border/60">
                  {[
                    { name: "Rahul S.", phone: "+91 98XXX XX210", doc: "aadhaar_front.jpg", time: "2h ago" },
                    { name: "Anita K.", phone: "+91 99XXX XX345", doc: "pan_card.jpg", time: "5h ago" },
                    { name: "Vikram P.", phone: "+91 97XXX XX901", doc: "aadhaar_front.jpg", time: "1d ago" }
                  ].map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center text-muted-foreground">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{req.name}</div>
                          <div className="text-[10px] text-muted-foreground font-medium italic">{req.phone} • {req.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-border hover:bg-gray-50">
                          View ID
                        </Button>
                        <Button size="sm" className="h-8 text-[10px] font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm">
                          Approve
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
