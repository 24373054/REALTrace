import { useAppStore } from '../stores/app';
import { locales } from '../i18n';

export function useI18n() {
  const locale = useAppStore(s => s.locale);
  const dict = locales[locale];
  return { t: dict, locale };
}
