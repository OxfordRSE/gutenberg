import React from "react"
import EventsFilterBar from "components/timeline/EventsFilterBar"

type Props = {
  query: string
  onQueryChange: (q: string) => void
  onDebouncedQueryChange?: (q: string) => void
  placeholder?: string
  className?: string
}

const EventsToolbar: React.FC<Props> = ({
  query,
  onQueryChange,
  onDebouncedQueryChange,
  placeholder = "Filter events…",
  className,
}) => {
  return (
    <div className={`mb-4 flex items-center justify-end gap-2 ${className ?? ""}`}>
      <div>
        <EventsFilterBar
          value={query}
          onChange={onQueryChange}
          onDebouncedChange={(q) => onDebouncedQueryChange?.(q.toLowerCase())}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export default EventsToolbar
