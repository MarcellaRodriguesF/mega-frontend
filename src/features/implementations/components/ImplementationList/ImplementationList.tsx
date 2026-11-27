"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DotsThreeVertical, Plus } from "@phosphor-icons/react";

import AccordionList from "@/components/ui/AccordionList/AccordionList";
import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Button from "@/components/ui/Button/Button";
import {
  ImplementationStatusColor,
  ImplementationStatusLabel,
} from "@/constants/enums/implementations/implementation-status.enum";
import {
  ImplementationWorkStatusColor,
  ImplementationWorkStatusLabel,
} from "@/constants/enums/implementations/implementation-work-status.enum";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import { implementationsApi } from "@/services/api/implementations/implementations.api";
import type {
  ImplementationDetail,
  ImplementationSummary,
} from "@/services/api/implementations/implementations.types";

import styles from "./ImplementationList.module.css";

interface ImplementationListProps {
  items: ImplementationSummary[];
  isLoading: boolean;
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

function getProgress(item: ImplementationSummary) {
  if (item.activityCount === 0) return 0;
  return Math.round((item.completedActivityCount / item.activityCount) * 100);
}

function ImplementationHeader({ item }: { item: ImplementationSummary }) {
  const progress = getProgress(item);

  return (
    <div className={styles.accordionHeader}>
      <div className={styles.identity}>
        <div className={styles.titleRow}>
          <strong>{item.name}</strong>
          <StatusBadge
            label={ImplementationStatusLabel(item.status)}
            color={ImplementationStatusColor(item.status)}
          />
        </div>
        <span className={styles.context}>
          {item.companyTradeName || "Sem empresa"}
          {item.unitName ? ` · ${item.unitName}` : " · Sem unidade"}
        </span>
      </div>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <span>Início</span>
          <strong>{formatDate(item.startedAt)}</strong>
        </div>
        <div className={styles.fact}>
          <span>Previsão</span>
          <strong title="A API não fornece uma data prevista de conclusão">
            Não informada
          </strong>
        </div>
        <div className={styles.fact}>
          <span>Responsável principal</span>
          <strong title="A implantação não possui responsável principal cadastrado">
            Não informado
          </strong>
        </div>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressLabel}>
          <span>Progresso</span>
          <strong>{progress}%</strong>
        </div>
        <progress
          value={progress}
          max={100}
          aria-label={`Progresso de ${item.name}: ${progress}%`}
        />
        <small>
          {item.completedActivityCount} de {item.activityCount} atividades
        </small>
      </div>
    </div>
  );
}

function ImplementationActions({ item }: { item: ImplementationSummary }) {
  const { hasPermission } = useAuth();
  const canCreateActivity = hasPermission(PERMISSIONS.ACTIVITIES_CREATE);

  return (
    <details className={styles.actionMenu}>
      <summary aria-label={`Ações de ${item.name}`} title="Ações da implantação">
        <DotsThreeVertical size={20} aria-hidden="true" />
      </summary>
      <div className={styles.actionMenuItems}>
        <Link href={`/implementations/${item.id}`}>Abrir implantação</Link>
        {canCreateActivity ? (
          <Link href={`/implementations/${item.id}?tab=work&action=addActivity`}>
            Adicionar atividade
          </Link>
        ) : null}
      </div>
    </details>
  );
}

function getActivities(implementation: ImplementationDetail) {
  const staged = implementation.stages.flatMap((stage, stageIndex) =>
    stage.activities.map((activity) => ({
      activity,
      stageIndex,
      stageName: stage.name,
    })),
  );
  const direct = implementation.directActivities.map((activity) => ({
    activity,
    stageIndex: -1,
    stageName: "Direta",
  }));

  return [...direct, ...staged]
    .sort(
      (left, right) =>
        left.stageIndex - right.stageIndex ||
        left.activity.order - right.activity.order,
    )
    .map((entry, index) => ({ ...entry, number: index + 1 }));
}

function ImplementationActivities({
  item,
  canCreateActivity,
}: {
  item: ImplementationSummary;
  canCreateActivity: boolean;
}) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["implementation", item.id],
    queryFn: () => implementationsApi.findById(item.id),
  });
  const implementation = query.data?.data;
  const activities = implementation ? getActivities(implementation) : [];

  return (
    <section className={styles.expandedContent}>
      <div className={styles.expandedHeader}>
        <div>
          <h2>Atividades da implantação</h2>
          <p>Atividades diretas e organizadas por etapa.</p>
        </div>
        {canCreateActivity ? (
          <Link
            className={styles.addActivity}
            href={`/implementations/${item.id}?tab=work&action=addActivity`}
          >
            <Plus size={17} aria-hidden="true" />
            Adicionar atividade
          </Link>
        ) : null}
      </div>

      {query.isError ? (
        <div className={styles.queryError} role="alert">
          <span>Não foi possível carregar as atividades.</span>
          <Button
            variant="outline"
            text="Tentar novamente"
            onClick={() => void query.refetch()}
          />
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: "number",
              header: "Nº",
              width: "7%",
              mobileRole: "full",
            },
            {
              key: "activity",
              header: "Atividade",
              width: "30%",
              mobileRole: "title",
              render: (row) => (
                <span className={styles.activityName}>
                  <strong>{row.activity.name}</strong>
                  <small>{row.stageName}</small>
                </span>
              ),
            },
            {
              key: "responsible",
              header: "Responsável",
              width: "19%",
              render: (row) =>
                row.activity.assignments.length
                  ? row.activity.assignments.map((assignment) => assignment.userName).join(", ")
                  : "Não atribuído",
            },
            {
              key: "deadline",
              header: "Prazo",
              width: "12%",
              render: () => <span title="A API não fornece prazo para atividades">—</span>,
            },
            {
              key: "status",
              header: "Status",
              width: "14%",
              mobileRole: "status",
              render: (row) => (
                <StatusBadge
                  label={ImplementationWorkStatusLabel(row.activity.status)}
                  color={ImplementationWorkStatusColor(row.activity.status)}
                />
              ),
            },
            {
              key: "completedAt",
              header: "Conclusão",
              width: "13%",
              render: (row) => formatDate(row.activity.completedAt),
            },
          ]}
          data={activities}
          getRowKey={(row) => row.activity.id}
          isLoading={query.isLoading}
          emptyMessage="Esta implantação ainda não possui atividades."
          onRowClick={(row) => {
            router.push(`/activities/${row.activity.id}`);
          }}
          actions={(row) => (
            <Link
              className={styles.openActivity}
              href={`/activities/${row.activity.id}`}
              aria-label={`Abrir atividade ${row.activity.name}`}
            >
              Abrir
            </Link>
          )}
        />
      )}
      <p className={styles.dataLimitNote}>
        O cadastro atual não possui prazo previsto para atividades.
      </p>
    </section>
  );
}

export default function ImplementationList({
  items,
  isLoading,
  page,
  total,
  totalPages,
  onPageChange,
}: ImplementationListProps) {
  const { hasPermission } = useAuth();
  const canCreateActivity = hasPermission(PERMISSIONS.ACTIVITIES_CREATE);

  return (
    <div className={styles.list}>
      <AccordionList
        items={items}
        getItemId={(item) => item.id}
        renderHeader={(item) => <ImplementationHeader item={item} />}
        renderActions={(item) => <ImplementationActions item={item} />}
        renderContent={(item) => (
          <ImplementationActivities
            item={item}
            canCreateActivity={canCreateActivity}
          />
        )}
        isLoading={isLoading}
        emptyMessage="Nenhuma implantação encontrada para esses filtros."
      />

      {totalPages > 1 ? (
        <div className={styles.pager}>
          <span>
            Página {page} de {totalPages} · {total} implantações
          </span>
          <div className={styles.pagerActions}>
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Próxima
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
