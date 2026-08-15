import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testDb, resetTestDb, ALEX, MORGAN } from "./helpers";
import { assignKycCaseToMe } from "@/modules/kyc/service";
import { decideRefund } from "@/modules/refunds/service";
import { AppError } from "@/lib/errors";

// Added during the Claude Code finalization session: the optimistic-concurrency
// CONFLICT path existed in every service but had no test coverage at baseline.

beforeEach(async () => {
  await resetTestDb();
});

afterAll(async () => {
  await testDb.$disconnect();
});

describe("Optimistic concurrency: stale expectedVersion is rejected", () => {
  it("rejects a KYC assignment with a stale expectedVersion, leaving state and audit log unchanged", async () => {
    const c = await testDb.kycCase.findUnique({ where: { caseNumber: "KYC-1001" } });
    expect(c).not.toBeNull();
    expect(c!.version).toBe(0);

    await expect(
      assignKycCaseToMe(ALEX, { caseId: c!.id, expectedVersion: c!.version + 1 }, testDb),
    ).rejects.toMatchObject({ code: "CONFLICT" } satisfies Partial<AppError>);

    const after = await testDb.kycCase.findUnique({ where: { caseNumber: "KYC-1001" } });
    expect(after!.status).toBe("PENDING");
    expect(after!.assignedToUserId).toBeNull();
    expect(after!.version).toBe(0);
    expect(await testDb.auditEvent.count({ where: { entityId: c!.id } })).toBe(0);
  });

  it("accepts a mutation with the current expectedVersion and increments the version", async () => {
    const r = await testDb.refund.findUnique({ where: { refundNumber: "RF-2001" } });
    expect(r).not.toBeNull();

    await decideRefund(
      MORGAN,
      { refundId: r!.id, decision: "APPROVED", note: "Version-checked synthetic approval.", expectedVersion: r!.version },
      testDb,
    );

    const after = await testDb.refund.findUnique({ where: { refundNumber: "RF-2001" } });
    expect(after!.status).toBe("APPROVED");
    expect(after!.version).toBe(r!.version + 1);
  });

  it("rejects a refund decision with a stale expectedVersion after a concurrent update", async () => {
    const r = await testDb.refund.findUnique({ where: { refundNumber: "RF-2002" } });
    expect(r).not.toBeNull();
    const staleVersion = r!.version;

    // A concurrent actor decides the refund first.
    await decideRefund(
      MORGAN,
      { refundId: r!.id, decision: "REJECTED", note: "Concurrent synthetic rejection.", expectedVersion: staleVersion },
      testDb,
    );

    // The stale client retries with the old version and must be rejected.
    await expect(
      decideRefund(
        ALEX,
        { refundId: r!.id, decision: "APPROVED", note: "Stale approval attempt.", expectedVersion: staleVersion },
        testDb,
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" } satisfies Partial<AppError>);

    const after = await testDb.refund.findUnique({ where: { refundNumber: "RF-2002" } });
    expect(after!.status).toBe("REJECTED");
    expect(await testDb.auditEvent.count({ where: { entityId: r!.id } })).toBe(1);
  });
});
