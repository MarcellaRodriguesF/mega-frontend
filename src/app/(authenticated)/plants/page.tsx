"use client";

import { useCallback, useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";

import UnitList from "@/features/units/components/UnitList/UnitList";

import { useToast } from "@/contexts/ToastContext";
import { unitsApi } from "@/services/api/units/units.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { Unit } from "@/services/api/units/units.types";

export default function PlantsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const loadUnits = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await unitsApi.findAll();
      setUnits(response.data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? getApiErrorMessage(err.code, err.message)
          : "Não foi possível carregar as usinas.";

      toast.error(message, {
        title: "Erro ao carregar usinas",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  return (
    <PageContainer>
      <PageHeader
        title="Usinas"
        description="Gerencie as usinas e unidades vinculadas às empresas."
        action={
          <Button
            text="Nova usina"
            onClick={() => {
              // Vamos conectar o formulário nesta próxima etapa.
            }}
          />
        }
      />

      <UnitList units={units} isLoading={isLoading} />
    </PageContainer>
  );
}
