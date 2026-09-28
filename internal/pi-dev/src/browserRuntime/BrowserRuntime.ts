import { chromium, BrowserContext, Page } from 'playwright';
import * as os from 'os';
import * as path from 'path';
import { promises as fsPromises } from 'fs';

export class BrowserError extends Error {
  public readonly type: BrowserErrorType;
  constructor(message: string, type: BrowserErrorType) {
    super(message);
    this.type = type;
    // Maintains proper stack trace (only available on V8)
    // @ts-ignore
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BrowserError);
    }
  }
}

export const BrowserErrorType = {
  BROWSER_START_FAILED: 'BROWSER_START_FAILED' as const,
  BROWSER_NOT_STARTED: 'BROWSER_NOT_STARTED' as const,
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND' as const,
  PAGE_CLOSED: 'PAGE_CLOSED' as const,
  BROWSER_STOP_FAILED: 'BROWSER_STOP_FAILED' as const,
} as const;

export type BrowserErrorType = typeof BrowserErrorType[keyof typeof BrowserErrorType];

export class BrowserRuntime {
  private _context: BrowserContext | null = null;
  private _pages: Map<string, Page> = new Map();
  private _activePageId: string | null = null;
  private _pageCounter: number = 0;
  private _pendingPromise: Promise<any> = Promise.resolve();

  private async _withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this._pendingPromise;
    this._pendingPromise = (async () => {
      try {
        return await fn();
      } finally {
        this._pendingPromise = Promise.resolve();
      }
    })();
    return await this._pendingPromise;
  }

  /**
   * Start the browser runtime with a persistent context.
   * @param options - Optional configuration
   * @param options.headless - Whether to run in headless mode. Defaults to true, can be overridden by PI_BROWSER_HEADLESS=false
   */
  async start(options: { headless?: boolean } = {}): Promise<void> {
    return await this._withLock(async () => {
      if (this._context !== null) {
        // Already started, consider it a no-op for idempotency.
        return;
      }

      try {
        const headless = options.headless ?? (process.env.PI_BROWSER_HEADLESS === 'false' ? false : true);

        // Define the profile directory
        const userHome = os.homedir();
        const profileDir = path.join(userHome, '.pi-personal', 'browser', 'profiles', 'default');

        // Ensure the directory structure exists
        const dirsToCreate = [
          path.join(userHome, '.pi-personal', 'browser', 'profiles', 'default'),
          path.join(userHome, '.pi-personal', 'browser', 'downloads'),
          path.join(userHome, '.pi-personal', 'browser', 'screenshots'),
          path.join(userHome, '.pi-personal', 'browser', 'artifacts'),
        ];

        await Promise.all(
          dirsToCreate.map((dir) => fsPromises.mkdir(dir, { recursive: true }))
        );

        this._context = await chromium.launchPersistentContext(profileDir, {
          headless,
          // Set downloads path
          downloadsPath: path.join(userHome, '.pi-personal', 'browser', 'downloads'),
        });

        // Optionally, we could set up some default behavior, but we keep it minimal.
      } catch (err) {
        this._context = null;
        throw new BrowserError(
          `Failed to start browser: ${err instanceof Error ? err.message : String(err)}`,
          BrowserErrorType.BROWSER_START_FAILED
        );
      }
    });
  }

  /**
   * Stop the browser runtime and close the context.
   */
  async stop(): Promise<void> {
    return await this._withLock(async () => {
      if (this._context === null) {
        // Already stopped, idempotent
        return;
      }

      try {
        await this._context.close();
      } catch (err) {
        // Even if close fails, we want to clean up state
        this._context = null;
        this._pages.clear();
        this._activePageId = null;
        throw new BrowserError(
          `Failed to stop browser: ${err instanceof Error ? err.message : String(err)}`,
          BrowserErrorType.BROWSER_STOP_FAILED
        );
      } finally {
        // Clean up state regardless of close success
        this._context = null;
        this._pages.clear();
        this._activePageId = null;
      }
    });
  }

  /**
   * Get the current browser context.
   * @returns The browser context or null if not started
   */
  getContext(): BrowserContext | null {
    // Reading _context is atomic (it's a reference assignment).
    return this._context;
  }

  /**
   * Create a new page.
   * @param options - Optional navigation options
   * @param options.url - If provided, navigate to this URL after creating the page
   * @returns The page ID
   */
  async newPage(options: { url?: string } = {}): Promise<string> {
    return await this._withLock(async () => {
      if (this._context === null) {
        throw new BrowserError('Browser runtime has not been started', BrowserErrorType.BROWSER_NOT_STARTED);
      }

      try {
        const page = await this._context.newPage();
        this._pageCounter++;
        const pageId = `page-${this._pageCounter}`;
        this._pages.set(pageId, page);

        // Set as active page
        this._activePageId = pageId;

        if (options.url) {
          await page.goto(options.url, { waitUntil: 'domcontentloaded' });
        }

        return pageId;
      } catch (err) {
        throw new BrowserError(
          `Failed to create new page: ${err instanceof Error ? err.message : String(err)}`,
          BrowserErrorType.BROWSER_START_FAILED
        );
      }
    });
  }

  /**
   * Get a page by its ID.
   * @param pageId - The page ID
   * @returns The page instance or null if not found
   */
  getPage(pageId: string): Page | null {
    // Reading from a Map for a single key is atomic.
    return this._pages.get(pageId) ?? null;
  }

  /**
   * List all pages with their metadata.
   * @returns Array of page info objects
   */
  async listPages(): Promise<Array<{ pageId: string; url: string; title: string; isActive: boolean }>> {
    return await this._withLock(async () => {
      const result: Array<{ pageId: string; url: string; title: string; isActive: boolean }> = [];

      for (const [pageId, page] of this._pages.entries()) {
        try {
          const url = page.url(); // synchronous, returns string
          const title = await page.title(); // asynchronous, returns Promise<string>
            result.push({
              pageId,
              url,
              title,
              isActive: pageId === this._activePageId,
            });
        } catch (err) {
          // If the page is closed, accessing url/title might throw.
          // We skip closed pages.
          continue;
        }
      }

      return result;
    });
  }

  /**
   * Set the active page by its ID.
   * @param pageId - The page ID to set as active
   * @returns A promise that resolves when the operation completes.
   */
  async setActivePage(pageId: string): Promise<void> {
    return await this._withLock(async () => {
      if (!this._pages.has(pageId)) {
        throw new BrowserError(`Page not found: ${pageId}`, BrowserErrorType.PAGE_NOT_FOUND);
      }
      this._activePageId = pageId;
    });
  }

  /**
   * Get the ID of the currently active page.
   * @returns The active page ID or null if none
   */
  getActivePage(): string | null {
    // Reading _activePageId is atomic (it's a reference assignment for string or null).
    return this._activePageId;
  }

  /**
   * Close a page by its ID.
   * @param pageId - The page ID to close
   */
  async closePage(pageId: string): Promise<void> {
    return await this._withLock(async () => {
      const page = this._pages.get(pageId);
      if (!page) {
        throw new BrowserError(`Page not found: ${pageId}`, BrowserErrorType.PAGE_NOT_FOUND);
      }

      try {
        await page.close();
      } finally {
        // Remove from map regardless of close success
        this._pages.delete(pageId);
        // If the closed page was active, reset active page
        if (this._activePageId === pageId) {
          this._activePageId = null;
          // Optionally, we could set the most recently created page as active, but we leave it to the user.
        }
      }
    });
  }
}

// Export a default instance for singleton-like usage
export const browserRuntime = new BrowserRuntime();