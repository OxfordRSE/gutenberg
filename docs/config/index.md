---
title: Configuration
permalink: /config/
---

There are two steps required for getting the deployed application fully configured:

1. [Configure Env Variables](vars)
2. [Create a template](template)

`Gutenberg` can be configured using environment variables, these can be set in a `.env` file in the root of the repository.
A list of these and their purposes can be found [here](vars).
If you are hosting this on fly.io, you can set these as secrets in the fly.io dashboard.

The institute specific templating is controlled via a yaml file in the `config` directory, this contains a yaml file for each institute, e.g. `config/oxford.yaml` for Oxford.
The details of what is controlled by this config file can be found [here](template).
