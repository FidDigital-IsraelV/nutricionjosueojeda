import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, PlusCircle, FileUp, Search, FilterX } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

interface Guide {
  id: string;
  title: string;
  description: string;
  file_path: string;
  author_id: string;
  file_size: string;
  download_count: number;
  created_at: string;
  author_name?: string;
}

const GuiasPage = () => {
  const { currentUser } = useAuth();
  const [isAddGuideOpen, setIsAddGuideOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newGuide, setNewGuide] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });
  
  const [isUploading, setIsUploading] = useState(false);

  const isNutritionist = currentUser?.role === "nutritionist";
  const isTrainer = currentUser?.role === "trainer";
  const canCreateGuide = isNutritionist || isTrainer;

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select(`
          *,
          profiles:author_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGuides = data.map(guide => ({
        ...guide,
        author_name: `${guide.profiles?.first_name} ${guide.profiles?.last_name}`
      }));

      setGuides(formattedGuides);
    } catch (error) {
      console.error('Error al cargar guías:', error);
      toast.error('Error al cargar las guías');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm("");
  };
  
  const handleGuideChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGuide(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.type !== "application/pdf") {
        toast.error("Solo se permiten archivos PDF");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande. Máximo 10MB");
        return;
      }
      
      setNewGuide(prev => ({ ...prev, file }));
    }
  };
  
  const handleAddGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGuide.title || !newGuide.description || !newGuide.file) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    
    if (!currentUser) {
      toast.error("Debes iniciar sesión para realizar esta acción");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Subir el archivo a Supabase Storage
      const fileExt = newGuide.file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `guides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(filePath, newGuide.file);

      if (uploadError) throw uploadError;

      // Obtener la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('guides')
        .getPublicUrl(filePath);

      // Crear la guía en la base de datos
      const { error: insertError } = await supabase
        .from('guides')
        .insert({
          title: newGuide.title,
          description: newGuide.description,
          file_path: publicUrl,
          author_id: currentUser.id,
          file_size: formatFileSize(newGuide.file.size),
        });

      if (insertError) throw insertError;

      // Resetear el formulario
      setNewGuide({
        title: "",
        description: "",
        file: null
      });
      
      // Cerrar el diálogo
      setIsAddGuideOpen(false);
      
      // Mostrar mensaje de éxito
      toast.success("Guía creada con éxito");
      
      // Recargar las guías
      await loadGuides();
      
    } catch (error) {
      console.error("Error al crear la guía:", error);
      toast.error("Error al crear la guía");
    } finally {
      setIsUploading(false);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
  
  const handleDownload = async (guide: Guide) => {
    try {
      // Actualizar el contador de descargas
      const { error } = await supabase
        .from('guides')
        .update({ download_count: guide.download_count + 1 })
        .eq('id', guide.id);

      if (error) throw error;

      // Actualizar el estado local
      setGuides(prev => 
        prev.map(g => 
          g.id === guide.id 
            ? { ...g, download_count: g.download_count + 1 } 
            : g
        )
      );

      // Descargar el archivo
      window.open(guide.file_path, '_blank');
      toast.success(`Descargando ${guide.title}...`);
    } catch (error) {
      console.error('Error al actualizar el contador de descargas:', error);
      toast.error('Error al descargar la guía');
    }
  };
  
  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (guide.author_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="container mx-auto p-4">Cargando guías...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold">Guías Nutricionales</h1>
          <p className="text-muted-foreground">Repositorio de guías para pacientes</p>
        </div>
        {canCreateGuide && (
          <Dialog open={isAddGuideOpen} onOpenChange={setIsAddGuideOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} /> Crear Guía
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Guía</DialogTitle>
                <DialogDescription>
                  Sube una guía en formato PDF para compartir con tus pacientes.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGuide} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la Guía</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newGuide.title}
                    onChange={handleGuideChange}
                    placeholder="Ej: Guía de alimentación saludable"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newGuide.description}
                    onChange={handleGuideChange}
                    placeholder="Breve descripción de la guía..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Archivo PDF</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    {newGuide.file ? (
                      <div className="flex flex-col items-center">
                        <FileText size={32} className="text-red-500 mb-2" />
                        <span className="text-sm font-medium">{newGuide.file.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(newGuide.file.size)}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setNewGuide(prev => ({ ...prev, file: null }))}
                        >
                          Cambiar archivo
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileUp size={24} className="text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Arrastra y suelta tu archivo PDF aquí, o
                        </p>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-primary hover:underline">selecciona un archivo</span>
                          <input
                            id="file-upload"
                            name="file"
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={handleFileChange}
                            required
                          />
                        </label>
                        <p className="text-xs text-muted-foreground mt-2">
                          Solo archivos PDF (máx. 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Subiendo..." : "Publicar Guía"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Buscar guías..."
          value={searchTerm}
          onChange={handleSearchChange}
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

      <div className="grid gap-4">
        {filteredGuides.length > 0 ? (
          filteredGuides.map(guide => (
            <Card key={guide.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText size={20} className="text-primary" />
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Por {guide.author_name} · {formatDate(guide.created_at)}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FileText size={14} />
                    {guide.file_size}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm">{guide.description}</p>
              </CardContent>
              <Separator />
              <CardFooter className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {guide.download_count} descargas
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(guide)}
                >
                  Descargar
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron guías</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuiasPage;
