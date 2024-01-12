import { useReducer, createContext, ReactNode, Dispatch } from "react"

interface State {
  activeEventId: number | undefined
}

const initialState: State = {
  activeEventId: undefined,
}

type Action = { type: "SET_ACTIVE_EVENT_ID"; activeEventId: number | undefined }

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_ACTIVE_EVENT_ID":
      return {
        activeEventId: action.activeEventId,
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
