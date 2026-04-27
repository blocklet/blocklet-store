import PropTypes from 'prop-types';
import Img from '@arcblock/ux/lib/Img';
import Avatar from '@arcblock/did-connect-react/lib/Avatar';
import styled from '@emotion/styled';
import { getMeta, getLogoUrl } from '../../../libs/util';

const SIZE = 40;
function ShowLogo({ rowData = {}, isAdmin }) {
  const meta = getMeta(rowData, { isAdmin });
  const logoUrl = getLogoUrl(meta, SIZE, {
    isDraft: !!rowData.draftVersion,
    isAdmin,
    updatedAt: rowData.updatedAt,
  });
  if (!logoUrl)
    return (
      <Div>
        <Avatar did={rowData.did} size={SIZE} />
      </Div>
    );
  return (
    <Div>
      <Img src={logoUrl} width={SIZE} height={SIZE} />
    </Div>
  );
}
ShowLogo.propTypes = {
  rowData: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

const Div = styled('div')`
  margin-right: 8px;
  margin-top: 6px;
`;

export default ShowLogo;
