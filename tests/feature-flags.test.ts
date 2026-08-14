import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testDb, resetTestDb, ALEX, MORGAN } from "./helpers";
import { toggleFeatureFlag } from "@/modules/feature-flags/service";

beforeEach(async () => {
  await resetTestDb();
});

afterAll(async () => {
  await testDb.$disconnect();
});

async function getProductionFlag() {
  const flag = await testDb.featureFlag.findUnique({
    where: { key_environment: { key: "instant-refunds-v2", environment: "PRODUCTION" } },
  });
  if (!flag) throw new Error("missing seeded flag instant-refunds-v2 (PRODUCTION)");
  return flag;
}

describe("Test 2: unauthorized feature-flag action", () => {
  it("rejects Alex Reviewer toggling instant-refunds-v2, leaving flag and audit log unchanged", async () => {
    const flag = await getProductionFlag();
    expect(flag.enabled).toBe(false);

    await expect(
      toggleFeatureFlag(
        ALEX,
        { flagId: flag.id, enabled: true, reason: "Reviewer attempting privileged toggle." },
        testDb,
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const unchanged = await getProductionFlag();
    expect(unchanged.enabled).toBe(false);
    expect(unchanged.version).toBe(flag.version);
    const events = await testDb.auditEvent.count({ where: { entityId: flag.id } });
    expect(events).toBe(0);
  });
});

describe("admin feature-flag toggle", () => {
  it("lets Morgan Admin enable instant-refunds-v2 with an audit event", async () => {
    const flag = await getProductionFlag();
    await toggleFeatureFlag(
      MORGAN,
      { flagId: flag.id, enabled: true, reason: "Enabling v2 engine for synthetic demo." },
      testDb,
    );

    const updated = await getProductionFlag();
    expect(updated.enabled).toBe(true);

    const event = await testDb.auditEvent.findFirst({ where: { entityId: flag.id } });
    expect(event!.action).toBe("FEATURE_FLAG_ENABLED");
    expect(event!.actorUserId).toBe(MORGAN.id);
    expect(JSON.parse(event!.beforeState ?? "{}").enabled).toBe(false);
    expect(JSON.parse(event!.afterState ?? "{}").enabled).toBe(true);
  });
});
