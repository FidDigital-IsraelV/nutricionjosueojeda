import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Edit, Trash2, Eye, Scale, ArrowUpDown,
  ChevronDown, ChevronUp, Search, FilterX
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { BodyMeasurement, Client, Profile } from "@/types";
import { toast } from "@/lib/toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BodyMeasurementForm } from "./BodyMeasurementForm";
import BodyMeasurementView from "./BodyMeasurementView";
import { Badge } from "@/components/ui/badge";

interface BodyMeasurementListProps {
  clientId?: string;
  onAddClick?: () => void;
}

export const BodyMeasurementList: React.FC<BodyMeasurementListProps> = ({ 
  clientId,
  onAddClick 
}) => {
  const { clients, profiles } = useData();
  const { currentUser } = useAuth();
  const {
    loading,
    error,
    getAllBodyMeasurements,
    getBodyMeasurementsByClient,
    deleteBodyMeasurement
  } = useBodyMeasurements();
  
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeasurement, setSelectedMeasurement] = useState<BodyMeasurement | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'client_id' | 'weight' | 'height' | 'bmi' | 'waist';
    direction: "asc" | "desc";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setError] = useState<string | null>(null);

  // Cargar medidas al montar el componente
  useEffect(() => {
    let isMounted = true;
    
    const loadMeasurements = async () => {
      try {
        let data;
        
        if (clientId) {
          data = await getBodyMeasurementsByClient(clientId);
        } else {
          data = await getAllBodyMeasurements();
        }
        
        if (isMounted) {
          setMeasurements(data || []);
        }
      } catch (err) {
        console.error('Error al cargar medidas:', err);
        toast.error('Error al cargar las medidas corporales');
      }
    };

    loadMeasurements();

    return () => {
      isMounted = false;
    };
  }, [clientId, getBodyMeasurementsByClient, getAllBodyMeasurements]);

  // Memoizar la búsqueda y ordenamiento para mejor rendimiento
  const filteredAndSortedMeasurements = useMemo(() => {
    const filtered = measurements.filter((measurement) => {
      const client = clients.find((c) => c.id === measurement.client_id);
      if (!client) return false;
      
      const profile = profiles.find(p => p.id === client.profile_id);
      if (!profile) return false;
      
      return profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             format(new Date(measurement.date), "dd/MM/yyyy").includes(searchTerm);
    });

    return [...filtered].sort((a, b) => {
      if (sortConfig) {
        const aValue = sortConfig.key === 'date' ? a.date : a.measurements[sortConfig.key];
        const bValue = sortConfig.key === 'date' ? b.date : b.measurements[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === "asc" 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [measurements, clients, searchTerm, sortConfig, profiles]);

  // Memoizar funciones de manejo de eventos
  const handleSort = useCallback((key: 'date' | 'client_id' | 'weight' | 'height' | 'bmi' | 'waist') => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  }, []);

  const handleView = useCallback((measurement: BodyMeasurement) => {
    setSelectedMeasurement(measurement);
    setIsViewOpen(true);
  }, []);

  const handleEdit = useCallback((measurement: BodyMeasurement) => {
    setSelectedMeasurement(measurement);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback((measurement: BodyMeasurement) => {
    setSelectedMeasurement(measurement);
    setIsDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (selectedMeasurement) {
      try {
        const success = await deleteBodyMeasurement(selectedMeasurement.id);
        if (success) {
          // Actualizar el estado local inmediatamente
          setMeasurements(prev => prev.filter(m => m.id !== selectedMeasurement.id));
          setIsDeleteOpen(false);
          toast.success('Medida eliminada correctamente');
        } else {
          toast.error('Error al eliminar la medida');
        }
      } catch (err) {
        console.error('Error al eliminar medida:', err);
        toast.error('Error al eliminar la medida');
      }
    }
  }, [selectedMeasurement, deleteBodyMeasurement]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Memoizar la función de obtención de nombre de cliente
  const getClientName = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      console.log('Cliente no encontrado:', clientId);
      return "Cliente desconocido";
    }
    
    const profile = profiles.find(p => p.id === client.profile_id);
    if (!profile) {
      console.log('Perfil no encontrado para el cliente:', client.profile_id);
      return client.personalInfo?.firstName || "Cliente desconocido";
    }
    
    return profile.name || client.personalInfo?.firstName || "Cliente desconocido";
  }, [clients, profiles]);

  // Function to determine badge variant
  const getBmiBadgeVariant = (bmi: number) => {
    if (bmi < 18.5) return "outline";
    if (bmi < 25) return "default";
    if (bmi < 30) return "secondary";
    return "destructive";
  };

  // Función para calcular el IMC
  const calculateBMI = (weight: number, height: number): number => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100; // Convertir altura de cm a metros
    return weight / (heightInMeters * heightInMeters);
  };

  useEffect(() => {
    const loadMeasurements = async () => {
      if (!clientId) {
        console.log('No se proporcionó ID de cliente');
        return;
      }

      try {
        setIsLoading(true);
        console.log('Cargando medidas para cliente:', clientId);
        
        const measurements = await getBodyMeasurementsByClient(clientId);
        console.log('Medidas cargadas:', measurements);
        
        setMeasurements(measurements);
      } catch (error) {
        console.error('Error al cargar medidas:', error);
        setError('Error al cargar las medidas corporales');
      } finally {
        setIsLoading(false);
      }
    };

    loadMeasurements();
  }, [clientId, getBodyMeasurementsByClient]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando medidas...</span>
      </div>
    );
  }

  if (error || errorMessage) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error || errorMessage}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!measurements.length) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">No hay medidas registradas para este cliente.</p>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Agregar primera medida
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Buscar medidas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
      
      {/* Tabla de medidas */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {!clientId && (
                    <TableHead className="w-[150px]">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("client_id")}
                      >
                        Paciente
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                  )}
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Fecha
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("weight")}
                    >
                      Peso (kg)
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("height")}
                    >
                      Altura (cm)
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("bmi")}
                    >
                      IMC
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("waist")}
                    >
                      Cintura (cm)
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedMeasurements.map((measurement) => {
                  const bmi = measurement.measurements.bmi || 
                             calculateBMI(measurement.measurements.weight, measurement.measurements.height);
                  return (
                    <TableRow key={measurement.id}>
                      {!clientId && (
                        <TableCell>{getClientName(measurement.client_id)}</TableCell>
                      )}
                      <TableCell>
                        {format(new Date(measurement.date), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>{measurement.measurements.weight}</TableCell>
                      <TableCell>{measurement.measurements.height}</TableCell>
                      <TableCell>
                        <Badge variant={getBmiBadgeVariant(bmi)}>
                          {bmi.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>{measurement.measurements.waist || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(measurement)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(measurement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(measurement)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal para ver medida */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Medida Corporal</DialogTitle>
            <DialogDescription>
              Información detallada de la medida corporal registrada.
            </DialogDescription>
          </DialogHeader>
          {selectedMeasurement && (
            <BodyMeasurementView 
              measurement={selectedMeasurement} 
              onClose={() => setIsViewOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal para editar medida */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Medida Corporal</DialogTitle>
            <DialogDescription>
              Modifique los datos de la medida corporal.
            </DialogDescription>
          </DialogHeader>
          {selectedMeasurement && (
            <BodyMeasurementForm 
              initialData={selectedMeasurement} 
              onClose={() => setIsEditOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la medida corporal registrada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
