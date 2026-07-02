---
name: Continuous Integration
id: continuous_integration
dependsOn: [software_project_management.collaboration]
files: [github_actions.md, code_coverage.md, documentation.md]
learningOutcomes:
  - Use GitHub actions to build automated workflows running on multiple platforms.
  - Explore code coverage tools for assessing the extent of software testing.
  - Appreciate the benefits of having good documentation.
  - Use Sphinx to generate documentation for a project.
summary: |
  This course introduces the concept of continuous integration and how to set it up for a Python project using GitHub Actions.
attribution:
  - citation: This material has been adapted from the "Software Engineering" module of the SABS R³ Center for Doctoral Training.
    url: https://www.sabsr3.ox.ac.uk
    image: https://www.sabsr3.ox.ac.uk/sites/default/files/styles/site_logo/public/styles/site_logo/public/sabsr3/site-logo/sabs_r3_cdt_logo_v3_111x109.png
    license: CC-BY-4.0
  - citation: This course material was developed as part of UNIVERSE-HPC, which is funded through the SPF ExCALIBUR programme under grant number EP/W035731/1
    url: https://www.universe-hpc.ac.uk
    image: https://www.universe-hpc.ac.uk/assets/images/universe-hpc.png
    license: CC-BY-4.0
---

## What is Continuous Integration?

Whenever we write software, we want to be certain that the changes we make are not introducing unexpected problems.
We should always write tests to verify new functionality works as we intend, but there are plenty of pitfalls:

1. Does the change work on different operating systems?
1. What about with different software versions, including versions of libraries, frameworks, and dependencies?
1. What about on different hardware?
1. Does it unexpectedly rely on specific user data on your development machine?
1. Is the change compatible with changes other developers are making?
