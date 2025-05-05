
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Dumbbell } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import NutritionPlanTab from "./components/NutritionPlanTab";
import TrainingPlanTab from "./components/TrainingPlanTab";
import { calculateMealTotals, formatDate } from "./utils/planHelpers";

const MyPlanPage = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { 
    clients, 
    getNutritionPlansByClient, 
    getTrainingPlansByClient,
    foods,
    getSupplementById
  } = useData();
  
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = React.useState(tabFromUrl === "training" ? "training" : "nutrition");
  
  const client = clients.find(c => c.userId === currentUser?.id);
  
  const nutritionPlans = client ? getNutritionPlansByClient(client.id) : [];
  const trainingPlans = client ? getTrainingPlansByClient(client.id) : [];
  
  const activeNutritionPlan = nutritionPlans.find(plan => plan.isActive);
  const activeTrainingPlan = trainingPlans.find(plan => plan.status === "active");

  const getFoodById = (foodId: string) => {
    return foods.find(food => food.id === foodId) || null;
  };
  
  const handleCalculateMealTotals = (foods: any[]) => {
    return calculateMealTotals(foods, getFoodById);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Mis Planes</h1>
      
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Plan Nutricional
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Plan de Entrenamiento
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="nutrition">
          <NutritionPlanTab 
            activeNutritionPlan={activeNutritionPlan} 
            formatDate={formatDate}
            calculateMealTotals={handleCalculateMealTotals}
            getFoodById={getFoodById}
            getSupplementById={getSupplementById}
          />
        </TabsContent>
        
        <TabsContent value="training">
          <TrainingPlanTab activeTrainingPlan={activeTrainingPlan} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyPlanPage;
