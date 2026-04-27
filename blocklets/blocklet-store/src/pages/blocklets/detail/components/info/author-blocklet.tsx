import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import { getUrlPrefix } from '../../../../../libs/util';
import BlockletList from '../blocklet-list';
import SubSection from '../sub-section';
import { IBlockletMeta } from '../../../../../type';

export default function AuthorBlocklet({ meta, blocklets }: { meta: IBlockletMeta; blocklets: IBlockletMeta[] }) {
  const { t } = useLocaleContext();
  const navigate = useNavigate();
  const { prefix } = getUrlPrefix();

  return blocklets.length > 0 ? (
    <SubSection
      data-cy="blocklet-author-blocklet"
      title={
        <Typography variant="h3">
          {t('blockletDetail.authorBlockletsPre')}
          <Link to={withQuery(joinURL(prefix, 'profile'), { did: meta.owner?.did })}>
            {meta.owner?.fullName || meta.author?.name}
          </Link>
          {t('blockletDetail.authorBlockletsEnd')}
        </Typography>
      }
      onEdit={() =>
        navigate(withQuery(joinURL(prefix, 'search'), { owner: meta.owner?.did, category: 'All', showResources: true }))
      }
      editText={t('blockletDetail.viewAll')}
      position="relative">
      <BlockletList blocklets={blocklets} />
    </SubSection>
  ) : null;
}
