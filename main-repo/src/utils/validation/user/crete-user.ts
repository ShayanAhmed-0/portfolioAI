import { z } from "zod";

// Define the schema for user data validation
const userSchema = z.object({
  username: z.string().min(1, "username is required"),
  about: z.string().min(1, "about is required"),
  age: z.string(),
  skills: z.array(z.string()),
  deviceToken: z
    .string()
    .min(10, "Device token must be between 10 and 200 characters")
    .max(200, "Device token must be between 10 and 200 characters"),
  deviceType: z
    .enum(["ios", "android"])
    .refine((value) => value !== null, "Invalid device type"),
  
});

// Type inference from the schema
type UserInput = z.infer<typeof userSchema>;

// Validation function
export const validateCreateUserProfile = (data: unknown) => {
  try {
    const validatedData = userSchema.parse(data);
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
