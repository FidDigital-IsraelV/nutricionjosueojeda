
import React from "react";
import { Link } from "react-router-dom";
import { User as UserType } from "@/types";
import UserProfile from "./UserProfile";

type ClientSidebarProps = {
  user: UserType;
  navItems: any[];
  location: { pathname: string };
  unreadCount: number;
  logout: () => void;
};

const ClientSidebar = ({ 
  user, 
  navItems, 
  location, 
  unreadCount,
  logout 
}: ClientSidebarProps) => {
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
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-md transition-colors text-sm ${
                location.pathname === item.path
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-muted text-sidebar-foreground"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
              {item.path === "/notificaciones" && unreadCount > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        
        <UserProfile user={user} logout={logout} />
      </div>
    </aside>
  );
};

export default ClientSidebar;
