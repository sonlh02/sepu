import React from 'react';
import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CustomBadgeProps extends Omit<BadgeProps, 'variant'> {
  variant?: 'success' | 'warning' | BadgeProps['variant'];
}

export const CustomBadge = React.forwardRef<HTMLDivElement, CustomBadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(className)}>
        <Badge
          className={cn(
            {
              "bg-green-100 text-green-800 hover:bg-green-200": variant === "success",
              "bg-yellow-100 text-yellow-800 hover:bg-yellow-200": variant === "warning",
            },
            className
          )}
          variant={variant === "success" || variant === "warning" ? "outline" : variant}
          {...props}
        />
      </div>
    );
  }
);
CustomBadge.displayName = "CustomBadge";
