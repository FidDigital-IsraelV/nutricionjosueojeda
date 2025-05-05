
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { CheckboxGroup } from "@/components/ui/checkbox-group";

interface AddClientFormProps {
  onClose: () => void;
}

const clientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(8, "Número de teléfono inválido"),
  address: z.string().min(5, "Dirección inválida"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().min(50, "Altura inválida").max(250, "Altura inválida"),
  weight: z.number().min(20, "Peso inválido").max(300, "Peso inválido"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very active"]),
  medicalConditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export const AddClientForm = ({ onClose }: AddClientFormProps) => {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      birthDate: "",
      gender: "male",
      height: 170,
      weight: 70,
      activityLevel: "moderate",
      medicalConditions: [],
      allergies: [],
      medications: [],
      dietaryRestrictions: [],
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    console.log("Form data:", data);
    
    try {
      // Here you would typically send this to your API
      setTimeout(() => {
        toast.success("Cliente creado con éxito", {
          description: `${data.name} ha sido agregado como paciente`,
        });
        onClose();
      }, 500);
    } catch (error) {
      toast.error("Error al crear cliente", {
        description: "Ha ocurrido un error. Intente nuevamente.",
      });
    }
  };

  const activityLevelOptions = [
    { value: "sedentary", label: "Sedentario" },
    { value: "light", label: "Ligero" },
    { value: "moderate", label: "Moderado" },
    { value: "active", label: "Activo" },
    { value: "very active", label: "Muy activo" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="paciente@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Número telefónico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Textarea placeholder="Dirección completa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el género" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="activityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel de actividad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona nivel de actividad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activityLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicalConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condiciones médicas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ingrese condiciones médicas separadas por comas"
                  onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alergias</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Ingrese alergias separadas por comas"
                    onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicamentos</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Ingrese medicamentos separados por comas"
                    onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restricciones alimenticias</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ingrese restricciones dietéticas separadas por comas"
                  onChange={(e) => field.onChange(e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                />
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
            Guardar Cliente
          </Button>
        </div>
      </form>
    </Form>
  );
};
