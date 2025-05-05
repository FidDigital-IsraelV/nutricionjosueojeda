import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "../theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { BellRing } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        <div className="flex items-center">
          <Link to="/dashboard" className="text-xl font-bold">
            Fitness & Nutrición
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Botón de notificaciones destacado */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/notificaciones")} 
            className="relative flex items-center gap-2 hover:bg-primary/10"
            title="Ver notificaciones"
          >
            <BellRing className="h-4 w-4" />
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-1 h-5 w-5 rounded-full flex items-center justify-center text-xs p-0"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
          
          <ThemeToggle />
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notificaciones")}>
                  Notificaciones
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 h-5 w-5 rounded-full flex items-center justify-center text-xs p-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
