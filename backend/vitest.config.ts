import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./test.db",
      OTP_PROVIDER: "mock",
      MOCK_OTP_CODE: "1234",
      OTP_RESEND_COOLDOWN_SECONDS: "0",
      INTERNAL_API_ENABLED: "true",
      // Test-only pool and client; test/cognito-tokens.ts signs tokens for them.
      COGNITO_USER_POOL_ID: "ap-south-1_TestPool1",
      COGNITO_CLIENT_ID: "test-atlas-client",
    },
    globalSetup: ["./test/globalSetup.ts"],
    fileParallelism: false,
  },
});
