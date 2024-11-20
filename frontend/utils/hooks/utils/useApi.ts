import { useState } from "react";

export function useApi<T>({
  apiCall,
  successMessage,
  errorMessage,
}: {
  apiCall: (input: T) => Promise<unknown>;
  successMessage: string;
  errorMessage: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const resetMessage = () => setMessage(null);

  const handle = async (input: T) => {
    setLoading(true);
    try {
      await apiCall(input);
      setMessage({ text: successMessage, isError: false });
    } catch (error: unknown) {
      console.error("Error:", JSON.stringify(error));
      setMessage({
        text: errorMessage,
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    message,
    handle,
    resetMessage,
  };
}
