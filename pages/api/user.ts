import { PrismaClient, User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import useSWR, { Fetcher, KeyedMutator } from 'swr'
import { basePath } from 'lib/basePath'

const prisma = new PrismaClient();

export type GetData = { 
  users?: User[],
  error?: string,
}

const usersFetcher: Fetcher<GetData, string> = url => fetch(url).then(r => r.json())

// hook to get all users
export const useUsers = (): { users: User[] | undefined, error: string, isLoading: boolean, mutate: KeyedMutator<GetData> } => {
  const { data, error, isLoading, mutate} = useSWR(`${basePath}/api/user`, usersFetcher)
  const errorString = error ? error : data && 'error' in data ? data.error : undefined;
  const users = data && 'users' in data ? data.users : undefined;
  return { users, error: errorString, isLoading, mutate}
}

// hook to get the current user's profile
export function useProfile(): { userProfile: User | undefined, error: string, isLoading: boolean} {
  const { users, error, isLoading } = useUsers()
  const { data: session } = useSession()
  const userProfile = users?.find(user => user.email === session?.user?.email)
  return { userProfile, error, isLoading }
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userEmail = session.user?.email || undefined;

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!currentUser) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (currentUser.admin) {
    const users = await prisma.user.findMany();
    res.status(200).json({ users });
  } else {
    res.status(200).json({ users: [currentUser] });
  }
}