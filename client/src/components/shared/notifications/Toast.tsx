import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border min-w-[300px] animate-in slide-in-from-right-10 fade-in duration-300",
            toast.type === "success" && "bg-emerald-50 border-emerald-100 text-emerald-900",
            toast.type === "error" && "bg-red-50 border-red-100 text-red-900",
            toast.type === "info" && "bg-blue-50 border-blue-100 text-blue-900"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
            toast.type === "success" && "bg-emerald-500 text-white",
            toast.type === "error" && "bg-red-500 text-white",
            toast.type === "info" && "bg-blue-500 text-white"
          )}>
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
            {toast.type === "info" && <Info className="w-5 h-5" />}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-sm tracking-tight capitalize">{toast.type}</h4>
            <p className="text-sm font-medium opacity-80 leading-snug">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 opacity-40 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Re-export provider and hook for convenience if needed, 
// though they are now in context/ToastContext.tsx
export { ToastProvider, useToast } from "@/context/ToastContext";
