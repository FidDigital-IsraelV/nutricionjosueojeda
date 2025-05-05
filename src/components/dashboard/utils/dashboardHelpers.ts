
import { Client, ProgressRecord } from "@/types";

export const calculateWeightMetrics = (client: Client, clientProgressRecords: ProgressRecord[]) => {
  const latestWeight = clientProgressRecords.length > 0 
    ? clientProgressRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight
    : client?.goals.targetWeight || 0;
    
  const weightDifference = clientProgressRecords.length > 1
    ? latestWeight - clientProgressRecords[clientProgressRecords.length - 2].weight!
    : 0;
  
  const weightTrend: "up" | "down" | "neutral" = weightDifference === 0 
    ? "neutral" 
    : client?.goals.weightGoal === "lose" 
      ? weightDifference < 0 ? "up" : "down"
      : client?.goals.weightGoal === "gain"
        ? weightDifference > 0 ? "up" : "down"
        : "neutral";

  return { latestWeight, weightDifference, weightTrend };
};

export const prepareClientWeightProgressData = (clientProgressRecords: ProgressRecord[]) => {
  if (!clientProgressRecords.length) return [];
  
  return clientProgressRecords
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      weight: record.weight
    }));
};
