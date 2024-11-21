import { useApi } from "./useApi";

export function createApiHook<T, D>(apiCall: (params: T) => Promise<D>) {
  return function useGeneratedApiHook() {
    const { loading, handle } = useApi<T, D>(apiCall);

    return {
      loading,
      call: handle,
    };
  };
}
