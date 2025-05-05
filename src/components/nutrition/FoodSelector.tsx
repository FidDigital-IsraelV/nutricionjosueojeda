import React, { useState, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFoods } from "@/hooks/useFoods";
import { Food } from "@/types";
import { AddFoodForm } from "@/components/food/AddFoodForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FoodSelectorProps {
  control: any;
  fieldName: string;
}

export const FoodSelector = ({ control, fieldName }: FoodSelectorProps) => {
  const [selectedFoodId, setSelectedFoodId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const { loading, error, getAllFoods } = useFoods();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  useEffect(() => {
    const loadFoods = async () => {
      const data = await getAllFoods();
      setFoods(data);
    };
    loadFoods();
  }, [getAllFoods]);
  
  const handleAddFood = () => {
    if (selectedFoodId) {
      append({
        foodId: selectedFoodId,
        quantity: quantity
      });
      setSelectedFoodId("");
      setQuantity(1);
      setIsDialogOpen(false);
    }
  };
  
  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getSelectedFoods = () => {
    return fields.map((field: any) => {
      const food = foods.find(f => f.id === field.foodId);
      return {
        ...field,
        food
      };
    });
  };

  if (error) {
    return (
      <div className="text-red-500">
        Error al cargar los alimentos: {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Alimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Alimento</DialogTitle>
            </DialogHeader>
            <AddFoodForm
              food={null}
              onClose={() => setIsDialogOpen(false)}
              setFoods={setFoods}
            />
          </DialogContent>
        </Dialog>
              </div>
              
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
              <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {filteredFoods.map((food) => (
                    <Card 
                      key={food.id} 
                className={`cursor-pointer transition-colors ${
                  selectedFoodId === food.id ? "bg-accent" : ""
                }`}
                      onClick={() => setSelectedFoodId(food.id)}
                    >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={food.image_url || undefined} alt={food.name} />
                      <AvatarFallback>
                        {food.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{food.name}</p>
                      <p className="text-sm text-muted-foreground">{food.category}</p>
                          </div>
                    <Badge variant="outline">
                              {food.calories} kcal
                            </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
      )}
              
              {selectedFoodId && (
        <div className="flex gap-2">
                      <Input 
                        type="number" 
            min="1"
                        value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24"
                      />
          <Button onClick={handleAddFood}>
                    Agregar
                  </Button>
                </div>
              )}

      {fields.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Alimentos seleccionados:</h4>
          {getSelectedFoods().map((field: any, index) => (
            <Card key={field.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={field.food?.image || undefined} alt={field.food?.name} />
                    <AvatarFallback>
                      {field.food?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{field.food?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {field.quantity} {field.food?.servingUnit}
                    </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
    </div>
  );
};
