import { Type, Static } from "typebox";
import type { AgentHarnessTool, ExecutionToolContext } from "../../../external/pi/packages/agent/src/harness/tools/types.ts";
import { getOrThrow } from "../../../external/pi/packages/agent/src/harness/types.ts";
import { BrowserErrorType } from "../errors.ts";
import { browserRuntime } from "../browserRuntime/BrowserRuntime.ts";
import { BrowserTabsInput } from "./schemas.ts";

const browserTabsSchema = Type.Object({
	command: Type.Union([
		Type.Literal("list"),
		Type.Literal("activate"),
		Type.Literal("new"),
		Type.Literal("close"),
	]),
	pageId: Type.Optional(Type.String()),
	url: Type.Optional(Type.String({ format: "uri" })),
});

export type BrowserTabsToolInput = Static<typeof browserTabsSchema>;

export interface BrowserTabsToolDetails {
	// For list: tabs: Array<{ pageId: string; url: string; title: string; isActive: boolean }>
	// For activate: pageId: string
	// For new: pageId: string, url: string, title: string
	// For close: closedPageId: string
	// We'll use a union or just have a generic result and specify in the content.
	// We'll follow the pattern of returning a details object that varies by command.
	// For simplicity, we'll return a details object that has a `command` field and then the relevant data.
	command: string;
	// We'll add fields as needed.
	tabs?: Array<{ pageId: string; url: string; title: string; isActive: boolean }>;
	pageId?: string;
	closedPageId?: string;
	url?: string;
	title?: string;
}

export function createBrowserTabsTool(): AgentHarnessTool<ExecutionToolContext, typeof browserTabsSchema, BrowserTabsToolDetails> {
	return {
		name: "browser_tabs",
		label: "Browser Tabs",
		description: "Lists, activates, creates, or closes browser tabs.",
		parameters: browserTabsSchema,
		async execute(_toolCallId, { command, pageId, url }, signal, onUpdate) {
			// Ensure the browser runtime is started.
			if (browserRuntime.getContext() === null) {
				await browserRuntime.start();
			}

			switch (command) {
				case "list": {
					const tabs = await browserRuntime.listPages();
					return {
						content: [{ type: "text", text: `Tab list retrieved` }];
						details: {
							command: "list",
							tabs: tabs,
						};
					}
				}
				case "activate": {
					if (!pageId) {
						throw new Error("pageId is required for activate command");
					}
					const page = browserRuntime.getPage(pageId);
					if (!page) {
						throw new Error(`Page not found: ${pageId}`);
					}
					await browserRuntime.setActivePage(pageId);
					return {
						content: [{ type: "text", text: `Tab activated` }];
						details: {
							command: "activate",
							pageId: pageId,
						};
					}
				}
				case "new": {
					let newPageId: string;
					if (url) {
						newPageId = await browserRuntime.newPage({ url });
					} else {
						newPageId = await browserRuntime.newPage();
					}
					const page = browserRuntime.getPage(newPageId);
					if (!page) {
						throw new Error(`Failed to get page ${newPageId}`);
					}
					const pageUrl = page.url();
					const pageTitle = await page.title();
					return {
						content: [{ type: "text", text: `New tab created` }];
						details: {
							command: "new",
							pageId: newPageId,
							url: pageUrl,
							title: pageTitle,
						};
					}
				}
				case "close": {
					if (!pageId) {
						throw new Error("pageId is required for close command");
					}
					const page = browserRuntime.getPage(pageId);
					if (!page) {
						throw new Error(`Page not found: ${pageId}`);
					}
					await browserRuntime.closePage(pageId);
					return {
						content: [{ type: "text", text: `Tab closed` }];
						details: {
							command: "close",
							closedPageId: pageId,
						};
					}
				}
				default:
					throw new Error(`Unknown command: ${command}`);
			}
		},
	};
}