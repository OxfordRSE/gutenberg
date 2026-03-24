import useLearningContext from "./useLearningContext"

function useActiveCourse(): [string | undefined, (externalId: string | undefined) => void] {
  const [learningContext, setLearningContext] = useLearningContext()
  const activeCourseExternalId = learningContext?.type === "course" ? learningContext.externalId : undefined

  const setActiveCourse = (externalId: string | undefined) => {
    return externalId ? setLearningContext({ type: "course", externalId }) : setLearningContext(undefined)
  }

  return [activeCourseExternalId, setActiveCourse]
}

export default useActiveCourse
