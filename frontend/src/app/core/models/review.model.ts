export interface ReviewResponse {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userFullName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}
