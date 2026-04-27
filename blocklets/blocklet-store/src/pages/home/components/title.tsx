import { Box, Typography } from '@mui/material';

export default function Title({ title, children = null }: { title: string; children?: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        pb: 3,
        borderBottom: 1,
        borderColor: 'divider',
        mb: 3,
      }}>
      <Typography variant="h2">{title}</Typography>
      <Box
        sx={{
          flex: 1,
        }}
      />
      {children}
    </Box>
  );
}
