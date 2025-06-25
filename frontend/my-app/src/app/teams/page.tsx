'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { teamsApi } from '@/lib/api';
import { TeamMembership } from '@/types/project';

export default function MyTeamsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      fetchTeamMemberships();
    }
  }, [isAuthenticated, loading, router]);

  const fetchTeamMemberships = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const memberships = await teamsApi.getMyTeamMemberships();
      setTeamMemberships(memberships);
    } catch (err: any) {
      console.error('Error fetching team memberships:', err);
      setError(err.response?.data?.message || 'Failed to fetch team memberships');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your teams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
          <p className="mt-2 text-gray-600">
            Projects you're currently working on as a team member.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {teamMemberships.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.196M17 20H7m10 0v-2c0-5.523-4.477-10-10-10s-10 4.477-10 10v2m10 0H7m0 0v-2a3 3 0 015.196-2.196" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team memberships</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't joined any project teams yet.
              </p>
              <div className="mt-6">
                <Link
                  href="/projects"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Projects
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {teamMemberships.map((membership) => (
              <div key={membership.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {membership.project.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(membership.project.status)}`}>
                      {membership.project.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {membership.project.description}
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={membership.project.owner.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(membership.project.owner.username)}&background=3B82F6&color=fff`}
                      alt={membership.project.owner.username}
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {membership.project.owner.username}
                      </p>
                      <p className="text-xs text-gray-500">Project Owner</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Your Role</p>
                        <p className="text-sm text-blue-600">{membership.roleTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="text-sm text-gray-900">{formatDate(membership.joinedAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <Link
                      href={`/projects/${membership.project.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Project
                    </Link>
                    <span className="text-xs text-gray-500">
                      Created {formatDate(membership.project.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 