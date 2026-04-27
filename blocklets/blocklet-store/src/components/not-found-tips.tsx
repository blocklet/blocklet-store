/**
 * org 模式下数据为空时，提示信息
 */
import { useContext, useMemo } from 'react';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import { get } from 'lodash';

import Typography from '@mui/material/Typography';

function NotFoundTips({ color = 'text.hint' }: { color?: string }) {
  const { t } = useContext(LocaleContext);
  const orgIsEnabled = useMemo(() => {
    return get(window, 'blocklet.settings.org.enabled', false);
  }, []);
  if (!orgIsEnabled) {
    return null;
  }
  return (
    <Typography sx={{ color, textAlign: 'center', fontSize: 12, mt: 1, fontStyle: 'italic' }}>
      {t('common.checkOtherOrgTips')}
    </Typography>
  );
}

export default NotFoundTips;
