
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { UserPlus, Search, FilterX } from "lucide-react";
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
import { UserList } from "@/components/users/UserList";
import { AddUserForm } from "@/components/users/AddUserForm";
import { toast } from "@/lib/toast";

const GestionUsuariosPage = () => {
  const { currentUser } = useAuth();
  const { users } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("nutritionist");

  // Solo los administradores pueden acceder a esta página
  if (!currentUser || currentUser.role !== "admin") {
    toast.error("No tienes permisos para acceder a esta página");
    return <Navigate to="/dashboard" replace />;
  }

  const nutritionists = users.filter(user => user.role === "nutritionist");
  const trainers = users.filter(user => user.role === "trainer");

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

      <Tabs defaultValue="nutritionist" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="nutritionist">Nutricionistas</TabsTrigger>
          <TabsTrigger value="trainer">Entrenadores</TabsTrigger>
        </TabsList>
        <TabsContent value="nutritionist">
          <Card>
            <CardHeader>
              <CardTitle>Nutricionistas</CardTitle>
              <CardDescription>
                Listado de todos los nutricionistas registrados en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList users={filteredNutritionists} specialty={true} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trainer">
          <Card>
            <CardHeader>
              <CardTitle>Entrenadores</CardTitle>
              <CardDescription>
                Listado de todos los entrenadores registrados en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList users={filteredTrainers} specialty={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

export default GestionUsuariosPage;
