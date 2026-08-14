"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { assignKycCaseToMe, decideKycCase, resumeKycReview } from "@/modules/kyc/service";
import { toActionResult, type ActionResult } from "@/lib/errors";

export async function assignCaseAction(caseId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await assignKycCaseToMe(user, { caseId });
    revalidatePath("/kyc");
    return { ok: true, message: "Case assigned successfully." };
  } catch (error) {
    return toActionResult(error);
  }
}

export async function decideCaseAction(
  caseId: string,
  decision: "APPROVED" | "REJECTED" | "NEEDS_INFORMATION",
  note: string,
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await decideKycCase(user, { caseId, decision, note });
    revalidatePath("/kyc");
    return { ok: true, message: "Decision recorded and added to the audit log." };
  } catch (error) {
    return toActionResult(error);
  }
}

export async function resumeCaseAction(caseId: string, note: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await resumeKycReview(user, { caseId, note });
    revalidatePath("/kyc");
    return { ok: true, message: "Review resumed and added to the audit log." };
  } catch (error) {
    return toActionResult(error);
  }
}
