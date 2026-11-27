"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";

import {
  namedItemSchema,
  type NamedItemData,
  type NamedItemInput,
} from "../../schemas/named-item.schema";

import styles from "./NamedItemForm.module.css";

interface NamedItemFormProps {
  formId: string;
  nameLabel: string;
  namePlaceholder: string;
  defaultValues?: NamedItemInput;
  isLoading?: boolean;
  onSubmit: (data: NamedItemData) => void | Promise<void>;
}

export default function NamedItemForm({
  formId,
  nameLabel,
  namePlaceholder,
  defaultValues,
  isLoading = false,
  onSubmit,
}: NamedItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NamedItemInput, unknown, NamedItemData>({
    resolver: zodResolver(namedItemSchema),
    defaultValues: defaultValues ?? { name: "", description: "" },
  });

  return (
    <form id={formId} className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label={nameLabel}
        placeholder={namePlaceholder}
        required
        maxLength={255}
        disabled={isLoading}
        error={errors.name?.message}
        {...register("name")}
      />
      <Textarea
        label="Descrição"
        placeholder="Descreva o objetivo, se necessário."
        disabled={isLoading}
        error={errors.description?.message}
        {...register("description")}
      />
    </form>
  );
}
