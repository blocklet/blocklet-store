import { useInfiniteScroll } from 'ahooks';
import stringify from 'json-stable-stringify';
import constant from '../libs/constant';

const useFetchBlocklets = (storeApi, finalFilters, paginateState, setFetchBlockletsError) => {
  return useInfiniteScroll(
    async (currentData) => {
      if (!currentData) paginateState.currentPage = paginateState.defaultCurrentPage;
      const { currentPage: page, pageSize } = paginateState;
      const params = {
        ...finalFilters,
        category: finalFilters.category === 'All' ? '' : finalFilters.category,
        sortBy: constant[finalFilters.sortBy],
        page,
        pageSize,
      };
      setFetchBlockletsError(null);

      const { data = {} } = await storeApi.get(constant.blockletsPath, { params });
      paginateState.currentPage++;
      return { page, pageSize, list: data?.dataList || [], total: data?.total || 0 };
    },
    {
      isNoMore: (d) => (d ? d.page * d.pageSize >= d.total : false),
      reloadDeps: [storeApi, stringify(finalFilters)],
      onError: setFetchBlockletsError,
    }
  );
};

export default useFetchBlocklets;
