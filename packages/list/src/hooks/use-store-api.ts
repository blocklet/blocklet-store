import { createAxios } from '@blocklet/js-sdk';
import { useMemo } from 'react';
import { useListContext } from '../contexts/list';
import { createRequestHeaders } from '../contexts/utils';

export default function useStoreApi() {
  const { endpoint, serverVersion, storeVersion } = useListContext();

  const requestHeaders = createRequestHeaders(serverVersion, storeVersion);

  const storeApi = useMemo(() => {
    return createAxios({
      baseURL: endpoint,
      headers: requestHeaders,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return {
    get: async (path: string) => {
      const { data } = await storeApi.get(path);
      return data;
    },
    post: async (path: string, data: any) => {
      const { data: resData } = await storeApi.post(path, data);
      return resData;
    },
  };
}
