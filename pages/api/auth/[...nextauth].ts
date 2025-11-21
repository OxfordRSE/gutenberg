import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "lib/prisma"
import { getProviderConfig, providerEnabled } from "lib/authConfig"

function warn(msg: string) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("[auth] " + msg)
  }
}

function buildProviders() {
  const providers = []

  // GitHub (enabled by default)
  if (providerEnabled("github")) {
    if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
      const cfg = getProviderConfig("github")
      providers.push(
        GithubProvider({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
          allowDangerousEmailAccountLinking: true,
          name: cfg?.name || "GitHub",
        })
      )
    } else {
      warn("GitHub enabled but GITHUB_ID/GITHUB_SECRET missing")
    }
  }

  // Azure AD (disabled by default)
  if (providerEnabled("azure-ad")) {
    if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
      const cfg = getProviderConfig("azure-ad")
      providers.push(
        AzureADProvider({
          clientId: process.env.AZURE_CLIENT_ID,
          clientSecret: process.env.AZURE_CLIENT_SECRET,
          tenantId: process.env.AZURE_TENANT_ID,
          allowDangerousEmailAccountLinking: true,
          name: cfg?.name || "Azure AD",
        })
      )
    } else {
      warn("Azure AD enabled but AZURE_CLIENT_ID/AZURE_CLIENT_SECRET/AZURE_TENANT_ID missing")
    }
  }

  return providers
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: buildProviders(),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn({ user, account, profile, email }) {
      // Remove ext_expires_in before it gets saved to database
      if (account) {
        delete (account as any).ext_expires_in
      }
      return true
    },
    async jwt({ token }) {
      token.userRole = "admin"
      return token
    },
  },
}

export default NextAuth(authOptions)
