// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "../types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para obtener el perfil del usuario
  const getProfile = async (userId: string) => {
    try {
      console.log('Obteniendo perfil para usuario:', userId);
      
      // Verificar autenticación primero
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error de sesión:', sessionError);
        return null;
      }

      if (!session?.user) {
        console.log('No hay sesión activa');
        return null;
      }

      // Obtener el perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error al obtener perfil:', error);
        if (error.code === 'PGRST301') {
          console.log('No se encontró el perfil');
          return null;
        }
        throw error;
      }

      console.log('Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('Error inesperado al obtener perfil:', error);
      return null;
    }
  };

  // Función para verificar si la membresía está activa
  const isMembershipActive = (profile: any): boolean => {
    // Si no hay fecha de fin, consideramos la membresía activa
    if (!profile.membership_end_date) return true;
    
    const today = new Date();
    const endDate = new Date(profile.membership_end_date);
    
    return today <= endDate;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Verificando sesión...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al obtener sesión:', error);
          setIsLoading(false);
          return;
        }

        console.log('Sesión:', session);
        
        if (session?.user) {
          console.log('Usuario autenticado:', session.user);
          const profile = await getProfile(session.user.id);
          if (profile) {
            console.log('Perfil encontrado:', profile);
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              avatar: profile.avatar_url || undefined,
              membershipStartDate: profile.membership_start_date || undefined,
              membershipEndDate: profile.membership_end_date || undefined,
              isActiveMembership: isMembershipActive(profile)
            });
          }
        }
      } catch (error) {
        console.error('Error inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Cambio en el estado de autenticación:', _event);
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setCurrentUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            avatar: profile.avatar_url || undefined,
            membershipStartDate: profile.membership_start_date || undefined,
            membershipEndDate: profile.membership_end_date || undefined,
            isActiveMembership: isMembershipActive(profile)
          });
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const profile = await getProfile(data.user.id);
        if (profile) {
          if (isMembershipActive(profile)) {
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              avatar: profile.avatar_url || undefined,
              membershipStartDate: profile.membership_start_date || undefined,
              membershipEndDate: profile.membership_end_date || undefined,
              isActiveMembership: true
            });
            toast.success("Inicio de sesión exitoso");
          } else {
            toast.error("Tu membresía ha expirado", {
              description: "Por favor contacta a tu administrador para renovar la membresía."
            });
            throw new Error("Expired membership");
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Credenciales inválidas");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error al cerrar sesión:", error);
        toast.error("Error al cerrar sesión");
        return;
      }

      setCurrentUser(null);
      toast.info("Has cerrado sesión correctamente");
    } catch (error) {
      console.error("Error inesperado al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole
  ) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            name,
            role
          });

        if (profileError) throw profileError;

        toast.success("Registro exitoso. Por favor inicia sesión.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Error al registrarse");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};