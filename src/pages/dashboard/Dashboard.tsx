import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import AchievementCelebration from "@/components/achievements/AchievementCelebration";
import NutritionistDashboard from "@/components/dashboard/NutritionistDashboard";
import PatientDashboard from "@/components/dashboard/PatientDashboard";
import TrainerDashboard from "@/components/dashboard/TrainerDashboard";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { 
    clients, 
    nutritionists, 
    trainers,
    progressRecords,
    achievements, 
    trainingPlans,
    getClientsByNutritionist,
    getClientsByTrainer, 
    getClientById,
    getProgressRecordsByClient, 
    getAchievementsByClient, 
    getNutritionPlansByClient,
    getNutritionFollowUpsByClient,
    getTrainingPlansByClient,
    newAchievement, 
    clearNewAchievement
  } = useData();
  
  const isNutritionist = currentUser?.role === "nutritionist";
  const isTrainer = currentUser?.role === "trainer";
  const [clientId, setClientId] = useState<string | null>(null);
  
  useEffect(() => {
    if (isNutritionist) {
      const nutritionist = nutritionists.find(n => n.userId === currentUser?.id);
      if (nutritionist && nutritionist.clients.length > 0) {
        setClientId(nutritionist.clients[0]);
      }
    } else if (isTrainer) {
      const trainer = trainers.find(t => t.userId === currentUser?.id);
      if (trainer && trainer.clients.length > 0) {
        setClientId(trainer.clients[0]);
      }
    } else if (currentUser) {
      const client = clients.find(c => c.userId === currentUser.id);
      if (client) {
        setClientId(client.id);
      }
    }
  }, [currentUser, isNutritionist, isTrainer, nutritionists, trainers, clients]);

  const nutritionistClients = isNutritionist 
    ? getClientsByNutritionist(nutritionists.find(n => n.userId === currentUser?.id)?.id || "") 
    : [];

  const trainerClients = isTrainer
    ? getClientsByTrainer(trainers.find(t => t.userId === currentUser?.id)?.id || "")
    : [];

  const nutritionistId = nutritionists.find(n => n.userId === currentUser?.id)?.id || "";
  const trainerId = trainers.find(t => t.userId === currentUser?.id)?.id || "";

  return (
    <div className="container mx-auto p-4">
      {newAchievement && (
        <AchievementCelebration 
          achievement={newAchievement}
          open={!!newAchievement}
          onClose={clearNewAchievement}
        />
      )}
      
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <LayoutDashboard className="h-8 w-8" />
        {isNutritionist ? "Panel de Nutricionista" : isTrainer ? "Panel de Entrenador" : "Mi Dashboard"}
      </h1>
      
      {isNutritionist ? (
        <NutritionistDashboard 
          nutritionistId={nutritionistId}
          clients={nutritionistClients}
          clientFollowUps={getNutritionFollowUpsByClient(clientId || "")}
          clientPlans={getNutritionPlansByClient(clientId || "")}
          clientAchievements={getAchievementsByClient(clientId || "")}
          getProgressRecordsByClient={getProgressRecordsByClient}
        />
      ) : isTrainer ? (
        <TrainerDashboard
          trainerId={trainerId}
          clients={trainerClients}
          clientTrainingPlans={trainingPlans.filter(p => p.trainerId === trainerId)}
          clientAchievements={getAchievementsByClient(clientId || "")}
          getProgressRecordsByClient={getProgressRecordsByClient}
          getClientById={getClientById}
        />
      ) : clientId && (
        <PatientDashboard
          client={getClientById(clientId)!}
          clientProgressRecords={getProgressRecordsByClient(clientId)}
          clientAchievements={getAchievementsByClient(clientId)}
          clientPlans={getNutritionPlansByClient(clientId)}
        />
      )}
    </div>
  );
};

export default Dashboard;
