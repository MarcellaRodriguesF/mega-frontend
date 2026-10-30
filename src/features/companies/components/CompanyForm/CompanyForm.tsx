"use client";

import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import Textarea from "@/components/ui/Textarea/Textarea";
import FormSection from "@/components/ui/FormSection/FormSection";

import { CompanyRelationshipStage } from "@/constants/enums/company-relationship-stage.enum";

import {
  companyFormSchema,
  type CompanyFormData,
  type CompanyFormInput,
} from "@/features/companies/schemas/company-form.schema";

import styles from "./CompanyForm.module.css";
import { zodResolver } from "@hookform/resolvers/zod";

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void | Promise<void>;
  isLoading?: boolean;
}

const relationshipStageOptions = [
  { value: CompanyRelationshipStage.LEAD, label: "Lead" },
  { value: CompanyRelationshipStage.PROSPECT, label: "Prospect" },
  { value: CompanyRelationshipStage.CUSTOMER, label: "Cliente" },
];

export default function CompanyForm({
  onSubmit,
  isLoading = false,
}: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormInput, unknown, CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      corporateName: "",
      tradeName: "",
      cnpj: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      relationshipStage: CompanyRelationshipStage.LEAD,
      observations: "",
    },
  });

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
        description="Localização e endereço da empresa."
      >
        <Input
          label="CEP"
          placeholder="00000-000"
          inputMode="numeric"
          maxLength={9}
          disabled={isLoading}
          error={errors.zipCode?.message}
          {...register("zipCode")}
        />

        <Input
          label="Rua / Avenida"
          placeholder="Nome do logradouro"
          maxLength={255}
          disabled={isLoading}
          error={errors.street?.message}
          {...register("street")}
        />

        <Input
          label="Número"
          placeholder="Nº"
          maxLength={20}
          disabled={isLoading}
          error={errors.number?.message}
          {...register("number")}
        />

        <Input
          label="Complemento"
          placeholder="Sala, conjunto, bloco..."
          maxLength={150}
          disabled={isLoading}
          error={errors.complement?.message}
          {...register("complement")}
        />

        <Input
          label="Bairro"
          placeholder="Nome do bairro"
          maxLength={100}
          disabled={isLoading}
          error={errors.neighborhood?.message}
          {...register("neighborhood")}
        />

        <Input
          label="Cidade"
          placeholder="Nome da cidade"
          maxLength={100}
          disabled={isLoading}
          error={errors.city?.message}
          {...register("city")}
        />

        <Input
          label="Estado"
          placeholder="UF"
          maxLength={2}
          disabled={isLoading}
          error={errors.state?.message}
          {...register("state")}
        />
      </FormSection>

      <FormSection
        title="Relacionamento"
        description="Defina o estágio atual do relacionamento comercial."
      >
        <Select
          label="Estágio do relacionamento"
          options={relationshipStageOptions}
          disabled={isLoading}
          error={errors.relationshipStage?.message}
          {...register("relationshipStage")}
        />
      </FormSection>

      <FormSection
        title="Observações"
        description="Adicione informações complementares sobre a empresa."
      >
        <Textarea
          label="Observações"
          placeholder="Digite informações relevantes sobre a empresa..."
          rows={4}
          disabled={isLoading}
          error={errors.observations?.message}
          {...register("observations")}
        />
      </FormSection>
    </form>
  );
}
