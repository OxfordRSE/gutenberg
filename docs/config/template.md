---
title: Template Configuration
permalink: /config/template
---

The template yaml file has the following structure:

- **title**
  : The site title.
- **logo**:
  - **src**
    : Path to the favicon image.
  - **alt**
    : Alt text for the favicon.
- **description**:
  : contents for the HTML description tag.
- **frontpage**:
  - **intro**:
    : The text to display on the front page, this should be formatted as markdown.
- **footer**:
  : The footer text, this should be formatted as markdown.

Create a template for your deployment, place it in the `config` directory, e.g. `config/oxford.yaml` for Oxford. Then set the `YAML_TEMPLATE` environment variable to point to this file.
