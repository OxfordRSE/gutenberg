---
Title: Deploying with Docker-compose
permalink: /development/docker
---

Gutenberg can be deployed both locally and to production using docker-compose.

- `git` version 2.43.0 or later
- `docker` version 18.03 or later

Both of which will need to be installed following instructions for your system.

Then we can get started by cloning the repository with git and entering into it with `cd`:

```bash
git clone https://github.com/OxfordRSE/gutenberg.git`
cd gutenberg
```

From here we can simply run:

```
docker compose up
```

which should make gutenberg available to you at http://localhost:3000. This will
build a Docker image the first time you run it (assuming you don't already have
an image called `gutenburg` in your local registry) from the local source code -
this might take a few minutes. If you want to force a rebuild after you've made
some changes you can append the `--build` flag after `up`, i.e.

```
docker compose up --build
```

Although this isn't particularly quick. By default the compose setup will pull
the repo from the source defined in `config/oxford.yaml`, though you can change
this from inside the `dev-compose.yml`, either by changing the `YAML_TEMPLATE`
value (under `services.gutenberg.build.args`) to a different config yaml file or
changing `MATERIAL_METHOD` to `"copy"` to copy a locally checked out folder into
the container at build-time instead of pulling fresh - for more details on how
to pull material to edit locally follow the below section.

## Local development with Docker

`docker-compose.dev.yml` configures a local development environment in Docker,
including Node and Yarn. It runs the app in development mode, so that you can make
changes to the code and see them on http://localhost:3000.

```sh
# install the course materials locally
pip install -r scripts/python_requirements.txt
python scripts/pull_material.py
# build the development image
docker compose -f docker-compose.dev.yml build
# run the Next.js app on http://localhost:3000 in development mode
docker compose -f docker-compose.dev.yml up
# shut down the app and database when you're finished
docker compose -f docker-compose.dev.yml down
```
