import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testDb, resetTestDb, ALEX } from "./helpers";
import { decideRefund } from "@/modules/refunds/service";

beforeEach(async () => {
  await resetTestDb();
});

afterAll(async () => {
  await testDb.$disconnect();
});

describe("Test 4: refund decision audit", () => {
  it("approves RF-2001 and writes an audit event with actor, reason, before and after state", async () => {
    const refund = await testDb.refund.findUnique({ where: { refundNumber: "RF-2001" } });
    expect(refund!.status).toBe("PENDING");

    await decideRefund(
      ALEX,
      { refundId: refund!.id, decision: "APPROVED", note: "Duplicate charge confirmed in synthetic ledger." },
      testDb,
    );

    const updated = await testDb.refund.findUnique({ where: { id: refund!.id } });
    expect(updated!.status).toBe("APPROVED");

    const event = await testDb.auditEvent.findFirst({ where: { entityId: refund!.id } });
    expect(event).not.toBeNull();
    expect(event!.action).toBe("REFUND_APPROVED");
    expect(event!.actorUserId).toBe(ALEX.id);
    expect(event!.actorName).toBe(ALEX.name);
    expect(event!.reason).toBe("Duplicate charge confirmed in synthetic ledger.");
    expect(JSON.parse(event!.beforeState ?? "{}").status).toBe("PENDING");
    expect(JSON.parse(event!.afterState ?? "{}").status).toBe("APPROVED");
  });

  it("rejects a decision on a non-pending refund with no state change and no audit event", async () => {
    const approved = await testDb.refund.findFirst({ where: { status: "APPROVED" } });
    await expect(
      decideRefund(
        ALEX,
        { refundId: approved!.id, decision: "REJECTED", note: "Attempting to re-decide refund." },
        testDb,
      ),
    ).rejects.toMatchObject({ code: "INVALID_TRANSITION" });

    const unchanged = await testDb.refund.findUnique({ where: { id: approved!.id } });
    expect(unchanged!.status).toBe("APPROVED");
    const events = await testDb.auditEvent.count({ where: { entityId: approved!.id } });
    expect(events).toBe(0);
  });
});
