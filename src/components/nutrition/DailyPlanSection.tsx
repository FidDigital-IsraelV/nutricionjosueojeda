
import React, { useState } from "react";
import { useFieldArray, Control } from "react-hook-form";
import { 
  FormField,
  FormItem,
  FormControl, 
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";
import { FoodSelector } from "./FoodSelector";

interface DailyPlanSectionProps {
  dayIndex: number;
  control: Control<any>;
}

export const DailyPlanSection = ({ dayIndex, control }: DailyPlanSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dailyPlans.${dayIndex}.meals`,
  });

  const handleAddMeal = () => {
    append({
      type: "breakfast",
      foods: [],
      notes: ""
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Día {dayIndex + 1}</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleAddMeal}>
          <Plus className="h-4 w-4 mr-1" /> Añadir comida
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No hay comidas agregadas para este día.
        </p>
      )}

      {fields.map((field, mealIndex) => (
        <Card key={field.id} className="relative">
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
            onClick={() => remove(mealIndex)}
          >
            <Trash className="h-4 w-4" />
          </Button>

          <CardHeader>
            <FormField
              control={control}
              name={`dailyPlans.${dayIndex}.meals.${mealIndex}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comida</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo de comida" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="breakfast">Desayuno</SelectItem>
                      <SelectItem value="lunch">Almuerzo</SelectItem>
                      <SelectItem value="dinner">Cena</SelectItem>
                      <SelectItem value="snack">Merienda</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardHeader>

          <CardContent className="space-y-4">
            <FoodSelector 
              control={control} 
              fieldName={`dailyPlans.${dayIndex}.meals.${mealIndex}.foods`} 
            />
            
            <FormField
              control={control}
              name={`dailyPlans.${dayIndex}.meals.${mealIndex}.notes`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instrucciones o notas sobre esta comida..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
