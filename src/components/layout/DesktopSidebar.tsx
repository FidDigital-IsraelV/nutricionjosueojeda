
import React from "react";
import { Link } from "react-router-dom";
import { PieChart, BellRing, User } from "lucide-react";
import SidebarSection from "./SidebarSection";
import UserProfile from "./UserProfile";
import { User as UserType } from "@/types";

type DesktopSidebarProps = {
  user: UserType;
  unreadCount: number;
  navSections: any[];
  openSections: {[key: string]: boolean};
  toggleSection: (sectionName: string) => void;
  location: { pathname: string };
  logout: () => void;
};

const DesktopSidebar = ({ 
  user, 
  unreadCount, 
  navSections,
  openSections, 
  toggleSection,
  location,
  logout
}: DesktopSidebarProps) => {
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-border hidden md:block overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-center">
            <img 
              src="/public/lovable-uploads/b2500693-c261-4fb7-9105-1420fc4b4664.png" 
              alt="THREEPERCENT Logo" 
              className="h-12 object-contain"
            />
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-2 rounded-md transition-colors text-sm ${
              location.pathname === "/dashboard"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-muted text-sidebar-foreground"
            }`}
          >
            <span className="mr-3"><PieChart size={20} /></span>
            Dashboard
          </Link>
          
          {navSections.map((section) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              isOpen={openSections[section.title]}
              toggleSection={() => toggleSection(section.title)}
              items={section.items}
              currentPath={location.pathname}
            />
          ))}
          
          <Link
            to="/notificaciones"
            className={`flex items-center px-4 py-2 rounded-md transition-colors text-sm ${
              location.pathname === "/notificaciones"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-muted text-sidebar-foreground"
            }`}
          >
            <span className="mr-3"><BellRing size={20} /></span>
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/profile"
            className={`flex items-center px-4 py-2 rounded-md transition-colors text-sm ${
              location.pathname === "/profile"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-muted text-sidebar-foreground"
            }`}
          >
            <span className="mr-3"><User size={20} /></span>
            Mi Perfil
          </Link>
        </nav>
        
        <UserProfile user={user} logout={logout} />
      </div>
    </aside>
  );
};

export default DesktopSidebar;
