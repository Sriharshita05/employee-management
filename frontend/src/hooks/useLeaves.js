import { useCallback, useEffect, useRef, useState } from 'react';
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  fetchLeaveRequests,
  rejectLeaveRequest,
} from '../services/leaveService';

// Prefer the first field-level validation message, then the API's message.
function firstError(err, fallback) {
  const errors = err.response?.data?.errors;
  if (errors) {
    const first = Object.values(errors)[0];
    if (first?.[0]) return first[0];
  }
  return err.response?.data?.message || fallback;
}

export function useLeaves() {
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // Responses can arrive out of order when the filter changes quickly;
  // only the latest request is allowed to update state.
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLeaveRequests({ status: status || undefined, page });
      if (requestId !== latestRequest.current) return;

      // The last item on the last page may have just been removed from view.
      if (res.data.length === 0 && page > 1) {
        setPage(page - 1);
        return;
      }
      setRequests(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      console.error('Failed to fetch leave requests:', err);
      setError(firstError(err, 'Failed to load leave requests.'));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = useCallback((next) => {
    setStatus(next);
    setPage(1);
  }, []);

  const submitRequest = useCallback(
    async (form) => {
      try {
        await createLeaveRequest(form);
        showToast('Leave request submitted.');
        // Show the new request: newest first, with no filter hiding it.
        if (page === 1 && status === '') {
          await load();
        } else {
          setStatus('');
          setPage(1);
        }
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          errors: err.response?.data?.errors || {},
          message: firstError(err, 'Failed to submit leave request.'),
        };
      }
    },
    [load, page, status, showToast]
  );

  const runAction = useCallback(
    async (id, action, successMessage, failureMessage) => {
      setActingId(id);
      try {
        await action();
        showToast(successMessage);
        await load();
        return { ok: true };
      } catch (err) {
        showToast(firstError(err, failureMessage), 'error');
        // 409 means someone else already decided it; refresh the stale row.
        if (err.response?.status === 409) await load();
        return { ok: false, errors: err.response?.data?.errors || {} };
      } finally {
        setActingId(null);
      }
    },
    [load, showToast]
  );

  const approve = useCallback(
    (id, note) =>
      runAction(
        id,
        () => approveLeaveRequest(id, note),
        'Leave request approved.',
        'Failed to approve request.'
      ),
    [runAction]
  );

  const reject = useCallback(
    (id, note) =>
      runAction(
        id,
        () => rejectLeaveRequest(id, note),
        'Leave request rejected.',
        'Failed to reject request.'
      ),
    [runAction]
  );

  const cancel = useCallback(
    (id) =>
      runAction(
        id,
        () => cancelLeaveRequest(id),
        'Leave request cancelled.',
        'Failed to cancel request.'
      ),
    [runAction]
  );

  return {
    requests,
    meta,
    status,
    changeStatus,
    page,
    setPage,
    loading,
    error,
    load,
    actingId,
    submitRequest,
    approve,
    reject,
    cancel,
    toast,
  };
}
