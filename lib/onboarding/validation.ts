import { z } from "zod";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "@/lib/username";

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, "Username is too short")
    .max(USERNAME_MAX_LENGTH, "Username is too long"),
  bio: z.string().trim().max(300, "Bio must be 300 characters or fewer").optional().default(""),
  timezone: z.string().trim().min(1, "Timezone is required"),
  teachSubject: z.string().trim().min(1, "Please select what you can teach"),
  teachTags: z.array(z.string().trim().min(1)).default([]),
  learnSubject: z.string().trim().min(1, "Please select what you want to learn"),
  learnTags: z.array(z.string().trim().min(1)).default([]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
