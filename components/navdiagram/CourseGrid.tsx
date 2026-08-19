import React from "react"
import Link from "next/link"
import { ImageList, ImageListItem, Card, CardActionArea, Typography, Box, Chip, useTheme, useMediaQuery } from "@mui/material"
import { MaterialCourse, MaterialTheme } from "lib/material"
import { formatTagLabel } from "lib/tagLabels"

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

  const muiTheme = useTheme()
  const isDark = muiTheme.palette.mode === "dark"
  const isSm = useMediaQuery(muiTheme.breakpoints.up("sm"))
  const cols = Math.min(files.length, isSm ? 2 : 1) || 1

  const accentColor = muiTheme.palette.info.main

  return (
    <div className="mx-auto max-w-6xl prose-slate dark:prose-invert">
      <ImageList variant="masonry" cols={cols} gap={16} sx={{ pb: 2 }}>
        {files.map((column, colIndex) => {
          const commonTag = findCommonTag(column)
          return (
            <ImageListItem key={colIndex}>
              {commonTag && (
                <Box
                  sx={{
                    borderRadius: "6px 6px 0 0",
                    textAlign: "center",
                    p: 1,
                    bgcolor: "action.selected",
                    borderTop: `3px solid ${accentColor}`,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, textWrap: "balance" }}>
                    {formatTagLabel(commonTag).toUpperCase()}
                  </Typography>
                </Box>
              )}
              <nav aria-label={commonTag || undefined}>
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {column.map((file, rowIndex) => {
                    const section = findSectionByName(file)
                    if (!section) return null
                    const url = `/material/${repo}/${course.theme}/${course.id}/${section.id}`

                    // Determine if this is the first or last item
                    const isFirstItem = rowIndex === 0 && !commonTag
                    const isLastItem = rowIndex === column.length - 1

                    return (
                      <Box component="li" key={rowIndex}>
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: isFirstItem ? "6px 6px 0 0" : isLastItem ? "0 0 6px 6px" : "0px",
                            bgcolor: isDark ? "background.default" : undefined,
                            border: "1px solid",
                            borderColor: "divider",
                            borderTop: rowIndex === 0 ? undefined : "none",
                          }}
                        >
                          <CardActionArea component={Link} href={url} disableRipple sx={{ p: 2, textAlign: "center" }}>
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{ flex: "1", textAlign: "left", color: isDark ? "#d1d5db" : "#4b5563" }}
                              >
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
                                      label={formatTagLabel(tag)}
                                      size="small"
                                      sx={{ backgroundColor: tagColorMap[tag], fontSize: "0.75rem", height: "20px" }}
                                    />
                                  )
                                })}
                              </Box>
                            </Box>
                          </CardActionArea>
                        </Card>
                      </Box>
                    )
                  })}
                </Box>
              </nav>
            </ImageListItem>
          )
        })}
      </ImageList>
    </div>
  )
}

export default CourseGrid
