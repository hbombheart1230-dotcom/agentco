import { BrowserOpenInput, BrowserNavigateInput, BrowserTabsInput, BrowserScreenshotInput, BrowserCloseInput } from "./schemas.ts";
import { browserRuntime } from "./browserRuntime/BrowserRuntime.ts";
import * as os from "os";
import * as path from "path";
import { promises as fsPromises } from "fs";

export default function browserExtension(pi: any) {
  // Register browser_open tool
  pi.registerTool({
    name: "browser_open",
    label: "Browser Open",
    description: "Opens a new browser page and optionally navigates to a URL.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
        },
      },
    },
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
  });

  // Register browser_navigate tool
  pi.registerTool({
    name: "browser_navigate",
    label: "Browser Navigate",
    description: "Navigates an existing browser page to a URL.",
    parameters: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
        },
        url: {
          type: "string",
          format: "uri",
        },
      },
      required: ["pageId", "url"],
    },
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
  });

  // Register browser_tabs tool
  pi.registerTool({
    name: "browser_tabs",
    label: "Browser Tabs",
    description: "Lists, activates, creates, or closes browser tabs.",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          enum: ["list", "activate", "new", "close"],
        },
        pageId: {
          type: "string",
        },
        url: {
          type: "string",
          format: "uri",
        },
      },
      required: ["command"],
    },
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
            },
          };
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
            },
          };
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
            },
          };
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
            },
          };
        }
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    },
  });

  // Register browser_screenshot tool
  pi.registerTool({
    name: "browser_screenshot",
    label: "Browser Screenshot",
    description: "Takes a screenshot of a browser page and saves it to the screenshots directory.",
    parameters: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
        },
        fullPage: {
          type: "boolean",
        },
        filename: {
          type: "string",
        },
      },
      required: ["pageId"],
    },
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
  });

  // Register browser_close tool
  pi.registerTool({
    name: "browser_close",
    label: "Browser Close",
    description: "Closes a browser page.",
    parameters: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
        },
      },
      required: ["pageId"],
    },
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
  });
}