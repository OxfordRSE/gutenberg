import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import GithubProvider from "next-auth/providers/github"
import TwitterProvider from "next-auth/providers/twitter"
import Auth0Provider from "next-auth/providers/auth0"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "lib/prisma"
// import AppleProvider from "next-auth/providers/apple"
// import EmailProvider from "next-auth/providers/email"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    /* EmailProvider({
         server: process.env.EMAIL_SERVER,
         from: process.env.EMAIL_FROM,
       }),
    // Temporarily removing the Apple provider from the demo site as the
    // callback URL for it needs updating due to Vercel changing domains

    Providers.Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    */
    GithubProvider({
      clientId: process.env.GITHUB_ID ? process.env.GITHUB_ID : "clientId",
      clientSecret: process.env.GITHUB_SECRET ? process.env.GITHUB_SECRET : "clientSecret",
      allowDangerousEmailAccountLinking: true, // NOTE(ADW): Github accounts verify emails so we can allow account linking
      // otherwise users with email shared between oxford sso and github will get ambiguous errors
    }),
    AzureADProvider({
      clientId: process.env.AZURE_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_TENANT_ID ?? "common",
      name: "Oxford SSO",
      allowDangerousEmailAccountLinking: true, // NOTE(ADW): Oxford SSO accounts verify emails so we can allow account linking
      // otherwise users with email shared between oxford sso and github will get ambiguous errors
    }),
    /*
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
    }),
    Auth0Provider({
      clientId: process.env.AUTH0_ID,
      clientSecret: process.env.AUTH0_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
    */
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
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
