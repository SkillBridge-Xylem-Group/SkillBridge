import { z } from "zod";

export const onboardingSchema = z.object({
  bio: z.string().trim().max(300, "Bio must be 300 characters or fewer").optional().default(""),
  timezone: z.string().trim().min(1, "Timezone is required"),
  teachSubject: z.string().trim().min(1, "Please select what you can teach"),
  teachTags: z.array(z.string().trim().min(1)).default([]),
  learnSubject: z.string().trim().min(1, "Please select what you want to learn"),
  learnTags: z.array(z.string().trim().min(1)).default([]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
