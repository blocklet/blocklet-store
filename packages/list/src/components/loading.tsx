import Box, { BoxProps } from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { memo } from 'react';

export default memo(function Loading(props: BoxProps) {
  return (
    <Box
      {...props}
      sx={[
        {
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}>
      <CircularProgress />
    </Box>
  );
});
