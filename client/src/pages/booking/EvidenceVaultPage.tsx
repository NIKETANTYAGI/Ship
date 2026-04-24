import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, CheckCircle, Cpu, UploadCloud, 
  ShieldAlert, ArrowRight, Loader2, Zap,
  Activity, Globe, Lock, Fingerprint, Database,
  ArrowLeft, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { BookingStepper } from "@/components/features/BookingStepper";

export default function EvidenceVault() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [hash, setHash] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploading(true);
      
      // Simulate SHA-256 hash generation and upload taking time
      setTimeout(() => {
        setHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        setUploading(false);
        showToast("Signal secured in Vault Hub.", "success");
      }, 2000);
    }
  };

  const handleSkip = () => {
    showToast("Unprotected transmission: Risk level elevated.", "info");
    navigate('/book/review');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 pb-32">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10">
        
        {/* MISSION HEADER */}
        <div className="mb-12 border-b border-border/10 pb-12">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                 <Lock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Security Protocol 4.0</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter uppercase italic">
             VAULT <span className="text-primary not-italic">UPLINK</span>
           </h1>
           <p className="text-muted-foreground font-medium text-lg mt-2 max-w-2xl">Initialize cryptographic proof for asset mass and state integrity.</p>
        </div>

        <BookingStepper />

        <div className="flex flex-col items-center justify-center">
          
          <div className="text-center mb-16">
             <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full border border-primary/10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <Fingerprint className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI & On-Chain Verification Active</span>
             </div>
             <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-loose italic opacity-80">
                Generate a tamper-proof cryptographic fingerprint to shield your transmission from weight disputes and protocol deviations.
             </p>
          </div>

          <div className="w-full max-w-4xl">
            <Card className="bg-card border-none rounded-[3.5rem] shadow-2xl ring-1 ring-border/5 p-12 relative overflow-hidden group min-h-[450px] flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20">
              
              {/* Background technical elements */}
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <Database className="w-48 h-48" />
              </div>
              
              {hash ? (
                <div className="space-y-10 flex flex-col items-center animate-in zoom-in-95 duration-700 relative z-10 w-full">
                  <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-heading font-black text-4xl text-foreground uppercase tracking-tighter italic">PROOF <span className="text-emerald-500">COMMIT</span></h3>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-40">Integrity Check Completed</p>
                  </div>
                  
                  <div className="bg-background/40 backdrop-blur-xl border border-border/10 rounded-[2.5rem] p-8 w-full shadow-lg relative overflow-hidden">
                     <div className="flex items-center justify-between mb-6">
                        <div className="text-muted-foreground uppercase tracking-widest font-black text-[10px] flex items-center gap-3">
                          <Terminal className="w-4 h-4 text-emerald-500" />
                          SHA-256 FINGERPRINT
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 font-black text-[9px] uppercase tracking-widest leading-none h-6">Verified</Badge>
                     </div>
                     <div className="truncate text-emerald-500 font-black bg-emerald-500/5 px-6 py-4 rounded-2xl border border-emerald-500/10 text-lg tracking-widest font-mono select-all">
                        {hash}
                     </div>
                     <div className="flex justify-between items-center mt-6 pt-6 border-t border-border/5">
                       <span className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-widest"><Cpu className="w-4 h-4 text-primary"/> ON-CHAIN ANCHORED</span>
                       <span className="text-[10px] font-black text-foreground px-4 py-2 bg-muted rounded-xl uppercase border border-border/10">{file?.name || "image.jpg"}</span>
                     </div>
                  </div>
                  
                  <Button 
                    onClick={() => { setHash(null); setFile(null); }}
                    variant="ghost" 
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
                  >
                    Reset Uplink
                  </Button>
                </div>
              ) : uploading ? (
                <div className="space-y-10 flex flex-col items-center justify-center h-full text-center relative z-10">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-[2rem] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-heading font-black text-3xl text-foreground uppercase tracking-tighter italic">ENCRYPTING <span className="text-primary">PROOF...</span></h3>
                    <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Synchronizing with Decentralized Vault</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 flex flex-col items-center relative z-10 w-full group/upload">
                  <div className="relative">
                    <div className="w-28 h-28 bg-primary/5 text-primary rounded-[2.5rem] flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:bg-primary/10 transition-all duration-500 border border-primary/10 shadow-xl group-hover/upload:shadow-primary/20">
                      <UploadCloud className="w-14 h-14" />
                    </div>
                    {/* Animated rings */}
                    <div className="absolute inset-0 rounded-[2.5rem] border border-primary/20 animate-ping opacity-20" />
                  </div>
                  
                  <div className="space-y-4 text-center">
                    <h3 className="font-heading font-black text-4xl text-foreground uppercase tracking-tighter italic">SECURITY <span className="text-primary">UPLINK</span></h3>
                    <p className="text-muted-foreground font-medium text-lg max-w-sm mx-auto leading-relaxed italic opacity-80">
                      Transmit asset imagery for 100% protocol protection. Supports weighing scale snapshots & seal logs.
                    </p>
                  </div>
                  
                  <div className="relative w-full max-w-xs transition-all duration-500 group-hover/upload:scale-105">
                    <input 
                       type="file" 
                       accept="image/*,video/mp4" 
                       onChange={handleUpload} 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                    />
                    <Button className="w-full h-18 bg-primary text-white font-black rounded-2xl text-lg shadow-[0_15px_40px_rgba(255,87,34,0.3)] border-none uppercase italic tracking-tight transition-all active:scale-95">
                      INITIALIZE UPLOAD
                    </Button>
                  </div>
                  
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30">Supports JPG, PNG, MP4 up to 50MB</div>
                </div>
              )}
            </Card>

            <div className="w-full flex flex-col sm:flex-row justify-between items-center mt-12 p-10 border border-border/10 rounded-[3rem] bg-card/30 glass-card gap-8">
              <div className="flex items-center gap-6 text-center sm:text-left grow">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <ShieldAlert className="w-7 h-7 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground uppercase tracking-tight italic">Protocol Warning: Security Bypassed</p>
                  <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed opacity-60">
                    Skipping evidence vaulting elevates contractor liability. Disputes will be settled in favor of the terminal node.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSkip} 
                variant="ghost" 
                className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all"
              >
                 Skip Compliance
              </Button>
            </div>

            <div className="mt-12 flex flex-col gap-6">
              <Button 
                onClick={() => navigate('/book/review')}
                disabled={!hash}
                className={cn(
                  "w-full h-20 bg-foreground text-background hover:bg-foreground/90 font-black rounded-[2rem] text-2xl shadow-2xl transition-all active:scale-[0.98] group flex items-center justify-center gap-4 uppercase italic tracking-tighter", 
                  !hash && "opacity-20 grayscale pointer-events-none"
                )}
              >
                PROCEED TO COMMIT <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
              </Button>
              
              <div className="flex items-center justify-center gap-3 text-[10px] text-primary/60 font-black uppercase tracking-[0.3em] py-4">
                <Activity className="w-4 h-4 animate-pulse" />
                PROTECTING 8,240+ SHIPPERS DAILY
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
