import React, { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash, Pill } from "lucide-react";
import { useData } from "@/context/DataContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface SupplementSelectorProps {
  control: any;
  fieldName: string;
}

interface Supplement {
  id: string;
  name: string;
  description: string;
  category: string;
  instructions: string;
  image_url: string;
  benefits: string[];
}

export const SupplementSelector = ({ control, fieldName }: SupplementSelectorProps) => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        const { data, error } = await supabase
          .from('supplements')
          .select('*')
          .order('name');

        if (error) throw error;
        setSupplements(data || []);
      } catch (error) {
        console.error('Error al cargar suplementos:', error);
      }
    };

    fetchSupplements();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Suplementos Recomendados</FormLabel>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => append({ supplementId: "", dosage: "" })}
        >
          <Plus className="h-4 w-4 mr-2" /> Añadir Suplemento
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-center text-muted-foreground py-2">
          No hay suplementos agregados
        </p>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => remove(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>

          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${fieldName}.${index}.supplementId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suplemento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar suplemento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supplements.map((supplement) => (
                        <SelectItem key={supplement.id} value={supplement.id}>
                          <div className="flex items-center">
                            <Pill className="mr-2 h-4 w-4" />
                            {supplement.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${fieldName}.${index}.dosage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosificación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 1 cápsula al día" {...field} />
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
