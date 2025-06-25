'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { projectsApi } from '@/lib/api';
import { Project } from '@/types/project';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const confirmApply = (projectId: string) => {
    if (user?.role !== 'freelancer') {
      setError('Only freelancers can apply to projects');
      return;
    }
    setShowConfirmDialog(projectId);
  };

  const handleApply = async (projectId: string) => {
    try {
      setApplyingTo(projectId);
      setError('');
      setSuccessMessage('');
      setShowConfirmDialog(null);
      
      const response = await projectsApi.applyToProject(projectId);
      
      // Show success message
      setSuccessMessage('Application submitted successfully!');
      
      // Refresh projects to show updated application status
      await fetchProjects();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error applying to project:', err);
      const errorMessage = err.response?.data?.message || 'Failed to apply to project';
      setError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setApplyingTo(null);
    }
  };

  const hasUserApplied = (project: Project) => {
    return project.applications.some(app => app.userId === user?.id);
  };

  const getUserApplication = (project: Project) => {
    return project.applications.find(app => app.userId === user?.id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Please log in to browse projects.</p>
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
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Projects</h1>
          <p className="mt-2 text-gray-600">
            Find exciting projects to join and collaborate with talented teams.
          </p>
        </div>

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const userApplication = getUserApplication(project);
            const hasApplied = hasUserApplied(project);
            const isOwner = project.ownerId === user?.id;

            return (
              <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        <Link 
                          href={`/projects/${project.id}`}
                          className="text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {project.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        {project.owner.avatarUrl ? (
                          <img
                            src={project.owner.avatarUrl}
                            alt={project.owner.username}
                            className="w-5 h-5 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {project.owner.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span>by {project.owner.username}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{project.applications.length} applications</span>
                    <span>{project.team.length} team members</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    
                    {isOwner ? (
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Your Project
                      </span>
                    ) : hasApplied ? (
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        userApplication?.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : userApplication?.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userApplication?.status === 'pending' && 'Application Pending'}
                        {userApplication?.status === 'accepted' && 'Application Accepted'}
                        {userApplication?.status === 'rejected' && 'Application Rejected'}
                      </span>
                    ) : project.status === 'open' ? (
                      <button
                        onClick={() => confirmApply(project.id)}
                        disabled={applyingTo === project.id || user?.role !== 'freelancer'}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {applyingTo === project.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Applying...
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    ) : (
                      <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects available at the moment.</p>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Application
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to apply to this project? You can track your application status in "My Applications".
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApply(showConfirmDialog)}
                  disabled={applyingTo === showConfirmDialog}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {applyingTo === showConfirmDialog ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Applying...
                    </>
                  ) : (
                    'Confirm Application'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 