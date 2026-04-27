import Dots from '@iconify-icons/tabler/dots';
import { Icon } from '@iconify/react';
import { Box, Button, Popover } from '@mui/material';
import { useState } from 'react';
import { IBlockletButton } from '../../type';
import SafeButton from '../safe-button';

import usePermissionButton, { EButtons } from '../../hooks/use-permission-button';

export default function MoreButton({
  blocklet,
  skipCount = 0,
  showButtons = undefined,
  children,
  onSuccess,
  ...rest
}: IBlockletButton & { skipCount?: number; showButtons?: EButtons[] }) {
  const { meta } = blocklet;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const baseButtonProps: IBlockletButton = {
    onSuccess,
    blocklet,
    variant: 'text',
    size: 'medium',
    sx: { width: '100%', color: 'text.secondary', fontSize: 16, px: 2, flex: '0 0 auto', justifyContent: 'flex-start' },
  };

  const { buttons, buttonInstants } = usePermissionButton(baseButtonProps, { skipCount, showButtons });

  return (
    <>
      {buttonInstants}
      <Button
        component="button"
        variant="outlined"
        color="primary"
        {...rest}
        sx={[
          { borderRadius: 1, minWidth: 36.5, p: 0, borderColor: 'divider' },
          ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
        ]}
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          rest.onClick?.(e);
        }}>
        {children || <Icon icon={Dots} width={20} height={20} />}
      </Button>
      <Popover
        id="more-menu"
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleCloseAnchor}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClick={handleCloseAnchor}
        slotProps={{ paper: { sx: { p: 0.5, borderRadius: 2 } } }}
        sx={{ marginTop: 0.5 }}>
        <Box
          key={meta.did}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}>
          {buttons.map((button) =>
            button.isSimple
              ? button.component
              : button.ref.current?.content && (
                  <SafeButton
                    {...baseButtonProps}
                    key={button.key}
                    title={button.ref.current?.title}
                    onClick={button.ref.current?.onClick}>
                    {button.ref.current?.content}
                  </SafeButton>
                )
          )}
        </Box>
      </Popover>
    </>
  );

  function handleCloseAnchor() {
    setAnchorEl(null);
  }
}
