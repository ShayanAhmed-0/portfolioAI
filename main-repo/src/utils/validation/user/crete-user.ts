import { z } from "zod";

const experienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format (dd/mm/yyyy)"),
  endDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format (dd/mm/yyyy)"),
  description: z.string().nullable(), // or use z.null() if only null is allowed
});
const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  startDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format (dd/mm/yyyy)"),
  endDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format (dd/mm/yyyy)"),
});

const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  professional_title: z.string().min(1, "Professional title is required"),
  latitude: z.number().min(-90).max(90), 
  longitude: z.number().min(-180).max(180),
  location_name: z.string().min(1, "location_name is required"),
  skills: z.array(z.string()),
  about: z.string().min(1, "About is required"),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  isVectorized:z.boolean(),
  deviceToken: z
    .string()
    .min(10, "Device token must be between 10 and 200 characters")
    .max(200, "Device token must be between 10 and 200 characters")
    .optional(),
  
});

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
