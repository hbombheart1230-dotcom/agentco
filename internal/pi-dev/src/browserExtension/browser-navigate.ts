import { Type, Static } from "typebox";
import type { AgentHarnessTool, ExecutionToolContext } from "../../../external/pi/packages/agent/src/harness/tools/types.ts";
import { getOrThrow } from "../../../external/pi/packages/agent/src/harness/types.ts";
import { BrowserErrorType } from "../errors.ts";
import { browserRuntime } from "../browserRuntime/BrowserRuntime.ts";
import { BrowserNavigateInput } from "./schemas.ts";

const browserNavigateSchema = Type.Object({
	pageId: Type.String({ description: "Page ID to navigate" }),
	url: Type.String({ format: "uri" }),
});

export type BrowserNavigateToolInput = Static<typeof browserNavigateSchema>;

export interface BrowserNavigateToolDetails {
	pageId: string;
	url: string;
	title: string;
}

export function createBrowserNavigateTool(): AgentHarnessTool<ExecutionToolContext, typeof browserNavigateSchema, BrowserNavigateToolDetails> {
	return {
		name: "browser_navigate",
		label: "Browser Navigate",
		description: "Navigates an existing browser page to a URL.",
		parameters: browserNavigateSchema,
		async execute(_toolCallId, { pageId, url }, signal, onUpdate) {
			// Ensure the browser runtime is started.
			if (browserRuntime.getContext() === null) {
				await browserRuntime.start();
			}

            const page = browserRuntime.getPage(pageId);
            if (!page) {
                throw new Error(`Page not found: ${pageId}`);
            }

            await page.goto(url, { waitUntil: "domcontentloaded" });

            const pageUrl = page.url();
            const pageTitle = await page.title();

            return {
                content: [{ type: "text", text: `Navigation successful` }],
                details: {
                    pageId,
                    url: pageUrl,
                    title: pageTitle,
                },
            };
        },
	};
}