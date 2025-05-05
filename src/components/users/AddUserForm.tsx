import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRole } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface AddUserFormProps {
  onClose: () => void;
}

const userSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["nutritionist", "trainer", "client"]),
  specialty: z.string().optional(),
  // Campos de membresía
  membershipStartDate: z.string().optional(),
  membershipEndDate: z.string().optional(),
  // Campos adicionales para clientes
  phone: z.string().min(8, "Número de teléfono inválido").optional(),
  address: z.string().min(5, "Dirección inválida").optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.number().min(50, "Altura inválida").max(250, "Altura inválida").optional(),
  weight: z.number().min(20, "Peso inválido").max(300, "Peso inválido").optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very active"]).optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export const AddUserForm = ({ onClose }: AddUserFormProps) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "client",
      specialty: "",
      // Valores por defecto para membresía
      membershipStartDate: new Date().toISOString().split('T')[0],
      membershipEndDate: "",
      // Valores por defecto para clientes
      phone: "",
      address: "",
      birthDate: "",
      gender: "male",
      height: 170,
      weight: 70,
      activityLevel: "moderate",
      medicalConditions: "",
      allergies: "",
      medications: "",
      dietaryRestrictions: "",
    },
  });

  // Si el usuario no es admin, asegurarse de que solo pueda crear clientes
  useEffect(() => {
    if (!isAdmin) {
      form.setValue("role", "client");
    }
  }, [isAdmin, form]);

  const watchRole = form.watch("role");

  const onSubmit = async (data: UserFormData) => {
    try {
      // 1. Crear el usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario en Auth');

      // 2. Crear el perfil en la tabla profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: data.role,
          membership_start_date: data.membershipStartDate || null,
          membership_end_date: data.membershipEndDate || null
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error al crear perfil:', profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error('No se pudo crear el perfil del usuario');
      }

      // 3. Crear el registro específico según el rol
      if (data.role === 'client') {
        // Convertir strings a arrays para los campos que lo requieren
        const medicalConditions = data.medicalConditions 
          ? data.medicalConditions.split(',').map(item => item.trim())
          : [];
        
        const allergies = data.allergies 
          ? data.allergies.split(',').map(item => item.trim())
          : [];
        
        const medications = data.medications 
          ? data.medications.split(',').map(item => item.trim())
          : [];
        
        const dietaryRestrictions = data.dietaryRestrictions 
          ? data.dietaryRestrictions.split(',').map(item => item.trim())
          : [];

        // Intentar crear el cliente
        const { error: clientError } = await supabase
          .from('clients')
          .insert({
            profile_id: authData.user.id,
            phone: data.phone || null,
            address: data.address || null,
            birth_date: data.birthDate || null,
            gender: data.gender || null,
            height: data.height || null,
            weight: data.weight || null,
            activity_level: data.activityLevel || null,
            medical_conditions: medicalConditions,
            allergies: allergies,
            medications: medications,
            dietary_restrictions: dietaryRestrictions,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (clientError) {
          console.error('Error al crear cliente:', clientError);
          // Intentar limpiar el perfil si falla la creación del cliente
          await supabase.from('profiles').delete().eq('id', authData.user.id);
          throw clientError;
        }

        // Verificación después de crear el cliente
        const { data: verifyClient, error: verifyError } = await supabase
          .from('clients')
          .select('*')
          .eq('profile_id', authData.user.id)
          .single();

        if (verifyError || !verifyClient) {
          console.error('Error al verificar la creación del cliente:', verifyError);
          // Intentar limpiar el perfil si falla la verificación
          await supabase.from('profiles').delete().eq('id', authData.user.id);
          throw new Error('No se pudo verificar la creación del cliente');
        }
      }

      toast.success("Usuario creado con éxito", {
        description: `${data.name} ha sido agregado como ${data.role}`,
      });
      onClose();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast.error("Error al crear usuario", {
        description: error instanceof Error ? error.message : "Ha ocurrido un error. Intente nuevamente.",
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
                  <Input placeholder="Nombre del usuario" {...field} />
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
                  <Input type="email" placeholder="usuario@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Ingrese la contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de usuario</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!isAdmin} // Solo los admins pueden cambiar el rol
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                  {isAdmin && (
                    <>
                      <SelectItem value="nutritionist">Nutricionista</SelectItem>
                      <SelectItem value="trainer">Entrenador</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground mt-1">
                  Solo los administradores pueden crear nutricionistas y entrenadores.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos de membresía para todos los usuarios */}
        <div className="bg-muted/30 p-4 rounded-lg border">
          <h3 className="font-medium mb-3">Información de membresía</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="membershipStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de inicio</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="membershipEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de finalización</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {(watchRole === "nutritionist" || watchRole === "trainer") && (
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidad</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={watchRole === "nutritionist" 
                      ? "Ej: Nutrición deportiva, clínica, etc." 
                      : "Ej: Entrenamiento funcional, yoga, etc."
                    } 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Campos adicionales para clientes */}
        {watchRole === "client" && (
          <>
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
                      {...field}
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
                        {...field}
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
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restricciones alimenticias</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ingrese restricciones dietéticas separadas por comas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Usuario
          </Button>
        </div>
      </form>
    </Form>
  );
};
