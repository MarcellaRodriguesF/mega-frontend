"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseCoordinatePair } from "@/utils/coordinates";
import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import FormSection from "@/components/ui/FormSection/FormSection";

import {
  UnitType,
  UnitTypeLabel,
} from "@/constants/enums/units/unit-type.enum";

import { companiesApi } from "@/services/api/companies/companies.api";
import type { Company } from "@/services/api/companies/companies.types";

import {
  unitFormSchema,
  type UnitFormData,
  type UnitFormInput,
} from "@/features/units/schemas/unit-form.schema";

import type { Unit } from "@/services/api/units/units.types";

interface UnitFormProps {
  onSubmit: (data: UnitFormData) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: Unit;
}

export default function UnitForm({
  onSubmit,
  isLoading = false,
  initialData,
}: UnitFormProps) {
  function getDefaultValues(unit?: Unit): UnitFormInput {
    return {
      companyId: unit?.companyId ?? "",
      name: unit?.name ?? "",
      type: unit?.type ?? UnitType.PHOTOVOLTAIC_PLANT,
      observations: unit?.observations ?? "",
      address: {
        zipCode: unit?.address?.zipCode ?? "",
        street: unit?.address?.street ?? "",
        number: unit?.address?.number ?? "",
        complement: unit?.address?.complement ?? "",
        neighborhood: unit?.address?.neighborhood ?? "",
        city: unit?.address?.city ?? "",
        state: unit?.address?.state ?? "",
        areaType:
          unit?.address?.areaType === "RURAL" ||
          unit?.address?.areaType === "URBAN"
            ? unit.address.areaType
            : null,
        latitude: unit?.address?.latitude ?? "",
        longitude: unit?.address?.longitude ?? "",
      },
    };
  }

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<UnitFormInput, unknown, UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const selectedCompanyId = useWatch({
    control,
    name: "companyId",
  });

  const selectedType = useWatch({
    control,
    name: "type",
  });

  const selectedZone = useWatch({
    control,
    name: "address.areaType",
  });

  useEffect(() => {
    async function loadCompanies() {
      try {
        setCompaniesError("");

        const response = await companiesApi.findAll();
        setCompanies(response.data);
      } catch {
        setCompaniesError("Não foi possível carregar as empresas.");
      } finally {
        setIsLoadingCompanies(false);
      }
    }

    loadCompanies();
  }, []);

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.tradeName,
  }));

  const unitTypeOptions = Object.values(UnitType).map((type) => ({
    value: type,
    label: UnitTypeLabel[type],
  }));

  const [coordinatesInput, setCoordinatesInput] = useState(() => {
    const latitude = initialData?.address?.latitude;
    const longitude = initialData?.address?.longitude;

    if (latitude == null || longitude == null) return "";

    return `${latitude}, ${longitude}`;
  });

  function handleCoordinatesPaste(value: string) {
    setCoordinatesInput(value);

    if (!value.trim()) return;

    const coordinates = parseCoordinatePair(value);

    if (!coordinates) {
      return;
    }

    setValue("address.latitude", coordinates.latitude, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("address.longitude", coordinates.longitude, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <form id="unit-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormSection>
        <Input
          label="Nome da unidade"
          placeholder="Ex.: UFV Uberaba 01"
          required
          maxLength={255}
          disabled={isLoading}
          error={errors.name?.message}
          {...register("name")}
        />

        <Select
          label="Tipo de unidade"
          options={unitTypeOptions}
          placeholder="Selecione o tipo"
          value={selectedType}
          onChange={(event) =>
            setValue("type", event.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          disabled={isLoading}
          error={errors.type?.message}
        />

        <Select
          label="Empresa"
          options={companyOptions}
          placeholder={
            isLoadingCompanies
              ? "Carregando empresas..."
              : "Selecione a empresa"
          }
          value={selectedCompanyId}
          onChange={(event) =>
            setValue("companyId", event.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          disabled={isLoading || isLoadingCompanies || companies.length === 0}
          error={
            errors.companyId?.message ||
            companiesError ||
            (companies.length === 0 && !isLoadingCompanies
              ? "Cadastre uma empresa antes de cadastrar uma usina."
              : undefined)
          }
        />
      </FormSection>

      <FormSection
        title="Localização geográfica"
        // description="Informe as coordenadas da usina, caso estejam disponíveis. Você pode copiá-las diretamente do Google Maps."
      >
        <Select
          label="Zona"
          options={[
            { value: "RURAL", label: "Rural" },
            { value: "URBAN", label: "Urbana" },
          ]}
          placeholder="Selecione a zona"
          value={selectedZone || ""}
          onChange={(event) =>
            setValue(
              "address.areaType",
              event.target.value as "RURAL" | "URBAN",
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            )
          }
          disabled={isLoading}
        />

        <Input
          label="Coordenadas"
          type="text"
          placeholder="-23.040324, -45.703289"
          helperText={
            "Cole as coordenadas copiadas do Google Maps. Ex.: 23°02'25.2\"S 45°42'11.8\"W"
          }
          helperTextType="info"
          value={coordinatesInput}
          onChange={(event) => handleCoordinatesPaste(event.target.value)}
          disabled={isLoading}
        />
        {/* <Input
          label="Latitude"
          type="number"
          placeholder="Ex.: -23.040324"
          helperText="Valor decimal da latitude."
          disabled={isLoading}
          step="any"
          min={-90}
          max={90}
          error={errors.address?.latitude?.message}
          {...register("address.latitude")}
        />

        <Input
          label="Longitude"
          type="number"
          placeholder="Ex.: -45.703289"
          helperText="Valor decimal da longitude."
          disabled={isLoading}
          step="any"
          min={-180}
          max={180}
          error={errors.address?.longitude?.message}
          {...register("address.longitude")}
        /> */}
      </FormSection>

      <FormSection
        title="Endereço de referência"
        description="Opcional. Preencha se houver endereço convencional ou alguma referência de localização."
      >
        <Input
          label="CEP"
          placeholder="00000-000"
          disabled={isLoading}
          error={errors.address?.zipCode?.message}
          {...register("address.zipCode")}
        />

        <Input
          label="Rua, estrada ou referência"
          placeholder="Ex.: Estrada Municipal..."
          disabled={isLoading}
          error={errors.address?.street?.message}
          {...register("address.street")}
        />

        <Input
          label="Número"
          placeholder="Número ou identificação"
          disabled={isLoading}
          error={errors.address?.number?.message}
          {...register("address.number")}
        />

        <Input
          label="Complemento"
          placeholder="Complemento"
          disabled={isLoading}
          error={errors.address?.complement?.message}
          {...register("address.complement")}
        />

        <Input
          label="Bairro ou região"
          placeholder="Bairro ou região"
          disabled={isLoading}
          error={errors.address?.neighborhood?.message}
          {...register("address.neighborhood")}
        />

        <Input
          label="Cidade"
          placeholder="Cidade"
          disabled={isLoading}
          error={errors.address?.city?.message}
          {...register("address.city")}
        />

        <Input
          label="Estado"
          placeholder="UF"
          maxLength={2}
          disabled={isLoading}
          error={errors.address?.state?.message}
          {...register("address.state")}
        />
      </FormSection>
    </form>
  );
}
