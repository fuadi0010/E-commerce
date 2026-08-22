export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  name: string;
  phoneNumber?: string;
}
