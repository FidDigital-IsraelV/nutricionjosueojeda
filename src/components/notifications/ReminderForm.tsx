
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotifications } from "@/context/NotificationsContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const reminderSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  message: z.string().min(5, "El mensaje debe tener al menos 5 caracteres"),
  type: z.enum(["session", "meal", "workout", "general"]),
  reminderDate: z.date(),
  reminderTime: z.string(),
  clientId: z.string().optional(),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  onComplete?: () => void;
  defaultClientId?: string;
}

const ReminderForm = ({ onComplete, defaultClientId }: ReminderFormProps) => {
  const { addReminder } = useNotifications();
  const { clients } = useData();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "general",
      reminderDate: new Date(),
      reminderTime: format(new Date(), "HH:mm"),
      clientId: defaultClientId || "",
    },
  });

  const handleSubmit = (data: ReminderFormData) => {
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const [hours, minutes] = data.reminderTime.split(':').map(Number);
      const reminderDate = new Date(data.reminderDate);
      reminderDate.setHours(hours, minutes);
      
      addReminder({
        title: data.title,
        message: data.message,
        type: data.type,
        reminderDate: reminderDate.toISOString(),
        userId: currentUser!.id,
        clientId: data.clientId || undefined,
        completed: false,
      });
      
      form.reset();
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user role is nutritionist or trainer
  const isUserNutritionistOrTrainer = 
    currentUser?.role === "nutritionist" || 
    currentUser?.role === "trainer";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del recordatorio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detalles del recordatorio"
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="session">Sesión</SelectItem>
                    <SelectItem value="meal">Comida</SelectItem>
                    <SelectItem value="workout">Entrenamiento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isUserNutritionistOrTrainer && (
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente (opcional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Solo para mí</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Si seleccionas un cliente, el recordatorio será para ambos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="reminderDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal flex justify-between"
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reminderTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando..." : "Crear recordatorio"}
        </Button>
      </form>
    </Form>
  );
};

export default ReminderForm;
