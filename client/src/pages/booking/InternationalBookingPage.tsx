import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe2, Anchor, ArrowRight, ShieldCheck, Download, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function InternationalBooking() {
  const [rates, setRates] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchInternationalRates = () => {
    setSearching(true);
    setTimeout(() => {
      setRates([
        { id: "dhl", name: "DHL Express Worldwide", price: 4250, eta: "3-5 Days", rating: 4.9, tags: ["RECOMMENDED", "FASTEST"] },
        { id: "fedex", name: "FedEx International Priority", price: 4800, eta: "4-6 Days", rating: 4.8, tags: ["PREMIUM"] },
        { id: "aramex", name: "Aramex Export", price: 3100, eta: "7-10 Days", rating: 4.2, tags: ["CHEAPEST"] }
      ]);
      setSearching(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Cross-Border Shipping</h1>
              </div>
              <p className="text-muted-foreground mt-1 font-medium">Export seamlessly to 220+ countries with automated customs clearance.</p>
            </div>
            <Button variant="outline" className="font-bold border-border bg-card shadow-sm text-foreground">
              <Download className="w-4 h-4 mr-2" /> Download HS Code List
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            <div className="flex-1 space-y-8">
              <Card className="p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-border/50 shadow-sm rounded-3xl relative overflow-hidden glass-card">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
                <h2 className="font-heading font-bold text-xl mb-6">Destination & Details</h2>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label>Shipping To (Country)</Label>
                    <Select defaultValue="US">
                      <SelectTrigger className="h-12 bg-muted/30 rounded-xl">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AE">United Arab Emirates</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination Zip / Postal Code</Label>
                    <Input placeholder="e.g. 10001" className="h-12 bg-muted/30 rounded-xl" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" defaultValue={2.5} className="h-12 bg-muted/30 rounded-xl" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Dimensions (L × W × H cm)</Label>
                    <div className="flex gap-2">
                      <Input placeholder="L" type="number" className="h-12 bg-muted/30 rounded-xl" />
                      <div className="flex items-center text-muted-foreground">×</div>
                      <Input placeholder="W" type="number" className="h-12 bg-muted/30 rounded-xl" />
                      <div className="flex items-center text-muted-foreground">×</div>
                      <Input placeholder="H" type="number" className="h-12 bg-muted/30 rounded-xl" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-border/50 shadow-sm rounded-3xl relative overflow-hidden glass-card">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"></div>
                <h2 className="font-heading font-bold text-xl mb-6">Customs Declaration (Commercial Invoice)</h2>
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6 flex items-start gap-3 text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="font-medium text-amber-500">Accurate HS codes and product descriptions help prevent customs delays. 100% duty pre-payment allowed (DDP).</p>
                </div>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Item Category</Label>
                      <Select defaultValue="apparel">
                        <SelectTrigger className="h-12 bg-muted/30 rounded-xl">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectItem value="apparel">Apparel & Clothing</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="handicraft">Handicrafts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Harmonized System (HS) Code</Label>
                      <div className="flex gap-2">
                        <Input placeholder="e.g. 6109.10.00" className="h-12 bg-muted/30 rounded-xl flex-1" defaultValue="6109.10.00" />
                        <Button variant="outline" className="h-12 font-bold bg-card text-blue-600 border border-border/50 hover:bg-blue-500/10 rounded-xl">Lookup</Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Declared Value (INR base)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                        <Input type="number" placeholder="2500" className="pl-8 h-12 bg-muted/30 rounded-xl" defaultValue="4500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Upload</Label>
                      <div className="relative">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Button variant="outline" className="w-full h-12 bg-card border-dashed border-2 border-border/80 font-bold text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground justify-start px-4">
                          <FileText className="w-4 h-4 mr-2" /> Upload PDF Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="w-full lg:w-96 shrink-0">
              <div className="sticky top-24 space-y-6">
                  
                <Card className="p-6 bg-card/60 backdrop-blur-xl border border-border/50 shadow-sm rounded-3xl text-center glass-card">
                  <Anchor className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-xl mb-2">Get Export Rates</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-6">Compare real-time DDP & DDU rates from DHL, FedEx, and Aramex automatically.</p>
                    <Button onClick={fetchInternationalRates} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg shadow-lg shadow-blue-600/20 transition-transform active:scale-95 group">
                      {searching ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Fetching...</span>
                      ) : (
                        <span className="flex items-center justify-center">Find Best Route <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></span>
                      )}
                    </Button>
                  </Card>

                  {rates.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-xs ml-2">Available Couriers</h4>
                      
                      {rates.map((rate, i) => (
                        <Card key={rate.id} className={cn("p-4 border border-border/50 rounded-2xl cursor-pointer hover:border-blue-400/50 transition-all group shadow-sm", i === 0 ? "border-blue-500 ring-2 ring-blue-500/10 bg-blue-500/5" : "bg-card/40 backdrop-blur-sm")}>
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-heading font-bold text-foreground">{rate.name}</h5>
                            {i === 0 && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div className="flex gap-2 mb-3">
                            <Badge className="bg-card border text-foreground shadow-sm text-[10px] font-bold px-1.5 py-0">ETA: {rate.eta}</Badge>
                            {rate.tags.map((tag: string) => (
                              <Badge key={tag} className="bg-blue-500/10 text-blue-500 border-0 hover:bg-blue-500/20 text-[10px] uppercase font-bold px-1.5 py-0">{tag}</Badge>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-border/60">
                            <div className="text-xs font-semibold text-muted-foreground text-emerald-600">DDP Supported</div>
                            <div className="font-heading font-extrabold text-xl text-foreground">₹{rate.price}</div>
                          </div>
                        </Card>
                      ))}
                      <Button className="w-full h-14 bg-foreground hover:bg-foreground/90 text-white font-semibold rounded-xl text-lg mt-4 shadow-lg shadow-foreground/20">
                        Proceed to Pay
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
