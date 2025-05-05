
import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { User } from "@/types";

type UserProfileProps = {
  user: User;
  logout: () => void;
};

const UserProfile = ({ user, logout }: UserProfileProps) => {
  const roleDisplay = 
    user.role === "admin" ? "Administrador" :
    user.role === "nutritionist" ? "Nutricionista" :
    user.role === "trainer" ? "Entrenador" : "Cliente";

  return (
    <div className="p-5 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-muted text-sidebar-foreground">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{roleDisplay}</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
      <Button 
        variant="outline"
        className="w-full border-secondary text-sidebar-foreground hover:bg-muted"
        onClick={logout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </div>
  );
};

export default UserProfile;
