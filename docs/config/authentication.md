---
title: Authentication
permalink: /config/authentication
---

This project uses [NextAuth.js](https://next-auth.js.org/) for authentication, supporting multiple providers with a YAML-based configuration to style and enable each provider.

## Provider Enablement

- **GitHub** is enabled by default. To disable it, set `enabled: false` under the `github` provider in `config/auth.yaml`.
- **Other providers** (e.g., Oxford SSO/Azure AD) are disabled by default. To enable, set `enabled: true` under the provider entry.

Gutenberg currently only supports GitHub and Azure AD OAuth but more providers can be added on request.

Example:

```yaml
authentication:
  providers:
    github:
      # enabled: false   # Uncomment to disable GitHub sign-in
      name: GitHub
      button:
        color: "#24292e"
        hover: "#1b1f23"
        icon: github
    azure-ad:
      enabled: true # Enable Oxford SSO
      name: Oxford SSO
      button:
        color: "#002147"
        hover: "#001a38"
        icon: shield
```

## Secrets and Environment Variables

Sensitive values (client IDs, secrets, tenant IDs) are **never** stored in YAML.
They must be set as environment variables:

- `GITHUB_ID`, `GITHUB_SECRET`
- `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`

## Adding/Removing Providers

1. Add or remove provider entries in `config/auth.yaml`.
2. For new providers, ensure the corresponding environment variables are set.
3. Redeploy.

## Customization

You can customize button color, hover color, and icon for each provider in the YAML file.

## Troubleshooting

- If a provider is enabled in YAML but missing secrets, it will not appear.
- If you want to hide GitHub, set `enabled: false` under `github`.
- Ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set in your environment for NextAuth.js to function correctly.
