
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Award, 
  Trophy, 
  Star, 
  BadgeCheck, 
  PartyPopper, 
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
import { Badge } from "@/components/ui/badge";
import { Achievement } from "@/types";

interface AchievementCardProps {
  achievement: Achievement;
  isNew?: boolean;
  compact?: boolean;
}

const AchievementCard = ({ achievement, isNew, compact }: AchievementCardProps) => {
  const date = new Date(achievement.dateEarned);
  const formattedDate = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  // Determinar si es un logro relacionado con comida
  const isFoodAchievement = () => {
    const foodIcons = ["utensils", "salad", "apple", "pizza", "sandwich", "cookie", "cherry", "fish", "leafy-green", "ice-cream-bowl"];
    return foodIcons.includes(achievement.icon) || 
      achievement.title.toLowerCase().includes("comida") || 
      achievement.title.toLowerCase().includes("aliment") ||
      achievement.title.toLowerCase().includes("nutri");
  };

  // Seleccionar el icono apropiado según el tipo de logro
  const renderAchievementIcon = () => {
    switch (achievement.icon) {
      case "trophy":
        return <Trophy className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-yellow-500`} />;
      case "star":
        return <Star className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-yellow-500`} />;
      case "check":
        return <BadgeCheck className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-green-500`} />;
      case "party":
        return <PartyPopper className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-purple-500`} />;
      case "medal":
        return <Medal className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-amber-500`} />;
      case "target":
        return <Target className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-red-500`} />;
      case "zap":
        return <Zap className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-blue-500`} />;
      case "flame":
        return <Flame className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-orange-500`} />;
      case "droplet":
        return <Droplet className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-cyan-500`} />;
      case "utensils":
        return <Utensils className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-indigo-500`} />;
      case "salad":
        return <Salad className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-emerald-500`} />;
      case "heart":
        return <Heart className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-pink-500`} />;
      case "apple":
        return <Apple className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-red-500`} />;
      case "pizza":
        return <Pizza className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-orange-500`} />;
      case "sandwich":
        return <Sandwich className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-amber-600`} />;
      case "cookie":
        return <Cookie className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-amber-700`} />;
      case "cherry":
        return <Cherry className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-red-600`} />;
      case "fish":
        return <Fish className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-blue-500`} />;
      case "ice-cream-bowl":
        return <IceCreamBowl className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-pink-300`} />;
      case "leafy-green":
        return <LeafyGreen className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-green-500`} />;
      default:
        return <Award className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-yellow-500`} />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 border rounded-md p-2 hover:bg-slate-50">
        <div className={`rounded-full p-2 ${isFoodAchievement() ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          {renderAchievementIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{achievement.title}</p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        {isNew && <Badge className="bg-success text-xs">¡Nuevo!</Badge>}
      </div>
    );
  }

  return (
    <Card className={`${isNew ? "border-success border-2" : ""} hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{achievement.title}</CardTitle>
          {isNew && <Badge className="bg-success">¡Nuevo!</Badge>}
        </div>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm">{achievement.description}</p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center text-yellow-500">
          {renderAchievementIcon()}
          <span className="text-xs ml-1">Logro desbloqueado</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AchievementCard;
