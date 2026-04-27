import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function IconText({
  icon = null,
  children = null,
  maxWidth = 100,
  title = '',
}: {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  maxWidth?: number;
  title?: string;
}) {
  return (
    (children === 0 || children) && (
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1,
          maxWidth,
          overflow: 'hidden',
        }}>
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
