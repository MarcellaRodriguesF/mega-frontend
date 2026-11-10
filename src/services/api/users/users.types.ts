import { UserStatus } from "@/constants/enums/users/user-status-record.enum";

export interface AccessProfile {
  id: string;
  name: string;
  description: string | null;
  status: UserStatus;
}

export interface User {
  id: string;
  email: string;
  accessProfileId: string;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  accessProfile: AccessProfile;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  accessProfileId: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  accessProfileId?: string;
  status?: UserStatus;
}

export interface UserResponse {
  data: User;
}

export interface UsersResponse {
  data: User[];
}
