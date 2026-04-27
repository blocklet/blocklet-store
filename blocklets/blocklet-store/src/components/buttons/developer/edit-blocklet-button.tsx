import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { useRef } from 'react';
import { lazyApi } from '../../../libs/api';
import { IBlockletButton } from '../../../type';
import EditBlockletDialog from '../../developer/edit-blocklet-dialog';

import SafeButton from '../../safe-button';

export default function EditBlockletButton({ ref, blocklet, onSuccess, ...rest }: IBlockletButton) {
  const { t } = useLocaleContext();
  const editBlockletDialogRef = useRef<{ edit: (data: any, callback: (data: any) => void) => void }>(null);

  return (
    <>
      <SafeButton
        {...rest}
        ref={ref}
        onClick={() => {
          editBlockletDialogRef.current!.edit(blocklet, async ({ remark, permission }) => {
            await lazyApi.put(`/api/developer/blocklets/${blocklet.id}`, { remark, permission });
            return onSuccess?.();
          });
        }}>
        {t('common.edit')}
      </SafeButton>
      <EditBlockletDialog ref={editBlockletDialogRef} />
    </>
  );
}
