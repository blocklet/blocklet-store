import { TooltipIcon } from '@arcblock/ux/lib/BlockletV2';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Ban from '@iconify-icons/tabler/ban';
import BrandDocker from '@iconify-icons/tabler/brand-docker';
import ChevronsUp from '@iconify-icons/tabler/chevrons-up';
import EyeOff from '@iconify-icons/tabler/eye-off';
import EyeglassOff from '@iconify-icons/tabler/eyeglass-off';
import FileDescription from '@iconify-icons/tabler/file-description';
import Refresh from '@iconify-icons/tabler/refresh';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { joinURL } from 'ufo';
import { EBlockletStatus, EReviewType, EVersionStatus } from '../../constants';
import { useProtectAdmin, useProtectMine } from '../../hooks/protect';
import { getUrlPrefix } from '../../libs/util';
import { IBlocklet } from '../../type';

export default function BlockletStatusIcons({ blocklet, size = 18 }: { blocklet: IBlocklet; size?: number }) {
  const icons = useBlockletStatusIcons({ blocklet });
  return icons.map((item) => (
    <TooltipIcon key={item.key} title={item.title}>
      {typeof item.icon === 'string' ? (
        <Icon key={item.key} icon={item.icon} width={size} height={size} style={{ color: item.color }} />
      ) : (
        item.icon
      )}
    </TooltipIcon>
  ));
}

export function useBlockletStatusIcons({ blocklet }: { blocklet: IBlocklet }) {
  const { meta, currentVersion, latestVersion, lastPublishedAt, reviewVersion } = blocklet;
  const navigate = useNavigate();
  const { prefix } = getUrlPrefix();
  const { t } = useLocaleContext();

  const { isProtected: isMine } = useProtectMine(blocklet.ownerDid);
  const { isProtected: isAdmin } = useProtectAdmin();

  const baseVersion = lastPublishedAt ? currentVersion : reviewVersion;
  const needUpdate =
    baseVersion?.version &&
    latestVersion.version !== baseVersion.version &&
    latestVersion.status === EVersionStatus.DRAFT;
  const icons: {
    key: string;
    icon: string | React.ReactElement<any>;
    title: React.ReactNode;
    color?: string;
  }[] = [];

  const getDetailLink = (version: string) => joinURL(prefix, 'blocklets', meta.did, version);

  if (isMine || isAdmin) {
    if (needUpdate) {
      icons.push({
        key: 'version',
        icon: (
          <Icon
            key="version"
            icon={ChevronsUp}
            color="green"
            width={20}
            height={20}
            cursor="pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(getDetailLink(latestVersion.version));
            }}
          />
        ),
        title: t('blocklet.newDraft', { version: latestVersion.version }),
      });
    }
    if (blocklet.meta.docker?.image) {
      icons.push({
        key: 'docker',
        icon: <Icon icon={BrandDocker} width={16} height={16} style={{ color: '#1C60EC' }} />,
        title: t('blocklet.dockerImage'),
      });
    }
    if (blocklet.delegationToken?.autoPublish) {
      icons.push({
        key: 'version',
        icon: <Icon icon={Refresh} width={16} height={16} style={{ color: 'grey' }} />,
        title: t('blocklet.autoPublish'),
      });
    }
    if (blocklet.status === EBlockletStatus.BLOCKED) {
      icons.push({
        key: 'blockled',
        title: t('form.blockReasonDescription', { name: blocklet.blockReason }),
        icon: <Icon icon={Ban} width={16} height={16} style={{ color: 'red' }} />,
      });
    }
    if (blocklet.permission === 'Private') {
      icons.push({
        key: 'status',
        icon: <Icon icon={EyeOff} width={16} height={16} style={{ color: 'grey' }} />,
        title: t('blocklet.privateDesc'),
      });
    }
    if (blocklet.remark) {
      icons.push({
        key: 'remark',
        icon: <Icon icon={FileDescription} width={16} height={16} style={{ color: 'grey' }} />,
        title: `${t('common.remark')}: ${blocklet.remark}`,
      });
    }
    if (blocklet.reviewType === EReviewType.FIRST) {
      icons.push({
        key: 'source',
        icon: <Icon icon={EyeglassOff} width={16} height={16} style={{ color: '#ff9800' }} />,
        title: t('blocklet.reviewFirstVersion'),
      });
    }
  }

  return icons;
}
