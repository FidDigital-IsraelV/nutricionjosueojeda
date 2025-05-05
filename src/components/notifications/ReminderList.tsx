
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNotifications } from "@/context/NotificationsContext";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Edit, Trash2 } from "lucide-react";
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

interface ReminderListProps {
  clientId?: string;
  onEditReminder?: (reminderId: string) => void;
}

const ReminderList = ({ clientId, onEditReminder }: ReminderListProps) => {
  const { currentUser } = useAuth();
  const { getClientById } = useData();
  const { 
    reminders, 
    deleteReminder, 
    completeReminder
  } = useNotifications();

  // Get reminders for the current user or a specific client
  const userReminders = React.useMemo(() => {
    if (!currentUser) return [];
    
    let filteredReminders;
    if (clientId) {
      filteredReminders = reminders.filter(r => r.clientId === clientId);
    } else if (currentUser.role === "client") {
      filteredReminders = reminders.filter(
        r => r.userId === currentUser.id || r.clientId === currentUser.id
      );
    } else {
      filteredReminders = reminders.filter(
        r => r.userId === currentUser.id && !r.clientId
      );
    }
    
    // Sort by date
    return filteredReminders.sort((a, b) => 
      new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()
    );
  }, [currentUser, reminders, clientId]);

  // Functions to check reminder status
  const isPastReminder = (dateStr: string) => {
    const reminderDate = new Date(dateStr);
    const now = new Date();
    return reminderDate < now;
  };

  const isUpcomingReminder = (dateStr: string) => {
    const reminderDate = new Date(dateStr);
    const now = new Date();
    const diffTime = reminderDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 3 && diffDays > 0; // Within next 3 days
  };

  // Format date for display
  const formatReminderDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "EEEE d 'de' MMMM, h:mm a", { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  // Format relative date for display
  const formatRelativeDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 3600 * 24)) / (1000 * 3600));
      
      if (diffDays < 0 || diffTime < 0) {
        return "Vencido";
      } else if (diffDays === 0) {
        return diffHours === 0 ? "En menos de una hora" : `En ${diffHours} horas`;
      } else if (diffDays === 1) {
        return "Mañana";
      } else {
        return `En ${diffDays} días`;
      }
    } catch (e) {
      return "";
    }
  };
  
  // Icon for reminder type
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

  // Get badge color based on reminder status
  const getReminderStatusBadge = (reminder: any) => {
    if (reminder.completed) {
      return <Badge variant="outline" className="bg-green-50">Completado</Badge>;
    } else if (isPastReminder(reminder.reminderDate)) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (isUpcomingReminder(reminder.reminderDate)) {
      return <Badge variant="warning" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Próximo</Badge>;
    } else {
      return <Badge variant="outline">Programado</Badge>;
    }
  };

  // Get client name if reminder is for a client
  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    const client = getClientById(clientId);
    return client ? client.name : "Cliente";
  };

  // Group reminders by status
  const completedReminders = userReminders.filter(r => r.completed);
  const pendingReminders = userReminders.filter(r => !r.completed);
  const pastReminders = pendingReminders.filter(r => isPastReminder(r.reminderDate));
  const upcomingReminders = pendingReminders.filter(r => !isPastReminder(r.reminderDate));

  if (userReminders.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/20 rounded-lg border">
        <p className="text-muted-foreground">No hay recordatorios disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming reminders */}
      {upcomingReminders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Próximos recordatorios</h3>
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">{getTypeIcon(reminder.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{reminder.title}</h4>
                        {getReminderStatusBadge(reminder)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {reminder.message}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                        <div className="text-sm">
                          <span className="font-medium">Fecha: </span>
                          {formatReminderDate(reminder.reminderDate)}
                        </div>
                        
                        <div className="text-sm text-primary font-medium">
                          {formatRelativeDate(reminder.reminderDate)}
                        </div>
                        
                        {reminder.clientId && currentUser?.role !== "client" && (
                          <div className="text-sm">
                            <span className="font-medium">Para: </span>
                            {getClientName(reminder.clientId)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => completeReminder(reminder.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Completar
                        </Button>
                        
                        {onEditReminder && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditReminder(reminder.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
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
                              <AlertDialogTitle>¿Eliminar recordatorio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReminder(reminder.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Past reminders */}
      {pastReminders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Recordatorios vencidos</h3>
          <div className="space-y-3">
            {pastReminders.map((reminder) => (
              <Card key={reminder.id} className="border-red-200">
                <CardContent className="p-4">
                  {/* Similar structure as above */}
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">{getTypeIcon(reminder.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{reminder.title}</h4>
                        {getReminderStatusBadge(reminder)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {reminder.message}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                        <div className="text-sm">
                          <span className="font-medium">Fecha: </span>
                          {formatReminderDate(reminder.reminderDate)}
                        </div>
                        
                        {reminder.clientId && currentUser?.role !== "client" && (
                          <div className="text-sm">
                            <span className="font-medium">Para: </span>
                            {getClientName(reminder.clientId)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => completeReminder(reminder.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar completado
                        </Button>
                        
                        {onEditReminder && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditReminder(reminder.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
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
                              <AlertDialogTitle>¿Eliminar recordatorio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReminder(reminder.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Completed reminders */}
      {completedReminders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Recordatorios completados</h3>
          <div className="space-y-3">
            {completedReminders.map((reminder) => (
              <Card key={reminder.id} className="bg-muted/10">
                <CardContent className="p-4">
                  {/* Similar structure as above */}
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">{getTypeIcon(reminder.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{reminder.title}</h4>
                        {getReminderStatusBadge(reminder)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {reminder.message}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                        <div className="text-sm">
                          <span className="font-medium">Fecha: </span>
                          {formatReminderDate(reminder.reminderDate)}
                        </div>
                        
                        {reminder.clientId && currentUser?.role !== "client" && (
                          <div className="text-sm">
                            <span className="font-medium">Para: </span>
                            {getClientName(reminder.clientId)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 mt-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar recordatorio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReminder(reminder.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderList;
