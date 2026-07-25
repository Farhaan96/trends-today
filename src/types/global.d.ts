export {};

declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag: (...args: unknown[]) => void;
    __trendsTodayGaMeasurementId?: string;
    clarity: (method: string, ...args: any[]) => void;
    fbq: (method: string, ...args: any[]) => void;
  }
}
