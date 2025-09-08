import React, { useState, useEffect } from "react"
import { Tooltip } from "@mui/material"
import { BiArrowToTop, BiArrowToBottom } from "react-icons/bi"
import { Button } from "flowbite-react"
import EventsFilterBar from "components/timeline/EventsFilterBar"

type Props = {
  oldEvents: number
  newEvents: number
  filteredLength: number
  query: string
  onQueryChange: (q: string) => void
  onDebouncedQueryChange?: (q: string) => void
  onLoadMore: () => void // reveal 3 older
  onHideMore: () => void // hide 3 older
  placeholder?: string
  className?: string
}

const EventsToolbar: React.FC<Props> = ({
  oldEvents,
  newEvents,
  filteredLength,
  query,
  onQueryChange,
  onDebouncedQueryChange,
  onLoadMore,
  onHideMore,
  placeholder = "Filter events…",
  className,
}) => {
  const olderTotal = filteredLength - newEvents
  const canShowOlder = oldEvents > 0
  const canHideOlder = oldEvents < olderTotal
  const [openShowTT, setOpenShowTT] = useState(false)
  const [openHideTT, setOpenHideTT] = useState(false)

  useEffect(() => {
    setOpenShowTT(false)
  }, [canShowOlder])

  useEffect(() => {
    setOpenHideTT(false)
  }, [canHideOlder])
  return (
    <div className={`mb-4 flex items-center gap-2 ${className ?? ""}`}>
      {/* Show older */}
      <Tooltip
        key={`show-${canShowOlder}`}
        title="Show older events"
        open={canShowOlder ? openShowTT : false}
        onOpen={() => setOpenShowTT(true)}
        onClose={() => setOpenShowTT(false)}
        disableHoverListener={!canShowOlder}
        disableFocusListener={!canShowOlder}
        disableTouchListener={!canShowOlder}
      >
        <span className={canShowOlder ? "" : "invisible"} aria-hidden={!canShowOlder}>
          <Button
            color="gray"
            size="xs"
            onClick={onLoadMore}
            data-cy="load-more-events"
            tabIndex={canShowOlder ? 0 : -1}
          >
            <BiArrowToTop />
          </Button>
        </span>
      </Tooltip>

      {/* Hide older */}
      <Tooltip
        key={`hide-${canHideOlder}`}
        title="Hide older events"
        open={canHideOlder ? openHideTT : false}
        onOpen={() => setOpenHideTT(true)}
        onClose={() => setOpenHideTT(false)}
        disableHoverListener={!canHideOlder}
        disableFocusListener={!canHideOlder}
        disableTouchListener={!canHideOlder}
      >
        <span className={canHideOlder ? "" : "invisible"} aria-hidden={!canHideOlder}>
          <Button color="gray" size="xs" onClick={onHideMore} tabIndex={canHideOlder ? 0 : -1}>
            <BiArrowToBottom />
          </Button>
        </span>
      </Tooltip>

      {/* Filter */}
      <div className="ml-auto">
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
