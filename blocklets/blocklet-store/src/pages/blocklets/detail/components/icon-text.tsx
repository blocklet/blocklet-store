import Stack, { StackProps } from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function IconText({
  icon = undefined,
  children = undefined,
  maxWidth = 100,
  title = '',
  ...props
}: {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: number;
  title?: string;
} & StackProps) {
  return (
    (children === 0 || children) && (
      <Stack
        direction="row"
        {...props}
        sx={[
          {
            alignItems: 'center',
            gap: '6px',
            maxWidth,
            overflow: 'hidden',
            ...props.sx,
          },
          ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        ]}>
        {icon}
        <Typography
          variant="body2"
          title={title || (typeof children === 'string' ? children : undefined)}
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
          {children}
        </Typography>
      </Stack>
    )
  );
}
