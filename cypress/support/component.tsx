// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands"

const logCollectorConfig = {
  collectTypes: [
    "cons:log",
    "cons:info",
    "cons:warn",
    "cons:error",
    "cy:log",
    "cy:xhr",
    "cy:request",
    "cy:intercept",
    "cy:command",
  ],
}
require("cypress-terminal-report/src/installLogsCollector")(logCollectorConfig)

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from "cypress/react18"
import { MountOptions, MountReturn } from "cypress/react"
import { SessionProvider, SessionProviderProps } from "next-auth/react"
import { ContextProvider } from "../../lib/context/ContextProvider"
import React from "react"

//Ensure global styles are loaded
import "../../styles/globals.css"
import { SWRConfig } from "swr"

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
Cypress.Commands.add(
  "mount",
  (component: React.ReactNode, options?: MountOptions & { session: SessionProviderProps["session"] }) => {
    const session: SessionProviderProps["session"] = options?.session || {
      expires: "1",
      user: { name: "test", email: "test@test.com" },
    }
    const mountOptions: MountOptions | undefined = options || undefined

    const sessionProviderProps: SessionProviderProps = {
      session: session,
      basePath: `/api/auth`,
      children: (
        <SWRConfig value={{ provider: () => new Map() }}>
          <ContextProvider>{component}</ContextProvider>
        </SWRConfig>
      ),
    }
    const wrapped = <SessionProvider {...sessionProviderProps} />

    return mount(wrapped, mountOptions)
  }
)

// Example use:
// cy.mount(<MyComponent />)
