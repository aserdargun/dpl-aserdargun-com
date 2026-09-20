# Azure deployment contract

Authorized 2026-09-20 after local validation and GitHub publication.

| Setting                     | Value                                                    |
| --------------------------- | -------------------------------------------------------- |
| Repository / branch         | `aserdargun/dpl-aserdargun-com` / `main`                 |
| Subscription                | `aserdargun subscription 3`                              |
| Resource group              | `rg-dpl-aserdargun-com`                                  |
| Static Web App              | `swa-dpl-aserdargun-com`                                 |
| Region / SKU                | West Europe / Free                                       |
| Azure-generated endpoint    | https://orange-desert-036a46e03.5.azurestaticapps.net    |
| Custom domain               | https://dpl.aserdargun.com                               |
| Static artifact             | `dist/`                                                  |
| Workflow                    | `.github/workflows/deploy-swa-dpl-aserdargun-com.yml`    |
| Actions secret              | `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_DPL_ASERDARGUN_COM` |
| Serialized deployment group | `swa-dpl-aserdargun-com-production`                      |

The endpoint above is Azure's allocated resource hostname. A release is verified only when the workflow succeeds and `/release.json` reports the intended source commit. This file describes the deployment contract; immutable Actions run logs are the per-release evidence.

## Pipeline

1. Official checkout/setup actions pinned to verified immutable commit SHAs.
2. Node 22, locked `npm ci`, Chromium browser and system dependencies.
3. `npm run validate`: 44 domain/lifecycle tests, TypeScript, production build, static artifact reference/hash verification, 19 production-build browser tests, whitespace check.
4. Upload only prebuilt `dist/` with `Azure/static-web-apps-deploy`; both build steps skipped; no API directory or source integration.
5. Verify HTTPS release SHA, root document, all public asset hashes, HTTP types, and cache rules.
6. Run all 19 browser tests against the live endpoint. These interact only with local simulation state and download local JSON; no backend write endpoint exists.

The SHA, branch, workflow success, Azure environment Ready status and update time must agree. Deployment is serialized with `cancel-in-progress: false`. Secrets are passed directly from Azure CLI to GitHub's secret store without printing or saving values. Repository permissions are read-only for the workflow. The secret gives the deployment action access to this specific Azure resource.

## Verification commands

```sh
npm run verify:artifact
DPL_BASE_URL=https://dpl.aserdargun.com npm run verify:live
DPL_BASE_URL=https://dpl.aserdargun.com npm run test:e2e
```

`verify:live` expects the current checkout HEAD unless `DPL_EXPECTED_SHA` or `GITHUB_SHA` is provided. `release.json` also includes file hashes and build time. Local working-tree builds are for validation; authoritative production builds run from the exact checked-out Actions commit.

## Boundaries

The separately authorized custom domain is `dpl.aserdargun.com`. IHS holds the `dpl` CNAME pointing to the Azure-generated hostname and the `_dnsauth.dpl` TXT ownership record. No other DNS records are changed. No paid SKU, backend, external integration, model access, or other portfolio repository is added. There is one workflow and Azure's source integration is disabled to avoid duplicate generated workflows. After DPL resource creation this subscription has 10 Free Static Web Apps.

The original local-only validation record remains in `VALIDATION.md`; cloud publication is a subsequent authorized operation. Research sources and model/simulation boundaries remain unchanged.
