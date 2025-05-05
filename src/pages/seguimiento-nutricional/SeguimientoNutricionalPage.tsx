
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  StickyNote,
  User,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import NutritionFollowUpForm from "@/components/nutrition/NutritionFollowUpForm";

interface SeguimientoNutricionalPageProps {
  mode?: "list" | "create" | "view";
}

const SeguimientoNutricionalPage = ({ mode = "list" }: SeguimientoNutricionalPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    nutritionFollowUps, 
    clients, 
    getClientById, 
    nutritionPlans 
  } = useData();
  
  const [activeTab, setActiveTab] = useState("details");
  const [isCreating, setIsCreating] = useState(mode === "create");
  
  // Find the follow-up by ID
  const followUp = id ? nutritionFollowUps.find(f => f.id === id) : undefined;
  
  // Get client information
  const client = followUp ? getClientById(followUp.clientId) : undefined;
  
  // Get plan information
  const plan = followUp ? nutritionPlans.find(p => p.id === followUp.planId) : undefined;
  
  const handleCreateSuccess = () => {
    navigate("/seguimiento-nutricional");
  };
  
  const getMoodLabel = (mood?: "good" | "normal" | "bad") => {
    switch (mood) {
      case "good":
        return <Badge className="bg-green-500">Bueno</Badge>;
      case "normal":
        return <Badge className="bg-blue-500">Normal</Badge>;
      case "bad":
        return <Badge className="bg-red-500">Malo</Badge>;
      default:
        return null;
    }
  };
  
  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  // Create mode
  if (isCreating) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/seguimiento-nutricional")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Crear Seguimiento Nutricional</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <NutritionFollowUpForm onComplete={handleCreateSuccess} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Detail view mode
  if (mode === "view" && followUp) {
    return (
      <div className="container mx-auto">
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/seguimiento-nutricional">Seguimiento Nutricional</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>Detalle</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => navigate("/seguimiento-nutricional")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Detalle de Seguimiento</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <User className="h-4 w-4 mr-2" /> 
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{client?.name}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" /> 
                Plan Nutricional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{plan?.title}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" /> 
                Fecha
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <p className="text-lg font-semibold mr-3">
                {format(new Date(followUp.date), "PPP", { locale: es })}
              </p>
              {getMoodLabel(followUp.mood)}
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="meals">Comidas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Detallada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {followUp.notes && (
                  <div>
                    <h3 className="text-lg font-medium flex items-center mb-2">
                      <StickyNote className="h-4 w-4 mr-2" />
                      Notas
                    </h3>
                    <p className="whitespace-pre-wrap">{followUp.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meals" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followUp.completedMeals.map((meal, index) => {
                const mealTypeLabels: Record<string, string> = {
                  breakfast: "Desayuno",
                  lunch: "Almuerzo", 
                  dinner: "Cena",
                  snack: "Merienda"
                };
                
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {mealTypeLabels[meal.mealType]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {meal.photo && (
                        <div>
                          <img
                            src={meal.photo}
                            alt={mealTypeLabels[meal.mealType]}
                            className="rounded-md w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      
                      {meal.notes && (
                        <div>
                          <h4 className="font-medium mb-1">Notas:</h4>
                          <p className="text-sm">{meal.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {followUp.completedMeals.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No hay comidas registradas.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // List mode (default)
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Seguimiento Nutricional</h1>
        <Button onClick={handleCreateClick} className="flex items-center gap-2">
          <Plus size={16} /> Crear Seguimiento
        </Button>
      </div>
      
      {nutritionFollowUps.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No hay registros de seguimiento nutricional.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleCreateClick}
            >
              Crear primer seguimiento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nutritionFollowUps.map((followUp) => {
            const client = getClientById(followUp.clientId);
            return (
              <Card 
                key={followUp.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/seguimiento-nutricional/${followUp.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {client?.name || "Cliente"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(followUp.date), "PPP", { locale: es })}
                    </p>
                    {getMoodLabel(followUp.mood)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeguimientoNutricionalPage;
