import { PrismaClient } from "@prisma/client";
import CustomError from "../../../utils/custom-response/custom-error";

const prisma = new PrismaClient();

class ReviewService {
  // Get reviews for a profile with pagination
  public static async getProfileReviews(profileId: string) {
    try {
      const reviews = await prisma.reviews.findMany({
        where: {
          user_profile_id: profileId
        },
        include: {
          user_profile: {
            select: {
              full_name: true,
              professional_title: true,
              avatar: true
            }
          },
          images: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await prisma.reviews.count({
        where: {
          user_profile_id: profileId
        }
      });

      return {
        reviews,
          total,
      };
    } catch (error) {
      throw new CustomError("Failed to fetch reviews", 400);
    }
  }

  // Create a new review
  public static async createReview(userId: string, profileId: string, review: string, rating: number) {
    try {
      // Check if user has already reviewed this profile
      const existingReview = await prisma.reviews.findFirst({
        where: {
          user_profile_id: userId,
          review_for_id: profileId
        }
      });

      if (existingReview) {
        throw new CustomError("You have already reviewed this profile", 400);
      }

      const newReview = await prisma.reviews.create({
        data: {
          review,
          rating,
          user_profile_id: userId,
        },
        include: {
          user_profile: {
            select: {
              full_name: true,
              professional_title: true,
              avatar: true
            }
          }
        }
      });

      return newReview;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to create review", 400);
    }
  }

  // Get user's reviews
  public static async getUserReviews(userId: string, page: number = 1, limit: number = 10) {
    try {
      const reviews = await prisma.reviews.findMany({
        where: {
          user_profile_id: userId
        },
        include: {
          user_profile: {
            select: {
              full_name: true,
              professional_title: true,
              avatar: true
            }
          },
          images: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await prisma.reviews.count({
        where: {
          user_profile_id: userId
        }
      });

      return {
        reviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new CustomError("Failed to fetch user reviews", 400);
    }
  }

  // Delete a review
  public static async deleteReview(reviewId: string, userId: string) {
    try {
      const review = await prisma.reviews.findUnique({
        where: {
          id: reviewId
        }
      });

      if (!review) {
        throw new CustomError("Review not found", 404);
      }

      if (review.user_profile_id !== userId) {
        throw new CustomError("Unauthorized to delete this review", 403);
      }

      await prisma.reviews.delete({
        where: {
          id: reviewId
        }
      });

      return { message: "Review deleted successfully" };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to delete review", 400);
    }
  }
}

export default ReviewService
