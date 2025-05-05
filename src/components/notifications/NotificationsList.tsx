
import React from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const NotificationsList = () => {
  const { 
    notifications, 
    markAsRead, 
    deleteNotification 
  } = useNotifications();

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  // Format date to human-readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("es", { 
        day: "numeric", 
        month: "short", 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get icon based on notification type
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

  const NotificationCard = ({ notification, showActions = true }: { 
    notification: any; 
    showActions?: boolean
  }) => (
    <Card className={`mb-3 ${!notification.read ? "border-primary/30" : ""}`}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="text-2xl">{getTypeIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold ${!notification.read ? "text-primary" : ""}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(notification.date)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          
          {showActions && (
            <div className="flex justify-end gap-2 mt-3">
              {!notification.read && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como leído
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar notificación?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteNotification(notification.id)}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="unread" className="relative">
            No leídas
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="read">Leídas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="unread">
          {unreadNotifications.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No tienes notificaciones sin leer
            </div>
          ) : (
            <div>
              {unreadNotifications.map(notification => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {notifications.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="read">
          {readNotifications.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No tienes notificaciones leídas
            </div>
          ) : (
            <div>
              {readNotifications.map(notification => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsList;
