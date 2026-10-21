import { cn } from "@/lib/utils";
import { Button } from "./button";
import { LucideIcon, PackageOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon = PackageOpen, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-beige/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-rose-gold/60" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal mb-2">{title}</h3>
      {description && <p className="text-charcoal/60 text-sm max-w-md mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">{actionLabel}</Button>
      )}
    </div>
  );
}
