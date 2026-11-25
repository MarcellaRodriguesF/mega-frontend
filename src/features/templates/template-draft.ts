import type { TemplateDetail } from "@/services/api/templates/templates.types";

export interface DraftActivity {
  id: string;
  name: string;
  description: string | null;
}

export interface DraftStage {
  id: string;
  name: string;
  description: string | null;
  activityIds: string[];
}

export interface TemplateDraft {
  name: string;
  description: string | null;
  stageIds: string[];
  stages: Record<string, DraftStage>;
  activities: Record<string, DraftActivity>;
}

export interface DraftChanges {
  template?: { name: string; description: string | null };
  stages: { id: string; name: string; description: string | null }[];
  stageOrder?: string[];
  activities: {
    stageId: string;
    id: string;
    name: string;
    description: string | null;
  }[];
  activityOrders: { stageId: string; ids: string[] }[];
}

export function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function toDraft(template: TemplateDetail): TemplateDraft {
  const stages: TemplateDraft["stages"] = {};
  const activities: TemplateDraft["activities"] = {};

  for (const stage of template.stages) {
    stages[stage.id] = {
      id: stage.id,
      name: stage.name,
      description: normalizeText(stage.description),
      activityIds: stage.activities.map((activity) => activity.id),
    };

    for (const activity of stage.activities) {
      activities[activity.id] = {
        id: activity.id,
        name: activity.name,
        description: normalizeText(activity.description),
      };
    }
  }

  return {
    name: template.name,
    description: normalizeText(template.description),
    stageIds: template.stages.map((stage) => stage.id),
    stages,
    activities,
  };
}

function sameMembers(current: string[], server: string[]) {
  if (current.length !== server.length) return false;
  const serverIds = new Set(server);
  return current.every((id) => serverIds.has(id));
}

export function mergeDraft(current: TemplateDraft, server: TemplateDraft): TemplateDraft {
  const stageIds = [
    ...current.stageIds.filter((id) => server.stages[id]),
    ...server.stageIds.filter((id) => !current.stages[id]),
  ];
  const stages: TemplateDraft["stages"] = {};
  const activities: TemplateDraft["activities"] = {};

  for (const stageId of stageIds) {
    const serverStage = server.stages[stageId];
    const currentStage = current.stages[stageId];

    if (!serverStage) continue;

    if (!currentStage) {
      stages[stageId] = serverStage;
      for (const activityId of serverStage.activityIds) {
        const activity = server.activities[activityId];
        if (activity) activities[activityId] = activity;
      }
      continue;
    }

    const activityIds = [
      ...currentStage.activityIds.filter(
        (activityId) =>
          server.activities[activityId] &&
          serverStage.activityIds.includes(activityId),
      ),
      ...serverStage.activityIds.filter(
        (activityId) => !currentStage.activityIds.includes(activityId),
      ),
    ];

    stages[stageId] = {
      id: stageId,
      name: currentStage.name,
      description: currentStage.description,
      activityIds,
    };

    for (const activityId of activityIds) {
      const activity = current.activities[activityId] ?? server.activities[activityId];
      if (activity) activities[activityId] = activity;
    }
  }

  return {
    name: current.name,
    description: current.description,
    stageIds,
    stages,
    activities,
  };
}

export function isDraftDirty(draft: TemplateDraft, server: TemplateDraft) {
  return hasChanges(collectChanges(draft, server));
}

export function hasChanges(changes: DraftChanges) {
  return Boolean(
    changes.template ||
      changes.stageOrder ||
      changes.stages.length > 0 ||
      changes.activities.length > 0 ||
      changes.activityOrders.length > 0,
  );
}

export function collectChanges(draft: TemplateDraft, server: TemplateDraft): DraftChanges {
  const changes: DraftChanges = {
    stages: [],
    activities: [],
    activityOrders: [],
  };

  if (
    draft.name !== server.name ||
    normalizeText(draft.description) !== normalizeText(server.description)
  ) {
    changes.template = {
      name: draft.name.trim(),
      description: normalizeText(draft.description),
    };
  }

  if (
    sameMembers(draft.stageIds, server.stageIds) &&
    draft.stageIds.join("|") !== server.stageIds.join("|")
  ) {
    changes.stageOrder = draft.stageIds;
  }

  for (const stageId of draft.stageIds) {
    const localStage = draft.stages[stageId];
    const serverStage = server.stages[stageId];

    if (!localStage || !serverStage) continue;

    if (
      localStage.name !== serverStage.name ||
      normalizeText(localStage.description) !== normalizeText(serverStage.description)
    ) {
      changes.stages.push({
        id: stageId,
        name: localStage.name.trim(),
        description: normalizeText(localStage.description),
      });
    }

    if (
      sameMembers(localStage.activityIds, serverStage.activityIds) &&
      localStage.activityIds.join("|") !== serverStage.activityIds.join("|")
    ) {
      changes.activityOrders.push({
        stageId,
        ids: localStage.activityIds,
      });
    }

    for (const activityId of localStage.activityIds) {
      const localActivity = draft.activities[activityId];
      const serverActivity = server.activities[activityId];

      if (!localActivity || !serverActivity) continue;

      if (
        localActivity.name !== serverActivity.name ||
        normalizeText(localActivity.description) !==
          normalizeText(serverActivity.description)
      ) {
        changes.activities.push({
          stageId,
          id: activityId,
          name: localActivity.name.trim(),
          description: normalizeText(localActivity.description),
        });
      }
    }
  }

  return changes;
}

export function moveBefore(ids: string[], sourceId: string, targetId: string) {
  if (sourceId === targetId) return ids;

  const withoutSource = ids.filter((id) => id !== sourceId);
  const targetIndex = withoutSource.indexOf(targetId);

  if (targetIndex < 0) return ids;

  withoutSource.splice(targetIndex, 0, sourceId);
  return withoutSource;
}
