import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SimpleClient {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface ClientListProps {
  clients: SimpleClient[];
}

const ClientList = ({ clients }: ClientListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Fecha de Registro</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${client.id}`} />
                  <AvatarFallback>
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span>{client.name}</span>
              </div>
            </TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>
              {new Date(client.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="ghost" size="sm">
                <Link to={`/clientes/${client.id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientList;
