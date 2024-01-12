import { useState, useEffect } from "react"

export function useSidebarOpen(defaultValue: boolean): [boolean, (value: boolean) => void] {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const store = sessionStorage.getItem("sidebarOpen")
    if (store) {
      setOpen(parseInt(store))
    } else {
      setOpen(defaultValue ? 1 : 0)
    }
  }, [defaultValue])

  useEffect(() => {
    const store = open?.toString()
    if (store) {
      sessionStorage.setItem("sidebarOpen", store)
    }
  }, [open])

  const sidebarOpen = open === 1
  const setSidebarOpen = (value: boolean) => setOpen(value ? 1 : 0)

  return [sidebarOpen, setSidebarOpen]
}
