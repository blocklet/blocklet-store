import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import { css } from '@emotion/react';
import FaceIcon from '@mui/icons-material/Face';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import { useContext } from 'react';

const cssMeta = {
  root: () => css`
    .MuiChip-root {
      border-radius: 4px;
      height: initial;
      text-transform: capitalize;
    }
  `,
};
function FilterAuthor({ user, deleteUserTag = () => {}, ...containerProps }) {
  const { t } = useContext(LocaleContext);
  if (!user) return null;
  return (
    <div {...containerProps} css={cssMeta.root}>
      <Chip
        icon={<FaceIcon />}
        label={t('blocklet.owner', { name: user })}
        onDelete={() => {
          deleteUserTag();
        }}
      />
    </div>
  );
}
FilterAuthor.propTypes = {
  user: PropTypes.string.isRequired,
  deleteUserTag: PropTypes.func,
};
export default FilterAuthor;
