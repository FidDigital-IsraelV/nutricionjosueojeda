
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationsContext";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setOpen(false);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notificaciones");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "session":
        return "🗓️";
      case "meal":
        return "🍽️";
      case "workout":
        return "💪";
      default:
        return "📣";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);

      if (diffMins < 60) {
        return `hace ${diffMins} min`;
      } else if (diffHours < 24) {
        return `hace ${diffHours} h`;
      } else if (diffDays === 1) {
        return "ayer";
      } else if (diffDays < 7) {
        return `hace ${diffDays} días`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notificaciones</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-auto py-1"
            >
              Marcar todo como leído
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-muted flex items-start gap-3 ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="text-lg">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <h5 className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                      {notification.title}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(notification.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={handleViewAll}
          >
            Ver todas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
