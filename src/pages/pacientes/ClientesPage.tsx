import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { User, UserRole, Client } from "@/types";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddClientForm } from "@/components/clients/AddClientForm";
import { UserList } from "@/components/users/UserList";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/lib/toast";

const ClientesPage = () => {
  const { clients, refreshClients } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  // Transform clients into the format expected by UserList
  const clientUsers = clients.map((client) => ({
    id: client.id,
    name: client.name || `${client.name}`,
    email: client.email || "client@example.com",
    role: "client" as UserRole,
    avatar: "/placeholder.svg"
  }));

  const filteredClients = clientUsers.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    setIsAddClientOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleCloseDialog = () => {
    setIsAddClientOpen(false);
    // Actualizar la lista de clientes después de cerrar el diálogo
    refreshClients();
  };

  // Verificar si el usuario tiene permisos para crear pacientes
  const canCreateClient = currentUser && (
    currentUser.role === "admin" || 
    currentUser.role === "nutritionist" || 
    currentUser.role === "trainer"
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Pacientes</h1>
        {canCreateClient && (
          <Button onClick={handleAddClient} className="flex items-center gap-2">
            <UserPlus size={16} /> Agregar Paciente
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Buscar pacientes..."
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

      <Card>
        <CardHeader>
          <CardTitle>Pacientes</CardTitle>
          <CardDescription>
            Listado de todos los pacientes registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserList users={filteredClients} />
        </CardContent>
      </Card>

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
            <DialogDescription>
              Complete los datos para agregar un nuevo paciente al sistema.
            </DialogDescription>
          </DialogHeader>
          <AddClientForm onClose={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientesPage;
