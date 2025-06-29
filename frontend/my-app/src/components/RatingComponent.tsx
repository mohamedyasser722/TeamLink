'use client';

import { useState, useEffect } from 'react';
import { projectsApi } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
}

interface ExistingRating {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RateableTeamMember {
  teamMemberId: string;
  user: User;
  roleTitle: string;
  joinedAt: string;
  hasBeenRated: boolean;
  existingRating: ExistingRating | null;
}

interface RatingComponentProps {
  projectId: string;
  projectTitle: string;
  isProjectOwner: boolean;
  projectStatus: string;
}

export default function RatingComponent({ 
  projectId, 
  projectTitle, 
  isProjectOwner, 
  projectStatus 
}: RatingComponentProps) {
  const [rateableMembers, setRateableMembers] = useState<RateableTeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingMember, setRatingMember] = useState<string | null>(null);
  const [ratingData, setRatingData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // Only show rating section if user is project owner and project is completed
  const canRate = isProjectOwner && projectStatus === 'completed';

  useEffect(() => {
    if (canRate) {
      fetchRateableMembers();
    }
  }, [canRate, projectId]);

  const fetchRateableMembers = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getRateableTeamMembers(projectId);
      setRateableMembers(response);
    } catch (error: any) {
      console.error('Error fetching rateable members:', error);
      setError('Failed to load team members for rating');
    } finally {
      setLoading(false);
    }
  };

  const handleRateUser = async (userId: string) => {
    try {
      setSubmitting(true);
      setError(null);
      
      await projectsApi.rateUser(projectId, {
        ratedUserId: userId,
        rating: ratingData.rating,
        comment: ratingData.comment
      });

      // Refresh the rateable members to update the rating status
      await fetchRateableMembers();
      
      // Reset form
      setRatingMember(null);
      setRatingData({ rating: 5, comment: '' });
    } catch (error: any) {
      console.error('Error rating user:', error);
      setError(error?.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            className={`h-5 w-5 ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (!canRate) {
    return null;
  }

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Team Rating</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (rateableMembers.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Team Rating</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 text-center">No team members to rate for this project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Rate Team Members</h3>
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Rate the freelancers who worked on "{projectTitle}". Your ratings help build their reputation on the platform.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-gray-200">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {rateableMembers.map((member) => (
            <div key={member.teamMemberId} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={member.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.username)}&background=3B82F6&color=fff`}
                    alt={member.user.username}
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{member.user.username}</p>
                    <p className="text-xs text-gray-500">{member.roleTitle}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {member.hasBeenRated && member.existingRating ? (
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getRatingStars(member.existingRating.rating)}
                        <span className="text-sm text-gray-500">
                          ({member.existingRating.rating}/5)
                        </span>
                      </div>
                      {member.existingRating.comment && (
                        <p className="text-xs text-gray-500 mt-1 max-w-48 truncate">
                          "{member.existingRating.comment}"
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Rated on {new Date(member.existingRating.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRatingMember(member.user.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                    >
                      Rate
                    </button>
                  )}
                </div>
              </div>

              {/* Rating Form */}
              {ratingMember === member.user.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (1-5 stars)
                      </label>
                      {getRatingStars(ratingData.rating, true, (rating) => 
                        setRatingData({ ...ratingData, rating })
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (optional)
                      </label>
                      <textarea
                        value={ratingData.comment}
                        onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Share your experience working with this freelancer..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRatingMember(null);
                          setRatingData({ rating: 5, comment: '' });
                          setError(null);
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRateUser(member.user.id)}
                        disabled={submitting}
                        className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit Rating'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 