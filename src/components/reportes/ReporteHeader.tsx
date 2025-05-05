
import React from "react";
import { useTheme } from "@/components/theme/theme-provider";

interface ReporteHeaderProps {
  title: string;
  subtitle?: string;
}

const ReporteHeader: React.FC<ReporteHeaderProps> = ({ title, subtitle }) => {
  const { theme } = useTheme();
  
  return (
    <div className="mb-8 flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex justify-center">
        <img 
          src="/public/lovable-uploads/b2500693-c261-4fb7-9105-1420fc4b4664.png" 
          alt="THREEPERCENT Logo" 
          className="h-16 object-contain"
        />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
};

export default ReporteHeader;
