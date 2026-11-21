"use client";

import {
  Buildings,
  MapPin,
  FileText,
  Factory,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";

import { useUnit } from "@/contexts/UnitContext";

import Card from "@/components/ui/Card/Card";
import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Button from "@/components/ui/Button/Button";

import { UnitTypeLabel } from "@/constants/enums/units/unit-type.enum";
import {
  UnitStatusLabel,
  UnitStatusColor,
} from "@/constants/enums/units/unit-status.enum";
import AddressCard from "@/components/ui/AddressCard/AddressCard";

export default function UnitGeneralPage() {
  const { unit } = useUnit();

  const address = unit.address;

  const cityState = [address?.city, address?.state].filter(Boolean).join(" / ");

  const hasCoordinates =
    address?.latitude != null && address?.longitude != null;

  const coordinates = hasCoordinates
    ? `${address.latitude}, ${address.longitude}`
    : null;

  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`
    : null;

  const hasAddress = Boolean(
    address &&
    [
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode,
    ].some(Boolean)
  );

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
        />

        <InfoField label="Data de cadastro" value={unit.createdAt} />
      </Card>

      <AddressCard
        title="Localização"
        address={address}
        latitude={address?.latitude}
        longitude={address?.longitude}
        locationName={unit.name}
      />

      <Card title="Observações" icon={<FileText size={20} />}>
        <InfoField
          label="Informações adicionais"
          value={unit.observations}
          fallback="Nenhuma observação cadastrada."
        />
      </Card>

      <Card title="Empresa vinculada" icon={<Buildings size={20} />}>
        <InfoField label="Nome fantasia" value={unit.company.tradeName} />

        <InfoField label="Razão social" value={unit.company.corporateName} />
      </Card>
    </InfoCardGrid>
  );
}
