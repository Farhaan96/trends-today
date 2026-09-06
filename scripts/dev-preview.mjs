// Accept the standard Sites preview flags while retaining the Next.js runtime.
const args = process.argv.slice(2).filter((arg) => arg !== '--strictPort');
const normalized = args.map((arg) => (arg === '--host' ? '--hostname' : arg));
process.argv = [process.execPath, 'next', 'dev', '--turbopack', ...normalized];
await import('next/dist/bin/next');
