import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, RefreshCw, CreditCard, MessageCircle, AlertCircle } from "lucide-react";

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <Card className="w-full max-w-xl p-10 bg-card border-border shadow-xl rounded-[2.5rem] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
          
          <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
            <XCircle className="w-12 h-12" />
          </div>

          <h1 className="text-4xl font-heading font-extrabold text-foreground mb-4">Payment Failed</h1>
          <p className="text-muted-foreground font-medium text-lg mb-10 max-w-md mx-auto">
            We couldn't process your transaction. Your money is safe and if deducted, will be refunded within 3-5 days.
          </p>

          <div className="bg-rose-500/10 rounded-2xl p-6 border border-rose-500/20 flex items-start gap-4 text-left mb-10">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-500 text-sm mb-1 uppercase tracking-wider">Reason for failure</h4>
              <p className="text-rose-500/80 text-sm font-medium">Insufficient funds or transaction declined by your bank.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button 
              onClick={() => navigate("/book/review")}
              className="h-14 px-8 bg-foreground hover:bg-foreground/90 text-background rounded-2xl font-bold text-lg shadow-lg shadow-foreground/20 transition-all active:scale-95 flex-1 w-full"
            >
              <RefreshCw className="w-5 h-5 mr-3" /> Retry Payment
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/book/review")}
              className="h-14 px-8 border-border bg-card text-foreground rounded-2xl font-bold text-lg shadow-sm hover:bg-muted transition-all active:scale-95 flex-1 w-full"
            >
              <CreditCard className="w-5 h-5 mr-3" /> Use Another Method
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-border/60 flex flex-col items-center gap-6">
            <div className="flex items-center gap-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-emerald-500" /> Secure Encryption</span>
              <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-emerald-500" /> PCI DSS Compliant</span>
            </div>
            
            <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
              <MessageCircle className="w-5 h-5" /> Contact 24/7 Support
            </button>
          </div>
        </Card>
      </main>
    </div>
  );
}

function Lock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
