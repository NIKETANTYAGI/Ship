import { Search, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon = Search, 
  actionText, 
  onAction, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in duration-700",
      className
    )}>
      <div className="w-24 h-24 bg-muted/40 text-muted-foreground/40 rounded-full flex items-center justify-center mb-8 border border-border/50 shadow-inner relative">
         <div className="absolute inset-0 bg-muted/20 rounded-full animate-ping opacity-20 scale-150" />
         <Icon className="w-10 h-10 relative z-10" />
      </div>
      <h3 className="font-heading font-bold text-2xl text-foreground mb-3">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-8 max-w-sm text-sm font-medium leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button 
          onClick={onAction} 
          className="h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-10 shadow-[0_10px_30px_rgba(255,87,34,0.2)] transition-all active:scale-95"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
