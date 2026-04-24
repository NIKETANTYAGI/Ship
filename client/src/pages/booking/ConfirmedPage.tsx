import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, Copy, MapPin, HelpCircle, FileText, 
  Download, Share2, ShieldCheck, Calendar, Package, 
  MessageCircle, ArrowLeft, Globe, Zap, Activity,
  Lock, ArrowRight, ExternalLink, Radio
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { downloadShipmentLabel } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ConfirmedPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const awb = params.awb || "SR123456789X";

  const handleCopy = () => {
    navigator.clipboard.writeText(awb);
    showToast("Signal ID copied to clipboard.", "success");
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // We pass the AWB to the download API. The API will be updated to handle AWB as well as ID.
      const response = await downloadShipmentLabel(awb);
      if (response && response.label_url) {
        window.open(response.label_url, '_blank');
        showToast("Label transmission started.", "success");
      } else {
        throw new Error("Label not available yet.");
      }
    } catch (err) {
      showToast("Download failed. Please try again from Shipments list.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    window.open(`https://wa.me/?text=Track%20my%20transmission%3A%20https%3A%2F%2Fparcel.in%2Ftrack%2F${awb}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 pb-32">
      
      {/* Background technical glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10 relative z-10">
        
        {/* MISSION HEADER */}
        <div className="mb-12 border-b border-border/10 pb-12 flex flex-col items-center text-center">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg animate-in zoom-in-50 duration-700">
                 <CheckCircle2 className="w-8 h-8" />
              </div>
           </div>
           <h1 className="text-4xl md:text-6xl font-heading font-black text-foreground tracking-tighter uppercase italic">
             MISSION <span className="text-primary not-italic">INITIALIZED</span>
           </h1>
           <p className="text-muted-foreground font-medium text-lg mt-4 max-w-2xl italic opacity-80">
             Transmission protocol established. Global logistics operators notified for asset extraction.
           </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* MASTER LOGISTICS TICKET */}
          <div className="bg-card rounded-[3.5rem] shadow-2xl ring-1 ring-border/5 overflow-hidden relative glass-card border-none">
            
            {/* Header Banner - High Impact */}
            <div className="bg-foreground p-12 text-background relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-background/40 uppercase tracking-[0.4em] italic mb-1">Signal ID Hub Registry</div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-4xl md:text-6xl font-black tracking-tighter select-all">{awb}</span>
                    <button 
                       onClick={handleCopy} 
                       className="w-14 h-14 bg-background/5 hover:bg-background/20 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all active:scale-90 border border-background/20 group/copy"
                    >
                      <Copy className="w-6 h-6 text-background group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <Link to={`/track/${awb}`} className="flex-1 md:w-auto">
                    <Button className="w-full h-18 bg-primary text-white hover:bg-primary/90 font-black rounded-2xl px-12 text-xl italic uppercase tracking-tighter shadow-xl shadow-primary/20 border-none group">
                      LIVE RADAR <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="h-18 w-18 bg-background/10 border-background/20 hover:bg-background/20 text-background rounded-2xl flex items-center justify-center p-0 backdrop-blur-md"
                  >
                    {isDownloading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Download className="w-7 h-7" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/10">
              
              {/* Left Side: Routing Matrix */}
              <div className="lg:col-span-8 p-12 space-y-12">
                 <div className="relative">
                   <div className="absolute left-[23px] top-10 bottom-10 w-px bg-gradient-to-b from-primary via-muted to-blue-500 opacity-20 hidden sm:block" />
                   
                   <div className="flex gap-10 relative mb-12">
                     <div className="w-12 h-12 rounded-2xl bg-card border-2 border-primary flex items-center justify-center shrink-0 mt-2 shadow-xl z-20">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                     </div>
                     <div className="space-y-2">
                       <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3 font-mono opacity-40">NODE_ORIGIN_ID</div>
                       <div className="font-heading font-black text-3xl text-foreground italic uppercase tracking-tighter">RAHUL SHARMA</div>
                       <div className="text-sm font-medium text-muted-foreground leading-loose italic opacity-60">Flat 4B, Hill View Apartments, Linking Road<br/>Mumbai 400001, MH / COORDINATE_SET_A</div>
                     </div>
                   </div>

                   <div className="flex gap-10 relative">
                     <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0 mt-2 shadow-xl z-20 ring-4 ring-background">
                       <MapPin className="w-6 h-6 text-white" />
                     </div>
                     <div className="space-y-2">
                       <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3 font-mono opacity-40">NODE_DESTINATION_ID</div>
                       <div className="font-heading font-black text-3xl text-foreground italic uppercase tracking-tighter">JANE DOE</div>
                       <div className="text-sm font-medium text-muted-foreground leading-loose italic opacity-60">Building 7, Cyber City, Phase 2<br/>New Delhi 110001, DL / COORDINATE_SET_Z</div>
                     </div>
                   </div>
                 </div>

                 {/* Security Tag */}
                 <div className="flex flex-wrap gap-4 pt-6">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Vault Compliant</span>
                         <span className="text-[10px] font-black text-muted-foreground/60 font-mono tracking-tighter italic">CRYPT_HASH: SHA_256_VLD</span>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm group">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Contract Signed</span>
                         <span className="text-[10px] font-black text-muted-foreground/60 font-mono tracking-tighter italic">ATOMIC_PAYMENT_CLR</span>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Right Side: Extraction Metrics */}
              <div className="lg:col-span-4 p-12 bg-muted/20 space-y-12 flex flex-col justify-between">
                
                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                      <Zap className="w-4 h-4 animate-pulse" /> EXTRACTION WINDOW
                    </div>
                    <div>
                      <div className="font-heading font-black text-3xl text-foreground italic tracking-tighter uppercase whitespace-nowrap">TODAY, 24 OCT</div>
                      <div className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-widest italic opacity-60">SIGNAL_LOCK: 14:00 – 18:00 HRS</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
                      <Globe className="w-4 h-4" /> EST DELIVERY NODE
                    </div>
                    <div>
                      <div className="font-heading font-black text-3xl text-foreground italic tracking-tighter uppercase">SUN, 27 OCT</div>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black px-4 py-1.5 uppercase rounded-xl tracking-widest italic leading-none">AI_FORECASTED</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-border/10">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 opacity-40">SETTLEMENT_LOG</div>
                  <div className="flex items-end justify-between">
                    <div>
                       <div className="font-heading font-black text-4xl text-foreground tracking-tighter italic">₹67.85</div>
                       <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg inline-block border border-emerald-500/20 mt-2">Paid via Secure Wallet</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-muted/30 border-t border-border/10 p-10 flex flex-col lg:flex-row justify-between items-center gap-10 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <MessageCircle className="w-24 h-24" />
               </div>
               
               <div className="flex items-center gap-5 grow relative z-10 w-full sm:w-auto">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20 shrink-0"></div>
                 <div className="text-xs font-black text-foreground uppercase tracking-widest flex flex-wrap items-center gap-2 italic">
                   Telemetry alerts activated for uplink: <span className="text-primary not-italic">+91 98765 43210</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-6 w-full lg:w-auto relative z-10">
                  <div className="relative grow md:w-96 group/link">
                     <Input 
                        readOnly 
                        value={`https://swiftroute.in/t/${awb}`} 
                        className="h-16 pr-32 bg-background/50 border-border/10 font-mono text-[10px] rounded-2xl italic select-all focus:ring-primary/20 pl-6 uppercase tracking-widest" 
                     />
                     <Button 
                       onClick={handleCopy} 
                       variant="ghost" 
                       className="absolute right-0 top-0 h-16 px-6 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-transparent transition-all group-hover/link:translate-x-1"
                     >
                       COPY LINK
                     </Button>
                  </div>
                  <Button 
                    onClick={handleShare} 
                    className="h-16 w-16 p-0 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center shrink-0 border-none transition-all active:scale-90"
                  >
                    <MessageCircle className="w-8 h-8 fill-current" />
                  </Button>
               </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-20 flex flex-col sm:flex-row justify-center items-center gap-10">
            <Link to="/compare" className="w-full sm:w-auto">
               <Button variant="ghost" className="w-full h-16 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] border border-border/10 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all group overflow-hidden relative">
                 <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                 <span className="relative z-10 flex items-center gap-3">
                   <Zap className="w-4 h-4" /> RE-INITIALIZE MISSION
                 </span>
               </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
               <Button className="w-full h-16 px-16 rounded-[1.5rem] bg-foreground text-background hover:bg-foreground/90 font-black shadow-2xl transition-all active:scale-95 flex items-center gap-4 text-xs uppercase tracking-[0.25em] italic">
                 <ArrowLeft className="w-6 h-6" /> RETURN TO SECTOR 01
               </Button>
            </Link>
          </div>

          <div className="mt-20 flex items-center justify-center gap-4 opacity-10">
            <Globe className="w-8 h-8" />
            <div className="h-0.5 w-16 bg-muted-foreground rounded-full"></div>
            <Activity className="w-8 h-8" />
            <div className="h-0.5 w-16 bg-muted-foreground rounded-full"></div>
            <Radio className="w-8 h-8" />
          </div>

        </div>
      </main>
    </div>
  );
}
