import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { accessToken, asAdmin, TEST_CLIENT_ID, untrustedKey } from "./cognito-tokens.js";

const app = createApp();
const DAY_MS = 24 * 60 * 60 * 1000;

let leadId: string;

// Builds its own leads (source TEST) rather than relying on the demo seed.
beforeAll(async () => {
  const city = await prisma.city.findFirstOrThrow({ where: { stateCode: "KA" } });
  const base = { stateCode: "KA", cityId: city.id, source: "TEST", mobileVerifiedAt: new Date() };
  const t0 = Date.now() - 5 * DAY_MS;

  const lead = await prisma.lead.create({
    data: {
      ...base,
      referenceNumber: "ATB-TEST0001",
      name: "Internal Api Alpha",
      mobile: "6100000001",
      statusCode: "ST-201",
      userType: "ENG",
      createdAt: new Date(t0),
      products: { create: [{ productCode: "FANS" }] },
      statusEvents: {
        create: [
          { statusCode: "ST-100", actor: "APPLICANT", createdAt: new Date(t0) },
          { statusCode: "ST-200", actor: "SYSTEM", createdAt: new Date(t0 + DAY_MS) },
          { statusCode: "ST-201", actor: "Screening Team", createdAt: new Date(t0 + 3 * DAY_MS) },
        ],
      },
    },
  });
  leadId = lead.id;

  await prisma.lead.create({
    data: {
      ...base,
      referenceNumber: "ATB-TEST0002",
      name: "Internal Api Beta",
      mobile: "6100000002",
      statusCode: "ST-203",
      statusEvents: { create: [{ statusCode: "ST-203", actor: "ASM", reason: "Not suitable" }] },
    },
  });
});

afterAll(async () => {
  await prisma.lead.deleteMany({ where: { source: "TEST" } });
  await prisma.$disconnect();
});

describe("GET /api/internal/leads", () => {
  it("lists leads with area, products and when the current status started", async () => {
    const res = await request(app).get("/api/internal/leads").set("Authorization", asAdmin()).query({ search: "Internal Api Alpha" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    const [row] = res.body.items;
    expect(row).toMatchObject({
      referenceNumber: "ATB-TEST0001",
      statusCode: "ST-201",
      userType: "ENG",
      partnerId: null,
      state: { code: "KA" },
      products: [{ code: "FANS", name: "Fans" }],
    });
    expect(row.previousStatusCode).toBe("ST-200");
    // statusSince is the latest history row, not the lead's creation.
    expect(new Date(row.statusSince).getTime()).toBeGreaterThan(new Date(row.createdAt).getTime());
    expect(row.statusEvents).toBeUndefined();
  });

  it("filters by a comma-separated list of status codes", async () => {
    const res = await request(app).get("/api/internal/leads").set("Authorization", asAdmin()).query({ status: "ST-203, ST-999", search: "Internal Api" });
    expect(res.status).toBe(200);
    expect(res.body.items.map((l: { name: string }) => l.name)).toEqual(["Internal Api Beta"]);
    // Only one history row, so there is no previous status.
    expect(res.body.items[0].previousStatusCode).toBeNull();
  });

  it("searches the reference number case-insensitively", async () => {
    const res = await request(app).get("/api/internal/leads").set("Authorization", asAdmin()).query({ search: "atb-test0002" });
    expect(res.body.items.map((l: { referenceNumber: string }) => l.referenceNumber)).toEqual(["ATB-TEST0002"]);
  });

  it("pages results", async () => {
    const res = await request(app).get("/api/internal/leads").set("Authorization", asAdmin()).query({ search: "Internal Api", pageSize: 1, page: 2 });
    expect(res.body).toMatchObject({ total: 2, page: 2, pageSize: 1 });
    expect(res.body.items).toHaveLength(1);
  });

  it("rejects a page size over 100", async () => {
    const res = await request(app).get("/api/internal/leads").set("Authorization", asAdmin()).query({ pageSize: 500 });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/internal/leads/:id", () => {
  it("returns the lead with its history, oldest first", async () => {
    const res = await request(app).get(`/api/internal/leads/${leadId}`).set("Authorization", asAdmin());
    expect(res.status).toBe(200);
    expect(res.body.history.map((h: { statusCode: string }) => h.statusCode)).toEqual(["ST-100", "ST-200", "ST-201"]);
    expect(res.body.history[2]).toMatchObject({ actor: "Screening Team", reason: null });
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/internal/leads/does-not-exist").set("Authorization", asAdmin());
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("sign-in on /api/internal/*", () => {
  const get = (authorization?: string) => {
    const req = request(app).get("/api/internal/leads").query({ search: "Internal Api" });
    return authorization === undefined ? req : req.set("Authorization", authorization);
  };
  const now = () => Math.floor(Date.now() / 1000);

  it("refuses a request without a token", async () => {
    const res = await get();
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it.each([
    ["a non-Bearer scheme", `Basic ${accessToken()}`],
    ["a malformed token", "Bearer not-a-jwt"],
    ["a token signed with an unknown key", `Bearer ${accessToken({}, { key: untrustedKey })}`],
    ["an expired token", `Bearer ${accessToken({ iat: now() - 7200, exp: now() - 3600 })}`],
    ["another user pool's token", `Bearer ${accessToken({ iss: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_Other" })}`],
    ["another app client's token", `Bearer ${accessToken({ client_id: "someone-else" })}`],
    ["an ID token instead of an access token", `Bearer ${accessToken({ token_use: "id", aud: TEST_CLIENT_ID })}`],
  ])("refuses %s", async (_case, authorization) => {
    const res = await get(authorization);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
    expect(res.body.items).toBeUndefined();
  });

  it.each([
    ["a role outside onboarding", ["call_agent"]],
    ["no groups at all", undefined],
  ])("returns 403 for %s", async (_case, groups) => {
    const res = await get(`Bearer ${accessToken({ "cognito:groups": groups })}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it.each([["superadmin"], ["partner_account_admin"], ["PARTNER_ACCOUNT_ADMIN"]])(
    "lets %s in (groups match case-insensitively)",
    async (group) => {
      const res = await get(`Bearer ${accessToken({ "cognito:groups": ["asm", group] })}`);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.headers["cache-control"]).toBe("no-store");
    },
  );
});
