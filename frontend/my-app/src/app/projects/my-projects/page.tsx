'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, teamsApi } from '@/lib/api';
import { Project, Application, TeamMember } from '@/types/project';

export default function MyProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not a leader
    if (user?.role !== 'leader') {
      router.push('/dashboard');
      return;
    }
    fetchMyProjects();
  }, [user?.role, router]);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectsApi.getMyProjects();
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectsApi.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handleApplicationAction = async (projectId: string, applicationId: string, status: 'accepted' | 'rejected', roleTitle?: string) => {
    try {
      const statusData = { status, ...(status === 'accepted' && roleTitle ? { roleTitle } : {}) };
      await projectsApi.updateApplicationStatus(projectId, applicationId, statusData);
      
      // Refresh projects to get updated data
      await fetchMyProjects();
    } catch (error: any) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  const handleUpdateTeamMember = async (projectId: string, teamId: string, newRoleTitle: string) => {
    try {
      await teamsApi.updateTeamMember(projectId, teamId, { roleTitle: newRoleTitle });
      await fetchMyProjects();
    } catch (error: any) {
      console.error('Error updating team member:', error);
      alert('Failed to update team member');
    }
  };

  const handleRemoveTeamMember = async (projectId: string, teamId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      await teamsApi.removeTeamMember(projectId, teamId);
      await fetchMyProjects();
    } catch (error: any) {
      console.error('Error removing team member:', error);
      alert('Failed to remove team member');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getApplicationStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  // Show loading while user role is being determined or while fetching projects
  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow mb-4 p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not a leader (will be redirected)
  if (user.role !== 'leader') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <button
            onClick={() => router.push('/projects/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create New Project
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Create your first project to start building your team.</p>
            <button
              onClick={() => router.push('/projects/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                        <span>{project.applications?.length || 0} applications</span>
                        <span>{project.team?.length || 0} team members</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {expandedProject === project.id ? 'Hide Details' : 'View Applications & Team'}
                  </button>

                  {expandedProject === project.id && (
                    <div className="mt-6 border-t pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Applications */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">
                            Applications ({project.applications?.length || 0})
                          </h3>
                          {project.applications && project.applications.length > 0 ? (
                            <div className="space-y-3">
                              {project.applications.map((application: Application) => (
                                <div key={application.id} className="border rounded-lg p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <img
                                          src={application.user.avatarUrl}
                                          alt={application.user.username}
                                          className="w-8 h-8 rounded-full"
                                        />
                                        <div>
                                          <p className="font-medium text-gray-900">{application.user.username}</p>
                                          <p className="text-sm text-gray-600">{application.user.email}</p>
                                        </div>
                                      </div>
                                      {application.user.bio && (
                                        <p className="text-sm text-gray-600 mb-2">{application.user.bio}</p>
                                      )}
                                      <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusBadge(application.status)}`}>
                                          {application.status}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Applied: {new Date(application.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    {application.status === 'pending' && (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => {
                                            const roleTitle = prompt('Enter role title for this team member:');
                                            if (roleTitle) {
                                              handleApplicationAction(project.id, application.id, 'accepted', roleTitle);
                                            }
                                          }}
                                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleApplicationAction(project.id, application.id, 'rejected')}
                                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No applications yet</p>
                          )}
                        </div>

                        {/* Team Members */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">
                            Team Members ({project.team?.length || 0})
                          </h3>
                          {project.team && project.team.length > 0 ? (
                            <div className="space-y-3">
                              {project.team.map((member: TeamMember) => (
                                <div key={member.id} className="border rounded-lg p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <img
                                          src={member.user.avatarUrl}
                                          alt={member.user.username}
                                          className="w-8 h-8 rounded-full"
                                        />
                                        <div>
                                          <p className="font-medium text-gray-900">{member.user.username}</p>
                                          <p className="text-sm text-gray-600">{member.user.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                          {member.roleTitle}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Joined: {new Date(member.joinedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    {member.user.id !== user?.id && (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => {
                                            const newRole = prompt('Enter new role title:', member.roleTitle);
                                            if (newRole && newRole !== member.roleTitle) {
                                              handleUpdateTeamMember(project.id, member.id, newRole);
                                            }
                                          }}
                                          className="text-blue-600 hover:text-blue-800 text-xs"
                                        >
                                          Edit Role
                                        </button>
                                        <button
                                          onClick={() => handleRemoveTeamMember(project.id, member.id)}
                                          className="text-red-600 hover:text-red-800 text-xs"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No team members yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 