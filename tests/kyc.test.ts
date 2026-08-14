import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testDb, resetTestDb, ALEX, MORGAN } from "./helpers";
import { assignKycCaseToMe, decideKycCase } from "@/modules/kyc/service";
import { AppError } from "@/lib/errors";

beforeEach(async () => {
  await resetTestDb();
});

afterAll(async () => {
  await testDb.$disconnect();
});

async function getCase(caseNumber: string) {
  const c = await testDb.kycCase.findUnique({ where: { caseNumber } });
  if (!c) throw new Error(`missing seeded case ${caseNumber}`);
  return c;
}

describe("Test 1: permitted KYC action (assign + decide with audit)", () => {
  it("lets Alex assign KYC-1001, move it to review, and approve it with audit events", async () => {
    const c = await getCase("KYC-1001");
    expect(c.status).toBe("PENDING");
    expect(c.assignedToUserId).toBeNull();

    await assignKycCaseToMe(ALEX, { caseId: c.id }, testDb);
    const assigned = await getCase("KYC-1001");
    expect(assigned.status).toBe("IN_REVIEW");
    expect(assigned.assignedToUserId).toBe(ALEX.id);

    await decideKycCase(
      ALEX,
      { caseId: c.id, decision: "APPROVED", note: "All synthetic checks passed." },
      testDb,
    );
    const decided = await getCase("KYC-1001");
    expect(decided.status).toBe("APPROVED");

    const events = await testDb.auditEvent.findMany({
      where: { entityId: c.id },
      orderBy: { occurredAt: "asc" },
    });
    expect(events.map((e) => e.action)).toEqual(["KYC_CASE_ASSIGNED", "KYC_CASE_APPROVED"]);
    expect(events[1].actorUserId).toBe(ALEX.id);
    expect(events[1].reason).toBe("All synthetic checks passed.");
    expect(JSON.parse(events[1].beforeState ?? "{}").status).toBe("IN_REVIEW");
    expect(JSON.parse(events[1].afterState ?? "{}").status).toBe("APPROVED");
  });
});

describe("Test 3: invalid KYC transition", () => {
  it("rejects a decision on an already approved case with no state change and no audit event", async () => {
    const approved = await testDb.kycCase.findFirst({ where: { status: "APPROVED" } });
    expect(approved).not.toBeNull();

    await expect(
      decideKycCase(
        MORGAN,
        { caseId: approved!.id, decision: "REJECTED", note: "Attempting invalid transition." },
        testDb,
      ),
    ).rejects.toMatchObject({ code: "INVALID_TRANSITION" });

    const unchanged = await testDb.kycCase.findUnique({ where: { id: approved!.id } });
    expect(unchanged!.status).toBe("APPROVED");
    expect(unchanged!.version).toBe(approved!.version);
    const events = await testDb.auditEvent.count({ where: { entityId: approved!.id } });
    expect(events).toBe(0);
  });
});

describe("Test 5: reviewer assignment boundary", () => {
  it("rejects Alex deciding a case assigned to another reviewer, with no state change and no audit event", async () => {
    const c = await getCase("KYC-1003"); // IN_REVIEW, assigned to Jordan
    expect(c.assignedToUserId).toBe("user-jordan-reviewer");

    await expect(
      decideKycCase(
        ALEX,
        { caseId: c.id, decision: "APPROVED", note: "Trying to decide someone else's case." },
        testDb,
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const unchanged = await getCase("KYC-1003");
    expect(unchanged.status).toBe("IN_REVIEW");
    expect(unchanged.assignedToUserId).toBe("user-jordan-reviewer");
    const events = await testDb.auditEvent.count({ where: { entityId: c.id } });
    expect(events).toBe(0);
  });

  it("allows an admin to decide a case assigned to another reviewer", async () => {
    const c = await getCase("KYC-1003");
    await decideKycCase(
      MORGAN,
      { caseId: c.id, decision: "REJECTED", note: "Admin override with valid rationale." },
      testDb,
    );
    const decided = await getCase("KYC-1003");
    expect(decided.status).toBe("REJECTED");
  });
});

describe("validation", () => {
  it("rejects a decision note shorter than 10 characters and throws a typed AppError", async () => {
    const c = await getCase("KYC-1007"); // IN_REVIEW assigned to Alex
    let caught: unknown;
    try {
      await decideKycCase(ALEX, { caseId: c.id, decision: "APPROVED", note: "too short" }, testDb);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(AppError);
    expect((caught as AppError).code).toBe("VALIDATION_FAILED");
    const unchanged = await getCase("KYC-1007");
    expect(unchanged.status).toBe("IN_REVIEW");
    const events = await testDb.auditEvent.count({ where: { entityId: c.id } });
    expect(events).toBe(0);
  });
});
