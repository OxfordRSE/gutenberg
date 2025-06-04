import React, { useState } from "react"
import { useMyEvents } from "lib/hooks/useMyEvents"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { Select, MenuItem, FormControl, InputLabel, Typography, Box } from "@mui/material"
import { CheckCircle } from "@mui/icons-material"
import { SelectChangeEvent } from "@mui/material"
import { HiSwitchHorizontal } from "react-icons/hi"
import { GoArrowRight } from "react-icons/go"

const EventSwitcher: React.FC = () => {
  const [editMode, setEditMode] = useState(false)
  const { events, isLoading } = useMyEvents()
  const [activeEvent, setActiveEvent] = useActiveEvent()

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedId = Number(event.target.value)
    const selectedEvent = events?.find((e) => e.id === selectedId)
    if (selectedEvent) {
      setActiveEvent(selectedEvent)
    }
    setEditMode(false)
  }

  if (isLoading || !events) return null

  return (
    <Box
      component="section"
      aria-label="Active event selection"
      className="px-3 py-2 border-b border-gray-300 dark:border-gray-600"
    >
      {editMode ? (
        <FormControl fullWidth size="small" variant="outlined">
          <InputLabel id="event-select-label">Select Event</InputLabel>
          <Select
            labelId="event-select-label"
            label="Select Active Event"
            value={activeEvent?.id?.toString() ?? ""}
            onChange={(event: SelectChangeEvent) => {
              const selectedId = Number(event.target.value)

              if (!event.target.value) {
                setActiveEvent(undefined)
                setEditMode(false)
                return
              }

              const selectedEvent = events?.find((e) => e.id === selectedId)
              if (selectedEvent) {
                setActiveEvent(selectedEvent)
              }

              setEditMode(false)
            }}
            onBlur={() => setEditMode(false)}
            autoFocus
            sx={{
              backgroundColor: "background.paper",
              color: "text.primary",
            }}
          >
            {events.map((event) => {
              const date = new Date(event.start).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              const isSelected = event.id === activeEvent?.id

              return (
                <MenuItem key={event.id} value={event.id}>
                  <Box className="flex justify-between items-center w-full">
                    <Typography>
                      {event.name} — {date}
                    </Typography>
                    {isSelected && <CheckCircle className="text-green-500 ml-2" fontSize="small" />}
                  </Box>
                </MenuItem>
              )
            })}
            <MenuItem value="" aria-label="Set no active event">
              <Box className="w-full text-gray-500 dark:text-gray-400 italic">Set no active event</Box>
            </MenuItem>
          </Select>
        </FormControl>
      ) : (
        <Box className="flex items-center gap-2">
          <button
            onClick={() => setEditMode(true)}
            className="text-sm flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label={activeEvent ? "Swap active event" : "Select active event"}
          >
            {activeEvent ? (
              <>
                <HiSwitchHorizontal className="w-4 h-4 mr-1" />
                <span>Swap</span>
              </>
            ) : (
              <>
                <GoArrowRight className="w-4 h-4 mr-1" />
                <span>Select</span>
              </>
            )}
          </button>
          <Typography variant="h6" className="truncate text-gray-800 dark:text-gray-400 text-light">
            {activeEvent?.name ?? ""}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default EventSwitcher
