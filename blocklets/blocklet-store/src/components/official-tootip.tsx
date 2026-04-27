import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

export default function OfficialTooltip() {
  const { t } = useLocaleContext();
  return t('blocklet.isOfficial');
}
