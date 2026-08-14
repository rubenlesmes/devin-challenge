"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { decideRefund } from "@/modules/refunds/service";
import { toActionResult, type ActionResult } from "@/lib/errors";

export async function decideRefundAction(
  refundId: string,
  decision: "APPROVED" | "REJECTED",
  note: string,
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    await decideRefund(user, { refundId, decision, note });
    revalidatePath("/refunds");
    return { ok: true, message: "Decision recorded and added to the audit log." };
  } catch (error) {
    return toActionResult(error);
  }
}
