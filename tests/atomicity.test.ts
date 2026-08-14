import { describe, it, expect, beforeEach, afterAll } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { testDb, resetTestDb, ALEX } from "./helpers";
import { decideRefund } from "@/modules/refunds/service";
import type { Tx } from "@/lib/db/prisma";

beforeEach(async () => {
  await resetTestDb();
});

afterAll(async () => {
  await testDb.$disconnect();
});

// Wraps the real client so that, inside the transaction, any attempt to write
// an audit event throws. Only the persistence boundary is doubled; the real
// authorization, validation, transition, and business-update code runs.
function dbWithFailingAuditWrites(): PrismaClient {
  const failing = {
    $transaction: (fn: (tx: Tx) => Promise<unknown>) =>
      testDb.$transaction((tx) => {
        const brokenTx = new Proxy(tx, {
          get(target, prop, receiver) {
            if (prop === "auditEvent") {
              return {
                create: () => {
                  throw new Error("Simulated audit-write failure");
                },
              };
            }
            return Reflect.get(target, prop, receiver);
          },
        });
        return fn(brokenTx);
      }),
  };
  return failing as unknown as PrismaClient;
}

describe("Test 6: atomicity of business mutation and audit write", () => {
  it("rolls back the refund update when the audit write fails", async () => {
    const refund = await testDb.refund.findUnique({ where: { refundNumber: "RF-2001" } });
    expect(refund!.status).toBe("PENDING");

    await expect(
      decideRefund(
        ALEX,
        { refundId: refund!.id, decision: "APPROVED", note: "Valid note for atomicity test." },
        dbWithFailingAuditWrites(),
      ),
    ).rejects.toThrow("Simulated audit-write failure");

    const unchanged = await testDb.refund.findUnique({ where: { id: refund!.id } });
    expect(unchanged!.status).toBe("PENDING");
    expect(unchanged!.version).toBe(refund!.version);
    const events = await testDb.auditEvent.count({ where: { entityId: refund!.id } });
    expect(events).toBe(0);
  });
});
