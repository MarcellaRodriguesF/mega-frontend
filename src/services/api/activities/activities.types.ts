import type { ApiSuccess } from "../auth/auth.types";
import type { ImplementationWorkStatus } from "@/constants/enums/implementations/implementation-work-status.enum";
import type {
  AssignmentRole,
  ImplementationActivity,
  ImplementationAssignment,
} from "../implementations/implementations.types";

export interface ActivitySummary {
  id: string;
  name: string;
  description: string | null;
  status: ImplementationWorkStatus;
  startedAt: string | null;
  completedAt: string | null;
  companyId: string | null;
  companyTradeName: string | null;
  unitId: string | null;
  unitName: string | null;
  implementation: { id: string; name: string } | null;
  stage: { id: string; name: string } | null;
  assignments: Pick<ImplementationAssignment, "id" | "userId" | "userName" | "role">[];
  independent: boolean;
}

export interface ActivityPage {
  items: ActivitySummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ActivityPlacement {
  id: string;
  fromImplementationName: string | null;
  toImplementationName: string | null;
  fromStageName: string | null;
  toStageName: string | null;
  userName: string;
  reason: string | null;
  explicitConfirmation: boolean;
  createdAt: string;
}

export interface ActivityDetail extends ImplementationActivity {
  independent: boolean;
  implementation: { id: string; name: string } | null;
  stage: { id: string; name: string } | null;
  supervisor: ImplementationAssignment | null;
  executors: ImplementationAssignment[];
  placements: ActivityPlacement[];
}

export interface AssignableUser {
  id: string;
  name: string | null;
  email: string;
}

export interface CreateActivityRequest {
  name: string;
  description: string | null;
  companyId: string | null;
  unitId: string | null;
  implementationId: string | null;
  stageId: string | null;
}

export interface ListActivitiesQuery {
  page?: number;
  pageSize?: number;
  scope?: "all" | "independent" | "linked";
  companyId?: string;
  unitId?: string;
  implementationId?: string;
  status?: ImplementationWorkStatus | "";
}

export type ActivityResponse = ApiSuccess<ActivityDetail>;
export type ActivitiesResponse = ApiSuccess<ActivityPage>;
export type AssignableUsersResponse = ApiSuccess<AssignableUser[]>;
export type { AssignmentRole };
