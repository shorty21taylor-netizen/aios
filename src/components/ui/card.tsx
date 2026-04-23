import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={`font-display text-lg font-medium text-ink-50 ${className || ""}`}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`mt-4 ${className || ""}`} {...props} />
));

CardContent.displayName = "CardContent";
