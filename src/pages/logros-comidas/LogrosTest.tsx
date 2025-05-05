
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import AchievementCelebration from "@/components/achievements/AchievementCelebration";
import AchievementCard from "@/components/dashboard/AchievementCard";
import { Achievement } from "@/types";
import { toast } from "@/lib/toast";
import { Award, Trophy, Star, CheckCircle, PartyPopper, Medal, Target, Zap, Flame, Heart, Salad, Apple, Utensils } from "lucide-react";

const LogrosTest = () => {
  const { currentUser } = useAuth();
  const { achievements } = useData();
  const [testAchievement, setTestAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const clientId = currentUser?.role === 'client' ? currentUser.id : 'client1';

  const testAchievements = [
    // Logros de inicio y primeros pasos
    {
      id: `${clientId}_ach_test1`,
      title: "¡Primer registro de progreso!",
      description: "Has registrado tu progreso por primera vez",
      icon: "trophy",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test2`,
      title: "¡Bienvenido al cambio!",
      description: "Has completado tu perfil nutricional",
      icon: "award",
      dateEarned: new Date().toISOString()
    },
    
    // Logros de alimentación
    {
      id: `${clientId}_ach_test3`,
      title: "¡Primera comida registrada!",
      description: "Has registrado tu primera comida en el sistema",
      icon: "check",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test4`,
      title: "¡Consistencia alimenticia!",
      description: "Has registrado 5 comidas",
      icon: "check",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test5`,
      title: "¡Maestro nutricional!",
      description: "Has registrado 10 comidas",
      icon: "award",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test6`,
      title: "¡Experto en alimentación!",
      description: "Has registrado 25 comidas",
      icon: "party",
      dateEarned: new Date().toISOString()
    },
    
    // Logros de seguimiento
    {
      id: `${clientId}_ach_test7`,
      title: "¡Primer seguimiento nutricional!",
      description: "Has registrado tu primer seguimiento nutricional",
      icon: "star",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test8`,
      title: "¡Compromiso nutricional!",
      description: "Has registrado 5 seguimientos nutricionales",
      icon: "star",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test9`,
      title: "¡Nutrición perfecta!",
      description: "Has registrado 10 seguimientos nutricionales",
      icon: "trophy",
      dateEarned: new Date().toISOString()
    },
    
    // Logros de progreso
    {
      id: `${clientId}_ach_test10`,
      title: "¡Primera semana completada!",
      description: "Has seguido tu plan durante una semana completa",
      icon: "medal",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test11`,
      title: "¡Primer mes completado!",
      description: "Has completado un mes de seguimiento continuo",
      icon: "medal",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test12`,
      title: "¡Primera meta alcanzada!",
      description: "Has alcanzado tu primera meta nutricional",
      icon: "target",
      dateEarned: new Date().toISOString()
    },
    
    // Logros de ejercicio
    {
      id: `${clientId}_ach_test13`,
      title: "¡Entrenamiento inicial!",
      description: "Has completado tu primera sesión de ejercicio",
      icon: "zap",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test14`,
      title: "¡Entrenamiento constante!",
      description: "Has completado 10 sesiones de ejercicio",
      icon: "flame",
      dateEarned: new Date().toISOString()
    },
    
    // Logros de hidratación
    {
      id: `${clientId}_ach_test15`,
      title: "¡Hidratación consciente!",
      description: "Has registrado tu consumo de agua por 7 días consecutivos",
      icon: "droplet",
      dateEarned: new Date().toISOString()
    },
    
    // Logros especiales
    {
      id: `${clientId}_ach_test16`,
      title: "¡Cocinero saludable!",
      description: "Has preparado 5 recetas saludables",
      icon: "utensils",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test17`,
      title: "¡Equilibrio perfecto!",
      description: "Has mantenido una dieta equilibrada por 2 semanas",
      icon: "salad",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test18`,
      title: "¡Superación personal!",
      description: "Has superado un obstáculo en tu plan nutricional",
      icon: "heart",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test19`,
      title: "¡Frutas y verduras!",
      description: "Has consumido las porciones recomendadas por 10 días",
      icon: "apple",
      dateEarned: new Date().toISOString()
    },
    {
      id: `${clientId}_ach_test20`,
      title: "¡Nutrición experta!",
      description: "Has completado 3 meses de seguimiento nutricional",
      icon: "trophy",
      dateEarned: new Date().toISOString()
    }
  ];

  const handleShowAchievement = (achievement: Achievement) => {
    setTestAchievement(achievement);
    setShowCelebration(true);
    toast.success("¡Nuevo logro desbloqueado!");
  };

  // Función para renderizar el icono según el tipo
  const renderIconPreview = (iconType: string) => {
    switch (iconType) {
      case "trophy":
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case "star":
        return <Star className="h-8 w-8 text-yellow-500" />;
      case "check":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "party":
        return <PartyPopper className="h-8 w-8 text-purple-500" />;
      case "medal":
        return <Medal className="h-8 w-8 text-amber-500" />;
      case "target":
        return <Target className="h-8 w-8 text-red-500" />;
      case "zap":
        return <Zap className="h-8 w-8 text-blue-500" />;
      case "flame":
        return <Flame className="h-8 w-8 text-orange-500" />;
      case "droplet":
        return <Zap className="h-8 w-8 text-cyan-500" />;
      case "utensils":
        return <Utensils className="h-8 w-8 text-indigo-500" />;
      case "salad":
        return <Salad className="h-8 w-8 text-emerald-500" />;
      case "heart":
        return <Heart className="h-8 w-8 text-pink-500" />;
      case "apple":
        return <Apple className="h-8 w-8 text-red-500" />;
      default:
        return <Award className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">Prueba de Logros</h1>
        <p className="text-muted-foreground mb-6">
          En esta página puedes probar cómo se ven los diferentes logros y sus celebraciones asociadas.
          Haz clic en cualquier botón para simular la obtención de un logro.
        </p>

        <Separator className="my-6" />

        <h2 className="text-2xl font-semibold mb-4">Prueba de Celebraciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {testAchievements.slice(0, 9).map((achievement) => (
            <Card key={achievement.id} className="hover:shadow-md transition-shadow duration-200 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <div className="bg-slate-100 p-2 rounded-full">
                    {renderIconPreview(achievement.icon)}
                  </div>
                </div>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Al hacer clic, se mostrará una animación de celebración para este logro.</p>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleShowAchievement(achievement)}
                  className="w-full"
                  variant="outline"
                >
                  Probar este logro
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {testAchievements.slice(9, 18).map((achievement) => (
            <Card key={achievement.id} className="hover:shadow-md transition-shadow duration-200 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <div className="bg-slate-100 p-2 rounded-full">
                    {renderIconPreview(achievement.icon)}
                  </div>
                </div>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Al hacer clic, se mostrará una animación de celebración para este logro.</p>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleShowAchievement(achievement)}
                  className="w-full"
                  variant="outline"
                >
                  Probar este logro
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {testAchievements.slice(18).map((achievement) => (
            <Card key={achievement.id} className="hover:shadow-md transition-shadow duration-200 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <div className="bg-slate-100 p-2 rounded-full">
                    {renderIconPreview(achievement.icon)}
                  </div>
                </div>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Al hacer clic, se mostrará una animación de celebración para este logro.</p>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleShowAchievement(achievement)}
                  className="w-full"
                  variant="outline"
                >
                  Probar este logro
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Separator className="my-6" />

        <h2 className="text-2xl font-semibold mb-4">Vista previa de tarjetas de logros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testAchievements.slice(0, 6).map((achievement, index) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              isNew={index === 0}
            />
          ))}
        </div>
      </div>

      {testAchievement && (
        <AchievementCelebration
          achievement={testAchievement}
          open={showCelebration}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </Container>
  );
};

export default LogrosTest;
