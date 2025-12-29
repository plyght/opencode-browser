# opencode-browser

Browser automation plugin for OpenCode - AI-controlled headless browser with pixel-perfect terminal display.

## Features

- **Headless Browser Automation** - Full Playwright-powered Chromium browser
- **Pixel-Perfect Terminal Display** - Screenshots rendered directly in your terminal via Kitty, Ghostty, iTerm2, or Sixel protocols
- **AI-Friendly Logging** - Console and network logs written to grep-able files  
- **Session Persistence** - Cookies and localStorage persist across sessions per workspace
- **11 Browser Control Tools** - Navigate, click, type, screenshot, evaluate JS, inspect storage, and more

## Installation

### 1. Install the plugin

```bash
bun add opencode-browser
```

### 2. Install Playwright browsers

```bash
bunx playwright install chromium
```

### 3. Add to OpenCode config

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-browser"]
}
```

### 4. Terminal Requirements

Your terminal must support graphics. Supported terminals:

- **Kitty** (recommended) - https://sw.kovidgoyal.net/kitty/
- **Ghostty** - https://ghostty.org/
- **iTerm2** (macOS) - https://iterm2.com/
- **WezTerm** - https://wezfurlong.org/wezterm/
- **Sixel-compatible terminals** (xterm, mlterm, yaft)

The plugin will automatically detect your terminal's capabilities.

## Usage

### Basic Commands

```
Navigate to a URL:
> @ai Navigate to localhost:3000

Click an element:
> @ai Click the submit button (selector: button#submit)

Type into an input:
> @ai Type "test@example.com" into the email field (selector: input#email)

Take a screenshot:
> @ai Take a screenshot of the current page

Get console logs:
> @ai Show me the console logs

Inspect network requests:
> @ai Show network requests for API calls
```

### Available Tools

The plugin exposes these tools to the AI:

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL with optional wait strategy |
| `browser_click` | Click an element using CSS selector |
| `browser_type` | Type text into an input field |
| `browser_screenshot` | Capture and display screenshot in terminal |
| `browser_console_logs` | Get console logs (written to file) |
| `browser_network_requests` | Get network requests (written to file) |
| `browser_evaluate` | Execute JavaScript in browser context |
| `browser_storage_get` | Get localStorage and sessionStorage |
| `browser_storage_set` | Set localStorage item |
| `browser_current_url` | Get current URL |
| `browser_clear_logs` | Clear console and network logs |

### Example Workflows

**Test a web form:**
```
> @ai Navigate to localhost:3000, fill out the login form with username "test" and password "demo", then click submit
```

**Debug console errors:**
```
> @ai Navigate to my-app.com, click around, then show me any console errors
```

**Inspect API calls:**
```
> @ai Load the dashboard and show me all POST requests to /api/
```

**Visual inspection:**
```
> @ai Navigate to homepage and take a screenshot
```

## How It Works

### Architecture

```
OpenCode AI Agent
       ↓
Browser Control Tools (this plugin)
       ↓
Playwright (headless Chromium)
       ↓
Terminal Graphics Protocol (Kitty/iTerm2/Sixel)
       ↓
Your Terminal (pixel-perfect screenshot display)
```

### Session Persistence

Each OpenCode workspace gets its own browser session stored at:

```
.opencode/browser/
├── session-state.json  # Cookies, localStorage, sessionStorage
└── logs/
    ├── console.log     # Browser console output
    └── network.log     # HTTP requests and responses
```

Sessions persist across plugin reloads, so you stay logged in.

### Log Management

Following Cursor's pattern, logs are written to files instead of dumped to the AI. This saves tokens and allows selective inspection:

```bash
grep "ERROR" .opencode/browser/logs/console.log
grep "POST.*api" .opencode/browser/logs/network.log
```

The AI can use OpenCode's `grep` tool to inspect logs selectively.

### Terminal Graphics Detection

The plugin tests for protocol support in this order:

1. **Kitty Graphics Protocol** (query-based detection - works for Kitty, Ghostty, etc.)
2. **iTerm2 Inline Images** (environment variable detection)
3. **Sixel** (terminal type detection)

If no graphics protocol is available, the plugin will error with helpful installation instructions.

## Development

### Build

```bash
bun run build
```

### Project Structure

```
src/
├── index.ts              # Main plugin entry point
├── browser/
│   ├── session.ts        # BrowserSessionManager (Playwright)
│   └── logs.ts           # LogManager (file-based logging)
├── terminal/
│   ├── graphics.ts       # Graphics protocol detection
│   └── display.ts        # TerminalDisplay (screenshot rendering)
└── tools/
    └── browser-tools.ts  # Tool definitions for OpenCode
```

## Troubleshooting

### "Terminal graphics not supported"

Your terminal doesn't support inline graphics. Install Kitty, Ghostty, or iTerm2.

### "Playwright browsers not installed"

Run: `bunx playwright install chromium`

### Screenshots not displaying

Check your terminal emulator supports graphics:

```bash
echo $TERM
echo $TERM_PROGRAM
```

For Kitty/Ghostty: should respond to graphics queries  
For iTerm2: `TERM_PROGRAM` should be `iTerm.app`

### Logs not appearing

Logs are written to `.opencode/browser/logs/`. Check file permissions.

## License

Apache-2.0

## Credits

Inspired by Cursor's browser feature. Built for OpenCode.
