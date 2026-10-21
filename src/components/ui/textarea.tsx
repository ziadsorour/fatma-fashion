import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string; label?: string }>(
  ({ className, error, label, id, ...props }, ref) => {
    const tid = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && <label htmlFor={tid} className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>}
        <textarea
          id={tid}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-beige bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/40 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-red-400 focus:ring-red-300",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export { Textarea };
