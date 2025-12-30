import { tool } from '@opencode-ai/plugin';
import type { BrowserSessionManager } from '../browser/session.js';
import type { LogManager } from '../browser/logs.js';

export function createBrowserTools(
  session: BrowserSessionManager,
  logManager: LogManager
) {
  return {
    browser_navigate: tool({
      description: 'Navigate the browser to a URL. Waits for page load by default.',
      args: {
        url: tool.schema.string().url().describe('The URL to navigate to'),
        waitUntil: tool.schema
          .enum(['load', 'networkidle'])
          .optional()
          .describe('Wait strategy: load (default) or networkidle')
      },
      async execute(args) {
        await session.navigate(args.url, args.waitUntil || 'load');
        const title = await session.getTitle();
        return `Navigated to ${args.url}\nPage title: ${title}`;
      }
    }),

    browser_click: tool({
      description: 'Click an element on the page using a CSS selector.',
      args: {
        selector: tool.schema.string().describe('CSS selector for the element to click')
      },
      async execute(args) {
        await session.click(args.selector);
        return `Clicked element: ${args.selector}`;
      }
    }),

    browser_type: tool({
      description: 'Type text into an input field using a CSS selector.',
      args: {
        selector: tool.schema.string().describe('CSS selector for the input element'),
        text: tool.schema.string().describe('Text to type into the input')
      },
      async execute(args) {
        await session.type(args.selector, args.text);
        return `Typed into ${args.selector}`;
      }
    }),

    browser_screenshot: tool({
      description: 'Capture a screenshot of the current page. Screenshot is rendered in OpenCode UI.',
      args: {
        fullPage: tool.schema
          .boolean()
          .optional()
          .describe('Capture the full scrollable page (default: false)')
      },
      async execute(args) {
        const screenshot = await session.screenshot(args.fullPage || false);
        return `Screenshot captured (${screenshot.length} bytes)\nRendered in OpenCode UI browser panel.`;
      }
    }),

    browser_console_logs: tool({
      description: 'Get console logs from the browser. Returns path to log file for grep inspection.',
      args: {
        filter: tool.schema
          .enum(['log', 'info', 'warn', 'error', 'debug'])
          .optional()
          .describe('Filter logs by type')
      },
      async execute(args) {
        const logs = session.getConsoleLogs(args.filter);
        await logManager.writeConsoleLogs(logs);
        
        const logPath = logManager.getConsoleLogPath();
        return `Console logs written to: ${logPath}\nTotal logs: ${logs.length}\n\nUse grep tool to inspect: grep "ERROR" ${logPath}`;
      }
    }),

    browser_network_requests: tool({
      description: 'Get network requests from the browser. Returns path to log file for grep inspection.',
      args: {
        urlFilter: tool.schema
          .string()
          .optional()
          .describe('Filter requests by URL substring')
      },
      async execute(args) {
        const requests = session.getNetworkRequests(args.urlFilter);
        await logManager.writeNetworkLogs(requests);
        
        const logPath = logManager.getNetworkLogPath();
        return `Network logs written to: ${logPath}\nTotal requests: ${requests.length}\n\nUse grep tool to inspect: grep "POST" ${logPath}`;
      }
    }),

    browser_evaluate: tool({
      description: 'Execute JavaScript code in the browser context and return the result.',
      args: {
        script: tool.schema.string().describe('JavaScript code to execute')
      },
      async execute(args) {
        const result = await session.evaluate(args.script);
        return `Result: ${JSON.stringify(result, null, 2)}`;
      }
    }),

    browser_storage_get: tool({
      description: 'Get localStorage and sessionStorage from the current page.',
      args: {},
      async execute() {
        const storage = await session.getStorageState();
        return `Storage state:\n${JSON.stringify(storage, null, 2)}`;
      }
    }),

    browser_storage_set: tool({
      description: 'Set a localStorage item on the current page.',
      args: {
        key: tool.schema.string().describe('localStorage key'),
        value: tool.schema.string().describe('Value to store')
      },
      async execute(args) {
        await session.setStorageItem(args.key, args.value);
        return `Set localStorage['${args.key}'] = '${args.value}'`;
      }
    }),

    browser_current_url: tool({
      description: 'Get the current URL of the browser.',
      args: {},
      async execute() {
        const url = session.getCurrentUrl();
        return `Current URL: ${url}`;
      }
    }),

    browser_clear_logs: tool({
      description: 'Clear console and network logs from memory.',
      args: {},
      async execute() {
        session.clearLogs();
        return 'Logs cleared';
      }
    }),

    browser_scroll: tool({
      description: 'Scroll the page by specified pixels. Positive values scroll down/right, negative scroll up/left. User sees this in awrit display.',
      args: {
        deltaX: tool.schema.number().describe('Horizontal scroll amount in pixels (positive = right, negative = left)').default(0),
        deltaY: tool.schema.number().describe('Vertical scroll amount in pixels (positive = down, negative = up)')
      },
      async execute(args) {
        await session.scroll(args.deltaX || 0, args.deltaY);
        return `Scrolled by (${args.deltaX || 0}, ${args.deltaY}) pixels`;
      }
    }),

    browser_scroll_to: tool({
      description: 'Scroll to absolute position on the page. User sees this in awrit display.',
      args: {
        x: tool.schema.number().describe('Horizontal position in pixels from left').default(0),
        y: tool.schema.number().describe('Vertical position in pixels from top')
      },
      async execute(args) {
        await session.scrollTo(args.x || 0, args.y);
        return `Scrolled to position (${args.x || 0}, ${args.y})`;
      }
    }),

    browser_scroll_to_element: tool({
      description: 'Scroll an element into view using CSS selector. User sees this in awrit display.',
      args: {
        selector: tool.schema.string().describe('CSS selector for the element to scroll into view')
      },
      async execute(args) {
        await session.scrollToElement(args.selector);
        return `Scrolled element ${args.selector} into view`;
      }
    }),

    browser_page_down: tool({
      description: 'Scroll down by one viewport height (page down). User sees this in awrit display.',
      args: {},
      async execute() {
        await session.scroll(0, 800);
        return 'Scrolled down one page';
      }
    }),

    browser_page_up: tool({
      description: 'Scroll up by one viewport height (page up). User sees this in awrit display.',
      args: {},
      async execute() {
        await session.scroll(0, -800);
        return 'Scrolled up one page';
      }
    })
  };
}
