import { createApp } from "./app.js";
import { config } from "./config.js";

createApp().listen(config.PORT, () => {
  console.info(`Partner onboarding API listening on http://localhost:${config.PORT} (OTP: ${config.OTP_PROVIDER})`);
});
