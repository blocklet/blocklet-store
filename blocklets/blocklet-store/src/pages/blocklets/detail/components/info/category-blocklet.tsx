import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { useNavigate } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import { getUrlPrefix } from '../../../../../libs/util';
import BlockletList from '../blocklet-list';
import SubSection from '../sub-section';
import { IBlockletMeta } from '../../../../../type';

export default function CategoryBlocklet({ blocklets, meta }: { blocklets: IBlockletMeta[]; meta: IBlockletMeta }) {
  const { t } = useLocaleContext();
  const navigate = useNavigate();
  const { prefix } = getUrlPrefix();
  return meta.category && blocklets.length > 0 ? (
    <SubSection
      data-cy="blocklet-category-blocklet"
      title={t('blockletDetail.youMayNeed')}
      position="relative"
      onEdit={() =>
        navigate(withQuery(joinURL(prefix, 'search'), { category: meta.category?._id, showResources: true }))
      }
      editText={t('blockletDetail.viewAll')}>
      <BlockletList blocklets={blocklets} />
    </SubSection>
  ) : null;
}
