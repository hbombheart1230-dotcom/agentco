/**
 * Pi Dev Web Search (pi-dev-web-search) -- adds a `web_search` custom tool
 * backed by the Naver Search API (openapi.naver.com).
 *
 * Pi's built-in toolset has no web/network tool at all -- confirmed from
 * source (`core/tools/index.ts`): the complete native ToolName union is
 * exactly "read" | "bash" | "powershell" | "edit" | "write" | "grep" | "find" |
 * "ls". This extension does not unblock anything Pi restricted; it adds a
 * capability Pi never had, the same way the Phase 3 `get_pi_dev_environment`
 * PoC did -- via `pi.registerTool()`, no Pi source change.
 *
 * Unlike the other extensions in this repo (pi-dev-info,
 * pi-dev-security-observer), this one DOES make real outbound network calls
 * and DOES use real credentials -- that's the whole point of the tool. It
 * still follows the same safety discipline used elsewhere: never log/return
 * the API key itself, fail cleanly (isError: true, no exception) if
 * credentials are missing or the request fails, and never touch anything
 * outside its own single HTTP request/response.
 *
 * No import from "@earendil-works/pi-ai" / "@earendil-works/pi-coding-agent"
 * (not resolvable in the self-contained pi-dev-user bundle, same constraint
 * as pi-dev-info.ts / pi-dev-security-observer.ts). `fetch` is a Node
 * built-in global since Node 18 -- no import needed, works identically in
 * both pi-dev (full monorepo) and pi-dev-user (portable Node v24.20.0).
 *
 * Credentials: NAVER_CLIENT_ID / NAVER_CLIENT_SECRET, read from the
 * environment only (never hardcoded, never read from a file by this
 * extension itself -- the launcher script is responsible for loading them
 * from .env.naver into the environment before starting Pi, the same pattern
 * already used for OPENROUTER_API_KEY).
 */

const NAVER_ENDPOINTS = {
	web: "https://openapi.naver.com/v1/search/webkr.json",
	news: "https://openapi.naver.com/v1/search/news.json",
	blog: "https://openapi.naver.com/v1/search/blog.json",
};

function stripNaverMarkup(value) {
	if (typeof value !== "string") return value;
	return value
		.replace(/<\/?b>/g, "")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">");
}

const webSearchTool = {
	name: "web_search",
	label: "Web Search (Naver)",
	description:
		"Search the live web via the Naver Search API (Korean search engine -- strongest for Korean-language and Korea-related queries). Use for current events, up-to-date facts, or anything not answerable from local files. Returns title/link/description for each result.",
	parameters: {
		type: "object",
		properties: {
			query: { type: "string", description: "Search query text" },
			category: {
				type: "string",
				enum: ["web", "news", "blog"],
				description: "Result category: general web documents (default), news, or blog posts",
			},
			count: { type: "number", description: "Number of results to return, 1-30 (default 10)" },
		},
		required: ["query"],
		additionalProperties: false,
	},

	async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
		const clientId = process.env.NAVER_CLIENT_ID;
		const clientSecret = process.env.NAVER_CLIENT_SECRET;
		if (!clientId || !clientSecret) {
			return {
				content: [
					{
						type: "text",
						text: "web_search unavailable: NAVER_CLIENT_ID / NAVER_CLIENT_SECRET are not set in the environment.",
					},
				],
				isError: true,
			};
		}

		const query = typeof params?.query === "string" ? params.query.trim() : "";
		if (!query) {
			return {
				content: [{ type: "text", text: "web_search error: `query` must be a non-empty string." }],
				isError: true,
			};
		}

		const category = NAVER_ENDPOINTS[params?.category] ? params.category : "web";
		const endpoint = NAVER_ENDPOINTS[category];
		const count = Math.min(Math.max(Number(params?.count) || 10, 1), 30);
		const url = `${endpoint}?query=${encodeURIComponent(query)}&display=${count}`;

		try {
			const res = await fetch(url, {
				headers: {
					"X-Naver-Client-Id": clientId,
					"X-Naver-Client-Secret": clientSecret,
				},
			});

			if (!res.ok) {
				const bodyText = await res.text().catch(() => "");
				return {
					content: [
						{
							type: "text",
							text: `web_search failed: HTTP ${res.status} ${res.statusText}${bodyText ? ` -- ${bodyText.slice(0, 300)}` : ""}`,
						},
					],
					isError: true,
				};
			}

			const data = await res.json();
			const items = Array.isArray(data.items) ? data.items : [];
			const results = items.map((item) => ({
				title: stripNaverMarkup(item.title),
				link: item.link,
				description: stripNaverMarkup(item.description),
			}));

			return {
				content: [{ type: "text", text: JSON.stringify({ query, category, count: results.length, results }, null, 2) }],
				details: { query, category, count: results.length },
			};
		} catch (e) {
			return {
				content: [{ type: "text", text: `web_search failed: ${e instanceof Error ? e.message : String(e)}` }],
				isError: true,
			};
		}
	},
};

export default function (pi) {
	pi.registerTool(webSearchTool);
}
