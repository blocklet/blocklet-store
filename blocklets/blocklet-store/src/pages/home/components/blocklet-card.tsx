import Blocklet from '@arcblock/ux/lib/BlockletV2';
import { IBlockletStore } from '@arcblock/ux/lib/BlockletV2/blocklet';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Calendar from '@iconify-icons/tabler/calendar';
import CloudDownload from '@iconify-icons/tabler/cloud-download';
import DotsVertical from '@iconify-icons/tabler/dots-vertical';
import Terminal2 from '@iconify-icons/tabler/terminal-2';
import Upload from '@iconify-icons/tabler/upload';
import Versions from '@iconify-icons/tabler/versions';
import { Icon } from '@iconify/react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { joinURL } from 'ufo';
import { useBlockletStatusIcons } from '../../../components/blocklet/blocklet-status-icons';
import ReviewStatus from '../../../components/blocklet/review-status';
import LaunchButton from '../../../components/buttons/launch-button';
import MoreButton from '../../../components/buttons/more-button';
import OfficialTooltip from '../../../components/official-tootip';
import { ESortKeys } from '../../../constants';
import useCustomEvent, { ECustomEvent } from '../../../hooks/use-custom-event';
import { displayAttributes, formatToDatetime, formatToRelativeTime } from '../../../libs/util';
import { getBlockletLogoAndPrefix, getCurrentBlockletStatus } from '../../../libs/utils';
import { IBlocklet } from '../../../type';

export default function BlockletCard({
  blocklet,
  sortName,
  avatar = true,
  openNewTab = false,
}: {
  blocklet: IBlocklet;
  sortName: string;
  avatar?: boolean;
  openNewTab?: boolean;
}) {
  const { meta, currentVersion, latestVersion, lastPublishedAt } = blocklet;
  const navigate = useNavigate();
  const openLink = openNewTab ? window.open : navigate;
  // 这里只需要获取未发布过的草稿版
  const {
    useDraftSrc,
    useReviewSrc,
    status: blockletStatus,
    specifiedVersionInfo,
  } = getCurrentBlockletStatus(blocklet);
  const { logoUrl, prefix } = getBlockletLogoAndPrefix(meta, useDraftSrc, useReviewSrc);
  const { t } = useLocaleContext();

  const publishedVersion = currentVersion?.version;
  const refresh = useCustomEvent(ECustomEvent.BLOCKLET_LIST_REFRESH);
  const icons = useBlockletStatusIcons({ blocklet });
  const status: IBlockletStore['status'] = [];

  const getDetailLink = (version: string) => joinURL(prefix, 'blocklets', meta.did, version);
  status.push({
    key: 'version',
    icon: <Icon icon={Versions} width={18} height={18} />,
    title: publishedVersion ? `${t('blocklet.publishedVersion')}: ${publishedVersion}` : t('blocklet.neverPublished'),
    text: (
      <Typography
        variant="body2"
        sx={{ cursor: publishedVersion ? 'pointer' : 'default' }}
        onClick={
          publishedVersion
            ? (e) => {
                e.stopPropagation();
                openLink(getDetailLink(''));
              }
            : undefined
        }>
        {publishedVersion || '---'}
      </Typography>
    ),
  });

  if (sortName === ESortKeys.DOWNLOADS) {
    status.push({
      key: 'downloads',
      icon: <Icon icon={CloudDownload} width={18} height={18} />,
      title: `${t('common.downloadNum')}: ${meta.stats.downloads || 0}`,
      text: `${meta.stats.downloads || 0}`,
    });
  }
  if (sortName === ESortKeys.CREATED_AT && blocklet.createdAt) {
    status.push({
      key: 'createdAt',
      icon: <Icon icon={Calendar} width={18} height={18} />,
      title: `${t('common.createdAt')}: ${formatToDatetime(new Date(blocklet.createdAt))}`,
      text: formatToRelativeTime(new Date(blocklet.createdAt)),
    });
  } else if (sortName === ESortKeys.LAST_PUBLISHED_AT && blocklet.lastPublishedAt) {
    status.push({
      key: 'lastPublishedAt',
      icon: <Icon icon={Calendar} width={18} height={18} />,
      title: `${t('common.publishedAt')}: ${formatToDatetime(new Date(blocklet.lastPublishedAt))}`,
      text: formatToRelativeTime(new Date(blocklet.lastPublishedAt)),
    });
  } else if (sortName === ESortKeys.UPDATED_AT && blocklet.updatedAt) {
    status.push({
      key: 'updatedAt',
      icon: <Icon icon={Calendar} width={18} height={18} />,
      title: `${t('common.updatedAt')}: ${formatToDatetime(new Date(blocklet.updatedAt))}`,
      text: formatToRelativeTime(new Date(blocklet.updatedAt)),
    });
  } else if (sortName === ESortKeys.SOURCE) {
    status.push({
      key: 'source',
      icon:
        blocklet.source === 'CLI' ? (
          <Icon icon={Terminal2} width={18} height={18} />
        ) : (
          <Icon icon={Upload} width={18} height={18} />
        ),
      title: blocklet.source && (blocklet.source === 'CLI' ? t('blocklet.cliUpload') : t('blocklet.webUpload')),
      text: `${blocklet.source || '---'}`,
    });
  }

  status.push({
    key: 'reviewStatus',
    icon: '',
    align: 'right',
    text: (
      <ReviewStatus
        status={blockletStatus}
        version={specifiedVersionInfo.version}
        onClick={(e) => {
          e.stopPropagation();
          openLink(getDetailLink(specifiedVersionInfo.version));
        }}
        showIcon
        showTooltip
        showVersion
      />
    ),
  });

  return (
    <Blocklet
      data-cy="bl-autocomplete-item"
      key={meta.did}
      did={meta.did}
      sx={{
        border: 'none',
        boxShadow: '0px 2px 4px 0px #0307120A, 0px 1px 2px -1px #03071214, 0px 0px 0px 1px #03071214',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0px 2px 4px 0px #0307121A, 0px 1px 2px -1px #03071214, 0px 0px 0px 1px #03071214',
        },
        '.ms-highlight': { color: 'secondary.main' },
      }}
      title={displayAttributes({ blocklet: meta, attribute: 'title', value: meta.title || meta.name || '' })}
      description={displayAttributes({ blocklet: meta, attribute: 'description', value: meta.description || '' })}
      official={meta.isOfficial ? { tooltip: <OfficialTooltip /> } : undefined}
      cover={logoUrl}
      avatar={avatar ? meta.owner.avatar : ''}
      author={avatar ? meta.owner.fullName : ''}
      download=""
      icons={icons}
      status={status.map((item) => ({ ...item, maxWidth: 200 }))}
      onMainClick={() => {
        const url = getDetailLink(latestVersion.version === publishedVersion ? '' : latestVersion.version);
        openLink(url);
      }}
      button={
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            padding: 1,
            mr: -1,
          }}>
          <LaunchButton blocklet={meta} disabled={!lastPublishedAt} sx={{ height: 30 }} />
          <MoreButton
            blocklet={{
              ...blocklet,
              specifiedVersion: specifiedVersionInfo,
            }}
            skipCount={1}
            variant="text"
            sx={{ height: 30, minWidth: 20, padding: 0, marginLeft: 0.5 }}
            onSuccess={refresh}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}>
            <Icon icon={DotsVertical} width={20} height={20} />
          </MoreButton>
        </Box>
      }
      onButtonClick={null as any}
    />
  );
}
