export const progressBandKeys = [
  "noTrackable",
  "notStarted",
  "oneToTwenty",
  "twentyOneToForty",
  "fortyOneToSixty",
  "sixtyOneToEighty",
  "ninetyOneToNinetyNine",
  "complete",
] as const

export type ProgressBandKey = (typeof progressBandKeys)[number]
type TrackableProgressBandKey = Exclude<ProgressBandKey, "noTrackable" | "complete">

export type ProgressBandCounts = Record<ProgressBandKey, number>

export const progressBandLabels: Record<ProgressBandKey, string> = {
  noTrackable: "No trackable problems",
  notStarted: "0%",
  oneToTwenty: "1-20%",
  twentyOneToForty: "21-40%",
  fortyOneToSixty: "41-60%",
  sixtyOneToEighty: "61-80%",
  ninetyOneToNinetyNine: "91-99%",
  complete: "100%",
}

export const progressHistogramBandOrder: Array<Exclude<ProgressBandKey, "noTrackable">> = [
  "notStarted",
  "oneToTwenty",
  "twentyOneToForty",
  "fortyOneToSixty",
  "sixtyOneToEighty",
  "ninetyOneToNinetyNine",
  "complete",
]

const progressBandThresholds: Array<{
  max: number
  band: TrackableProgressBandKey
}> = [
  { max: 0, band: "notStarted" },
  { max: 20, band: "oneToTwenty" },
  { max: 40, band: "twentyOneToForty" },
  { max: 60, band: "fortyOneToSixty" },
  { max: 80, band: "sixtyOneToEighty" },
  { max: 99, band: "ninetyOneToNinetyNine" },
]

export function emptyProgressBandCounts(): ProgressBandCounts {
  return progressBandKeys.reduce<ProgressBandCounts>((acc, key) => {
    acc[key] = 0
    return acc
  }, {} as ProgressBandCounts)
}

export function getProgressBand(completionPercent: number | null, totalProblems: number): ProgressBandKey {
  if (totalProblems <= 0) return "noTrackable"

  const completion = Math.max(0, Math.min(completionPercent ?? 0, 100))
  if (completion >= 100) return "complete"

  for (const threshold of progressBandThresholds) {
    if (completion <= threshold.max) return threshold.band
  }

  return "ninetyOneToNinetyNine"
}
