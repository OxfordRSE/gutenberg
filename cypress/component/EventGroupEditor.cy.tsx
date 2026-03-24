import React from "react"
import EventGroupEditor, { EventForm } from "components/event/EventGroupEditor"
import type { Option } from "components/forms/SelectSectionField"
import { useForm, useWatch } from "react-hook-form"

const sectionsOptions: Option[] = [
  {
    value: "HPCu.software_architecture_and_design.procedural.types_cpp",
    label: "HPCu - Software Architecture and Design - Procedural Programming - Types in C++ [C++]",
  },
  {
    value: "HPCu.software_architecture_and_design.procedural.functions_cpp",
    label: "HPCu - Software Architecture and Design - Procedural Programming - Functions in C++ [C++]",
  },
  {
    value: "HPCu.software_architecture_and_design.procedural.containers_cpp",
    label: "HPCu - Software Architecture and Design - Procedural Programming - Containers and Arrays in C++ [C++]",
  },
]

const defaultValues: EventForm = {
  id: 1,
  name: "Test Event",
  summary: "",
  enrol: "",
  content: "",
  enrolKey: "",
  instructorKey: "",
  start: new Date("2026-04-01T09:00:00.000Z"),
  end: new Date("2026-04-01T17:00:00.000Z"),
  hidden: false,
  EventGroup: [
    {
      id: 10,
      eventId: 1,
      name: "Group One",
      summary: "",
      content: "",
      location: "Room 1",
      start: new Date("2026-04-01T09:00:00.000Z"),
      end: new Date("2026-04-01T10:00:00.000Z"),
      EventItem: [
        {
          id: 100,
          groupId: 10,
          order: 1,
          section: "HPCu.software_architecture_and_design.procedural.types_cpp",
        },
        {
          id: 101,
          groupId: 10,
          order: 2,
          section: "HPCu.software_architecture_and_design.procedural.functions_cpp",
        },
      ],
    },
  ],
  UserOnEvent: [],
}

const Harness = () => {
  const { control, register } = useForm<EventForm>({ defaultValues })
  const items =
    useWatch({
      control,
      name: "EventGroup.0.EventItem",
    }) ?? []

  return (
    <div>
      <EventGroupEditor
        control={control}
        register={register}
        groupIndex={0}
        sectionsOptions={sectionsOptions}
        onRemoveGroup={() => undefined}
      />
      <div data-cy="event-group-order-state">{items.map((item) => `${item.order}:${item.section}`).join("|")}</div>
    </div>
  )
}

describe("<EventGroupEditor />", () => {
  it("adds and removes material sections", () => {
    cy.mount(<Harness />)

    cy.get('[data-cy="event-group-order-state"]').should(
      "contain.text",
      "1:HPCu.software_architecture_and_design.procedural.types_cpp|2:HPCu.software_architecture_and_design.procedural.functions_cpp"
    )

    cy.contains("button", "Remove").first().click()
    cy.get('[data-cy="event-group-order-state"]').should(
      "contain.text",
      "2:HPCu.software_architecture_and_design.procedural.functions_cpp"
    )

    cy.get('input[placeholder="Choose Sections"]').type("Containers")
    cy.contains("li", "Containers and Arrays in C++").click()
    cy.contains("button", "Add Sections").click()

    cy.get('[data-cy="event-group-order-state"]').should(
      "contain.text",
      "2:HPCu.software_architecture_and_design.procedural.functions_cpp|2:HPCu.software_architecture_and_design.procedural.containers_cpp"
    )
    cy.contains("Containers and Arrays in C++").should("be.visible")
  })

  it("reorders material sections with keyboard interaction", () => {
    cy.mount(<Harness />)

    cy.get('[data-cy="event-group-item"]').eq(0).focus().realPress("Space")
    cy.realPress("ArrowDown")
    cy.realPress("Space")

    cy.get('[data-cy="event-group-order-state"]').should(
      "contain.text",
      "1:HPCu.software_architecture_and_design.procedural.functions_cpp|2:HPCu.software_architecture_and_design.procedural.types_cpp"
    )
  })
})
