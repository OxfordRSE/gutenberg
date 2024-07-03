import { Section } from "../../lib/material"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import List from "@mui/material/List"
import Alert from "@mui/material/Alert"
import Typography from "@mui/material/Typography"
import Collapse from "@mui/material/Collapse"
import Tooltip from "@mui/material/Tooltip"
import { HiOutlineTrophy } from "react-icons/hi2"
import ListItemIcon from "@mui/material/ListItemIcon"
import React from "react"
import { type Theme } from "@mui/system"

export default function LearningOutcomes({ learningOutcomes }: { learningOutcomes: Section["learningOutcomes"] }) {
  const [open, setOpen] = React.useState(true)
  if (learningOutcomes.length === 0) return null
  return (
    <Alert
      severity="success"
      className="max-w-2xl mx-auto dark:bg-indigo-950 dark:text-teal-50"
      sx={{ marginBottom: (t: Theme) => t.spacing(1) }}
    >
      <Tooltip title={`Click to ${open ? "hide" : "show"} learning outcomes`}>
        <Typography variant="body2" onClick={() => setOpen(!open)} sx={{ cursor: "pointer" }}>
          Learning outcomes
        </Typography>
      </Tooltip>
      <Collapse in={open}>
        <List>
          {learningOutcomes.map((o, i) => (
            <ListItem key={i}>
              <ListItemIcon>
                <HiOutlineTrophy color="#2e7d32" />
              </ListItemIcon>
              <ListItemText>{o}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Alert>
  )
}
