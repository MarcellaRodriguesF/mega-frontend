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
import Card from "@/components/ui/Card/Card";
import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";
import Select from "@/components/ui/Select/Select";
import CheckBoxInput from "@/components/ui/CheckBoxInput/CheckBoxInput";
import FileUpload from "@/components/ui/FileUpload/FileUpload.tsx";
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
import { FormFieldType, FormFieldTypeLabel } from "@/constants/enums/templates/form-field-type.enum";
import NamedItemForm from "@/features/templates/components/NamedItemForm/NamedItemForm";
import { moveId } from "@/features/templates/template-utils";

import FormFieldDrawer from "../FormFieldDrawer/FormFieldDrawer";
import type { FormFieldFormInput } from "../../schemas/form-field-form.schema";

import styles from "./FormTemplateEditor.module.css";

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

function PreviewField({ field }: { field: FormField }) {
  const id = `form-preview-${field.id}`;
  const options = (field.options ?? []).map((option) => ({
    value: option.value,
    label: option.label,
  }));

  if (field.type === FormFieldType.TEXTAREA) {
    return <Textarea id={id} label={field.label} placeholder={field.placeholder ?? undefined} required={field.isRequired} disabled />;
  }
  if (field.type === FormFieldType.SINGLE_SELECT || field.type === FormFieldType.MULTIPLE_SELECT) {
    return <Select id={id} label={field.label} options={options} placeholder={field.placeholder || "Selecione uma opção"} required={field.isRequired} disabled multiple={field.type === FormFieldType.MULTIPLE_SELECT} />;
  }
  if (field.type === FormFieldType.CHECKBOX) {
    return <CheckBoxInput id={id} label={field.label} required={field.isRequired} disabled checked={false} readOnly />;
  }
  if (field.type === FormFieldType.FILE) {
    return <FileUpload label={field.label} file={null} onChange={() => undefined} required={field.isRequired} disabled helperText="Arquivo será anexado no preenchimento." />;
  }

  return <Input id={id} label={field.label} type={field.type === FormFieldType.NUMBER ? "number" : field.type === FormFieldType.DATE ? "date" : "text"} placeholder={field.placeholder ?? undefined} required={field.isRequired} disabled />;
}

export default function FormTemplateEditor({ formTemplateId }: FormTemplateEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [fieldDrawer, setFieldDrawer] = useState<FormField | null | "new">(null);
  const [pendingDelete, setPendingDelete] = useState<FormField | "form" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

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

  async function reorderField(fieldId: string, direction: -1 | 1) {
    if (!formTemplate) return;
    const ids = moveId(formTemplate.fields.map((field) => field.id), fieldId, direction);
    if (!ids) return;

    try {
      setIsReordering(true);
      await formTemplatesApi.reorderFields(formTemplateId, { ids });
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível reordenar os campos."));
    } finally {
      setIsReordering(false);
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
          <div className={styles.headerActions}>
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
          </div>
        }
      />

      <section className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div><h2>Informações do formulário</h2><p>Modelo reutilizável para atividades operacionais.</p></div>
          <StatusBadge label={FormTemplateStatusLabel(formTemplate.status)} color={FormTemplateStatusColor(formTemplate.status)} />
        </div>
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

      <div className={styles.builderLayout}>
      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Campos</h2>
            <p>A ordem e a chave são únicas dentro deste formulário.</p>
          </div>
          <Button text="Novo campo" onClick={() => setFieldDrawer("new")} />
        </div>

        {formTemplate.fields.length === 0 ? (
          <div className={styles.emptyState}><p>Comece adicionando o primeiro campo que será preenchido nas atividades.</p><Button text="Adicionar primeiro campo" onClick={() => setFieldDrawer("new")} /></div>
        ) : (
          <ol className={styles.fieldList}>
            {formTemplate.fields.map((field, index) => (
              <li className={styles.fieldItem} key={field.id}>
                <div className={styles.fieldOrder} aria-label={`Campo ${index + 1}`}>{index + 1}</div>
                <div className={styles.fieldContent}>
                  <div className={styles.fieldTitle}><strong>{field.label}</strong><StatusBadge label={FormFieldTypeLabel(field.type)} color="gray" />{field.isRequired ? <StatusBadge label="Obrigatório" color="blue" /> : null}</div>
                  <p>Chave: <code>{field.key}</code>{field.options?.length ? ` · Opções: ${field.options.map((option) => option.label).join(", ")}` : ""}</p>
                  {field.description ? <p>{field.description}</p> : null}
                </div>
                <div className={styles.fieldActions} aria-label={`Ações do campo ${field.label}`}>
                  <button
                    type="button"
                    aria-label="Mover campo para cima"
                    className={styles.orderButton}
                    disabled={index === 0 || isReordering}
                    onClick={() => void reorderField(field.id, -1)}
                  >
                    <CaretUp size={16} />
                    <span>Subir</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Mover campo para baixo"
                    className={styles.orderButton}
                    disabled={index === formTemplate.fields.length - 1 || isReordering}
                    onClick={() => void reorderField(field.id, 1)}
                  >
                    <CaretDown size={16} />
                    <span>Descer</span>
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
              </li>
            ))}
          </ol>
        )}
      </section>

      <Card title="Prévia do formulário" description="Visualização de referência dos campos que serão apresentados no preenchimento." display="default">
        {formTemplate.fields.length === 0 ? <p className={styles.previewEmpty}>A prévia aparecerá quando você adicionar campos.</p> : <div className={styles.previewFields}>{formTemplate.fields.map((field) => <PreviewField key={field.id} field={field} />)}</div>}
      </Card>
      </div>

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
