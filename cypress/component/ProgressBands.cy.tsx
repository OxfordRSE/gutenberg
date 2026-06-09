import {
  emptyProgressBandCounts,
  getProgressBand,
  progressBandKeys,
  progressHistogramBandOrder,
} from "lib/progressBands"

describe("progress band helpers", () => {
  it("returns noTrackable when totalProblems is zero or negative", () => {
    expect(getProgressBand(50, 0)).to.eq("noTrackable")
    expect(getProgressBand(50, -1)).to.eq("noTrackable")
  })

  it("maps key boundary values to expected bands", () => {
    expect(getProgressBand(null, 10)).to.eq("notStarted")
    expect(getProgressBand(0, 10)).to.eq("notStarted")
    expect(getProgressBand(1, 10)).to.eq("oneToTwenty")
    expect(getProgressBand(20, 10)).to.eq("oneToTwenty")
    expect(getProgressBand(21, 10)).to.eq("twentyOneToForty")
    expect(getProgressBand(40, 10)).to.eq("twentyOneToForty")
    expect(getProgressBand(41, 10)).to.eq("fortyOneToSixty")
    expect(getProgressBand(60, 10)).to.eq("fortyOneToSixty")
    expect(getProgressBand(61, 10)).to.eq("sixtyOneToEighty")
    expect(getProgressBand(80, 10)).to.eq("sixtyOneToEighty")
    expect(getProgressBand(81, 10)).to.eq("ninetyOneToNinetyNine")
    expect(getProgressBand(99, 10)).to.eq("ninetyOneToNinetyNine")
    expect(getProgressBand(100, 10)).to.eq("complete")
  })

  it("clamps out-of-range values before mapping", () => {
    expect(getProgressBand(-12, 10)).to.eq("notStarted")
    expect(getProgressBand(140, 10)).to.eq("complete")
  })

  it("creates zero counts for all keys", () => {
    const counts = emptyProgressBandCounts()

    expect(Object.keys(counts).sort()).to.deep.eq([...progressBandKeys].sort())
    progressBandKeys.forEach((key) => {
      expect(counts[key]).to.eq(0)
    })
  })

  it("keeps histogram order aligned with known non-noTrackable keys", () => {
    const keysWithoutNoTrackable = progressBandKeys.filter((key) => key !== "noTrackable")
    expect(progressHistogramBandOrder).to.deep.eq(keysWithoutNoTrackable)
  })
})
