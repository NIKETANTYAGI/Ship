import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong",
  message = "Please try again.", 
  onRetry, 
  className 
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500",
      className
    )}>
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100 ring-4 ring-red-50/50">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="font-heading font-bold text-xl text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs text-sm font-medium mb-6">
        {message}
      </p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="border-primary text-primary hover:bg-primary/5 font-bold px-8 py-2 rounded-xl h-11 transition-all active:scale-95 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry Now
        </Button>
      )}
    </div>
  );
}
