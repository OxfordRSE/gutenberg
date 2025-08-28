import React from "react"
import { Modal, Button } from "flowbite-react"
import Stack from "components/ui/Stack"
import { ProblemForm } from "lib/types"
import Chip from "@mui/material/Chip"

interface ProblemViewModalProps {
  show: boolean
  onClose: () => void
  values: ProblemForm
  title?: string
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <div className="text-sm font-medium text-gray-900 dark:text-slate-300">{label}</div>
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800 p-3 text-gray-900 dark:text-slate-200">
      {children}
    </div>
  </div>
)

const ProblemViewModal: React.FC<ProblemViewModalProps> = ({ show, onClose, values, title = "View Challenge" }) => {
  const { complete, solution, difficulty, notes } = values
  const difficultyVal = typeof difficulty === "number" ? difficulty : parseInt(String(difficulty) || "0", 10)

  return (
    <Modal show={show} size="3xl" dismissible={true} onClose={onClose}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
          <Stack spacing={4}>
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-slate-300">Status:</span>
              <Chip
                label={complete ? "Complete" : "Incomplete"}
                color={complete ? "success" : "default"}
                variant="outlined"
                size="small"
              />
            </div>

            {/* Solution */}
            <Field label="Your solution">
              {(solution ?? "").trim() ? (
                <pre className="whitespace-pre-wrap break-words font-sans">{solution}</pre>
              ) : (
                <span className="text-sm italic text-gray-500 dark:text-slate-400">No solution provided.</span>
              )}
            </Field>

            <Field label="Difficulty (1-10)">
              <div className="flex items-center gap-3">
                <div className="text-base font-semibold">{difficultyVal}</div>
                <div className="relative h-2 w-full rounded bg-gray-200 dark:bg-slate-700">
                  <div
                    className="absolute left-0 top-0 h-2 rounded bg-gray-500 dark:bg-slate-400"
                    style={{ width: `${Math.min(100, Math.max(0, (difficultyVal / 10) * 100))}%` }}
                  />
                </div>
              </div>
            </Field>

            {/* Notes */}
            <Field label="Feedback for course instructors">
              {notes?.trim() ? (
                <pre className="whitespace-pre-wrap break-words font-sans">{notes}</pre>
              ) : (
                <span className="text-sm italic text-gray-500 dark:text-slate-400">No feedback provided.</span>
              )}
            </Field>

            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </Stack>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ProblemViewModal
