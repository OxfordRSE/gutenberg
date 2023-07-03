import { User } from '@prisma/client';
import useUsers from 'lib/hooks/useUsers'
import { useSession } from 'next-auth/react';

// hook to get the current user's profile
function useProfile(): { userProfile: User | undefined, error: string, isLoading: boolean} {
  const { users, error, isLoading } = useUsers()
  const { data: session } = useSession()
  const userProfile = users?.find(user => user.email === session?.user?.email)
  return { userProfile, error, isLoading }
}

export default useProfile;

