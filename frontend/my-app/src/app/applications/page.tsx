'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi } from '@/lib/api';
import { Application, Project } from '@/types/project';
import Navigation from '@/components/Navigation';
import UserProfileModal from '@/components/UserProfileModal';

export default function ApplicationsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Redirect will be handled by Navigation component
      return;
    }

    if (isAuthenticated && user) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user?.role === 'leader') {
        // For leaders, fetch their projects with applications
        const projectsData = await projectsApi.getMyProjects();
        setProjects(projectsData);
        
        // Flatten all applications from all projects
        const allApplications: Application[] = [];
        projectsData.forEach((project: Project) => {
          if (project.applications) {
            project.applications.forEach((app: Application) => {
              allApplications.push({
                ...app,
                project: {
                  id: project.id,
                  title: project.title,
                  description: project.description,
                  status: project.status,
                  createdAt: project.createdAt,
                  owner: project.owner!
                }
              });
            });
          }
        });
        setApplications(allApplications);
      } else {
        // For freelancers, fetch their own applications
        const data = await projectsApi.getMyApplications();
        setApplications(data);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, status: 'accepted' | 'rejected', roleTitle?: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application || !application.project) return;

      const statusData = { status, ...(status === 'accepted' && roleTitle ? { roleTitle } : {}) };
      await projectsApi.updateApplicationStatus(application.project.id, applicationId, statusData);
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUserId(null);
  };

  const getStatusColor = (status: string) => {
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

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLeader = user?.role === 'leader';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isLeader ? 'Applications to My Projects' : 'My Applications'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isLeader 
                ? 'Review and manage applications from freelancers to your projects'
                : 'Track the status of your project applications'
              }
            </p>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow p-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {isLeader ? 'No applications yet' : 'No applications yet'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isLeader 
                    ? "No one has applied to your projects yet."
                    : "You haven't applied to any projects yet."
                  }
                </p>
                <div className="mt-6">
                  <a
                    href={isLeader ? "/projects/create" : "/projects"}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {isLeader ? 'Create Project' : 'Browse Projects'}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.project?.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProjectStatusColor(application.project?.status || '')}`}>
                            {application.project?.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {application.project?.description}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          {isLeader ? (
                            <>
                              <div className="flex items-center gap-2">
                                <img
                                  src={application.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(application.user.username)}&background=3B82F6&color=fff`}
                                  alt={application.user.username}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span>
                                  Applied by <span className="font-medium">{application.user.username}</span>
                                </span>
                                <button
                                  onClick={() => handleViewProfile(application.user.id)}
                                  className="text-blue-600 hover:text-blue-800 text-xs underline ml-2"
                                >
                                  View Profile
                                </button>
                              </div>
                              <div>
                                Applied on {formatDate(application.createdAt)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <img
                                  src={application.project?.owner.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(application.project?.owner.username || '')}&background=3B82F6&color=fff`}
                                  alt={application.project?.owner.username}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span>
                                  Project by <span className="font-medium">{application.project?.owner.username}</span>
                                </span>
                              </div>
                              <div>
                                Applied on {formatDate(application.createdAt)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-6 flex-shrink-0">
                        {isLeader && application.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const roleTitle = prompt('Enter role title for this team member:');
                                if (roleTitle) {
                                  handleApplicationAction(application.id, 'accepted', roleTitle);
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleApplicationAction(application.id, 'rejected')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            {application.status === 'accepted' && (
                              <>
                                <div className="text-green-600 font-medium text-sm">
                                  ✓ Accepted
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {isLeader ? 'Added to team' : "You're now part of this team!"}
                                </div>
                              </>
                            )}
                            {application.status === 'pending' && (
                              <>
                                <div className="text-yellow-600 font-medium text-sm">
                                  ⏳ Under Review
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Waiting for response
                                </div>
                              </>
                            )}
                            {application.status === 'rejected' && (
                              <>
                                <div className="text-red-600 font-medium text-sm">
                                  ✗ Not Selected
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {isLeader ? 'Application declined' : 'Better luck next time'}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {applications.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isLeader ? 'Applications Summary' : 'Application Summary'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                  <div className="text-sm text-gray-500">Total Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-gray-500">Accepted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications.filter(app => app.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {applications.filter(app => app.status === 'rejected').length}
                  </div>
                  <div className="text-sm text-gray-500">Rejected</div>
                </div>
              </div>
            </div>
          )}

          {/* User Profile Modal */}
          {selectedUserId && (
            <UserProfileModal
              userId={selectedUserId}
              isOpen={isProfileModalOpen}
              onClose={handleCloseProfileModal}
            />
          )}
        </div>
      </div>
    </div>
  );
} 