"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";
import FormSection from "@/components/ui/FormSection/FormSection";
import Select from "@/components/ui/Select/Select";
import { UserStatus } from "@/constants/enums/users/user-status-record.enum";

import {
  accessProfileFormSchema,
  type AccessProfileFormData,
} from "@/features/access-profiles/schemas/access-profile-form.schema";

import type { AccessProfile } from "@/services/api/access-profiles/access-profiles.types";

import styles from "./AccessProfileForm.module.css";

interface AccessProfileFormProps {
  onSubmit: (data: AccessProfileFormData) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: AccessProfile;
  formId?: string;
}

export default function AccessProfileForm({
  onSubmit,
  isLoading = false,
  initialData,
  formId = "access-profile-form",
}: AccessProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessProfileFormData>({
    resolver: zodResolver(accessProfileFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      status: initialData?.status ?? UserStatus.ACTIVE,
    },
  });

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <FormSection isContentGrid={false}>
        <Input
          label="Nome do perfil"
          placeholder="Ex.: Supervisor"
          required
          maxLength={255}
          disabled={isLoading}
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Descrição"
          placeholder="Descreva a finalidade deste perfil..."
          rows={3}
          maxLength={255}
          disabled={isLoading}
          error={errors.description?.message}
          {...register("description")}
        />
        {initialData ? (
          <Select
            label="Status"
            options={[
              { value: UserStatus.ACTIVE, label: "Ativo" },
              { value: UserStatus.INACTIVE, label: "Inativo" },
            ]}
            disabled={isLoading}
            error={errors.status?.message}
            {...register("status")}
          />
        ) : null}
      </FormSection>
    </form>
  );
}
