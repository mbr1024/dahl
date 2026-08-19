# 部署指南：updater 正式配置与发布流程

> 状态：**正式密钥已生成并配置**（`tauri.conf.json` 已填入正式公钥，endpoint 指向 GitHub Releases 的 `latest.json`）。
> 下文完整记录配置原理与流程，供换密钥/换服务器时参考。

## 1. 工作原理

- 产物（安装包）使用 [minisign](https://github.com/jedisct1/minisign) 私钥签名，公钥内置于应用
- 应用启动更新检查时，请求 `endpoints` 中的 JSON 清单，校验 `signature` 后下载安装包
- endpoint 模板支持变量：`{{target}}`（如 `darwin-aarch64`）、`{{arch}}`、`{{current_version}}`

## 2. 生成正式密钥对

```bash
npx tauri signer generate -w ~/.tauri/dahl.key
```

- 私钥：`~/.tauri/dahl.key`（**绝对不要提交到仓库**，妥善备份）
- 公钥：`~/.tauri/dahl.key.pub`（需要粘贴进 `tauri.conf.json` 的 `plugins.updater.pubkey`）

> 提示：正式公钥通常以 `dW50cnVzdGVkIGNvbW1lbnQ6...` 开头；当前 `tauri.conf.json` 中的正式公钥也是这个格式。

## 3. 配置 tauri.conf.json

```json
"plugins": {
  "updater": {
    "pubkey": "<正式公钥>",
    "endpoints": [
      "https://github.com/mbr1024/dahl/releases/latest/download/latest.json"
    ]
  }
}
```

更新服务器可以是任意静态托管（GitHub Releases / Cloudflare R2 / OSS / 自建 Nginx），只要能在该 URL 返回清单 JSON。

## 4. 发布清单（JSON）格式

endpoint 需返回如下结构（Tauri 2 格式）：

```json
{
  "version": "X.Y.Z",
  "notes": "新版本说明",
  "pub_date": "2026-08-08T00:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "<minisign 签名 base64>",
      "url": "https://updates.example.com/dahl/dahl_X.Y.Z_aarch64.dmg"
    },
    "darwin-x86_64": { "signature": "...", "url": "..." },
    "linux-x86_64": { "signature": "...", "url": "..." },
    "windows-x86_64": { "signature": "...", "url": "..." }
  }
}
```

## 5. CI 自动签名与发布

本项目 `release.yml` 已预留签名环境变量。在仓库 Settings → Secrets 中配置：

| Secret                               | 值                                   |
| ------------------------------------ | ------------------------------------ |
| `TAURI_SIGNING_PRIVATE_KEY`          | 私钥内容（`dahl.key` 文件全文）      |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 私钥密码（如生成时未设置密码可留空） |

配置后，打 tag 触发 release 时 [tauri-action](https://github.com/tauri-apps/tauri-action) 会自动签名产物并上传到 GitHub Release（draft）。

### 产物签名说明（重要）

- 当前产物仅带 **minisign 更新签名**（供应用内 updater 验签），**未配置 macOS 公证 / Windows 代码签名**
- 因此首次安装时 macOS 会提示"无法验证开发者"（需右键 → 打开）、Windows 会触发 SmartScreen 警告——对开发者/脚手架用户属预期行为，可放行继续
- 若要面向终端用户分发（避免警告），需付费证书并配置：
  - **macOS**：Apple Developer Program（$99/年）→ 在 Secrets 配置 `APPLE_CERTIFICATE`、`APPLE_CERTIFICATE_PASSWORD`、`APPLE_SIGNING_IDENTITY`、`APPLE_ID`、`APPLE_PASSWORD`、`APPLE_TEAM_ID`（tauri-action 会自动读取并公证，workflow 无需改动）
  - **Windows**：Authenticode 代码签名证书（OV/EV，$200+/年）→ 在 Secrets 配置 `WINDOWS_CERTIFICATE`、`WINDOWS_CERTIFICATE_PASSWORD`
- 取舍建议：开发者工具/开源项目可长期不签；一旦开始商业分发再补即可

### 发布步骤（维护者）

发布流程由 Changesets 自动驱动（见 `changesets.yml`）：

1. 合并功能 PR（内含 `pnpm changeset` 生成的变更集，见 [CONTRIBUTING.md](../.github/CONTRIBUTING.md)）
2. 合并自动生成的 "Version Packages" PR（版本号与 CHANGELOG 更新）
3. Changesets workflow 会通过 `pnpm run changeset:version` 自动同步
   `package.json`、`src-tauri/Cargo.toml`、`src-tauri/tauri.conf.json` 与 `src-tauri/Cargo.lock`
4. 打 tag：`git tag vX.Y.Z && git push origin vX.Y.Z`
5. 等待 `Release` workflow 构建三平台产物，在 GitHub Releases 中确认（draft → publish）
6. 更新服务器上的清单 JSON（可用 CI 或脚本生成）

#### Version Packages PR 机制

- 每次 push 到 `main` 时，`changesets.yml` 都会检查 `.changeset/` 下是否有变更集
- 有则自动在 `changeset-release/main` 分支上执行 `changeset version`（删除变更集、更新 CHANGELOG、bump 版本号），并开一个 "Version Packages" PR 到 main
- **合并该 PR 即完成发版准备**——版本号与 changelog 已由机器生成，维护者只需 review 变更是否符合预期
- 该分支的生命周期由机器管理：`deleteBranch: true`（`.changeset/config.json`）会在 PR 合并后自动删除；若出现遗留的孤儿分支（如 PR 从未合并），可手动清理：
  `git push origin --delete changeset-release/main`

## 6. 本地自测

```bash
# 在 src-tauri 下构建并签名单个产物
pnpm run tauri build
pnpm dlx tauri signer sign -w ~/.tauri/dahl.key -i src-tauri/target/release/bundle/dmg/dahl_X.Y.Z_aarch64.dmg
```

将签名与产物放到本地 HTTP 服务器，临时修改 endpoint 指向本地地址，验证应用内「检查更新」流程。

## 7. 安全提醒

- 私钥丢失将无法发布更新；泄露则攻击者可分发恶意版本——请使用密码管理器/CI Secret 妥善保管
- 不要复用仓库内示例公钥
- 更新服务器建议启用 HTTPS；endpoint 域名与 CSP `connect-src` 保持一致
