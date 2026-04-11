import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';
import { getErrorMessage } from '../lib/apiError';

/**
 * Shared mutation factory.
 *   useApiMutation(fn, { invalidateKey, success, error })
 *   - success can be a string or a function (data) => string
 */
export function useApiMutation(mutationFn, { invalidateKey, success, error: errorFallback } = {}) {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data, vars) => {
      if (invalidateKey) qc.invalidateQueries({ queryKey: invalidateKey });
      if (success) {
        const msg = typeof success === 'function' ? success(data, vars) : success;
        if (msg) toast.success(msg);
      }
    },
    onError: (err) => toast.error(getErrorMessage(err, errorFallback)),
  });
}
