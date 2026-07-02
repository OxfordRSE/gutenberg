---
name: GitHub Actions
dependsOn: []
tags: [github]
learningOutcomes:
  - Describe the structure and steps of a basic GitHub Actions workflow.
  - Build a basic workflow and run it on GitHub.
  - Create a workflow for a Python program to run a static code analysis tool and unit tests over the codebase.
  - Diagnose and fix a workflow fault.
  - Parameterise the running of a workflow over multiple operating systems.
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

## Overview

With a GitHub repository there's a very easy way to set up CI that runs when your
repository changes: simply add a [.yml file](https://learnxinyminutes.com/docs/yaml/) to your repository in the directory

```text
.github/workflows
```
