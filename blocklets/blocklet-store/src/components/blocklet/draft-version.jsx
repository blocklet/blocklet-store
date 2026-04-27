import { useContext } from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import Toast from '@arcblock/ux/lib/Toast';
import { useDebounceFn } from 'ahooks';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Button from '@arcblock/ux/lib/Button';
import Tooltip from '@mui/material/Tooltip';

import { useProtectMine } from '../../hooks/protect';

function DraftActions({ data, onPublish = () => {} }) {
  const { t } = useContext(LocaleContext);
  const { isProtected } = useProtectMine(data.owner.did);

  function protectBlocked(rowData, fn = () => {}) {
    if (rowData.status !== 'blocked') return fn(rowData);
    Toast.error(t('blocklet.hasBeenBlocked'));
    return () => {};
  }
  const { run: handlePublish } = useDebounceFn(protectBlocked, { wait: 300 });

  return (
    isProtected && (
      <Tooltip title={t('blocklet.publishButton', { version: data.draftVersion.version })}>
        <Button
          css={(theme) => css`
            margin-left: ${theme.spacing(0.5)};
          `}
          variant="outlined"
          size="small"
          data-cy="publish"
          color="primary"
          onClick={() => handlePublish(data, onPublish)}>
          {t('common.publish')}
        </Button>
      </Tooltip>
    )
  );
}
DraftActions.propTypes = {
  data: PropTypes.object.isRequired,
  onPublish: PropTypes.func,
};

export default DraftActions;
