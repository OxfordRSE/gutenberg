import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import Stack from "./Stack"
import React, { SyntheticEvent, useRef } from "react"
import { Tooltip } from "@mui/material"

export type SectionLink = {
  theme?: String
  course?: String
  section?: String
  tags?: String[]
  linkedType: string
  direction: string
  url: string
}

export const LinkedSection = (sectionLink: SectionLink) => {
  let iconColor = "grey"
  let borderColor = "border-grey-700 dark:border-grey-500"

  const trimString = (str: String, len: number) => {
    return str.length > len ? str.substring(0, len - 3) + "..." : str
  }

  const handleMouseEnter = (e: SyntheticEvent) => {
    e.currentTarget.classList.add("parent-hovered")
  }

  const handleMouseLeave = (e: SyntheticEvent) => {
    e.currentTarget.classList.remove("parent-hovered")
  }

  if (sectionLink.linkedType === "event") {
    iconColor = "#14b8a6"
    borderColor = "border-teal-700 dark:border-teal-500"
  } else if (sectionLink.linkedType === "internal") {
    iconColor = "#a855f7"
    borderColor = "border-purple-700 dark:border-purple-500"
  } else {
    iconColor = "#d946ef"
    borderColor = "border-fuchsia-700 dark:border-fuchsia-500"
  }

  const tooltipTitle =
    (sectionLink.theme ? sectionLink.theme + ": " : "") +
    (sectionLink.course ? sectionLink.course + " - " : "") +
    (sectionLink.section ? sectionLink.section : "")

  let stackDirection
  let navIcon
  if (sectionLink.direction === "prev") {
    stackDirection = "row"
    navIcon = <HiChevronLeft className="nav-chevron mt-3 h-6 w-4" style={{ color: iconColor }} />
  } else {
    stackDirection = "row-reverse"
    navIcon = <HiChevronRight className="nav-chevron mt-3 h-6 w-4" style={{ color: iconColor }} />
  }

  return (
    <Tooltip title={tooltipTitle}>
      <a href={`${sectionLink.url}`} className={`pointer-events-auto text-gray-600 hover:text-gray-500 opacity-50`}>
        <div
          className={`group rounded-md border-2 hover:border-4 ${borderColor} h-[55px] w-[150px] text-sm`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Stack spacing={1} direction={stackDirection as "row" | "col" | "row-reverse" | "col-reverse" | undefined}>
            {navIcon}
            <div>
              {sectionLink.theme && (
                <p className="text-slate-500 dark:text-slate-200 text-xs font-medium">
                  {trimString(sectionLink.theme, 21)}
                </p>
              )}
              {sectionLink.course && (
                <p className="text-slate-600 dark:text-slate-300 text-xs"> {trimString(sectionLink.course, 21)} </p>
              )}
              {sectionLink.section && (
                <p className="text-slate-700 dark:text-slate-400">
                  {trimString(sectionLink.section, 16)} {sectionLink.tags && `[${sectionLink.tags.join(", ")}]`}
                </p>
              )}
            </div>
          </Stack>
        </div>
      </a>
    </Tooltip>
  )
}
