import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import NP from 'number-precision';
import Popover from '@mui/material/Popover';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { useState } from 'react';

function ShowComponentPrice({ data, symbol, ...rest }) {
  const { t } = useLocaleContext();
  const formatShare = (value) => `${value * 100}%`;
  const getPrice = (row) => {
    if (row.type === 'fixed') return `${NP.strip(row.value)} ${symbol}`;
    return `${formatShare(row.value)}* ${t('blockletDetail.componentPrice.combinedPrice')}`;
  };
  const showPriceRange = (parentPriceRange) => {
    // 当不指定 parentPriceRange 时，表示默认的分成方式
    if (!parentPriceRange) {
      return t('common.default');
    }
    if (parentPriceRange.length > 0) {
      return parentPriceRange.join('~');
    }
    return '';
  };
  return (
    <TableContainer {...rest} sx={{ 'td, th': { border: 0 } }}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>{t('blockletDetail.componentPrice.combinedPriceRange')}</TableCell>
            <TableCell>{t('blockletDetail.componentPrice.pricePattern')}</TableCell>
            <TableCell>{t('blockletDetail.componentPrice.price')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {showPriceRange(row.parentPriceRange)}
              </TableCell>
              <TableCell>{t(`blockletDetail.componentPrice.${row.type}`)}</TableCell>
              <TableCell>{getPrice(row)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ShowComponentPrice.propTypes = {
  data: PropTypes.array.isRequired,
  symbol: PropTypes.string.isRequired,
};

function AddComponentInfo({ payment }) {
  const { componentPrice = [], price = [] } = payment;
  const [anchorEl, setAnchorEl] = useState(null);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  // 一定是付费组件，所以一定有价格
  const { symbol } = price[0];
  // 没有定义 Blocklet 被组合时的售价时返回 null
  if (componentPrice.length === 0) {
    return null;
  }

  return (
    <StyledContainer>
      <div className="append" onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
        <InfoOutlinedIcon fontSize="small" className="add-component__info" />
      </div>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus>
        <ShowComponentPrice data={componentPrice} symbol={symbol} />
      </Popover>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  & {
    display: flex;
  }
  .MuiTooltip-tooltip {
    background-color: red !important;
  }
  .append {
    display: flex;
    min-width: 0;
    align-items: center;
    margin-left: 5px;
    cursor: pointer;
    .add-component__info {
      color: ${(props) => props.theme.palette.grey[700]};
      opacity: 0.5;
    }
    &:hover {
      .add-component__info {
        opacity: 1;
      }
    }
  }
`;

AddComponentInfo.propTypes = {
  payment: PropTypes.array.isRequired,
};

export default AddComponentInfo;
