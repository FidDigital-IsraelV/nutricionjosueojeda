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
import { toast } from "@/lib/toast";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("No se pudo iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Josue Ojeda Nutricionista</h1>
        <p className="mt-2 text-gray-600">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="tu@correo.com" 
                    {...field} 
                  />
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
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </Form>

      {/* Demo credentials */}
      <div className="mt-6 rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium mb-2">Credenciales para demo:</h3>
        <p className="text-sm mb-1">
          <strong>Nutricionista:</strong> juan@nutriapp.com
        </p>
        <p className="text-sm mb-1">
          <strong>Cliente:</strong> maria@example.com
        </p>
        <p className="text-sm">
          <strong>Contraseña:</strong> password (para ambos)
        </p>
      </div>

      <div className="text-center">
        <p className="text-sm">
          ¿No tienes una cuenta?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
