import Avatar from '@arcblock/ux/lib/Avatar';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Image } from '@blocklet/list';
import { CheckoutDonate, DonateProvider } from '@blocklet/payment-react';
import Download from '@iconify-icons/tabler/cloud-download';
import TablerHeartHandshake from '@iconify-icons/tabler/heart-handshake';
import { Icon } from '@iconify/react';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { Box, Avatar as MuiAvatar, Stack, Typography, useTheme } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import { OfficialIcon } from '../../../../../components/badge-icons';
import BlockletStatusIcons from '../../../../../components/blocklet/blocklet-status-icons';
import ReviewStatus from '../../../../../components/blocklet/review-status';
import DynamicButton from '../../../../../components/buttons/dynamic-button';
import useCustomEvent, { ECustomEvent } from '../../../../../hooks/use-custom-event';
import { hasComponent } from '../../../../../libs/blocklet';
import {
  formatDownloadCount,
  formatImagePath,
  formatLogoPath,
  getDonateSettings,
  getUrlPrefix,
} from '../../../../../libs/util';
import { getCurrentBlockletStatus } from '../../../../../libs/utils';
import { IBlocklet } from '../../../../../type';
import DotLoading from '../../../components/dot-loading';
import { PAYMENT_DID } from '../../constant';
import HorizontalContainer from '../horizontal-container';
import IconText from '../icon-text';

export default function BaseInfo({ blocklet }: { blocklet: IBlocklet }) {
  const { meta } = blocklet;
  const { t, locale } = useLocaleContext();
  const navigate = useNavigate();
  const { version: versionParam } = useParams();
  const theme = useTheme();

  const refresh = useCustomEvent(ECustomEvent.BLOCKLET_DETAIL_LOADED);

  const { useDraftSrc, useReviewSrc, status, version } = getCurrentBlockletStatus(blocklet);

  let logoUrl = '';
  const { prefix } = getUrlPrefix();
  if (meta.logo) {
    logoUrl = joinURL(
      prefix,
      formatLogoPath({
        did: meta.did,
        asset: meta.logo,
        version: meta.version,
        size: 160,
        useDraftSrc,
        useReviewSrc,
      })
    );
  }

  const hasPayment = hasComponent(PAYMENT_DID);

  const categoryLabel = meta.category?.locales[locale] || meta.category?.locales.en;
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1, md: 2 },
        }}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
          <Image
            data-cy="blocklet-logo"
            src={logoUrl}
            alt="Blocklet Icon"
            width={100}
            height={100}
            style={{ minWidth: 100, borderRadius: 12, overflow: 'hidden' }}
          />
          <Stack
            sx={{
              gap: 1,
            }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
              <Typography
                data-cy="blocklet-name"
                variant="h2"
                title={meta.title || meta.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                {meta.title || meta.name}
              </Typography>
              {meta.isOfficial ? <OfficialIcon tooltip="blocklet.isOfficial" /> : null}
              <BlockletStatusIcons blocklet={blocklet} />
            </Box>
            <Typography
              data-cy="blocklet-description"
              variant="body1"
              sx={{
                color: 'text.secondary',
              }}>
              {meta.description}
            </Typography>
            {renderIconItems({ xs: 'none' })}
          </Stack>
        </Box>
        {renderIconItems({ md: 'none' })}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            width: { xs: '100%', md: 'auto' },
          }}>
          <DynamicButton blocklet={blocklet} showCount={versionParam ? 2 : 1} onSuccess={refresh} />
        </Box>
      </Box>
      <HorizontalContainer>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            minWidth: '100%',
            button: { display: 'none' },
          }}>
          {renderHightLight(
            t('common.category'),
            categoryLabel ? (
              <Link
                to={withQuery(joinURL(prefix, 'search'), {
                  category: meta.category?.id,
                  showResources: true,
                })}>
                {categoryLabel}
              </Link>
            ) : (
              t('common.none')
            ),
            'detail-blocklet-category'
          )}
          {renderHightLight(
            t('common.version'),
            <>
              {meta.version}
              <ReviewStatus status={status} version={version} sx={{ ml: 0.5 }} />
            </>,
            'detail-blocklet-version'
          )}
          {hasPayment &&
            meta.owner?.did &&
            renderHightLight(
              <Typography
                onClick={() => document.getElementById('blocklet-support-button')?.click()}
                sx={{ fontSize: 13, cursor: 'pointer', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                {t('blocklet.support')}
                <NorthEastIcon sx={{ fontSize: 13 }} />
              </Typography>,
              <DonateProvider
                mountLocation="blocklet-store"
                description="Donate developer of the blocklet"
                enableDonate>
                {/* @ts-ignore TODO: 等待 settings 更新 */}
                <CheckoutDonate mode="custom" theme={theme} settings={getDonateSettings(meta, t)}>
                  {(openDonate, donateTotalAmount, supporters) => {
                    return supporters.currency ? (
                      <Box
                        id="blocklet-support-button"
                        onClick={() => openDonate()}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          cursor: 'pointer',
                        }}>
                        <MuiAvatar
                          src={supporters.currency.logo}
                          alt={supporters.currency.symbol || window.blocklet?.preferences.passportStakeCurrency}
                          sx={{ width: 20, height: 20, fontSize: 14 }}
                        />
                        {donateTotalAmount}
                      </Box>
                    ) : (
                      <DotLoading height={28} dotSize={8} />
                    );
                  }}
                </CheckoutDonate>
              </DonateProvider>
            )}
        </Box>
      </HorizontalContainer>
    </>
  );

  function renderIconItems(display: { xs?: string; md?: string }) {
    return (
      <Box
        sx={{
          display: { xs: 'flex', md: 'flex', ...display },
          alignItems: 'center',
          columnGap: 2,
          rowGap: 1,
          py: 1,
          flexWrap: 'wrap',
          color: 'text.secondary',
        }}>
        <IconText
          sx={{ maxWidth: { xs: 180, md: 350 }, cursor: 'pointer' }}
          onClick={() => {
            navigate(withQuery(joinURL(prefix, 'profile'), { did: meta.owner?.did }));
          }}
          icon={
            <Avatar src={formatImagePath(meta.owner?.avatar || '', 20, meta.version)} size={20} variant="circle" />
          }>
          {meta.owner?.fullName || meta.author?.name}
        </IconText>
        <IconText
          icon={<Icon icon={Download} />}
          title={`${meta.stats?.downloads || 0}`}
          data-cy="blocklet-download-count">
          {formatDownloadCount(meta.stats?.downloads || 0)}
        </IconText>
        {meta.community && (
          <IconText icon={<Icon icon={TablerHeartHandshake} />} title={meta.community}>
            <a href={meta.community} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
              {t('common.support')}
            </a>
          </IconText>
        )}
      </Box>
    );
  }

  function renderHightLight(label: React.ReactNode, value: React.ReactNode, cyId?: string) {
    return (
      <Stack
        sx={{
          flex: '1 0 auto',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 150,
        }}>
        <Typography
          variant="body1"
          sx={{
            fontSize: 13,
            color: 'text.secondary',
          }}>
          {label}
        </Typography>
        <Typography variant="h3" data-cy={cyId}>
          {value}
        </Typography>
      </Stack>
    );
  }
}
