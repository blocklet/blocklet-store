import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import PointFilled from '@iconify-icons/tabler/point-filled';
import { Icon } from '@iconify/react';
import { Box, Chip, ChipProps } from '@mui/material';
import { EVersionStatus } from '../../constants';
import Tooltip from '../tooltip';

const getStatusInfo = ({
  status = '',
  version,
  t,
  showVersion,
}: {
  status?: string;
  version: string;
  showVersion?: boolean;
  t: (key: string, options?: Record<string, string | number>) => string;
}) => {
  const generateStatus = (key: string, color?: string) => {
    const label = showVersion ? `${t(key)} (${version})` : t(key);
    return {
      key,
      color,
      icon: PointFilled,
      align: 'right' as const,
      maxWidth: 200,
      title: t('blocklet.reviewTextTooltip', { version }),
      text: label,
    };
  };
  if (status === EVersionStatus.DRAFT) {
    return generateStatus('blocklet.draftVersion', 'default');
  }
  if (status === EVersionStatus.PENDING_REVIEW) {
    return generateStatus('blocklet.pending', 'warning');
  }
  if (status === EVersionStatus.IN_REVIEW) {
    return generateStatus('blocklet.inReview', 'info');
  }
  if (status === EVersionStatus.APPROVED) {
    return generateStatus('blocklet.approved', 'success');
  }
  if (status === EVersionStatus.REJECTED) {
    return generateStatus('blocklet.rejected', 'error');
  }
  if (status === EVersionStatus.CANCELLED) {
    return generateStatus('blocklet.cancelled', 'error');
  }
  return null;
};

export default function ReviewStatus({
  status = '',
  version,
  showVersion = false,
  showIcon = false,
  showTooltip = false,
  ...props
}: {
  status?: string;
  version: string;
  showVersion?: boolean;
  showIcon?: boolean;
  showTooltip?: boolean;
} & ChipProps) {
  const { t } = useLocaleContext();

  const { icon, text, color, title } = getStatusInfo({ status, version, t, showVersion }) || {};

  return (
    text && (
      <Tooltip title={showTooltip ? title : undefined}>
        <Chip
          size="small"
          sx={[
            {
              lineHeight: 1,
              fontSize: 12,
            },
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
          ]}
          {...props}
          icon={showIcon && icon ? <Icon icon={icon} width={14} height={14} /> : undefined}
          label={<Box sx={{ lineHeight: 'unset' }}>{text}</Box>}
          color={color as ChipProps['color']}
        />
      </Tooltip>
    )
  );
}
