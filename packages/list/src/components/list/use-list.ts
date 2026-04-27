import { useEffect, useMemo, useState } from 'react';

import { useReactive } from 'ahooks';
import { useListContext } from '../../contexts/list';
import useFetchBlocklets from '../../hooks/use-fetch-blocklets';
import constant from '../../libs/constant';
import { isMobileScreen } from '../../libs/utils';

export default function useList() {
  const { storeApi, search, extraFilter, errors, updateDeveloperName } = useListContext();
  const { filters } = search;
  const paginateState = useReactive({
    currentPage: constant.currentPage,
    pageSize: isMobileScreen() ? constant.mobilePageSize : constant.pageSize,
    defaultCurrentPage: constant.defaultCurrentPage,
  });

  const [fetchBlockletsError, setFetchBlockletsError] = useState<Error | null>(null);
  const infiniteState = useFetchBlocklets(storeApi, filters, paginateState, setFetchBlockletsError);

  const blocklets = useMemo(
    () => (extraFilter ? extraFilter(infiniteState.data?.list || []) : infiniteState.data?.list || []),
    [infiniteState.data, extraFilter]
  );

  useEffect(() => {
    const blocklet = blocklets.find((item) => item.owner.did === filters.owner);
    updateDeveloperName(blocklet?.owner.fullName || blocklet?.author.name || '');
  }, [filters.owner, blocklets, updateDeveloperName]);

  return {
    blocklets,
    fetchBlockletsError,
    loadMore: infiniteState.loadMore,
    hasNextPage: !infiniteState.noMore,
    total: infiniteState.data?.total || 0,
    loadings: {
      fetchBlockletsLoading: infiniteState.loading,
      loadingMore: infiniteState.loadingMore,
    },
    errors: {
      ...errors,
      fetchBlockletsError,
    },
  };
}
