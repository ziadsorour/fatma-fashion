import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className, size = 24 }: { className?: string; size?: number }) {
  return <Loader2 className={cn("animate-spin text-rose-gold", className)} size={size} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Spinner size={40} className="mx-auto mb-4" />
        <p className="text-charcoal/60 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );
}
