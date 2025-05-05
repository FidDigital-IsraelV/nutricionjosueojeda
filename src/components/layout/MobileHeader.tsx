
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BellRing, PieChart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { User as UserType } from "@/types";

type MobileHeaderProps = {
  user: UserType;
  unreadCount: number;
  navSections: any[];
  navItems: any[];
  logout: () => void;
};

const MobileHeader = ({ 
  user, 
  unreadCount, 
  navSections, 
  navItems, 
  logout 
}: MobileHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-sidebar border-b border-border z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <img 
            src="/public/lovable-uploads/b2500693-c261-4fb7-9105-1420fc4b4664.png"
            alt="THREEPERCENT Logo"
            className="h-8 object-contain" 
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/notificaciones")}
          >
            <BellRing className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-sidebar-foreground">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-muted">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
              <div className="flex items-center p-2">
                <div className="ml-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role === "admin" ? "Administrador" :
                     user.role === "nutritionist" ? "Nutricionista" :
                     user.role === "trainer" ? "Entrenador" : "Cliente"}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              
              {user.role === "nutritionist" || user.role === "trainer" || user.role === "admin" ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer text-popover-foreground hover:bg-muted focus:bg-muted focus:text-popover-foreground">
                      <PieChart className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/notificaciones" className="cursor-pointer text-popover-foreground hover:bg-muted focus:bg-muted focus:text-popover-foreground">
                      <BellRing className="mr-2 h-4 w-4" />
                      Notificaciones
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  
                  {navSections.map(section => (
                    <React.Fragment key={section.title}>
                      <DropdownMenuSeparator className="bg-border" />
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {section.title}
                      </div>
                      {section.items.map(item => (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link to={item.path} className="cursor-pointer text-popover-foreground hover:bg-muted focus:bg-muted focus:text-popover-foreground">
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </React.Fragment>
                  ))}
                  
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer text-popover-foreground hover:bg-muted focus:bg-muted focus:text-popover-foreground">
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                navItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link to={item.path} className="flex items-center cursor-pointer text-popover-foreground hover:bg-muted focus:bg-muted focus:text-popover-foreground">
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                      {item.path === "/notificaciones" && unreadCount > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
              
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer text-popover-foreground hover:bg-muted focus:bg-muted focus:text-popover-foreground" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
