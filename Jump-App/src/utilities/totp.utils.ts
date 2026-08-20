/**
 * Generates a fresh TOTP code from the Google Authenticator / 2FA secret.
 */
export function getTotpCode(secret: string): string {
  const normalizedSecret = secret.replace(/\s/g, "");
  if (!normalizedSecret) {
    throw new Error("JUMPAPP_2FA_SECRET is empty. Set it in src/config/.env.staging");
  }

  try {
    const { authenticator } = require("otplib");
    authenticator.options = { window: 1 };
    const code = authenticator.generate(normalizedSecret);
    if (!code) {
      throw new Error("Authenticator returned an empty TOTP code");
    }
    return code;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate TOTP code from JUMPAPP_2FA_SECRET: ${message}`);
  }
}
