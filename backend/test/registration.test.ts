import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";

const app = createApp();

let stateCode: string;
let cityId: number;
let otherStateCityId: number;
let mobileSeq = 7000000000;
const nextMobile = () => String(mobileSeq++);

beforeAll(async () => {
  const mh = await prisma.state.findUniqueOrThrow({ where: { code: "MH" }, include: { cities: true } });
  const ka = await prisma.city.findFirstOrThrow({ where: { stateCode: "KA" } });
  stateCode = mh.code;
  cityId = mh.cities[0]!.id;
  otherStateCityId = ka.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

function registration(mobile: string, overrides: Record<string, unknown> = {}) {
  return {
    name: "Shree Sai Services",
    mobile,
    otp: "1234",
    productCodes: ["FANS", "SMART_LOCKS"],
    stateCode,
    cityId,
    ...overrides,
  };
}

async function sendOtp(mobile: string) {
  return request(app).post("/api/otp").send({ mobile });
}

describe("GET /api/masters", () => {
  it("returns products and states with cities", async () => {
    const res = await request(app).get("/api/masters");
    expect(res.status).toBe(200);
    expect(res.body.products.map((p: { code: string }) => p.code)).toEqual([
      "FANS",
      "WATER_PURIFIERS",
      "KITCHEN_APPLIANCES",
      "SMART_LOCKS",
    ]);
    expect(res.body.states.length).toBeGreaterThan(30);
    expect(res.body.states[0].cities.length).toBeGreaterThan(0);
  });
});

describe("POST /api/otp", () => {
  it("rejects a mobile number that does not start with 6-9", async () => {
    const res = await sendOtp("5123456789");
    expect(res.status).toBe(400);
    expect(res.body.error.fields.mobile).toBeDefined();
  });

  it("tells the client the code while the mock sender is active", async () => {
    const res = await sendOtp(nextMobile());
    expect(res.status).toBe(200);
    expect(res.body.mockCode).toBe("1234");
  });
});

describe("POST /api/registrations", () => {
  it("creates a Registered (ST-100) lead after OTP verification", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    const res = await request(app).post("/api/registrations").send(registration(mobile));

    expect(res.status).toBe(201);
    expect(res.body.referenceNumber).toMatch(/^ATB-[0-9A-Z]{8}$/);
    const lead = await prisma.lead.findUniqueOrThrow({
      where: { mobile },
      include: { products: true },
    });
    expect(lead.statusCode).toBe("ST-100");
    expect(lead.products.map((p) => p.productCode).sort()).toEqual(["FANS", "SMART_LOCKS"]);
    expect(lead.cityId).toBe(cityId);
  });

  it("records the first status history row", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    await request(app).post("/api/registrations").send(registration(mobile));
    const lead = await prisma.lead.findUniqueOrThrow({ where: { mobile }, include: { statusEvents: true } });
    expect(lead.statusEvents).toHaveLength(1);
    expect(lead.statusEvents[0]).toMatchObject({ statusCode: "ST-100", actor: "APPLICANT", reason: null });
  });

  it("normalises whitespace in the name", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    await request(app).post("/api/registrations").send(registration(mobile, { name: "  Ravi   Kumar  " }));
    const lead = await prisma.lead.findUniqueOrThrow({ where: { mobile } });
    expect(lead.name).toBe("Ravi Kumar");
  });

  it("rejects a wrong OTP", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    const res = await request(app).post("/api/registrations").send(registration(mobile, { otp: "9999" }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("OTP_INVALID");
    expect(res.body.error.fields.otp).toBeDefined();
  });

  it("caps OTP attempts even when wrong guesses arrive in parallel", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    const guesses = ["1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888"];
    await Promise.all(
      guesses.map((otp) => request(app).post("/api/registrations").send(registration(mobile, { otp }))),
    );

    const challenge = await prisma.otpChallenge.findFirstOrThrow({ where: { mobile } });
    expect(challenge.attempts).toBe(5); // OTP_MAX_ATTEMPTS default

    // The cap holds for the right code too: a new OTP is needed.
    const res = await request(app).post("/api/registrations").send(registration(mobile));
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("OTP_TOO_MANY_ATTEMPTS");
  });

  it("rejects registration when no OTP was requested", async () => {
    const res = await request(app).post("/api/registrations").send(registration(nextMobile()));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("OTP_EXPIRED");
  });

  it("blocks a duplicate mobile number and names the field only (BR-06)", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    await request(app).post("/api/registrations").send(registration(mobile));

    await sendOtp(mobile);
    const res = await request(app)
      .post("/api/registrations")
      .send(registration(mobile, { name: "Another Name" }));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("DUPLICATE_MOBILE");
    expect(res.body.error.message).toBe("This mobile number is already registered.");
    expect(JSON.stringify(res.body)).not.toContain("Shree Sai");
  });

  it("puts a Blocked Partner Master match on hold (ST-403) without telling the applicant", async () => {
    const mobile = nextMobile();
    await prisma.blockedPartner.create({ data: { mobile, reason: "test" } });
    await sendOtp(mobile);
    const res = await request(app).post("/api/registrations").send(registration(mobile));

    expect(res.status).toBe(201);
    expect(Object.keys(res.body)).toEqual(["referenceNumber"]);
    const lead = await prisma.lead.findUniqueOrThrow({ where: { mobile }, include: { statusEvents: true } });
    expect(lead.statusCode).toBe("ST-403");
    expect(lead.statusEvents[0]).toMatchObject({ statusCode: "ST-403", actor: "SYSTEM" });
    expect(lead.statusEvents[0]!.reason).toContain("BR-08");
  });

  it.each([
    ["too short", "AB"],
    ["disallowed characters", "Ravi <script>"],
    ["no letters", "12345"],
  ])("rejects a name that is %s (F-01)", async (_label, name) => {
    const res = await request(app).post("/api/registrations").send(registration(nextMobile(), { name }));
    expect(res.status).toBe(400);
    expect(res.body.error.fields.name).toBeDefined();
  });

  it("accepts the special characters F-01 allows", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    const res = await request(app)
      .post("/api/registrations")
      .send(registration(mobile, { name: "A&B Services Pvt. Ltd. - Unit 2/B" }));
    expect(res.status).toBe(201);
  });

  it("requires at least one product and a city", async () => {
    const res = await request(app)
      .post("/api/registrations")
      .send(registration(nextMobile(), { productCodes: [], cityId: undefined }));
    expect(res.status).toBe(400);
    expect(res.body.error.fields.productCodes).toBeDefined();
    expect(res.body.error.fields.cityId).toBeDefined();
  });

  it("accepts exactly one city, not a list", async () => {
    const res = await request(app)
      .post("/api/registrations")
      .send(registration(nextMobile(), { cityId: [cityId] }));
    expect(res.status).toBe(400);
    expect(res.body.error.fields.cityId).toBeDefined();
  });

  it("rejects a city from another state without using up the OTP", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    const bad = await request(app)
      .post("/api/registrations")
      .send(registration(mobile, { cityId: otherStateCityId }));
    expect(bad.status).toBe(400);
    expect(bad.body.error.fields.cityId).toBeDefined();

    const good = await request(app).post("/api/registrations").send(registration(mobile));
    expect(good.status).toBe(201);
  });

  it("rejects an unknown product code", async () => {
    const mobile = nextMobile();
    await sendOtp(mobile);
    const res = await request(app)
      .post("/api/registrations")
      .send(registration(mobile, { productCodes: ["AIR_CONDITIONERS"] }));
    expect(res.status).toBe(400);
    expect(res.body.error.fields.productCodes).toBeDefined();
  });
});
