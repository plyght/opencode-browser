import type { Plugin } from '@opencode-ai/plugin';
import { BrowserSessionManager } from './browser/session.js';
import { TerminalDisplay } from './terminal/display.js';
import { LogManager } from './browser/logs.js';
import { createBrowserTools } from './tools/browser-tools.js';
import { join } from 'path';

export const BrowserPlugin: Plugin = async ({ project, directory, worktree }) => {
  const workspaceDir = worktree || directory;
  const logDir = join(workspaceDir, '.opencode', 'browser', 'logs');
  
  const session = new BrowserSessionManager({
    workspaceDir,
    headless: true,
    viewport: { width: 1920, height: 1080 }
  });
  
  const display = new TerminalDisplay();
  const logManager = new LogManager(logDir);
  
  try {
    await display.initialize();
  } catch (error) {
    console.error('Failed to initialize terminal display:', error);
    throw error;
  }
  
  await logManager.initialize();
  await session.initialize();
  
  const tools = createBrowserTools(session, display, logManager);
  
  return {
    tool: tools,
    
    event: async ({ event }) => {
      if (event.type === 'session.idle') {
        await session.saveSession();
      }
      
      if (event.type === 'session.deleted') {
        await session.close();
      }
    },
    
    'tui.prompt.append': async (input: any, output: any) => {
      const url = session.getCurrentUrl();
      if (url) {
        output.prompt += `\n\nBrowser context: Currently viewing ${url}`;
      }
    }
  };
};

export default BrowserPlugin;
