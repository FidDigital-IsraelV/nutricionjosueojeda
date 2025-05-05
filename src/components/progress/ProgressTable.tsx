
import React from "react";
import { ProgressRecord } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressTableProps {
  records: ProgressRecord[];
}

const ProgressTable = ({ records }: ProgressTableProps) => {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de registros</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No hay registros de progreso disponibles.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Peso (kg)</TableHead>
                <TableHead>Cintura (cm)</TableHead>
                <TableHead>Cadera (cm)</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{record.weight || "-"}</TableCell>
                  <TableCell>{record.measurements?.waist || "-"}</TableCell>
                  <TableCell>{record.measurements?.hips || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {record.notes || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressTable;
