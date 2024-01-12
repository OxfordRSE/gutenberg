import { SessionProvider } from "next-auth/react"
import "../styles/globals.css"
import type { AppProps } from "next/app"
import type { Session } from "next-auth"
import { basePath } from "lib/basePath"
import { ContextProvider } from "lib/context/ContextProvider"
import { ThemeProvider } from "next-themes"

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session} basePath={`${basePath}/api/auth`}>
      <ContextProvider>
        <ThemeProvider attribute="class">
          <Component {...pageProps} />
        </ThemeProvider>
      </ContextProvider>
    </SessionProvider>
  )
}
