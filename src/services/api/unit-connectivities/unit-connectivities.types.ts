import type { ApiSuccess } from "../auth/auth.types";

export const CONNECTIVITY_TECHNOLOGIES = ["FIBRA", "RADIO"] as const;

export type ConnectivityTechnology =
  (typeof CONNECTIVITY_TECHNOLOGIES)[number];

export interface UnitConnectivityProvider {
  id: string;
  name: string;
  phone: string | null;
}

export interface UnitConnectivity {
  id: string;
  unitId: string;
  providerId: string | null;
  name: string;
  technology: string;
  status: string;

  publicIp: string | null;
  wanIp: string | null;
  gatewayIp: string | null;
  localIp: string | null;

  monitoringEnabled: boolean;

  downloadCapacityMbps: number | null;
  uploadCapacityMbps: number | null;
  responseTimeMs: number | null;
  throughputMbps: number | null;
  rxSignalDbm: number | null;

  slaPercentage: number | null;
  mttrHours: number | null;

  networkName: string | null;
  serviceStartDate: string | null;
  serviceEndDate: string | null;
  observations: string | null;

  provider: UnitConnectivityProvider | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitConnectivityRequest {
  unitId: string;
  providerId: string;
  technology: ConnectivityTechnology;
  publicIp?: string | null;
  observations?: string | null;
}

export interface UpdateUnitConnectivityRequest {
  providerId?: string;
  technology?: ConnectivityTechnology;
  publicIp?: string | null;
  observations?: string | null;
}

export type UnitConnectivityResponse = ApiSuccess<UnitConnectivity>;
export type UnitConnectivitiesResponse = ApiSuccess<UnitConnectivity[]>;
export type DeleteUnitConnectivityResponse = ApiSuccess<null>;

export interface ConnectivityPingResult {
  success: boolean;
  ip: string;
  latencyMs: number | null;
  packetLoss: number | null;
  testedAt: string;
  message?: string;
}

export type ConnectivityPingResponse =
  ApiSuccess<ConnectivityPingResult>;