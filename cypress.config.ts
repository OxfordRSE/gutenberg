import { defineConfig } from "cypress"
import path from "path"

export default defineConfig({
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    setupNodeEvents(on, config) {
      require("cypress-terminal-report/src/installLogsPrinter")(on)

      // implement node event listeners here
      on("before:browser:launch", (browser, launchOptions) => {
        // the browser width and height we want to get
        // our screenshots and videos will be of that resolution
        const width = 1920
        const height = 1080

        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args.push(`--window-size=${width},${height}`)

          // force screen to be non-retina and just use our given resolution
          launchOptions.args.push("--force-device-scale-factor=1")
        }

        if (browser.name === "electron" && browser.isHeadless) {
          // might not work on CI for some reason
          launchOptions.preferences.width = width
          launchOptions.preferences.height = height
        }

        if (browser.name === "firefox" && browser.isHeadless) {
          launchOptions.args.push(`--width=${width}`)
          launchOptions.args.push(`--height=${height}`)
        }

        // IMPORTANT: return the updated browser launch options
        return launchOptions
      })
    },
    baseUrl: "http://localhost:3000",
  },
  component: {
    setupNodeEvents(on, config) {
      const termReportConfig = { printLogsToConsole: "onFail" }
      require("cypress-terminal-report/src/installLogsPrinter")(on, termReportConfig)
    },
    devServer: {
      framework: "next",
      bundler: "webpack",
      webpackConfig: {
        resolve: {
          alias: {
            "@components": path.resolve(__dirname, "./src/components"),
          },
        },
      },
    },
  },
})
