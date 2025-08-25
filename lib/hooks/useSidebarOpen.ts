import { useEffect, useMemo, useState } from "react"

export function useSidebarOpen(
  defaultWhenEventSelected: boolean,
  activeEventId?: number
): [boolean, (value: boolean) => void] {
  const [open, setOpen] = useState<number | null>(null)

  const storageKey = useMemo(
    () => (activeEventId != null ? `sidebarOpen:${activeEventId}` : `sidebarOpen:none`),
    [activeEventId]
  )

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey)
    if (stored != null) {
      setOpen(parseInt(stored, 10) === 1 ? 1 : 0)
      return
    }

    setOpen(activeEventId != null ? (defaultWhenEventSelected ? 1 : 0) : 0)
  }, [storageKey, activeEventId, defaultWhenEventSelected])

  // Persist on change (for both event-specific and "none" states)
  useEffect(() => {
    if (open == null) return
    sessionStorage.setItem(storageKey, open.toString())
  }, [open, storageKey])

  const sidebarOpen = open === 1
  const setSidebarOpen = (value: boolean) => setOpen(value ? 1 : 0)

  return [sidebarOpen, setSidebarOpen]
}
