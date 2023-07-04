import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import prisma from 'lib/prisma'
import { getMaterial, Theme, Material, remove_markdown, eventItemSplit } from 'lib/material'
import Layout from 'components/Layout'
import {makeSerializable} from 'lib/utils'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import Title from 'components/ui/Title'
import { Event, EventFull } from 'lib/types'
import { basePath } from 'lib/basePath'
import Link from 'next/link'
import useEventGroup from 'lib/hooks/useEventGroup'
import useProfile from 'lib/hooks/useProfile'
import { Button, Tabs } from 'flowbite-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { EventGroup } from 'pages/api/eventGroup/[eventGroupId]'
import { useEffect } from 'react'
import { putEventGroup } from 'lib/actions/putEventGroup'
import Stack from 'components/ui/Stack'
import Textfield from 'components/forms/Textfield'
import Textarea from 'components/forms/Textarea'
import { MdEdit, MdPreview } from 'react-icons/md'
import DateTimeField from 'components/forms/DateTimeField'
import SelectField from 'components/forms/SelectField'
import IntegerField from 'components/forms/IntegerField'
import SubTitle from 'components/ui/SubTitle'

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

  const { fields: eventItems, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: "EventItem",
  });

  const eventMapToIndex = eventItems.reduce((acc, item, index) => {
    acc[item.order] = index;
    return acc;
  }, {} as {[key: number]: number});

  eventItems.sort((a, b) => (a.order - b.order));

  const handleAddItem = () => {
    appendItem({
      id: 0,
      groupId: eventGroupId,
      order: eventItems.length,
      section: '',
    })
  }

  const handleRemoveItem = (index: number) => () => {
    removeItem(index);
  }

  const onSubmit = (data: EventGroup) => {
    putEventGroup(data).then((data) => data.eventGroup && mutateEventGroup(data.eventGroup));
  }

  const sectionsOptions = material.themes.flatMap((theme) => {
    return [{
      value: `${theme.id}`,
      label: `${theme.name}`,
    }].concat(
      theme.courses.flatMap((course) => {
      return [{
        value: `${theme.id}.${course.id}`,
        label: `${theme.name} - ${course.name}`,
      }].concat(
        course.sections.map((section) => {
        return {
          value: `${theme.id}.${course.id}.${section.id}`,
          label: `${theme.name} - ${course.name} - ${section.name}`,
        }
      }))
    }))
  })

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
      <a href={`/event/${event.id}`} >
      <Title text={event.name} />
      </a>
      <SubTitle text={eventGroup.name} />
      <SubTitle text={`Time: ${new Date(eventGroup.start).toUTCString()} - ${new Date(eventGroup.end).toUTCString()}`} />
      <SubTitle text={`Location: ${eventGroup.location}`} />
      <Content markdown={eventGroup.content} />
      <SubTitle text="Material" />
      <ul className="text-center">
      { eventGroup.EventItem.map((item, index) => {
        const { theme, course, section, url } = eventItemSplit(item, material)
        let label = theme?.name;
        if (course) {
          label = `${label} - ${course.name}`;
        }
        if (section) {
          label = `${label} - ${section.name}`;
        } 
        return (
          <a href={url} key={index}><p>{label}</p></a>
        )
      })}
      </ul>
    </>
  )

  const eventGroupEditView = (
    <form onSubmit={handleSubmit(onSubmit)}>
    <Stack>
      <Textfield label="Title" name="name" control={control} />
      <Textfield label="Location" name="location" control={control} />
      <Textfield label="Summary" name="summary" control={control} />
      <Textarea label="Content" name="content" control={control} />
      <DateTimeField label="Start" name="start" control={control} />
      <DateTimeField label="End" name="end" control={control} />
      <Title text="Items" />
      { eventItems.map((item, order) => {
        const index = eventMapToIndex[order];
        return (
          <Stack key={item.id} direction='row' className='items-end'>
            <SelectField label="Section" name={`EventItem.${index}.section`} control={control} options={sectionsOptions} />
            <IntegerField label="Order" name={`EventItem.${index}.order`} control={control} />
            <Button onClick={handleRemoveItem(index)}>Remove</Button>
          </Stack>
        )
      })}
      <Button onClick={handleAddItem}>Add Item</Button>
      <Button type="submit">Save</Button>
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
