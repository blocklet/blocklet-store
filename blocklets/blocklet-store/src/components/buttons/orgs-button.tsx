import OrgTransfer from '@arcblock/ux/lib/OrgTransfer';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { IBlockletButton } from '../../type';
import SafeButton from '../safe-button';

interface Props extends IBlockletButton {
  org: any;
}

export default function OrgsButton({ blocklet, org, onSuccess, ...rest }: Props) {
  const { t, locale } = useLocaleContext();

  return (
    <OrgTransfer buttonProps={rest as any} org={org} resourceId={blocklet.id} locale={locale} onSuccess={onSuccess}>
      <SafeButton {...rest}>{t('blocklet.changeOrg')}</SafeButton>
    </OrgTransfer>
  );
}
