"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { toggleFeatureFlag } from "@/modules/feature-flags/service";
import { toActionResult, type ActionResult } from "@/lib/errors";

export async function toggleFlagAction(
  flagId: string,
  enabled: boolean,
  reason: string,
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await toggleFeatureFlag(user, { flagId, enabled, reason });
    revalidatePath("/feature-flags");
    return {
      ok: true,
      message: `Flag ${enabled ? "enabled" : "disabled"} and added to the audit log.`,
    };
  } catch (error) {
    return toActionResult(error);
  }
}
