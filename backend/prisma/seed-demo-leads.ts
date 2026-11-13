import { PrismaClient } from "@prisma/client";

// Demo applicants at every stage of the onboarding journey, for building the CRM's
// onboarding screens before the later steps exist. Status codes and step order follow
// BRD Section 12 and table 6.1. Run with `npm run db:seed:demo` after `npm run db:seed`.
//
// Rerunnable: it deletes every lead with source "DEMO" (and their history) first, then
// recreates them with timestamps relative to now, so ageing always looks current.
// Real registrations (source "WEB") are never touched.

if (process.env.NODE_ENV === "production") {
  console.error("seed-demo-leads.ts is for development only.");
  process.exit(1);
}

const prisma = new PrismaClient();

/** Happy path for ASP Owner, ASP Coordinator and ENG (all 19 steps). */
const FULL_PATH = [
  "ST-100", "ST-200", "ST-201", "ST-202", // S1–S4 registration and screening
  "ST-300", "ST-302", // S5–S6 training and assessment
  "ST-400", "ST-401", "ST-402", // S7–S9 documents and verification (Gate 1)
  "ST-500", "ST-501", // S10–S11 agreement
  "ST-600", "ST-601", "ST-602", // S12–S13 HANA code and deposit (Gate 2)
  "ST-700", "ST-701", "ST-800", "ST-801", // S14–S17 account, validation, mapping, approval
  "ST-900", "ST-901", "ST-902", // S18 dispatch (Gate 3)
  "ST-1000", "ST-1100", // S19 pincode mapping, go-live
] as const;

/**
 * Technician path (table 6.1): S1–S9, then S15–S17. No agreement, deposit, HANA code,
 * account creation, dispatch or pincode mapping. How a technician gets a login without
 * S14, and what status ends the journey, are open (OI-03, OI-04), so no demo technician
 * goes past ST-801.
 */
const TECHNICIAN_PATH = [
  "ST-100", "ST-200", "ST-201", "ST-202", "ST-300", "ST-302",
  "ST-400", "ST-401", "ST-402", "ST-701", "ST-800", "ST-801",
] as const;

/** Days a lead typically sits in each status before moving on (near the proposed SLAs). */
const DAYS_IN: Record<string, number> = {
  "ST-100": 0.3, "ST-200": 1.6, "ST-201": 1.4, "ST-202": 1.8,
  "ST-300": 6.5, "ST-301": 5, "ST-302": 1.2,
  "ST-400": 2.6, "ST-401": 1.5, "ST-402": 0.6,
  "ST-500": 0.8, "ST-501": 0.4,
  "ST-600": 1.7, "ST-601": 2.2, "ST-602": 0.3, "ST-603": 1,
  "ST-700": 0.4, "ST-701": 1.3, "ST-702": 1.5,
  "ST-800": 0.9, "ST-801": 1.4, "ST-802": 1,
  "ST-900": 1.2, "ST-901": 2.8, "ST-902": 0.5, "ST-903": 2,
  "ST-1000": 1.3,
};

/** Who moves a lead into each status. */
const ACTOR: Record<string, string> = {
  "ST-100": "APPLICANT", "ST-101": "SYSTEM",
  "ST-200": "SYSTEM", "ST-201": "Screening Team", "ST-202": "ASM", "ST-203": "ASM",
  "ST-300": "Trainer", "ST-301": "Trainer", "ST-302": "Trainer",
  "ST-400": "Central Team", "ST-401": "APPLICANT", "ST-402": "SYSTEM", "ST-403": "SYSTEM",
  "ST-500": "Central Team", "ST-501": "APPLICANT",
  "ST-600": "Central Team", "ST-601": "SYSTEM", "ST-602": "SYSTEM", "ST-603": "SYSTEM",
  "ST-700": "Central Team", "ST-701": "SYSTEM", "ST-702": "APPLICANT",
  "ST-800": "Central Team", "ST-801": "SYSTEM", "ST-802": "Trainer",
  "ST-900": "Trainer", "ST-901": "Store Team", "ST-902": "SYSTEM", "ST-903": "SYSTEM",
  "ST-1000": "SYSTEM", "ST-1100": "Central Team",
};

/** The happy path up to and including `code`. */
function upTo(path: readonly string[], code: string): string[] {
  const i = path.indexOf(code);
  if (i < 0) throw new Error(`${code} is not on the path`);
  return path.slice(0, i + 1);
}

interface DemoLead {
  name: string;
  mobile: string;
  stateCode: string;
  city: string;
  products: string[];
  userType: string | null;
  /** Statuses in order; the last is the current one. */
  path: string[];
  /** Days spent so far in the current status. */
  currentDays: number;
  /** Reasons for specific statuses (rejections, holds, exceptions). */
  reasons?: Record<string, string>;
}

const LEADS: DemoLead[] = [
  // Phase 1: registration and screening. User type is decided in screening, so null here.
  { name: "Rakesh Electricals", mobile: "9800010001", stateCode: "MH", city: "Pune", products: ["FANS"], userType: null,
    path: ["ST-100"], currentDays: 0.2 },
  { name: "Mohammed Rafiq", mobile: "9800010002", stateCode: "LA", city: "Leh", products: ["FANS", "WATER_PURIFIERS"], userType: null,
    path: ["ST-100", "ST-101"], currentDays: 9,
    reasons: { "ST-101": "No partner requirement in Leh right now (BR-01). Kept in the pipeline pool." } },
  { name: "Deepak Verma", mobile: "9800010003", stateCode: "DL", city: "Rohini", products: ["FANS"], userType: null,
    path: ["ST-403"], currentDays: 2,
    reasons: { "ST-403": "Matched the Blocked Partner Master (BR-08)." } },
  { name: "Imran Shaikh", mobile: "9800010004", stateCode: "MH", city: "Mumbai", products: ["FANS", "SMART_LOCKS"], userType: null,
    path: upTo(FULL_PATH, "ST-200"), currentDays: 3.1 },
  { name: "Priya Nair", mobile: "9800010005", stateCode: "KL", city: "Kochi", products: ["WATER_PURIFIERS"], userType: null,
    path: upTo(FULL_PATH, "ST-201"), currentDays: 0.9 },
  { name: "Sunil Yadav", mobile: "9800010006", stateCode: "UP", city: "Lucknow", products: ["FANS", "KITCHEN_APPLIANCES"], userType: null,
    path: upTo(FULL_PATH, "ST-202"), currentDays: 1.2 },
  { name: "Arjun Patil", mobile: "9800010007", stateCode: "MH", city: "Nashik", products: ["FANS"], userType: null,
    path: [...upTo(FULL_PATH, "ST-201"), "ST-203"], currentDays: 4,
    reasons: { "ST-203": "Rejected at ASM screening: no prior appliance service experience." } },

  // Phase 1: training and assessment.
  { name: "Kavita Joshi", mobile: "9800010008", stateCode: "MP", city: "Indore", products: ["FANS", "WATER_PURIFIERS"], userType: "ENG",
    path: upTo(FULL_PATH, "ST-300"), currentDays: 3.5 },
  { name: "Ganesh Kumar", mobile: "9800010009", stateCode: "TN", city: "Chennai", products: ["FANS"], userType: "TECHNICIAN",
    path: [...upTo(TECHNICIAN_PATH, "ST-302"), "ST-301"], currentDays: 2,
    reasons: { "ST-301": "Post-training assessment failed (attempt 1). Re-training scheduled (BR-18)." } },
  { name: "Sai Krishna Enterprises", mobile: "9800010010", stateCode: "TS", city: "Hyderabad", products: ["FANS", "WATER_PURIFIERS", "KITCHEN_APPLIANCES"], userType: "ASP_OWNER",
    path: upTo(FULL_PATH, "ST-302"), currentDays: 0.8 },

  // Phase 2: documents, agreement, HANA code and deposit.
  { name: "Neha Gupta", mobile: "9800010011", stateCode: "RJ", city: "Jaipur", products: ["SMART_LOCKS"], userType: "ENG",
    path: upTo(FULL_PATH, "ST-400"), currentDays: 4.2 },
  { name: "Vijay Service Point", mobile: "9800010012", stateCode: "KA", city: "Bengaluru", products: ["FANS", "SMART_LOCKS"], userType: "ASP_OWNER",
    path: upTo(FULL_PATH, "ST-402"), currentDays: 0.5 },
  { name: "Anil Thakur", mobile: "9800010013", stateCode: "CH", city: "Chandigarh", products: ["FANS"], userType: "ENG",
    path: upTo(FULL_PATH, "ST-501"), currentDays: 1.2 },
  { name: "Shree Ganesh Appliance Care", mobile: "9800010014", stateCode: "GJ", city: "Ahmedabad", products: ["FANS", "KITCHEN_APPLIANCES"], userType: "ASP_OWNER",
    path: [...upTo(FULL_PATH, "ST-600"), "ST-603"], currentDays: 1.6,
    reasons: { "ST-603": "WeConnect did not return a SAP HANA code. Retry in progress (INT-03)." } },
  { name: "Ravi Teja", mobile: "9800010015", stateCode: "AP", city: "Vijayawada", products: ["FANS", "WATER_PURIFIERS"], userType: "ENG",
    path: upTo(FULL_PATH, "ST-601"), currentDays: 2.3 },

  // Phase 3: account, validation, mapping and approval.
  { name: "Meera Iyer", mobile: "9800010016", stateCode: "TN", city: "Coimbatore", products: ["WATER_PURIFIERS"], userType: "ENG",
    path: [...upTo(FULL_PATH, "ST-701"), "ST-702"], currentDays: 1,
    reasons: { "ST-702": "Partner reports the billing address pincode is wrong." } },
  { name: "Hari Om Services", mobile: "9800010017", stateCode: "UP", city: "Kanpur", products: ["FANS", "SMART_LOCKS"], userType: "ASP_OWNER",
    path: [...upTo(FULL_PATH, "ST-801"), "ST-802"], currentDays: 0.7,
    reasons: { "ST-802": "Smart locks mapped, but the partner has not been trained on smart locks." } },
  { name: "Suresh Babu", mobile: "9800010018", stateCode: "KA", city: "Mysuru", products: ["FANS"], userType: "TECHNICIAN",
    path: upTo(TECHNICIAN_PATH, "ST-801"), currentDays: 1.1 },

  // Phase 3: dispatch, pincode mapping and go-live.
  { name: "Bright Home Solutions", mobile: "9800010019", stateCode: "HR", city: "Gurugram", products: ["FANS", "WATER_PURIFIERS", "SMART_LOCKS"], userType: "ASP_OWNER",
    path: upTo(FULL_PATH, "ST-901"), currentDays: 2.1 },
  { name: "Farhan Ali", mobile: "9800010020", stateCode: "BR", city: "Patna", products: ["FANS"], userType: "ENG",
    path: [...upTo(FULL_PATH, "ST-901"), "ST-903"], currentDays: 1.4,
    reasons: { "ST-903": "Vinculum: consignment returned to origin, address not found." } },
  { name: "Lakshmi Electricals", mobile: "9800010021", stateCode: "TN", city: "Madurai", products: ["FANS", "KITCHEN_APPLIANCES"], userType: "ASP_OWNER",
    path: upTo(FULL_PATH, "ST-1000"), currentDays: 0.9 },
  { name: "Rohit Sharma", mobile: "9800010022", stateCode: "UP", city: "Noida", products: ["FANS", "WATER_PURIFIERS"], userType: "ENG",
    path: upTo(FULL_PATH, "ST-1100"), currentDays: 3 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

async function main() {
  const removed = await prisma.lead.deleteMany({ where: { source: "DEMO" } });

  const now = Date.now();
  for (const [i, lead] of LEADS.entries()) {
    const city = await prisma.city.findFirst({ where: { stateCode: lead.stateCode, name: lead.city } });
    if (!city) throw new Error(`City ${lead.city} (${lead.stateCode}) is not in the area master. Run npm run db:seed first.`);

    // Walk backwards from now: the current status started `currentDays` ago, and each
    // earlier status lasted its DAYS_IN value.
    const durations = lead.path.map((code, idx) =>
      idx === lead.path.length - 1 ? lead.currentDays : (DAYS_IN[code] ?? 1),
    );
    let t = now - durations.reduce((a, b) => a + b, 0) * DAY_MS;
    const events = lead.path.map((code, idx) => {
      const at = new Date(t);
      t += durations[idx]! * DAY_MS;
      return { statusCode: code, actor: ACTOR[code] ?? "SYSTEM", reason: lead.reasons?.[code] ?? null, createdAt: at };
    });
    const createdAt = events[0]!.createdAt;

    await prisma.lead.create({
      data: {
        referenceNumber: `ATB-DEMO${String(i + 1).padStart(4, "0")}`,
        name: lead.name,
        mobile: lead.mobile,
        mobileVerifiedAt: createdAt,
        stateCode: lead.stateCode,
        cityId: city.id,
        statusCode: lead.path[lead.path.length - 1]!,
        source: "DEMO",
        userType: lead.userType,
        createdAt,
        products: { create: lead.products.map((productCode) => ({ productCode })) },
        statusEvents: { create: events },
      },
    });
  }

  console.log(`Removed ${removed.count} demo leads, created ${LEADS.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
