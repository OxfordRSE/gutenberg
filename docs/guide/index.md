---
title: User Guide
permalink: /guide/
---

This is the `Gutenberg` tutorial.

<!-- prettier-ignore -->
- TOC
{:toc}

## Creating/Deleting Events

When logged in as an admin, create an event by pressing the "Create New Event" button on the home page. The event will start off with no metadata and will be invisible to non-admin users, edit the event to start adding these details.

To delete an `Event`, click the red Garbage bin icon on the event card on the homepage, then select Delete Event from the confirmation modal. Warning: This action cannot be undone.

## Events

Click the event on the homepage or navigate to /events/{eventId} to view the event page. Events in `Gutenberg` are courses, workshops, conferences, etc. that are made up of multiple components, such as lectures, tutorials, etc. these individual components are referred to as EventGroups.

The Event page allows users to see the Event descriptions as well as seeing the Event components and their times/places. If logged in as Admin or Instructor, the edit tab will allow you to edit the overall event data and start adding EventGroups.

Once you have made changes to the form, click save to populate your changes to the database.

### Adding EventGroups

Click the Add group to add an EventGroup to the Event. This will add a new EventGroup to the collection of EventGroups for the Event. You can then edit the EventGroup information: The Name, Summary, Location and the Start/End times, click save to commit your changes.

## EventGroups

EventGroups are the individual components of an Event, such as lectures, tutorials, etc.
An event can be made up of any number of EventGroups.

They might, for example, say there is a lecture in room 101 at 10am on Monday, and a tutorial in room 102 at 2pm on Monday.

You can optionally assign material, from the material repo, to an EventGrouo. Click The "Go" button below the EventGroup card to navigate to the EventGroup page and click the edit tab to begin editing.

### Adding EventItems

An EventGroup might just consist of a time and place for a lecture or it might have associated material from the course material repository, e.g. in the case of labs, or indeed simply for students toyou may wish to assign sections for the students to work through. This material can be assigned to the EventGroup as an EventItem.

To add an EventItem, click the "Add Item" button on the EventGroup page. This will add a new EventItem to the EventGroup. You can then select, via a dropdown list, which EventItem you wish to assign to the EventGroup and the order in which you want them to appear. You can add as many EventItems as you want click save to commit your changes.

## Problems

If an EventItem which has material containing Problems for the students to solve has been assigned to an EventGroup, it will automatically populate those Problems onto the EventItem and Group respectively. This gives both Students and Instructors the ability to see the progress through the Problems.

## Managing Users on Events

### Enrolment

#### Enrolment Key

In the edit Event page, you can set an "Enrol Key", when students click "Enrol" on an Event on the homepage this opens an enrolment dialogue to enter this key: A Key that matches the Event will automatically enrol the student on the Event, with no further intervention from the admin necessary.

There is also a "Instructor Key", which can be entered into the enrolment dialogue, allowing instructors to be enrolled onto the Event, rather than having their roles manually assigned.

Both Keys are set to a random string by default, but can be changed to anything you like.

#### Manual Enrolment

If you do not wish to give out a key, or if a Student is having an issue enrolling, they can click the "Request Enrolment" button on the enrolment dialogue, this will enrol the User on the Event but with their status set to "REQUEST". By navigating to the event page, any admin can change the status of a User on an Event to "STUDENT" (Or "Instructor") to allow them to access the Event.

### Student Progress

Student progress is monitored through the completion of problems embedded in the markdown material, if a course section is assigned to an EventGroup as an EventItem then students progress will be tracked.

With the sidebar open, any student will see their own progress in each EventItem as {completed}/{total problems}. Instructors will instead see the sum of all students progress {total completed}/{total problems \* number of users that have completed at least 1 problem}.

On the Event page, there is a Progress Table where all the problems, sorted by EventItem, and the status of each students problem completion is displayed. Mouseover each complete problem to see that students difficulty rating and their comments.
