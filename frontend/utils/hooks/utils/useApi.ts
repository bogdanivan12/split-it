import { useState } from "react";

export function useApi<T, D>(apiCall: (input: T) => Promise<D>) {
  const [loading, setLoading] = useState(false);

  const handle = async (input: T) => {
    setLoading(true);
    try {
      const res = await apiCall(input);
      return res;
    } catch (error: any) {
      console.error("Error:", JSON.stringify(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handle,
  };
}
