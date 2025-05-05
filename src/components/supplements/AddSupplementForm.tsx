import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImagePlus } from "lucide-react";
import { useData } from "@/context/DataContext";
import { supabase } from "@/lib/supabase";
import { Supplement } from "@/types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";

const supplementSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional(),
  category: z.string().optional(),
  instructions: z.string().optional(),
});

type SupplementFormData = z.infer<typeof supplementSchema>;

interface AddSupplementFormProps {
  supplement?: Supplement;
}

export default function AddSupplementForm({ supplement }: AddSupplementFormProps) {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isEditing = !!supplement;
  const { supplements, setSupplements } = useData();

  const form = useForm<SupplementFormData>({
    resolver: zodResolver(supplementSchema),
    defaultValues: {
      name: supplement?.name || "",
      description: supplement?.description || "",
      category: supplement?.category || "",
      instructions: supplement?.instructions || "",
    },
  });

  useEffect(() => {
    if (supplement?.image_url) {
      setImage(supplement.image_url);
    }
  }, [supplement]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `supplement-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('supplement-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('supplement-images')
        .getPublicUrl(filePath, {
          download: false
        });

      const imageUrl = publicUrl.replace('?download=false', '');
      setImage(imageUrl);
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: SupplementFormData) => {
    try {
      const supplementData = {
        name: data.name,
        description: data.description,
        category: data.category,
        instructions: data.instructions,
        image_url: image || null,
        benefits: data.description ? [data.description] : [],
        updated_at: new Date().toISOString()
      };

      if (isEditing && supplement) {
        const { error } = await supabase
          .from('supplements')
          .update(supplementData)
          .eq('id', supplement.id);

        if (error) throw error;
        
        const updatedSupplements = supplements.map(s => 
          s.id === supplement.id ? { ...s, ...supplementData } : s
        );
        setSupplements(updatedSupplements);
        
        toast.success("Suplemento actualizado correctamente");
      } else {
        const { data: newSupplement, error } = await supabase
          .from('supplements')
          .insert(supplementData)
          .select()
          .single();

        if (error) throw error;
        
        setSupplements([...supplements, newSupplement]);
        
        toast.success("Suplemento creado correctamente");
      }
      
      navigate("/suplementos");
    } catch (error) {
      console.error("Error al guardar el suplemento:", error);
      toast.error("Error al guardar el suplemento");
    }
  };

  const handleCancel = () => {
    navigate("/suplementos");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Suplemento" : "Información del Suplemento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Suplemento<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Proteína Whey" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el suplemento y sus beneficios" 
                      className="min-h-32"
                      {...field} 
                    />
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
                  <FormControl>
                    <Input placeholder="Ej: Proteína, Vitamina, Mineral" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones de uso</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instrucciones para consumir el suplemento" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Foto del Suplemento</FormLabel>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2">
                {image ? (
                  <div className="relative w-40 h-40">
                    <img 
                      src={image} 
                      alt="Vista previa del suplemento" 
                      className="w-full h-full object-cover rounded-md" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2" 
                      onClick={() => setImage(null)}
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra y suelta tus archivos o Examina
                    </p>
                    <label 
                      htmlFor="supplement-image" 
                      className="text-primary hover:underline cursor-pointer text-sm"
                    >
                      Examinar
                    </label>
                    <input
                      id="supplement-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isUploading}>
                {isEditing ? "Guardar cambios" : "Crear"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
