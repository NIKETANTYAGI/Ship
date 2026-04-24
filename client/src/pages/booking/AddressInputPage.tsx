import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Package, ArrowRight, ArrowUpDown,
  Loader2, Home, Briefcase, Heart, Search,
  Navigation, Globe, Zap, ShieldCheck, Activity,
  Database, Radio, Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";
import { useToast } from "@/context/ToastContext";
import { BookingStepper } from "@/components/features/BookingStepper";

export default function AddressInput() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    pickup, updatePickup,
    delivery, updateDelivery,
    packageDetails, updatePackage
  } = useBooking();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name: string, value: string) => {
    if (!value) return "Required";
    if (name.includes("Pincode") && !/^\d{6}$/.test(value)) return "Invalid Pincode";
    if (name.includes("Phone") && !/^\d{10}$/.test(value)) return "Invalid Phone";
    return "";
  };

  const isFormValid = () => {
    return (
      pickup.pincode && pickup.address && pickup.name && pickup.phone &&
      delivery.pincode && delivery.address && delivery.name && delivery.phone &&
      Object.keys(errors).length === 0
    );
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    if (err) setErrors(prev => ({ ...prev, [field]: err }));
    else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Logic for continuing
      setTimeout(() => {
        setIsLoading(false);
        navigate('/book/evidence');
      }, 800);
    } catch (err) {
      showToast("Node Linkage Failure: Could not synchronize coordinates.", "error");
      setIsLoading(false);
    }
  };

  const savedTerminals = [
    { id: 1, type: "Base Alpha", name: "Rahul Sharma", address: "B-402, Seawoods, Mumbai 400001", icon: <Database className="w-5 h-5 text-primary" />, isDefault: true },
    { id: 2, type: "Sector 7", name: "Rahul Sharma", address: "Tech Park, Andheri, Mumbai 400053", icon: <Radio className="w-5 h-5 text-blue-500" />, isDefault: false },
    { id: 3, type: "Outpost 9", name: "Suresh Sharma", address: "Vijay Nagar, Indore 452010", icon: <Landmark className="w-5 h-5 text-emerald-500" />, isDefault: false }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 pb-32">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10">
        
        {/* MISSION HEADER */}
        <div className="mb-12 border-b border-border/10 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Navigation className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Grid Config 9.1</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter uppercase italic">
            MISSION <span className="text-primary not-italic">COORDINATES</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg mt-2 max-w-2xl">Define the origin and destination nodes for current transmission protocol.</p>
        </div>

        <BookingStepper />

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
          
          {/* Left: Configuration Forms (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* SAVED TERMINALS */}
            <div>
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Frequent Terminals</h3>
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">Manage All</Button>
              </div>
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {savedTerminals.map(term => (
                  <button 
                    key={term.id} 
                    onClick={() => updatePickup({ pincode: term.address.split(' ').pop() || "", address: term.address, name: term.name })}
                    className={cn(
                      "snap-start shrink-0 w-72 p-6 rounded-[2.5rem] border-2 text-left transition-all duration-300 relative overflow-hidden group shadow-xl", 
                      term.isDefault ? "bg-primary/[0.03] border-primary" : "bg-card border-border/10 hover:border-primary/40 shadow-none hover:shadow-2xl"
                    )}
                  >
                    {term.isDefault && <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">ACTIVE BASE</div>}
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-background rounded-2xl p-3 border border-border/10 group-hover:scale-110 transition-transform shadow-md">{term.icon}</div>
                      <div className="font-heading font-black text-lg text-foreground uppercase italic tracking-tighter">{term.type}</div>
                    </div>
                    
                    <div className="text-sm font-black text-foreground mb-1 uppercase italic">{term.name}</div>
                    <div className="text-[11px] text-muted-foreground font-medium leading-loose italic opacity-60 line-clamp-2">{term.address}</div>

                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* NODE ORIGIN (PICKUP) */}
            <Card className="p-10 bg-card border-none rounded-[3rem] shadow-2xl ring-1 ring-border/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-3 h-full bg-primary/80"></div>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Radio className="w-16 h-16" />
              </div>

              <div className="flex items-center gap-6 border-b border-border/10 pb-8 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                   <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-3xl text-foreground uppercase tracking-tighter italic">NODE <span className="text-primary not-italic">ORIGIN</span></h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Point of Initialization</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-4 sm:col-span-2 relative">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Terminal Registry (Pincode)</Label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      value={pickup.pincode} 
                      onChange={e => updatePickup({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} 
                      onBlur={() => handleBlur("pickupPincode", pickup.pincode)}
                      placeholder="Transmission Code (e.g. 400001)" 
                      className={cn(
                        "pl-14 h-16 bg-muted/20 border-border/10 rounded-2xl font-black text-lg focus:ring-primary/20 transition-all", 
                        touched.pickupPincode && errors.pickupPincode && "border-red-500 bg-red-500/5"
                      )} 
                    />
                  </div>
                </div>

                <div className="space-y-4 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Physical Coordinates (Address)</Label>
                  <Input 
                    value={pickup.address} 
                    onChange={e => updatePickup({ address: e.target.value })} 
                    onBlur={() => handleBlur("pickupAddress", pickup.address)}
                    placeholder="Terminal Location Details" 
                    className={cn(
                      "h-16 bg-muted/20 border-border/10 rounded-2xl font-black italic transition-all", 
                      touched.pickupAddress && errors.pickupAddress && "border-red-500 bg-red-500/5"
                    )} 
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Operator Identity</Label>
                  <Input 
                    value={pickup.name} 
                    onChange={e => updatePickup({ name: e.target.value })} 
                    placeholder="Subject Name" 
                    className="h-16 bg-muted/20 border-border/10 rounded-2xl font-black uppercase tracking-tight" 
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Signal Uplink (Phone)</Label>
                  <Input 
                    value={pickup.phone} 
                    onChange={e => updatePickup({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} 
                    placeholder="Comms Frequency" 
                    className="h-16 bg-muted/20 border-border/10 rounded-2xl font-black" 
                  />
                </div>
              </div>
            </Card>

            {/* SWAP NODES BUTTON */}
            <div className="relative flex justify-center -my-6 z-10">
              <Button 
                onClick={() => {
                  const temp = { ...pickup };
                  updatePickup({ ...delivery });
                  updateDelivery({ ...temp });
                }} 
                variant="outline" 
                className="w-14 h-14 rounded-full bg-background shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-border/40 hover:border-primary hover:text-primary transition-all p-0 group"
              >
                <ArrowUpDown className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              </Button>
            </div>

            {/* NODE DESTINATION (DELIVERY) */}
            <Card className="p-10 bg-card border-none rounded-[3rem] shadow-2xl ring-1 ring-border/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-3 h-full bg-blue-500/80"></div>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Globe className="w-16 h-16" />
              </div>

              <div className="flex items-center gap-6 border-b border-border/10 pb-8 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                   <Navigation className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-3xl text-foreground uppercase tracking-tighter italic">NODE <span className="text-blue-500 not-italic">DESTINATION</span></h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Point of Finalization</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-4 sm:col-span-2 relative">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Terminal Registry (Pincode)</Label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <Input 
                      value={delivery.pincode} 
                      onChange={e => updateDelivery({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} 
                      placeholder="Transmission Code (e.g. 110001)" 
                      className="pl-14 h-16 bg-muted/20 border-border/10 rounded-2xl font-black text-lg" 
                    />
                  </div>
                </div>

                <div className="space-y-4 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Physical Coordinates (Address)</Label>
                  <Input 
                    value={delivery.address} 
                    onChange={e => updateDelivery({ address: e.target.value })} 
                    placeholder="Terminal Location Details" 
                    className="h-16 bg-muted/20 border-border/10 rounded-2xl font-black italic" 
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Subject Identity</Label>
                  <Input 
                    value={delivery.name} 
                    onChange={e => updateDelivery({ name: e.target.value })} 
                    placeholder="Recipient Name" 
                    className="h-16 bg-muted/20 border-border/10 rounded-2xl font-black uppercase tracking-tight" 
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Signal Uplink (Phone)</Label>
                  <Input 
                    value={delivery.phone} 
                    onChange={e => updateDelivery({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} 
                    placeholder="Comms Frequency" 
                    className="h-16 bg-muted/20 border-border/10 rounded-2xl font-black" 
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-between items-center pt-8 gap-8">
              <Button 
                onClick={() => navigate('/book/courier')} 
                variant="ghost" 
                className="h-16 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border border-border/20 hover:bg-muted/50 transition-all opacity-40 hover:opacity-100"
              >
                BACK TO NODES
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={isLoading || !isFormValid()} 
                className="flex-1 h-16 bg-primary text-white hover:bg-primary/90 font-black rounded-2xl text-xl shadow-[0_15px_40px_rgba(255,87,34,0.3)] transition-all active:scale-95 group uppercase italic tracking-tight"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>FINALIZE COORDINATES <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" /></>}
              </Button>
            </div>
          </div>

          {/* Right Sidebar: MISSION LOG (4 Cols) */}
          <div className="lg:col-span-4 space-y-12">
            <Card className="glass-card border-none rounded-[3.5rem] p-10 shadow-2xl ring-1 ring-border/5 sticky top-28 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-16 h-16" />
              </div>
              <h3 className="font-heading font-black text-3xl mb-10 border-b border-border/10 pb-6 uppercase tracking-tighter italic">MISSION <span className="text-primary not-italic">LOG</span></h3>
              
              <div className="space-y-10">
                <div className="flex items-start gap-4 p-5 bg-muted/20 rounded-[2rem] border border-border/10">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">CONTRACTOR</p>
                      <p className="text-sm font-black text-foreground italic uppercase">{useBooking().selectedCourier?.name || "PENDING"}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-muted/20 rounded-[2rem] border border-border/10">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ASSET PAYLOAD</p>
                      <p className="text-sm font-black text-foreground italic uppercase">{useBooking().packageDetails?.weight || "0"} KG</p>
                    </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-border/10">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Protocol Integrity</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 font-black text-[10px] uppercase">VERIFIED</Badge>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic opacity-60">
                    Security hash will be generated upon completion of Evidence Vault upload. All coordinates are end-to-end encrypted.
                </p>
              </div>
            </Card>

            <div className="px-10 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Grid Uplink Stable</span>
              </div>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-30 italic">Transmission Layer 4 Secured</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
