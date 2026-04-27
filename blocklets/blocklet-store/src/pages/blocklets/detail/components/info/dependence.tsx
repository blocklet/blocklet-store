import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import BlockletList from '../blocklet-list';
import SubSection from '../sub-section';
import { IBlockletMeta } from '../../../../../type';

export default function Dependence({ blocklets }: { blocklets: IBlockletMeta[] }) {
  const { t } = useLocaleContext();
  return (
    <SubSection
      title={t('blockletDetail.dependencies')}
      description={t('blockletDetail.depsDescription')}
      position="relative">
      {blocklets.length > 0 ? <BlockletList blocklets={blocklets} /> : t('blockletDetail.noDependencies')}
    </SubSection>
  );
}
