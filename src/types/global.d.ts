export {};

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
    clarity: (method: string, ...args: any[]) => void
    fbq: (method: string, ...args: any[]) => void
  }
}

