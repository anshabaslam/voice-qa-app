import { toast as sonnerToast, ExternalToast } from 'sonner';

interface ToastOptions extends ExternalToast {
  duration?: number;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, options);
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, options);
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, options);
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, options);
  },

  message: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, options);
  },

  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },
};