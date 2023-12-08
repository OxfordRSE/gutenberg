---
title: Template Configuration
permalink: /config/template
---

The config yaml file has the following structure:

- **template**:
  - **title**:
    : The site title.
  - **logo**:
    - **src**:
      : Path to the favicon image.
    - **alt**:
      : Alt text for the favicon.
  - **description**:
    : contents for the HTML description tag.
  - **frontpage**:
    - **intro**:
      : The text to display on the front page, this should be formatted as markdown.
  - **footer**:
    : The footer text, this should be formatted as markdown.
- **material**:
  - [repo]:
    - the repo name, use a unique identifier for each repo you wish to fetch.
    - **path**:
      : Unique identifier for the repo, this is used for subdpath in the /material path on the deployed site.
    - **url**:
      : The URL of the material repo, e.g. `https://github.com/UNIVERSE-HPC/course-material`.
    - **exclude**:
      : You can exclude certain sections and courses from the material repo, this is useful if you want to include a subset of the material in your deployment.
      - **theme**:
        : A list of themes to exclude from the material repo, this should match the "id" field in the theme markdown page.
      - **course**:
        : A list of courses to exclude from the material repo, this should match the "id" field in the course markdown page.
      - **section**:
        : A list of sections to exclude from the material repo, this should match the "id" field in the section markdown page.

Create a template for your deployment, place it in the `config` directory, e.g. `config/oxford.yaml` for Oxford. Then set the `YAML_TEMPLATE` environment variable to the path of this file.
