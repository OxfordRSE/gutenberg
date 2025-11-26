import React, { useState } from "react"
import Link from "next/link"
import { useMyEvents } from "lib/hooks/useMyEvents"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { Select, MenuItem, FormControl, InputLabel, Typography, Box } from "@mui/material"
import { CheckCircle } from "@mui/icons-material"
import { SelectChangeEvent } from "@mui/material"
import { HiSwitchHorizontal } from "react-icons/hi"
import { GoArrowRight } from "react-icons/go"
import { PageTemplate } from "lib/pageTemplate"
import Image from "next/image"

interface EventSwitcherProps {
  pageInfo: PageTemplate
}

const EventSwitcher: React.FC<EventSwitcherProps> = ({ pageInfo }) => {
  const [editMode, setEditMode] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
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
            open={selectOpen}
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
                  <Box className="flex items-center w-full">
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
        <Box className="flex items-center w-full">
          {/* Left: swap/select button */}
          <button
            onClick={() => {
              setEditMode(true)
              setSelectOpen(true)
            }}
            aria-label={activeEvent ? "Swap event" : "Select event"}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {activeEvent ? (
              <HiSwitchHorizontal className="w-5 h-5 flex-shrink-0" />
            ) : (
              <GoArrowRight className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="flex flex-col text-xs text-left leading-tight">
              <span>{activeEvent ? "Swap" : "Select"}</span>
              <span>Event</span>
            </span>
          </button>
          {/* Center: logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="hover:opacity-80">
              <Image src={pageInfo.logo.src} alt={pageInfo.logo.alt} className="h-8 w-auto" />
            </Link>
          </div>
          <div className="w-[50px]" aria-hidden="true"></div> {/* Right: empty space to balance the layout */}
        </Box>
      )}
    </Box>
  )
}

export default EventSwitcher
