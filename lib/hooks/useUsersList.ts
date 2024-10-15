import { useEffect, useState } from "react"
import useSWR from "swr"
import { basePath } from "lib/basePath"
import { User, UserPublic } from "pages/api/user/[email]"

// Single user fetcher for individual email
const fetchUser = async (email: string): Promise<User | UserPublic | undefined> => {
  const response = await fetch(`${basePath}/api/user/${email}`)
  const data = await response.json()
  return data.user
}

const useUsersList = (emails: string[]) => {
  const [users, setUsers] = useState<{ [email: string]: User | UserPublic | undefined }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    const uniqueEmails = Array.from(new Set(emails)) // Avoid duplicate requests for the same email
    setLoading(true)

    const fetchUsers = async () => {
      try {
        const fetchedUsers: { [email: string]: User | UserPublic | undefined } = {}
        await Promise.all(
          uniqueEmails.map(async (email) => {
            const user = await fetchUser(email)
            if (user) {
              fetchedUsers[email] = user
            }
          })
        )
        setUsers(fetchedUsers)
        setLoading(false)
      } catch (err) {
        setError("Failed to load users")
        setLoading(false)
      }
    }

    if (uniqueEmails.length > 0) {
      fetchUsers()
    }
  }, [emails])

  return { users, loading, error }
}

export default useUsersList
