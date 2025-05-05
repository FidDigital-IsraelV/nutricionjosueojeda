import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserListProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    specialty?: string;
  }>;
  specialty?: boolean;
}

export const UserList = ({ users, specialty = false }: UserListProps) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'nutritionist':
        return <Badge className="bg-green-500 hover:bg-green-600">Nutricionista</Badge>;
      case 'client':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Cliente</Badge>;
      case 'trainer':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Entrenador</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            {specialty && <TableHead>Especialidad</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={specialty ? 4 : 3} className="text-center py-8 text-muted-foreground">
                No se encontraron usuarios
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                {specialty && <TableCell>{user.specialty || "-"}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
