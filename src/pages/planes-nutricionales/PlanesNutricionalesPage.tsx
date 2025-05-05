import React, { useState, useEffect } from "react";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { NutritionPlan } from "@/types";
import NutritionPlanList from "@/components/nutrition/NutritionPlanList";
import NutritionPlanForm from "@/components/nutrition/NutritionPlanForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PlanesNutricionalesPage = () => {
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    loading,
    error,
    getAllNutritionPlans,
    addNutritionPlan,
    deleteNutritionPlan
  } = useNutritionPlans();

  useEffect(() => {
    loadNutritionPlans();
  }, []);

  const loadNutritionPlans = async () => {
    const plans = await getAllNutritionPlans();
    setNutritionPlans(plans);
  };

  const handleAddPlan = () => {
    setIsDialogOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este plan nutricional?');
    if (confirmed) {
      const success = await deleteNutritionPlan(id);
      if (success) {
        const updatedPlans = nutritionPlans.filter(plan => plan.id !== id);
        setNutritionPlans(updatedPlans);
    }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    loadNutritionPlans();
  };

  const handleSubmit = async (plan: Omit<NutritionPlan, 'id'>) => {
    try {
      await addNutritionPlan(plan);
      handleCloseDialog();
    } catch (error) {
      toast.error('Error al guardar el plan nutricional');
    }
  };

  const filteredPlans = nutritionPlans.filter(plan => {
    const clientName = `${plan.clientId}`.toLowerCase();
    return clientName.includes(searchTerm.toLowerCase());
  });

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Planes Nutricionales</h1>
        <Button onClick={handleAddPlan}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plan
            </Button>
          </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por ID de cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <NutritionPlanList 
        plans={filteredPlans} 
        onDelete={handleDeletePlan}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Plan Nutricional</DialogTitle>
          </DialogHeader>
          <NutritionPlanForm
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanesNutricionalesPage;
