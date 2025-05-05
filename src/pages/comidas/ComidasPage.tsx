import React, { useState, useEffect } from "react";
import { Food } from "@/types";
import { Plus, Search, FilterX, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { AddFoodForm } from "@/components/food/AddFoodForm";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFoods } from "@/hooks/useFoods";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";

const ComidasPage = () => {
  const { loading, error, getAllFoods, deleteFood } = useFoods();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);

  const isNutritionist = currentUser?.role === "nutritionist";

  useEffect(() => {
    const loadFoods = async () => {
      const data = await getAllFoods();
      setFoods(data);
    };
    loadFoods();
  }, [getAllFoods]);

  const filteredFoods = foods.filter((food) => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFood = () => {
    setSelectedFood(null);
    setIsAddFoodOpen(true);
  };

  const handleEditFood = (food: Food) => {
    setSelectedFood(food);
    setIsAddFoodOpen(true);
  };

  const handleDeleteFood = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta comida?")) {
      const success = await deleteFood(id);
      if (success) {
        const updatedFoods = await getAllFoods();
        setFoods(updatedFoods);
        toast.success('Alimento eliminado exitosamente');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleCloseDialog = () => {
    setIsAddFoodOpen(false);
    setSelectedFood(null);
    const loadFoods = async () => {
      const data = await getAllFoods();
      setFoods(data);
    };
    loadFoods();
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Alimentos</h1>
        {isNutritionist && (
          <Button onClick={handleAddFood}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Alimento
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
            placeholder="Buscar alimentos..."
          value={searchTerm}
          onChange={handleSearchChange}
            className="pl-8"
        />
        </div>
        {searchTerm && (
          <Button variant="outline" onClick={clearSearch}>
            <FilterX className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map((food) => (
          <Card key={food.id} className="overflow-hidden">
                <div className="relative h-48">
                  {food.image_url ? (
                    <div className="w-full h-full">
                <img 
                        src={food.image_url}
                  alt={food.name} 
                  className="w-full h-full object-cover"
                />
              </div>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <img
                        src="/images/b2500693-c261-4fb7-9105-1420fc4b4664.png"
                        alt="Logo Sistema de Nutrición"
                        className="w-24 h-24 object-contain"
                      />
                    </div>
            )}
                </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{food.name}</CardTitle>
                  <CardDescription>{food.category}</CardDescription>
                </div>
                    <Badge variant="outline">
                      {food.calories} kcal
                    </Badge>
              </div>
            </CardHeader>
            <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Proteínas:</span>
                      <span className="font-medium">{food.protein}g</span>
                </div>
                    <div className="flex justify-between text-sm">
                      <span>Carbohidratos:</span>
                      <span className="font-medium">{food.carbs}g</span>
                </div>
                    <div className="flex justify-between text-sm">
                      <span>Grasas:</span>
                      <span className="font-medium">{food.fat}g</span>
                </div>
                    {food.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {food.description}
                      </p>
                    )}
                </div>
            </CardContent>
            {isNutritionist && (
                  <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditFood(food)}
                >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteFood(food.id)}
                >
                      <Trash className="h-4 w-4 mr-2" />
                      Eliminar
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
        </ScrollArea>
      )}

      <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedFood ? "Editar Alimento" : "Agregar Nuevo Alimento"}
            </DialogTitle>
            <DialogDescription>
              {selectedFood 
                ? "Modifica los detalles del alimento seleccionado"
                : "Completa los detalles del nuevo alimento"}
            </DialogDescription>
          </DialogHeader>
            <AddFoodForm 
              food={selectedFood} 
            onClose={handleCloseDialog}
            setFoods={setFoods}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComidasPage;
