import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Tabs from '@arcblock/ux/lib/Tabs';
import { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import { hasComponent } from '../../../libs/blocklet';
import { getUrlPrefix } from '../../../libs/util';
import { TABS } from './constant';

export default function TabsComponent({
  tab,
  isFree,
  isNFTFactory,
}: {
  tab: string;
  isFree: boolean;
  isNFTFactory: boolean;
}) {
  const { t } = useContext(LocaleContext);
  const { did, version = '' } = useParams();
  const navigate = useNavigate();
  const { prefix } = getUrlPrefix();

  const hasPayment = hasComponent('z2qaCNvKMv5GjouKdcDWexv6WqtHbpNPQDnAk');
  const hasComment = hasComponent('did-comments');

  const tabs = [{ value: TABS.INFO, label: t('blocklet.detail') }];

  if (hasComment) {
    tabs.push({ value: TABS.COMMENTS, label: t('blocklet.comments') });
  }

  tabs.push({ value: TABS.VERSION, label: t('blocklet.versionList') });

  if (isNFTFactory && !isFree) {
    tabs.push({ value: TABS.PURCHASE, label: t('blocklet.purchaseList') });
  }
  if (hasPayment) {
    tabs.push({ value: TABS.PAYMENTS, label: t('blocklet.payments') });
  }

  return (
    <Tabs
      // @ts-ignore
      tabs={tabs}
      current={tab as string}
      sx={{
        '& .index-tab': {
          fontWeight: 'fontWeightRegular',
        },
        '& .Mui-selected': {
          fontWeight: 'fontWeightMedium',
          color: 'text.primary',
        },
        borderBottom: 1,
        borderColor: 'divider',
      }}
      onChange={(v) => {
        navigate(withQuery(joinURL(prefix, 'blocklets', did!, version), { tab: v }), { replace: true });
        return {};
      }}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    />
  );
}
