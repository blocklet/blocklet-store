import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { useAsideContext } from '../../contexts/aside';
import Media from '../media';

export default function AsideDrawer({ children }: { children: React.ReactNode }) {
  const { open, toggleOpen } = useAsideContext();

  return (
    <Media
      xs={
        <Drawer open={open} onClose={() => toggleOpen(false)}>
          {children}
        </Drawer>
      }
      md={<Box>{children}</Box>}
    />
  );
}
