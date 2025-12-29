import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export interface SessionConfig {
  workspaceDir: string;
  headless?: boolean;
  viewport?: { width: number; height: number };
}

export interface ConsoleMessage {
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
  text: string;
  timestamp: number;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  timestamp: number;
}

export class BrowserSessionManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private sessionDir: string;
  private stateFile: string;
  private consoleLogs: ConsoleMessage[] = [];
  private networkRequests: NetworkRequest[] = [];
  
  constructor(private config: SessionConfig) {
    this.sessionDir = join(config.workspaceDir, '.opencode', 'browser');
    this.stateFile = join(this.sessionDir, 'session-state.json');
  }
  
  async initialize(): Promise<void> {
    if (!existsSync(this.sessionDir)) {
      await mkdir(this.sessionDir, { recursive: true });
    }
    
    this.browser = await chromium.launch({
      headless: this.config.headless ?? true
    });
    
    let storageState;
    try {
      const data = await readFile(this.stateFile, 'utf-8');
      storageState = JSON.parse(data);
    } catch {}
    
    this.context = await this.browser.newContext({
      storageState,
      viewport: this.config.viewport || { width: 1920, height: 1080 }
    });
    
    this.page = await this.context.newPage();
    this.setupListeners();
  }
  
  private setupListeners(): void {
    if (!this.page) return;
    
    this.page.on('console', (msg) => {
      const consoleMsg: ConsoleMessage = {
        type: msg.type() as ConsoleMessage['type'],
        text: msg.text(),
        timestamp: Date.now()
      };
      this.consoleLogs.push(consoleMsg);
    });
    
    this.page.on('request', (request) => {
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    
    this.page.on('response', (response) => {
      const existing = this.networkRequests.find(
        (r) => r.url === response.url() && !r.status
      );
      if (existing) {
        existing.status = response.status();
      }
    });
  }
  
  async navigate(url: string, waitUntil: 'load' | 'networkidle' = 'load'): Promise<void> {
    if (!this.page) throw new Error('Session not initialized');
    await this.page.goto(url, { waitUntil });
  }
  
  async click(selector: string): Promise<void> {
    if (!this.page) throw new Error('Session not initialized');
    await this.page.click(selector);
  }
  
  async type(selector: string, text: string): Promise<void> {
    if (!this.page) throw new Error('Session not initialized');
    await this.page.fill(selector, text);
  }
  
  async screenshot(fullPage: boolean = false): Promise<Buffer> {
    if (!this.page) throw new Error('Session not initialized');
    return await this.page.screenshot({ fullPage });
  }
  
  async evaluate(script: string): Promise<any> {
    if (!this.page) throw new Error('Session not initialized');
    return await this.page.evaluate(script);
  }
  
  async getStorageState(): Promise<Record<string, any>> {
    if (!this.page) throw new Error('Session not initialized');
    
    return await this.page.evaluate(() => {
      const local = Object.fromEntries(Object.entries(window.localStorage));
      const session = Object.fromEntries(Object.entries(window.sessionStorage));
      return { localStorage: local, sessionStorage: session };
    });
  }
  
  async setStorageItem(key: string, value: string): Promise<void> {
    if (!this.page) throw new Error('Session not initialized');
    await this.page.evaluate(
      ({ k, v }) => window.localStorage.setItem(k, v),
      { k: key, v: value }
    );
  }
  
  getConsoleLogs(filter?: ConsoleMessage['type']): ConsoleMessage[] {
    if (filter) {
      return this.consoleLogs.filter((log) => log.type === filter);
    }
    return this.consoleLogs;
  }
  
  getNetworkRequests(urlFilter?: string): NetworkRequest[] {
    if (urlFilter) {
      return this.networkRequests.filter((req) => req.url.includes(urlFilter));
    }
    return this.networkRequests;
  }
  
  clearLogs(): void {
    this.consoleLogs = [];
    this.networkRequests = [];
  }
  
  async saveSession(): Promise<void> {
    if (!this.context) return;
    const state = await this.context.storageState();
    await writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }
  
  async close(): Promise<void> {
    await this.saveSession();
    await this.browser?.close();
    this.browser = null;
    this.context = null;
    this.page = null;
  }
  
  getCurrentUrl(): string | null {
    return this.page?.url() || null;
  }
  
  async getTitle(): Promise<string | null> {
    return this.page?.title() || null;
  }
}
