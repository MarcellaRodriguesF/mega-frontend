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
import { useQueryClient } from "@tanstack/react-query";
import { useDrawer } from "@/hooks/useDrawer";

export default function UnitGeneralPage() {
  const { unit } = useUnit();

  const address = unit.address;
  const queryClient = useQueryClient();
  const { openDrawer, closeDrawer } = useDrawer();

  function handleCreateConnectivity() {
    openDrawer(
      <UnitConnectivityDrawer
        open
        mode="create"
        unitId={unit.id}
        onClose={closeDrawer}
        onSubmit={async (data) => {
          await unitConnectivitiesApi.create({
            unitId: unit.id,
            name: data.connectionName ?? "",
            providerId: data.providerId,
            technology: data.technology,
            publicIp: data.publicIp,
            monitoringEnabled: data.monitoringEnabled,
          });

          await queryClient.invalidateQueries({
            queryKey: ["unit-connectivities", unit.id],
          });

          closeDrawer();
        }}
      />
    );
  }

  function handleEditConnectivity(connectivity: UnitConnectivity) {
    openDrawer(
      <UnitConnectivityDrawer
        open
        mode="edit"
        unitId={unit.id}
        connectivity={connectivity}
        onClose={closeDrawer}
        onSubmit={async (data: UnitConnectivityFormData) => {
          await unitConnectivitiesApi.update(connectivity.id, {
            ...data,
            providerId: data.providerId || null,
            publicIp: data.publicIp || null,
            observations: data.observations || null,
          });

          await queryClient.invalidateQueries({
            queryKey: ["unit-connectivities", unit.id],
          });

          closeDrawer();
        }}
      />
    );
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
