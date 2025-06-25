'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { projectsApi, teamsApi } from '@/lib/api';
import { Project, TeamMember } from '@/types/project';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [error, setError] = useState('');
  const [applyingTo, setApplyingTo] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const projectId = params.id as string;

  useEffect(() => {
    if (isAuthenticated && projectId) {
      fetchProject();
    }
  }, [isAuthenticated, projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectsApi.getProjectById(projectId);
      setProject(data);
      
      // Fetch detailed team member information
      await fetchTeamMembers(projectId);
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (projectId: string) => {
    try {
      setTeamLoading(true);
      const teamData = await teamsApi.getTeamMembers(projectId);
      setTeamMembers(teamData);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      // Don't set error for team members, just log it
    } finally {
      setTeamLoading(false);
    }
  };

  const handleApply = async () => {
    if (!project || user?.role !== 'freelancer') {
      setError('Only freelancers can apply to projects');
      return;
    }

    try {
      setApplyingTo(true);
      setError('');
      setSuccessMessage('');
      
      await projectsApi.applyToProject(project.id);
      
      setSuccessMessage('Application submitted successfully!');
      
      // Refresh project to show updated application status
      await fetchProject();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error applying to project:', err);
      const errorMessage = err.response?.data?.message || 'Failed to apply to project';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setApplyingTo(false);
    }
  };

  const hasUserApplied = () => {
    if (!project || !user) return false;
    return project.applications.some(app => app.user?.id === user.id);
  };

  const getUserApplication = () => {
    if (!project || !user) return null;
    return project.applications.find(app => app.user?.id === user.id);
  };

  const isProjectOwner = () => {
    return project?.owner.id === user?.id;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Please log in to view project details.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <p className="text-red-800 text-lg">{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Project not found.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userApplication = getUserApplication();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </button>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h1>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <img
                      src={project.owner.avatarUrl}
                      alt={project.owner.username}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span>Created by <span className="font-medium">{project.owner.username}</span></span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-4">
                {isProjectOwner() ? (
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                    You own this project
                  </span>
                ) : hasUserApplied() ? (
                  <span className={`px-4 py-2 text-sm font-medium rounded-md border ${getApplicationStatusColor(userApplication?.status || '')}`}>
                    Application {userApplication?.status?.toUpperCase()}
                  </span>
                ) : project.status === 'open' && user?.role === 'freelancer' ? (
                  <button
                    onClick={handleApply}
                    disabled={applyingTo}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {applyingTo ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Applying...
                      </>
                    ) : (
                      'Apply to Project'
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Team Members ({teamMembers.length || project.team.length})
              </h2>
              
              {teamLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading team members...</p>
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user.username}
                          className="w-12 h-12 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{member.user.username}</h4>
                              <p className="text-sm font-medium text-blue-600">{member.roleTitle}</p>
                            </div>
                            <div className="text-sm text-gray-500 text-right">
                              <p>Joined</p>
                              <p>{formatDate(member.joinedAt)}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {member.user.bio}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : project.team.length > 0 ? (
                <div className="space-y-3">
                  {project.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <img
                          src={member.user?.avatarUrl}
                          alt={member.user?.username}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{member.user?.username}</p>
                          <p className="text-sm text-gray-500">{member.roleTitle}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined {formatDate(member.joinedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No team members yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Applications</span>
                  <span className="text-lg font-bold text-gray-900">{project.applications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Team Size</span>
                  <span className="text-lg font-bold text-gray-900">{teamMembers.length || project.team.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="text-lg font-bold text-gray-900 capitalize">{project.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Applications (Only visible to project owner) */}
            {isProjectOwner() && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Applications ({project.applications.length})
                </h3>
                {project.applications.length > 0 ? (
                  <div className="space-y-3">
                    {project.applications.map((application) => (
                      <div key={application.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <img
                              src={application.user?.avatarUrl}
                              alt={application.user?.username}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            <span className="font-medium text-sm">{application.user?.username}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getApplicationStatusColor(application.status)}`}>
                            {application.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Applied {formatDate(application.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">No applications yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 