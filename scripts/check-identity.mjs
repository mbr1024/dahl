import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const errors = [];
const warnings = [];

function error(rel, detail) {
  errors.push(`${rel}: ${detail}`);
}
function warn(rel, detail) {
  warnings.push(`${rel}: ${detail}`);
}

// ---- 硬失败：字段间真实漂移，重命名后必须一致 ----
const packageName = JSON.parse(read("package.json")).name;
const rustCrate = read("src-tauri/Cargo.toml").match(/^name = "([^"]+)"/m)?.[1];

if (!rustCrate) error("src-tauri/Cargo.toml", "找不到 [package] name");
else if (packageName !== rustCrate) {
  error(
    "src-tauri/Cargo.toml",
    `Rust crate name "${rustCrate}" 与 package.json name "${packageName}" 不一致，运行 e2e 前需设置 TAURI_BINARY_NAME`,
  );
}

// ---- 提示：仍指向模板上游仓库的引用 ----
// 模板本体允许保留 mbr1024/dahl 引用（fork 前），因此这里只做提示不阻断 CI。
// 用户 fork/改名后应替换；发布前务必清理。
const upstreamRefs = [
  "src-tauri/tauri.conf.json",
  ".github/workflows/release.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  "docs/DEPLOYMENT.md",
  "docs/DEPLOYMENT.en.md",
  "README.md",
  "README.en.md",
];
for (const rel of upstreamRefs) {
  const content = read(rel);
  if (content.includes("mbr1024/dahl")) {
    warn(
      rel,
      "仍引用模板上游仓库 mbr1024/dahl，fork/改名后需按 README 清单替换（模板仓库本身可保留）",
    );
  }
}

if (checkOnly) {
  if (errors.length > 0) {
    console.error("Identity check found errors:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  if (warnings.length > 0) {
    console.log("Identity check warnings (template upstream references, expected until fork):");
    for (const w of warnings) console.log(`  - ${w}`);
  }
  console.log("Identity check passed.");
} else {
  for (const e of errors) console.error(`  - ERROR ${e}`);
  for (const w of warnings) console.log(`  - warn ${w}`);
  if (errors.length > 0) console.error("Identity check failed.");
  else console.log("Identity check passed.");
}
