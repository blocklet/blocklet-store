import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { isFreeBlocklet } from '@blocklet/meta/lib/util';
import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import { Information } from 'mdi-material-ui';
import PropTypes from 'prop-types';
import { memo } from 'react';

import { parsePaymentPriceLabel } from '@blocklet/util';
import NP from 'number-precision';

import { getMeta } from '../../../libs/util';
import cssMap from './style';

function ShowPrice({ rowData = {}, isAdmin }) {
  const meta = getMeta(rowData, { isAdmin });
  const { t } = useLocaleContext();
  const isFree = isFreeBlocklet(meta);
  const priceList = meta?.payment?.price || [];
  const price = parsePaymentPriceLabel(meta?.pricing);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1,
      }}>
      <span> {isFree ? t('common.free') : `${price}`}</span>
      {!isFree && meta?.payment?.share?.length ? (
        <Tooltip title={<PayDetail meta={meta} priceList={priceList} />} arrow>
          <SvgIcon component={Information} className="left" css={cssMap.icon} />
        </Tooltip>
      ) : null}
    </Box>
  );
}
ShowPrice.propTypes = {
  rowData: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

const PayDetail = memo(({ meta, priceList }) => {
  const formatShare = (value) => `${value * 100}%`;
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {meta.payment?.share.map((item) => (
        <li key={item.address}>
          {item.name}: {formatShare(item.value)}
          &nbsp;(
          {priceList.map((i) => `${NP.times(i.value, item.value)} ${i.symbol}`).join(' + ')})
        </li>
      ))}
    </ul>
  );
});

PayDetail.propTypes = {
  meta: PropTypes.object.isRequired,
  priceList: PropTypes.array.isRequired,
};

export default ShowPrice;
