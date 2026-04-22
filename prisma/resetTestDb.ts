import { execFile } from "node:child_process"
import path from "node:path"
import { promisify } from "node:util"
import { fileURLToPath } from "node:url"
import prisma from "../lib/prisma"

const execFileAsync = promisify(execFile)
const seedCommand = process.platform === "win32" ? "yarn.cmd" : "yarn"
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1", "db", "host.docker.internal"])

const truncateMutableTablesSql = `
  TRUNCATE TABLE
    "Comment",
    "CommentThread",
    "EventItem",
    "EventGroup",
    "UserOnEvent",
    "Event",
    "CourseItem",
    "CourseGroup",
    "UserOnCourse",
    "Course",
    "Problem",
    "Session",
    "Account",
    "VerificationToken",
    "User"
  RESTART IDENTITY CASCADE
`

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("resetTestDb refused to run: DATABASE_URL is not set.")
  }
  return databaseUrl
}

function ensureExecutionContextIsSafe() {
  const isAllowedContext =
    process.env.NODE_ENV === "test" || process.env.CYPRESS === "true" || process.env.ALLOW_E2E_DB_RESET === "1"

  if (!isAllowedContext) {
    throw new Error("resetTestDb refused to run: requires NODE_ENV=test, CYPRESS=true, or ALLOW_E2E_DB_RESET=1.")
  }
}

function parseDatabaseUrl(databaseUrl: string) {
  try {
    return new URL(databaseUrl)
  } catch {
    throw new Error("resetTestDb refused to run: DATABASE_URL is not a valid URL.")
  }
}

function ensureDatabaseNameIsSafe(databaseUrl: URL) {
  const databaseName = databaseUrl.pathname.replace(/^\/+/, "")
  const looksLikeTestDatabase = /(?:^|_)test$/i.test(databaseName)

  if (!looksLikeTestDatabase) {
    throw new Error(
      `resetTestDb refused to run: database "${databaseName || "(default)"}" does not look like a dedicated test database.`
    )
  }
}

function ensureDatabaseHostIsSafe(databaseUrl: URL) {
  const isLocalHost = localDatabaseHosts.has(databaseUrl.hostname)
  const explicitlyAllowedRemote = process.env.ALLOW_REMOTE_E2E_DB_RESET === "1"

  if (!isLocalHost && !explicitlyAllowedRemote) {
    throw new Error(
      `resetTestDb refused to run: host "${databaseUrl.hostname}" is not local. Set ALLOW_REMOTE_E2E_DB_RESET=1 only if you truly intend this.`
    )
  }
}

export async function resetTestDb() {
  ensureExecutionContextIsSafe()
  const databaseUrl = getDatabaseUrl()
  const parsedDatabaseUrl = parseDatabaseUrl(databaseUrl)
  ensureDatabaseNameIsSafe(parsedDatabaseUrl)
  ensureDatabaseHostIsSafe(parsedDatabaseUrl)

  await prisma.$executeRawUnsafe(truncateMutableTablesSql)
  await execFileAsync(seedCommand, ["tsx", "prisma/seed.ts"], {
    cwd: repoRoot,
    env: process.env,
  })
}
