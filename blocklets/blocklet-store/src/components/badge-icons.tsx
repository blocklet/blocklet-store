import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Typography, tooltipClasses } from '@mui/material';
import React, { type JSX } from 'react';
import Tooltip from './tooltip';

export function TooltipIcon({ tooltip = null, children }: { tooltip?: React.ReactNode; children: JSX.Element }) {
  const { t } = useLocaleContext();
  return tooltip ? (
    <Tooltip
      title={typeof tooltip === 'string' ? t(tooltip) || tooltip : tooltip}
      PopperProps={{
        sx: {
          [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: 'common.white',
            boxShadow: 1,
            fontSize: 12,
            fontWeight: 500,
            color: 'text.secondary',
          },
        },
      }}
      placement="top">
      <Typography
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}>
        {children}
      </Typography>
    </Tooltip>
  ) : (
    children
  );
}

export function RecommendIcon({ size = 18, tooltip = null }: { size?: number; tooltip?: React.ReactNode }) {
  return (
    <TooltipIcon tooltip={tooltip}>
      <WorkspacePremiumIcon sx={{ color: '#06c3d9', fontSize: size }} />
    </TooltipIcon>
  );
}

export function OfficialIcon({ size = 18, tooltip = null }: { size?: number; tooltip?: React.ReactNode }) {
  return (
    <TooltipIcon tooltip={tooltip}>
      <VerifiedIcon sx={{ color: '#D97706', fontSize: size }} />
    </TooltipIcon>
  );
}
