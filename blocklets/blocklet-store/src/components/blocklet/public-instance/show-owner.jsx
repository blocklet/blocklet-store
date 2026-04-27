import { memo } from 'react';
import PropTypes from 'prop-types';

import DID from '@arcblock/ux/lib/DID';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

function ShowOwner({ ownerDid = '' }) {
  const { locale } = useLocaleContext();
  return <DID compact did={ownerDid} showQrcode locale={locale} />;
}
ShowOwner.propTypes = {
  ownerDid: PropTypes.string,
};

export default memo(ShowOwner);
