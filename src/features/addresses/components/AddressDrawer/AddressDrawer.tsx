"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";
import FormSection from "@/components/ui/FormSection/FormSection";

import AddressForm, {
  type AddressFormErrors,
  type AddressFormField,
  type AddressFormValues,
} from "@/components/forms/AddressForm/AddressForm";

import {
  addressSchema,
  addressDefaultValues,
  type AddressFormData,
  type AddressFormInput,
} from "@/features/addresses/schemas/address.schema";

import styles from "./AddressDrawer.module.css";

interface AddressDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => void | Promise<void>;
  initialData?: Partial<Record<keyof AddressFormInput, string | null>> | null;
  isLoading?: boolean;
}

function getAddressValues(
  data?: Partial<Record<keyof AddressFormInput, string | null>> | null,
): AddressFormInput {
  return {
    zipCode: data?.zipCode ?? "",
    street: data?.street ?? "",
    number: data?.number ?? "",
    complement: data?.complement ?? "",
    neighborhood: data?.neighborhood ?? "",
    city: data?.city ?? "",
    state: data?.state ?? "",
  };
}

export default function AddressDrawer({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: AddressDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: addressDefaultValues,
  });

  // Carrega os dados do endereço quando o Drawer é aberto.
  useEffect(() => {
    if (!open) return;

    reset(getAddressValues(initialData));
  }, [open, initialData, reset]);

  // Observa os valores diretamente do React Hook Form.
  const watchedAddress = useWatch({ control });

  const addressValues: AddressFormValues = {
    zipCode: watchedAddress.zipCode ?? "",
    street: watchedAddress.street ?? "",
    number: watchedAddress.number ?? "",
    complement: watchedAddress.complement ?? "",
    neighborhood: watchedAddress.neighborhood ?? "",
    city: watchedAddress.city ?? "",
    state: watchedAddress.state ?? "",
  };

  const handleAddressChange = useCallback(
    (field: AddressFormField, value: string) => {
      setValue(field, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const addressErrors: AddressFormErrors = {
    zipCode: errors.zipCode?.message,
    street: errors.street?.message,
    number: errors.number?.message,
    complement: errors.complement?.message,
    neighborhood: errors.neighborhood?.message,
    city: errors.city?.message,
    state: errors.state?.message,
  };

  async function submit(data: AddressFormData) {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  const loading = isLoading || isSubmitting;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Editar endereço"
      description="Atualize as informações de localização."
      footer={
        <>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={onClose}
            disabled={loading}
          />

          <Button
            type="submit"
            form="address-form"
            text="Salvar endereço"
            loading={loading}
          />
        </>
      }
    >
      <form
        id="address-form"
        className={styles.form}
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        <FormSection isContentGrid={true}>
          <AddressForm
            value={addressValues}
            onChange={handleAddressChange}
            errors={addressErrors}
            disabled={loading}
          />
        </FormSection>
      </form>
    </Drawer>
  );
}
