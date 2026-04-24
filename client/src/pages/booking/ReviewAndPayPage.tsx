import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Truck, Wallet, CreditCard, HelpCircle, 
  Tag, Loader2, Lock, ShieldCheck, ArrowLeft,
  ChevronRight, ArrowRight, Zap, Database,
  Activity, Globe, Radio, Sparkles, Navigation,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";
import { useToast } from "@/context/ToastContext";
import { BookingStepper } from "@/components/features/BookingStepper";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewAndPay() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { selectedCourier, pickup, delivery, packageDetails, setLastAwb, resetBooking } = useBooking();
  
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [walletApplied, setWalletApplied] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<false | "applied" | "invalid">(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!selectedCourier) {
      navigate('/book/courier');
    }
  }, [selectedCourier, navigate]);

  const baseShipping = selectedCourier?.price || 45.00;
  const fuelSurcharge = selectedCourier ? (selectedCourier.price * 0.1) : 12.50;
  const subtotal = baseShipping + fuelSurcharge;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  
  const discountAmount = promoStatus === "applied" ? total * 0.10 : 0;
  const walletDeduction = walletApplied ? Math.min(20, total - discountAmount) : 0;
  const finalTotal = Math.max(0, total - discountAmount - walletDeduction);

  const handleApplyPromo = () => {
    if (promoInput === "PARCEL10" || promoInput === "SWIFT2024") {
      setPromoStatus("applied");
      showToast("Security Key Accepted: Discount Applied.", "success");
    } else {
      setPromoStatus("invalid");
      showToast("Invalid Key: Access Denied.", "error");
      setTimeout(() => setPromoStatus(false), 2000);
    }
  };

  const handlePay = () => {
    setIsProcessing(true);
    const mockAwb = 'SR' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'X';
    setTimeout(() => {
      showToast("Transmission Initialized: Payment Confirmed.", "success");
      setLastAwb(mockAwb);
      resetBooking();
      navigate(`/book/confirmed/${mockAwb}`);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 pb-32">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10">
        
        {/* MISSION HEADER */}
        <div className="mb-12 border-b border-border/10 pb-12">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Pre-Flight Review 2.2</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter uppercase italic">
             MISSION <span className="text-primary not-italic">COMMIT</span>
           </h1>
           <p className="text-muted-foreground font-medium text-lg mt-2 max-w-2xl">Final review of transmission protocols before node initialization.</p>
        </div>

        <BookingStepper />

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
          
          {/* Left: Manifest & Protocol (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* SHIPMENT MANIFEST */}
            <Card className="p-10 bg-card border-none rounded-[3.5rem] shadow-2xl ring-1 ring-border/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-3 h-full bg-primary/20"></div>
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <Globe className="w-48 h-48" />
              </div>

              <div className="flex justify-between items-center mb-10 pb-8 border-b border-border/10">
                <div>
                  <h3 className="font-heading font-black text-3xl text-foreground uppercase tracking-tighter italic">FLIGHT <span className="text-primary not-italic">MANIFEST</span></h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Routing & Logistics Verification</p>
                </div>
                <Link to="/book/address">
                  <Button variant="ghost" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] border border-border/20 hover:bg-primary/5 hover:text-primary transition-all">Edit Parameters</Button>
                </Link>
              </div>

              <div className="space-y-12 relative">
                 <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-primary via-muted to-blue-500 opacity-20 hidden sm:block" />
                 
                 <div className="flex gap-8 items-start relative z-10">
                   <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg">
                     <Radio className="w-7 h-7 text-primary" />
                   </div>
                   <div className="grow">
                     <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 font-mono">NODE_ORIGIN_ID: {pickup?.pincode}</div>
                     <div className="font-black text-foreground text-2xl uppercase italic tracking-tight">{pickup?.name}</div>
                     <div className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed italic opacity-60 max-w-lg">{pickup?.address}, {pickup?.pincode}</div>
                     <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                        <Activity className="w-3 h-3" /> SIGNAL_LOCKED: {pickup?.phone}
                     </div>
                   </div>
                 </div>

                 <div className="flex gap-8 items-start relative z-10">
                   <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-lg">
                     <Navigation className="w-7 h-7 text-blue-500" />
                   </div>
                   <div className="grow">
                     <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 font-mono">NODE_DESTINATION_ID: {delivery?.pincode}</div>
                     <div className="font-black text-foreground text-2xl uppercase italic tracking-tight">{delivery?.name}</div>
                     <div className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed italic opacity-60 max-w-lg">{delivery?.address}, {delivery?.pincode}</div>
                     <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                        <Activity className="w-3 h-3" /> SIGNAL_LOCKED: {delivery?.phone}
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex gap-8 items-start pt-10 border-t border-border/10">
                   <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 border border-border/20">
                     <Truck className="w-7 h-7 text-muted-foreground" />
                   </div>
                   <div className="w-full">
                     <div className="flex justify-between items-center mb-6">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">CONTRACTED_LOGISTICS_PROVIDER</div>
                        <Link to="/book/courier" className="text-primary text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-primary/5 rounded-xl border border-primary/20 hover:bg-primary/10 transition-all">Re-Synchronize</Link>
                     </div>
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/20 p-8 rounded-[2.5rem] border border-border/10 group-hover:border-primary/20 transition-all gap-6">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border/10 shadow-sm">
                             <Database className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-black text-foreground text-xl flex items-center gap-2 uppercase italic">{selectedCourier?.name || "Global Transit"} <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase px-2 h-4">Active Node</Badge></div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Asset Mass: {packageDetails?.weight} KG • SLA Target: {selectedCourier?.etaDays || "3-5"} Days</div>
                          </div>
                       </div>
                       <div className="h-12 w-px bg-border/10 hidden sm:block" />
                       <div className="grow sm:grow-0 text-right">
                          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-1">CONTRACT VALUE</div>
                          <div className="font-heading font-black text-3xl text-foreground italic">₹{baseShipping.toFixed(2)}</div>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            </Card>

            {/* SECURITY PROTOCOL STATUS */}
            <Card className="p-10 bg-emerald-500/[0.03] border-none rounded-[3rem] ring-1 ring-emerald-500/20 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <ShieldCheck className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="flex items-center gap-8 relative z-10 w-full mb-8 md:mb-0">
                 <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-9 h-9" />
                 </div>
                 <div>
                   <h4 className="font-heading font-black text-2xl text-foreground uppercase tracking-tighter italic flex items-center gap-3">SECURITY <span className="text-emerald-500 not-italic">UPLINK ACTIVE</span> <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div></h4>
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 italic">SHA-256 Crypto-Binding Verified • On-Chain Hash Anchored</p>
                 </div>
              </div>
              <Badge className="bg-emerald-500 text-white font-black px-8 py-3 rounded-2xl border-none uppercase shadow-lg shadow-emerald-500/20 tracking-widest text-xs relative z-10 italic">PROTECTED</Badge>
            </Card>

            {/* SETTLEMENT PROTOCOL */}
            <Card className="p-10 bg-card border-none rounded-[3.5rem] shadow-2xl ring-1 ring-border/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <Wallet className="w-48 h-48" />
              </div>
              <div className="mb-10 flex flex-col gap-1 border-b border-border/10 pb-8">
                <h3 className="font-heading font-black text-3xl text-foreground uppercase tracking-tighter italic">SETTLEMENT <span className="text-primary not-italic">PROTOCOL</span></h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Select Clearing Channel for Contract Finalization</p>
              </div>
              
              <div className="grid gap-6">
                {/* WALLET OPTION */}
                <button 
                  onClick={() => setPaymentMethod('wallet')}
                  className={cn(
                    "w-full flex flex-col sm:flex-row items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all text-left group/pay relative overflow-hidden", 
                    paymentMethod === 'wallet' ? 'border-primary bg-primary/[0.03] shadow-xl' : 'border-border/10 hover:border-primary/40 bg-muted/20'
                  )}
                >
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all", 
                      paymentMethod === 'wallet' ? 'border-primary bg-primary text-white scale-110' : 'border-muted-foreground opacity-40'
                    )}>
                      {paymentMethod === 'wallet' && <CheckCircle className="w-5 h-5 stroke-[3px]" />}
                    </div>
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border/10 group-hover/pay:scale-110 transition-transform">
                       <Wallet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-black text-foreground text-lg uppercase italic tracking-tight">SWIFTPAY WALLET</span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] block mt-1 opacity-60 italic">Instant Node Settlement • Atomic Credits</span>
                    </div>
                  </div>
                  <div className="text-right mt-6 sm:mt-0 relative z-10">
                    <div className="font-heading font-black text-2xl text-foreground italic tracking-tight uppercase">₹2,450.00 <span className="text-xs opacity-40 not-italic">AVAIL</span></div>
                    <button 
                       onClick={(e) => { e.stopPropagation(); setWalletApplied(!walletApplied); }}
                       className={cn(
                         "text-[10px] font-black uppercase tracking-[0.2em] mt-2 transition-all px-4 py-1 rounded-full border", 
                         walletApplied ? "bg-emerald-500 border-emerald-500 text-white" : "border-primary/20 text-primary hover:bg-primary/5"
                       )}
                    >
                      {walletApplied ? "APPLIED" : "APPLY CREDITS"}
                    </button>
                  </div>
                </button>

                {/* UPI OPTION */}
                <button 
                  onClick={() => setPaymentMethod('upi')}
                  className={cn(
                    "w-full flex items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all text-left group/pay relative overflow-hidden", 
                    paymentMethod === 'upi' ? 'border-primary bg-primary/[0.03] shadow-xl' : 'border-border/10 hover:border-primary/40 bg-muted/20'
                  )}
                >
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all", 
                      paymentMethod === 'upi' ? 'border-primary bg-primary text-white scale-110' : 'border-muted-foreground opacity-40'
                    )}>
                      {paymentMethod === 'upi' && <CheckCircle className="w-5 h-5 stroke-[3px]" />}
                    </div>
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border/10 group-hover/pay:scale-110 transition-transform">
                       <Zap className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <span className="font-black text-foreground text-lg uppercase italic tracking-tight">UPI / INSTANT CLEARING</span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] block mt-1 opacity-60 italic">GPay • PhonePe • Paytm Uplink</span>
                    </div>
                  </div>
                  <div className="flex gap-2 relative z-10">
                    <Badge variant="outline" className="text-[8px] font-black uppercase bg-background px-3 border-border/20 text-muted-foreground opacity-40">GPAY</Badge>
                    <Badge variant="outline" className="text-[8px] font-black uppercase bg-background px-3 border-border/20 text-muted-foreground opacity-40">BHIM</Badge>
                  </div>
                </button>

                {/* UPI INPUT AREA */}
                <AnimatePresence>
                  {paymentMethod === 'upi' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-20 pr-8 pb-8 pt-2">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 block">TERMINAL_VPA_ID</label>
                        <div className="flex gap-4">
                          <Input placeholder="username@upi" className="h-16 bg-background border-border/20 rounded-2xl font-black text-xl italic select-all focus:ring-primary/20 transition-all uppercase tracking-widest pl-6" />
                          <Button variant="outline" className="h-16 px-10 font-black uppercase tracking-widest text-xs border border-primary/20 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all">VERIFY GATEWAY</Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CARD OPTION */}
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "w-full flex items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all text-left group/pay relative overflow-hidden", 
                    paymentMethod === 'card' ? 'border-primary bg-primary/[0.03] shadow-xl' : 'border-border/10 hover:border-primary/40 bg-muted/20'
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all", 
                    paymentMethod === 'card' ? 'border-primary bg-primary text-white scale-110' : 'border-muted-foreground opacity-40'
                  )}>
                    {paymentMethod === 'card' && <CheckCircle className="w-5 h-5 stroke-[3px]" />}
                  </div>
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border/10 group-hover/pay:scale-110 transition-transform">
                     <CreditCard className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <span className="font-black text-foreground text-lg uppercase italic tracking-tight">CARD SETTLEMENT</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] block mt-1 opacity-60 italic">Visa • Mastercard • RuPay Protocol</span>
                  </div>
                </button>
              </div>
            </Card>

          </div>

          {/* Right Sidebar: CONTRACT TOTAL (4 Cols) */}
          <div className="lg:col-span-4 space-y-12">
            
            <Card className="p-10 bg-card border-none rounded-[3.5rem] shadow-2xl ring-1 ring-border/5 relative overflow-hidden sticky top-28">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h3 className="font-heading font-black text-3xl mb-12 uppercase tracking-tighter italic">LEDGER <span className="text-primary not-italic">TOTAL</span></h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-muted/20 p-5 rounded-2xl border border-border/5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60">BASE_FREIGHT ({packageDetails?.weight} KG)</span>
                  <span className="font-black text-foreground text-lg italic">₹{baseShipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/20 p-5 rounded-2xl border border-border/5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60 flex items-center gap-2">FUEL_SURCHARGE <HelpCircle className="w-3.5 h-3.5 opacity-30" /></span>
                  <span className="font-black text-foreground text-lg italic">₹{fuelSurcharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic grow">VAULT_UPLINK_ACCESS</span>
                  <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] px-3 py-1 uppercase rounded-lg tracking-widest leading-none h-6 italic">SECURED</Badge>
                </div>
              </div>

              <div className="my-10 border-t border-dashed border-border/20 pt-10 space-y-6">
                <div className="flex justify-between items-center bg-muted/40 p-6 rounded-3xl border border-border/10">
                  <span className="text-foreground font-black uppercase tracking-[0.2em] text-[11px] italic">SUBTOTAL_PROTOCOL</span>
                  <span className="font-heading font-black text-foreground text-2xl italic">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-6">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic opacity-40">TAX_MANIFEST (GST 18%)</span>
                  <span className="font-black text-foreground text-lg italic">₹{gst.toFixed(2)}</span>
                </div>
                
                <AnimatePresence>
                  {promoStatus === "applied" && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="flex justify-between items-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Sparkles className="w-6 h-6" />
                      </div>
                      <span className="font-black text-emerald-600 flex items-center gap-3 uppercase tracking-widest text-[11px] italic"><Tag className="w-4 h-4" /> AUTH_CODE_0X10</span>
                      <span className="font-black text-emerald-600 text-xl italic">-₹{discountAmount.toFixed(2)}</span>
                    </motion.div>
                  )}
                  
                  {walletApplied && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="flex justify-between items-center p-6 bg-primary/10 border border-primary/20 rounded-3xl shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Database className="w-6 h-6" />
                      </div>
                      <span className="font-black text-primary flex items-center gap-3 uppercase tracking-widest text-[11px] italic"><Wallet className="w-4 h-4" /> ATOMIC_CREDIT_UTIL</span>
                      <span className="font-black text-primary text-xl italic">-₹{walletDeduction.toFixed(2)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mb-10 relative flex items-center gap-4 group/promo">
                <div className="relative flex-1">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse" />
                  <Input 
                    value={promoInput} 
                    onChange={e => setPromoInput(e.target.value.toUpperCase())} 
                    placeholder="SEC_KEY (e.g. PARCEL10)" 
                    className={cn(
                      "pl-12 h-16 bg-muted/20 border-border/10 rounded-[1.5rem] font-black text-lg italic tracking-[0.2em] transition-all focus:ring-primary/20 uppercase", 
                      promoStatus === 'invalid' && 'ring-2 ring-red-500 border-red-500 bg-red-500/5'
                    )} 
                    disabled={promoStatus === 'applied'} 
                  />
                </div>
                <Button 
                  onClick={handleApplyPromo} 
                  className={cn(
                    "h-16 px-8 font-black uppercase tracking-widest text-[9px] rounded-2xl transition-all shadow-xl active:scale-95 italic border-none", 
                    promoStatus === 'applied' ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary/90'
                  )}
                  disabled={promoStatus === 'applied' || !promoInput}
                >
                  {promoStatus === 'applied' ? 'LOADED' : 'INJECT'}
                </Button>
              </div>

              <div className="mb-10 p-10 bg-primary/5 rounded-[3.5rem] border border-primary/10 text-center relative overflow-hidden group/total shadow-2xl ring-1 ring-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 opacity-50 group-hover/total:scale-150 transition-transform duration-1000"></div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 relative z-10 italic">TOTAL CONTRACT VALUE</div>
                <div className="text-5xl font-heading font-black text-foreground relative z-10 tracking-tighter italic">₹{finalTotal.toFixed(2)}</div>
                <div className="mt-6 text-[10px] font-black text-emerald-600 bg-emerald-500/10 inline-block px-8 py-3 rounded-2xl relative z-10 border border-emerald-500/20 shadow-xl uppercase italic tracking-widest">
                  🎉 PROTOCOL YIELD: ₹{(discountAmount + walletDeduction + 18).toFixed(2)}
                </div>
              </div>

              <Button 
                onClick={handlePay} 
                disabled={isProcessing} 
                className="w-full h-24 bg-primary text-white hover:bg-primary/95 disabled:opacity-50 font-black rounded-[2.5rem] text-2xl shadow-[0_25px_60px_rgba(255,87,34,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-6 uppercase italic tracking-tighter border-none"
              >
                {isProcessing ? (
                   <><Loader2 className="w-10 h-10 animate-spin" /> COMMITTING...</>
                ) : (
                   <><Lock className="w-8 h-8 opacity-60" /> SETTLE & COMMIT</>
                )}
              </Button>
              
              <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all">
                <div className="flex flex-col items-center gap-1">
                   <ShieldCheck className="w-6 h-6 text-emerald-500" />
                   <span className="text-[8px] font-black leading-[1] uppercase tracking-widest">PCI_DSS</span>
                </div>
                <div className="h-4 w-px bg-border/20" />
                <div className="flex flex-col items-center gap-1">
                   <Lock className="w-6 h-6 text-primary" />
                   <span className="text-[8px] font-black leading-[1] uppercase tracking-widest">AES_256</span>
                </div>
                <div className="h-4 w-px bg-border/20" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">Certified Encryption</span>
              </div>
            </Card>

            <div className="text-center px-10">
               <div className="flex items-center justify-center gap-2 mb-2 text-primary/60">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em]">Settlement Gateway Ready</span>
               </div>
               <p className="text-[8px] font-black text-muted-foreground uppercase opacity-20 italic">Global Logistics Settlement Core v2.0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
