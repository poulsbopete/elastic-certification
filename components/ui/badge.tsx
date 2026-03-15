import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600/20 text-blue-400 border border-blue-600/30",
        secondary: "bg-slate-700 text-slate-300 border border-slate-600",
        destructive: "bg-red-600/20 text-red-400 border border-red-600/30",
        success: "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30",
        warning: "bg-amber-600/20 text-amber-400 border border-amber-600/30",
        outline: "border border-slate-600 text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
