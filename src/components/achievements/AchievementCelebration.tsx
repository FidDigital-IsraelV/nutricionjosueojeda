
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Achievement } from "@/types";
import { 
  Award, 
  Trophy, 
  Star, 
  BadgeCheck, 
  PartyPopper, 
  Sparkles, 
  Medal,
  Target,
  Zap,
  Flame,
  Heart,
  Salad,
  Apple,
  Utensils,
  Droplet,
  Cherry, 
  Pizza,
  Cookie,
  Sandwich,
  IceCreamBowl,
  Fish,
  LeafyGreen
} from "lucide-react";
import confetti from "canvas-confetti";

interface AchievementCelebrationProps {
  achievement: Achievement;
  open: boolean;
  onClose: () => void;
}

const AchievementCelebration = ({ achievement, open, onClose }: AchievementCelebrationProps) => {
  // Trigger confetti when the modal opens
  React.useEffect(() => {
    if (open) {
      // Iniciar múltiples efectos de confeti para una celebración más explosiva
      triggerConfetti();
      
      // Agregar efectos secundarios con un pequeño retraso
      setTimeout(() => {
        triggerFireworks();
      }, 300);
      
      // Efecto final después de un segundo
      setTimeout(() => {
        triggerConfettiCannon();
      }, 700);
    }
  }, [open]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Lanzar confeti desde diferentes posiciones
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
      });
    }, 200); // Más frecuente
  };

  // Efecto de fuegos artificiales
  const triggerFireworks = () => {
    const count = 5;
    const defaults = { 
      startVelocity: 30,
      spread: 360, 
      ticks: 100,
      gravity: 0.5,
      decay: 0.94,
      zIndex: 9999 
    };

    function launchFirework(origin: { x: number, y: number }) {
      confetti({
        ...defaults,
        particleCount: 100,
        scalar: 1.2,
        shapes: ['circle'],
        origin,
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
      });
    }

    // Lanzar varios fuegos artificiales
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        launchFirework({ x: Math.random(), y: Math.random() * 0.6 });
      }, i * 200);
    }
  };

  // Efecto de cañón de confeti
  const triggerConfettiCannon = () => {
    // Centro superior
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { x: 0.5, y: 0.3 },
      zIndex: 9999
    });

    // Disparo desde los lados
    setTimeout(() => {
      confetti({
        particleCount: 150,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.5 },
        zIndex: 9999
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 150,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.5 },
        zIndex: 9999
      });
    }, 400);
  };

  // Elegir icono según el tipo de logro
  const getAchievementIcon = () => {
    switch (achievement.icon) {
      case "trophy":
        return <Trophy className="h-12 w-12 text-yellow-500" />;
      case "star":
        return <Star className="h-12 w-12 text-yellow-500" />;
      case "check":
        return <BadgeCheck className="h-12 w-12 text-green-500" />;
      case "party":
        return <PartyPopper className="h-12 w-12 text-purple-500" />;
      case "medal":
        return <Medal className="h-12 w-12 text-amber-500" />;
      case "target":
        return <Target className="h-12 w-12 text-red-500" />;
      case "zap":
        return <Zap className="h-12 w-12 text-blue-500" />;
      case "flame":
        return <Flame className="h-12 w-12 text-orange-500" />;
      case "droplet":
        return <Droplet className="h-12 w-12 text-cyan-500" />;
      case "utensils":
        return <Utensils className="h-12 w-12 text-indigo-500" />;
      case "salad":
        return <Salad className="h-12 w-12 text-emerald-500" />;
      case "heart":
        return <Heart className="h-12 w-12 text-pink-500" />;
      case "apple":
        return <Apple className="h-12 w-12 text-red-500" />;
      case "pizza":
        return <Pizza className="h-12 w-12 text-orange-500" />;
      case "sandwich":
        return <Sandwich className="h-12 w-12 text-amber-600" />;
      case "cookie":
        return <Cookie className="h-12 w-12 text-amber-700" />;
      case "cherry":
        return <Cherry className="h-12 w-12 text-red-600" />;
      case "fish":
        return <Fish className="h-12 w-12 text-blue-500" />;
      case "ice-cream-bowl":
        return <IceCreamBowl className="h-12 w-12 text-pink-300" />;
      case "leafy-green":
        return <LeafyGreen className="h-12 w-12 text-green-500" />;
      default:
        return <Award className="h-12 w-12 text-yellow-500" />;
    }
  };

  // Mensaje motivacional según el tipo de logro
  const getMotivationalMessage = () => {
    if (achievement.title.includes("primer") || achievement.title.includes("Primera")) {
      return "¡El primer paso hacia una mejor salud! Sigue así.";
    }
    if (achievement.title.includes("Consistencia") || achievement.title.includes("constante")) {
      return "¡La consistencia es clave para el éxito! Estás en el camino correcto.";
    }
    if (achievement.title.includes("Experto") || achievement.title.includes("Maestro")) {
      return "¡Tu dedicación es inspiradora! Continúa con ese increíble compromiso.";
    }
    if (achievement.title.includes("meta") || achievement.title.includes("superación")) {
      return "¡Cada objetivo alcanzado es un paso más hacia tu mejor versión!";
    }
    // Para logros de comida
    if (achievement.icon === "salad" || achievement.icon === "apple" || 
        achievement.icon === "utensils" || achievement.icon === "pizza" || 
        achievement.icon === "sandwich" || achievement.icon === "cookie" || 
        achievement.icon === "cherry" || achievement.icon === "fish" || 
        achievement.icon === "ice-cream-bowl" || achievement.icon === "leafy-green" ||
        achievement.title.toLowerCase().includes("comida") || 
        achievement.title.toLowerCase().includes("aliment")) {
      return "¡Excelente elección nutricional! Estás construyendo hábitos alimenticios saludables.";
    }
    return "¡Excelente trabajo! Cada logro te acerca más a tus metas.";
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center py-8 px-6 bg-gradient-to-b from-slate-50 to-slate-100 border-4 border-yellow-300 animate-enter">
        <DialogHeader className="items-center space-y-4">
          <div className="mx-auto bg-yellow-100 p-5 rounded-full shadow-lg relative">
            {getAchievementIcon()}
            <span className="absolute top-0 right-0 -mt-1 -mr-1">
              <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold text-yellow-700">¡LOGRO DESBLOQUEADO!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <h3 className="text-xl font-semibold text-primary">{achievement.title}</h3>
          <p className="text-muted-foreground">{achievement.description}</p>
          <div className="border-t border-b border-dashed border-yellow-300 py-4 my-2">
            <p className="font-medium text-lg">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onClose} 
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 text-lg shadow-md"
          >
            ¡Seguir adelante!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementCelebration;
