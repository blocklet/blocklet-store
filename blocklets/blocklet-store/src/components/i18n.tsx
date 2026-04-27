import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

const I18n = ({ translateKey, options }: { translateKey: string; options?: Record<string, string> }) => {
  const { t } = useLocaleContext();

  return t(translateKey, options);
};

export default I18n;
