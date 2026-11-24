"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import Modal from "@/components/ui/Modal/Modal";
import PageState from "@/components/ui/PageState/PageState";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { formTemplatesApi } from "@/services/api/form-templates/form-templates.api";
import type { FormField } from "@/services/api/form-templates/form-templates.types";
import {
  FormTemplateStatus,
  FormTemplateStatusColor,
  FormTemplateStatusLabel,
} from "@/constants/enums/templates/form-template-status.enum";
import { FormFieldTypeLabel } from "@/constants/enums/templates/form-field-type.enum";
import NamedItemForm from "@/features/templates/components/NamedItemForm/NamedItemForm";
import { moveId } from "@/features/templates/template-utils";

import FormFieldDrawer from "../FormFieldDrawer/FormFieldDrawer";
import type { FormFieldFormInput } from "../../schemas/form-field-form.schema";

import styles from "@/features/templates/components/TemplateEditor/TemplateEditor.module.css";

interface FormTemplateEditorProps {
  formTemplateId: string;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return getApiErrorMessage(error.code, error.message);
  }

  return fallback;
}

function toFieldForm(field: FormField): FormFieldFormInput {
  return {
    key: field.key,
    label: field.label,
    description: field.description ?? "",
    type: field.type,
    placeholder: field.placeholder ?? "",
    isRequired: field.isRequired,
    options: field.options ?? [],
  };
}

export default function FormTemplateEditor({ formTemplateId }: FormTemplateEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [fieldDrawer, setFieldDrawer] = useState<FormField | null | "new">(null);
  const [pendingDelete, setPendingDelete] = useState<FormField | "form" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const formQuery = useQuery({
    queryKey: ["form-template", formTemplateId],
    queryFn: () => formTemplatesApi.findById(formTemplateId),
  });

  const formTemplate = formQuery.data?.data;

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["form-template", formTemplateId] }),
      queryClient.invalidateQueries({ queryKey: ["form-templates"] }),
    ]);
  }

  async function run(action: () => Promise<unknown>, success: string, fallback: string) {
    try {
      await action();
      toast.success(success);
      setFieldDrawer(null);
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, fallback));
      throw error;
    }
  }

  async function updateStatus(status: FormTemplateStatus) {
    try {
      setIsStatusUpdating(true);
      await formTemplatesApi.updateStatus(formTemplateId, status);
      toast.success("O status do formulário foi atualizado.");
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível atualizar o status."));
    } finally {
      setIsStatusUpdating(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || !formTemplate) return;

    try {
      setIsDeleting(true);

      if (pendingDelete === "form") {
        await formTemplatesApi.delete(formTemplateId);
        toast.success("O formulário foi excluído.");
        router.push("/form-templates");
        return;
      }

      await formTemplatesApi.deleteField(formTemplateId, pendingDelete.id);
      toast.success("O campo foi excluído.");
      setPendingDelete(null);
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível excluir o registro."));
    } finally {
      setIsDeleting(false);
    }
  }

  if (formQuery.isLoading) {
    return (
      <PageContainer>
        <PageState type="loading" title="Carregando formulário" />
      </PageContainer>
    );
  }

  if (formQuery.isError || !formTemplate) {
    return (
      <PageContainer>
        <PageState
          type="error"
          title="Não foi possível carregar o formulário"
          action={{ label: "Tentar novamente", onClick: () => formQuery.refetch() }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={formTemplate.name}
        description="Edite o formulário reutilizável e a ordem dos seus campos."
        action={
          <>
            <Link className={styles.link} href="/form-templates">
              Voltar
            </Link>
            <Button
              variant={formTemplate.status === FormTemplateStatus.ACTIVE ? "secondary" : "primary"}
              text={formTemplate.status === FormTemplateStatus.ACTIVE ? "Desativar" : "Ativar"}
              loading={isStatusUpdating}
              onClick={() =>
                updateStatus(
                  formTemplate.status === FormTemplateStatus.ACTIVE
                    ? FormTemplateStatus.INACTIVE
                    : FormTemplateStatus.ACTIVE,
                )
              }
            />
            <Button variant="outline" text="Excluir" onClick={() => setPendingDelete("form")} />
          </>
        }
      />

      <div className={styles.statusRow}>
        <StatusBadge
          label={FormTemplateStatusLabel(formTemplate.status)}
          color={FormTemplateStatusColor(formTemplate.status)}
        />
      </div>

      <section className={styles.panel}>
        <h2>Informações gerais</h2>
        <NamedItemForm
          key={`${formTemplate.id}-${formTemplate.updatedAt}`}
          formId="form-template-general"
          nameLabel="Nome do formulário"
          namePlaceholder="Ex.: Checklist de instalação"
          defaultValues={{
            name: formTemplate.name,
            description: formTemplate.description ?? "",
          }}
          onSubmit={(data) =>
            run(
              () => formTemplatesApi.update(formTemplateId, data),
              "O formulário foi atualizado.",
              "Não foi possível atualizar o formulário.",
            )
          }
        />
        <div className={styles.formActions}>
          <Button text="Salvar informações" type="submit" form="form-template-general" />
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Campos</h2>
            <p>A ordem e a chave são únicas dentro deste formulário.</p>
          </div>
          <Button text="Novo campo" onClick={() => setFieldDrawer("new")} />
        </div>

        {formTemplate.fields.length === 0 ? (
          <p className={styles.empty}>Nenhum campo cadastrado.</p>
        ) : (
          <div className={styles.stack}>
            {formTemplate.fields.map((field) => (
              <article className={styles.requirement} key={field.id}>
                <div>
                  <strong>
                    {field.label} · {FormFieldTypeLabel(field.type)}
                    {field.isRequired ? " · Obrigatório" : ""}
                  </strong>
                  <p>
                    {field.key}
                    {field.options?.length
                      ? ` · ${field.options.map((option) => option.label).join(", ")}`
                      : ""}
                  </p>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.iconAction}
                    aria-label="Mover campo para cima"
                    onClick={async () => {
                      const ids = moveId(
                        formTemplate.fields.map((item) => item.id),
                        field.id,
                        -1,
                      );
                      if (!ids) return;
                      try {
                        await formTemplatesApi.reorderFields(formTemplateId, { ids });
                        await refresh();
                      } catch (error) {
                        toast.error(errorMessage(error, "Não foi possível reordenar os campos."));
                      }
                    }}
                  >
                    <CaretUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconAction}
                    aria-label="Mover campo para baixo"
                    onClick={async () => {
                      const ids = moveId(
                        formTemplate.fields.map((item) => item.id),
                        field.id,
                        1,
                      );
                      if (!ids) return;
                      try {
                        await formTemplatesApi.reorderFields(formTemplateId, { ids });
                        await refresh();
                      } catch (error) {
                        toast.error(errorMessage(error, "Não foi possível reordenar os campos."));
                      }
                    }}
                  >
                    <CaretDown size={16} />
                  </button>
                  <IconButton
                    action="edit"
                    size="sm"
                    label="Editar campo"
                    onClick={() => setFieldDrawer(field)}
                  />
                  <IconButton
                    action="delete"
                    size="sm"
                    label="Excluir campo"
                    onClick={() => setPendingDelete(field)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <FormFieldDrawer
        open={fieldDrawer !== null}
        title={fieldDrawer && fieldDrawer !== "new" ? "Editar campo" : "Novo campo"}
        defaultValues={
          fieldDrawer && fieldDrawer !== "new" ? toFieldForm(fieldDrawer) : undefined
        }
        onClose={() => setFieldDrawer(null)}
        onSubmit={(data) => {
          if (fieldDrawer && fieldDrawer !== "new") {
            return run(
              () => formTemplatesApi.updateField(formTemplateId, fieldDrawer.id, data),
              "O campo foi atualizado.",
              "Não foi possível atualizar o campo.",
            );
          }

          return run(
            () => formTemplatesApi.createField(formTemplateId, data),
            "O campo foi cadastrado.",
            "Não foi possível cadastrar o campo.",
          );
        }}
      />

      <Modal
        open={pendingDelete !== null}
        title="Confirmar exclusão"
        description={
          pendingDelete === "form"
            ? "O formulário só pode ser excluído se não estiver associado a requisitos."
            : "O campo será removido deste formulário."
        }
        confirmText="Excluir"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
}
