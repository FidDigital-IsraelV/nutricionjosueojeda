import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Food } from "@/types";
import { useFoods } from "@/hooks/useFoods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, Trash, Upload } from "lucide-react";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

// Schema for form validation
const foodFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  category: z.string().min(1, { message: "La categoría es obligatoria" }),
  description: z.string().optional(),
  calories: z.coerce.number().min(0, { message: "Ingrese un valor válido" }),
  protein: z.coerce.number().min(0, { message: "Ingrese un valor válido" }),
  carbs: z.coerce.number().min(0, { message: "Ingrese un valor válido" }),
  fat: z.coerce.number().min(0, { message: "Ingrese un valor válido" }),
  fiber: z.coerce.number().min(0, { message: "Ingrese un valor válido" }).optional(),
  sugar: z.coerce.number().min(0, { message: "Ingrese un valor válido" }).optional(),
  sodium: z.coerce.number().min(0, { message: "Ingrese un valor válido" }).optional(),
  servingSize: z.coerce.number().min(0, { message: "Ingrese un valor válido" }),
  servingUnit: z.string().min(1, { message: "La unidad de porción es obligatoria" }),
});

type FoodFormValues = z.infer<typeof foodFormSchema>;

interface AddFoodFormProps {
  food: Food | null;
  onClose: () => void;
  setFoods: (foods: Food[]) => void;
}

const FOOD_CATEGORIES = [
  "Proteínas",
  "Carbohidratos",
  "Frutas",
  "Verduras",
  "Lácteos",
  "Grasas saludables",
  "Bebidas",
  "Snacks",
  "Preparados"
];

const FOOD_RESTRICTIONS = [
  { id: "vegetariano", label: "Vegetariano" },
  { id: "vegano", label: "Vegano" },
  { id: "sinGluten", label: "Sin Gluten" },
  { id: "sinLactosa", label: "Sin Lactosa" },
];

export const AddFoodForm = ({ food, onClose, setFoods }: AddFoodFormProps) => {
  const { addFood, updateFood, getAllFoods } = useFoods();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(food?.image_url || null);
  const [formData, setFormData] = useState<Omit<Food, "id">>({
    name: food?.name || "",
    category: food?.category || "",
    calories: food?.calories || 0,
    protein: food?.protein || 0,
    carbs: food?.carbs || 0,
    fat: food?.fat || 0,
    fiber: food?.fiber || 0,
    sugar: food?.sugar || 0,
    sodium: food?.sodium || 0,
    description: food?.description || "",
    ingredients: food?.ingredients || [],
    preparations: food?.preparations || [],
    restrictions: food?.restrictions || [],
    image_url: food?.image_url || "",
    servingSize: food?.servingSize || 100,
    servingUnit: food?.servingUnit || "g"
  });

  const [ingredients, setIngredients] = useState<{ name: string; amount: string }[]>(
    Array.isArray(food?.ingredients) ? food.ingredients : []
  );
  const [preparations, setPreparations] = useState<{ step: string }[]>(
    Array.isArray(food?.preparations) ? food.preparations : []
  );
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    Array.isArray(food?.restrictions) ? food.restrictions : []
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      name: food?.name || "",
      category: food?.category || "",
      description: food?.description || "",
      calories: food?.calories || 0,
      protein: food?.protein || 0,
      carbs: food?.carbs || 0,
      fat: food?.fat || 0,
      fiber: food?.fiber || 0,
      sugar: food?.sugar || 0,
      sodium: food?.sodium || 0,
      servingSize: food?.servingSize || 100,
      servingUnit: food?.servingUnit || "g",
    },
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `food-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('food-images')
          .getPublicUrl(filePath);

        setImagePreview(publicUrl);
      setImageFile(file);
        toast.success("Imagen subida correctamente");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error al subir la imagen");
      }
    }
  };

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(
      selectedRestrictions.includes(restriction)
        ? selectedRestrictions.filter(r => r !== restriction)
        : [...selectedRestrictions, restriction]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formValues = form.getValues();
      const foodData: Omit<Food, "id"> = {
        name: formValues.name,
        category: formValues.category,
        calories: formValues.calories,
        protein: formValues.protein,
        carbs: formValues.carbs,
        fat: formValues.fat,
        fiber: formValues.fiber,
        sugar: formValues.sugar,
        sodium: formValues.sodium,
        servingSize: formValues.servingSize,
        servingUnit: formValues.servingUnit,
        description: formValues.description || "",
        ingredients: ingredients,
        preparations: preparations,
        restrictions: selectedRestrictions,
        image_url: imagePreview || formData.image_url
      };

      let result;
      if (food) {
        result = await updateFood(food.id, foodData);
      } else {
        result = await addFood(foodData);
      }

      if (!result) {
        throw new Error('No se pudo guardar el alimento');
      }

      // Actualizar la lista de alimentos
      const updatedFoods = await getAllFoods();
      setFoods(updatedFoods);

      toast.success(food ? 'Alimento actualizado exitosamente' : 'Alimento creado exitosamente');
      onClose();
    } catch (error) {
      console.error("Error al guardar el alimento:", error);
      toast.error('Error al guardar el alimento');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre</FormLabel>
                  <FormControl>
                  <Input placeholder="Nombre del alimento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FOOD_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                  placeholder="Descripción del alimento"
                  className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Calorías</FormLabel>
                  <FormControl>
                  <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="protein"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Proteínas (g)</FormLabel>
                  <FormControl>
                  <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carbs"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Carbohidratos (g)</FormLabel>
                  <FormControl>
                  <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fat"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Grasas (g)</FormLabel>
                  <FormControl>
                  <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="fiber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fibra (g)</FormLabel>
                  <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sugar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Azúcar (g)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sodium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sodio (mg)</FormLabel>
                  <FormControl>
                  <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="servingSize"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Tamaño de la porción</FormLabel>
                  <FormControl>
                  <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servingUnit"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Unidad de medida</FormLabel>
                    <FormControl>
                  <Input placeholder="g, ml, etc." {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="space-y-4">
            <div>
            <Label>Imagen</Label>
            <div className="mt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
                <Button
                  type="button"
                  variant="outline"
                onClick={handleImageClick}
                className="w-full"
                >
                <Upload className="h-4 w-4 mr-2" />
                {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                </Button>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
              </div>

          <div className="space-y-2">
            <Label>Ingredientes</Label>
                <div className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                      <Input
                    placeholder="Nombre del ingrediente"
                        value={ingredient.name}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = { ...newIngredients[index], name: e.target.value };
                      setIngredients(newIngredients);
                    }}
                      />
                      <Input
                        placeholder="Cantidad"
                        value={ingredient.amount}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index] = { ...newIngredients[index], amount: e.target.value };
                      setIngredients(newIngredients);
                    }}
                      />
                      <Button
                        type="button"
                    variant="outline"
                        size="icon"
                    onClick={() => {
                      const newIngredients = ingredients.filter((_, i) => i !== index);
                      setIngredients(newIngredients);
                    }}
                      >
                    <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                <Button
                  type="button"
                  variant="outline"
                onClick={() => setIngredients([...ingredients, { name: "", amount: "" }])}
                >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ingrediente
                </Button>
            </div>
              </div>

          <div className="space-y-2">
            <Label>Preparación</Label>
                <div className="space-y-2">
              {preparations.map((preparation, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                        placeholder={`Paso ${index + 1}`}
                    value={preparation.step}
                    onChange={(e) => {
                      const newPreparations = [...preparations];
                      newPreparations[index] = { step: e.target.value };
                      setPreparations(newPreparations);
                    }}
                      />
                      <Button
                        type="button"
                    variant="outline"
                        size="icon"
                    onClick={() => {
                      const newPreparations = preparations.filter((_, i) => i !== index);
                      setPreparations(newPreparations);
                    }}
                      >
                    <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreparations([...preparations, { step: "" }])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Paso
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Restricciones</Label>
            <div className="flex flex-wrap gap-2">
              {FOOD_RESTRICTIONS.map((restriction) => (
                <div key={restriction.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={restriction.id}
                    checked={selectedRestrictions.includes(restriction.id)}
                    onCheckedChange={() => toggleRestriction(restriction.id)}
                  />
                  <Label htmlFor={restriction.id}>{restriction.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {food ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
