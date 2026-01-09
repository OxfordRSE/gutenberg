import React from "react"
import Link from "next/link"
import { Grid, Paper, Typography, Box, Chip } from "@mui/material"
import { MaterialCourse, MaterialTheme } from "lib/material"

function CourseGrid({ course, theme }: { course: MaterialCourse; theme: MaterialTheme }) {
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
  const chipColors = ["#FF5733", "#C70039", "#900C3F", "#581845", "#1C2833", "#17202A"]
  let tagColorIndex = 0
  const tagColorMap: { [key: string]: string } = {}

  return (
    <div className="mx-auto max-w-6xl prose-slate dark:prose-invert">
      <Grid container spacing={2} sx={{ paddingBottom: "16px", justifyContent: "center" }}>
        {files.map((column, colIndex) => {
          const commonTag = findCommonTag(column)
          return (
            <Grid
              item
              xs={12}
              sm={8}
              md={6}
              lg={6}
              key={colIndex}
              sx={{ maxWidth: { xs: "100%", sm: "50%", md: "50%" }, flexBasis: "auto" }}
            >
              {commonTag && (
                <Box
                  className="bg-slate-50 border-gray-200 text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white p-2"
                  sx={{ borderRadius: "8px 8px 0 0", textAlign: "center" }}
                >
                  <Typography variant="h6">{commonTag.toUpperCase()}</Typography>
                </Box>
              )}
              <nav aria-label={commonTag || undefined}>
                <Grid component="ul" container spacing={0}>
                  {column.map((file, rowIndex) => {
                    const section = findSectionByName(file)
                    if (!section) return null
                    const url = `/material/${repo}/${course.theme}/${course.id}/${section.id}`

                    // Determine if this is the first or last item
                    const isFirstItem = rowIndex === 0 && !commonTag
                    const isLastItem = rowIndex === column.length - 1

                    return (
                      <Grid component="li" item xs={12} key={rowIndex}>
                        <Link href={url}>
                          <Paper
                            elevation={3}
                            sx={{
                              borderRadius: isFirstItem ? "8px 8px 0 0" : isLastItem ? "0 0 8px 8px" : "0px",
                              p: 2,
                              textAlign: "center",
                            }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="body1" sx={{ flex: "1", textAlign: "left" }}>
                                {section.name}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                {section.tags.map((tag) => {
                                  // If the tag doesn't have a color yet, assign it one
                                  if (!tagColorMap[tag]) {
                                    tagColorMap[tag] = chipColors[tagColorIndex % chipColors.length]
                                    tagColorIndex++
                                  }
                                  return (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                      sx={{ backgroundColor: tagColorMap[tag], fontSize: "0.75rem", height: "20px" }}
                                    />
                                  )
                                })}
                              </Box>
                            </Box>
                          </Paper>
                        </Link>
                      </Grid>
                    )
                  })}
                </Grid>
              </nav>
            </Grid>
          )
        })}
      </Grid>
    </div>
  )
}

export default CourseGrid
