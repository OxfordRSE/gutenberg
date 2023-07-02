import { PrismaClient, User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'

const prisma = new PrismaClient();

export type GetData = { users: User[] } | { users: string }

const usersFetcher: Fetcher<GetData, string> = url => fetch(url).then(r => r.json())

// hook to get the current user's profile
export function useProfile(): User | undefined {
  const { data: usersResponse, error: usersError } = useSWR(`${basePath}/api/user`, usersFetcher)
  const { data: session } = useSession()

  if (usersError) return undefined
  if (!usersResponse) return undefined
  if (!session) return undefined
  if (!Array.isArray(usersResponse.users)) return undefined

  const userProfile = usersResponse.users.find(user => user.email === session?.user?.email)
  return userProfile
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ users: 'Unauthorized' });
    return;
  }

  const userEmail = session.user?.email || undefined;

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!currentUser) {
    res.status(401).json({ users: 'Unauthorized' });
    return;
  }

  if (currentUser.admin) {
    const users = await prisma.user.findMany();
    res.status(200).json({ users });
  } else {
    res.status(200).json({ users: [currentUser] });
  }
}