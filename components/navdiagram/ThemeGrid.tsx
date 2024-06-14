import React from "react"
import Link from "next/link"
import { Grid, Paper, Typography, Box } from "@mui/material"
import { Theme } from "lib/material"

function ThemeGrid({ theme }: { theme: Theme }) {
  const repo = theme.repo
  const courses = theme.courses

  return (
    <div className="mx-auto max-w-6xl prose-slate dark:prose-invert">
      <Grid container spacing={2} sx={{ paddingBottom: "16px" }}>
        {courses.map((course, colIndex) => {
          return (
            <Grid item xs={12 / courses.length} key={colIndex}>
              <Link href={`/material/${repo}/${theme.id}/${course.id}`}>
                <Paper elevation={3} sx={{ borderRadius: "0px", p: 2, textAlign: "center" }}>
                  <Typography variant="body1">{course ? course.name : "Unnamed Section"}</Typography>
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
