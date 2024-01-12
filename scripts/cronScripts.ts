import { CronJob } from "cron"
import { refreshMaterial } from "../lib/search/manageMaterial"

var fetchMaterial = new CronJob(
  // This cron job runs every day at 00:00
  // It first pulls the latest changes from the material repo then it sections the material for search
  // If the material has changed, it will call openai to update the search vectors and save a new material.json file
  "0 0 * * *",
  function () {
    refreshMaterial()
  },
  null,
  true
)
