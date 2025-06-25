'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { usersApi, skillsApi } from '@/lib/api';
import { UserSkill, Skill } from '@/types/project';

const profileSchema = z.object({
  bio: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const skillSchema = z.object({
  skillId: z.string().min(1, 'Please select a skill'),
  level: z.enum(['beginner', 'intermediate', 'expert'], {
    required_error: 'Please select a skill level',
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SkillFormData = z.infer<typeof skillSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Skills state
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerSkill,
    handleSubmit: handleSubmitSkill,
    formState: { errors: skillErrors },
    reset: resetSkill,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      fetchProfileData();
      fetchUserSkills();
      fetchAvailableSkills();
    }
  }, [isAuthenticated, loading, router]);

  const fetchProfileData = async () => {
    try {
      const profile = await usersApi.getProfile();
      setProfileData(profile);
      reset({
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    }
  };

  const fetchUserSkills = async () => {
    try {
      const skills = await usersApi.getMySkills();
      setUserSkills(skills);
    } catch (err: any) {
      console.error('Error fetching user skills:', err);
    } finally {
      setSkillsLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const skills = await skillsApi.getAllSkills();
      setAvailableSkills(skills);
    } catch (err: any) {
      console.error('Error fetching available skills:', err);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await usersApi.updateProfile({
        bio: data.bio || undefined,
        avatarUrl: data.avatarUrl || undefined,
      });
      setProfileData(updatedProfile);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSkill = async (data: SkillFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await usersApi.addSkill(data);
      await fetchUserSkills(); // Refresh skills
      setSuccess('Skill added successfully!');
      setIsAddingSkill(false);
      resetSkill();
    } catch (err: any) {
      console.error('Add skill error:', err);
      setError(err.response?.data?.message || 'Failed to add skill.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeSkill = async (skillId: string) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    try {
      await usersApi.removeSkill(skillId);
      await fetchUserSkills(); // Refresh skills
      setSuccess('Skill removed successfully!');
    } catch (err: any) {
      console.error('Remove skill error:', err);
      setError(err.response?.data?.message || 'Failed to remove skill.');
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'expert':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || skillsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    {profileData.avatarUrl ? (
                      <img
                        src={profileData.avatarUrl}
                        alt="Avatar"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-xl font-medium">
                          {profileData.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-medium text-gray-900">{profileData.username}</h2>
                      <p className="text-gray-600">{profileData.email}</p>
                    </div>
                  </div>

                  {profileData.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <p className="mt-1 text-sm text-gray-900">{profileData.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member Since</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(profileData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(profileData.lastLoginAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                      placeholder="Tell us about yourself..."
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">
                      Avatar URL
                    </label>
                    <input
                      {...register('avatarUrl')}
                      type="url"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {errors.avatarUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.avatarUrl.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                        setSuccess('');
                        reset({
                          bio: profileData.bio || '',
                          avatarUrl: profileData.avatarUrl || '',
                        });
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                {!isAddingSkill && (
                  <button
                    onClick={() => setIsAddingSkill(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Add Skill
                  </button>
                )}
              </div>

              {isAddingSkill && (
                <form onSubmit={handleSubmitSkill(onSubmitSkill)} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="skillId" className="block text-sm font-medium text-gray-700">
                        Skill
                      </label>
                      <select
                        {...registerSkill('skillId')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      >
                        <option value="">Select a skill</option>
                        {availableSkills
                          .filter(skill => !userSkills.some(us => us.skill.id === skill.id))
                          .map((skill) => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))}
                      </select>
                      {skillErrors.skillId && (
                        <p className="mt-1 text-sm text-red-600">{skillErrors.skillId.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                        Level
                      </label>
                      <select
                        {...registerSkill('level')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      >
                        <option value="">Select level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                      {skillErrors.level && (
                        <p className="mt-1 text-sm text-red-600">{skillErrors.level.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Adding...' : 'Add Skill'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSkill(false);
                        resetSkill();
                        setError('');
                      }}
                      className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {userSkills.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No skills added</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your skills to showcase your expertise to potential team members.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userSkills.map((userSkill) => (
                    <div key={userSkill.skill.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{userSkill.skill.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(userSkill.level)}`}>
                            {userSkill.level}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSkill(userSkill.skill.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
