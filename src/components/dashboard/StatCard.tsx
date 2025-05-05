
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  action?: React.ReactNode;  // Nueva propiedad para acciones (botones, enlaces, etc.)
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
  action,  // Agregamos el action a los props
}: StatCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && trendValue && (
          <div className="mt-2 flex items-center text-xs">
            {trend === "up" && (
              <>
                <span className="text-success">▲ {trendValue}</span>
                <span className="ml-1 text-muted-foreground">
                  vs. periodo anterior
                </span>
              </>
            )}
            {trend === "down" && (
              <>
                <span className="text-destructive">▼ {trendValue}</span>
                <span className="ml-1 text-muted-foreground">
                  vs. periodo anterior
                </span>
              </>
            )}
            {trend === "neutral" && (
              <span className="text-muted-foreground">
                Sin cambios vs. periodo anterior
              </span>
            )}
          </div>
        )}
        {action && <div className="mt-3">{action}</div>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
