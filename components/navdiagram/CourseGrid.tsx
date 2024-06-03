import React from "react"
import Link from "next/link"
import { Grid, Paper, Typography, Box } from "@mui/material"
import { Course, Theme } from "lib/material"
import { useTheme } from "next-themes"

function CourseGrid({ course, theme }: { course: Course; theme: Theme }) {
  const files = course.files

  const findSectionByName = (fileName: string) => {
    return course.sections.find((section) => section.file === fileName)
  }
  const repo = theme.repo

  const findCommonTag = (column: string[]) => {
    const tagsArray = column.map((file) => {
      const section = findSectionByName(file)
      return section ? section.tags : []
    })
    if (tagsArray.length === 0) return null

    const commonTags = tagsArray.reduce((a, b) => a.filter((c) => b.includes(c)))
    return commonTags.length > 0 ? commonTags[0] : null // returns the first common tag if any
  }

  return (
    <div className="mx-auto max-w-6xl prose-slate dark:prose-invert">
      <Grid container spacing={2} sx={{ paddingBottom: "16px" }}>
        {files.map((column, colIndex) => {
          const commonTag = findCommonTag(column)
          return (
            <Grid item xs={12 / files.length} key={colIndex}>
              {commonTag && (
                <Box
                  className="bg-slate-50 border-gray-200 text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2"
                  sx={{ borderRadius: "0px", textAlign: "center" }}
                >
                  <Typography variant="h6">{commonTag.toUpperCase()}</Typography>
                </Box>
              )}
              <Grid container spacing={0}>
                {column.map((file, rowIndex) => {
                  const section = findSectionByName(file)
                  if (!section) return null
                  const url = `/material/${repo}/${course.theme}/${course.id}/${section.id}`
                  console.log(url)
                  return (
                    <Grid item xs={12} key={rowIndex}>
                      <Link href={url}>
                        <Paper elevation={3} sx={{ borderRadius: "0px", p: 2, textAlign: "center" }}>
                          <Typography variant="body1">{section ? section.name : "Unnamed Section"}</Typography>
                        </Paper>
                      </Link>
                    </Grid>
                  )
                })}
              </Grid>
            </Grid>
          )
        })}
      </Grid>
    </div>
  )
}

export default CourseGrid
