import { 
  User, Client, Nutritionist, Food, Meal, NutritionPlan, 
  ProgressRecord, MealLog, Achievement, NutritionFollowUp, Supplement,
  BodyMeasurement, TrainingPlan, TrainingRoutine, Trainer
} from "../types";

// Mock Users
export const users: User[] = [
  {
    id: "user1",
    email: "juan@nutriapp.com",
    name: "Dr. Juan Pérez",
    role: "nutritionist",
    avatar: "/placeholder.svg"
  },
  {
    id: "user2",
    email: "maria@example.com",
    name: "María García",
    role: "client",
    avatar: "/placeholder.svg"
  },
  {
    id: "user3",
    email: "carlos@example.com",
    name: "Carlos Rodríguez",
    role: "client",
    avatar: "/placeholder.svg"
  }
];

// Mock Nutritionists
export const nutritionists: Nutritionist[] = [
  {
    id: "nutr1",
    userId: "user1",
    specialty: "Sports Nutrition",
    experience: 8,
    clients: ["client1", "client2"]
  }
];

// Add mock trainers
export const trainers: Trainer[] = [
  {
    id: "trainer1",
    userId: "user1",
    specialty: "Functional Training",
    experience: 6,
    certifications: ["NSCA-CPT", "ACE Personal Trainer"],
    clients: ["client1", "client2"]
  }
];

// Mock Clients
export const clients: Client[] = [
  {
    id: "client1",
    userId: "user2",
    name: "María García",
    email: "maria@example.com",
    phone: "123-456-7890",
    address: "Calle Principal 123",
    birthDate: "1990-05-15",
    gender: "female",
    height: 165,
    weight: 68,
    activityLevel: "moderate",
    medicalConditions: ["Ninguna"],
    allergies: ["Lactosa"],
    medications: ["Ninguna"],
    dietaryRestrictions: ["Vegetariana"],
    nutritionistId: "nutr1",
    trainerId: "trainer1",
    progressRecords: [],
    achievements: [],
    createdAt: "2023-04-01",
    updatedAt: "2023-04-01",
    personalInfo: {
      firstName: "María",
      lastName: "García",
      birthDate: "1990-05-15",
      gender: "female",
      height: 165,
      phone: "123-456-7890",
      address: "Calle Principal 123"
    },
    medicalHistory: {
      allergies: ["Lactosa"],
      medicalConditions: ["Ninguna"],
      medications: ["Ninguna"],
      notes: "Sin condiciones médicas importantes"
    },
    goals: {
      targetWeight: 60,
      weightGoal: "lose",
      dietaryPreferences: ["Vegetariana"],
      activityLevel: "moderate",
      notes: "Quiero perder 5kg en 3 meses"
    }
  },
  {
    id: "client2",
    userId: "user3",
    name: "Carlos Rodríguez",
    email: "carlos@example.com",
    phone: "987-654-3210",
    address: "Avenida Segunda 456",
    birthDate: "1985-08-20",
    gender: "male",
    height: 180,
    weight: 80,
    activityLevel: "active",
    medicalConditions: ["Hipertensión"],
    allergies: ["Nueces"],
    medications: ["Lisinopril"],
    dietaryRestrictions: ["Alta en proteína"],
    nutritionistId: "nutr1",
    trainerId: "trainer1",
    progressRecords: [],
    achievements: [],
    createdAt: "2023-04-01",
    updatedAt: "2023-04-01",
    personalInfo: {
      firstName: "Carlos",
      lastName: "Rodríguez",
      birthDate: "1985-08-20",
      gender: "male",
      height: 180,
      phone: "987-654-3210",
      address: "Avenida Segunda 456"
    },
    medicalHistory: {
      allergies: ["Nueces"],
      medicalConditions: ["Hipertensión"],
      medications: ["Lisinopril"],
      notes: "Control de presión arterial"
    },
    goals: {
      targetWeight: 75,
      weightGoal: "maintain",
      dietaryPreferences: ["Alta en proteína"],
      activityLevel: "active",
      notes: "Quiero mantener mi peso y aumentar masa muscular"
    }
  }
];

// Mock Foods
export const foods: Food[] = [
  {
    id: "food1",
    name: "Pollo a la parrilla",
    category: "Proteína",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: 100,
    servingUnit: "g",
    image: "/placeholder.svg"
  },
  {
    id: "food2",
    name: "Arroz integral",
    category: "Carbohidratos",
    calories: 112,
    protein: 2.6,
    carbs: 23.5,
    fat: 0.9,
    fiber: 1.8,
    servingSize: 100,
    servingUnit: "g",
    image: "/placeholder.svg"
  },
  {
    id: "food3",
    name: "Aguacate",
    category: "Grasa saludable",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    servingSize: 100,
    servingUnit: "g",
    image: "/placeholder.svg"
  },
  {
    id: "food4",
    name: "Espinacas",
    category: "Vegetales",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    servingSize: 100,
    servingUnit: "g",
    image: "/placeholder.svg"
  },
  {
    id: "food5",
    name: "Yogur griego",
    category: "Lácteos",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    sugar: 3.2,
    servingSize: 100,
    servingUnit: "g",
    image: "/placeholder.svg"
  }
];

// Mock Supplements
export const supplements: Supplement[] = [
  {
    id: "suppl1",
    name: "Proteína Whey",
    description: "Suplemento de proteína de suero de leche para recuperación muscular",
    category: "Proteína",
    instructions: "Mezclar con agua o leche y consumir inmediatamente después del ejercicio",
    benefits: ["Recuperación muscular", "Aumento de masa muscular", "Saciedad"],
    image: "/placeholder.svg"
  },
  {
    id: "suppl2",
    name: "Creatina Monohidrato",
    description: "Suplemento para mejorar el rendimiento físico y la ganancia de fuerza",
    category: "Rendimiento",
    instructions: "Tomar 5g diarios con abundante agua, preferiblemente después del entrenamiento",
    benefits: ["Aumento de fuerza", "Mejora del rendimiento", "Recuperación"],
    image: "/placeholder.svg"
  },
  {
    id: "suppl3",
    name: "Omega 3",
    description: "Ácidos grasos esenciales para la salud cardiovascular y función cerebral",
    category: "Salud",
    instructions: "Tomar con las comidas para mejor absorción",
    benefits: ["Salud cardiovascular", "Función cerebral", "Reducción de inflamación"],
    image: "/placeholder.svg"
  },
  {
    id: "multivitaminico",
    name: "Multivitamínico",
    description: "Complejo vitamínico y mineral para complementar la dieta",
    category: "Salud",
    instructions: "Tomar una cápsula al día con las comidas",
    benefits: ["Salud general", "Sistema inmunológico", "Energía"],
    image: "/placeholder.svg"
  }
];

// Mock Meals
export const meals: Meal[] = [
  {
    id: "meal1",
    name: "Desayuno proteico",
    type: "breakfast",
    foods: [
      { foodId: "food5", quantity: 200 }
    ],
    instructions: "Servir el yogur griego con frutas frescas",
    image: "/placeholder.svg"
  },
  {
    id: "meal2",
    name: "Almuerzo saludable",
    type: "lunch",
    foods: [
      { foodId: "food1", quantity: 150 },
      { foodId: "food2", quantity: 100 },
      { foodId: "food4", quantity: 50 }
    ],
    instructions: "Cocinar el pollo a la parrilla y servir con el arroz y las espinacas",
    image: "/placeholder.svg"
  },
  {
    id: "meal3",
    name: "Cena ligera",
    type: "dinner",
    foods: [
      { foodId: "food1", quantity: 100 },
      { foodId: "food3", quantity: 50 },
      { foodId: "food4", quantity: 100 }
    ],
    instructions: "Preparar una ensalada con pollo, aguacate y espinacas",
    image: "/placeholder.svg"
  }
];

// Mock Nutrition Plans
export const nutritionPlans: NutritionPlan[] = [
  {
    id: "plan1",
    clientId: "client1",
    nutritionistId: "nutr1",
    title: "Plan para perder peso - María",
    startDate: "2023-04-01",
    dailyPlans: [
      {
        day: 1,
        meals: [meals[0], meals[1], meals[2]],
        totalCalories: 1200,
        totalProtein: 75,
        totalCarbs: 100,
        totalFat: 45
      }
    ],
    notes: "Plan personalizado para María. Ajustar según resultados semanales.",
    isActive: true
  },
  {
    id: "plan2",
    clientId: "client2",
    nutritionistId: "nutr1",
    title: "Plan para mantenimiento - Carlos",
    startDate: "2023-04-01",
    dailyPlans: [
      {
        day: 1,
        meals: [meals[0], meals[1], meals[2]],
        totalCalories: 2200,
        totalProtein: 130,
        totalCarbs: 220,
        totalFat: 73
      }
    ],
    notes: "Plan personalizado para Carlos enfocado en mantenimiento y ganancia muscular.",
    isActive: true
  }
];

// Mock Progress Records
export const progressRecords: ProgressRecord[] = [
  {
    id: "prog1",
    clientId: "client1",
    date: "2023-04-07",
    weight: 68,
    measurements: {
      waist: 80,
      hips: 95
    },
    notes: "Primera semana completada. Me siento con más energía."
  },
  {
    id: "prog2",
    clientId: "client1",
    date: "2023-04-14",
    weight: 67.2,
    measurements: {
      waist: 79,
      hips: 94.5
    },
    notes: "Segunda semana completada. He notado cambios leves."
  }
];

// Mock Meal Logs
export const mealLogs: MealLog[] = [
  {
    id: "log1",
    clientId: "client1",
    date: "2023-04-01",
    meal: {
      type: "breakfast",
      foods: [
        { foodId: "food5", name: "Yogur griego", quantity: 200, calories: 118 }
      ],
      notes: "Me gustó mucho el desayuno"
    },
    adherenceToPlan: "complete"
  },
  {
    id: "log2",
    clientId: "client1",
    date: "2023-04-01",
    meal: {
      type: "lunch",
      foods: [
        { foodId: "food1", name: "Pollo a la parrilla", quantity: 150, calories: 247.5 },
        { foodId: "food2", name: "Arroz integral", quantity: 100, calories: 112 },
        { foodId: "food4", name: "Espinacas", quantity: 50, calories: 11.5 }
      ],
      notes: "Almuerzo muy completo"
    },
    adherenceToPlan: "complete"
  }
];

// Mock Achievements
export const achievements: Achievement[] = [
  {
    id: "ach1",
    title: "¡Primer día completado!",
    description: "Has completado tu primer día siguiendo el plan nutricional",
    icon: "trophy",
    dateEarned: "2023-04-01"
  },
  {
    id: "ach2",
    title: "Semana consistente",
    description: "Has seguido tu plan durante una semana completa",
    icon: "award",
    dateEarned: "2023-04-07"
  }
];

// Mock Nutrition Follow Ups
export const nutritionFollowUps: NutritionFollowUp[] = [
  {
    id: "followup1",
    clientId: "client1",
    planId: "plan1",
    date: "2023-04-02",
    mood: "good",
    completedMeals: [
      {
        mealId: "meal1",
        mealType: "breakfast",
        photo: "/placeholder.svg",
        notes: "Me gustó mucho el desayuno"
      },
      {
        mealId: "meal2",
        mealType: "lunch",
        photo: "/placeholder.svg",
        notes: "Almuerzo muy completo"
      }
    ],
    notes: "Primer día del plan, me siento con energía"
  },
  {
    id: "followup2",
    clientId: "client1",
    planId: "plan1",
    date: "2023-04-03",
    mood: "normal",
    completedMeals: [
      {
        mealId: "meal1",
        mealType: "breakfast",
        photo: "/placeholder.svg",
        notes: "Desayuno a tiempo"
      },
      {
        mealId: "meal3",
        mealType: "dinner",
        photo: "/placeholder.svg",
        notes: "Cena ligera"
      }
    ],
    notes: "Segundo día, me saltée el almuerzo por una reunión"
  }
];

// Mock Body Measurements
export const bodyMeasurements: BodyMeasurement[] = [
  {
    id: "bm1",
    clientId: "client1",
    date: "2023-04-01",
    createdBy: "user1",
    createdAt: "2023-04-01",
    weight: 68,
    height: 165,
    bmi: 25.0,
    chest: 90,
    waist: 80,
    hip: 95,
    leftArm: 28,
    rightArm: 28.5,
    leftThigh: 56,
    rightThigh: 55.5,
    leftCalf: 38,
    rightCalf: 38,
    bodyFatPercentage: 28,
    muscleMassPercentage: 32,
    visceralFat: 7,
    basalMetabolicRate: 1450,
    notes: "Primera medición, estado inicial"
  },
  {
    id: "bm2",
    clientId: "client1",
    date: "2023-04-15",
    createdBy: "user1",
    createdAt: "2023-04-15",
    weight: 67,
    height: 165,
    bmi: 24.6,
    chest: 89,
    waist: 79,
    hip: 94.5,
    leftArm: 28.2,
    rightArm: 28.6,
    leftThigh: 55.8,
    rightThigh: 55.3,
    leftCalf: 38,
    rightCalf: 38,
    bodyFatPercentage: 27.5,
    muscleMassPercentage: 32.3,
    visceralFat: 6.8,
    basalMetabolicRate: 1455,
    notes: "Progreso tras dos semanas de dieta y ejercicio"
  },
  {
    id: "bm3",
    clientId: "client2",
    date: "2023-04-01",
    createdBy: "user1",
    createdAt: "2023-04-01",
    weight: 80,
    height: 180,
    bmi: 24.7,
    chest: 100,
    waist: 85,
    hip: 95,
    leftArm: 35,
    rightArm: 35.5,
    leftThigh: 60,
    rightThigh: 60.5,
    leftCalf: 42,
    rightCalf: 42,
    bodyFatPercentage: 18,
    muscleMassPercentage: 42,
    visceralFat: 6,
    basalMetabolicRate: 1900,
    notes: "Primera medición, estado inicial"
  }
];

// Mock Current User (simulated authentication)
export const currentUser: User = users[0];

// Actualizar el archivo de datos mock para incluir planes de entrenamiento
// Añadir al final del archivo:

export const trainingPlans: TrainingPlan[] = [
  {
    id: "tp-1",
    clientId: "client1",
    trainerId: "trainer1",
    title: "Plan de fuerza y resistencia",
    description: "Plan enfocado en desarrollar fuerza y resistencia muscular para principiantes",
    startDate: "2023-11-01T00:00:00.000Z",
    endDate: "2023-12-31T00:00:00.000Z",
    status: "active",
    routines: [
      {
        id: "tr-1",
        day: "monday",
        exercises: "- Sentadillas: 3 series x 12 repeticiones\n- Press de banca: 3 series x 10 repeticiones\n- Peso muerto: 3 series x 8 repeticiones\n- Plancha: 3 series x 30 segundos",
      },
      {
        id: "tr-2",
        day: "wednesday",
        exercises: "- Dominadas: 3 series x máximas repeticiones\n- Fondos: 3 series x 12 repeticiones\n- Remo con mancuernas: 3 series x 12 repeticiones\n- Curl de bíceps: 3 series x 12 repeticiones",
      },
      {
        id: "tr-3",
        day: "friday",
        exercises: "- Press militar: 3 series x 10 repeticiones\n- Zancadas: 3 series x 12 repeticiones por pierna\n- Extensiones de tríceps: 3 series x 12 repeticiones\n- Abdominales: 3 series x 15 repeticiones",
      }
    ],
    createdAt: "2023-10-25T10:00:00.000Z",
    updatedAt: "2023-10-25T10:00:00.000Z"
  },
  {
    id: "tp-2",
    clientId: "client2",
    trainerId: "trainer1",
    title: "Plan de pérdida de peso",
    description: "Plan enfocado en ejercicios cardiovasculares y de alta intensidad para pérdida de grasa",
    startDate: "2023-11-15T00:00:00.000Z",
    endDate: null,
    status: "active",
    routines: [
      {
        id: "tr-4",
        day: "tuesday",
        exercises: "- Carrera continua: 30 minutos\n- Burpees: 5 series x 10 repeticiones\n- Saltos al cajón: 4 series x 12 repeticiones\n- Mountain climbers: 3 series x 30 segundos",
      },
      {
        id: "tr-5",
        day: "thursday",
        exercises: "- HIIT en cinta: 20 minutos (30s sprint / 90s caminar)\n- Sentadillas con salto: 4 series x 15 repeticiones\n- Flexiones: 4 series x máximas repeticiones\n- Plancha lateral: 3 series x 30 segundos por lado",
      },
      {
        id: "tr-6",
        day: "saturday",
        exercises: "- Circuito completo:\n  * Jumping jacks: 45 segundos\n  * Descanso: 15 segundos\n  * Sentadillas: 45 segundos\n  * Descanso: 15 segundos\n  * Flexiones: 45 segundos\n  * Descanso: 15 segundos\n  * Abdominales: 45 segundos\n  * Descanso: 15 segundos\n- Repetir 4 veces",
      }
    ],
    createdAt: "2023-11-10T14:30:00.000Z",
    updatedAt: "2023-11-10T14:30:00.000Z"
  }
];
