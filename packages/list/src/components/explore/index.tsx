import { ErrorFallback } from '@arcblock/ux/lib/ErrorBoundary';
import { useRequest } from 'ahooks';
import { useListContext } from '../../contexts/list';
import useStoreApi from '../../hooks/use-store-api';
import constant from '../../libs/constant';
import Loading from '../loading';
import Banner from './banner';
import BlockletsSection from './section';

export default function Explore() {
  const { get } = useStoreApi();
  const { t } = useListContext();

  const {
    data: sections = [],
    error,
    loading,
  } = useRequest<{ type: string; blocklets: IBlockletMeta[] }[], any>(async () => {
    const data = await get(constant.explorePath);
    return Array.isArray(data) ? data : [];
  });

  if (error) {
    return <ErrorFallback error={new Error(`Failed to fetch blocklets from ${constant.explorePath}`)} />;
  }

  return loading ? (
    <Loading mt={15} />
  ) : (
    <>
      <Banner />
      {sections.map((section) =>
        section.blocklets?.length > 0 ? (
          <BlockletsSection key={section.type} title={t(`explore.${section.type}`)} blocklets={section.blocklets} />
        ) : null
      )}
    </>
  );
}
