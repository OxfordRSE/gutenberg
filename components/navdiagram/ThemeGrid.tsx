import React from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { Box, Card, CardActionArea, Divider, Typography, useTheme, useMediaQuery, alpha } from "@mui/material"
import { HiOutlineBookOpen } from "react-icons/hi2"
import { MaterialCourse, MaterialTheme } from "lib/material"

// Summaries render inline within a single Typography <p>, so strip react-markdown's own
// paragraph wrapper rather than nesting a <p> inside a <p>.
const summaryMarkdownComponents = { p: ({ children }: { children?: React.ReactNode }) => <>{children}</> }

function ThemeGrid({ theme }: { theme: MaterialTheme }) {
  const repo = theme.repo
  const courses = theme.courses
  const muiTheme = useTheme()
  const isDark = muiTheme.palette.mode === "dark"
  const isLg = useMediaQuery(muiTheme.breakpoints.up("lg"))
  const isMd = useMediaQuery(muiTheme.breakpoints.up("md"))
  const cols = Math.min(courses.length, isLg ? 3 : isMd ? 2 : 1) || 1
  const accentColor = muiTheme.palette.info.main

  // Walk courses in order, greedily assigning each to whichever column currently has the
  // least estimated content weight, so a couple of unusually long summaries don't leave one
  // column much taller than the others the way a strict round-robin deal can.
  const columns: MaterialCourse[][] = Array.from({ length: cols }, () => [])
  const columnWeights = new Array(cols).fill(0)
  courses.forEach((course) => {
    const weight = (course.name?.length ?? 0) + (course.summary?.length ?? 0)
    let shortestCol = 0
    for (let i = 1; i < cols; i++) {
      if (columnWeights[i] < columnWeights[shortestCol]) shortestCol = i
    }
    columns[shortestCol].push(course)
    columnWeights[shortestCol] += weight
  })

  return (
    <div className="mx-auto max-w-6xl prose-slate dark:prose-invert">
      <Box sx={{ display: "flex", gap: 2, pb: 2, alignItems: "flex-start" }}>
        {columns.map((column, colIndex) => (
          <Box key={colIndex} sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
            {column.map((course) => {
              const sectionCount = course.sections?.length ?? 0
              return (
                <Card
                  key={course.id}
                  elevation={0}
                  sx={{
                    borderRadius: "6px",
                    bgcolor: isDark ? "background.default" : undefined,
                    border: "1px solid",
                    borderColor: "divider",
                    borderLeft: `4px solid ${accentColor}`,
                    boxShadow: isDark
                      ? "0 1px 3px 0 rgba(0,0,0,0.5)"
                      : "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: isDark ? "0 4px 10px 0 rgba(0,0,0,0.6)" : "0 6px 12px -2px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={`/material/${repo}/${theme.id}/${course.id}`}
                    disableRipple
                    sx={{
                      p: 2,
                      textAlign: "left",
                      minHeight: 160,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, width: "100%", alignSelf: "stretch" }}>
                      <HiOutlineBookOpen
                        size={20}
                        color={accentColor}
                        aria-hidden="true"
                        style={{ flexShrink: 0, marginLeft: "-6px", marginTop: "-4px" }}
                      />
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 600, textWrap: "balance" }}>
                        {course ? course.name : "Unnamed Section"}
                      </Typography>
                    </Box>
                    <Divider
                      sx={{ my: 1, width: "60%", borderBottomWidth: "2px", borderColor: alpha(accentColor, 0.35) }}
                    />
                    <Typography variant="body1" sx={{ mt: 1, color: isDark ? "#d1d5db" : "#4b5563" }}>
                      <ReactMarkdown components={summaryMarkdownComponents}>{course.summary}</ReactMarkdown>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: "auto",
                        pt: 1,
                        width: "90%",
                        borderTop: "2px solid",
                        borderColor: alpha(accentColor, 0.35),
                      }}
                    >
                      {sectionCount} section{sectionCount === 1 ? "" : "s"}
                    </Typography>
                  </CardActionArea>
                </Card>
              )
            })}
          </Box>
        ))}
      </Box>
    </div>
  )
}

export default ThemeGrid
