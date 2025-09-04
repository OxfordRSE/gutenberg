import { CronJob } from "cron"
import { refreshMaterial } from "../lib/search/manageMaterial"

let running = false

const job = new CronJob({
  cronTime: "0 0 * * *", // every day at 00:00
  start: true,
  runOnInit: true,
  onTick: async () => {
    if (running) {
      console.log("[cron] Skipping run — previous refresh still in progress")
      return
    }
    running = true
    console.log(`[cron] Starting refresh at ${new Date().toISOString()}`)
    try {
      await refreshMaterial()
      console.log(`[cron] Refresh completed at ${new Date().toISOString()}`)
    } catch (err) {
      console.error("[cron] Refresh failed:", err)
    } finally {
      running = false
      console.log(`[cron] Next run scheduled at ${job.nextDate().toString()}`)
    }
  },
})

setInterval(
  () => {
    console.log(`[cron] Heartbeat: next run at ${job.nextDate().toString()}`)
  },
  6 * 60 * 60 * 1000
) // every 6h report status
