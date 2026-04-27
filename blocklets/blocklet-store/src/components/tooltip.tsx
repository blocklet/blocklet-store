import { Tooltip as MuiTooltip, TooltipProps, tooltipClasses } from '@mui/material';

export interface TooltipIconProps extends TooltipProps {
  fontSize?: number | string;
  fontWeight?: number | string;
  color?: string;
}

export default function Tooltip({
  title,
  sx,
  children,
  slotProps,
  fontSize = 12,
  fontWeight = 500,
  color = 'text.secondary',
  ...props
}: TooltipIconProps) {
  return title ? (
    <MuiTooltip
      title={title}
      placement="top"
      {...props}
      slotProps={{
        popper: {
          ...slotProps?.popper,
          sx: [
            {
              [`& .${tooltipClasses.tooltip}`]: {
                backgroundColor: 'common.white',
                fontSize,
                fontWeight,
                boxShadow: '0px 4px 8px 0px #03071214, 0px 0px 0px 1px #03071214',
                marginBottom: '6px !important',
                borderRadius: '8px',
                cursor: 'default',
                color,
                display: 'flex',
                alignItems: 'center',
              },
            },
            // @ts-ignore $FixMe MUI7 不支持 slotProps.popper.sx 了？ 需要后续确认一下
            ...(Array.isArray(slotProps?.popper?.sx) ? slotProps.popper.sx : [slotProps?.popper?.sx]),
          ],
        },
      }}>
      {children}
    </MuiTooltip>
  ) : (
    children
  );
}
