---
title: About Gutenberg
permalink: /about
nav_order: 2
---

Gutenberg is being developed by the [Oxford Research Software Engineering team](https://www.rse.ox.ac.uk/).

The aim is to provide an interactive training environment for teaching software engineering and scientific computing material, both through **self-paced courses** and **scheduled events**.

The application consists of two key components:

- The course material.
- The tools to interact with it.

## Course Material

[Course material](https://github.com/UNIVERSE-HPC/course-material) is provided currently from the [HPC Universe Project](https://universe-hpc.github.io/) though this can reasonably be exchanged for any similarly styled sets of course material in the form of markdown files.
The structure of the markdown content is described in the HPC universe [contribution guide](https://github.com/UNIVERSE-HPC/course-material/blob/main/CONTRIBUTING.md).

The course material which the application will use can be configured to be any git repository, or multiple repositories.

## Teaching Tools

Gutenberg now has two main teaching models:

- **Courses** are reusable, grouped, self-paced learning paths with enrolment and progress tracking.
- **Events** are scheduled deliveries of material for a cohort, with event groups, dates, locations, enrolment flows, and instructor tooling.

Events can be created from scratch or from a course blueprint, and both courses and events can establish an active learning context while users move through material. Students can also provide feedback in the form of comments embedded on material pages.

To get started with Gutenberg, see the [deployment guide]({{ "/deployment/" | relative_url }}).

For current usage guidance, see the [user guide]({{ "/guide/" | relative_url }}).
