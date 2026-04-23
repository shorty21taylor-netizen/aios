import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-2xl border border-grey-200 bg-white p-6 ${
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
    className={`font-display text-lg font-medium text-grey-950 ${className || ""}`}
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
