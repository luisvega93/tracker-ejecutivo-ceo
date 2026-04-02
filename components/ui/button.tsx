import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "bg-brand text-white hover:bg-brand/90 disabled:bg-brand/60",
  secondary:
    "bg-brand-soft text-brand hover:bg-brand-soft/80 disabled:bg-brand-soft/70",
  ghost:
    "bg-transparent text-foreground hover:bg-brand/[0.06] disabled:text-muted",
  danger:
    "bg-red text-white hover:bg-red/90 disabled:bg-red/60",
} as const;

const sizeClasses = {
  default: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-5 text-sm",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
