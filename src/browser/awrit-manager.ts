import { spawn, type ChildProcess } from 'child_process';
import { join } from 'path';

export class AwritManager {
  private process: ChildProcess | null = null;
  private awritPath: string;
  private ready: boolean = false;

  constructor(awritPath?: string) {
    this.awritPath = awritPath || join(__dirname, '../../awrit/awrit');
  }

  async start(initialUrl?: string): Promise<void> {
    const args = ['--ipc'];
    if (initialUrl) {
      args.push(initialUrl);
    }

    this.process = spawn(this.awritPath, args, {
      stdio: ['pipe', 'inherit', 'inherit'],
    });

    if (!this.process.stdin) {
      throw new Error('Failed to open stdin pipe to awrit');
    }

    this.process.on('error', (error) => {
      console.error('awrit process error:', error);
    });

    this.process.on('exit', (code) => {
      console.error(`awrit process exited with code ${code}`);
      this.cleanup();
    });

    await this.waitForReady();
    this.ready = true;
  }

  private async waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  sendCommand(command: string, args: string[] = []): void {
    if (!this.process?.stdin || !this.ready) {
      console.error('awrit not ready or stdin not available');
      return;
    }

    const commandLine = [command, ...args].join(' ');
    this.process.stdin.write(`${commandLine}\n`);
  }

  navigate(url: string): void {
    this.sendCommand('navigate', [url]);
  }

  reload(): void {
    this.sendCommand('reload');
  }

  back(): void {
    this.sendCommand('back');
  }

  forward(): void {
    this.sendCommand('forward');
  }

  private cleanup(): void {
    this.process = null;
    this.ready = false;
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM');
      await new Promise((resolve) => {
        if (this.process) {
          this.process.on('exit', resolve);
        } else {
          resolve(null);
        }
      });
      this.cleanup();
    }
  }
}
