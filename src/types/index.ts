export type UserRole = 'nutritionist' | 'client' | 'trainer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  isActiveMembership?: boolean;
}

export interface Client {
  id: string;
  userId: string;
  profile_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: string;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  dietaryRestrictions: string[];
  nutritionistId?: string;
  trainerId?: string;
  progressRecords: ProgressRecord[];
  achievements: Achievement[];
  createdAt: string;
  updatedAt: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    height: number;
    phone?: string;
    address?: string;
  };
  goals: {
    targetWeight?: number;
    weightGoal: 'lose' | 'maintain' | 'gain';
    dietaryPreferences: string[];
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
    notes?: string;
  };
  medicalHistory: {
    allergies: string[];
    medicalConditions: string[];
    medications: string[];
    notes?: string;
  };
}

export interface MedicalHistory {
  id: string;
  clientId: string;
  condition: string;
  diagnosisDate: string;
  treatment: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Nutritionist {
  id: string;
  userId: string;
  specialty: string;
  experience: number;
  clients: string[]; // Client IDs
}

export interface Trainer {
  id: string;
  userId: string;
  specialty: string;
  experience: number;
  certifications: string[];
  clients: string[]; // Client IDs
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  height: number;
  phone?: string;
  address?: string;
}

export interface Goals {
  targetWeight?: number;
  weightGoal: 'lose' | 'maintain' | 'gain';
  dietaryPreferences: string[];
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  notes?: string;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: number;
  servingUnit: string;
  image_url?: string;
  imageFile?: File;
  description?: string;
  ingredients?: { name: string; amount: string }[];
  preparations?: { step: string }[];
  restrictions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface FoodItem {
  food_id: string;
  quantity?: number;
  unit?: string;
  calories: number;
  food?: {
    food_id: string;
    name?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portion: string;
    image_url?: string;
  };
}

export interface Meal {
  id: string;
  meal_id?: string;
  type: string;
  time?: string;
  foods: FoodItem[];
  instructions?: string;
  notes?: string;
  images?: string[];
}

export interface MealFood {
  foodId: string;
  quantity: number;
}

export interface NutritionPlan {
  id: string;
  clientId: string;
  nutritionistId: string;
  title: string;
  startDate: string;
  endDate?: string;
  dailyPlans: DailyPlan[];
  notes?: string;
  isActive: boolean;
  nutrientGoals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  hydration?: {
    waterLiters: number;
    daily_goal: number;
    reminders: string[];
    notes?: string;
  };
  supplements?: {
    [key: string]: {
      dose: string;
      name?: string;
      time?: string;
    };
  };
  restrictions?: string[];
  preferences?: string[];
  allergies?: string[];
  objectives?: string[];
  additionalNotes?: string;
  description?: string;
}

export interface RecommendedSupplement {
  supplementId: string;
  dosage: string;
  notes?: string;
}

export interface DailyPlan {
  day: number;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface Supplement {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  category?: string;
  instructions?: string;
  benefits?: string[];
}

export interface ProgressRecord {
  id: string;
  clientId: string;
  date: string;
  weight?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  photos?: string[];
  notes?: string;
}

export interface MealLog {
  id: string;
  clientId: string;
  date: string;
  meal: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: {
      foodId: string;
      name: string;
      quantity: number;
      calories: number;
    }[];
    photo?: string;
    notes?: string;
  };
  adherenceToPlan: 'complete' | 'partial' | 'off-plan';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface NutritionFollowUp {
  id: string;
  clientId: string;
  planId: string;
  date: string;
  mood?: 'good' | 'normal' | 'bad';
  completedMeals: {
    mealId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    photo?: string;
    notes?: string;
  }[];
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  client_id: string;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  measurements: {
    weight: number;
    height: number;
    bmi?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    body_fat?: number;
    muscle_mass?: number;
    visceral_fat?: number;
    basal_metabolic_rate?: number;
  };
  notes?: string;
}

export interface TrainingPlan {
  id: string;
  clientId: string;
  trainerId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'draft';
  routines: TrainingRoutine[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingRoutine {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | string;
  exercises: string;
}

export interface ExerciseVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  createdBy: string; // ID del usuario que subió el video
  createdAt: string;
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  muscleGroup: string;
  isPublic: boolean;
}

export interface NutritionSession {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  zoomLink?: string;
  nutritionistId: string;
  maxPatients: number;
  status: 'programada' | 'completada' | 'cancelada';
  patients: string[]; // Array de IDs de pacientes asignados
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}
