"use client";

import { useCallback } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";
import FormSection from "@/components/ui/FormSection/FormSection";

import { CompanyRelationshipStage } from "@/constants/enums/companies/company-relationship-stage.enum";

import { CompanyAddressType } from "@/constants/enums/companies/company-address-type.enum";

import {
  companyFormSchema,
  type CompanyFormData,
  type CompanyFormInput,
} from "@/features/companies/schemas/company-form.schema";

import styles from "./CompanyForm.module.css";
import AddressForm, {
  AddressFormErrors,
  AddressFormField,
  AddressFormValues,
} from "@/components/forms/AddressForm/AddressForm";

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export default function CompanyForm({
  onSubmit,
  isLoading = false,
}: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CompanyFormInput, unknown, CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      corporateName: "",
      tradeName: "",
      cnpj: "",
      relationshipStage: CompanyRelationshipStage.CUSTOMER,
      observations: "",
      address: {
        name: "Matriz",
        type: CompanyAddressType.HEADQUARTERS,
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        latitude: null,
        longitude: null,
        isPrimary: true,
        observations: "",
      },
    },
  });

  const address = watch("address");

  // Atualiza os campos de endereço no React Hook Form.
  const handleAddressChange = useCallback(
    (field: AddressFormField, value: string) => {
      setValue(`address.${field}` as FieldPath<CompanyFormInput>, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  // Transforma os erros do Zod no formato esperado pelo AddressForm.
  const addressErrors: AddressFormErrors = {
    zipCode: errors.address?.zipCode?.message,
    street: errors.address?.street?.message,
    number: errors.address?.number?.message,
    complement: errors.address?.complement?.message,
    neighborhood: errors.address?.neighborhood?.message,
    city: errors.address?.city?.message,
    state: errors.address?.state?.message,
  };

  const addressValues: AddressFormValues = {
    zipCode: address?.zipCode ?? "",
    street: address?.street ?? "",
    number: address?.number ?? "",
    complement: address?.complement ?? "",
    neighborhood: address?.neighborhood ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
  };

  return (
    <form
      id="company-form"
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <FormSection
        title="Identificação"
        description="Informações principais para identificar a empresa."
      >
        <Input
          label="Nome fantasia"
          placeholder="Ex.: Mega Telecom"
          required
          maxLength={255}
          disabled={isLoading}
          error={errors.tradeName?.message}
          {...register("tradeName")}
        />

        <Input
          label="Razão social"
          placeholder="Nome empresarial"
          maxLength={255}
          disabled={isLoading}
          error={errors.corporateName?.message}
          {...register("corporateName")}
        />

        <Input
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          inputMode="numeric"
          maxLength={18}
          disabled={isLoading}
          error={errors.cnpj?.message}
          {...register("cnpj")}
        />
      </FormSection>

      <FormSection
        title="Endereço"
        description="Informe o CEP para preencher automaticamente os dados de localização."
      >
        <AddressForm
          value={addressValues}
          onChange={handleAddressChange}
          errors={addressErrors}
          disabled={isLoading}
        />
      </FormSection>

      <Textarea
        label="Observações"
        placeholder="Digite informações relevantes sobre a empresa..."
        rows={4}
        disabled={isLoading}
        error={errors.observations?.message}
        {...register("observations")}
      />
    </form>
  );
}
