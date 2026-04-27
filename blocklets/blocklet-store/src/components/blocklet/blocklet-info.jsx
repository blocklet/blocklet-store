import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { isFreeBlocklet } from '@blocklet/meta/lib/util';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import { toUpper } from 'lodash-es';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { joinURL } from 'ufo';

import DID from '@arcblock/ux/lib/DID';
import MarkdownPreview from '@uiw/react-markdown-preview';

import MarkdownBody from '../markdown-body';
import AddComponent, { AddComponentInfo } from './add-component';
import AggregateDownload from './aggregate-download';
import BlockletImageGallery from './image-gallery';
import ShowSplitContract from './show-split-contract';

import { formatBytes, formatToDatetime, formatToRelativeTime } from '../../libs/util';

const cssMap = {
  info: (theme) => css`
    @media (min-width: ${theme.breakpoints.values.md}px) {
      & {
        padding-right: 60px;
      }
    }
  `,
  meta: (theme) => css`
    @media (min-width: ${theme.breakpoints.values.md}px) {
      & {
        padding-left: 18px;
        border-left: 1px solid ${theme.palette.divider};
      }
    }
    .link-icon {
      color: #999;
      cursor: pointer;
      width: auto;
      height: 1em;
    }
    .meta-info {
      list-style: none;
      padding: 0;
      margin: 24px 0;
      a {
        color: ${theme.palette.grey[700]};
        text-decoration: none !important;
      }
      a:hover,
      a:hover * {
        color: ${theme.palette.common.black};
        text-decoration: underline !important;
      }
      .meta-info__row {
        display: flex;
        flex-flow: column;
        line-height: 1.5;
        padding-bottom: 10px;
        padding-top: 10px;
      }
      .meta-info__row:first-of-type {
        padding-top: 0;
      }
      .info-row__key {
        width: auto;
        flex-shrink: 0;
        font-weight: ${theme.typography.fontWeightBold};
      }
      .info-row__value {
        white-space: pre-wrap;
        word-break: break-all;
        font-weight: ${theme.typography.fontWeightLight};
        :not(a) {
          color: ${theme.palette.grey[700]};
        }
      }
      .add-component-info {
        display: flex;
      }
    }
    .sidebar-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .use-button {
      width: 100%;
    }
  `,
};
export default function BlockletInfo({ blocklet }) {
  const licenseDialog = useRef(null);
  const { t, locale } = useLocaleContext();
  const theme = useTheme();

  const { readme, screenshots = [] } = blocklet;

  const markdownSource = readme[locale] || readme.en || readme[Object.keys(readme)[0]];

  return (
    <Grid container spacing={0}>
      <BlockletImageGallery screenshots={screenshots} />
      <Grid container>
        <Grid
          css={cssMap.info}
          size={{
            xs: 12,
            sm: 12,
            md: 8,
          }}>
          <Typography variant="h5" gutterBottom>
            {t('blocklet.overview')}
          </Typography>
          <MarkdownBody sx={{ mt: 3 }}>
            <PostContent component="div" className="content-wrapper post-content">
              <MarkdownPreview
                source={markdownSource}
                wrapperElement={{
                  'data-color-mode': theme.palette.mode,
                }}
              />
            </PostContent>
          </MarkdownBody>
        </Grid>
        <Grid
          css={cssMap.meta}
          size={{
            xs: 12,
            sm: 12,
            md: 4,
          }}>
          <MetaContainer blocklet={blocklet} licenseDialog={licenseDialog} />
        </Grid>
      </Grid>
    </Grid>
  );
}
function MetaContainer({ blocklet }) {
  const {
    did,
    lastPublishedAt,
    payment,
    documentation,
    repository,
    community,
    support,
    requirements,
    capabilities,
    stats,
    dist,
    homepage,
    version,
    paymentShares = [],
    resource,
    owner,
  } = blocklet;
  const { t, locale } = useLocaleContext();
  const isFree = isFreeBlocklet(blocklet);
  const chainUrl = window.blocklet.CHAIN_HOST.replace('/api', '');
  const serverVersion = requirements.abtnode || requirements.server;
  const addComponent = `blocklet add ${did} --store=${window.blocklet.appUrl}`;

  const hasResourceType = resource?.types?.length;

  return (
    <>
      <Box
        sx={{
          marginTop: '20px',
          display: {
            xs: 'block', // xs、sm、md以下显示
            md: 'none', // md及以上隐藏
          },
        }}
      />
      <Typography variant="h5" gutterBottom>
        {t('blocklet.meta')}
      </Typography>
      <Box className="meta-info MuiTypography-body1 MuiTypography-root">
        <li className="meta-info__row">
          <span className="info-row__key">{t('blocklet.did')}</span>
          <span className="info-row__value">
            <DID
              style={{ lineHeight: 'initial' }}
              did={did}
              size={16}
              showQrcode
              compact
              responsive={false}
              locale={locale}
            />
          </span>
        </li>
        {/* Add Component */}
        <li className="meta-info__row">
          <div className="add-component-info">
            <span className="info-row__key">{t('blockletDetail.addComponent.name')}</span>
            {!isFree && <AddComponentInfo payment={payment} />}
          </div>
          <AddComponent value={addComponent} />
        </li>
        {/* Developer */}
        {owner?.did && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('blocklet.developer')}</span>
            <span className="info-row__value">
              <a
                target="_blank"
                rel="noreferrer"
                href={joinURL(chainUrl, '/explorer/accounts/', owner.did)}
                aria-label="explore accounts">
                <DID
                  style={{ lineHeight: 'initial' }}
                  did={owner.did}
                  size={16}
                  showQrcode
                  compact
                  responsive={false}
                  locale={locale}
                />
              </a>
            </span>
            {owner.fullName ? (
              <span className="info-row__value">
                {owner.fullName} {owner?.email ? `(${owner?.email})` : ''}
              </span>
            ) : null}
            {owner.email ? (
              <a target="_blank" rel="noreferrer" href={`mailto:${owner.email}`}>
                {t('blocklet.contact')}
              </a>
            ) : null}
          </li>
        )}
        {/* Updated At */}
        {lastPublishedAt && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('common.lastPublishedAt')}</span>
            <span
              data-cy="blocklet-last-published-at"
              className="info-row__value"
              title={formatToDatetime(lastPublishedAt)}>
              {`v${version} (${formatToRelativeTime(lastPublishedAt)})`}
            </span>
          </li>
        )}
        {/* Bundle Size */}
        {dist.size && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('blockletDetail.size')}</span>
            <span data-cy="blocklet-page-size" className="info-row__value">
              {formatBytes(dist.size)}
            </span>
          </li>
        )}
        {/* 聚合 30 天内下载历史 */}
        <li className="meta-info__row">
          <span className="info-row__key">{t('blockletDetail.monthlyDownloads')}</span>
          <AggregateDownload did={blocklet.did} counts={stats.downloads} />
        </li>
        {/* Requirements */}
        {requirements && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('common.requirements')}</span>
            <ul
              data-cy="blocklet-requirements"
              className="info-row__value"
              style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.82em', margin: 0 }}>
              <li>
                {t('common.requirementAbtnode')}: {serverVersion === '*' ? t('common.any') : serverVersion}
              </li>
              <li>
                {t('common.requirementCPU')}: {requirements.cpu === '*' ? t('blocklet.NoLimit') : requirements.cpu}
              </li>
              <li>
                {t('common.requirementOS')}: {requirements.os === '*' ? t('blocklet.NoLimit') : requirements.os}
              </li>
            </ul>
          </li>
        )}
        {/* Capabilities */}
        {capabilities && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('blockletDetail.capabilities')}</span>
            <ul
              data-cy="blocklet-capabilities"
              className="info-row__value"
              style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.82em', margin: 0 }}>
              <li>
                {t('blockletDetail.capabilitiesComponent')}:{' '}
                {capabilities.component ? t('blockletDetail.yes') : t('blockletDetail.no')}
              </li>
              <li>
                {t('blockletDetail.capabilitiesClusterMode')}:{' '}
                {capabilities.clusterMode ? t('blockletDetail.yes') : t('blockletDetail.no')}
              </li>
            </ul>
          </li>
        )}
        {/* ResourceTypes */}
        {hasResourceType && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('blocklet.resource')}</span>
            {resource.types.map((item) => (
              <Grid
                key={item.type}
                container
                spacing={0}
                data-cy="blocklet-capabilities"
                className="info-row__value"
                sx={{ fontSize: '0.82em', marginTop: { xs: 1, sm: 0.5 } }}>
                <Grid
                  sx={{ fontWeight: 'bold' }}
                  size={{
                    xs: 12,
                    sm: 1,
                    md: 2,
                  }}>
                  <Link to={`/search?resourceDid=${blocklet.did}&resourceType=${item.type}`}>{toUpper(item.type)}</Link>
                </Grid>
                <Grid
                  sx={12}
                  size={{
                    sm: 11,
                    md: 10,
                  }}>
                  {item.description}
                </Grid>
              </Grid>
            ))}
          </li>
        )}
        {/* Homepage */}
        {!!homepage && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('common.homepage')}</span>
            <a href={homepage} target="_blank" className="info-row__value" rel="noreferrer">
              {homepage}
            </a>
          </li>
        )}
        {/* documentation */}
        {!!documentation && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('common.documentation')}</span>
            <a href={documentation} target="_blank" className="info-row__value" rel="noreferrer">
              {documentation}
            </a>
          </li>
        )}
        {/* Repository */}
        {!!repository && !!repository.url && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('common.repository')}</span>
            {repository.parsedUrl ? (
              <a
                data-cy="blocklet-repository"
                href={repository.parsedUrl}
                target="_blank"
                className="info-row__value"
                title={repository.type}
                rel="noreferrer">
                {repository.parsedUrl}
              </a>
            ) : (
              <span>{repository.url}</span>
            )}
          </li>
        )}
        {/* Community */}
        {!!community && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('common.community')}</span>
            <a href={community} target="_blank" className="info-row__value" rel="noreferrer">
              {community}
            </a>
          </li>
        )}
        {/* Support */}
        {!!support && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('common.support')}</span>
            <a href={`mailto:${support}`} target="_blank" className="info-row__value" rel="noreferrer">
              {support}
            </a>
          </li>
        )}
        {!isFree && payment?.share.length && (
          <li className="meta-info__row">
            <span className="info-row__key">{t('blockletDetail.payDetail')}</span>
            <ul
              className="info-row__value"
              style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.82em', margin: 0 }}>
              <li>
                NFT Factory: {/* eslint-disable-next-line */}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={joinURL(chainUrl, '/explorer/factories/', blocklet.nftFactory)}>
                  <DID
                    style={{ lineHeight: 'initial' }}
                    size={16}
                    did={blocklet.nftFactory}
                    showQrcode
                    locale={locale}
                  />
                </a>
              </li>
              <ShowSplitContract style={{ marginTop: '10px' }} data={paymentShares} chainUrl={chainUrl} />
            </ul>
          </li>
        )}
        {/* <span className="info-row__value">
          <FakeLink
            onClick={() => {
              licenseDialog.current.open();
            }}>
            {t('blocklet.license')}
          </FakeLink>
        </span> */}
      </Box>
    </>
  );
}
BlockletInfo.propTypes = {
  blocklet: PropTypes.object.isRequired,
};

MetaContainer.propTypes = {
  blocklet: PropTypes.object.isRequired,
};

const PostContent = styled(Typography)`
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.5em;
  min-height: 30vh;
  margin-bottom: 40px !important;

  .alert-content {
    max-width: 100%;
    p:last-of-type {
      margin-bottom: 0;
    }
  }

  iframe {
    width: 100% !important;
  }
`;
// const FakeLink = styled.span`
//   color: ${teal.A700};
//   cursor: pointer;
// `;
