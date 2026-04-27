import PropTypes from 'prop-types';
import { useMemo } from 'react';
import Tag from '@arcblock/ux/lib/Tag';
import ISO6391 from 'iso-639-1';

import { getEditLocales } from '../../libs/category';

function DisplayLocales({ locales = {} }) {
  const { languages } = window.blocklet;
  const finalLocales = useMemo(() => {
    const editLocales = getEditLocales(locales, languages);
    Object.keys(editLocales).forEach((key) => {
      // getEditLocales 会把 languages 中存在而 locales 不存在的key添加进 locales 值为空，所以在列表中展示时需要手动将为空的值处理掉
      if (!editLocales[key]) {
        delete editLocales[key];
      }
    });
    return editLocales;
  }, [languages, locales]);

  return Object.keys(finalLocales).map((key) => {
    return (
      <Tag key={key} style={{ marginLeft: '5px' }} type="primary">
        {`${locales[key]}-${ISO6391.getName(key)}`}
      </Tag>
    );
  });
}
DisplayLocales.propTypes = {
  locales: PropTypes.object.isRequired,
};

export default DisplayLocales;
