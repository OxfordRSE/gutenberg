import { getProviders, signIn } from "next-auth/react"
import { GetServerSidePropsContext } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import Image from "next/image"
import { getProviderConfig } from "lib/authConfig"

type DisplayProvider = {
  id: string
  name: string
  buttonColor: string
  hoverColor: string
  icon?: "shield" | "github"
}

export default function SignIn({
  providers,
  displayProviders,
}: {
  providers: any
  displayProviders: DisplayProvider[]
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to Gutenberg</h2>
        </div>

        <div className="mt-8 space-y-4">
          {displayProviders.map((p) => {
            return (
              <button
                key={p.id}
                onClick={() => signIn(p.id)}
                className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: p.buttonColor }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = p.hoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = p.buttonColor)}
              >
                {p.icon === "shield" && (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                )}
                {p.icon === "github" && (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                )}
                <span>Sign in with {p.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  // If already signed in, redirect to home
  if (session) {
    return { redirect: { destination: "/", permanent: false } }
  }

  const providers = await getProviders()
  const displayProviders: DisplayProvider[] = Object.values(providers ?? {}).map((p: any) => {
    const cfg = getProviderConfig(p.id)
    const buttonColor = cfg?.button?.color || "#6b7280"
    const hoverColor = cfg?.button?.hover || "#4b5563"
    const icon = (cfg?.button?.icon as DisplayProvider["icon"]) || undefined
    const name = cfg?.name || p.name
    return { id: p.id, name, buttonColor, hoverColor, icon }
  })
  return {
    props: { providers: providers ?? [], displayProviders },
  }
}
