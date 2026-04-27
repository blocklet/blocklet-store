import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useListContext } from '../../contexts/list';

export default function BlockletsSection({ title, blocklets }: { title: string; blocklets: IBlockletMeta[] }) {
  const { blockletRender, serverVersion } = useListContext();

  return (
    <Box
      sx={{
        mt: 3,
      }}>
      <Typography component="h3" variant="h3" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          boxSizing: 'border-box',
          maxWidth: 'calc(100vw - 16px)',
        }}>
        {blocklets.map((blocklet) => (
          <Grid
            key={blocklet.did}
            data-blocklet-did={blocklet.did}
            sx={{
              p: '2px',
            }}
            size={{
              xs: 12,
              md: 6,
            }}>
            <Box
              sx={{
                padding: '1px',
              }}>
              {blockletRender({ blocklet, blocklets, serverVersion })}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
