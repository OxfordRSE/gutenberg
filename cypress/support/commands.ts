// @ts-check
///<reference path="../global.d.ts" />

import hkdf from "@panva/hkdf"
import { use } from "chai"
import { EncryptJWT, JWTPayload } from "jose"

Cypress.on("uncaught:exception", (err) => !err.message.includes("ResizeObserver loop limit exceeded"))

// Function logic derived from https://github.com/nextauthjs/next-auth/blob/5c1826a8d1f8d8c2d26959d12375704b0a693bfc/packages/next-auth/src/jwt/index.ts#L113-L121
async function getDerivedEncryptionKey(secret: string) {
  return await hkdf("sha256", secret, "", "NextAuth.js Generated Encryption Key", 32)
}

// Function logic derived from https://github.com/nextauthjs/next-auth/blob/5c1826a8d1f8d8c2d26959d12375704b0a693bfc/packages/next-auth/src/jwt/index.ts#L16-L25
export async function encode(token: JWTPayload, secret: string): Promise<string> {
  const maxAge = 30 * 24 * 60 * 60 // 30 days
  const encryptionSecret = await getDerivedEncryptionKey(secret)
  return await new EncryptJWT(token)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(Math.round(Date.now() / 1000 + maxAge))
    .setJti("test")
    .encrypt(encryptionSecret)
}

// taken from https://github.com/yeungalan0/site-monorepo/blob/main/my_site/cypress/support/commands.ts
Cypress.Commands.add("login", (userObj: JWTPayload) => {
  const session = {
    user: userObj,
  }
  //cy.intercept("/api/auth/session", session).as("session");

  // Generate and set a valid cookie from the fixture that next-auth can decrypt
  cy.wrap(null)
    .then(() => {
      return encode(userObj, Cypress.env("NEXTAUTH_SECRET"))
    })
    .then((encryptedToken) => cy.setCookie("next-auth.session-token", encryptedToken))

  //Cypress.Cookies.preserveOnce("next-auth.session-token");
})

export {}
