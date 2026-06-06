import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "phone" | "whatsapp";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  block?: boolean;
};

export function Button({
  variant = "primary",
  block = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClass: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    tertiary: "btn-tertiary",
    phone: "btn-phone",
    whatsapp: "btn-wa",
  };

  const classes = ["btn", variantClass[variant], block ? "btn-block" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
