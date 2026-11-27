import { ApiError } from "@/services/api/api-client";
import { API_ERROR_MESSAGES, getApiErrorMessage } from "@/services/api/error-messages";

import { isConnectivityTechnology } from "@/features/units/schemas/unit-connectivity-form.schema";
import type { UnitConnectivityFormData } from "@/features/units/schemas/unit-connectivity-form.schema";
import type {
  CreateUnitConnectivityRequest,
  UpdateUnitConnectivityRequest,
} from "@/services/api/unit-connectivities/unit-connectivities.types";

export function toUnitConnectivityPayload(
  data: UnitConnectivityFormData,
): Omit<CreateUnitConnectivityRequest, "unitId"> &
  UpdateUnitConnectivityRequest {
  if (!isConnectivityTechnology(data.technology)) {
    throw new Error("Selecione a tecnologia.");
  }

  return {
    providerId: data.providerId,
    technology: data.technology,
    publicIp: data.publicIp || null,
    observations: data.observations || null,
  };
}

export function getUnitConnectivityErrorMessage(error: unknown): string {
  if (
    error instanceof ApiError &&
    (error.status === 409 || error.code === "CONNECTIVITY_ALREADY_EXISTS")
  ) {
    return API_ERROR_MESSAGES.CONNECTIVITY_ALREADY_EXISTS;
  }

  if (error instanceof ApiError) {
    return getApiErrorMessage(error.code, error.message);
  }

  if (error instanceof TypeError) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}
