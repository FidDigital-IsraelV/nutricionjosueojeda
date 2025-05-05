
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
import { UserRole } from "@/types";
import { toast } from "@/lib/toast";

const signupSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
  role: z.enum(["nutritionist", "client", "admin", "trainer"]),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const { signup, isLoading, currentUser, login } = useAuth();
  const navigate = useNavigate();
  
  // Solo los administradores pueden crear nutricionistas, entrenadores y administradores
  const isAdmin = currentUser?.role === "admin";

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "client",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.email, data.password, data.name, data.role as UserRole);
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  // Función para iniciar sesión rápida como administrador
  const loginAsAdmin = async () => {
    try {
      await login("admin@example.com", "password123");
      navigate("/dashboard");
      toast.success("Has iniciado sesión como administrador", {
        description: "Usuario: admin@example.com | Contraseña: password123"
      });
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("Error al iniciar sesión como administrador");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">NutriJourney</h1>
        <p className="mt-2 text-gray-600">
          Crea tu cuenta para comenzar
        </p>
      </div>

      {/* Botón de acceso rápido como administrador */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-amber-800">Acceso rápido como administrador</h3>
        <p className="text-xs text-amber-700 mt-1 mb-2">
          Para revisar todas las funcionalidades del sistema
        </p>
        <Button 
          variant="outline" 
          className="w-full border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200"
          onClick={loginAsAdmin}
          disabled={isLoading}
        >
          Entrar como Administrador
        </Button>
        <p className="text-xs text-amber-600 mt-2">
          Email: admin@example.com | Contraseña: password123
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
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
                  <Input type="email" placeholder="tu@correo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirma tu contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
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
                <FormLabel>Tipo de cuenta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <SelectItem value="admin">Administrador</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {!isAdmin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo los administradores pueden crear usuarios especializados.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
