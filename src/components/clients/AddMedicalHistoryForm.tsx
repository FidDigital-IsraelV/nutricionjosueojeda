
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

interface AddMedicalHistoryFormProps {
  clientId: string;
  onClose: () => void;
}

const medicalHistorySchema = z.object({
  condition: z.string().min(2, "La condición debe tener al menos 2 caracteres"),
  diagnosisDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  treatment: z.string().min(2, "El tratamiento debe tener al menos 2 caracteres"),
  notes: z.string().optional(),
});

type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;

export const AddMedicalHistoryForm = ({ clientId, onClose }: AddMedicalHistoryFormProps) => {
  const form = useForm<MedicalHistoryFormData>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      condition: "",
      diagnosisDate: "",
      treatment: "",
      notes: "",
    },
  });

  const onSubmit = async (data: MedicalHistoryFormData) => {
    console.log("Form data:", data, "Client ID:", clientId);
    
    try {
      // Here you would typically send this to your API
      setTimeout(() => {
        toast.success("Historial médico agregado con éxito", {
          description: `Condición: ${data.condition}`,
        });
        onClose();
      }, 500);
    } catch (error) {
      toast.error("Error al agregar historial médico", {
        description: "Ha ocurrido un error. Intente nuevamente.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condición médica</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la condición" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnosisDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de diagnóstico</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tratamiento</FormLabel>
              <FormControl>
                <Input placeholder="Tratamiento prescrito" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas adicionales</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas sobre el historial médico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Historial
          </Button>
        </div>
      </form>
    </Form>
  );
};
