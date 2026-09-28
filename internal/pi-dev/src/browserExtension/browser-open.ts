import { Type, Static } from "typebox";
import type { AgentHarnessTool, ExecutionToolContext } from "../../../external/pi/packages/agent/src/harness/tools/types.ts";
import { getOrThrow } from "../../../external/pi/packages/agent/src/harness/types.ts";
import { BrowserErrorType } from "../errors.ts";
import { browserRuntime } from "../browserRuntime/BrowserRuntime.ts";
import { BrowserOpenInput } from "./schemas.ts";

const browserOpenSchema = Type.Object({
	url: Type.Optional(Type.String({ format: "uri" })),
});

export type BrowserOpenToolInput = Static<typeof browserOpenSchema>;

export interface BrowserOpenToolDetails {
	pageId: string;
	url: string;
	title: string;
}

export function createBrowserOpenTool(): AgentHarnessTool<ExecutionToolContext, typeof browserOpenSchema, BrowserOpenToolDetails> {
	return {
		name: "browser_open",
		label: "Browser Open",
		description: "Opens a new browser page and optionally navigates to a URL.",
		parameters: browserOpenSchema,
		async execute(_toolCallId, { url }, signal, onUpdate) {
			// Ensure the browser runtime is started.
			if (browserRuntime.getContext() === null) {
				await browserRuntime.start();
			}

			let pageId: string;
			if (url) {
				pageId = await browserRuntime.newPage({ url });
			} else {
				pageId = await browserRuntime.newPage();
			}

			const page = browserRuntime.getPage(pageId);
            if (!page) {
                throw new Error(`Failed to get page ${pageId}`);
            }

            const pageUrl = page.url();
            const pageTitle = await page.title();

            return {
                content: [{ type: "text", text: `Page opened successfully` }],
                details: {
                    pageId,
                    url: pageUrl,
                    title: pageTitle,
                },
            };
		},
	};
}