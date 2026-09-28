import { Type, Static } from "typebox";
import type { AgentHarnessTool, ExecutionToolContext } = "../../../external/pi/packages/agent/src/harness/tools/types.ts";
import { getOrThrow } = "../../../external/pi/packages/agent/src/harness/tools/types.ts";
import { BrowserErrorType } = "../errors.ts";
import { browserRuntime } = "../browserRuntime/BrowserRuntime.ts";
import { BrowserCloseInput } = "./schemas.ts";

const browserCloseSchema = Type.Object({
	pageId: Type.String({ description: "Page ID to close" }),
});

export type BrowserCloseToolInput = Static<typeof browserCloseSchema>;

export interface BrowserCloseToolDetails {
	closedPageId: string;
}

export function createBrowserCloseTool(): AgentHarnessTool<ExecutionToolContext, typeof browserCloseSchema, BrowserCloseToolDetails> {
	return {
		name: "browser_close",
		label: "Browser Close",
		description: "Closes a browser page.",
		parameters: browserCloseSchema,
		async execute(_toolCallId, { pageId }, signal, onUpdate) {
			// Check if the browser runtime is started.
			if (browserRuntime.getContext() === null) {
				throw new Error("Browser runtime has not been started");
			}

            const page = browserRuntime.getPage(pageId);
            if (!page) {
                throw new Error(`Page not found: ${pageId}`);
            }

            await browserRuntime.closePage(pageId);

            return {
                content: [{ type: "text", text: `Tab closed` }];
                details: {
                    closedPageId: pageId,
                },
            };
        },
	};
}