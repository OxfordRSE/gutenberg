import { Prisma } from "@prisma/client"
import type { PrismaClient } from "@prisma/client"

const buildLogPrefix = "[build db]"

export const hasBuildDatabase = (): boolean => Boolean(process.env.DATABASE_URL)

export const logBuildDatabaseError = (label: string, error: unknown): void => {
  console.error(`${buildLogPrefix} ${label} failed`, error)
}

const isBuildDatabaseConnectionError = (error: unknown): boolean => {
  if (!(error instanceof Prisma.PrismaClientInitializationError)) {
    return false
  }

  return /can't reach database server|connection refused|timed out/i.test(error.message)
}

const isBuildDatabaseSchemaError = (error: unknown): boolean => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false
  }

  return ["P2021", "P2022"].includes(error.code)
}

const getBuildPrisma = async (): Promise<PrismaClient | null> => {
  if (!hasBuildDatabase()) {
    return null
  }

  return (await import("lib/prisma")).default
}

export const runBuildPrismaQuery = async <T>(
  label: string,
  fallback: T,
  query: (prisma: PrismaClient) => Promise<T>
): Promise<T> => {
  const prisma = await getBuildPrisma()
  if (!prisma) {
    return fallback
  }

  try {
    return await query(prisma)
  } catch (error) {
    if (!isBuildDatabaseConnectionError(error) && !isBuildDatabaseSchemaError(error)) {
      throw error
    }

    logBuildDatabaseError(label, error)
    return fallback
  }
}
