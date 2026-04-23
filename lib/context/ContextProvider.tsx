import { useReducer, createContext, ReactNode, Dispatch } from "react"

interface State {
  learningContext: { type: "event"; id: number } | { type: "course"; externalId: string } | undefined
}

const initialState: State = {
  learningContext: undefined,
}

type Action = {
  type: "SET_LEARNING_CONTEXT"
  learningContext: State["learningContext"]
}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_LEARNING_CONTEXT":
      return {
        ...state,
        learningContext: action.learningContext,
      }
    default:
      return state
  }
}

const dummyDispatch: Dispatch<Action> = () => {}
export const AppContext = createContext({ state: initialState, dispatch: dummyDispatch })

interface ContextProviderProps {
  children: ReactNode
}
export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}
