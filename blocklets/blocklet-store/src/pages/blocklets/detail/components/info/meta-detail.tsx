import Avatar from '@arcblock/ux/lib/Avatar';
import DID from '@arcblock/ux/lib/DID';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { types } from '@ocap/mcrypto';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import {
  formatBytes,
  formatDownloadCount,
  formatImagePath,
  formatToDatetime,
  formatToRelativeTime,
  getUrlPrefix,
} from '../../../../../libs/util';
import { EMPTY_VALUE } from '../../constant';
import IconText from '../icon-text';
import SubSection from '../sub-section';
import { IBlockletMeta } from '../../../../../type';

export default function MetaDetail({ meta }: { meta: IBlockletMeta }) {
  const { t, locale } = useLocaleContext();
  const theme = useTheme();
  const isDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { prefix } = getUrlPrefix();
  const serverVersion = meta.requirements?.abtnode || meta.requirements?.server;

  return (
    <SubSection title={t('blocklet.detail')} titleBottom={0} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {renderLableText(
        t('blocklet.did'),
        <DID
          style={{ lineHeight: 'initial' }}
          did={meta.did}
          size={16}
          showQrcode
          responsive={false}
          compact={isDownMd}
          locale={locale}
          roleType={types.RoleType.ROLE_BLOCKLET}
        />,
        undefined,
        'blocklet-did'
      )}
      {renderLableText(
        t('blocklet.developer'),
        <IconText
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            navigate(withQuery(joinURL(prefix, 'profile'), { did: meta.owner?.did }));
          }}
          icon={
            <Avatar src={formatImagePath(meta.owner?.avatar || '', 20, meta.version)} size={20} variant="circle" />
          }>
          {meta.owner?.fullName || meta.author?.name}
        </IconText>,
        !(meta.owner?.fullName || meta.author?.name)
      )}
      {renderLableText(t('common.categories'), meta.category?.locales[locale] || t('common.none'))}
      {renderLableText(
        t('common.lastPublishedAt'),
        <Typography
          data-cy="blocklet-last-published-at"
          title={formatToDatetime(
            meta.lastPublishedAt as any
          )}>{`v${meta.version} (${formatToRelativeTime(meta.lastPublishedAt as any)})`}</Typography>
      )}
      {renderLableText(
        t('blockletDetail.size'),
        <Typography data-cy="blocklet-page-size">
          {meta.dist?.size ? formatBytes(meta.dist.size) : EMPTY_VALUE}
        </Typography>
      )}
      {renderLableText(t('common.downloadNum'), `${formatDownloadCount(meta.stats.downloads)}`)}
      {renderLableText(
        t('common.requirements'),
        <Box
          data-cy="blocklet-requirements"
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
          }}>
          <Typography
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              pr: 1,
            }}>
            {t('common.requirementAbtnode')}: {serverVersion === '*' ? t('common.any') : serverVersion}
          </Typography>
          <Typography
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              pr: 1,
            }}>
            {t('common.requirementCPU')}:{' '}
            {meta.requirements?.cpu === '*' ? t('blocklet.NoLimit') : meta.requirements?.cpu}
          </Typography>
          <Typography>
            {t('common.requirementOS')}: {meta.requirements?.os === '*' ? t('blocklet.NoLimit') : meta.requirements?.os}
          </Typography>
        </Box>
      )}
      {renderLableText(
        t('blockletDetail.capabilities.composable'),
        meta.capabilities?.component ? t('blockletDetail.support') : t('blockletDetail.nonsupport')
      )}
      {renderLableText(
        t('blockletDetail.capabilities.clusterMode'),
        meta.capabilities?.clusterMode ? t('blockletDetail.support') : t('blockletDetail.nonsupport')
      )}
      {renderLableText(
        t('blockletDetail.capabilities.serverless'),
        meta.capabilities?.serverless ? t('blockletDetail.support') : t('blockletDetail.nonsupport')
      )}
      {renderLableText(
        t('blockletDetail.capabilities.didSpace'),
        meta.capabilities?.didSpace
          ? t(`blockletDetail.capabilities.${meta.capabilities?.didSpace}`)
          : t('blockletDetail.capabilities.optional')
      )}
      {renderLableText(t('common.homepage'), renderLink(meta.homepage || ''))}
      {renderLableText(t('common.documentation'), renderLink(meta.documentation || ''))}
      {renderLableText(t('common.repository'), renderLink(meta.repository?.parsedUrl || meta.repository?.url || ''))}
      {renderLableText(t('common.community'), renderLink(meta.community || ''))}
    </SubSection>
  );

  function renderLableText(label: ReactNode, value?: ReactNode, isInvalid?: boolean, id?: string) {
    return (
      <Box
        id={id}
        sx={{
          display: { xs: 'block', md: 'flex' },
          alignItems: 'center',
        }}>
        <Typography
          variant="body1"
          sx={{
            width: 200,
          }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {isInvalid ? EMPTY_VALUE : value || EMPTY_VALUE}
        </Typography>
      </Box>
    );
  }

  function renderLink(url: string, text?: ReactNode) {
    return url ? (
      <Typography variant="body1" sx={{ textDecoration: 'underline' }}>
        <a href={url} target="_blank" rel="noreferrer">
          <Typography variant="body1" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            {text || url}
          </Typography>
        </a>
      </Typography>
    ) : (
      EMPTY_VALUE
    );
  }
}
