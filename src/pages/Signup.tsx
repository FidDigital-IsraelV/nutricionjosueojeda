
import React, { useEffect } from "react";
import SignupForm from "@/components/auth/SignupForm";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/lib/toast";

const Signup = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Si la membresía ha expirado, también permitir acceso a la página de registro
  const isMembershipExpired = currentUser?.membershipEndDate 
    ? new Date() > new Date(currentUser.membershipEndDate)
    : false;

  // Verificar si es un administrador (solo ellos pueden acceder a registro)
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    // Redirigir a usuarios no autorizados
    if (!currentUser || (!isAdmin && !isMembershipExpired)) {
      // Si no es admin o no tiene membresía expirada, redirigir al login
      if (!currentUser) {
        toast.error("No tienes permiso para acceder a esta página", {
          description: "Solo los administradores pueden crear nuevos usuarios"
        });
        navigate("/login");
      }
    }
  }, [currentUser, isAdmin, isMembershipExpired, navigate]);

  // If already logged in and membership not expired and not admin, redirect to dashboard
  if (currentUser && !isMembershipExpired && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {isMembershipExpired && (
          <div className="mb-4 p-4 bg-amber-100 border border-amber-300 text-amber-800 rounded">
            Tu membresía ha expirado. Por favor contacta al administrador o crea una nueva cuenta.
          </div>
        )}
        {(isAdmin || isMembershipExpired) && <SignupForm />}
        {!isAdmin && !isMembershipExpired && !currentUser && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded text-center">
            <p className="font-medium mb-2">Acceso restringido</p>
            <p>Solo los administradores pueden crear nuevos usuarios.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
