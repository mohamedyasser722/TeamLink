'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';

interface UserRating {
  rating: number;
  comment: string;
  createdAt: string;
  raterUsername: string;
  projectTitle: string;
}

interface UserSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  skills: UserSkill[];
  ratings: UserRating[];
  averageRating: number;
  totalRatings: number;
}

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUserProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-xl ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-700">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{profile.username}</h3>
                  <p className="text-gray-800">{profile.email}</p>
                </div>
              </div>

              {profile.bio && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-800 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Rating Summary</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {renderStars(Math.round(profile.averageRating))}
                    <span className="ml-2 text-lg font-bold text-gray-900">
                      {profile.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-800 font-medium">
                    ({profile.totalRatings} ratings)
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Skills</h4>
                {profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white border border-blue-700"
                      >
                        {skill.name} ({skill.level})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 italic">No skills added yet</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-800 py-8 font-medium">Failed to load profile</p>
          )}
        </div>
      </div>
    </div>
  );
} 