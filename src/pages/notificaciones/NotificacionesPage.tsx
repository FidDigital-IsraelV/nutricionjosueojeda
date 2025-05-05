
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Bell, BellRing, Clock } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import NotificationsList from "@/components/notifications/NotificationsList";
import ReminderList from "@/components/notifications/ReminderList";
import ReminderForm from "@/components/notifications/ReminderForm";

const NotificacionesPage = () => {
  const navigate = useNavigate();
  const [isNewReminderDialogOpen, setIsNewReminderDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Notificaciones</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Notificaciones y Recordatorios</h1>
        <Button onClick={() => setIsNewReminderDialogOpen(true)}>
          Crear recordatorio
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recordatorios
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="py-6">
          <NotificationsList />
        </TabsContent>
        
        <TabsContent value="reminders" className="py-6">
          <ReminderList onEditReminder={(id) => console.log("Edit reminder:", id)} />
        </TabsContent>
      </Tabs>

      {/* New Reminder Dialog */}
      <Dialog open={isNewReminderDialogOpen} onOpenChange={setIsNewReminderDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo recordatorio</DialogTitle>
            <DialogDescription>
              Completa el formulario para crear un nuevo recordatorio.
            </DialogDescription>
          </DialogHeader>
          <ReminderForm onComplete={() => setIsNewReminderDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificacionesPage;
