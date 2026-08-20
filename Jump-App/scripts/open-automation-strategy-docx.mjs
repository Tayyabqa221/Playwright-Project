/**
 * Opens docs/Jump_App_automation_strategy.docx in the default app (e.g. Word).
 * Cursor cannot preview .docx inside the editor — use this script or Explorer.
 */
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docx = path.resolve(__dirname, "..", "docs", "Jump_App_automation_strategy.docx");

if (!fs.existsSync(docx)) {
  console.error("File not found:", docx);
  console.error("Run: npm run docs:automation-strategy-docx");
  process.exit(1);
}

const platform = process.platform;
if (platform === "win32") {
  spawn("cmd", ["/c", "start", "", docx], { detached: true, stdio: "ignore" }).unref();
} else if (platform === "darwin") {
  spawn("open", [docx], { detached: true, stdio: "ignore" }).unref();
} else {
  spawn("xdg-open", [docx], { detached: true, stdio: "ignore" }).unref();
}

console.log("Opening:", docx);
