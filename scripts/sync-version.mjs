import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = path.join(root, "package.json");
const tauriPath = path.join(root, "src-tauri", "tauri.conf.json");
const cargoPath = path.join(root, "src-tauri", "Cargo.toml");
const cargoLockPath = path.join(root, "src-tauri", "Cargo.lock");
const checkOnly = process.argv.includes("--check");

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const tauriJson = fs.readFileSync(tauriPath, "utf8");
const cargoToml = fs.readFileSync(cargoPath, "utf8");
const cargoPackage = cargoToml.match(
  /^\[package\][\s\S]*?^name = "([^"]+)"\r?\n^version = "([^"]+)"/m,
);

if (!cargoPackage) {
  throw new Error("Unable to read the package name and version from src-tauri/Cargo.toml");
}

const { version } = packageJson;
const cargoName = cargoPackage[1];
const files = [
  {
    filePath: tauriPath,
    content: tauriJson.replace(/("version"\s*:\s*)"[^"]+"/, `$1"${version}"`),
  },
  {
    filePath: cargoPath,
    content: cargoToml.replace(/^(\[package\][\s\S]*?^version = )"[^"]+"/m, `$1"${version}"`),
  },
];

const cargoLock = fs.readFileSync(cargoLockPath, "utf8");
const escapedCargoName = cargoName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const lockPattern = new RegExp(
  `(\\[\\[package\\]\\]\\nname = "${escapedCargoName}"\\nversion = )"[^"]+"`,
);
const updatedCargoLock = cargoLock.replace(lockPattern, `$1"${version}"`);
files.push({ filePath: cargoLockPath, content: updatedCargoLock });

const changed = files.filter(
  ({ filePath, content }) => fs.readFileSync(filePath, "utf8") !== content,
);

if (checkOnly) {
  if (changed.length > 0) {
    console.error(
      `Version drift detected in: ${changed.map(({ filePath }) => path.relative(root, filePath)).join(", ")}`,
    );
    process.exit(1);
  }
  console.log(`Versions are consistent: ${version}`);
} else {
  for (const { filePath, content } of changed) {
    fs.writeFileSync(filePath, content);
  }
  console.log(`Synchronized Tauri/Rust versions to ${version}`);
}
