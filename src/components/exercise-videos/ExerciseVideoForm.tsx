import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  video_url: z.string().min(5, "La URL del video es requerida"),
  thumbnail_url: z.string().optional(),
  difficulty: z.enum(["principiante", "intermedio", "avanzado"]),
  muscle_group: z.string().min(3, "El grupo muscular es requerido"),
  is_public: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ExerciseVideoFormProps {
  videoId?: string;
  onSuccess?: () => void;
}

const ExerciseVideoForm = ({ videoId, onSuccess }: ExerciseVideoFormProps) => {
  const { currentUser } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      difficulty: "principiante",
      muscle_group: "",
      is_public: true,
    },
  });

  React.useEffect(() => {
    if (videoId) {
      const fetchVideo = async () => {
        const { data, error } = await supabase
          .from('exercise_videos')
          .select('*')
          .eq('id', videoId)
          .single();

        if (error) {
          toast.error("Error al cargar el video");
          return;
        }

        if (data) {
          form.reset({
            title: data.title,
            description: data.description,
            video_url: data.video_url,
            thumbnail_url: data.thumbnail_url,
            difficulty: data.difficulty,
            muscle_group: data.muscle_group,
            is_public: data.is_public,
          });
        }
      };

      fetchVideo();
    }
  }, [videoId, form]);

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para realizar esta acción");
      return;
    }
    
    if (currentUser.role !== "nutritionist" && currentUser.role !== "trainer") {
      toast.error("No tienes permisos para realizar esta acción");
      return;
    }

    try {
      const videoData = {
        ...values,
        created_by: currentUser.id,
      };

      console.log('Intentando guardar video con datos:', videoData);

      let result;
      if (videoId) {
        result = await supabase
          .from('exercise_videos')
          .update(videoData)
          .eq('id', videoId);
      } else {
        result = await supabase
          .from('exercise_videos')
          .insert(videoData);
      }

      if (result.error) {
        console.error('Error de Supabase:', result.error);
        throw new Error(result.error.message);
      }

      console.log('Video guardado exitosamente:', result.data);
      toast.success(videoId ? "Video actualizado correctamente" : "Video creado correctamente");
      
      // Limpiar el formulario después de crear un nuevo video
      if (!videoId) {
        form.reset({
          title: "",
          description: "",
          video_url: "",
          thumbnail_url: "",
          difficulty: "principiante",
          muscle_group: "",
          is_public: true,
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al guardar el video:', error);
      toast.error(`Error al guardar el video: ${error.message}`);
    }
  };

  const muscleGroups = [
    "Piernas", "Glúteos", "Pecho", "Espalda", "Hombros", 
    "Bíceps", "Tríceps", "Abdomen", "Core", "Cuerpo completo"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre del ejercicio" />
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe el ejercicio y cómo realizarlo correctamente"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="video_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video*</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input {...field} placeholder="URL del video o seleccionar archivo" />
                    <Button type="button" variant="outline">
                      Examinar
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Arrastra y suelta tus archivos o examina
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="thumbnail_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Miniatura</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input 
                      {...field} 
                      value={field.value || ""}
                      placeholder="URL de la miniatura o seleccionar archivo" 
                    />
                    <Button type="button" variant="outline">
                      Examinar
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Arrastra y suelta tus archivos o examina
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de Dificultad*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el nivel de dificultad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="principiante">Principiante</SelectItem>
                    <SelectItem value="intermedio">Intermedio</SelectItem>
                    <SelectItem value="avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="muscle_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo Muscular*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el grupo muscular" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {muscleGroups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
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
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Público</FormLabel>
                <FormDescription>
                  Habilitar para que todos los clientes puedan ver este video
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {videoId ? "Actualizar" : "Crear"}
          </Button>
          <Button type="button" variant="outline"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExerciseVideoForm;
