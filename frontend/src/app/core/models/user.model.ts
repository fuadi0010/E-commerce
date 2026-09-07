export interface UserProfile {
  id?: string;
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  joinedAt?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  address?: string;
  name?: string;
  phoneNumber?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  roles: string[];
  createdAt: string;
}
