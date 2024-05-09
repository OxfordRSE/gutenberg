import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import { getMaterial, Material, removeMarkdown } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { useSession } from "next-auth/react"
import { Problem } from "@prisma/client"

import useProfile from "lib/hooks/useProfile"
import useUserEvents from "lib/hooks/useUserEvents"
import { PageTemplate } from "lib/pageTemplate"
import { useProblems } from "lib/hooks/useProblems"

type EventProps = {
  material: Material
  event: Event
  pageInfo?: PageTemplate
}

const Profile: NextPage<EventProps> = ({ material }) => {
  const { data: session } = useSession()
  const { userProfile, error: profileError, isLoading: profileLoading } = useProfile()
  const isAdmin = userProfile?.admin

  let eventsWithProblems = undefined

  eventsWithProblems = useUserEvents(userProfile?.email || "")

  let userEvents = undefined
  let problems = undefined
  if (eventsWithProblems) {
    if (eventsWithProblems.data !== undefined) {
      if ("userEvents" in eventsWithProblems.data) {
        userEvents = eventsWithProblems.data.userEvents
      }
      if ("problems" in eventsWithProblems.data) {
        problems = eventsWithProblems.data.problems
      }
    }
  }

  if (profileError) return <div>{profileError}</div>
  if (profileLoading) return <div>loading...</div>
  if (!session) {
    return <div>Not logged in...</div>
  }
  return (
    <Layout material={material}>
      <div>
        <h1>Profile</h1>
        <h2>{userProfile?.email}</h2>
        <h2>{userProfile?.name}</h2>
        <h2>{userProfile?.image}</h2>
      </div>
      {userEvents && (
        <div>
          <h1>Events</h1>
          {/* {userEvents.map((event) => (
            <div>
              <h2>{event.userEmail}</h2>
              <h2>{event.eventId}</h2>
              <h2>{event.eventType}</h2>
            </div>
          ))} */}
        </div>
      )}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  let material = await getMaterial()

  removeMarkdown(material, undefined)

  return {
    props: makeSerializable({ material }),
  }
}

export default Profile
