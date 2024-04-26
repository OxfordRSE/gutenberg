import React from "react"
import { BsSunFill, BsFillMoonFill } from "react-icons/bs"
import { useTheme } from "next-themes"

export const ThemeButton = () => {
  const { systemTheme, theme, setTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme

  let icon = currentTheme == "dark" ? <BsSunFill /> : <BsFillMoonFill />
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => (theme == "dark" ? setTheme("light") : setTheme("dark"))}
      className="bg-gray-800 dark:bg-gray-50 hover:bg-gray-600 dark:hover:bg-gray-300 transition-all duration-100 text-white rounded dark:text-gray-800 px-2 py-2"
    >
      {icon}
    </button>
  )
}
