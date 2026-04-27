import DID from '@arcblock/ux/lib/DID';
import { useTheme } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import NP from 'number-precision';
import { joinURL } from 'ufo';

import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import PropTypes from 'prop-types';

function ShowSplitContract({ data, chainUrl, ...rest }) {
  const theme = useTheme();
  const { locale } = useLocaleContext();
  return (
    <TableContainer {...rest} sx={{ 'td, th': { border: 0 }, border: `1px ${theme.palette.divider} solid` }}>
      <Table sx={{ minWidth: 300 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {row.accountName}
              </TableCell>
              <TableCell>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={joinURL(chainUrl, '/explorer/accounts/', row.accountAddress)}
                  aria-label="explore accouts">
                  <DID
                    style={{ lineHeight: 'initial' }}
                    responsive={false}
                    compact
                    size={16}
                    did={row.accountAddress}
                    showQrcode
                    locale={locale}
                  />
                </a>
              </TableCell>
              <TableCell>{`${NP.strip(row.amount)} ${row.symbol}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ShowSplitContract.propTypes = {
  data: PropTypes.array.isRequired,
  chainUrl: PropTypes.string.isRequired,
};

export default ShowSplitContract;
