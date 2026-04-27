import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import { Cancel, Lock, NoteOutline } from 'mdi-material-ui';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { getDisplayName, getMeta } from '../../../libs/util';
import Ellipsis from '../../ellipsis';
import ShowLogo from './show-logo';
import cssMap from './style';

function ShowTitle({ rowData = {}, isAdmin }) {
  const meta = getMeta(rowData, { isAdmin });
  const { t } = useLocaleContext();

  return (
    <Box css={cssMap.title}>
      <ShowLogo rowData={rowData} isAdmin={isAdmin} />
      <Ellipsis value={meta?.title || meta?.name}>
        {rowData.currentVersion ? (
          <Link to={`/blocklets/${rowData.did}`} target="_blank">
            {getDisplayName(meta)}
          </Link>
        ) : (
          getDisplayName(meta)
        )}
      </Ellipsis>
      {rowData.blockReason && (
        <Tooltip title={t('form.blockReasonDescription', { name: rowData.blockReason })} arrow>
          <SvgIcon component={Cancel} className="left" css={cssMap.icon} />
        </Tooltip>
      )}

      {rowData.remark && (
        <Tooltip title={t('form.remarkDescription', { name: rowData.remark })} arrow>
          <SvgIcon component={NoteOutline} className="left" css={cssMap.icon} />
        </Tooltip>
      )}
      {rowData.permission === 'Private' && (
        <Tooltip title={rowData.permission} arrow>
          <SvgIcon component={Lock} className="left" css={cssMap.icon} />
        </Tooltip>
      )}
    </Box>
  );
}
ShowTitle.propTypes = {
  rowData: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};
export default ShowTitle;
