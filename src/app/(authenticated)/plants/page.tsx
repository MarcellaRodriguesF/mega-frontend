"use client";

import { useCallback, useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";

import UnitList from "@/features/units/components/UnitList/UnitList";
import UnitDrawer from "@/features/units/components/UnitDrawer/UnitDrawer";

import { useToast } from "@/contexts/ToastContext";
import { useDrawer } from "@/hooks/useDrawer";

import { unitsApi } from "@/services/api/units/units.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { Unit } from "@/services/api/units/units.types";
import type { UnitFormData } from "@/features/units/schemas/unit-form.schema";

export default function PlantsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();
  const { openDrawer, closeDrawer } = useDrawer();

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

    // useEffect(() => {
    //     loadUnits();
    // }, [loadUnits]);

  async function handleCreateUnit(data: UnitFormData) {
    try {
      await unitsApi.create(data);

      closeDrawer();

      toast.success("A unidade foi cadastrada com sucesso.", {
        title: "Unidade cadastrada!",
      });

      await loadUnits();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? getApiErrorMessage(err.code, err.message)
          : "Não foi possível cadastrar a unidade. Tente novamente.";

      toast.error(message, {
        title: "Erro ao cadastrar unidade",
      });

      throw err;
    }
  }

  function handleOpenCreateDrawer() {
    openDrawer(
      <UnitDrawer open onClose={closeDrawer} onSubmit={handleCreateUnit} />
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Unidades"
        description="Gerencie as unidades vinculadas às empresas."
        action={<Button text="Nova unidade" onClick={handleOpenCreateDrawer} />}
      />
      <UnitList units={units} isLoading={isLoading} />
    </PageContainer>
  );
}
