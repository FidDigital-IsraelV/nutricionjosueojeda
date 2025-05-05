import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  Client, Nutritionist, Food, Meal, NutritionPlan, 
  ProgressRecord, MealLog, Achievement, NutritionFollowUp, Supplement,
  BodyMeasurement, User, TrainingPlan, TrainingRoutine, ExerciseVideo,
  NutritionSession, Trainer, Profile
} from "../types";
import { 
  clients as mockClients,
  nutritionists as mockNutritionists,
  foods as mockFoods,
  meals as mockMeals,
  nutritionPlans as mockPlans,
  progressRecords as mockRecords,
  mealLogs as mockLogs,
  achievements as mockAchievements,
  nutritionFollowUps as mockFollowUps,
  supplements as mockSupplements,
  bodyMeasurements as mockBodyMeasurements,
  users as mockUsers,
  trainingPlans as mockTrainingPlans,
  trainers as mockTrainers
} from "../data/mockData";
import { useAuth } from "./AuthContext";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

interface DataContextType {
  clients: Client[];
  profiles: Profile[];
  nutritionists: Nutritionist[];
  foods: Food[];
  meals: Meal[];
  nutritionPlans: NutritionPlan[];
  progressRecords: ProgressRecord[];
  mealLogs: MealLog[];
  achievements: Achievement[];
  nutritionFollowUps: NutritionFollowUp[];
  supplements: Supplement[];
  bodyMeasurements: BodyMeasurement[];
  users: User[];
  trainingPlans: TrainingPlan[];
  exerciseVideos: ExerciseVideo[];
  nutritionSessions: NutritionSession[];
  trainers: Trainer[];
  loading: boolean;
  error: string | null;
  
  getClientById: (id: string) => Client | undefined;
  getClientsByNutritionist: (nutritionistId: string) => Client[];
  getClientsByTrainer: (trainerId: string) => Client[];
  getNutritionPlansByClient: (clientId: string) => NutritionPlan[];
  getProgressRecordsByClient: (clientId: string) => ProgressRecord[];
  getMealLogsByClient: (clientId: string) => MealLog[];
  getAchievementsByClient: (clientId: string) => Achievement[];
  getNutritionFollowUpsByClient: (clientId: string) => NutritionFollowUp[];
  getNutritionPlanById: (id: string) => NutritionPlan | undefined;
  
  addProgressRecord: (record: Omit<ProgressRecord, "id">) => void;
  addMealLog: (log: Omit<MealLog, "id">) => void;
  updateClient: (client: Client) => void;
  addNutritionFollowUp: (followUp: Omit<NutritionFollowUp, "id">) => void;
  updateNutritionFollowUp: (followUp: NutritionFollowUp) => void;

  addFood: (food: Omit<Food, "id">) => void;
  updateFood: (food: Food) => void;
  deleteFood: (id: string) => void;
  
  addSupplement: (supplement: Omit<Supplement, "id">) => void;
  updateSupplement: (supplement: Supplement) => void;
  deleteSupplement: (id: string) => void;
  getSupplementById: (id: string) => Supplement | undefined;
  
  addNutritionPlan: (plan: Omit<NutritionPlan, "id">) => void;
  updateNutritionPlan: (plan: NutritionPlan) => void;
  deleteNutritionPlan: (id: string) => void;
  
  addBodyMeasurement: (measurement: Omit<BodyMeasurement, "id" | "createdAt">) => void;
  updateBodyMeasurement: (measurement: BodyMeasurement) => Promise<boolean>;
  deleteBodyMeasurement: (id: string) => Promise<boolean>;
  getBodyMeasurementsByClient: (clientId: string) => Promise<BodyMeasurement[]>;
  getBodyMeasurementById: (id: string) => Promise<BodyMeasurement | null>;
  
  getTrainingPlansByClient: (clientId: string) => TrainingPlan[];
  getTrainingPlanById: (id: string) => TrainingPlan | undefined;
  addTrainingPlan: (plan: Omit<TrainingPlan, "id" | "createdAt" | "updatedAt">) => void;
  updateTrainingPlan: (plan: TrainingPlan) => void;
  deleteTrainingPlan: (id: string) => void;
  
  getExerciseVideos: () => ExerciseVideo[];
  getExerciseVideoById: (id: string) => ExerciseVideo | undefined;
  addExerciseVideo: (video: Omit<ExerciseVideo, "id" | "createdAt">) => void;
  updateExerciseVideo: (video: ExerciseVideo) => void;
  deleteExerciseVideo: (id: string) => void;
  
  getNutritionSessions: () => NutritionSession[];
  getNutritionSessionById: (id: string) => NutritionSession | undefined;
  getNutritionSessionsByNutritionist: (nutritionistId: string) => NutritionSession[];
  getNutritionSessionsByPatient: (patientId: string) => NutritionSession[];
  addNutritionSession: (session: Omit<NutritionSession, "id" | "createdAt" | "updatedAt">) => void;
  updateNutritionSession: (session: NutritionSession) => void;
  deleteNutritionSession: (id: string) => void;
  
  newAchievement: Achievement | null;
  clearNewAchievement: () => void;

  setSupplements: (supplements: Supplement[]) => void;
  refreshClients: () => Promise<void>;
  refreshTrainingPlans: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>(mockNutritionists);
  const [foods, setFoods] = useState<Food[]>([]);
  const [meals, setMeals] = useState<Meal[]>(mockMeals);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>(mockPlans);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>(mockRecords);
  const [mealLogs, setMealLogs] = useState<MealLog[]>(mockLogs);
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [nutritionFollowUps, setNutritionFollowUps] = useState<NutritionFollowUp[]>(mockFollowUps || []);
  const [supplements, setSupplements] = useState<Supplement[]>(mockSupplements || []);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(mockBodyMeasurements || []);
  const [users, setUsers] = useState<User[]>(mockUsers || []);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>(mockTrainingPlans || []);
  const [trainers, setTrainers] = useState<Trainer[]>(mockTrainers || []);
  const [exerciseVideos, setExerciseVideos] = useState<ExerciseVideo[]>([
    {
      id: "video1",
      title: "Sentadillas básicas",
      description: "Ejercicio básico para fortalecer piernas y glúteos",
      videoUrl: "/videos/sentadillas.mp4",
      thumbnailUrl: "/images/thumbnails/sentadillas.jpg",
      createdBy: "user1", // ID de un nutricionista o entrenador
      createdAt: new Date().toISOString(),
      difficulty: "principiante",
      muscleGroup: "Piernas",
      isPublic: true
    },
    {
      id: "video2",
      title: "Flexiones de pecho",
      description: "Ejercicio para fortalecer el pecho y los brazos",
      videoUrl: "/videos/flexiones.mp4",
      thumbnailUrl: "/images/thumbnails/flexiones.jpg",
      createdBy: "user2", // ID de un nutricionista o entrenador
      createdAt: new Date().toISOString(),
      difficulty: "intermedio",
      muscleGroup: "Pecho",
      isPublic: true
    }
  ]);
  const [nutritionSessions, setNutritionSessions] = useState<NutritionSession[]>([
    {
      id: "session1",
      title: "Evaluación nutricional inicial",
      description: "Primera consulta para evaluar estado nutricional y establecer objetivos",
      startDateTime: "2025-04-10T10:00:00",
      endDateTime: "2025-04-10T11:00:00",
      zoomLink: "https://zoom.us/j/123456789",
      nutritionistId: "nutritionist1",
      maxPatients: 1,
      status: "programada",
      patients: ["client1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "session2",
      title: "Taller de alimentación saludable",
      description: "Taller grupal sobre principios de alimentación saludable",
      startDateTime: "2025-04-15T16:00:00",
      endDateTime: "2025-04-15T17:30:00",
      zoomLink: "https://zoom.us/j/987654321",
      nutritionistId: "nutritionist1",
      maxPatients: 10,
      status: "programada",
      patients: ["client1", "client2"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar alimentos desde Supabase
        const { data: foodsData, error: foodsError } = await supabase
          .from('foods')
          .select('*')
          .order('name');

        if (foodsError) throw foodsError;
        setFoods(foodsData || []);

        // Cargar nutricionistas desde Supabase
        const { data: nutritionistsData, error: nutritionistsError } = await supabase
          .from('nutritionists')
          .select('id, profile_id, specialty, experience, created_at, updated_at');

        if (nutritionistsError) {
          console.error('Error al cargar nutricionistas:', nutritionistsError);
          throw nutritionistsError;
        }
        
        console.log('Datos de nutricionistas cargados:', nutritionistsData);
        console.log('Buscando nutricionista con profileId:', currentUser?.id);
        
        // Transformar los datos para que coincidan con la interfaz Nutritionist
        const transformedNutritionists = nutritionistsData?.map(n => ({
          id: n.id,
          userId: n.profile_id,
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          specialty: n.specialty,
          experience: n.experience,
          clients: [],
          createdAt: n.created_at,
          updatedAt: n.updated_at
        })) || [];
        
        const currentNutritionist = transformedNutritionists.find(n => n.userId === currentUser?.id);
        console.log('Nutricionista actual encontrado:', currentNutritionist);
        
        setNutritionists(transformedNutritionists);

        // Cargar sesiones de nutrición desde Supabase
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('nutrition_sessions')
          .select('*')
          .order('start_date_time', { ascending: true });

        if (sessionsError) {
          console.error('Error al cargar sesiones:', sessionsError);
          throw sessionsError;
        }
        
        console.log('Datos de sesiones cargados:', sessionsData);
        console.log('IDs de nutricionistas en las sesiones:', sessionsData?.map(s => s.nutritionist_id));
        
        // Transformar los datos para que coincidan con la interfaz NutritionSession
        const transformedSessions = sessionsData?.map(session => ({
          id: session.id,
          title: session.title,
          description: session.description,
          startDateTime: session.start_date_time,
          endDateTime: session.end_date_time,
          zoomLink: session.zoom_link,
          nutritionistId: session.nutritionist_id,
          maxPatients: session.max_patients,
          status: session.status,
          patients: session.patients || [],
          createdAt: session.created_at,
          updatedAt: session.updated_at
        })) || [];

        console.log('Sesiones transformadas:', transformedSessions);
        console.log('IDs de nutricionistas en sesiones transformadas:', transformedSessions.map(s => s.nutritionistId));
        setNutritionSessions(transformedSessions);

        // Cargar suplementos desde Supabase
        const { data: supplementsData, error: supplementsError } = await supabase
          .from('supplements')
          .select('*')
          .order('name');

        if (supplementsError) throw supplementsError;
        setSupplements(supplementsData || []);

        // Cargar clientes al montar el componente
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*');

        if (clientsError) throw clientsError;

        const formattedClients = clientsData.map(client => ({
          ...client,
          progressRecords: client.progress_records || [],
          achievements: client.achievements || [],
          personalInfo: {
            firstName: client.personal_info?.first_name || '',
            lastName: client.personal_info?.last_name || '',
            birthDate: client.personal_info?.birth_date,
            gender: client.personal_info?.gender,
            height: client.personal_info?.height,
            phone: client.personal_info?.phone,
            address: client.personal_info?.address
          },
          goals: {
            targetWeight: client.goals?.target_weight,
            weightGoal: client.goals?.weight_goal,
            dietaryPreferences: client.goals?.dietary_preferences || [],
            activityLevel: client.goals?.activity_level,
            notes: client.goals?.notes
          },
          medicalHistory: {
            allergies: client.medical_history?.allergies || [],
            medicalConditions: client.medical_history?.medical_conditions || [],
            medications: client.medical_history?.medications || [],
            notes: client.medical_history?.notes
          }
        }));

        setClients(formattedClients);

        // Cargar perfiles al montar el componente
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Error al cargar perfiles:', profilesError);
          throw profilesError;
        }

        console.log('Perfiles cargados:', profilesData);
        setProfiles(profilesData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getClientById = (id: string) => clients.find(c => c.id === id);
  
  const getClientsByNutritionist = (nutritionistId: string) => 
    clients.filter(c => c.nutritionistId === nutritionistId);
  
  const getClientsByTrainer = (trainerId: string) => 
    clients.filter(c => c.trainerId === trainerId);
  
  const getNutritionPlansByClient = (clientId: string) => 
    nutritionPlans.filter(p => p.clientId === clientId);
  
  const getProgressRecordsByClient = (clientId: string) => 
    progressRecords.filter(r => r.clientId === clientId);
  
  const getMealLogsByClient = (clientId: string) => 
    mealLogs.filter(l => l.clientId === clientId);
  
  const getAchievementsByClient = (clientId: string) => 
    achievements.filter(a => a.id.startsWith(clientId));
    
  const getNutritionFollowUpsByClient = (clientId: string) => 
    nutritionFollowUps.filter(f => f.clientId === clientId);

  const addProgressRecord = (record: Omit<ProgressRecord, "id">) => {
    const newRecord = {
      ...record,
      id: `prog${progressRecords.length + 1}`
    };
    setProgressRecords([...progressRecords, newRecord]);
    toast.success("Registro de progreso añadido");
    
    checkProgressAchievements(record.clientId);
  };

  const addMealLog = (log: Omit<MealLog, "id">) => {
    const newLog = {
      ...log,
      id: `log${mealLogs.length + 1}`
    };
    setMealLogs([...mealLogs, newLog]);
    toast.success("Comida registrada correctamente");
    
    checkMealAchievements(log.clientId);
  };

  const updateClient = (client: Client) => {
    setClients(clients.map(c => c.id === client.id ? client : c));
    toast.success("Información del cliente actualizada");
  };
  
  const addFood = (food: Omit<Food, "id">) => {
    const newFood = {
      ...food,
      id: `food-${Date.now()}`
    } as Food;
    
    setFoods([...foods, newFood]);
    toast.success("Comida creada correctamente");
  };
  
  const updateFood = (food: Food) => {
    setFoods(foods.map(f => f.id === food.id ? food : f));
    toast.success("Comida actualizada correctamente");
  };
  
  const deleteFood = (id: string) => {
    setFoods(foods.filter(f => f.id !== id));
    toast.success("Comida eliminada correctamente");
  };
  
  const addNutritionPlan = (plan: Omit<NutritionPlan, "id">) => {
    const newPlan = {
      ...plan,
      id: `plan-${Date.now()}`
    } as NutritionPlan;
    
    setNutritionPlans([...nutritionPlans, newPlan]);
    toast.success("Plan nutricional creado correctamente");
  };
  
  const updateNutritionPlan = (plan: NutritionPlan) => {
    setNutritionPlans(nutritionPlans.map(p => p.id === plan.id ? plan : p));
    toast.success("Plan nutricional actualizado correctamente");
  };
  
  const deleteNutritionPlan = (id: string) => {
    setNutritionPlans(nutritionPlans.filter(p => p.id !== id));
    toast.success("Plan nutricional eliminado correctamente");
  };
  
  const getNutritionPlanById = (id: string) => {
    return nutritionPlans.find(p => p.id === id);
  };
  
  const addSupplement = (supplement: Omit<Supplement, "id">) => {
    const newSupplement = {
      ...supplement,
      id: `suppl-${Date.now()}`
    } as Supplement;
    
    setSupplements([...supplements, newSupplement]);
    toast.success("Suplemento creado correctamente");
  };
  
  const updateSupplement = (supplement: Supplement) => {
    setSupplements(supplements.map(s => s.id === supplement.id ? supplement : s));
    toast.success("Suplemento actualizado correctamente");
  };
  
  const deleteSupplement = (id: string) => {
    setSupplements(supplements.filter(s => s.id !== id));
    toast.success("Suplemento eliminado correctamente");
  };
  
  const getSupplementById = (id: string) => {
    return supplements.find(s => s.id === id);
  };

  const addNutritionFollowUp = (followUp: Omit<NutritionFollowUp, "id">) => {
    const newFollowUp = {
      ...followUp,
      id: `followup-${Date.now()}`
    } as NutritionFollowUp;
    
    setNutritionFollowUps([...nutritionFollowUps, newFollowUp]);
    toast.success("Seguimiento nutricional registrado correctamente");
    
    checkNutritionFollowUpAchievements(followUp.clientId);
  };
  
  const updateNutritionFollowUp = (followUp: NutritionFollowUp) => {
    setNutritionFollowUps(nutritionFollowUps.map(f => f.id === followUp.id ? followUp : f));
    toast.success("Seguimiento nutricional actualizado correctamente");
  };
  
  const checkProgressAchievements = (clientId: string) => {
    const clientRecords = progressRecords.filter(r => r.clientId === clientId);
    
    if (clientRecords.length === 1) {
      createAchievement(
        clientId,
        "¡Primer registro de progreso!",
        "Has registrado tu progreso por primera vez",
        "trophy"
      );
    } else if (clientRecords.length === 5) {
      createAchievement(
        clientId,
        "¡Seguimiento constante!",
        "Has registrado tu progreso 5 veces",
        "star"
      );
    }
  };
  
  const checkMealAchievements = (clientId: string) => {
    const clientLogs = mealLogs.filter(l => l.clientId === clientId);
    
    if (clientLogs.length === 5) {
      createAchievement(
        clientId,
        "¡Consistencia alimenticia!",
        "Has registrado 5 comidas",
        "check"
      );
    } else if (clientLogs.length === 10) {
      createAchievement(
        clientId,
        "¡Maestro nutricional!",
        "Has registrado 10 comidas",
        "award"
      );
    } else if (clientLogs.length === 25) {
      createAchievement(
        clientId,
        "¡Experto en alimentación!",
        "Has registrado 25 comidas",
        "party"
      );
    }
  };
  
  const checkNutritionFollowUpAchievements = (clientId: string) => {
    const clientFollowUps = nutritionFollowUps.filter(f => f.clientId === clientId);
    
    if (clientFollowUps.length === 1) {
      createAchievement(
        clientId,
        "¡Primer seguimiento nutricional!",
        "Has registrado tu primer seguimiento nutricional",
        "award"
      );
    } else if (clientFollowUps.length === 5) {
      createAchievement(
        clientId,
        "¡Compromiso nutricional!",
        "Has registrado 5 seguimientos nutricionales",
        "star"
      );
    } else if (clientFollowUps.length === 10) {
      createAchievement(
        clientId,
        "¡Nutrición perfecta!",
        "Has registrado 10 seguimientos nutricionales",
        "party"
      );
    }
  };

  const addBodyMeasurement = (measurement: Omit<BodyMeasurement, "id" | "createdAt">) => {
    const newMeasurement = {
      ...measurement,
      id: `bm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as BodyMeasurement;
    
    setBodyMeasurements([...bodyMeasurements, newMeasurement]);
    toast.success("Medida corporal registrada correctamente");
  };
  
  const updateBodyMeasurement = async (measurement: BodyMeasurement) => {
    try {
      const { error } = await supabase
        .from('body_measurements')
        .update({
          date: measurement.date,
          measurements: {
            weight: measurement.measurements.weight,
            height: measurement.measurements.height,
            chest: measurement.measurements.chest,
            waist: measurement.measurements.waist,
            hips: measurement.measurements.hips,
            arms: measurement.measurements.arms,
            thighs: measurement.measurements.thighs,
            body_fat: measurement.measurements.body_fat,
            muscle_mass: measurement.measurements.muscle_mass,
            visceral_fat: measurement.measurements.visceral_fat,
            basal_metabolic_rate: measurement.measurements.basal_metabolic_rate
          },
          notes: measurement.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', measurement.id);

      if (error) throw error;

      toast.success('Medida corporal actualizada correctamente');
      return true;
    } catch (err) {
      console.error('Error al actualizar medida corporal:', err);
      toast.error('Error al actualizar la medida corporal');
      return false;
    }
  };
  
  const deleteBodyMeasurement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('body_measurements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Medida corporal eliminada correctamente');
      return true;
    } catch (err) {
      console.error('Error al eliminar medida corporal:', err);
      toast.error('Error al eliminar la medida corporal');
      return false;
    }
  };
  
  const getBodyMeasurementsByClient = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error al obtener medidas corporales:', err);
      toast.error('Error al cargar las medidas corporales');
      return [];
    }
  };
  
  const getBodyMeasurementById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data || null;
    } catch (err) {
      console.error('Error al obtener medida corporal:', err);
      toast.error('Error al cargar la medida corporal');
      return null;
    }
  };
    
  const getTrainingPlansByClient = (clientId: string) => 
    trainingPlans.filter(p => p.clientId === clientId);
  
  const getTrainingPlanById = (id: string) => 
    trainingPlans.find(p => p.id === id);
  
  const addTrainingPlan = async (plan: Omit<TrainingPlan, "id" | "createdAt" | "updatedAt">) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('training_plans')
        .insert({
          client_id: plan.clientId,
          title: plan.title,
          description: plan.description,
          routines: plan.routines,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar la lista de planes
      await refreshTrainingPlans();
      toast.success("Plan de entrenamiento creado correctamente");
    } catch (err) {
      console.error('Error al crear plan de entrenamiento:', err);
      toast.error('Error al crear el plan de entrenamiento');
    }
  };
  
  const updateTrainingPlan = (plan: TrainingPlan) => {
    const updatedPlan = {
      ...plan,
      updatedAt: new Date().toISOString()
    };
    setTrainingPlans(trainingPlans.map(p => p.id === plan.id ? updatedPlan : p));
    toast.success("Plan de entrenamiento actualizado correctamente");
  };
  
  const deleteTrainingPlan = (id: string) => {
    setTrainingPlans(trainingPlans.filter(p => p.id !== id));
    toast.success("Plan de entrenamiento eliminado correctamente");
  };

  const getExerciseVideos = () => exerciseVideos.filter(v => v.isPublic);
  
  const getExerciseVideoById = (id: string) => 
    exerciseVideos.find(v => v.id === id);
  
  const addExerciseVideo = (video: Omit<ExerciseVideo, "id" | "createdAt">) => {
    const newVideo = {
      ...video,
      id: `video-${Date.now()}`,
      createdAt: new Date().toISOString()
    } as ExerciseVideo;
    
    setExerciseVideos([...exerciseVideos, newVideo]);
    toast.success("Video de ejercicio añadido correctamente");
  };
  
  const updateExerciseVideo = (video: ExerciseVideo) => {
    setExerciseVideos(exerciseVideos.map(v => v.id === video.id ? video : v));
    toast.success("Video de ejercicio actualizado correctamente");
  };
  
  const deleteExerciseVideo = (id: string) => {
    setExerciseVideos(exerciseVideos.filter(v => v.id !== id));
    toast.success("Video de ejercicio eliminado correctamente");
  };

  const getNutritionSessions = () => nutritionSessions;
  
  const getNutritionSessionById = (id: string) => 
    nutritionSessions.find(session => session.id === id);
  
  const getNutritionSessionsByNutritionist = (nutritionistId: string) => {
    console.log('Filtrando sesiones por nutricionista (ID):', nutritionistId);
    console.log('Todas las sesiones disponibles:', nutritionSessions);
    
    const filteredSessions = nutritionSessions.filter(session => {
      console.log(`Comparando: session.nutritionistId (${session.nutritionistId}) === nutritionistId (${nutritionistId})`);
      return session.nutritionistId === nutritionistId;
    });
    
    console.log('Sesiones encontradas:', filteredSessions);
    return filteredSessions;
  };
  
  const getNutritionSessionsByPatient = (patientId: string) => {
    console.log('Filtrando sesiones por paciente:', patientId);
    const filteredSessions = nutritionSessions.filter(session => session.patients.includes(patientId));
    console.log('Sesiones encontradas:', filteredSessions);
    return filteredSessions;
  };
  
  const addNutritionSession = (session: Omit<NutritionSession, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newSession = {
      ...session,
      id: `session-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    } as NutritionSession;
    
    setNutritionSessions([...nutritionSessions, newSession]);
    toast.success("Sesión de nutrición creada correctamente");
  };
  
  const updateNutritionSession = (session: NutritionSession) => {
    const updatedSession = {
      ...session,
      updatedAt: new Date().toISOString()
    };
    setNutritionSessions(nutritionSessions.map(s => s.id === session.id ? updatedSession : s));
    toast.success("Sesión de nutrición actualizada correctamente");
  };
  
  const deleteNutritionSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_sessions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar la sesión:', error);
        throw error;
      }

      // Actualizar el estado local usando el estado anterior
      setNutritionSessions(prevSessions => prevSessions.filter(session => session.id !== id));
      toast.success("Sesión eliminada correctamente");
    } catch (err) {
      console.error('Error al eliminar la sesión:', err);
      toast.error("Error al eliminar la sesión");
    }
  };

  const createAchievement = (clientId: string, title: string, description: string, icon: string) => {
    const newAchievement: Achievement = {
      id: `${clientId}_ach_${achievements.length + 1}`,
      title,
      description,
      icon,
      dateEarned: new Date().toISOString()
    };
    
    setAchievements([...achievements, newAchievement]);
    setNewAchievement(newAchievement);
    
    return newAchievement;
  };

  const clearNewAchievement = () => {
    setNewAchievement(null);
  };

  const refreshClients = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      const formattedClients = clientsData.map(client => ({
        ...client,
        progressRecords: client.progress_records || [],
        achievements: client.achievements || [],
        personalInfo: {
          firstName: client.personal_info?.first_name || '',
          lastName: client.personal_info?.last_name || '',
          birthDate: client.personal_info?.birth_date,
          gender: client.personal_info?.gender,
          height: client.personal_info?.height,
          phone: client.personal_info?.phone,
          address: client.personal_info?.address
        },
        goals: {
          targetWeight: client.goals?.target_weight,
          weightGoal: client.goals?.weight_goal,
          dietaryPreferences: client.goals?.dietary_preferences || [],
          activityLevel: client.goals?.activity_level,
          notes: client.goals?.notes
        },
        medicalHistory: {
          allergies: client.medical_history?.allergies || [],
          medicalConditions: client.medical_history?.medical_conditions || [],
          medications: client.medical_history?.medications || [],
          notes: client.medical_history?.notes
        }
      }));

      setClients(formattedClients);
    } catch (err) {
      console.error('Error al actualizar clientes:', err);
      toast.error('Error al actualizar la lista de clientes');
    }
  };

  const refreshTrainingPlans = async () => {
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('training_plans')
        .select('*');

      if (plansError) throw plansError;

      const formattedPlans = plansData.map(plan => ({
        ...plan,
        routines: plan.routines || [],
        createdAt: plan.created_at,
        updatedAt: plan.updated_at
      }));

      setTrainingPlans(formattedPlans);
    } catch (err) {
      console.error('Error al actualizar planes de entrenamiento:', err);
      toast.error('Error al actualizar la lista de planes de entrenamiento');
    }
  };

  const value = {
    clients,
    profiles,
    nutritionists,
    foods,
    meals,
    nutritionPlans,
    progressRecords,
    mealLogs,
    achievements,
    nutritionFollowUps,
    supplements,
    bodyMeasurements,
    users,
    trainingPlans,
    exerciseVideos,
    nutritionSessions,
    trainers,
    loading,
    error,
    
    getClientById,
    getClientsByNutritionist,
    getClientsByTrainer,
    getNutritionPlansByClient,
    getProgressRecordsByClient,
    getMealLogsByClient,
    getAchievementsByClient,
    getNutritionFollowUpsByClient,
    
    addProgressRecord,
    addMealLog,
    updateClient,
    addNutritionFollowUp,
    updateNutritionFollowUp,
    
    addFood,
    updateFood,
    deleteFood,
    
    addSupplement,
    updateSupplement,
    deleteSupplement,
    getSupplementById,
    
    addNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan,
    getNutritionPlanById,
    
    addBodyMeasurement,
    updateBodyMeasurement,
    deleteBodyMeasurement,
    getBodyMeasurementsByClient,
    getBodyMeasurementById,
    
    getTrainingPlansByClient,
    getTrainingPlanById,
    addTrainingPlan,
    updateTrainingPlan,
    deleteTrainingPlan,
    
    getExerciseVideos,
    getExerciseVideoById,
    addExerciseVideo,
    updateExerciseVideo,
    deleteExerciseVideo,
    
    getNutritionSessions,
    getNutritionSessionById,
    getNutritionSessionsByNutritionist,
    getNutritionSessionsByPatient,
    addNutritionSession,
    updateNutritionSession,
    deleteNutritionSession,
    
    newAchievement,
    clearNewAchievement,

    setSupplements,
    refreshClients,
    refreshTrainingPlans
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
