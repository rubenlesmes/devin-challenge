import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seed(client: PrismaClient = prisma) {
  await client.auditEvent.deleteMany();
  await client.kycCase.deleteMany();
  await client.refund.deleteMany();
  await client.featureFlag.deleteMany();
  await client.user.deleteMany();

  const alex = await client.user.create({
    data: {
      id: "user-alex-reviewer",
      name: "Alex Reviewer",
      email: "alex.reviewer@example.test",
      role: "REVIEWER",
    },
  });
  const morgan = await client.user.create({
    data: {
      id: "user-morgan-admin",
      name: "Morgan Admin",
      email: "morgan.admin@example.test",
      role: "ADMIN",
    },
  });
  const jordan = await client.user.create({
    data: {
      id: "user-jordan-reviewer",
      name: "Jordan Reviewer",
      email: "jordan.reviewer@example.test",
      role: "REVIEWER",
    },
  });

  const facts = (items: string[]) => JSON.stringify(items);

  const kycCases = [
    {
      caseNumber: "KYC-1001",
      customerName: "Taylor Quinn",
      customerEmail: "taylor.quinn@example.test",
      country: "US",
      riskTier: "MEDIUM",
      status: "PENDING",
      assignedToUserId: null,
      notes: facts([
        "Identity document matches submitted name",
        "Address verified against synthetic utility record",
        "No adverse media hits in synthetic screening",
      ]),
    },
    {
      caseNumber: "KYC-1002",
      customerName: "Riley Chen",
      customerEmail: "riley.chen@example.test",
      country: "GB",
      riskTier: "LOW",
      status: "PENDING",
      assignedToUserId: null,
      notes: facts(["Low-risk retail account", "Domestic residency confirmed"]),
    },
    {
      caseNumber: "KYC-1003",
      customerName: "Sam Okafor",
      customerEmail: "sam.okafor@example.test",
      country: "NG",
      riskTier: "HIGH",
      status: "IN_REVIEW",
      assignedToUserId: jordan.id,
      notes: facts([
        "High-value account opening",
        "Source-of-funds declaration pending secondary check",
      ]),
    },
    {
      caseNumber: "KYC-1004",
      customerName: "Jamie Alvarez",
      customerEmail: "jamie.alvarez@example.test",
      country: "MX",
      riskTier: "MEDIUM",
      status: "NEEDS_INFORMATION",
      assignedToUserId: alex.id,
      notes: facts(["Awaiting synthetic proof-of-address refresh"]),
    },
    {
      caseNumber: "KYC-1005",
      customerName: "Casey Dubois",
      customerEmail: "casey.dubois@example.test",
      country: "FR",
      riskTier: "LOW",
      status: "APPROVED",
      assignedToUserId: alex.id,
      notes: facts(["Standard retail onboarding, all checks passed"]),
    },
    {
      caseNumber: "KYC-1006",
      customerName: "Morgan Silva",
      customerEmail: "morgan.silva@example.test",
      country: "BR",
      riskTier: "HIGH",
      status: "REJECTED",
      assignedToUserId: jordan.id,
      notes: facts(["Synthetic sanctions-screening hit could not be cleared"]),
    },
    {
      caseNumber: "KYC-1007",
      customerName: "Alexis Novak",
      customerEmail: "alexis.novak@example.test",
      country: "DE",
      riskTier: "MEDIUM",
      status: "IN_REVIEW",
      assignedToUserId: alex.id,
      notes: facts(["Business account, beneficial-owner review in progress"]),
    },
    {
      caseNumber: "KYC-1008",
      customerName: "Drew Tanaka",
      customerEmail: "drew.tanaka@example.test",
      country: "JP",
      riskTier: "LOW",
      status: "PENDING",
      assignedToUserId: null,
      notes: facts(["Standard onboarding, no flags"]),
    },
    {
      caseNumber: "KYC-1009",
      customerName: "Skyler Haddad",
      customerEmail: "skyler.haddad@example.test",
      country: "AE",
      riskTier: "HIGH",
      status: "PENDING",
      assignedToUserId: null,
      notes: facts(["High-risk jurisdiction rules apply", "Enhanced due diligence required"]),
    },
    {
      caseNumber: "KYC-1010",
      customerName: "Rowan Petrov",
      customerEmail: "rowan.petrov@example.test",
      country: "PL",
      riskTier: "MEDIUM",
      status: "NEEDS_INFORMATION",
      assignedToUserId: jordan.id,
      notes: facts(["Requested clarification on synthetic employment record"]),
    },
    {
      caseNumber: "KYC-1011",
      customerName: "Avery Lindqvist",
      customerEmail: "avery.lindqvist@example.test",
      country: "SE",
      riskTier: "LOW",
      status: "APPROVED",
      assignedToUserId: morgan.id,
      notes: facts(["Approved by admin during synthetic backfill"]),
    },
    {
      caseNumber: "KYC-1012",
      customerName: "Charlie Mbeki",
      customerEmail: "charlie.mbeki@example.test",
      country: "ZA",
      riskTier: "MEDIUM",
      status: "PENDING",
      assignedToUserId: null,
      notes: facts(["Standard onboarding, secondary screening queued"]),
    },
  ];
  for (const c of kycCases) {
    await client.kycCase.create({ data: c });
  }

  const refunds = [
    { refundNumber: "RF-2001", customerName: "Taylor Quinn", amountCents: 12999, currency: "USD", reason: "Duplicate charge", status: "PENDING", requestedBy: "support.bot@example.test" },
    { refundNumber: "RF-2002", customerName: "Riley Chen", amountCents: 4500, currency: "GBP", reason: "Service not delivered", status: "PENDING", requestedBy: "support.bot@example.test" },
    { refundNumber: "RF-2003", customerName: "Sam Okafor", amountCents: 250000, currency: "USD", reason: "Account closure balance return", status: "PENDING", requestedBy: "ops.queue@example.test" },
    { refundNumber: "RF-2004", customerName: "Jamie Alvarez", amountCents: 999, currency: "MXN", reason: "Subscription cancelled within trial", status: "APPROVED", requestedBy: "support.bot@example.test" },
    { refundNumber: "RF-2005", customerName: "Casey Dubois", amountCents: 78050, currency: "EUR", reason: "Disputed transaction", status: "REJECTED", requestedBy: "disputes@example.test" },
    { refundNumber: "RF-2006", customerName: "Morgan Silva", amountCents: 15000, currency: "BRL", reason: "Goodwill credit request", status: "PENDING", requestedBy: "support.bot@example.test" },
    { refundNumber: "RF-2007", customerName: "Alexis Novak", amountCents: 32000, currency: "EUR", reason: "Pricing error", status: "PENDING", requestedBy: "billing@example.test" },
    { refundNumber: "RF-2008", customerName: "Drew Tanaka", amountCents: 120000, currency: "JPY", reason: "Duplicate charge", status: "APPROVED", requestedBy: "support.bot@example.test" },
    { refundNumber: "RF-2009", customerName: "Skyler Haddad", amountCents: 5600, currency: "AED", reason: "Fee waiver approved by ops", status: "PENDING", requestedBy: "ops.queue@example.test" },
    { refundNumber: "RF-2010", customerName: "Rowan Petrov", amountCents: 2100, currency: "PLN", reason: "Service outage credit", status: "PENDING", requestedBy: "support.bot@example.test" },
  ];
  for (const r of refunds) {
    await client.refund.create({ data: r });
  }

  const flags = [
    { key: "instant-refunds-v2", description: "Enable the v2 instant-refund decision engine", environment: "PRODUCTION", enabled: false, owner: "payments-team@example.test" },
    { key: "instant-refunds-v2", description: "Enable the v2 instant-refund decision engine", environment: "STAGING", enabled: true, owner: "payments-team@example.test" },
    { key: "kyc-auto-triage", description: "Automatically triage low-risk KYC cases", environment: "PRODUCTION", enabled: true, owner: "risk-team@example.test" },
    { key: "kyc-auto-triage", description: "Automatically triage low-risk KYC cases", environment: "DEVELOPMENT", enabled: true, owner: "risk-team@example.test" },
    { key: "new-ops-dashboard", description: "Show the redesigned operations dashboard", environment: "STAGING", enabled: true, owner: "internal-tools@example.test" },
    { key: "new-ops-dashboard", description: "Show the redesigned operations dashboard", environment: "PRODUCTION", enabled: false, owner: "internal-tools@example.test" },
    { key: "audit-export", description: "Allow CSV export of audit events", environment: "DEVELOPMENT", enabled: false, owner: "compliance@example.test" },
    { key: "high-risk-dual-approval", description: "Require dual approval for high-risk KYC decisions", environment: "PRODUCTION", enabled: true, owner: "risk-team@example.test" },
  ];
  for (const f of flags) {
    await client.featureFlag.create({ data: f });
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seed()
    .then(async () => {
      await prisma.$disconnect();
      console.log("Seed complete.");
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
