# OpenCode Browser

AI-controlled browser automation with live visual feedback and persistent sessions. Extends OpenCode agents with 11 browser control tools built on Playwright.

## Overview

OpenCode Browser bridges the gap between AI agents and the web by providing programmatic browser control with real-time visibility. While traditional automation runs headless, this plugin maintains a visible browser window alongside optional terminal graphics, giving both AI and human operators immediate visual feedback. Session state persists across workspaces, allowing agents to maintain context through authentication flows and multi-step workflows.

## Features

- **Live Browser Window**: Full Playwright-powered Chromium browser visible during automation
- **Persistent Sessions**: Cookies, localStorage, and sessionStorage persist per workspace
- **Terminal Graphics**: Screenshots render in-terminal via Kitty, Ghostty, iTerm2, or Sixel protocols
- **File-Based Logging**: Console and network logs written to grep-able files instead of dumped to AI
- **11 Control Tools**: Navigate, click, type, screenshot, evaluate JS, inspect storage, and more
- **Cross-Platform**: Works on macOS, Linux, and BSD variants
- **Zero Configuration**: Automatic graphics protocol detection and fallback

## Installation

```bash
bun add opencode-browser
bunx playwright install chromium
```

Add to OpenCode configuration:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-browser"]
}
```

For terminal screenshot rendering, use a supported terminal:
- Kitty (recommended)
- Ghostty
- iTerm2 (macOS)
- WezTerm
- Sixel-compatible terminals (xterm, mlterm, yaft)

## Usage

All tools are exposed to the AI agent automatically. Example commands:

```
Navigate to localhost:3000
Click the submit button (selector: button#submit)
Type "test@example.com" into email field (selector: input#email)
Take a screenshot of the current page
Show me the console logs
Show network requests for API calls
```

Available tools:

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to URL with optional wait strategy |
| `browser_click` | Click element using CSS selector |
| `browser_type` | Type text into input field |
| `browser_screenshot` | Capture screenshot |
| `browser_console_logs` | Get console logs |
| `browser_network_requests` | Get network requests |
| `browser_evaluate` | Execute JavaScript in context |
| `browser_storage_get` | Get localStorage and sessionStorage |
| `browser_storage_set` | Set localStorage item |
| `browser_current_url` | Get current URL |
| `browser_clear_logs` | Clear console and network logs |

## Architecture

```
OpenCode AI Agent
       ↓
Browser Control Tools
       ↓
Playwright (Chromium headed mode)
       ↓
Live Browser Window + Optional Terminal Graphics
```

Session data stored at:

```
.opencode/browser/
├── session-state.json  # Cookies, localStorage, sessionStorage
└── logs/
    ├── console.log     # Browser console output
    └── network.log     # HTTP requests and responses
```

Logs are file-based following Cursor's pattern: written to disk for selective inspection rather than dumped to AI context. Agents can use OpenCode's `grep` tool to inspect logs.

Graphics protocol detection order:
1. Kitty Graphics Protocol (query-based)
2. iTerm2 Inline Images (environment variables)
3. Sixel (terminal type detection)

## Configuration

No configuration required. The plugin automatically detects workspace directory and terminal capabilities.

Optional environment variables:
- `TERM`: Terminal type for Sixel detection
- `TERM_PROGRAM`: Terminal program for iTerm2 detection

## Development

```bash
bun run build
bun test
```

Project structure:

- `src/index.ts`: Plugin entry point and lifecycle hooks
- `src/browser/session.ts`: BrowserSessionManager (Playwright wrapper)
- `src/browser/logs.ts`: LogManager (file-based logging)
- `src/tools/browser-tools.ts`: Tool definitions for OpenCode

Requires Bun 1.0+, TypeScript 5.7+. Key dependencies: @opencode-ai/plugin, playwright.

## License

Apache-2.0
