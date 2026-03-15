import { zh } from './zh';
import { en } from './en';

export type Locale = 'zh' | 'en';
export const locales: Record<Locale, typeof zh> = { zh, en };
export { zh, en };

// Deep get helper for dot-notation keys (optional, we use direct access)
export function t(locale: Locale, section: keyof typeof zh, key: string): string {
  const dict = locales[locale] as any;
  return dict?.[section]?.[key] ?? key;
}
