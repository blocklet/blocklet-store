import { useRequest } from 'ahooks';
import constant from '../libs/constant';

const useFetchCategories = (storeApi) => {
  return useRequest(
    async () => {
      const { data } = await storeApi.get(constant.categoriesPath);
      return Array.isArray(data) ? data : [];
    },
    { manual: true }
  );
};

export default useFetchCategories;
