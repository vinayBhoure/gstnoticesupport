import type { HTMLAttributes } from "react";

type BadgeVariant = "outline" | "amber" | "green";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = "outline", className = "", children, ...props }: BadgeProps) {
  const variantClass: Record<BadgeVariant, string> = {
    outline: "badge-outline",
    amber: "badge-amber",
    green: "badge-green",
  };

  const classes = ["badge", variantClass[variant], className].filter(Boolean).join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
