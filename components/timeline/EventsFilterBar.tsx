import React from "react"
import { Box, IconButton, Tooltip } from "@mui/material"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import SearchIcon from "@mui/icons-material/Search"
import { useForm } from "react-hook-form"
import Textfield from "components/forms/Textfield"

export interface EventsFilterBarProps {
  value: string
  onChange: (value: string) => void
  onDebouncedChange?: (value: string) => void
  delay?: number
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

type FormShape = { q: string }

/**
 * Collapsible EventsFilterBar that reuses your RHF <Textfield/> (Flowbite-backed today).
 * - Starts collapsed as a circular icon button
 * - Click the search icon to expand horizontally into a pill input
 * - Clear (×) button appears when non-empty
 * - Forwards extra props via `textfieldProps` to your Textfield wrapper
 */
const EventsFilterBar: React.FC<EventsFilterBarProps> = ({
  value,
  onChange,
  onDebouncedChange,
  delay = 150,
  placeholder = "Search events…",
  autoFocus,
  className,
}) => {
  const { control, setValue, watch } = useForm<FormShape>({ defaultValues: { q: value } })
  const [open, setOpen] = React.useState<boolean>(Boolean(value))
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  // keep RHF form in sync if parent value changes externally
  React.useEffect(() => {
    setValue("q", value, { shouldDirty: false, shouldTouch: false })
  }, [value, setValue])

  const q = watch("q") ?? ""

  // bubble changes up (immediate)
  React.useEffect(() => {
    onChange(q)
  }, [q, onChange])

  // debounce to parent (optional)
  React.useEffect(() => {
    if (!onDebouncedChange) return
    const t = setTimeout(() => onDebouncedChange(q.trim()), delay)
    return () => clearTimeout(t)
  }, [q, delay, onDebouncedChange])

  const clearQuery = React.useCallback(() => {
    setValue("q", "", { shouldDirty: true, shouldTouch: true })
    onChange("")
    onDebouncedChange?.("")
  }, [onChange, onDebouncedChange, setValue])

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev
      // if we are CLOSING the bar, clear the query immediately
      if (!next) {
        clearQuery()
      }
      return next
    })
  }

  const handleClear = () => {
    setValue("q", "", { shouldDirty: true, shouldTouch: true })
    inputRef.current?.focus()
  }

  // focus input when opening
  React.useEffect(() => {
    if (open) {
      // allow animation to run a tick so the element has width
      const t = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(t)
    }
  }, [open])

  return (
    <Box className={className} sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
      <Tooltip title={open ? "Hide search" : "Search events"}>
        <div className="h-9 flex items-center">
          <IconButton
            size="small"
            onClick={handleToggle}
            className="text-gray-900 dark:text-slate-300"
            aria-label={open ? "Hide event search" : "Show event search"}
            aria-expanded={open}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              p: 0,
              display: "grid",
              placeItems: "center",
              top: 2,
            }}
            data-cy="show-events-search"
          >
            {open ? <ChevronRightIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
          </IconButton>
        </div>
      </Tooltip>

      {/* Collapsible input wrapper */}
      <div
        className={
          open
            ? "relative transition-all duration-200 ease-in-out max-w-[20rem] opacity-100 overflow-visible"
            : "relative transition-all duration-200 ease-in-out max-w-0 opacity-0 overflow-hidden"
        }
        aria-hidden={!open}
      >
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0">
            <Textfield<FormShape>
              name="q"
              control={control}
              label={undefined}
              textfieldProps={{
                "data-cy": "search-input",
                placeholder,
                autoFocus: autoFocus && open,
                "aria-label": "Search events",
                icon: SearchIcon as any,
                className: "h-9 rounded-full leading-none py-0",
                ref: (el: any) => {
                  inputRef.current = el as HTMLInputElement | null
                },
              }}
            />
          </div>

          {/* Clear button inside the collapsible area */}
          {q.length > 0 && (
            <Tooltip title="Clear">
              <IconButton
                onClick={handleClear}
                size="small"
                aria-label="Clear search"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 9999,
                  display: "grid",
                  placeItems: "center",
                  p: 0,
                  alignSelf: "center",
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </Box>
  )
}

export default EventsFilterBar
