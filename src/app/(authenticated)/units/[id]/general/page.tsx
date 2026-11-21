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

export default function UnitGeneralPage() {
  const { unit } = useUnit();

  const address = unit.address;

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
