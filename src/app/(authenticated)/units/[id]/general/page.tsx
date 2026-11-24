"use client";

import { Factory } from "@phosphor-icons/react";

import { useUnit } from "@/contexts/UnitContext";

import Card from "@/components/ui/Card/Card";
import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { UnitTypeLabel } from "@/constants/enums/units/unit-type.enum";
import {
  UnitStatusLabel,
  UnitStatusColor,
} from "@/constants/enums/units/unit-status.enum";
import AddressCard from "@/components/ui/AddressCard/AddressCard";
import UnitConnectivityCard from "@/features/units/components/UnitConnectivityCard/UnitConnectivityCard";
import UnitConnectivityDrawer from "@/features/units/components/UnitConnectivityDrawer/UnitConnectivityDrawer";
import { UnitConnectivity } from "@/services/api/unit-connectivities/unit-connectivities.types";
import { unitConnectivitiesApi } from "@/services/api/unit-connectivities/unit-connectivities.api";
import { UnitConnectivityFormData } from "@/features/units/schemas/unit-connectivity-form.schema";
import {
  getUnitConnectivityErrorMessage,
  toUnitConnectivityPayload,
} from "@/features/units/unit-connectivity";
import { useQueryClient } from "@tanstack/react-query";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";

export default function UnitGeneralPage() {
  const { unit } = useUnit();

  const address = unit.address;
  const queryClient = useQueryClient();
  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();

  async function refreshConnectivities() {
    await queryClient.invalidateQueries({
      queryKey: ["unit-connectivities", unit.id],
    });
  }

  function handleCreateConnectivity() {
    openDrawer(
      <UnitConnectivityDrawer
        open
        mode="create"
        onClose={closeDrawer}
        onSubmit={async (data) => {
          await unitConnectivitiesApi.create({
            unitId: unit.id,
            ...toUnitConnectivityPayload(data),
          });

          await refreshConnectivities();
          closeDrawer();
          toast.success("A conexão foi cadastrada com sucesso.", {
            title: "Conexão cadastrada!",
          });
        }}
      />
    );
  }

  function handleEditConnectivity(connectivity: UnitConnectivity) {
    openDrawer(
      <UnitConnectivityDrawer
        open
        mode="edit"
        connectivity={connectivity}
        onClose={closeDrawer}
        onSubmit={async (data: UnitConnectivityFormData) => {
          await unitConnectivitiesApi.update(
            connectivity.id,
            toUnitConnectivityPayload(data),
          );

          await refreshConnectivities();
          closeDrawer();
          toast.success("A conexão foi atualizada com sucesso.", {
            title: "Conexão atualizada!",
          });
        }}
      />
    );
  }

  async function handleInactivateConnectivity(connectivity: UnitConnectivity) {
    try {
      await unitConnectivitiesApi.delete(connectivity.id);
      await refreshConnectivities();
      toast.success(
        "A conexão foi inativada e não aparece mais na lista.",
        { title: "Conexão inativada!" },
      );
    } catch (error) {
      toast.error(getUnitConnectivityErrorMessage(error), {
        title: "Erro ao inativar conexão",
      });
      throw error;
    }
  }

  return (
    <InfoCardGrid>
      <Card title="Informações da unidade" icon={<Factory size={20} />}>
        <InfoField label="Nome" value={unit.name} />
        <InfoField label="Empresa" value={unit.company.tradeName} />
        <InfoField
          label="Tipo de unidade"
          value={
            UnitTypeLabel[unit.type as keyof typeof UnitTypeLabel] ?? unit.type
          }
        />
        <InfoField
          label="Status"
          value={
            <StatusBadge
              label={UnitStatusLabel[unit.status]}
              color={UnitStatusColor(unit.status) as "green" | "red"}
            />
          }
        />{" "}
      </Card>

      <UnitConnectivityCard
        unitId={unit.id}
        onCreate={handleCreateConnectivity}
        onEdit={handleEditConnectivity}
        onInactivate={handleInactivateConnectivity}
      />

      <AddressCard
        title="Localização"
        address={address}
        latitude={address?.latitude}
        longitude={address?.longitude}
        locationName={unit.name}
      />
    </InfoCardGrid>
  );
}
