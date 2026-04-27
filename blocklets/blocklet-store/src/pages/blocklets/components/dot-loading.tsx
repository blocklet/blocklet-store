import Box from '@mui/material/Box';

export default function DotLoading({
  dotSize = 12,
  speed = 1.5,
  height = 40,
  width = '100%',
}: {
  dotSize?: number;
  speed?: number;
  height?: number | string;
  width?: number | string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        width,
        height,
        '@keyframes wave': {
          '0%': {
            transform: 'scale(0)',
          },
          '25%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1)',
          },
          '100%': {
            transform: 'scale(0)',
          },
        },
        '& > div': {
          animation: `wave ${speed}s linear infinite`,
        },
        '& > div:nth-child(1)': {
          animationDelay: `-${speed * 0.4}s`,
        },
        '& > div:nth-child(2)': {
          animationDelay: `-${speed * 0.2}s`,
        },
      }}>
      {[1, 2, 3].map((key) => (
        <Box key={key} sx={{ width: dotSize, height: dotSize, borderRadius: '50%', backgroundColor: 'text.hint' }} />
      ))}
    </Box>
  );
}
