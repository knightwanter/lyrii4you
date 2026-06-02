"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md hover:shadow-glow hover:brightness-110",
  secondary:
    "bg-bg-tertiary text-text-primary border border-border hover:border-border-hover hover:bg-bg-card-hover",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-primary-ghost",
  danger:
    "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
  accent:
    "bg-gradient-to-r from-accent to-primary text-white shadow-md hover:shadow-glow-accent hover:brightness-110",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-10 px-5 text-sm rounded-xl gap-1.5",
  md: "h-11 px-6 text-sm rounded-xl gap-2",
  lg: "h-13 px-8 text-base rounded-2xl gap-2.5",
  icon: "h-11 w-11 rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap align-middle font-medium leading-none transition-all duration-200 ease-out",
          "[&_svg]:shrink-0 [&_svg]:self-center",
          "[&_.ui-button-content]:inline-flex [&_.ui-button-content]:items-center [&_.ui-button-content]:justify-center [&_.ui-button-content]:gap-2 [&_.ui-button-content]:leading-none",
          "[&_.ui-emoji]:inline-flex [&_.ui-emoji]:items-center [&_.ui-emoji]:justify-center [&_.ui-emoji]:leading-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-root",
          "disabled:opacity-50 disabled:pointer-events-none",
          "active:scale-[0.97]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="absolute animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        <span className={cn("ui-button-content", loading && "invisible")}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
