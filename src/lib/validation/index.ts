import { z } from "zod";
import { validationFailed } from "@/lib/errors";

export const decisionNoteSchema = z
  .string()
  .trim()
  .min(10, "A decision note of at least 10 characters is required.");

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const first = result.error.issues[0];
    throw validationFailed(first?.message ?? "Invalid input.");
  }
  return result.data;
}
