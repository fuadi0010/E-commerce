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
