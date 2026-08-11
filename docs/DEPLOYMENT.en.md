# Deployment Guide: updater Setup & Release Pipeline

> Status: **production signing key generated and configured** — `tauri.conf.json` now has the real public key
> and the endpoint points to GitHub Releases `latest.json`. The full setup process below is kept as reference
> for rotating keys or switching update servers.

## 1. How It Works

- Installers are signed with a [minisign](https://github.com/jedisct1/minisign) private key; the
  public key is embedded in the app
- On update check, the app fetches the JSON manifest from `endpoints`, verifies `signature`,
  then downloads and installs the artifact
- Endpoint templates support variables: `{{target}}` (e.g. `darwin-aarch64`), `{{arch}}`,
  `{{current_version}}`

## 2. Generate a Production Key Pair

```bash
pnpm dlx tauri signer generate -w ~/.tauri/dahl.key
```

- Private key: `~/.tauri/dahl.key` (**never commit it**, back it up carefully)
- Public key: `~/.tauri/dahl.key.pub` (paste into `plugins.updater.pubkey` in `tauri.conf.json`)

> Note: production public keys usually start with `dW50cnVzdGVkIGNvbW1lbnQ6...` — the production
> key in `tauri.conf.json` follows the same format.

## 3. Configure tauri.conf.json

```json
"plugins": {
  "updater": {
    "pubkey": "<production public key>",
    "endpoints": [
      "https://github.com/mbr1024/dahl/releases/latest/download/latest.json"
    ]
  }
}
```

The update server can be any static host (GitHub Releases / Cloudflare R2 / OSS / self-hosted
Nginx) as long as it serves the manifest JSON at that URL.

## 4. Release Manifest (JSON) Format

The endpoint must return the following structure (Tauri 2 format):

```json
{
  "version": "0.2.0",
  "notes": "Release notes",
  "pub_date": "2026-08-08T00:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "<minisign signature base64>",
      "url": "https://updates.example.com/dahl/dahl_0.2.0_aarch64.dmg"
    },
    "darwin-x86_64": { "signature": "...", "url": "..." },
    "linux-x86_64": { "signature": "...", "url": "..." },
    "windows-x86_64": { "signature": "...", "url": "..." }
  }
}
```

## 5. Signing & Releasing in CI

`release.yml` already wires up signing env vars. Configure these in repo Settings → Secrets:

| Secret                               | Value                                |
| ------------------------------------ | ------------------------------------ |
| `TAURI_SIGNING_PRIVATE_KEY`          | Full content of the private key file |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Key password (empty if none was set) |

Once configured, tag-triggered releases get signed automatically by
[tauri-action](https://github.com/tauri-apps/tauri-action) and uploaded to GitHub Release (draft).

### Artifact signing (important)

- Current artifacts carry only the **minisign updater signature** (verified by the in-app
  updater); **no macOS notarization / Windows code signing** is configured
- So first-time installs show the "cannot verify developer" prompt on macOS (right-click →
  Open) and a SmartScreen warning on Windows — expected for a developer/scaffold audience;
  proceed manually
- To distribute to end users without warnings, paid certificates are required:
  - **macOS**: Apple Developer Program ($99/yr) → set secrets `APPLE_CERTIFICATE`,
    `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`,
    `APPLE_TEAM_ID` (tauri-action picks them up automatically; no workflow change needed)
  - **Windows**: Authenticode code-signing certificate (OV/EV, $200+/yr) → set secrets
    `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`
- Trade-off: open-source tools can stay unsigned indefinitely; add signing when you start
  commercial distribution

### Release Steps (maintainers)

Releases are driven by Changesets (see `changesets.yml`):

1. Merge feature PRs (each containing a changeset from `pnpm changeset`, see
   [CONTRIBUTING.en.md](../.github/CONTRIBUTING.en.md))
2. Merge the auto-generated "Version Packages" PR (version + CHANGELOG updates)
3. **Sync the Rust-side version**: `changeset version` only bumps `package.json` — manually
   sync the new version into `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`
   (updater verification and artifact naming rely on it), then update `src-tauri/Cargo.lock`
4. Tag: `git tag v0.2.0 && git push origin v0.2.0`
5. Wait for the `Release` workflow to build the 3-platform artifacts; confirm on GitHub
   Releases (draft → publish)
6. Update the manifest JSON on the update server (via CI or a script)

## 6. Local Verification

```bash
# Build and sign a single artifact from src-tauri
pnpm run tauri build
pnpm dlx tauri signer sign -w ~/.tauri/dahl.key -i src-tauri/target/release/bundle/dmg/dahl_0.1.0_aarch64.dmg
```

Serve the artifact and signature from a local HTTP server, point the endpoint at it
temporarily, and exercise the in-app "check for updates" flow.

## 7. Security Notes

- Losing the private key blocks future updates; leaking it lets attackers ship malicious
  versions — keep it in a password manager / CI secrets
- Do not reuse the example public key in this repo
- Serve the update server over HTTPS; keep the endpoint domain in sync with the CSP
  `connect-src`
