import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import Image from "next/image"
import { getMaterial, Material, removeMarkdown } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { useSession } from "next-auth/react"
import { Problem } from "@prisma/client"
import { EventFull as Event, UserOnEvent } from "lib/types"
import useProfile from "lib/hooks/useProfile"
import useUserEvents from "lib/hooks/useUserEvents"
import { PageTemplate } from "lib/pageTemplate"
import ProfileEventView from "components/ProfileEventView"

type EventProps = {
  material: Material
  event: Event
  pageInfo?: PageTemplate
}

const Profile: NextPage<EventProps> = ({ material }) => {
  const { data: session } = useSession()
  const { userProfile, error: profileError, isLoading: profileLoading } = useProfile()
  let eventsWithProblems = undefined
  eventsWithProblems = useUserEvents(userProfile?.email || "")

  let userEvents: Event[] = []
  let userProblems: Problem[] = []
  let userOnEvents: UserOnEvent[] = []
  if (eventsWithProblems) {
    if (eventsWithProblems.data !== undefined) {
      if ("userEvents" in eventsWithProblems.data) {
        userEvents = eventsWithProblems.data.userEvents
      }
      if ("problems" in eventsWithProblems.data) {
        userProblems = eventsWithProblems.data.problems
      }
      if ("userOnEvents" in eventsWithProblems.data) {
        userOnEvents = eventsWithProblems.data.userOnEvents
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
      <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md flex p-6">
        <div className="avatar">
          <Image
            width={50}
            height={50}
            className=" rounded-full"
            src={userProfile?.image ?? "avatar"}
            alt="User Avatar"
          />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-gray-900">{userProfile?.name}</h2>
          <h2 className="text-gray-700">{userProfile?.email}</h2>
        </div>
      </div>
      {userEvents && (
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-200 pt-4">
            <u>Enrolled Events</u>
          </h1>
          {userEvents.map((event) => (
            <ProfileEventView
              key={event.id}
              event={event}
              material={material}
              userProblems={userProblems}
              userOnEvent={userOnEvents.find((userOnEvent) => userOnEvent.eventId === event.id) as UserOnEvent}
            />
          ))}
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
