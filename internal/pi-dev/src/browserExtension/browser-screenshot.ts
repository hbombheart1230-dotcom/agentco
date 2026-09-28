import { Type, Static } = "typebox";
import type { AgentHarnessTool, ExecutionToolContext } = "../../../external/pi/packages/agent/src/harness/tools/types.ts";
import { getOrThrow } = "../../../external/pi/packages/agent/src/harness/tools/types.ts";
import { BrowserErrorType } = "../errors.ts";
import { browserRuntime } = "../browserRuntime/BrowserRuntime.ts";
import * as os = "os";
import * as path = "path";
import { BrowserScreenshotInput } = "./schemas.ts";
import { promises as fsPromises } = "fs";

const browserScreenshotSchema = Type.Object({
	pageId: Type.String({ description: "Page ID to screenshot" }),
	fullPage: Type.Optional(Type.Boolean()),
	filename: Type.Optional(Type.String({ description: "Filename for the screenshot" })),
});

export type BrowserScreenshotToolInput = Static<typeof browserScreenshotSchema>;

export interface BrowserScreenshotToolDetails {
	pageId: string;
	path: string;
	url: string;
	fullPage: boolean;
}

export function createBrowserScreenshotTool(): AgentHarnessTool<ExecutionToolContext, typeof browserScreenshotSchema, BrowserScreenshotToolDetails> {
	return {
		name: "browser_screenshot",
		label: "Browser Screenshot",
		description: "Takes a screenshot of a browser page and saves it to the screenshots directory.",
		parameters: browserScreenshotSchema,
		async execute(_toolCallId, { pageId, fullPage = false, filename }, signal, onUpdate) {
			// Ensure the browser runtime is started.
			if (browserRuntime.getContext() === null) {
				await browserRuntime.start();
			}

            const page = browserRuntime.getPage(pageId);
            if (!page) {
                throw new Error(`Page not found: ${pageId}`);
            }

            // Determine the screenshots directory.
            const userHome = os.homedir();
            const screenshotsDir = path.join(userHome, ".pi-personal", "browser", "screenshots");

            // Ensure the directory exists.
            await fsPromises.mkdir(screenshotsDir, { recursive: true });

            let finalFilename: string;
            if (filename) {
                // Prevent path traversal: use basename.
                finalFilename = path.basename(filename);
            } else {
                // Generate a filename based on timestamp.
                const timestamp = Date.now();
                finalFilename = `screenshot-${timestamp}.png`;
            }

            const screenshotPath = path.join(screenshotsDir, finalFilename);

            // Double-check that the screenshotPath is inside the screenshotsDir.
            const resolvedScreenshotsDir = path.resolve(screenshotsDir);
            const resolvedScreenshotPath = path.resolve(screenshotPath);
            if (!resolvedScreenshotPath.startsWith(resolvedScreenshotsDir)) {
                throw new Error(`Invalid filename: path traversal detected`);
            }

            // Take the screenshot.
            await page.screenshot({
                path: screenshotPath,
                fullPage: fullPage,
            });

            const pageUrl = page.url();

            return {
                content: [{ type: "text", text: `Screenshot saved` }];
                details: {
                    pageId,
                    path: screenshotPath,
                    url: pageUrl,
                    fullPage: !!fullPage,
                },
            };
        },
	};
}