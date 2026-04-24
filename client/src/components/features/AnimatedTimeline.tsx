import { cn } from "@/lib/utils";
import { Check, Truck, Package, MapPin } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "upcoming";
}

interface AnimatedTimelineProps {
  currentStatus: string;
  className?: string;
}

export function AnimatedTimeline({ currentStatus, className }: AnimatedTimelineProps) {
  const steps: Step[] = [
    { id: 1, title: "Pickup Completed", icon: <Package className="w-4 h-4" />, status: "upcoming" },
    { id: 2, title: "In Transit", icon: <Truck className="w-4 h-4" />, status: "upcoming" },
    { id: 3, title: "Out for Delivery", icon: <MapPin className="w-4 h-4" />, status: "upcoming" },
    { id: 4, title: "Delivered", icon: <Check className="w-4 h-4" />, status: "upcoming" },
  ];

  // Logic to determine status of each step based on currentStatus
  let currentStepIndex = -1;
  if (currentStatus === "Pickup Completed" || currentStatus === "Order Booked") currentStepIndex = 0;
  else if (currentStatus === "In Transit") currentStepIndex = 1;
  else if (currentStatus === "Out for Delivery") currentStepIndex = 2;
  else if (currentStatus === "Delivered") currentStepIndex = 3;

  const processedSteps = steps.map((step, index) => {
    if (index < currentStepIndex) return { ...step, status: "completed" as const };
    if (index === currentStepIndex) return { ...step, status: "current" as const };
    return step;
  });

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const getProgressBar = (pct: number) => {
    const totalBlocks = 12;
    const filledBlocks = Math.round((pct / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
  };

  return (
    <div className={cn("w-full py-8 px-4", className)}>
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-muted rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
          />
        </div>

        <div className="relative flex justify-between">
          {processedSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center group">
              {/* Step Circle */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 relative z-10",
                  step.status === "completed" ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" :
                  step.status === "current" ? "bg-card border-2 border-primary text-primary shadow-md scale-125" :
                  "bg-card border-2 border-muted text-muted-foreground"
                )}
              >
                {step.status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.icon
                )}

                {/* Pulse for Current Step */}
                {step.status === "current" && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping -z-10" />
                )}
              </div>

              {/* Step Title */}
              <div className="mt-4 text-center">
                <div className={cn(
                  "text-[10px] uppercase font-extrabold tracking-widest mb-1 transition-colors duration-500",
                  step.status !== "upcoming" ? "text-foreground" : "text-muted-foreground/50"
                )}>
                  {step.title}
                </div>
                {step.status === "current" && (
                   <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto animate-bounce mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-12 flex items-center justify-between bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Overall Progress</div>
                  <div className="text-sm font-extrabold text-foreground tracking-tight pl-1 bg-muted/30 border border-muted py-1 mt-1 px-3 rounded-lg flex items-center gap-1.5"><span className="text-lg font-mono tracking-tighter">{getProgressBar(progressPercentage)}</span> {Math.round(progressPercentage)}% Completed</div>
              </div>
          </div>
          
          <div className="h-8 w-px bg-border/60 mx-4" />

          <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground mb-1">
                  <span>Journey</span>
                  <span>Goal</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                    style={{ width: `${progressPercentage}%` }}
                  />
              </div>
          </div>
      </div>
    </div>
  );
}

function Activity({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    )
}
