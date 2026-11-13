import { randomInt } from "node:crypto";
import { config } from "../../config.js";

/** Delivers OTP codes to a mobile number (INT-07, SMS gateway). */
export interface OtpSender {
  /** True when codes are not really delivered; the API then tells the client the code. */
  readonly isMock: boolean;
  generateCode(): string;
  send(mobile: string, code: string): Promise<void>;
}

/** Sends nothing and always uses MOCK_OTP_CODE. For development and demos only. */
class MockOtpSender implements OtpSender {
  readonly isMock = true;
  generateCode() {
    return config.MOCK_OTP_CODE;
  }
  async send(mobile: string, code: string) {
    if (config.NODE_ENV !== "test") console.info(`[otp:mock] OTP for ******${mobile.slice(-4)} is ${code}`);
  }
}

/** Real gateways should generate random codes; kept here for when one is added. */
export function randomOtpCode(): string {
  return String(randomInt(0, 10_000)).padStart(4, "0");
}

export function createOtpSender(): OtpSender {
  switch (config.OTP_PROVIDER) {
    case "mock":
      return new MockOtpSender();
  }
}
