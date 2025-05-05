
import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useData } from "@/context/DataContext";

import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import AddSupplementForm from "@/components/supplements/AddSupplementForm";
import SupplementList from "@/components/supplements/SupplementList";

export default function SuplementosPage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getSupplementById } = useData();
  
  // Determinar el modo basado en la URL actual
  const isCreate = location.pathname === "/suplementos/crear";
  const isView = params.id ? true : false;
  const mode = isCreate ? "create" : isView ? "view" : "list";
  
  const selectedSupplement = params.id ? getSupplementById(params.id) : undefined;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/suplementos">Suplementos</BreadcrumbLink>
            </BreadcrumbItem>
            {mode === "create" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/suplementos/crear">Crear</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {mode === "view" && selectedSupplement && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/suplementos/${selectedSupplement.id}`}>
                    {selectedSupplement.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </Breadcrumb>
          <h1 className="text-3xl font-bold mt-2">
            {mode === "create"
              ? "Crear Suplemento"
              : mode === "view" && selectedSupplement
              ? `Editar ${selectedSupplement.name}`
              : "Suplementos"}
          </h1>
        </div>
        
        {mode === "list" ? (
          <Button onClick={() => navigate("/suplementos/crear")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Suplemento
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate("/suplementos")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
          </Button>
        )}
      </div>

      {mode === "create" && <AddSupplementForm />}
      {mode === "view" && selectedSupplement && <AddSupplementForm supplement={selectedSupplement} />}
      {mode === "list" && <SupplementList />}
    </div>
  );
}
