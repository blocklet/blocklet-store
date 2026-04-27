import Button from '@arcblock/ux/lib/Button';
import { LocaleProvider, useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { TBlockletMeta } from '@blocklet/meta/lib/types/schema';
import { isFreeBlocklet } from '@blocklet/meta/lib/util';
import { PaymentProvider } from '@blocklet/payment-react';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useRequest } from 'ahooks';
import { get } from 'lodash-es';
import { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { joinURL, parseQuery, withQuery } from 'ufo';
import BlockletPurchaseList from '../../../components/blocklet/blocklet-purchase-list';
import BlockletPayments from '../../../components/blocklet/payments';
import BlockletVersionList from '../../../components/blocklet/version-list';
import PageLayout from '../../../components/layout/page-layout';
import Result from '../../../components/result';
import { StoreTabPanel } from '../../../components/tabs';
import { useSessionContext } from '../../../contexts/session';
import api from '../../../libs/api';
import { hasComponent } from '../../../libs/blocklet';
import { getUrlPrefix } from '../../../libs/util';
import { translations } from '../../../locales/index';
import BlockletComment from './components/comment';
import BlockletInfo from './components/info';
import BaseInfo from './components/info/base-info';
import { COMMENT_NAME, PAYMENT_DID, TABS } from './constant';
import Tabs from './tabs';
import { IBlockletInfo, IBlocklet } from '../../../type';
import useCustomEvent, { ECustomEvent } from '../../../hooks/use-custom-event';
import { useReviewMessage } from '../../../hooks/use-subscription';

export default function BlockletDetail() {
  const { t } = useLocaleContext();
  const { did = '', version = '' } = useParams();
  const location = useLocation();
  const { prefix } = getUrlPrefix();
  const navigate = useNavigate();

  if (did.startsWith('did:abt:')) {
    navigate(joinURL(prefix, 'blocklets', did.replace('did:abt:', ''), version));
  }

  const { session, connectApi } = useSessionContext();

  const { data, loading, error, run } = useRequest<IBlockletInfo & { blocklet: IBlocklet }, []>(
    async () => {
      const url = withQuery(
        joinURL(window.location.origin, prefix, 'api', 'blocklets', did, version, '/blocklet.json'),
        {
          source: 'webapp',
        }
      );

      const [{ data: meta }, { data: info }] = await Promise.all([
        api.get(
          withQuery(joinURL(prefix, 'api', 'blocklets', did, version, 'blocklet.json'), {
            source: 'webapp',
            extended: 'true',
          })
        ),
        api.get(withQuery(joinURL(prefix, 'api', 'blocklets', did, version, 'info'), { url })),
      ]);

      return {
        blocklet: { ...meta.blocklet, meta },
        readme: info.readme,
        deps: info.deps,
        extensions: info.extensions,
        version: info.version,
        authorBlocklets: info.authorBlocklets,
        categoriesBlocklets: info.categoriesBlocklets,
      };
    },
    { manual: true }
  );

  useCustomEvent(ECustomEvent.BLOCKLET_DETAIL_LOADED, () => {
    run();
  });

  useReviewMessage(() => {
    run();
  });

  useEffect(() => {
    run();
  }, [did, version, run]);

  const serverErrorCode = get(error, 'response.status', null);

  const { tab = TABS.INFO } = parseQuery(location.search) as { tab: string };
  const isNFTFactory = !!data?.blocklet.meta.nftFactory;
  const isFree = data ? isFreeBlocklet(data.blocklet.meta as TBlockletMeta) : true;
  const hasPayment = hasComponent(PAYMENT_DID);
  const hasComment = hasComponent(COMMENT_NAME);

  const blockletTitle = data?.blocklet.meta.title || '';
  return (
    <LocaleProvider translations={translations} fallbackLocale="en">
      <Helmet title={`${blockletTitle}${blockletTitle ? ' - ' : ''}${t('common.storeTitle')}`} />
      <PageLayout
        loading={loading}
        error={
          serverErrorCode ? (
            <Result
              status={serverErrorCode}
              subTitle={t(`common.${serverErrorCode}`)}
              extra={
                <Button color="primary" href="/">
                  {t('common.backHome')}
                </Button>
              }
              style={{ margin: '10px 0' }}
            />
          ) : (
            ''
          )
        }>
        {loading ? (
          <CircularProgress />
        ) : (
          data && (
            <PaymentProvider session={session} connect={connectApi}>
              <Box
                sx={{
                  py: 3,
                }}>
                <Button
                  size="small"
                  startIcon={<ArrowBackIos style={{ fontSize: 13 }} />}
                  variant="outlined"
                  onClick={handleGoBack}
                  sx={{
                    fontSize: 13,
                    fontWeight: 'typography.fontWeightLight',
                    borderRadius: 2,
                    borderColor: '#0000001f',
                    '&:hover': { borderColor: '#00000033' },
                  }}>
                  {t('common.back')}
                </Button>
              </Box>
              <Stack
                sx={{
                  pb: 5,
                  gap: 3,
                }}>
                <BaseInfo blocklet={data.blocklet} />
                <Tabs tab={tab} isFree={isFree} isNFTFactory={isNFTFactory} />
                <StoreTabPanel value={tab} index={TABS.INFO}>
                  <BlockletInfo data={data} />
                </StoreTabPanel>
                {hasComment && (
                  <StoreTabPanel value={tab} index={TABS.COMMENTS}>
                    <Suspense fallback={<CircularProgress />}>
                      <BlockletComment meta={data.blocklet.meta} />
                    </Suspense>
                  </StoreTabPanel>
                )}
                <StoreTabPanel value={tab} index={TABS.VERSION}>
                  <BlockletVersionList />
                </StoreTabPanel>
                {isNFTFactory && (
                  <StoreTabPanel value={tab} index={TABS.PURCHASE}>
                    <BlockletPurchaseList />
                  </StoreTabPanel>
                )}
                {hasPayment && (
                  <StoreTabPanel value={tab} index={TABS.PAYMENTS}>
                    <Suspense fallback={<CircularProgress />}>
                      <BlockletPayments blocklet={data.blocklet.meta} />
                    </Suspense>
                  </StoreTabPanel>
                )}
              </Stack>
            </PaymentProvider>
          )
        )}
      </PageLayout>
    </LocaleProvider>
  );

  function handleGoBack() {
    const prevPage = window.location.href;
    window.history.go(-1);
    setTimeout(() => {
      if (window.location.href === prevPage) {
        window.location.href = prefix;
      }
    }, 500);
  }
}
