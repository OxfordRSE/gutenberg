import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@localhost" },
    update: {},
    create: {
      name: "admin",
      email: "admin@localhost",
      admin: true,
    },
  })
  await prisma.user.upsert({
    where: { email: "alasdair.wlsn@googlemail.com" },
    update: { admin: true },
    create: {
      name: "Alasdair Wilson",
      email: "alasdair.wlsn@googlemail.com",
      admin: true,
    },
  })
  const userStudentOnCourse = await prisma.user.upsert({
    where: { email: "onCourse@localhost" },
    update: {},
    create: {
      name: "onCourse",
      email: "onCourse@localhost",
      admin: false,
    },
  })
  const userInstructorOnCourse = await prisma.user.upsert({
    where: { email: "instructorOnCourse@localhost" },
    update: {},
    create: {
      name: "instructorOnCourse",
      email: "instructorOnCourse@localhost",
      admin: false,
    },
  })
  const userNotOnCourse = await prisma.user.upsert({
    where: { email: "notOnCourse@localhost" },
    update: {},
    create: {
      name: "notOnCourse",
      email: "notOnCourse@localhost",
      admin: false,
    },
  })

  const event = await prisma.event.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Introduction to C++",
      summary: "Introduction to the C++ programming language",
      start: new Date(2023, 7, 1, 9, 30),
      end: new Date(2023, 7, 2, 14, 0),
      enrolKey: "testEnrol",
      instructorKey: "testInstructor",
      hidden: false,
      EventGroup: {
        connectOrCreate: [
          {
            where: { id: 1 },
            create: {
              name: "Introduction to Course",
              summary: "Introduction to the course and the instructor",
              start: new Date(2023, 7, 1, 9, 30),
              end: new Date(2023, 7, 1, 10, 30),
              location: "Seminar Room 1",
            },
          },
          {
            where: { id: 2 },
            create: {
              name: "Procedural Programming - 1",
              summary: "Procedural programming in C++",
              start: new Date(2023, 7, 1, 10, 30),
              end: new Date(2023, 7, 1, 12, 30),
              location: "Student Lab 1",
              EventItem: {
                connectOrCreate: [
                  {
                    where: { id: 1 },
                    create: {
                      order: 1,
                      section: "technology_and_tooling.bash_shell.bash",
                    },
                  },
                  {
                    where: { id: 2 },
                    create: {
                      order: 2,
                      section: "technology_and_tooling.ide.cpp",
                    },
                  },
                  {
                    where: { id: 3 },
                    create: {
                      order: 3,
                      section: "software_architecture_and_design.procedural.types_cpp",
                    },
                  },
                  {
                    where: { id: 4 },
                    create: {
                      order: 4,
                      section: "software_architecture_and_design.procedural.functions_cpp",
                    },
                  },
                ],
              },
            },
          },
          {
            where: { id: 3 },
            create: {
              name: "Q&A",
              summary: "Q&A session",
              start: new Date(2023, 7, 1, 13, 30),
              end: new Date(2023, 7, 1, 14, 0),
              location: "Seminar Room 1",
            },
          },
          {
            where: { id: 4 },
            create: {
              name: "Procedural Programming - 2",
              summary: "Procedural programming in C++",
              start: new Date(2023, 7, 1, 14, 0),
              end: new Date(2023, 7, 1, 17, 30),
              location: "Student Lab 1",
              EventItem: {
                connectOrCreate: [
                  {
                    where: { id: 5 },
                    create: {
                      order: 1,
                      section: "software_architecture_and_design.procedural.containers_cpp",
                    },
                  },
                ],
              },
            },
          },
          {
            where: { id: 5 },
            create: {
              name: "Functional Programming Lecture",
              summary: "Introduction to functional programming",
              start: new Date(2023, 7, 2, 9, 30),
              end: new Date(2023, 7, 2, 10, 30),
              location: "Seminar Room 1",
            },
          },
          {
            where: { id: 6 },
            create: {
              name: "Functional Programming - 1",
              summary: "Functional programming in C++",
              start: new Date(2023, 7, 2, 10, 30),
              end: new Date(2023, 7, 2, 12, 30),
              location: "Student Lab 1",
              EventItem: {
                connectOrCreate: [
                  {
                    where: { id: 6 },
                    create: {
                      order: 1,
                      section: "software_architecture_and_design.functional.state_and_side_effects_cpp",
                    },
                  },
                  {
                    where: { id: 7 },
                    create: {
                      order: 2,
                      section: "software_architecture_and_design.functional.recursion_cpp",
                    },
                  },
                  {
                    where: { id: 8 },
                    create: {
                      order: 3,
                      section: "software_architecture_and_design.functional.higher_order_functions_cpp",
                    },
                  },
                ],
              },
            },
          },
          {
            where: { id: 7 },
            create: {
              name: "Q&A",
              summary: "Q&A session",
              start: new Date(2023, 7, 2, 13, 30),
              end: new Date(2023, 7, 2, 14, 0),
              location: "Seminar Room 1",
            },
          },
        ],
      },
    },
  })

  const event2 = await prisma.event.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "older Introduction to C++ [older]",
      summary: "older Introduction to the C++ programming language",
      start: new Date(2020, 7, 1, 9, 30),
      end: new Date(2020, 7, 2, 14, 0),
      enrolKey: "testEnrol",
      instructorKey: "testInstructor",
      hidden: false,
      EventGroup: {
        connectOrCreate: [
          {
            where: { id: 11 },
            create: {
              name: "Introduction to Course",
              summary: "Introduction to the course and the instructor",
              start: new Date(2020, 7, 1, 9, 30),
              end: new Date(2020, 7, 1, 10, 30),
              location: "Seminar Room 1",
            },
          },
          {
            where: { id: 12 },
            create: {
              name: "Procedural Programming - 1",
              summary: "Procedural programming in C++",
              start: new Date(2023, 7, 1, 10, 30),
              end: new Date(2023, 7, 1, 12, 30),
              location: "Student Lab 1",
              EventItem: {
                connectOrCreate: [
                  {
                    where: { id: 51 },
                    create: {
                      order: 1,
                      section: "technology_and_tooling.bash_shell.bash",
                    },
                  },
                  {
                    where: { id: 52 },
                    create: {
                      order: 2,
                      section: "technology_and_tooling.ide.cpp",
                    },
                  },
                  {
                    where: { id: 53 },
                    create: {
                      order: 3,
                      section: "software_architecture_and_design.procedural.types_cpp",
                    },
                  },
                  {
                    where: { id: 54 },
                    create: {
                      order: 4,
                      section: "software_architecture_and_design.procedural.functions_cpp",
                    },
                  },
                ],
              },
            },
          },
          {
            where: { id: 13 },
            create: {
              name: "Q&A",
              summary: "Q&A session",
              start: new Date(2023, 7, 1, 13, 30),
              end: new Date(2023, 7, 1, 14, 0),
              location: "Seminar Room 1",
            },
          },
          {
            where: { id: 14 },
            create: {
              name: "Procedural Programming - 2",
              summary: "Procedural programming in C++",
              start: new Date(2023, 7, 1, 14, 0),
              end: new Date(2023, 7, 1, 17, 30),
              location: "Student Lab 1",
              EventItem: {
                connectOrCreate: [
                  {
                    where: { id: 55 },
                    create: {
                      order: 1,
                      section: "software_architecture_and_design.procedural.containers_cpp",
                    },
                  },
                ],
              },
            },
          },
          {
            where: { id: 15 },
            create: {
              name: "Functional Programming Lecture",
              summary: "Introduction to functional programming",
              start: new Date(2023, 7, 2, 9, 30),
              end: new Date(2023, 7, 2, 10, 30),
              location: "Seminar Room 1",
            },
          },
          {
            where: { id: 16 },
            create: {
              name: "Functional Programming - 1",
              summary: "Functional programming in C++",
              start: new Date(2023, 7, 2, 10, 30),
              end: new Date(2023, 7, 2, 12, 30),
              location: "Student Lab 1",
              EventItem: {
                connectOrCreate: [
                  {
                    where: { id: 56 },
                    create: {
                      order: 1,
                      section: "software_architecture_and_design.functional.state_and_side_effects_cpp",
                    },
                  },
                  {
                    where: { id: 57 },
                    create: {
                      order: 2,
                      section: "software_architecture_and_design.functional.recursion_cpp",
                    },
                  },
                  {
                    where: { id: 58 },
                    create: {
                      order: 3,
                      section: "software_architecture_and_design.functional.higher_order_functions_cpp",
                    },
                  },
                ],
              },
            },
          },
          {
            where: { id: 17 },
            create: {
              name: "Q&A",
              summary: "Q&A session",
              start: new Date(2023, 7, 2, 13, 30),
              end: new Date(2023, 7, 2, 14, 0),
              location: "Seminar Room 1",
            },
          },
        ],
      },
    },
  })

  await prisma.userOnEvent.upsert({
    where: { userEmail_eventId: { userEmail: userStudentOnCourse.email || "", eventId: event.id } },
    update: {},
    create: {
      userEmail: userStudentOnCourse.email || "",
      eventId: event.id,
      status: "STUDENT",
    },
  })

  await prisma.userOnEvent.upsert({
    where: { userEmail_eventId: { userEmail: userInstructorOnCourse.email || "", eventId: event.id } },
    update: {},
    create: {
      userEmail: userInstructorOnCourse.email || "",
      eventId: event.id,
      status: "INSTRUCTOR",
    },
  })

  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      externalId: "course_intro_cpp",
      name: "Intro to C++ (Self-paced)",
      summary: "Self-paced version of the C++ introduction",
      level: "beginner",
      hidden: false,
      prerequisites: [],
      tags: ["cpp", "basics"],
      outcomes: ["Basic syntax", "Functions", "Containers"],
      CourseGroup: {
        connectOrCreate: [
          {
            where: { id: 1 },
            create: {
              name: "Foundations",
              summary: "Core language fundamentals",
              order: 1,
              CourseItem: {
                connectOrCreate: [
                  {
                    where: { id: 1 },
                    create: {
                      order: 1,
                      section: "technology_and_tooling.bash_shell.bash",
                      course: { connect: { id: 1 } },
                    },
                  },
                  {
                    where: { id: 2 },
                    create: { order: 2, section: "technology_and_tooling.ide.cpp", course: { connect: { id: 1 } } },
                  },
                ],
              },
            },
          },
          {
            where: { id: 2 },
            create: {
              name: "Procedural C++",
              summary: "Procedural programming concepts",
              order: 2,
              CourseItem: {
                connectOrCreate: [
                  {
                    where: { id: 3 },
                    create: {
                      order: 1,
                      section: "software_architecture_and_design.procedural.types_cpp",
                      course: { connect: { id: 1 } },
                    },
                  },
                  {
                    where: { id: 4 },
                    create: {
                      order: 2,
                      section: "software_architecture_and_design.procedural.functions_cpp",
                      course: { connect: { id: 1 } },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      CourseItem: {
        connectOrCreate: [
          {
            where: { id: 5 },
            create: { order: 1, section: "software_architecture_and_design.procedural.containers_cpp" },
          },
        ],
      },
    },
  })

  const course2 = await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      externalId: "course_functional_cpp_bitesize",
      name: "Functional C++ (Bitesize)",
      summary: "Short path into functional programming",
      level: "intermediate",
      hidden: false,
      prerequisites: ["Intro to C++ (Self-paced)"],
      tags: ["cpp", "functional"],
      outcomes: ["Understanding recursion", "Higher-order functions"],
      CourseItem: {
        connectOrCreate: [
          {
            where: { id: 6 },
            create: { order: 1, section: "software_architecture_and_design.functional.recursion_cpp" },
          },
          {
            where: { id: 7 },
            create: { order: 2, section: "software_architecture_and_design.functional.higher_order_functions_cpp" },
          },
        ],
      },
    },
  })

  await prisma.userOnCourse.upsert({
    where: { userEmail_courseId: { userEmail: userStudentOnCourse.email || "", courseId: course.id } },
    update: {},
    create: {
      userEmail: userStudentOnCourse.email || "",
      courseId: course.id,
      status: "ENROLLED",
    },
  })

  await prisma.userOnCourse.upsert({
    where: { userEmail_courseId: { userEmail: userInstructorOnCourse.email || "", courseId: course.id } },
    update: {},
    create: {
      userEmail: userInstructorOnCourse.email || "",
      courseId: course.id,
      status: "ENROLLED",
    },
  })

  await prisma.userOnCourse.upsert({
    where: { userEmail_courseId: { userEmail: userStudentOnCourse.email || "", courseId: course2.id } },
    update: {},
    create: {
      userEmail: userStudentOnCourse.email || "",
      courseId: course2.id,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
