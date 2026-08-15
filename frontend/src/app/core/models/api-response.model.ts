export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
  errors: Record<string, string> | null;
  timestamp: string;
}
