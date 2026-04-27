import { Box, Card, CardProps, Skeleton } from '@mui/material';

export default function CardSkeleton(props: CardProps) {
  return (
    <Card variant="outlined" {...props} sx={{ maxWidth: 400, borderRadius: '8px', p: { xs: 2, md: 3 }, ...props.sx }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 1,
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flex: 1,
          }}>
          <Skeleton variant="rounded" width={48} height={48} />
          <Skeleton variant="text" width={60} height={28} />
        </Box>
        <Skeleton variant="text" width={70} height={40} />
      </Box>
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="90%" height={24} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pt: 1.5,
        }}>
        <Skeleton variant="rounded" width={24} height={24} />
        <Skeleton variant="text" width="15%" height={20} />
        <Skeleton variant="rounded" width={24} height={24} sx={{ ml: 1 }} />
        <Skeleton variant="text" width="15%" height={20} />
      </Box>
    </Card>
  );
}
