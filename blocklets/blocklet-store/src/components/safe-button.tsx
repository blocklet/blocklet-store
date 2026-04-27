import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { useDebounceFn } from 'ahooks';
import { useState, useImperativeHandle } from 'react';
import Toast from '@arcblock/ux/lib/Toast';
import Tooltip from './tooltip';
import { SafeButtonRefProps } from '../type';

export default function SafeButton({
  ref = undefined,
  title: tip = undefined,
  onClick = undefined,
  isBlocked = false,
  children,
  ...props
}: Omit<ButtonProps, 'title' | 'ref'> & {
  ref?: React.Ref<SafeButtonRefProps>;
  title?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  isBlocked?: boolean;
}) {
  const { t } = useLocaleContext();
  const [loading, setLoading] = useState(false);

  const { run: handleClick } = useDebounceFn(
    (e) => {
      if (isBlocked) {
        Toast.error(t('blocklet.hasBeenBlocked'));
      } else {
        setLoading(true);
        const result = onClick?.(e) as unknown;
        if (result instanceof Promise) {
          result.finally(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      }
    },
    { wait: 300, leading: true }
  );

  const title = isBlocked ? t('blocklet.hasBeenBlocked') : tip;
  useImperativeHandle(ref, () => ({
    onClick: handleClick,
    content: children,
    title,
  }));

  return (
    <Tooltip title={title} disableInteractive>
      <Button
        variant="contained"
        disabled={loading || isBlocked}
        {...props}
        onClick={(e) => {
          e.preventDefault();
          handleClick(e);
        }}>
        {loading ? <CircularProgress size={14} sx={{ mr: 0.5, opacity: 0.3 }} /> : undefined}
        {children}
      </Button>
    </Tooltip>
  );
}
