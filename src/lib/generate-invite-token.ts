

import crypto from "crypto";

/**
 * Generates a secure, 64-character random hex string.
 */


export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}