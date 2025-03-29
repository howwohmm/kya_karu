import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * A hook that provides a safe way to use toast in a client component
 * This avoids "toast is not defined" errors during SSR or other issues
 */
export function useToastSafe() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const safeToast = {
    success: (message: string) => {
      if (isMounted && typeof window !== "undefined") {
        toast.success(message);
      }
    },
    error: (message: string) => {
      if (isMounted && typeof window !== "undefined") {
        toast.error(message);
      }
    },
    info: (message: string) => {
      if (isMounted && typeof window !== "undefined") {
        toast.info(message);
      }
    },
    loading: (message: string) => {
      if (isMounted && typeof window !== "undefined") {
        return toast.loading(message);
      }
      return null;
    },
    dismiss: (toastId?: string) => {
      if (isMounted && typeof window !== "undefined") {
        if (toastId) {
          toast.dismiss(toastId);
        } else {
          toast.dismiss();
        }
      }
    },
  };

  return safeToast;
} 