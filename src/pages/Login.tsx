
import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { currentUser } = useAuth();

  // If already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
