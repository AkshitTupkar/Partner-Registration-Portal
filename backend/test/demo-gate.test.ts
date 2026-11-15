import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { config } from "../src/config.js";

const app = createApp();

describe("demo gate", () => {
  afterEach(() => {
    config.DEMO_GATE_EMAIL = "";
    config.DEMO_GATE_PASSWORD = "";
  });

  it("is off when no credentials are configured", async () => {
    const status = await request(app).get("/api/demo-gate");
    expect(status.body).toEqual({ enabled: false });
    const res = await request(app).post("/api/demo-gate").send({ email: "", password: "" });
    expect(res.status).toBe(200);
  });

  it("accepts the configured email (any case) and password", async () => {
    config.DEMO_GATE_EMAIL = "demo@example.com";
    config.DEMO_GATE_PASSWORD = "S3cret$pass";
    expect((await request(app).get("/api/demo-gate")).body).toEqual({ enabled: true });
    const res = await request(app).post("/api/demo-gate").send({ email: " Demo@Example.com ", password: "S3cret$pass" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("refuses a wrong password or email", async () => {
    config.DEMO_GATE_EMAIL = "demo@example.com";
    config.DEMO_GATE_PASSWORD = "S3cret$pass";
    const wrongPassword = await request(app).post("/api/demo-gate").send({ email: "demo@example.com", password: "s3cret$pass" });
    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body.error.code).toBe("DEMO_GATE_DENIED");
    const wrongEmail = await request(app).post("/api/demo-gate").send({ email: "other@example.com", password: "S3cret$pass" });
    expect(wrongEmail.status).toBe(401);
  });
});
