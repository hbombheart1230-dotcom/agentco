// Thin launcher: load .env into the Pi process, point Pi at ./pi-dev, run upstream Pi unchanged.
// Usage: node scripts/pi.mjs [pi args...]   (default model comes from pi-dev/settings.json)
import { spawn } from "node:child_process";
import { cli, piEnv } from "./env.mjs";

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], { stdio: "inherit", env: piEnv() });
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
