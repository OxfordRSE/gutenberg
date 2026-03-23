import React, { useMemo, useState } from "react"
import useSWR from "swr"
import { Button, Modal, Spinner } from "flowbite-react"
import { basePath } from "lib/basePath"
import type { Data as CourseData } from "pages/api/course"

type EventCreationMode = "blank" | "course"

export type EventCreationValues = {
  mode: EventCreationMode
  startAt: string
  courseId?: number
}

type Props = {
  show: boolean
  isSubmitting?: boolean
  onClose: () => void
  onCreate: (values: EventCreationValues) => Promise<void> | void
}

const coursesFetcher = (url: string) => fetch(url).then((response) => response.json() as Promise<CourseData>)

const defaultStartAtValue = () => {
  const date = new Date()
  date.setSeconds(0, 0)
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

type OptionCardProps = {
  selected: boolean
  title: string
  description: string
  onClick: () => void
  dataCy: string
}

const EventCreationOptionCard: React.FC<OptionCardProps> = ({ selected, title, description, onClick, dataCy }) => {
  return (
    <button
      type="button"
      data-cy={dataCy}
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition ${
        selected
          ? "border-cyan-600 bg-cyan-50 ring-2 ring-cyan-200 dark:border-cyan-400 dark:bg-cyan-950/30 dark:ring-cyan-900"
          : "border-gray-200 bg-white hover:border-cyan-300 dark:border-gray-700 dark:bg-gray-900"
      }`}
    >
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </button>
  )
}

const CreateEventModal: React.FC<Props> = ({ show, isSubmitting = false, onClose, onCreate }) => {
  const [mode, setMode] = useState<EventCreationMode>("blank")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [startAt, setStartAt] = useState(defaultStartAtValue())
  const { data, isLoading } = useSWR(show ? `${basePath}/api/course` : null, coursesFetcher)

  const courseOptions = useMemo(() => {
    return (data?.courses ?? []).map((course) => ({
      value: String(course.id),
      label: course.name,
    }))
  }, [data?.courses])

  const handleClose = () => {
    setMode("blank")
    setSelectedCourseId("")
    setStartAt(defaultStartAtValue())
    onClose()
  }

  const handleCreate = async () => {
    if (mode === "blank") {
      await onCreate({ mode, startAt })
      return
    }

    if (!selectedCourseId || !startAt) return
    await onCreate({ mode, startAt, courseId: Number(selectedCourseId) })
  }

  const isCreateDisabled = isSubmitting || !startAt || (mode === "course" && !selectedCourseId)

  return (
    <Modal dismissible show={show} onClose={handleClose} size="2xl">
      <Modal.Header>Create event</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Start from a blank event or copy the structure of an existing course as a blueprint.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <EventCreationOptionCard
              dataCy="create-event-mode-blank"
              selected={mode === "blank"}
              title="Blank event"
              description="Start with an empty event and add groups and material yourself."
              onClick={() => setMode("blank")}
            />
            <EventCreationOptionCard
              dataCy="create-event-mode-course"
              selected={mode === "course"}
              title="From course"
              description="Copy course groups and material into a new event that you can then customise."
              onClick={() => setMode("course")}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="sourceStartAt">
              Event start
            </label>
            <input
              id="sourceStartAt"
              data-cy="create-event-start-at"
              type="datetime-local"
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
            />
          </div>

          {mode === "course" && (
            <div className="space-y-2" data-cy="create-event-course-picker">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="sourceCourseId">
                Course blueprint
              </label>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Spinner size="sm" />
                  Loading courses…
                </div>
              ) : (
                <select
                  id="sourceCourseId"
                  data-cy="create-event-course-select"
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                >
                  <option value="">Select a course…</option>
                  {courseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button data-cy="confirm-create-event" onClick={handleCreate} disabled={isCreateDisabled}>
          {isSubmitting ? "Creating…" : mode === "blank" ? "Create blank event" : "Create from course"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CreateEventModal
