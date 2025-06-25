'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { useEffect, useState } from 'react';
import { projectsApi, teamsApi, usersApi } from '@/lib/api';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Dashboard stats state
  const [stats, setStats] = useState({
    applications: 0,
    teams: 0,
    skills: 0,
    projects: 0, // for leaders
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      // Fetch skills (for both roles)
      const skillsPromise = usersApi.getMySkills();
      
      // Fetch teams (for both roles)
      const teamsPromise = teamsApi.getMyTeamMemberships();
      
      // Fetch applications or projects based on role
      let applicationsOrProjectsPromise;
      if (user?.role === 'leader') {
        applicationsOrProjectsPromise = projectsApi.getMyProjects();
      } else {
        applicationsOrProjectsPromise = projectsApi.getMyApplications();
      }

      const [skills, teams, applicationsOrProjects] = await Promise.all([
        skillsPromise,
        teamsPromise,
        applicationsOrProjectsPromise,
      ]);



      setStats({
        skills: skills.length,
        teams: teams.length,
        applications: user?.role === 'freelancer' ? applicationsOrProjects.length : 0,
        projects: user?.role === 'leader' ? applicationsOrProjects.length : 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your projects and applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === 'leader' ? 'Projects Created' : 'Applications Sent'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                      ) : (
                        user?.role === 'leader' ? stats.projects : stats.applications
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Teams Joined
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                      ) : (
                        stats.teams
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Skills
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                      ) : (
                        stats.skills
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role === 'leader' ? (
              <>
                <Link
                  href="/projects/create"
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Create Project
                </Link>
                <Link
                  href="/projects/my-projects"
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  My Projects
                </Link>
                <Link
                  href="/teams"
                  className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center"
                >
                  My Teams
                </Link>
                <Link
                  href="/profile"
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
                >
                  Profile Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/projects"
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Browse Projects
                </Link>
                <Link
                  href="/applications"
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  My Applications
                </Link>
                <Link
                  href="/teams"
                  className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center"
                >
                  My Teams
                </Link>
                <Link
                  href="/profile"
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
                >
                  Update Profile
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center py-8">
              No recent activity. Start by {user?.role === 'leader' ? 'creating a project' : 'applying to projects'}!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 