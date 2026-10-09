// Baseline smoke test: discovery, auth presence, text, file read (tool call), session start/exit.
// Usage: node scripts/smoke.mjs [openrouter|groq|all]   Never prints secret values.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import path from "node:path";
import { cli, piEnv, root } from "./env.mjs";

const TARGETS = {
	openrouter: { provider: "openrouter", model: "nvidia/nemotron-3-ultra-550b-a55b:free", key: "OPENROUTER_API_KEY" },
	groq: { provider: "groq", model: "openai/gpt-oss-120b", key: "GROQ_API_KEY" },
};
const which = process.argv[2] ?? "all";
const names = which === "all" ? Object.keys(TARGETS) : [which];
const smokeRoot = path.join(root, "results", "smoke");
mkdirSync(smokeRoot, { recursive: true });
const out = mkdtempSync(path.join(smokeRoot, "run-"));
const env = piEnv();
const WORD = "PLUM-4721";
writeFileSync(path.join(out, "fixture.txt"), `The magic word is ${WORD}.\n`);
const fixturePath = path.relative(root, path.join(out, "fixture.txt")).split(path.sep).join("/");
console.log(`Smoke output: ${path.relative(root, out).split(path.sep).join("/")}`);

function pi(args, timeout = 180000) {
	return spawnSync(process.execPath, [cli, "--offline", ...args], { cwd: root, env, encoding: "utf8", timeout, maxBuffer: 64 * 1024 * 1024 });
}
function run(t, prompt, extra) {
	const args = ["--provider", t.provider, "--model", t.model, "--no-extensions", "--no-skills", "--no-context-files", "--mode", "json", "-p", prompt];
	let r;
	for (let i = 0; i < 2; i++) { // one retry for transient free-tier errors
		r = pi([...extra, ...args]);
		const ev = (r.stdout ?? "").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
		const assistants = ev.filter((e) => e.type === "message_end" && e.message?.role === "assistant");
		const last = assistants.at(-1)?.message;
		const text = (last?.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("");
		const err = last?.stopReason === "error" ? String(last.errorMessage ?? "error").slice(0, 200) : null;
		const calls = ev.filter((e) => e.type === "tool_execution_end");
		const models = [...new Set(assistants.map((m) => `${m.message.provider}/${m.message.model}`))];
		if (!err || i === 1) return { code: r.status, ev, text, err, calls, models, stderr: (r.stderr ?? "").slice(0, 200) };
	}
}

const results = [];
const check = (target, name, ok, detail = "") => { results.push({ target, name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${target.padEnd(10)} ${name}${detail ? "  -- " + detail : ""}`); };

for (const name of names) {
	const t = TARGETS[name];
	if (!t) { console.error(`unknown target: ${name}`); process.exit(2); }
	console.log(`\n== ${t.provider}/${t.model}`);
	check(name, "auth key present", Boolean(env[t.key]), `${t.key} ${env[t.key] ? "set" : "MISSING"}`);
	const ls = pi(["--list-models", t.model.split("/").pop()]);
	check(name, "model discovery", (ls.stdout ?? "").split(/\r?\n/).some((l) => l.trim().split(/\s+/).slice(0, 2).join(" ") === `${t.provider} ${t.model}`));

	const sessDir = path.join(out, "sessions", name);
	const a = run(t, "Reply with exactly the single word: PONG", ["--session-dir", sessDir]);
	check(name, "text response", !a.err && /PONG/i.test(a.text), a.err ?? `model=${a.models.join(",")}`);
	check(name, "fixed model (no routing)", a.models.length === 1 && a.models[0] === `${t.provider}/${t.model}`, a.models.join(","));
	let sess = []; try { sess = readdirSync(sessDir).filter((f) => f.endsWith(".jsonl")); } catch {}
	check(name, "session start/exit", a.code === 0 && a.ev.some((e) => e.type === "session") && sess.length === 1, `exit=${a.code} sessionFiles=${sess.length}`);

	const b = run(t, `Read the file ${fixturePath} and tell me the magic word.`, ["--no-session", "--tools", "read"]);
	const read = b.calls.find((c) => c.toolName === "read" && !c.isError);
	check(name, "tool call (read)", Boolean(read) && JSON.stringify(read.result).includes(WORD), b.err ?? `calls=${b.calls.map((c) => c.toolName).join(",")}`);
	check(name, "file content used in answer", !b.err && b.text.includes(WORD));
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
