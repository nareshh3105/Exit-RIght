import type { ApiResponse, RecommendationFeedback } from '@/types';

export async function submitFeedback(
  feedback: RecommendationFeedback
): Promise<ApiResponse<{ success: boolean }>> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recommendation_id: feedback.recommendationId,
      user_id: '',
      rating: feedback.rating,
      feedback_type: feedback.feedbackType,
      comment: feedback.comment,
    }),
  });

  if (!res.ok) return { data: null, error: 'Failed to submit feedback' };
  const json = await res.json();
  return { data: json, error: null };
}
