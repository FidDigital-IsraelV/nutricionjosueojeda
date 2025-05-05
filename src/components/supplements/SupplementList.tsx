import React from "react";
import { useData } from "@/context/DataContext";
import { Edit, Trash2 } from "lucide-react";
import { Supplement } from "@/types";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SupplementList() {
  const { supplements, deleteSupplement } = useData();
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/suplementos/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este suplemento?")) {
      deleteSupplement(id);
    }
  };

  const handleCreateNew = () => {
    navigate("/suplementos/crear");
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay suplementos registrados
                </TableCell>
              </TableRow>
            ) : (
              supplements.map((supplement) => (
                <TableRow key={supplement.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                      {supplement.image_url ? (
                        <img
                          src={supplement.image_url}
                          alt={supplement.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{supplement.name}</TableCell>
                  <TableCell>{supplement.category || "N/A"}</TableCell>
                  <TableCell>{supplement.description || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(supplement.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(supplement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end border-t p-4">
        <Button onClick={handleCreateNew}>
          Crear Suplemento
        </Button>
      </CardFooter>
    </Card>
  );
}
