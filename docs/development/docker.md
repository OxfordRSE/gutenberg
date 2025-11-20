---
Title: Docker & Compose
permalink: /development/docker

---

Gutenberg supports Docker workflows for both production deployment and active local development.:

1. Production‑like runtime ("runtime compose") using `docker-compose.yml` – builds once, runs the app in production mode.
2. Active local development using `docker-compose.dev.yml` – hot reloads, mounts source code, lets you iterate quickly.

It is important not to confuse these: the production compose image is optimized for running, the dev compose setup is optimized for editing. This page highlights the differences early to avoid that confusion.

## Prerequisites

- `git` ≥ 2.43.0
- `docker` ≥ 18.03
- (Optional for local material pulls) `python` ≥ 3.10

Install these in the appropriate manner for your operating system.

Clone the repository:

```bash
git clone https://github.com/OxfordRSE/gutenberg.git
cd gutenberg
```

## 1. Production‑Like Compose (Simple Run)

Run:

```bash
docker compose up
```

This builds (first run) then serves the site at <http://localhost:3000>. To force a rebuild after code changes:

```bash
docker compose up --build
```

Characteristics:

- Runs Next.js in production mode (no hot reload).
- Image layers cache aggressively; rebuilds can be slow.
- Uses material defined by the configuration YAML (default `config/oxford.yaml`).
- Best for smoke testing or CI‑like verification.

## Adjusting Material (Production Compose)

In `docker-compose.yml` you can change build args:

- `YAML_TEMPLATE` – switch to another  config file.
- `MATERIAL_METHOD` – defaults to pulling fresh material; set to `copy` if you intend to bake a locally checked out material folder at build time.

If you want iterative editing of material or code, switch to the dev workflow below instead of repeatedly rebuilding this image.

## 2. Local Development Compose (Active Editing)

Use `docker-compose.dev.yml` when changing application code or styling and you need fast feedback.

```bash
pip install -r scripts/python_requirements.txt
python scripts/pull_material.py

# Build the dev image (installs Node/Yarn, sets up volumes)
docker compose -f docker-compose.dev.yml build

# Run with hot reload on http://localhost:3000
docker compose -f docker-compose.dev.yml up

# Tear down containers when finished
docker compose -f docker-compose.dev.yml down
```

Characteristics:

- Runs Next.js in development mode (fast refresh enabled).
- Mounts source code so changes appear without rebuilds.
- Separate from production image; smaller iteration cycle.
- Mounting the material folder allows local material edits after pulling with `pull_material.py` to be reflected immediately.

## Troubleshooting

- Port already in use: stop previous containers (`docker ps` / `docker compose down`).
- Material not updating in production compose: you baked it into the image; rebuild with `--build` or move to dev compose.
- Environment variables missing: ensure `.env` or secret injection is configured before `docker compose up`.
- - Editing code while using `docker compose up` and expecting live reload: switch to `docker-compose.dev.yml`.
- Forgetting to pull material locally for dev: run the Python script before starting dev containers.
- Long rebuild times: use dev compose unless you explicitly need production mode behavior.

## Next Steps

For environment variable details see the [Configuration Variables](/config/vars) page. For templating see [Template Configuration](/config/template). For authentication see [Authentication](/config/authentication).
