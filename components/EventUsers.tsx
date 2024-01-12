import React, { useEffect } from "react"
import { HiArrowNarrowRight } from "react-icons/hi"
import { Material } from "lib/material"
import { EventFull, Event, Problem } from "lib/types"
import useSWR, { Fetcher } from "swr"
import Title from "components/ui/Title"
import { Avatar, Button, Card, Timeline } from "flowbite-react"
import { ListGroup } from "flowbite-react"
import { basePath } from "lib/basePath"
import { useFieldArray, useForm } from "react-hook-form"
import SelectField from "./forms/SelectField"
import { UsersWithUserOnEvents } from "pages/api/event/[eventId]/users"

type Props = {
  event: Event
}

type Data = {
  users: UsersWithUserOnEvents[]
}

const usersFetcher: Fetcher<{ users: UsersWithUserOnEvents[] }, string> = (url) => fetch(url).then((r) => r.json())

const EventUsers: React.FC<Props> = ({ event }) => {
  const apiPath = `${basePath}/api/event/${event.id}/users`
  const { data: users, error: usersError, mutate } = useSWR(apiPath, usersFetcher)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<Data>({ defaultValues: users || { users: [] } })

  const { fields } = useFieldArray({
    control,
    name: "users",
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isDirty) {
        handleSubmit((data) => {
          const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
          fetch(apiPath, requestOptions)
            .then((response) => response.json())
            .then((data) => {
              mutate(data)
            })
        })()
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [handleSubmit, isDirty, apiPath, mutate])

  useEffect(() => {
    reset({ users: users?.users || [] })
  }, [users, reset])

  if (usersError || !users) {
    return null
  }

  const statusOptions = [
    { label: "student", value: "STUDENT" },
    { label: "instructor", value: "INSTRUCTOR" },
    { label: "request", value: "REQUEST" },
    { label: "reject", value: "REJECTED" },
  ]

  return (
    <div className="container mx-auto max-w-md">
      <div className="border-b border-gray-300 my-4 max-w-[80%] mx-auto"></div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Users on event</h5>
        </div>
        <div className="flow-root">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {fields.map((user, i) => (
              <div key={i}>
                {user && user.user && (
                  <li className="py-3 sm:py-4">
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0">
                        <Avatar img={user.user.image || undefined} rounded={true} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.user.name}</p>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.user.email}</p>
                      </div>
                      <SelectField control={control} name={`users.${i}.status`} options={statusOptions} />
                    </div>
                  </li>
                )}
              </div>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default EventUsers
