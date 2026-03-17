import Link from "next/link"
import { Button, Card } from "flowbite-react"
import { Event } from "lib/types"
import { useSession } from "next-auth/react"
import useUserEvents from "lib/hooks/useUserEvents"
import EventActions from "components/timeline/EventActions"
import useActiveEvent from "lib/hooks/useActiveEvents"

type Props = {
  events: Event[]
}

const HomeEventsPanel: React.FC<Props> = ({ events: _events }) => {
  const { data: session } = useSession()
  const { data: userEventsData, isLoading } = useUserEvents(session?.user?.email)
  const [activeEvent] = useActiveEvent()
  const enrolledEvents = ((userEventsData?.userEvents ?? []) as Event[])
    .map((event: Event) => ({
      ...event,
      start: new Date(event.start as unknown as string),
      end: new Date(event.end as unknown as string),
    }))
    .sort(
      (a: Event & { start: Date; end: Date }, b: Event & { start: Date; end: Date }) =>
        a.start.getTime() - b.start.getTime()
    )
  const displayedEvents = enrolledEvents.slice(0, 2)

  return (
    <Card>
      <div className="flex h-full flex-col gap-4 p-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {session ? "Your Events" : "Events"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {session
                ? "Events you are enrolled on. Full scheduling stays on the events page."
                : "Scheduled teaching stays here. The full timeline lives on the events page."}
            </p>
          </div>
          <Link href="/events">
            <Button color="info" size="xs">
              + Enrol on event
            </Button>
          </Link>
        </div>

        {!session ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            Sign in to see the events you are enrolled on.
          </div>
        ) : isLoading ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            Loading your events...
          </div>
        ) : displayedEvents.length > 0 ? (
          <div className="space-y-3">
            {displayedEvents.map((event: Event & { start: Date; end: Date }) => (
              <article
                key={event.id}
                className={`rounded-lg border p-4 ${
                  activeEvent?.id === event.id
                    ? "border-cyan-300 bg-cyan-50/70 dark:border-cyan-700 dark:bg-cyan-950/20"
                    : "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/event/${event.id}`}
                      className="text-sm text-gray-400 hover:underline dark:text-gray-500"
                    >
                      <time dateTime={event.start.toISOString()}>
                        {`${event.start.toLocaleString([], {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - ${event.end.toLocaleString([], {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                      </time>
                    </Link>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      <Link href={`/event/${event.id}`} className="hover:underline">
                        {event.name}
                      </Link>
                    </h3>
                    {event.summary && <p className="mt-2 text-gray-600 dark:text-gray-300">{event.summary}</p>}
                  </div>
                  <div className="flex-none">
                    <EventActions event={event} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            You are not currently enrolled on any events.
          </div>
        )}

        <div className="mt-2 flex gap-3">
          <Link href="/events">
            <Button color="gray">Browse all events</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default HomeEventsPanel
