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
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { toast } from "@/lib/toast";

const progressSchema = z.object({
  weight: z.string().optional(),
  waist: z.string().optional(),
  hips: z.string().optional(),
  notes: z.string().optional(),
});

type ProgressFormData = z.infer<typeof progressSchema>;

interface ProgressFormProps {
  clientId: string;
  onSuccess?: () => void;
}

const ProgressForm = ({ clientId, onSuccess }: ProgressFormProps) => {
  const { addProgressRecord } = useData();
  
  const form = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      weight: "",
      waist: "",
      hips: "",
      notes: "",
    },
  });

  const onSubmit = (data: ProgressFormData) => {
    const record = {
      clientId,
      date: new Date().toISOString(),
      weight: data.weight ? parseFloat(data.weight) : undefined,
      measurements: {
        waist: data.waist ? parseFloat(data.waist) : undefined,
        hips: data.hips ? parseFloat(data.hips) : undefined,
      },
      notes: data.notes,
    };

    addProgressRecord(record);
    form.reset();
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ej: 70.5"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="waist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cintura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 80.0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hips"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cadera (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 95.0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingresa notas sobre cómo te sientes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Registrar Progreso
        </Button>
      </form>
    </Form>
  );
};

export default ProgressForm;
