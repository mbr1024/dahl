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

> 提示：正式公钥通常以 `dW50cnVzdGVkIGNvbW1lbnQ6...` 开头；当前占位配置也是这个格式，替换即可。

## 3. 配置 tauri.conf.json

```json
"plugins": {
  "updater": {
    "pubkey": "<正式公钥>",
    "endpoints": [
      "https://updates.example.com/dahl/{{target}}/{{arch}}/{{current_version}}"
    ]
  }
}
```

更新服务器可以是任意静态托管（GitHub Releases / Cloudflare R2 / OSS / 自建 Nginx），只要能在该 URL 返回清单 JSON。

## 4. 发布清单（JSON）格式

endpoint 需返回如下结构（Tauri 2 格式）：

```json
{
  "version": "0.2.0",
  "notes": "新版本说明",
  "pub_date": "2026-08-08T00:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "<minisign 签名 base64>",
      "url": "https://updates.example.com/dahl/dahl_0.2.0_aarch64.dmg"
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

### 发布步骤（维护者）

1. 合并功能 PR（内含 `npm run changeset` 生成的变更集）
2. 合并自动生成的 "Version Packages" PR（版本号与 CHANGELOG 更新）
3. 打 tag：`git tag v0.2.0 && git push origin v0.2.0`
4. 等待 `Release` workflow 构建三平台产物，在 GitHub Releases 中确认（draft → publish）
5. 更新服务器上的清单 JSON（可用 CI 或脚本生成）

## 6. 本地自测

```bash
# 在 src-tauri 下构建并签名单个产物
npm run tauri build
npx tauri signer sign -w ~/.tauri/dahl.key -i src-tauri/target/release/bundle/dmg/dahl_0.1.0_aarch64.dmg
```

将签名与产物放到本地 HTTP 服务器，临时修改 endpoint 指向本地地址，验证应用内「检查更新」流程。

## 7. 安全提醒

- 私钥丢失将无法发布更新；泄露则攻击者可分发恶意版本——请使用密码管理器/CI Secret 妥善保管
- 不要复用仓库内示例公钥
- 更新服务器建议启用 HTTPS；endpoint 域名与 CSP `connect-src` 保持一致
