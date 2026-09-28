// We can reuse the BrowserErrorType from the BrowserRuntime for consistency.
// However, to avoid importing from a different directory in the tool implementation,
// we can define the same error types here or import them.

// Let's import the BrowserErrorType from the BrowserRuntime.
// The path from this file to the BrowserRuntime is: ../browserRuntime/BrowserRuntime.ts
import { BrowserErrorType } from "../browserRuntime/BrowserRuntime";

// We can also define a BrowserToolError class if needed, but we can just use the BrowserErrorType
// and return it in the details of the AgentToolResult.

// For now, we'll just export the BrowserErrorType for use in the tools.
export { BrowserErrorType };