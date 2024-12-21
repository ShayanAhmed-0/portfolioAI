import { z } from "zod";

// Define the schema for user data validation
const giveReviewSchema = z.object({
  orderId: z.string().uuid({
    message: "orderId is required",
  }),
  rating: z.union([
    z.string().min(1, "Rating is required"),
    z.number().refine((value) => value >= 1, {
      message: "Rating is required",
    }),
  ]),
  review: z.string().optional(),
  orderType: z
    .enum(["order", "serviceRequest"])
    .refine(
      (value) => value !== null,
      "Invalid value type should be order,serviceRequest"
    ),
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
