import { MaterialSection } from "../../lib/material"
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

export default function LearningOutcomes({
  learningOutcomes,
}: {
  learningOutcomes: MaterialSection["learningOutcomes"]
}) {
  const [open, setOpen] = React.useState(true)
  if (learningOutcomes.length === 0) return null
  return (
    <Alert
      severity="success"
      className="mx-auto max-w-2xl border border-emerald-200 !bg-emerald-50 !text-emerald-950 shadow-sm dark:border-emerald-900 dark:!bg-emerald-950/20 dark:!text-emerald-50"
      sx={{
        marginBottom: (t: Theme) => t.spacing(1),
        "& .MuiAlert-message": { width: "100%" },
        "& .MuiListItemIcon-root": { minWidth: 36 },
        "& .MuiListItemText-primary": { color: "inherit" },
      }}
    >
      <Tooltip title={`Click to ${open ? "hide" : "show"} learning outcomes`}>
        <Typography
          variant="body2"
          onClick={() => setOpen(!open)}
          sx={{ cursor: "pointer", fontWeight: 600 }}
          className="text-emerald-900 dark:text-emerald-100"
        >
          Learning outcomes
        </Typography>
      </Tooltip>
      <Collapse in={open}>
        <List>
          {learningOutcomes.map((o, i) => (
            <ListItem key={i}>
              <ListItemIcon>
                <HiOutlineTrophy className="text-emerald-600 dark:text-emerald-300" />
              </ListItemIcon>
              <ListItemText>{o}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Alert>
  )
}
