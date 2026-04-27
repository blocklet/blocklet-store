import DID, { HTMLDIDElement } from '@arcblock/ux/lib/DID';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Box } from '@mui/material';
import { types } from '@ocap/mcrypto';
import { useRef } from 'react';
import { IBlockletButton } from '../../type';
import SafeButton from '../safe-button';

export default function CopyDidButton({
  ref,
  blocklet,
  ...rest
}: IBlockletButton & {
  ref: React.RefObject<unknown | null>;
}) {
  const { meta } = blocklet;
  const { t, locale } = useLocaleContext();
  const didRef = useRef<HTMLDIDElement | null>(null);

  return (
    <>
      <SafeButton {...rest} ref={ref} onClick={handleCopyDid}>
        {t('blocklet.did')}
      </SafeButton>
      <Box
        sx={{
          display: 'none',
        }}>
        <DID ref={didRef} did={meta.did} locale={locale} showQrcode roleType={types.RoleType.ROLE_BLOCKLET} />
      </Box>
    </>
  );

  function handleCopyDid() {
    didRef.current?.openQRCode();
  }
}
