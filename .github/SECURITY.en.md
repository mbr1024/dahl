# Security Policy

## Reporting a Vulnerability

**Please do not file security issues in public issues.**

Prefer GitHub's private vulnerability reporting (repo page → Settings → Security → Private
vulnerability reporting); if it's not enabled, contact the maintainers via the address shown
on the repo homepage.

We commit to:

- Confirming receipt **within 72 hours**
- Assessing impact and providing a fix plan
- Publishing a security advisory (GitHub Security Advisory) after the fix

## Security-Relevant Design

- **Permission model**: Tauri 2's zero-trust permission model — every capability is denied by
  default and only opted into via `src-tauri/capabilities/` (`allow-*`)
- **Update signing**: the `updater` uses minisign signatures; clients verify against the embedded
  public key (production setup: [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md))
- **CSP**: a strict Content Security Policy is set in `tauri.conf.json`, restricting script,
  style, and network sources
- **Test plugin isolation**: WebdriverIO test plugins are registered only under `debug_assertions`
  (dev builds) and never ship in release artifacts

## Dependency Vulnerabilities

- Frontend dependencies are checked periodically with `pnpm audit`
- Rust dependencies should be checked with `cargo audit`
- Upstream releases that contain security fixes are merged with priority

## Supported Branches

The project is at the 0.x stage (scaffold) and only `main` is maintained; after 1.0, we will
follow semantic versioning support policies.
