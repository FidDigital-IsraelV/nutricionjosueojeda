import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Users, Dumbbell, Apple, Calendar, FileDown } from "lucide-react";
import ReporteClientes from "@/components/reportes/ReporteClientes";
import ReportePlanes from "@/components/reportes/ReportePlanes";
import ReporteSesiones from "@/components/reportes/ReporteSesiones";
import { Navigate } from "react-router-dom";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";

const ReportesPage = () => {
  const { currentUser } = useAuth();
  const [reportMonth, setReportMonth] = useState<string>(new Date().getMonth().toString());
  const [reportYear, setReportYear] = useState<string>(new Date().getFullYear().toString());
  const [activeTab, setActiveTab] = useState<string>("clientes");
  const reportRef = useRef<HTMLDivElement>(null);
  
  if (currentUser?.role !== "nutritionist" && currentUser?.role !== "trainer") {
    return <Navigate to="/dashboard" replace />;
  }

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear; i++) {
    years.push(i.toString());
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      toast.info("Preparando el PDF...");
      let reportName = "Reporte";
      
      switch (activeTab) {
        case "clientes":
          reportName = "Reporte_Clientes";
          break;
        case "planes":
          reportName = "Reporte_Planes";
          break;
        case "sesiones":
          reportName = "Reporte_Sesiones";
          break;
      }
      
      await exportToPDF(reportRef.current, reportName);
      toast.success("PDF generado exitosamente");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Visualiza estadísticas e información sobre clientes, planes y sesiones.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={reportMonth} onValueChange={setReportMonth}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={reportYear} onValueChange={setReportYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportPDF}
          >
            <FileDown size={16} />
            <span>Exportar PDF</span>
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="clientes" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto">
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Users size={16} />
            <span>Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="planes" className="flex items-center gap-2">
            <FileText size={16} />
            <span>Planes</span>
          </TabsTrigger>
          <TabsTrigger value="sesiones" className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Sesiones</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6" ref={reportRef}>
          <TabsContent value="clientes" className="space-y-6">
            <ReporteClientes month={reportMonth} year={reportYear} />
          </TabsContent>
          
          <TabsContent value="planes" className="space-y-6">
            <ReportePlanes month={reportMonth} year={reportYear} />
          </TabsContent>
          
          <TabsContent value="sesiones" className="space-y-6">
            <ReporteSesiones month={reportMonth} year={reportYear} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ReportesPage;
