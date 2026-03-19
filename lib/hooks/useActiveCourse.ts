import { useEffect, useContext, useCallback } from "react"
import { AppContext } from "lib/context/ContextProvider"

function useActiveCourse(): [number | undefined, (courseId: number | undefined) => void] {
  const { state, dispatch } = useContext(AppContext)

  const activeCourseId = state.activeCourseId

  const setActiveCourseId = useCallback(
    (id: number | undefined) => {
      dispatch({ type: "SET_ACTIVE_COURSE_ID", activeCourseId: id })
    },
    [dispatch]
  )

  useEffect(() => {
    const stored = localStorage.getItem("activeCourse")
    if (stored) {
      setActiveCourseId(parseInt(stored, 10))
    }
  }, [setActiveCourseId])

  useEffect(() => {
    const stored = activeCourseId?.toString()
    if (stored) {
      localStorage.setItem("activeCourse", stored)
    } else {
      localStorage.removeItem("activeCourse")
    }
  }, [activeCourseId])

  return [activeCourseId, setActiveCourseId]
}

export default useActiveCourse
