import { Type, Static } from "typebox";

/**
 * Tool: browser_open
 * Opens a new page and optionally navigates to a URL.
 */
export const BrowserOpenSchema = Type.Object({
	url: Type.Optional(Type.String({ format: "uri" })),
});
export type BrowserOpenInput = Static<typeof BrowserOpenSchema>;

/**
 * Tool: browser_navigate
 * Navigates an existing page to a URL.
 */
export const BrowserNavigateSchema = Type.Object({
	pageId: Type.String({ description: "Page ID to navigate" }),
	url: Type.String({ format: "uri" }),
});
export type BrowserNavigateInput = Static<typeof BrowserNavigateSchema>;

/**
 * Tool: browser_tabs
 * Lists tabs, activates a tab, creates a new tab, or closes a tab.
 * We'll have a command field to specify the operation.
 */
export const BrowserTabsSchema = Type.Object({
	command: Type.Union([
		Type.Literal("list"),
		Type.Literal("activate"),
		Type.Literal("new"),
		Type.Literal("close"),
	]),
	pageId: Type.Optional(Type.String()),
	url: Type.Optional(Type.String({ format: "uri" })),
});
export type BrowserTabsInput = Static<typeof BrowserTabsSchema>;

/**
 * Tool: browser_screenshot
 * Takes a screenshot of a page.
 */
export const BrowserScreenshotSchema = Type.Object({
	pageId: Type.String({ description: "Page ID to screenshot" }),
	fullPage: Type.Optional(Type.Boolean()),
	filename: Type.Optional(Type.String({ description: "Filename for the screenshot" })),
});
export type BrowserScreenshotInput = Static<typeof BrowserScreenshotSchema>;

/**
 * Tool: browser_close
 * Closes a page.
 */
export const BrowserCloseSchema = Type.Object({
	pageId: Type.String({ description: "Page ID to close" }),
});
export type BrowserCloseInput = Static<typeof BrowserCloseSchema>;