import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";

export default function AnalyticsDashboard() {
  const data = [
    { name: "Mon", spent: 4000, shipments: 24, returns: 2 },
    { name: "Tue", spent: 3000, shipments: 20, returns: 1 },
    { name: "Wed", spent: 5000, shipments: 35, returns: 3 },
    { name: "Thu", spent: 2780, shipments: 18, returns: 0 },
    { name: "Fri", spent: 6890, shipments: 48, returns: 4 },
    { name: "Sat", spent: 8390, shipments: 55, returns: 1 },
    { name: "Sun", spent: 9490, shipments: 60, returns: 2 },
  ];

  const courierData = [
    { name: "Delhivery", value: 45 },
    { name: "Blue Dart", value: 25 },
    { name: "XpressBees", value: 15 },
    { name: "Shadowfax", value: 10 },
    { name: "Ecom Express", value: 5 },
  ];
  
  const COLORS = ['#0f172a', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Analytics & Intelligence</h1>
              <p className="text-muted-foreground mt-1 font-medium">Review your D2C shipping performance.</p>
            </div>

            <Select defaultValue="7d">
              <SelectTrigger className="w-[180px] bg-card border-border shadow-sm h-10 font-medium">
                <SelectValue placeholder="Select Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card border-border shadow-sm rounded-2xl flex flex-col justify-between">
              <div className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-2">Total Shipping Spend</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-heading font-extrabold text-3xl">₹39,550</span>
                <span className="text-emerald-600 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1"><TrendingDown className="w-3 h-3" /> 12%</span>
              </div>
              <div className="text-xs text-muted-foreground">Compared to previous 7 days</div>
            </Card>

             <Card className="p-6 bg-card border-border shadow-sm rounded-2xl flex flex-col justify-between">
              <div className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-2">Shipments Processed</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-heading font-extrabold text-3xl">260</span>
                <span className="text-emerald-600 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 18%</span>
              </div>
              <div className="text-xs text-muted-foreground">Compared to previous 7 days</div>
            </Card>

            <Card className="p-6 bg-card border-border shadow-sm rounded-2xl flex flex-col justify-between border-l-4 border-l-rose-500">
              <div className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-2">RTO (Return to Origin)</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-heading font-extrabold text-3xl">5.2%</span>
                <span className="text-rose-600 font-bold text-sm bg-rose-500/10 px-2 py-0.5 rounded flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 0.8%</span>
              </div>
              <div className="text-xs text-muted-foreground">Industry avg: 12% (You are doing great!)</div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            
            <Card className="lg:col-span-2 p-6 bg-card border-border shadow-sm rounded-2xl">
               <h3 className="font-heading font-bold text-lg mb-6">Spend vs Volume Trend</h3>
               <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={12} tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tickMargin={12} tickFormatter={val => `₹${val}`} tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="spent" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </Card>

            <Card className="p-6 bg-card border-border shadow-sm rounded-2xl">
               <h3 className="font-heading font-bold text-lg mb-6">Courier Market Share</h3>
               <div className="h-64 w-full flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courierData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {courierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-y-3 mt-4">
                 {courierData.map((c, i) => (
                   <div key={c.name} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                     <span className="text-xs font-bold text-muted-foreground">{c.name} <span className="text-foreground ml-1">{c.value}%</span></span>
                   </div>
                 ))}
               </div>
            </Card>

          </div>

          <Card className="p-6 bg-card border-border shadow-sm rounded-2xl">
             <h3 className="font-heading font-bold text-lg mb-6">Delivery Performance Matrix</h3>
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={12} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tickMargin={12} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                    <Bar dataKey="shipments" name="Delivered Successfully" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="returns" name="Returned (RTO)" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </Card>

        </div>
      </main>
    </div>
  );
}
