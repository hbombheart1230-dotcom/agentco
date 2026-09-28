#!/usr/bin/env node
/**
 * Validates config/models.json against the 3 company-editable values, and
 * checks that INTERNAL_VLLM_API_KEY is set. Never reads the key's value into
 * a variable that gets printed -- only its presence/length is checked.
 *
 * Usage:
 *   node check-config.mjs <path-to-models.json>                 -> human PASS/FAIL report
 *   node check-config.mjs <path-to-models.json> --print-model-arg -> on success, prints
 *       "internal-vllm/<id>" as the only stdout line (for launchers to capture);
 *       on failure, prints nothing to stdout and details to stderr; exit code 1.
 */

import { existsSync, readFileSync } from "node:fs";

const PROVIDER_ID = "internal-vllm";
const PLACEHOLDER_ENDPOINT = "<INTERNAL_VLLM_ENDPOINT>";
const PLACEHOLDER_MODEL_ID = "<INTERNAL_GLM_MODEL_ID>";
const ENV_VAR_APIKEY_TEMPLATE = "${INTERNAL_VLLM_API_KEY}";

const modelsJsonPath = process.argv[2];
const printModelArgOnly = process.argv.includes("--print-model-arg");

let ok = true;

function fail(message) {
	ok = false;
	if (printModelArgOnly) {
		console.error(`FAIL  ${message}`);
	} else {
		console.log(`FAIL  ${message}`);
	}
}

function pass(message) {
	if (!printModelArgOnly) console.log(`PASS  ${message}`);
}

if (!modelsJsonPath || !existsSync(modelsJsonPath)) {
	fail(`models.json not found: ${modelsJsonPath}`);
	process.exit(1);
}

let json;
try {
	json = JSON.parse(readFileSync(modelsJsonPath, "utf-8"));
	pass("models.json is valid JSON");
} catch (e) {
	fail(`models.json is not valid JSON: ${e instanceof Error ? e.message : e}`);
	process.exit(1);
}

const provider = json?.providers?.[PROVIDER_ID];
if (!provider) {
	fail(`providers.${PROVIDER_ID} not found in models.json`);
	process.exit(1);
}
pass(`providers.${PROVIDER_ID} found`);

const baseUrl = provider.baseUrl;
if (baseUrl === PLACEHOLDER_ENDPOINT) {
	fail(`Endpoint is still the placeholder ${PLACEHOLDER_ENDPOINT} -- edit "baseUrl" in ${modelsJsonPath}`);
} else if (!baseUrl) {
	fail(`"baseUrl" is missing in providers.${PROVIDER_ID}`);
} else {
	pass(`Endpoint set: ${baseUrl}`);
}

const modelId = provider.models?.[0]?.id;
if (modelId === PLACEHOLDER_MODEL_ID) {
	fail(`GLM Model ID is still the placeholder ${PLACEHOLDER_MODEL_ID} -- edit "models[0].id" in ${modelsJsonPath}`);
} else if (!modelId) {
	fail(`providers.${PROVIDER_ID}.models[0].id is missing`);
} else {
	pass(`GLM Model ID set: ${modelId}`);
}

// API key can be supplied either way -- both are Pi native mechanisms:
//   (a) "apiKey": "${INTERNAL_VLLM_API_KEY}" in models.json + env var set at run time (recommended)
//   (b) the real key written directly into "apiKey" in models.json (simpler, but plaintext on disk)
// This script never reads the literal key value into a log message either way.
const apiKeyField = provider.apiKey;
if (!apiKeyField) {
	fail(`"apiKey" is missing in providers.${PROVIDER_ID}`);
} else if (apiKeyField === ENV_VAR_APIKEY_TEMPLATE) {
	const apiKeySet = Boolean(process.env.INTERNAL_VLLM_API_KEY && process.env.INTERNAL_VLLM_API_KEY.length > 0);
	if (!apiKeySet) {
		fail(
			`"apiKey" in models.json references \${INTERNAL_VLLM_API_KEY}, but that environment variable is not set. ` +
				`Either set it before running (its value is never checked or printed), or replace "apiKey" in models.json with the literal key.`,
		);
	} else {
		pass(`API key: environment variable INTERNAL_VLLM_API_KEY is set (value not shown)`);
	}
} else {
	pass(`API key: literal value configured directly in models.json (value not shown)`);
}

if (!ok) process.exit(1);

if (printModelArgOnly) {
	console.log(`${PROVIDER_ID}/${modelId}`);
}
