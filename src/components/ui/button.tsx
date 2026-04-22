import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", ...props },
    ref
  ) => {
    const baseClasses =
      "font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
      secondary:
        "bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-600",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
