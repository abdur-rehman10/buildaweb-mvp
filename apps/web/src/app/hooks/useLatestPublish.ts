import { useCallback, useEffect, useState } from 'react';
import { ApiError, projectsApi, publishApi, type LatestPublishResult } from '../../lib/api';
import { getUserFriendlyErrorMessage } from '../../lib/error-messages';

type UseLatestPublishResult = {
  latestPublish: LatestPublishResult | null;
  latestPublishId: string | null;
  publishedAt: string | null;
  homePageId: string | null;
  hasUnpublishedChanges: boolean | null;
  loadingLatestPublish: boolean;
  latestPublishError: string | null;
  refreshLatestPublish: () => Promise<void>;
};

export function useLatestPublish(projectId: string | null): UseLatestPublishResult {
  const [latestPublish, setLatestPublish] = useState<LatestPublishResult | null>(null);
  const [latestPublishId, setLatestPublishId] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [homePageId, setHomePageId] = useState<string | null>(null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean | null>(null);
  const [loadingLatestPublish, setLoadingLatestPublish] = useState(false);
  const [latestPublishError, setLatestPublishError] = useState<string | null>(null);

  const refreshLatestPublish = useCallback(async () => {
    if (!projectId) {
      setLatestPublish(null);
      setLatestPublishId(null);
      setPublishedAt(null);
      setHomePageId(null);
      setHasUnpublishedChanges(null);
      setLatestPublishError(null);
      setLoadingLatestPublish(false);
      return;
    }

    setLoadingLatestPublish(true);
    setLatestPublishError(null);
    try {
      const projectRes = await projectsApi.get(projectId);
      const nextLatestPublishId = projectRes.project.latestPublishId ?? null;
      const nextPublishedAt = projectRes.project.publishedAt ?? null;
      const nextHomePageId = projectRes.project.homePageId ?? null;
      const nextHasUnpublishedChanges =
        typeof projectRes.project.hasUnpublishedChanges === 'boolean'
          ? projectRes.project.hasUnpublishedChanges
          : !nextLatestPublishId;

      setLatestPublishId(nextLatestPublishId);
      setPublishedAt(nextPublishedAt);
      setHomePageId(nextHomePageId);
      setHasUnpublishedChanges(nextHasUnpublishedChanges);

      if (!nextLatestPublishId) {
        setLatestPublish(null);
        return;
      }

      const latest = await publishApi.getStatus(projectId, nextLatestPublishId);
      setLatestPublish(latest);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Project publish pointer may be stale; keep UI in neutral state.
        setLatestPublish(null);
        setLatestPublishId(null);
        setPublishedAt(null);
        setHomePageId(null);
        setHasUnpublishedChanges(null);
        setLatestPublishError(null);
        return;
      }

      setLatestPublish(null);
      setHomePageId(null);
      setHasUnpublishedChanges(null);
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
    latestPublishId,
    publishedAt,
    homePageId,
    hasUnpublishedChanges,
    loadingLatestPublish,
    latestPublishError,
    refreshLatestPublish,
  };
}
