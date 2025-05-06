import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useData } from "@/context/DataContext";

const Index = () => {
  const { clients, profiles } = useData();

  const getClientName = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return "Cliente desconocido";
    
    const profile = profiles.find(p => p.id === client.profile_id);
    if (!profile) return "Cliente desconocido";
    
    return profile.name || "Cliente desconocido";
  }, [clients, profiles]);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header with theme toggle */}
      <header className="w-full p-4">
        <div className="container mx-auto flex justify-end">
          <ThemeToggle />
        </div>
      </header>
      
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <img 
            src="/src/images/b2500693-c261-4fb7-9105-1420fc4b4664.png" 
            alt="Josue Ojeda Nutricionista Logo" 
            className="h-26 mx-auto mb-4 object-contain"
          />
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 text-foreground">
            La plataforma completa para nutricionistas y clientes que buscan alcanzar sus objetivos de salud
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            {/* Botón de registro eliminado */}
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Características principales</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-secondary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721A7.065 7.065 0 0 1 10.5 1.125c1.758 0 3.348.627 4.5 1.596."
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-card-foreground">Planes de nutrición personalizados</h3>
              <p className="text-muted-foreground">
                Crea y gestiona planes nutricionales adaptados a las necesidades específicas de cada cliente
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-secondary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-card-foreground">Seguimiento de progreso</h3>
              <p className="text-muted-foreground">
                Regitra y visualiza el progreso con gráficos detallados para mantener la motivación
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-secondary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-card-foreground">Sistema de logros</h3>
              <p className="text-muted-foreground">
                Mantén a tus clientes motivados con insignias y recompensas por alcanzar sus metas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Comienza tu viaje nutricional hoy
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-10 text-foreground">
            Únete a nuestra plataforma y transforma la forma en que manejas tus objetivos de nutrición y salud
          </p>
          <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Josue Ojeda Nutricionista. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
