import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;

export function useToast() {
  const addToast = (options) => {
    const id = ++toastId;
    const toast = {
      id,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 5000,
      persistent: options.persistent || false
    };
    
    toasts.value.push(toast);
    
    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      title: options.title || 'Success',
      ...options
    });
  };

  const error = (message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      title: options.title || 'Error',
      duration: options.duration || 7000, // Longer for errors
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      title: options.title || 'Warning',
      ...options
    });
  };

  const info = (message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      title: options.title || 'Info',
      ...options
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
}