import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import {
  Autocomplete,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';
import { lazyApi } from '../../../libs/api';
import { IBlocklet, IBlockletButton } from '../../../type';
import SafeButton from '../../safe-button';

export default function CategoryButton({ ref, blocklet, onSuccess, ...rest }: IBlockletButton) {
  const { t } = useLocaleContext();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <SafeButton {...rest} ref={ref} onClick={() => setOpenDialog(true)}>
        {t('blocklet.setCategory')}
      </SafeButton>
      <CategoryDialog
        {...rest}
        blocklet={blocklet}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        onSuccess={onSuccess}
      />
    </>
  );
}

function CategoryDialog({
  ...props
}: ButtonProps & {
  blocklet: IBlocklet;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}) {
  const { blocklet, openDialog, setOpenDialog, onSuccess } = props;
  const { t, locale } = useLocaleContext();
  const [category, setCategory] = useState<{ label: string; value: string } | null>(
    blocklet.meta.category?.id
      ? {
          label: blocklet.meta.category.locales[locale] || blocklet.meta.category.locales.en,
          value: blocklet.meta.category.id,
        }
      : null
  );

  const { data: categories } = useRequest(() => lazyApi.get('/api/blocklets/categories').then((res) => res.data), {
    cacheKey: 'categories',
    cacheTime: 1000 * 60 * 5,
  });

  const options = useMemo(() => {
    const items =
      categories
        ?.filter((item) => item.locales.en !== 'All')
        .map((item) => ({
          label: item.locales[locale] || item.locales.en,
          value: item.id,
        })) || [];

    setCategory(category ? items.find((item) => item.value === category.value) : null);
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, locale]);

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>{t('blocklet.setCategory')}</DialogTitle>
      <DialogContent>
        <Typography sx={{ cursor: 'default', mb: 1, fontWeight: 500 }}>Blocklet {t('common.category')}</Typography>
        <Autocomplete
          size="small"
          options={options}
          sx={{ width: 400 }}
          value={category}
          clearIcon={null}
          onChange={(_, value) => setCategory(value)}
          renderInput={(params) => (
            <TextField {...params} value={category?.label} placeholder={t('common.pleaseSelect')} />
          )}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <SafeButton variant="outlined" onClick={() => setOpenDialog(false)} autoFocus>
          {t('common.cancel')}
        </SafeButton>
        <SafeButton
          color="success"
          disabled={!category}
          onClick={async () => {
            try {
              await lazyApi.put(`/api/console/blocklets/${blocklet.id}/category`, {
                category: category!.value,
              });
              setOpenDialog(false);
            } catch (err: any) {
              const { error } = err.response?.data ?? { error: err };
              Toast.error(error);
            } finally {
              onSuccess?.();
            }
          }}>
          {t('common.confirm')}
        </SafeButton>
      </DialogActions>
    </Dialog>
  );
}

CategoryDialog.displayName = 'CategoryDialog2222';
