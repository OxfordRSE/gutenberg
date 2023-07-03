import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import prisma from 'lib/prisma'
import { getMaterial, Theme, Material, remove_markdown } from 'lib/material'
import Layout from 'components/Layout'
import {makeSerializable} from 'lib/utils'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import Title from 'components/Title'
import { Event, EventFull } from 'lib/types'
import { basePath } from 'lib/basePath'
import Link from 'next/link'
import useEventGroup from 'lib/hooks/useEventGroup'
import useProfile from 'lib/hooks/useProfile'
import { Tabs } from 'flowbite-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { EventGroup } from 'pages/api/eventGroup/[eventGroupId]'
import { useEffect } from 'react'
import { putEventGroup } from 'lib/actions/putEventGroup'
import Stack from 'components/ui/Stack'
import Textfield from 'components/forms/Textfield'
import Textarea from 'components/forms/Textarea'
import { MdEdit, MdPreview } from 'react-icons/md'
import DateTimeField from 'components/forms/DateTimeField'

type EventGroupProps = {
  material: Material,
  event: Event,
  eventGroupId: number,
}

const EventGroupPage: NextPage<EventGroupProps> = ({ material, event, eventGroupId }) => {
  const { eventGroup, error: eventGroupError, isLoading: eventGroupIsLoading, mutate: mutateEventGroup } = useEventGroup(eventGroupId)
  const { userProfile, error: profileError, isLoading: profileLoading } = useProfile();
  const isAdmin = userProfile?.admin;
  const { control, handleSubmit, reset, setValue } = useForm<EventGroup>({ defaultValues: eventGroup });

  useEffect(() => {
    reset(eventGroup);
  }, [eventGroup]);

  const { fields: eventItemss, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: "EventItem",
  });

  const onSubmit = (data: EventGroup) => {
    putEventGroup(data).then((data) => data.eventGroup && mutateEventGroup(data.eventGroup));
  }

  if (eventGroupIsLoading) return <div>Loading...</div>
  if (!eventGroup) return (
    <>
      <Title text={event.name} />
      <p>
        You are not enrolled on this event, please see the main <Link href={`/event/${event.id}`}>event page</Link> for more information.
      </p>
    </>
  )

  const eventGroupView = (
    <>
      <Title text={`${eventGroup.name} in ${event.name}`} />
      <Content markdown={eventGroup.content} />
    </>
  )

  const eventGroupEditView = (
    <form onSubmit={handleSubmit(onSubmit)}>
    <Stack>
      <Textfield label="Title" name="name" control={control} />
      <Textfield label="Location" name="location" control={control} />
      <Textarea label="Summary" name="summary" control={control} />
      <Textarea label="Content" name="content" control={control} />
      <DateTimeField label="Start" name="start" control={control} />
      <DateTimeField label="End" name="end" control={control} />
    </Stack>
    </form>
  )


  return (
    <Layout material={material}>
      { isAdmin ? (
        <Tabs.Group style="underline" >
        <Tabs.Item active icon={MdPreview} title="Event">
          {eventGroupView}

        </Tabs.Item>
        <Tabs.Item icon={MdEdit} title="Edit">
          {eventGroupEditView}
        </Tabs.Item>
        </Tabs.Group>
      ) : eventGroupView}       
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await prisma.event.findMany({include: { EventGroup: true }}).catch((e) => []);
  let paths = []
  for (let event of events) {
    for (let eventGroup of event.EventGroup) {
        paths.push({ params: { eventId: `${event.id}`, eventGroupId: `${eventGroup.id}` } })
    }
  }
  return {
    paths,
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const eventId = parseInt(context?.params?.eventId as string);
  const eventGroupId = parseInt(context?.params?.eventGroupId as string);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return { notFound: true };
  }

  let material = await getMaterial();

  remove_markdown(material, undefined)

  return { 
    props: makeSerializable({ event, material, eventGroupId }),
  }
}

export default EventGroupPage; 
