import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import { Box, Dialog } from '@mui/material';
import copy from 'copy-to-clipboard';
import { useState } from 'react';
import { getBlockletJsonUrl } from '../../libs/util';
import { IBlockletButton } from '../../type';
import SafeButton from '../safe-button';

export default function CopyInstallUrlButton({
  ref,
  blocklet,
  ...rest
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { meta } = blocklet;
  const { t } = useLocaleContext();
  const [showCopyInstallUrlDialog, setShowCopyInstallUrlDialog] = useState(false);

  return (
    <>
      <SafeButton {...rest} ref={ref} onClick={handleCopyBlockletUrl}>
        {t('common.copyInstallUrl')}
      </SafeButton>
      <Dialog
        fullScreen
        sx={{ p: 0 }}
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            justifyContent: 'center',
            '.ux-dialog_header': {
              display: 'none',
            },
          },
        }}
        open={showCopyInstallUrlDialog}
        onClose={() => setShowCopyInstallUrlDialog(false)}>
        <Box
          onClick={() => setShowCopyInstallUrlDialog(false)}
          sx={{
            width: '100%',
            height: '100%',
            p: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Box
            component="img"
            src="/images/copy-install-url.gif"
            alt="copy-install-url"
            style={{ width: '80vw', height: '80vh', objectFit: 'contain' }}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
            }}
          />
        </Box>
      </Dialog>
    </>
  );

  function handleCopyBlockletUrl() {
    const version = meta.version === blocklet.currentVersion?.version ? '' : meta.version;
    copy(getBlockletJsonUrl(meta.did, version));
    Toast.success(
      <Box>
        {t('common.copied')}
        <Box
          component="span"
          style={{ color: 'blue', marginLeft: 4, cursor: 'pointer' }}
          onClick={() => setShowCopyInstallUrlDialog(true)}>
          [{t('common.viewDemo')}]
        </Box>
      </Box>
    );
  }
}
