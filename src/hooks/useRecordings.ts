import { useState, useEffect, useCallback } from 'react';
import { Recording } from '../types';
import * as store from '../storage/recordingsStore';

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const all = await store.getAllRecordings();
    setRecordings(all);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRecording = useCallback(
    async (recording: Recording): Promise<void> => {
      await store.saveRecording(recording);
      await refresh();
    },
    [refresh]
  );

  const updateRecording = useCallback(
    async (id: string, updates: Partial<Recording>): Promise<void> => {
      await store.updateRecording(id, updates);
      await refresh();
    },
    [refresh]
  );

  const deleteRecording = useCallback(
    async (id: string): Promise<void> => {
      await store.deleteRecording(id);
      await refresh();
    },
    [refresh]
  );

  return {
    recordings,
    isLoading,
    addRecording,
    getRecording: store.getRecording,
    updateRecording,
    deleteRecording,
    refresh,
  };
}
