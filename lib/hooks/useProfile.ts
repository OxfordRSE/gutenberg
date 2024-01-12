import { User } from "@prisma/client"
import useUsers from "lib/hooks/useUsers"
import { useSession } from "next-auth/react"
import useUser from "./useUser"

// hook to get the current user's profile
function useProfile(): { userProfile: User | undefined; error: string; isLoading: boolean } {
  const { data: session } = useSession()
  const { user, error, isLoading, mutate } = useUser(session?.user?.email || undefined)
  const ownUser = user as User
  return { userProfile: ownUser, error, isLoading }
}

export default useProfile
