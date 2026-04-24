import React from "react";
import { useLocation } from "react-router-dom";
import { Check, MapPin, Truck, ShieldCheck, CreditCard, Activity, Zap, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "courier", label: "NODE SELECTION", path: "/compare", icon: Radar },
  { id: "address", label: "COORDINATES", path: "/book/address", icon: MapPin },
  { id: "evidence", label: "VAULT UPLINK", path: "/book/evidence", icon: ShieldCheck },
  { id: "review", label: "COMMIT LOGS", path: "/book/review", icon: CreditCard },
];

function Radar(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 12L19 12" />
      <path d="M12 2v20" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function BookingStepper() {
  const location = useLocation();
  const currentStepIndex = STEPS.findIndex(s => s.path === location.pathname);

  return (
    <div className="w-full max-w-5xl mx-auto mb-16 px-4">
      <div className="relative">
        {/* Technical Background Grid Effect (Optional if needed, but keeping it clean) */}
        
        <div className="relative flex justify-between items-start">
          {/* Progress Bar Background */}
          <div className="absolute top-[22px] left-0 w-full h-1 bg-muted/20 rounded-full overflow-hidden">
             <div 
               className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(255,87,34,0.5)]"
               style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
             />
          </div>
          
          {STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isActive = currentStepIndex === idx;
            const isUpcoming = currentStepIndex < idx;

            return (
              <div key={step.id} className="relative flex flex-col items-center gap-4 group">
                {/* Step Connector Label (Small logic number) */}
                <div className={cn(
                  "absolute -top-4 text-[9px] font-black tracking-widest transition-opacity duration-500",
                  isActive ? "opacity-100" : "opacity-0"
                )}>
                  STEP 0{idx + 1}
                </div>

                {/* Step Node */}
                <div className={cn(
                  "w-12 h-12 rounded-[1rem] flex items-center justify-center z-10 transition-all duration-500 border-2 relative",
                  isCompleted ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" : 
                  isActive ? "bg-background border-primary text-primary ring-[6px] ring-primary/10 shadow-2xl scale-125" : 
                  "bg-muted border-border/40 text-muted-foreground scale-100 grayscale"
                )}>
                  {isCompleted ? (
                    <Check className="w-6 h-6 stroke-[3px]" />
                  ) : (
                    <step.icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                  )}
                  
                  {isActive && (
                     <div className="absolute -inset-2 bg-primary/5 rounded-2xl animate-pulse -z-10" />
                  )}
                </div>
                
                {/* Step Label */}
                <div className="flex flex-col items-center text-center">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                    isActive ? "text-foreground translate-y-0 opacity-100" : "text-muted-foreground opacity-40"
                  )}>
                    {step.label}
                  </span>
                  {isActive && (
                     <div className="mt-1 h-0.5 w-4 bg-primary rounded-full animate-in fade-in zoom-in duration-1000" />
                  )}
                </div>

                {/* Status Dot for completed ones */}
                {isCompleted && (
                   <div className="absolute top-[22px] right-0 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-background z-20" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
