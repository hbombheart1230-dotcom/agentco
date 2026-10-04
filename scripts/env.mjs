// Shared .env loader (only whitelisted provider keys; values are never printed).
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const cli = path.join(root, "node_modules", "@earendil-works", "pi-coding-agent", "dist", "bundle", "cli.js");
const KEYS = new Set(["OPENROUTER_API_KEY", "OPENROUTER_BASE_URL", "GROQ_API_KEY", "GROQ_BASE_URL"]);

export function piEnv() {
	const env = { ...process.env, PI_CODING_AGENT_DIR: path.join(root, "pi-home") };
	const envFile = path.join(root, ".env");
	if (existsSync(envFile)) {
		for (const line of readFileSync(envFile, "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
			const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
			if (m && KEYS.has(m[1]) && !env[m[1]]) env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
		}
	}
	return env;
}
