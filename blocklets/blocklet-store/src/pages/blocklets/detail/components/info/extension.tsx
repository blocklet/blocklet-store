import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { useNavigate } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import { getUrlPrefix } from '../../../../../libs/util';
import BlockletList from '../blocklet-list';
import SubSection from '../sub-section';
import { IBlockletMeta } from '../../../../../type';

export default function Extension({ meta, extensions }: { meta: IBlockletMeta; extensions: IBlockletMeta[] }) {
  const { t } = useLocaleContext();
  const navigate = useNavigate();
  const { prefix } = getUrlPrefix();

  return extensions.length ? (
    <SubSection
      title={t('blockletDetail.extensions')}
      description={t('blockletDetail.extensionDescription', { name: meta.title })}
      onEdit={() =>
        navigate(
          withQuery(joinURL(prefix, 'search'), {
            category: 'All',
            resourceDid: meta.did,
            showResources: true,
            resourceBlocklet: meta.title,
          })
        )
      }
      editText={t('blockletDetail.viewAll')}
      position="relative">
      <BlockletList blocklets={extensions} />
    </SubSection>
  ) : null;
}
