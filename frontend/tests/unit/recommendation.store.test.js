import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../src/lib/axios', () => ({ axiosInstance: { post: mocks.post } }));
import { useRecommendationStore } from '../../src/store/useRecommendationStore';
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const initial = { recommendations: [], insight: '', recommendationStatus: '', isLoading: false, error: '' };
beforeEach(() => { vi.resetAllMocks(); useRecommendationStore.setState(initial); });

describe('Additional recommendation store / API interaction cases', () => {
  it('AI-021 calls the recommendation endpoint and stores successful results', async () => {
    const item = { _id: 'event-1', title: 'Community activity' };
    mocks.post.mockResolvedValue({ data: { status: 'ok', explanation: 'Based on your skills, we recommend exploring Community opportunities.', opportunities: [item] } });
    await useRecommendationStore.getState().getRecommendations();
    expect(mocks.post).toHaveBeenCalledExactlyOnceWith('/recommendations/opportunities');
    expect(useRecommendationStore.getState()).toMatchObject({ recommendations: [item], recommendationStatus: 'ok', isLoading: false, error: '' });
  });

  it('AI-023 exposes loading state until the request settles', async () => {
    const pending = deferred();
    mocks.post.mockReturnValue(pending.promise);
    const request = useRecommendationStore.getState().getRecommendations();
    expect(useRecommendationStore.getState().isLoading).toBe(true);
    pending.resolve({ data: { status: 'no_matches', opportunities: [] } });
    await request;
    expect(useRecommendationStore.getState().isLoading).toBe(false);
  });

  it('AI-024 preserves analysis_unavailable as a distinct status for the page to display', async () => {
    mocks.post.mockResolvedValue({ data: { status: 'analysis_unavailable', explanation: '', opportunities: [] } });
    await useRecommendationStore.getState().getRecommendations();
    expect(useRecommendationStore.getState()).toMatchObject({ recommendationStatus: 'analysis_unavailable', recommendations: [], error: '' });
  });

  it('AI-025 records API errors, clears stale recommendations, and finishes loading', async () => {
    useRecommendationStore.setState({ recommendations: [{ _id: 'stale' }], insight: 'Old explanation', recommendationStatus: 'ok' });
    const error = { response: { data: { message: 'Service unavailable' } } };
    mocks.post.mockRejectedValue(error);
    await expect(useRecommendationStore.getState().getRecommendations()).rejects.toBe(error);
    expect(useRecommendationStore.getState()).toMatchObject({ recommendations: [], insight: '', recommendationStatus: '', error: 'Service unavailable', isLoading: false });
  });
});
