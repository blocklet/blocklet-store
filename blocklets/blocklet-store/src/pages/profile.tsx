import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { CardSkeleton } from '@blocklet/list';
import UserCenter from '@blocklet/ui-react/lib/UserCenter/components/user-center';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRequest } from 'ahooks';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { joinURL, parseQuery, withQuery } from 'ufo';
import { useSessionContext } from '../contexts/session';
import api from '../libs/api';
import { getUrlPrefix } from '../libs/util';
import { blockletRender } from './blocklets/blocklet-render';
import { IBlockletMeta } from '../type';

export default function Profile() {
  const { t } = useLocaleContext();
  const { session } = useSessionContext();
  const { prefix } = getUrlPrefix();
  const location = useLocation();
  const userDid = parseQuery(location.search).did || session?.user?.did;

  const { data, error, loading, run } = useRequest<{ dataList: IBlockletMeta[]; total: number }, any>(
    async () => {
      const params = {
        owner: userDid,
        showResources: true,
        page: 1,
        pageSize: 1000,
      };
      const url = withQuery(joinURL(window.location.origin, prefix, '/api/v2/blocklets.json'), params);
      const res = await api.get(url);
      return res.data;
    },
    { manual: true }
  );

  useEffect(() => {
    if (userDid) {
      run();
    }
  }, [userDid, run]);

  const minItemWidth = 300;

  return (
    <UserCenter
      currentTab={`${prefix}profile`}
      userDid={userDid}
      headerProps={{ maxWidth: '100vw' }}
      notLoginContent={undefined}>
      <Helmet title={t('user.store')} />
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            mb: 1.5,
          }}>
          <Typography variant="h3">{t('user.blocklets')}</Typography>
          {error ? null : (
            <Typography variant="body2">{t('common.totalCount', { count: data?.total || 0 })}</Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
            p: '2px',
            gap: 2,
          }}>
          {loading
            ? [1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)
            : data?.dataList?.map((blocklet) => (
                <Box key={blocklet.did} data-blocklet-did={blocklet.did} sx={{ minWidth: minItemWidth }}>
                  {blockletRender({ blocklet, autocompleteSetters: {} })}
                </Box>
              ))}
        </Box>
        {error || !data?.dataList?.length ? (
          <Typography
            sx={{
              width: '100%',
              height: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {error ? t('user.requestError') : t('user.noBlocklets')}
          </Typography>
        ) : null}
      </Box>
    </UserCenter>
  );
}
