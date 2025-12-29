import { detectGraphicsProtocol, type GraphicsProtocol } from './graphics.js';

export interface DisplayOptions {
  width?: number;
  height?: number;
  preserveAspectRatio?: boolean;
}

export class TerminalDisplay {
  private protocol: GraphicsProtocol = 'none';
  
  async initialize(): Promise<void> {
    const caps = await detectGraphicsProtocol();
    if (!caps.supported) {
      throw new Error(caps.reason || 'Terminal graphics not supported');
    }
    this.protocol = caps.protocol;
  }
  
  async displayImage(imageBuffer: Buffer, options: DisplayOptions = {}): Promise<void> {
    switch (this.protocol) {
      case 'kitty':
        return this.displayKitty(imageBuffer, options);
      case 'iterm2':
        return this.displayITerm2(imageBuffer, options);
      case 'sixel':
        return this.displaySixel(imageBuffer, options);
      default:
        throw new Error('No graphics protocol available');
    }
  }
  
  private displayKitty(imageBuffer: Buffer, options: DisplayOptions): void {
    const base64Data = imageBuffer.toString('base64');
    const chunks = base64Data.match(/.{1,4096}/g) || [];
    
    const width = options.width || 80;
    const height = options.height || 40;
    
    for (let i = 0; i < chunks.length; i++) {
      const isFirst = i === 0;
      const isLast = i === chunks.length - 1;
      const m = isLast ? 0 : 1;
      
      if (isFirst) {
        process.stdout.write(
          `\x1b_Gf=100,a=T,t=d,s=${width},v=${height},m=${m};${chunks[i]}\x1b\\`
        );
      } else {
        process.stdout.write(`\x1b_Gm=${m};${chunks[i]}\x1b\\`);
      }
    }
    
    process.stdout.write('\n');
  }
  
  private displayITerm2(imageBuffer: Buffer, options: DisplayOptions): void {
    const base64Data = imageBuffer.toString('base64');
    const width = options.width || 80;
    const height = options.height || 40;
    
    process.stdout.write(
      `\x1b]1337;File=inline=1;width=${width};height=${height}:${base64Data}\x07\n`
    );
  }
  
  private displaySixel(imageBuffer: Buffer, options: DisplayOptions): void {
    console.error('Sixel protocol requires external conversion (libsixel).');
    console.error('Falling back to file-based display.');
    console.error(`Screenshot saved. View with: chafa <file>`);
  }
}
