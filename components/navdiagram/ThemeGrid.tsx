import React from "react"
import Link from "next/link"
import { Grid, Paper, Typography, Box, Divider } from "@mui/material"
import { MaterialTheme } from "lib/material"

function ThemeGrid({ theme }: { theme: MaterialTheme }) {
  const repo = theme.repo
  const courses = theme.courses

  return (
    <div className="mx-auto max-w-6xl prose-slate dark:prose-invert">
      <Grid container spacing={2} sx={{ paddingBottom: "16px" }}>
        {courses.map((course, colIndex) => {
          return (
            <Grid item xs={Math.max(12 / courses.length, 4)} key={colIndex}>
              <Link href={`/material/${repo}/${theme.id}/${course.id}`}>
                <Paper elevation={3} sx={{ p: 2, textAlign: "center", height: "100%" }}>
                  <Typography variant="h5" component="h2">
                    {course ? course.name : "Unnamed Section"}
                  </Typography>
                  <Divider sx={{ my: 1, width: "90%", mx: "auto" }} />
                  <Typography variant="body1" sx={{ mt: 1, textAlign: "left" }}>
                    {course.summary}
                  </Typography>
                </Paper>
              </Link>
            </Grid>
          )
        })}
      </Grid>
    </div>
  )
}

export default ThemeGrid
