
import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

type SidebarSectionProps = {
  title: string;
  isOpen: boolean;
  toggleSection: () => void;
  items: {
    path: string;
    label: string;
    icon: React.ReactNode;
  }[];
  currentPath: string;
};

const SidebarSection = ({ 
  title, 
  isOpen, 
  toggleSection, 
  items, 
  currentPath 
}: SidebarSectionProps) => {
  return (
    <div className="space-y-1">
      <button
        type="button"
        className="w-full flex justify-between items-center px-4 py-2 text-sidebar-foreground hover:bg-muted rounded-md transition-colors"
        onClick={toggleSection}
      >
        <span className="font-medium text-sm">{title}</span>
        <span className="text-secondary transition-transform duration-300">
          {isOpen ? 
            <ChevronDown size={16} /> : 
            <ChevronRight size={16} />
          }
        </span>
      </button>
      
      {isOpen && (
        <div className="ml-4 space-y-1 animate-enter">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                currentPath === item.path
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-muted text-sidebar-foreground"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarSection;
