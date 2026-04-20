import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground hover:opacity-90 border border-transparent",
  outline:
    "border border-border bg-background text-foreground hover:bg-muted",
  ghost: "border border-transparent bg-transparent text-foreground hover:bg-muted",
};

export function Button({ className, variant = "default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantClassMap[variant],
        className,
      )}
      {...props}
    />
  );
}
