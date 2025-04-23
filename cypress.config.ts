import { defineConfig } from "cypress"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    async setupNodeEvents(on, config) {
      const { default: installLogsPrinter } = await import("cypress-terminal-report/src/installLogsPrinter")
      installLogsPrinter(on)

      on("before:browser:launch", (browser, launchOptions) => {
        const width = 1920
        const height = 1080

        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args.push(`--window-size=${width},${height}`)
          launchOptions.args.push("--force-device-scale-factor=1")
        }

        if (browser.name === "electron" && browser.isHeadless) {
          launchOptions.preferences.width = width
          launchOptions.preferences.height = height
        }

        if (browser.name === "firefox" && browser.isHeadless) {
          launchOptions.args.push(`--width=${width}`)
          launchOptions.args.push(`--height=${height}`)
        }

        return launchOptions
      })
    },
    baseUrl: "http://localhost:3000",
  },
  component: {
    async setupNodeEvents(on, config) {
      const { default: installLogsPrinter } = await import("cypress-terminal-report/src/installLogsPrinter")
      installLogsPrinter(on, { printLogsToConsole: "onFail" })
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
