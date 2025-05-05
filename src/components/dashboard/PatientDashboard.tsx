
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Achievement, Client, NutritionPlan, ProgressRecord } from "@/types";
import OverviewTab from "./tabs/OverviewTab";
import NutritionTab from "./tabs/NutritionTab";
import ProgressTab from "./tabs/ProgressTab";
import { calculateWeightMetrics, prepareClientWeightProgressData } from "./utils/dashboardHelpers";

interface PatientDashboardProps {
  client: Client;
  clientProgressRecords: ProgressRecord[];
  clientAchievements: Achievement[];
  clientPlans: NutritionPlan[];
}

const PatientDashboard = ({
  client,
  clientProgressRecords,
  clientAchievements,
  clientPlans
}: PatientDashboardProps) => {
  const [selectedTab, setSelectedTab] = React.useState<string>("overview");
  
  const activePlan = clientPlans.find(plan => plan.isActive);
  const hasTrainingPlans = clientPlans.length > 0;
  
  const { latestWeight, weightDifference, weightTrend } = calculateWeightMetrics(client, clientProgressRecords);
  const clientWeightProgressData = prepareClientWeightProgressData(clientProgressRecords);
  
  return (
    <Tabs defaultValue={selectedTab} className="w-full" onValueChange={setSelectedTab}>
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="nutrition">Mi Nutrición</TabsTrigger>
        <TabsTrigger value="progress">Mi Progreso</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab 
          client={client}
          clientProgressRecords={clientProgressRecords}
          clientAchievements={clientAchievements}
          clientPlans={clientPlans}
          latestWeight={latestWeight}
          weightDifference={weightDifference}
          weightTrend={weightTrend}
          clientWeightProgressData={clientWeightProgressData}
        />
      </TabsContent>

      <TabsContent value="nutrition">
        <NutritionTab 
          activePlan={activePlan}
          clientPlans={clientPlans}
          hasTrainingPlans={hasTrainingPlans}
        />
      </TabsContent>

      <TabsContent value="progress">
        <ProgressTab clientProgressRecords={clientProgressRecords} />
      </TabsContent>
    </Tabs>
  );
};

export default PatientDashboard;
