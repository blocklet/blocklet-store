import Button from '@arcblock/ux/lib/Button';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { isFreeBlocklet } from '@blocklet/meta/lib/util';
import { parseOldPaymentPriceLabel, parsePaymentPriceLabel } from '@blocklet/util';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import { ButtonProps } from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import copy from 'copy-to-clipboard';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { checkCanLaunch, getBlockletJsonUrl, getLaunchAddress } from '../../libs/util';
import PurchaseDialog from './purchase-dialog';

export interface ILaunchButtonProps extends ButtonProps {
  blocklet: any;
  autocompleteSetters?: {
    setQuery: (query: string) => void;
    setIsOpen: (isOpen: boolean) => void;
  };
  showLaunchCopy?: boolean;
}

export default function LaunchButton({
  blocklet: meta,
  autocompleteSetters = undefined,
  showLaunchCopy = false,
  loading = null,
  ...props
}: ILaunchButtonProps) {
  const { t, locale } = useLocaleContext();
  const version = meta.blocklet?.specialVersion?.version || meta.version;
  const isFree = isFreeBlocklet(meta);
  const location = useLocation();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const price = parsePaymentPriceLabel(meta?.pricing) || parseOldPaymentPriceLabel(meta.payment?.price || []);
  const [copied, setCopied] = useState(false);

  const onCancelPurchase = () => {
    setShowPurchaseDialog(false);
  };
  const onOpenPurchase = () => {
    setShowPurchaseDialog(true);
  };

  const canLaunch = checkCanLaunch(meta);

  const handleCopy = () => {
    copy(getBlockletJsonUrl(meta.did, version));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const handleClickLaunch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFree) {
      // 唤出 购买窗口前关闭 autocomplete 的下拉框
      if (typeof autocompleteSetters?.setIsOpen === 'function') {
        autocompleteSetters.setQuery('');
        autocompleteSetters.setIsOpen(false);
      }
      onOpenPurchase();
    } else {
      if (!canLaunch) {
        handleCopy();
        return;
      }
      window.open(getLaunchAddress(meta.did, location, locale, version), '_blank');
    }
  };

  const copyContent = copied ? (
    <Tooltip title={t('common.copied')} placement="bottom" arrow open={copied}>
      <DoneIcon sx={{ height: '1rem' }} />
    </Tooltip>
  ) : (
    <ContentCopyIcon sx={{ height: '1rem' }} />
  );

  const launchLabel = canLaunch ? (
    t('common.launch')
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}>
      {t('common.copyInstallUrl')}
    </Box>
  );

  if (showLaunchCopy) {
    return (
      <>
        <ButtonGroup fullWidth variant="outlined" {...(props as any)}>
          <Button onClick={handleClickLaunch}>{isFree ? launchLabel : `${price}` || t('common.launch')}</Button>
          {canLaunch && showLaunchCopy ? (
            <Button size="small" sx={{ flex: 1 }} onClick={handleCopy}>
              {copyContent}
            </Button>
          ) : null}
        </ButtonGroup>
        {showPurchaseDialog && <PurchaseDialog meta={meta} onCancel={onCancelPurchase} />}
      </>
    );
  }

  return (
    <>
      <Button fullWidth variant="outlined" onClick={handleClickLaunch} loading={loading === true} {...props}>
        {isFree ? launchLabel : `${price}` || t('common.launch')}
      </Button>
      {showPurchaseDialog && <PurchaseDialog meta={meta} onCancel={onCancelPurchase} />}
    </>
  );
}
