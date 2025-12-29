export type GraphicsProtocol = 'kitty' | 'iterm2' | 'sixel' | 'none';

interface GraphicsCapabilities {
  protocol: GraphicsProtocol;
  supported: boolean;
  reason?: string;
}

export async function detectGraphicsProtocol(): Promise<GraphicsCapabilities> {
  if (await supportsKittyGraphics()) {
    return { protocol: 'kitty', supported: true };
  }
  
  if (supportsITerm2Graphics()) {
    return { protocol: 'iterm2', supported: true };
  }
  
  if (supportsSixelGraphics()) {
    return { protocol: 'sixel', supported: true };
  }
  
  return {
    protocol: 'none',
    supported: false,
    reason: 'No supported graphics protocol detected. Please use Kitty, Ghostty, iTerm2, or a Sixel-compatible terminal.'
  };
}

async function supportsKittyGraphics(): Promise<boolean> {
  if (!process.stdout.isTTY) return false;
  
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve(false);
    }, 100);
    
    let response = '';
    
    const onData = (data: Buffer) => {
      response += data.toString();
      if (response.includes('\x1b_Gi=')) {
        cleanup();
        resolve(true);
      }
    };
    
    const cleanup = () => {
      clearTimeout(timeout);
      process.stdin.removeListener('data', onData);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    };
    
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('data', onData);
    
    process.stdout.write('\x1b_Gi=31,s=1,v=1,a=q,t=d,f=24;AAAA\x1b\\\x1b[c');
  });
}

function supportsITerm2Graphics(): boolean {
  return process.env.TERM_PROGRAM === 'iTerm.app' || 
         process.env.LC_TERMINAL === 'iTerm2';
}

function supportsSixelGraphics(): boolean {
  const term = process.env.TERM || '';
  const xtermVersion = process.env.XTERM_VERSION || '';
  
  return term.includes('xterm') || 
         term.includes('mlterm') ||
         term.includes('yaft') ||
         xtermVersion.length > 0;
}

export function validateTerminalSupport(): void {
  detectGraphicsProtocol().then((caps) => {
    if (!caps.supported) {
      console.error('\n❌ Terminal Graphics Not Supported\n');
      console.error(caps.reason);
      console.error('\nRecommended terminals:');
      console.error('  • Kitty: https://sw.kovidgoyal.net/kitty/');
      console.error('  • Ghostty: https://ghostty.org/');
      console.error('  • iTerm2: https://iterm2.com/ (macOS)');
      console.error('  • WezTerm: https://wezfurlong.org/wezterm/\n');
      process.exit(1);
    }
  });
}
