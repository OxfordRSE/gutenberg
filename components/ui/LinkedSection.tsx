import { Section } from "lib/material"
import { HiArrowCircleLeft, HiArrowCircleRight, HiChevronLeft, HiChevronRight } from "react-icons/hi"
import Stack from "./Stack"
import React, { SyntheticEvent, useRef } from "react"

export type SectionLink = {
  theme?: String
  course?: String
  section?: String
  tags?: String[]
  linkedType: string
  direction: string
  url: string
  offset: number
}

export const LinkedSection = (sectionLink: SectionLink) => {
  let iconColor = "grey"
  let borderColor = "border-grey-700 dark:border-grey-500"

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

  if (sectionLink.direction === "prev") {
    return (
      <a
        href={`${sectionLink.url}`}
        className={`pointer-events-auto absolute bottom-20 left-0 text-gray-600 hover:text-gray-500 opacity-50`}
        style={{ marginBottom: `${sectionLink.offset}px` }}
      >
        <div
          className={`group rounded-md border-2 hover:border-4 ${borderColor} h-[85px] w-[160px] -ml-2 text-sm`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Stack spacing={4} direction="row">
            <HiChevronLeft className="nav-chevron absolute right-0 bottom-8 h-6 w-6" style={{ color: iconColor }} />
            <div className="w-[140px]" style={{ marginLeft: "2px" }}>
              {sectionLink.theme && (
                <p className="text-slate-500 dark:text-slate-200 text-xs font-medium">
                  {sectionLink.theme}
                  {sectionLink.course && ":"}
                </p>
              )}
              {sectionLink.course && <p className="text-slate-600 dark:text-slate-300 text-xs">{sectionLink.course}</p>}
              {sectionLink.section && (
                <p className="text-slate-700 dark:text-slate-400">
                  {sectionLink.section} {sectionLink.tags && `[${sectionLink.tags.join(", ")}]`}
                </p>
              )}
            </div>
          </Stack>
        </div>
      </a>
    )
  } else if (sectionLink.direction === "next") {
    return (
      <a
        href={`${sectionLink.url}`}
        className={`pointer-events-auto absolute bottom-20 right-0 text-gray-600 hover:text-gray-500 opacity-50`}
        style={{ marginBottom: `${sectionLink.offset}px` }}
      >
        <div
          className={`group rounded-md border-2 hover:border-4 ${borderColor} h-[85px] w-[160px]`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ color: `${iconColor}` }}
        >
          <Stack spacing={4} direction="row">
            <div>
              <HiChevronRight
                className="nav-chevron absolute left-0 bottom-8 h-6 w-6"
                style={{ color: `${iconColor}` }}
              />
              <div className="w-[140px] ml-[20px]">
                {sectionLink.theme && (
                  <p className="text-slate-500 dark:text-slate-200 text-xs font-medium">{sectionLink.theme} :</p>
                )}
                {sectionLink.course && (
                  <p className="text-slate-600 dark:text-slate-300 text-xs">{sectionLink.course}</p>
                )}
                {sectionLink.section && (
                  <p className="text-slate-700 dark:text-slate-400 text-xs">
                    {sectionLink.section}
                    {sectionLink.tags && ` [${sectionLink.tags.join(", ")}]`}
                  </p>
                )}
              </div>
            </div>
          </Stack>
        </div>
      </a>
    )
  }
}
