import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Toast from '@arcblock/ux/lib/Toast';
import { Box } from '@mui/material';
import copy from 'copy-to-clipboard';
import { IBlockletButton } from '../../type';
import SafeButton from '../safe-button';
import { EVersionStatus } from '../../constants';

export default function AddComponentButton({ blocklet, ...rest }: IBlockletButton) {
  const { meta, specifiedVersion } = blocklet;
  const { t } = useLocaleContext();

  return (
    <SafeButton onClick={handleAddComponent} {...rest}>
      {t('blockletDetail.addComponent.name')}
    </SafeButton>
  );

  async function handleAddComponent() {
    const isPublished = specifiedVersion?.status === EVersionStatus.PUBLISHED;
    const addComponent = `blocklet add ${meta.did}${isPublished ? '' : `@${specifiedVersion?.version || meta.version}`} --store=${window.blocklet?.appUrl}`;
    await copy(addComponent);
    Toast.success(
      <Box>
        {t('blockletDetail.addComponent.copied', { name: meta.title })}
        <Box>
          <a
            style={{ color: 'blue' }}
            href="https://www.arcblock.io/docs/blocklet-developer/zh/create-blocklet#%E6%B7%BB%E5%8A%A0%E7%BB%84%E4%BB%B6">
            {t('common.more')}
          </a>
        </Box>
      </Box>
    );
  }
}
