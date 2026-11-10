import { UserStatus } from "@/constants/enums/users/user-status-record.enum";

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePermission {
  id: string;
  accessProfileId: string;
  permissionId: string;
  createdAt: string;
  permission: Permission;
}

export interface AccessProfile {
  id: string;
  name: string;
  description: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  profilePermissions: ProfilePermission[];
  _count: {
    users: number;
  };
}

export interface CreateAccessProfileRequest {
  name: string;
  description?: string | null;
  permissionCodes?: string[];
}

export interface UpdateAccessProfileRequest {
  name?: string;
  description?: string | null;
  status?: UserStatus;
  permissionCodes?: string[];
}

export interface AccessProfileResponse {
  data: AccessProfile;
}

export interface AccessProfilesResponse {
  data: AccessProfile[];
}

export interface PermissionsResponse {
  data: Permission[];
}
