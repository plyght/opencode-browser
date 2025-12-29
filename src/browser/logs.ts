import { writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { ConsoleMessage, NetworkRequest } from './session.js';

export class LogManager {
  private consoleLogFile: string;
  private networkLogFile: string;
  
  constructor(private logDir: string) {
    this.consoleLogFile = join(logDir, 'console.log');
    this.networkLogFile = join(logDir, 'network.log');
  }
  
  async initialize(): Promise<void> {
    if (!existsSync(this.logDir)) {
      await mkdir(this.logDir, { recursive: true });
    }
    
    await writeFile(this.consoleLogFile, '');
    await writeFile(this.networkLogFile, '');
  }
  
  async writeConsoleLogs(logs: ConsoleMessage[]): Promise<void> {
    const lines = logs.map((log) => {
      const timestamp = new Date(log.timestamp).toISOString();
      return `[${timestamp}] [${log.type.toUpperCase()}] ${log.text}`;
    });
    
    await writeFile(this.consoleLogFile, lines.join('\n') + '\n');
  }
  
  async appendConsoleLog(log: ConsoleMessage): Promise<void> {
    const timestamp = new Date(log.timestamp).toISOString();
    const line = `[${timestamp}] [${log.type.toUpperCase()}] ${log.text}\n`;
    await appendFile(this.consoleLogFile, line);
  }
  
  async writeNetworkLogs(requests: NetworkRequest[]): Promise<void> {
    const lines = requests.map((req) => {
      const timestamp = new Date(req.timestamp).toISOString();
      const status = req.status ? ` [${req.status}]` : '';
      return `[${timestamp}] ${req.method}${status} ${req.url}`;
    });
    
    await writeFile(this.networkLogFile, lines.join('\n') + '\n');
  }
  
  async appendNetworkRequest(request: NetworkRequest): Promise<void> {
    const timestamp = new Date(request.timestamp).toISOString();
    const status = request.status ? ` [${request.status}]` : '';
    const line = `[${timestamp}] ${request.method}${status} ${request.url}\n`;
    await appendFile(this.networkLogFile, line);
  }
  
  getConsoleLogPath(): string {
    return this.consoleLogFile;
  }
  
  getNetworkLogPath(): string {
    return this.networkLogFile;
  }
}
