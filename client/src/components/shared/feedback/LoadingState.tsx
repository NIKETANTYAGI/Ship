import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingState({ 
  message = "Loading...", 
  className, 
  fullPage = false 
}: LoadingStateProps) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500",
      className
    )}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Loader2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      {message && (
        <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
