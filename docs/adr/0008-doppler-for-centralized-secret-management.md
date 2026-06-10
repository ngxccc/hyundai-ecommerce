# 8. Doppler for Centralized Secret Management

Date: 2026-06-04

## Status

Accepted

## Context

Managing environment variables (`.env` files) in a multi-application monorepo is highly error-prone:

1. **Configuration Drift**: Developers manually copying `.env` files across applications (`admin`, `storefront`, `docs`) often lead to mismatched ports, stale secrets, or missing variables.
2. **Security Vulnerabilities**: Local `.env` files risk being accidentally committed to Git repositories or shared over insecure channels.
3. **Sync Overhead**: Adding a new environment variable (e.g., a Cloudinary setting or auth credential) requires notifying all team members to update their local files, and manually updating GitHub Actions secrets.

We needed a secure, centralized vault to manage, sync, and inject environment configurations across development, CI/CD, and production environments.

## Decision

We will **use Doppler** as our centralized secret management platform.

All secrets and environment configurations will be stored in Doppler projects. Local development and build scripts will run through the Doppler CLI (`doppler run -- ...`). Production deployments (e.g., Vercel) and GitHub Actions workflows will integrate directly with Doppler configs to fetch environment variables at build/run time.

## Consequences

- **Positive (Zero Local Config Drift)**: Developers do not maintain local `.env` files. Running `doppler run -- bun run dev` pulls the latest configuration securely from Doppler's cloud workspace.
- **Positive (Automated CI/CD Sync)**: Any configuration changes made in the Doppler dashboard are immediately propagated to GitHub Actions and Vercel hosting projects, eliminating manual coordination.
- **Positive (Audit Log & Versioning)**: Doppler tracks configuration changes, allowing rollbacks of accidental secret overwrites.
- **Negative (Network Dependency)**: Local runs require internet access and CLI authentication to fetch variables on startup.
- **Negative (Setup Friction)**: New developers must install the Doppler CLI, log in, and bind the project using `doppler setup` before running the applications locally.

### Explicit Tradeoffs

- **Centralized Syncing vs. Setup Friction & Network Dependency**: We trade local, offline `.env` file management for centralized cloud-based secrets, eliminating configuration drift but requiring developer CLI authentication and an active internet connection to run the application.
- **Audit Log Versioning vs. Platform Dependency**: We trade simple self-contained env vars for third-party service integration, gaining configuration rollbacks and secure access controls but depending on the vendor's service availability.
