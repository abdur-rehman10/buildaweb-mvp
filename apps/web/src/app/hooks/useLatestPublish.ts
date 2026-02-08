import { useCallback, useEffect, useState } from 'react';
import { publishApi, type LatestPublishResult } from '../../lib/api';
import { getUserFriendlyErrorMessage } from '../../lib/error-messages';

type UseLatestPublishResult = {
  latestPublish: LatestPublishResult | null;
  loadingLatestPublish: boolean;
  latestPublishError: string | null;
  refreshLatestPublish: () => Promise<void>;
};

export function useLatestPublish(projectId: string | null): UseLatestPublishResult {
  const [latestPublish, setLatestPublish] = useState<LatestPublishResult | null>(null);
  const [loadingLatestPublish, setLoadingLatestPublish] = useState(false);
  const [latestPublishError, setLatestPublishError] = useState<string | null>(null);

  const refreshLatestPublish = useCallback(async () => {
    if (!projectId) {
      setLatestPublish(null);
      setLatestPublishError(null);
      setLoadingLatestPublish(false);
      return;
    }

    setLoadingLatestPublish(true);
    setLatestPublishError(null);
    try {
      const latest = await publishApi.getLatest(projectId);
      setLatestPublish(latest);
    } catch (err) {
      setLatestPublish(null);
      setLatestPublishError(getUserFriendlyErrorMessage(err, 'Failed to load publish status'));
    } finally {
      setLoadingLatestPublish(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refreshLatestPublish();
  }, [refreshLatestPublish]);

  return {
    latestPublish,
    loadingLatestPublish,
    latestPublishError,
    refreshLatestPublish,
  };
}
