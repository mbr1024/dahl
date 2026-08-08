import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binaryExt = process.platform === "win32" ? ".exe" : "";
const appBinaryPath = path.resolve(__dirname, `./src-tauri/target/debug/dahl${binaryExt}`);

export const config: WebdriverIO.Config = {
  runner: "local",

  specs: ["./e2e/**/*.spec.ts"],

  // 桌面应用测试必须串行（单实例 + 同一窗口）
  maxInstances: 1,
  maxInstancesPerCapability: 1,

  capabilities: [
    {
      browserName: "tauri",
      "tauri:options": {
        application: appBinaryPath,
      },
    } as WebdriverIO.Capabilities,
  ],

  // embedded 驱动：应用内嵌 WebDriver server（tauri-plugin-wdio-webdriver），
  // 无需安装任何外部 driver，三平台通用；仅 debug 构建注册（见 lib.rs）
  services: [
    [
      "@wdio/tauri-service",
      {
        appBinaryPath,
        driverProvider: "embedded",
        captureBackendLogs: true,
        captureFrontendLogs: true,
        backendLogLevel: "debug",
        frontendLogLevel: "debug",
      },
    ],
  ],

  logLevel: "info",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  reporters: ["spec"],
};
