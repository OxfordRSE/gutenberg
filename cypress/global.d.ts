/// <reference types="cypress" />
import { JWTPayload } from "jose"

declare global {
  namespace Cypress {
    interface Chainable {
      login(userObj: JWTPayload): void
    }
  }
}
