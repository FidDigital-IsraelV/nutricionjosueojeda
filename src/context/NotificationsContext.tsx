import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./AuthContext";
import { toast } from "@/lib/toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "session" | "meal" | "workout" | "general";
  date: string;
  read: boolean;
  userId: string;
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  type: "session" | "meal" | "workout" | "general";
  reminderDate: string;
  createdAt: string;
  userId: string;
  clientId?: string;
  completed: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  reminders: Reminder[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, "id" | "createdAt">) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  getUserReminders: () => Reminder[];
  getClientReminders: (clientId: string) => Reminder[];
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Mock initial data for notifications
const mockNotifications: Notification[] = [
  {
    id: "notif1",
    title: "Sesión de nutrición programada",
    message: "Tienes una sesión de nutrición mañana a las 10:00 AM",
    type: "session",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    read: false,
    userId: "client1"
  },
  {
    id: "notif2",
    title: "Recordatorio de comida",
    message: "Recuerda preparar tu almuerzo saludable hoy",
    type: "meal",
    date: new Date().toISOString(),
    read: true,
    userId: "client1"
  },
  {
    id: "notif3",
    title: "Entrenamiento programado",
    message: "Tienes un entrenamiento de fuerza programado para esta tarde",
    type: "workout",
    date: new Date().toISOString(),
    read: false,
    userId: "client1"
  }
];

// Mock initial data for reminders
const mockReminders: Reminder[] = [
  {
    id: "reminder1",
    title: "Preparar comida semanal",
    message: "Preparar las comidas para toda la semana",
    type: "meal",
    reminderDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    createdAt: new Date().toISOString(),
    userId: "nutritionist1",
    clientId: "client1",
    completed: false
  },
  {
    id: "reminder2",
    title: "Entrenamiento de piernas",
    message: "Recordar hacer entrenamiento de piernas",
    type: "workout",
    reminderDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    createdAt: new Date().toISOString(),
    userId: "trainer1",
    clientId: "client1",
    completed: false
  }
];

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  
  // Check for upcoming reminders and create notifications
  useEffect(() => {
    if (!currentUser) return;
    
    const checkReminders = () => {
      const now = new Date();
      const userReminders = reminders.filter(
        reminder => 
          (reminder.userId === currentUser.id || reminder.clientId === currentUser.id) && 
          !reminder.completed
      );
      
      userReminders.forEach(reminder => {
        const reminderDate = new Date(reminder.reminderDate);
        // If reminder is due within the next hour
        if (reminderDate.getTime() - now.getTime() <= 3600000 && reminderDate > now) {
          // Check if notification already exists
          const notificationExists = notifications.some(
            notif => 
              notif.title === `Recordatorio: ${reminder.title}` && 
              notif.message === reminder.message
          );
          
          if (!notificationExists) {
            addNotification({
              title: `Recordatorio: ${reminder.title}`,
              message: reminder.message,
              type: reminder.type,
              date: new Date().toISOString(),
              read: false,
              userId: currentUser.id
            });
          }
        }
      });
    };
    
    checkReminders();
    const interval = setInterval(checkReminders, 300000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [currentUser, reminders, notifications]);

  const unreadCount = currentUser
    ? notifications.filter(n => n.userId === currentUser.id && !n.read).length
    : 0;

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification = {
      ...notification,
      id: `notif-${Date.now()}`
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    if (!currentUser) return;
    
    setNotifications(
      notifications.map(notif => 
        notif.userId === currentUser.id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const addReminder = (reminder: Omit<Reminder, "id" | "createdAt">) => {
    const newReminder = {
      ...reminder,
      id: `reminder-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setReminders([...reminders, newReminder]);
    toast.success("Recordatorio creado correctamente");
  };

  const updateReminder = (reminder: Reminder) => {
    setReminders(reminders.map(r => r.id === reminder.id ? reminder : r));
    toast.success("Recordatorio actualizado correctamente");
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
    toast.success("Recordatorio eliminado correctamente");
  };

  const completeReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, completed: true } : r
    ));
    toast.success("Recordatorio completado");
  };

  const getUserReminders = () => {
    if (!currentUser) return [];
    
    return reminders.filter(reminder => 
      reminder.userId === currentUser.id || reminder.clientId === currentUser.id
    );
  };

  const getClientReminders = (clientId: string) => {
    return reminders.filter(reminder => reminder.clientId === clientId);
  };

  const value = {
    notifications: currentUser 
      ? notifications.filter(n => n.userId === currentUser.id)
      : [],
    reminders,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    getUserReminders,
    getClientReminders
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
