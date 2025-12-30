import type { Plugin } from '@opencode-ai/plugin';
import { BrowserSessionManager } from './browser/session.js';
import { LogManager } from './browser/logs.js';
import { createBrowserTools } from './tools/browser-tools.js';
import { join } from 'path';

export const BrowserPlugin: Plugin = async ({ project, directory, worktree }) => {
  const workspaceDir = worktree || directory;
  const logDir = join(workspaceDir, '.opencode', 'browser', 'logs');
  
  const session = new BrowserSessionManager({
    workspaceDir,
    viewport: { width: 1920, height: 1080 }
  });
  
  const logManager = new LogManager(logDir);
  
  await logManager.initialize();
  await session.initialize();
  
  const tools = createBrowserTools(session, logManager);
  
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
    },
    
    'ui.browser.register': async () => {
      const cdpUrl = session.getCdpUrl();
      if (!cdpUrl) {
        throw new Error('Browser CDP URL not available');
      }
      
      return {
        id: 'browser-0',
        label: 'Browser',
        cdpUrl,
        initialUrl: 'about:blank'
      };
    },
    
    'ui.browser.update': async ({ browserId }: { browserId: string }) => {
      const url = session.getCurrentUrl() || 'about:blank';
      const title = await session.getTitle() || '';
      const loading = session.isLoading();
      const canGoBack = await session.canGoBack();
      const canGoForward = await session.canGoForward();
      
      return {
        url,
        title,
        loading,
        canGoBack,
        canGoForward
      };
    },
    
    'ui.browser.screenshot': async ({ browserId, width, height }: { browserId: string; width: number; height: number }) => {
      const data = await session.screenshot(false);
      
      return {
        data,
        format: 'png' as const
      };
    }
  };
};

export default BrowserPlugin;
