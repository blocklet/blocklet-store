/* eslint-disable no-console */
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Tag from '@arcblock/ux/lib/Tag';
import Tooltip from '@mui/material/Tooltip';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import ShowTime from '../show-time';
import { diffLocales } from '../../libs/category';

function DisplayUpdate({ rowData }) {
  const { locales } = rowData;
  const { languages } = window.blocklet;
  const { t } = useLocaleContext();

  const needUpdate = useMemo(() => diffLocales(locales, languages), [languages, locales]);

  return (
    <>
      <ShowTime date={rowData.updatedAt} />
      {needUpdate && (
        <Tooltip arrow title={t('category.needUpdateTips')}>
          <Tag style={{ marginLeft: '5px' }} type="warning">
            {t('category.needUpdate')}
          </Tag>
        </Tooltip>
      )}
    </>
  );
}
DisplayUpdate.propTypes = {
  rowData: PropTypes.object.isRequired,
};

export default DisplayUpdate;
