import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getQueue, removeFromQueue, getQueueCount } from '../utils/offlineQueue';
import { createTransactionApi } from '../api/transactions';
import useOnlineStatus from './useOnlineStatus';

export default function useSyncQueue() {
  const isOnline = useOnlineStatus();
  const qc = useQueryClient();

  const syncNow = useCallback(async () => {
    const queue = await getQueue();
    if (queue.length === 0) return;

    let synced = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        const { id, _queuedAt, ...txData } = item;
        await createTransactionApi(txData);
        await removeFromQueue(id);
        synced++;
      } catch {
        failed++;
      }
    }

    if (synced > 0) {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(
        `Синхронизировано ${synced} транзакц${synced === 1 ? 'ия' : 'ии'} из офлайн-очереди`,
        { duration: 4000 }
      );
    }
    if (failed > 0) {
      toast.error(`Не удалось отправить ${failed} транзакций`);
    }
  }, [qc]);

  useEffect(() => {
    if (isOnline) {
      syncNow();
    }
  }, [isOnline, syncNow]);

  return { syncNow };
}