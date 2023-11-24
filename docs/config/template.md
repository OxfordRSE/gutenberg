---
title: Template Configuration
permalink: /config/template
---

The template yaml file has the following structure:

- **title**
  : The site title
- **logo**:
  - **src**
    : Path to the favicon image
  - **alt**
    : Alt text for the favicon
- **description**:
  : HTML description field
- **frontpage**:
  - **intro**:
    : The text to display on the front page, this should be HTML formatted
- **footer**:
  : The footer text, this should be HTML formatted

Create a template for your institute and place it in the `config` directory, e.g. `config/oxford.yaml` for Oxford. Then set the `YAML_TEMPLATE` environment variable to point to this file.
