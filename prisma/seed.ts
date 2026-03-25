import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

type SeedCourseGroup = {
  name: string
  summary: string
  order: number
  items: { order: number; section: string }[]
}

async function upsertProblem(data: {
  userEmail: string
  section: string
  tag: string
  complete: boolean
  difficulty?: number
  notes?: string
}) {
  await prisma.problem.upsert({
    where: {
      userEmail_tag_section: {
        userEmail: data.userEmail,
        tag: data.tag,
        section: data.section,
      },
    },
    update: {
      complete: data.complete,
      difficulty: data.difficulty ?? 5,
      notes: data.notes ?? "",
    },
    create: {
      userEmail: data.userEmail,
      section: data.section,
      tag: data.tag,
      complete: data.complete,
      difficulty: data.difficulty ?? 5,
      notes: data.notes ?? "",
    },
  })
}

async function upsertCourseWithGroups(
  id: number,
  data: {
    externalId: string
    name: string
    summary: string
    level: string
    hidden: boolean
    language: string[]
    prerequisites: string[]
    tags: string[]
    outcomes: string[]
    groups: SeedCourseGroup[]
  }
) {
  const course = await prisma.course.upsert({
    where: { id },
    update: {
      externalId: data.externalId,
      name: data.name,
      summary: data.summary,
      level: data.level,
      hidden: data.hidden,
      language: data.language,
      prerequisites: data.prerequisites,
      tags: data.tags,
      outcomes: data.outcomes,
    },
    create: {
      id,
      externalId: data.externalId,
      name: data.name,
      summary: data.summary,
      level: data.level,
      hidden: data.hidden,
      language: data.language,
      prerequisites: data.prerequisites,
      tags: data.tags,
      outcomes: data.outcomes,
    },
  })

  await prisma.courseItem.deleteMany({ where: { courseId: course.id } })
  await prisma.courseGroup.deleteMany({ where: { courseId: course.id } })

  for (const group of data.groups) {
    const createdGroup = await prisma.courseGroup.create({
      data: {
        courseId: course.id,
        name: group.name,
        summary: group.summary,
        order: group.order,
      },
    })

    if (group.items.length > 0) {
      await prisma.courseItem.createMany({
        data: group.items.map((item) => ({
          courseId: course.id,
          groupId: createdGroup.id,
          order: item.order,
          section: item.section,
        })),
      })
    }
  }

  return course
}

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
                      section: "HPCu.technology_and_tooling.bash_shell.01-intro",
                    },
                  },
                  {
                    where: { id: 2 },
                    create: {
                      order: 2,
                      section: "HPCu.technology_and_tooling.ide.cpp",
                    },
                  },
                  {
                    where: { id: 3 },
                    create: {
                      order: 3,
                      section: "HPCu.software_architecture_and_design.procedural.variables_cpp",
                    },
                  },
                  {
                    where: { id: 4 },
                    create: {
                      order: 4,
                      section: "HPCu.software_architecture_and_design.procedural.functions_cpp",
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
                      section: "HPCu.software_architecture_and_design.procedural.containers_cpp",
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
                      section: "HPCu.software_architecture_and_design.functional.side_effects_cpp",
                    },
                  },
                  {
                    where: { id: 7 },
                    create: {
                      order: 2,
                      section: "HPCu.software_architecture_and_design.functional.recursion_cpp",
                    },
                  },
                  {
                    where: { id: 8 },
                    create: {
                      order: 3,
                      section: "HPCu.software_architecture_and_design.functional.higher_order_functions_cpp",
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
                      section: "HPCu.technology_and_tooling.bash_shell.01-intro",
                    },
                  },
                  {
                    where: { id: 52 },
                    create: {
                      order: 2,
                      section: "HPCu.technology_and_tooling.ide.cpp",
                    },
                  },
                  {
                    where: { id: 53 },
                    create: {
                      order: 3,
                      section: "HPCu.software_architecture_and_design.procedural.variables_cpp",
                    },
                  },
                  {
                    where: { id: 54 },
                    create: {
                      order: 4,
                      section: "HPCu.software_architecture_and_design.procedural.functions_cpp",
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
                      section: "HPCu.software_architecture_and_design.procedural.containers_cpp",
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
                      section: "HPCu.software_architecture_and_design.functional.side_effects_cpp",
                    },
                  },
                  {
                    where: { id: 57 },
                    create: {
                      order: 2,
                      section: "HPCu.software_architecture_and_design.functional.recursion_cpp",
                    },
                  },
                  {
                    where: { id: 58 },
                    create: {
                      order: 3,
                      section: "HPCu.software_architecture_and_design.functional.higher_order_functions_cpp",
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

  const course = await upsertCourseWithGroups(1, {
    externalId: "course_software_architecture_cpp",
    name: "Software Architecture in C++",
    summary: "Procedural, functional, and object orientated programming in C++.",
    level: "intermediate",
    hidden: false,
    language: ["cpp"],
    prerequisites: ["Intro to C++"],
    tags: ["programming", "software-design"],
    outcomes: [
      "Write clearer procedural C++ code",
      "Apply functional techniques in C++",
      "Design object orientated C++ programs",
    ],
    groups: [
      {
        name: "Procedural Programming",
        summary: "Variables, functions, and containers in C++.",
        order: 1,
        items: [
          { order: 1, section: "HPCu.software_architecture_and_design.procedural.variables_cpp" },
          { order: 2, section: "HPCu.software_architecture_and_design.procedural.functions_cpp" },
          { order: 3, section: "HPCu.software_architecture_and_design.procedural.containers_cpp" },
        ],
      },
      {
        name: "Functional Programming",
        summary: "Recursion, higher-order functions, and side effects in C++.",
        order: 2,
        items: [
          { order: 1, section: "HPCu.software_architecture_and_design.functional.side_effects_cpp" },
          { order: 2, section: "HPCu.software_architecture_and_design.functional.recursion_cpp" },
          { order: 3, section: "HPCu.software_architecture_and_design.functional.higher_order_functions_cpp" },
        ],
      },
      {
        name: "Object Orientated Programming",
        summary: "Classes, inheritance, and polymorphism in C++.",
        order: 3,
        items: [
          { order: 1, section: "HPCu.software_architecture_and_design.object_orientated.classes_cpp" },
          {
            order: 2,
            section: "HPCu.software_architecture_and_design.object_orientated.inheritance_and_composition_cpp",
          },
          { order: 3, section: "HPCu.software_architecture_and_design.object_orientated.polymorphism_cpp" },
        ],
      },
    ],
  })

  const course2 = await upsertCourseWithGroups(2, {
    externalId: "course_software_architecture_python",
    name: "Software Architecture in Python",
    summary: "Procedural, functional, and object orientated programming in Python.",
    level: "intermediate",
    hidden: false,
    language: ["python"],
    prerequisites: ["Intro to Python"],
    tags: ["programming", "software-design"],
    outcomes: [
      "Write clearer procedural Python code",
      "Apply functional techniques in Python",
      "Design object orientated Python programs",
    ],
    groups: [
      {
        name: "Procedural Programming",
        summary: "Variables, data structures, and functions in Python.",
        order: 1,
        items: [
          { order: 1, section: "HPCu.software_architecture_and_design.procedural.variables_python" },
          { order: 2, section: "HPCu.software_architecture_and_design.procedural.arrays_python" },
          { order: 3, section: "HPCu.software_architecture_and_design.procedural.containers_python" },
          { order: 4, section: "HPCu.software_architecture_and_design.procedural.functions_python" },
        ],
      },
      {
        name: "Functional Programming",
        summary: "Recursion, higher-order functions, and side effects in Python.",
        order: 2,
        items: [
          { order: 1, section: "HPCu.software_architecture_and_design.functional.side_effects_python" },
          { order: 2, section: "HPCu.software_architecture_and_design.functional.recursion_python" },
          { order: 3, section: "HPCu.software_architecture_and_design.functional.higher_order_functions_python" },
        ],
      },
      {
        name: "Object Orientated Programming",
        summary: "Classes, inheritance, and polymorphism in Python.",
        order: 3,
        items: [
          { order: 1, section: "HPCu.software_architecture_and_design.object_orientated.classes" },
          {
            order: 2,
            section: "HPCu.software_architecture_and_design.object_orientated.inheritance_and_composition",
          },
          { order: 3, section: "HPCu.software_architecture_and_design.object_orientated.polymorphism" },
        ],
      },
    ],
  })

  await prisma.userOnCourse.upsert({
    where: { userEmail_courseId: { userEmail: userStudentOnCourse.email || "", courseId: course.id } },
    update: {
      status: "ENROLLED",
      startedAt: new Date("2026-03-01T09:00:00Z"),
      completedAt: null,
    },
    create: {
      userEmail: userStudentOnCourse.email || "",
      courseId: course.id,
      status: "ENROLLED",
      startedAt: new Date("2026-03-01T09:00:00Z"),
    },
  })

  await prisma.userOnCourse.upsert({
    where: { userEmail_courseId: { userEmail: userInstructorOnCourse.email || "", courseId: course.id } },
    update: {
      status: "COMPLETED",
      startedAt: new Date("2026-02-01T09:00:00Z"),
      completedAt: new Date("2026-02-10T09:00:00Z"),
    },
    create: {
      userEmail: userInstructorOnCourse.email || "",
      courseId: course.id,
      status: "COMPLETED",
      startedAt: new Date("2026-02-01T09:00:00Z"),
      completedAt: new Date("2026-02-10T09:00:00Z"),
    },
  })

  await prisma.userOnCourse.upsert({
    where: { userEmail_courseId: { userEmail: userStudentOnCourse.email || "", courseId: course2.id } },
    update: {
      status: "COMPLETED",
      startedAt: new Date("2026-01-10T09:00:00Z"),
      completedAt: new Date("2026-01-17T09:00:00Z"),
    },
    create: {
      userEmail: userStudentOnCourse.email || "",
      courseId: course2.id,
      status: "COMPLETED",
      startedAt: new Date("2026-01-10T09:00:00Z"),
      completedAt: new Date("2026-01-17T09:00:00Z"),
    },
  })

  await prisma.userOnCourse.upsert({
    where: { userEmail_courseId: { userEmail: userNotOnCourse.email || "", courseId: course.id } },
    update: {
      status: "DROPPED",
      startedAt: new Date("2026-03-05T09:00:00Z"),
      completedAt: null,
    },
    create: {
      userEmail: userNotOnCourse.email || "",
      courseId: course.id,
      status: "DROPPED",
      startedAt: new Date("2026-03-05T09:00:00Z"),
    },
  })

  for (const tag of ["scope", "pointers", "cpp_calculate_pi"]) {
    await upsertProblem({
      userEmail: userStudentOnCourse.email || "",
      section: "HPCu.software_architecture_and_design.procedural.variables_cpp",
      tag,
      complete: true,
      difficulty: 4,
    })
  }

  for (const [section, tags] of [
    ["HPCu.software_architecture_and_design.procedural.variables_cpp", ["scope", "pointers", "cpp_calculate_pi"]],
    ["HPCu.software_architecture_and_design.procedural.functions_cpp", ["swap_cpp", "dot_product", "dot_product_cont"]],
    [
      "HPCu.software_architecture_and_design.procedural.containers_cpp",
      ["dot_product", "matrix_multiply", "data_analysis_containers"],
    ],
  ] as const) {
    for (const tag of tags) {
      await upsertProblem({
        userEmail: userInstructorOnCourse.email || "",
        section,
        tag,
        complete: true,
        difficulty: 3,
      })
    }
  }

  await upsertCourseWithGroups(3, {
    externalId: "course_intro_cpp",
    name: "Intro to C++",
    summary: "Shell basics, IDE setup, and core C++ concepts.",
    level: "beginner",
    hidden: false,
    language: ["cpp"],
    prerequisites: [],
    tags: ["programming", "tooling"],
    outcomes: [
      "Work confidently at the command line",
      "Use an IDE for C++ development",
      "Understand core C++ variables, functions, and containers",
    ],
    groups: [
      {
        name: "Shell Basics",
        summary: "Command-line basics used in later material.",
        order: 1,
        items: [
          { order: 1, section: "HPCu.technology_and_tooling.bash_shell.01-intro" },
          { order: 2, section: "HPCu.technology_and_tooling.bash_shell.02-filedir" },
          { order: 3, section: "HPCu.technology_and_tooling.bash_shell.03-create" },
        ],
      },
      {
        name: "Development Environment",
        summary: "Editor setup for C++ work.",
        order: 2,
        items: [{ order: 1, section: "HPCu.technology_and_tooling.ide.cpp" }],
      },
      {
        name: "C++ Foundations",
        summary: "Core procedural programming in C++.",
        order: 3,
        items: [
          { order: 1, section: "HPCu.software_architecture_and_design.procedural.variables_cpp" },
          { order: 2, section: "HPCu.software_architecture_and_design.procedural.functions_cpp" },
          { order: 3, section: "HPCu.software_architecture_and_design.procedural.containers_cpp" },
        ],
      },
    ],
  })

  await upsertCourseWithGroups(4, {
    externalId: "course_intro_python",
    name: "Intro to Python",
    summary: "Python fundamentals for scripting and data work.",
    level: "beginner",
    hidden: false,
    language: ["python"],
    prerequisites: [],
    tags: ["programming"],
    outcomes: [
      "Run Python code confidently",
      "Use core data types and control flow",
      "Write functions and work with data",
    ],
    groups: [
      {
        name: "Getting Started",
        summary: "Setup and core Python basics.",
        order: 1,
        items: [
          { order: 1, section: "HPCu.introductory_courses.python.01_running_python" },
          { order: 2, section: "HPCu.introductory_courses.python.02_variables_and_types" },
          { order: 3, section: "HPCu.introductory_courses.python.03_writing_and_running_ide" },
          { order: 4, section: "HPCu.introductory_courses.python.04_built_in_functions_and_help" },
          { order: 5, section: "HPCu.introductory_courses.python.05_libraries" },
        ],
      },
      {
        name: "Data and Control Flow",
        summary: "Data, lists, loops, and conditionals.",
        order: 2,
        items: [
          { order: 1, section: "HPCu.introductory_courses.python.06_analyzing_and_visualizing_data" },
          { order: 2, section: "HPCu.introductory_courses.python.07_pandas_dataframes" },
          { order: 3, section: "HPCu.introductory_courses.python.08_lists" },
          { order: 4, section: "HPCu.introductory_courses.python.09_for_loops" },
          { order: 5, section: "HPCu.introductory_courses.python.10_conditionals" },
          { order: 6, section: "HPCu.introductory_courses.python.11_looping_over_data_sets" },
          { order: 7, section: "HPCu.introductory_courses.python.12_errors_and_exceptions" },
        ],
      },
      {
        name: "Functions and Scope",
        summary: "Functions, scope, and a small project.",
        order: 3,
        items: [
          { order: 1, section: "HPCu.introductory_courses.python.13_writing_functions" },
          { order: 2, section: "HPCu.introductory_courses.python.14_variable_scope" },
          { order: 3, section: "HPCu.introductory_courses.python.15_snake_game" },
        ],
      },
    ],
  })

  await upsertCourseWithGroups(5, {
    externalId: "course_hpc_introduction",
    name: "HPC Introduction",
    summary: "Getting started with HPC systems.",
    level: "beginner",
    hidden: false,
    language: [],
    prerequisites: [],
    tags: ["hpc", "cluster-computing", "tooling"],
    outcomes: [
      "Connect to an HPC system",
      "Understand schedulers, modules, and resources",
      "Use shared systems responsibly",
    ],
    groups: [
      {
        name: "Connecting to HPC",
        summary: "What HPC is and how to connect.",
        order: 1,
        items: [
          { order: 1, section: "HPCu.high_performance_computing.hpc_intro.01_hpc_intro" },
          { order: 2, section: "HPCu.high_performance_computing.hpc_intro.02_connecting" },
          { order: 3, section: "HPCu.high_performance_computing.hpc_intro.03_cluster" },
          { order: 4, section: "HPCu.high_performance_computing.hpc_intro.04_scheduler" },
        ],
      },
      {
        name: "Working on a Cluster",
        summary: "Modules, file transfer, and job resources.",
        order: 2,
        items: [
          { order: 1, section: "HPCu.high_performance_computing.hpc_intro.05_modules" },
          { order: 2, section: "HPCu.high_performance_computing.hpc_intro.06_transferring_files" },
          { order: 3, section: "HPCu.high_performance_computing.hpc_intro.07_parallel" },
          { order: 4, section: "HPCu.high_performance_computing.hpc_intro.08_resources" },
        ],
      },
      {
        name: "Responsible Usage",
        summary: "Responsible use of shared systems.",
        order: 3,
        items: [{ order: 1, section: "HPCu.high_performance_computing.hpc_intro.09_responsibility" }],
      },
    ],
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
