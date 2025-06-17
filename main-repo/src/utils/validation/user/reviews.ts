import { z } from "zod";

// Define the schema for user data validation
const giveReviewSchema = z.object({
  profileId: z.string(),
    review: z.string(),
    rating: z.number().min(1).max(5),
});

// Type inference from the schema
type UserInput = z.infer<typeof giveReviewSchema>;

// Validation function
export const validateGiveReview = (data: unknown) => {
  try {
    const validatedData = giveReviewSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    throw error;
  }
};
