import { useApi } from "./useApi";

type ApiHookOptions<TParams> = {
  apiCall: (params: TParams) => Promise<void>;
  errorMessage: string;
  successMessage: string;
};

export function createApiHook<TParams>({
  apiCall,
  errorMessage,
  successMessage,
}: ApiHookOptions<TParams>) {
  return function useGeneratedApiHook() {
    const { loading, message, handle, resetMessage } = useApi({
      apiCall,
      errorMessage,
      successMessage,
    });

    return {
      loading,
      message,
      call: handle,
      resetMessage,
    };
  };
}
