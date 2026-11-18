"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import Textarea from "@/components/ui/Textarea/Textarea";
import FormSection from "@/components/ui/FormSection/FormSection";

import AddressForm, {
  type AddressFormErrors,
  type AddressFormField,
  type AddressFormValues,
} from "@/components/forms/AddressForm/AddressForm";

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

interface UnitFormProps {
  onSubmit: (data: UnitFormData) => void | Promise<void>;
  isLoading?: boolean;
}

const defaultValues: UnitFormInput = {
  companyId: "",
  name: "",
  type: UnitType.PHOTOVOLTAIC_PLANT,
  observations: "",
  address: {
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    areaType: "URBAN",
    latitude: null,
    longitude: null,
    observations: "",
  },
};

export default function UnitForm({
  onSubmit,
  isLoading = false,
}: UnitFormProps) {
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
    defaultValues,
  });

  const selectedCompanyId = useWatch({
    control,
    name: "companyId",
  });

  const selectedType = useWatch({
    control,
    name: "type",
  });

  const address = useWatch({
    control,
    name: "address",
  });

  useEffect(() => {
    async function loadCompanies() {
      try {
        setIsLoadingCompanies(true);
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

  function handleAddressChange(field: AddressFormField, value: string) {
    setValue(`address.${field}`, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const addressValues: AddressFormValues = {
    zipCode: address?.zipCode ?? "",
    street: address?.street ?? "",
    number: address?.number ?? "",
    complement: address?.complement ?? "",
    neighborhood: address?.neighborhood ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
  };

  const addressErrors: AddressFormErrors = {
    zipCode: errors.address?.zipCode?.message,
    street: errors.address?.street?.message,
    number: errors.address?.number?.message,
    complement: errors.address?.complement?.message,
    neighborhood: errors.address?.neighborhood?.message,
    city: errors.address?.city?.message,
    state: errors.address?.state?.message,
  };

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.tradeName,
  }));

  const unitTypeOptions = Object.values(UnitType).map((type) => ({
    value: type,
    label: UnitTypeLabel[type],
  }));

  return (
    <form
      id="unit-form"
      //   className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <FormSection>
        <Input
          label="Nome da usina"
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
        <AddressForm
          value={addressValues}
          onChange={handleAddressChange}
          errors={addressErrors}
          disabled={isLoading}
        />
      </FormSection>
    </form>
  );
}
