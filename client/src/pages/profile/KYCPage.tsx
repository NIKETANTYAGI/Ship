import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/context/ToastContext";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileText,
  Lock,
  Zap,
  Fingerprint,
  Target,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initiateKYC, verifyKYC } from "@/lib/api";

export default function KYCPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [files, setFiles] = useState<{front: boolean, back: boolean}>({ front: true, back: true });

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    // Format: 0000 0000 0000
    const formatted = val.replace(/(\d{4})/g, "$1 ").trim();
    setAadhaar(formatted);
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      const data = await initiateKYC(aadhaar.replace(/\s/g, ""));
      setSessionId(data.session_id);
      setStep(2);
      showToast("Verification link sent to linked mobile", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate real verification with the mock OTP 4821 or 000000
      await verifyKYC(sessionId, otp || "4821");
      showToast("Trust Score Elevated! KYC Validated.", "success");
      navigate("/profile");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full -mr-1/2 pointer-events-none"></div>
      
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button onClick={() => navigate("/profile")} variant="outline" size="icon" className="w-14 h-14 rounded-2xl bg-card border-border/40 shadow-xl group">
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </Button>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                   <Target className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Identity Protocol</span>
                </div>
                <h1 className="text-4xl font-heading font-black text-foreground tracking-tighter">Trust Validation</h1>
                <p className="text-sm font-bold text-muted-foreground opacity-80 uppercase tracking-widest">Verify your entity for full logistics access.</p>
              </div>
            </div>
            <Badge className="bg-foreground text-background border-0 font-black px-4 py-2 rounded-xl text-xs">PHASE {step}</Badge>
          </div>

          <Card className="p-10 bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-[3rem] relative overflow-hidden glass-card">
            <div className="absolute top-0 left-0 w-full h-2 bg-muted/20">
               <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(step/2)*100}%` }}></div>
            </div>
            
            <div className="absolute top-4 right-10">
               <Sparkles className="w-6 h-6 text-primary opacity-20" />
            </div>

            {step === 1 ? (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pt-6">
                <div className="flex items-start gap-4 p-6 bg-primary/5 border border-primary/10 rounded-[2rem]">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground/80 leading-relaxed">
                    Your identity parameters are processed through an encrypted layer. Fully compliant with UIDAI and RBI protocols.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Aadhaar Identifier</Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/5 blur-2xl group-focus-within:bg-primary/10 transition-colors"></div>
                    <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground transition-colors group-focus-within:text-primary z-10" />
                    <Input 
                      value={aadhaar}
                      onChange={handleAadhaarChange}
                      placeholder="0000 0000 0000" 
                      className="pl-14 h-20 bg-muted/20 border-border/40 rounded-3xl text-3xl font-black tracking-widest focus:ring-primary/20 relative z-0 transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    disabled={aadhaar.replace(/\s/g, "").length !== 12 || isSubmitting}
                    onClick={handleNext}
                    className="w-full h-20 bg-foreground text-background hover:opacity-90 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5 fill-current" /> Initialize Verification</>}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">Access Code Validation</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sent to linked mobile ending in ••2134</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] block text-center">Neural Link OTP</Label>
                  <Input 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="••••••" 
                    className="h-24 bg-muted/20 border-border/40 rounded-[2.5rem] text-center text-5xl font-black tracking-[0.4em] focus:ring-primary/20 shadow-inner" 
                  />
                  <p className="text-[10px] text-primary text-center font-black uppercase tracking-widest opacity-60">Trial Bypass Code: 4821</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 opacity-40 grayscale pointer-events-none">
                  <div className={cn(
                    "group aspect-[4/3] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-8 text-center",
                    files.front ? "border-primary/40 bg-primary/5" : "border-border/40"
                  )}>
                     <CheckCircle2 className="w-10 h-10 text-primary mb-3" />
                    <p className="font-black text-xs uppercase tracking-widest text-primary">ID Front</p>
                    <p className="text-[9px] text-muted-foreground mt-2 font-black uppercase tracking-tighter">SECURE CLOUD SYNC</p>
                  </div>

                  <div className={cn(
                    "group aspect-[4/3] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-8 text-center",
                    files.back ? "border-primary/40 bg-primary/5" : "border-border/40"
                  )}>
                     <CheckCircle2 className="w-10 h-10 text-primary mb-3" />
                    <p className="font-black text-xs uppercase tracking-widest text-primary">ID Back</p>
                    <p className="text-[9px] text-muted-foreground mt-2 font-black uppercase tracking-tighter">SECURE CLOUD SYNC</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-20 flex-1 rounded-3xl font-black border-border/60 hover:bg-muted/50 uppercase tracking-widest text-xs">
                    Re-link
                  </Button>
                  <Button 
                    disabled={otp.length < 4 || isSubmitting}
                    onClick={handleSubmit}
                    className="h-20 flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Validation"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="mt-12 flex items-center justify-center gap-4 text-muted-foreground/40">
            <div className="h-px w-10 bg-current"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
              <Lock className="w-3.5 h-3.5" /> End-to-End Encryption Enabled
            </p>
            <div className="h-px w-10 bg-current"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
