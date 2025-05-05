import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Achievement, User, UserRole } from "@/types";
import { Users, UserPlus, Search, FilterX, Apple, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddUserForm } from "@/components/users/AddUserForm";
import { UserList } from "@/components/users/UserList";
import AchievementCard from "@/components/dashboard/AchievementCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const Pacientes = () => {
  const { clients, achievements, getAchievementsByClient, profiles } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"clients" | "nutritionists" | "trainers" | "achievements">("clients");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showOnlyFood, setShowOnlyFood] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  // For demonstration purposes, we'll just use the mock clients as users of different types
  const users = clients.map((client) => {
    const profile = profiles.find(p => p.id === client.profile_id);
    return {
    id: client.id,
      name: profile?.name || `${client.personalInfo?.firstName || ''} ${client.personalInfo?.lastName || ''}`.trim() || 'Cliente sin nombre',
      email: profile?.email || `${client.personalInfo?.firstName?.toLowerCase() || 'cliente'}@example.com`,
    role: "client" as UserRole,
    avatar: "/placeholder.svg"
    };
  });

  // Mock data for nutritionists and trainers
  const nutritionists = [
    {
      id: "nutr1",
      name: "Ana Martínez",
      email: "ana.martinez@example.com",
      role: "nutritionist" as UserRole,
      specialty: "Nutrición deportiva",
      avatar: "/placeholder.svg"
    },
    {
      id: "nutr2",
      name: "Carlos López",
      email: "carlos.lopez@example.com",
      role: "nutritionist" as UserRole,
      specialty: "Nutrición clínica",
      avatar: "/placeholder.svg"
    }
  ];

  const trainers = [
    {
      id: "train1",
      name: "Miguel Ángel",
      email: "miguel.angel@example.com",
      role: "trainer" as UserRole,
      specialty: "Entrenamiento funcional",
      avatar: "/placeholder.svg"
    },
    {
      id: "train2",
      name: "Laura Gómez",
      email: "laura.gomez@example.com",
      role: "trainer" as UserRole,
      specialty: "Yoga y pilates",
      avatar: "/placeholder.svg"
    }
  ];

  const filteredClients = users.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNutritionists = nutritionists.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrainers = trainers.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    setIsAddUserOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Función para filtrar logros de comida
  const isFoodAchievement = (achievement: Achievement) => {
    const foodIcons = ["utensils", "salad", "apple", "pizza", "sandwich", "cookie", "cherry", "fish", "leafy-green", "ice-cream-bowl"];
    return foodIcons.includes(achievement.icon) || 
      achievement.title.toLowerCase().includes("comida") || 
      achievement.title.toLowerCase().includes("aliment") ||
      achievement.title.toLowerCase().includes("nutri");
  };

  // Obtener todos los logros o filtrar por cliente
  const getAllAchievements = () => {
    if (selectedClient) {
      return getAchievementsByClient(selectedClient).filter(achievement => 
        !showOnlyFood || isFoodAchievement(achievement)
      );
    }
    
    // Obtener los logros de todos los clientes
    const allAchievements: {achievement: Achievement, clientName: string}[] = [];
    
    clients.forEach(client => {
      const profile = profiles.find(p => p.id === client.profile_id);
      const clientAchievements = getAchievementsByClient(client.id);
      clientAchievements.filter(achievement => !showOnlyFood || isFoodAchievement(achievement))
        .forEach(achievement => {
          allAchievements.push({
            achievement,
            clientName: profile?.name || `${client.personalInfo?.firstName || ''} ${client.personalInfo?.lastName || ''}`.trim() || 'Cliente sin nombre'
          });
        });
    });
    
    return allAchievements;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <UserPlus size={16} /> Agregar Usuario
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={clearSearch}
          >
            <FilterX size={18} />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          {isAdmin && <TabsTrigger value="nutritionists">Nutricionistas</TabsTrigger>}
          {isAdmin && <TabsTrigger value="trainers">Entrenadores</TabsTrigger>}
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Medal size={16} /> Logros
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} /> Clientes
              </CardTitle>
              <CardDescription>
                Listado de todos los clientes registrados en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList users={filteredClients} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="nutritionists">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} /> Nutricionistas
                </CardTitle>
                <CardDescription>
                  Listado de todos los nutricionistas registrados en el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserList users={filteredNutritionists} specialty />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {isAdmin && (
          <TabsContent value="trainers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} /> Entrenadores
                </CardTitle>
                <CardDescription>
                  Listado de todos los entrenadores registrados en el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserList users={filteredTrainers} specialty />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="flex items-center gap-2">
                  <Medal size={20} /> Logros de Pacientes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="food-achievements" 
                      checked={showOnlyFood} 
                      onCheckedChange={() => setShowOnlyFood(!showOnlyFood)}
                    />
                    <label 
                      htmlFor="food-achievements" 
                      className="text-sm font-medium leading-none flex items-center gap-1"
                    >
                      <Apple size={16} />
                      Solo logros de alimentación
                    </label>
                  </div>
                </div>
              </div>
              <CardDescription>
                Visualiza los logros obtenidos por los pacientes en el sistema.
              </CardDescription>

              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  variant={selectedClient === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  Todos
                </Button>
                
                {clients.map(client => {
                  const profile = profiles.find(p => p.id === client.profile_id);
                  return (
                  <Button 
                    key={client.id}
                    variant={selectedClient === client.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedClient(client.id)}
                  >
                      {profile?.name || `${client.personalInfo?.firstName || ''} ${client.personalInfo?.lastName || ''}`.trim() || 'Cliente sin nombre'}
                  </Button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedClient ? (
                  // Mostrar logros de un cliente específico
                  <div>
                    <h3 className="font-semibold mb-4">
                      {(() => {
                        const client = clients.find(c => c.id === selectedClient);
                        const profile = profiles.find(p => p.id === client?.profile_id);
                        return profile?.name || `${client?.personalInfo?.firstName || ''} ${client?.personalInfo?.lastName || ''}`.trim() || 'Cliente sin nombre';
                      })()}
                    </h3>
                    
                    {getAllAchievements().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getAllAchievements().map((achievement) => (
                          <AchievementCard 
                            key={achievement.id} 
                            achievement={achievement as unknown as Achievement}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        {showOnlyFood 
                          ? "Este paciente aún no ha obtenido logros relacionados con alimentación" 
                          : "Este paciente aún no ha obtenido logros"}
                      </p>
                    )}
                  </div>
                ) : (
                  // Mostrar logros de todos los clientes agrupados
                  <div>
                    {getAllAchievements().length > 0 ? (
                      <div className="space-y-4">
                        {clients.map(client => {
                          const profile = profiles.find(p => p.id === client.profile_id);
                          const clientAchievements = getAchievementsByClient(client.id)
                            .filter(achievement => !showOnlyFood || isFoodAchievement(achievement));
                            
                          if (clientAchievements.length === 0) return null;
                          
                          return (
                            <Collapsible key={client.id} className="border rounded-lg">
                              <CollapsibleTrigger className="flex justify-between w-full p-4 hover:bg-slate-50 rounded-t-lg">
                                <div className="flex items-center gap-2 font-medium">
                                  {(() => {
                                    return profile?.name || `${client.personalInfo?.firstName || ''} ${client.personalInfo?.lastName || ''}`.trim() || 'Cliente sin nombre';
                                  })()}
                                </div>
                                <Badge variant="outline">
                                  {clientAchievements.length} logro{clientAchievements.length !== 1 ? 's' : ''}
                                </Badge>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="p-4 pt-0 border-t">
                                <div className="grid gap-3 mt-3">
                                  {clientAchievements.map(achievement => (
                                    <AchievementCard 
                                      key={achievement.id}
                                      achievement={achievement}
                                      compact
                                    />
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        {showOnlyFood 
                          ? "No hay logros de alimentación registrados" 
                          : "No hay logros registrados"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo unificado para agregar usuarios */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete los datos para agregar un nuevo usuario al sistema.
            </DialogDescription>
          </DialogHeader>
          <AddUserForm onClose={() => setIsAddUserOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pacientes;
