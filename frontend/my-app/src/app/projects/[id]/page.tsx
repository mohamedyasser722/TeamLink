'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, skillsApi } from '@/lib/api';
import { Project } from '@/types/project';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navigation from '@/components/Navigation';

const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  status: z.enum(['open', 'in_progress', 'closed', 'completed'], {
    required_error: 'Status is required',
  }),
});

type UpdateProjectForm = z.infer<typeof updateProjectSchema>;

interface Skill {
  id: string;
  name: string;
}

interface ProjectSkill {
  skillId: string;
  requiredLevel: 'beginner' | 'intermediate' | 'expert';
  skill?: {
    id: string;
    name: string;
  };
}

interface RequiredSkill {
  skillId: string;
  requiredLevel: 'beginner' | 'intermediate' | 'expert';
}

export default function ProjectDetailPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProjectForm>({
    resolver: zodResolver(updateProjectSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (isAuthenticated) {
      fetchProject();
    }
  }, [authLoading, isAuthenticated, router, projectId]);

  // Determine if user can edit this project
  const canEdit = user && project && (
    user.role === 'leader' && project.ownerId === user.id
  );

  const fetchSkills = async () => {
    try {
      const skillsData = await skillsApi.getAllSkills();
      setSkills(skillsData);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const projectData = await projectsApi.getProjectById(projectId);
      setProject(projectData);
      
      // Set form values
      setValue('title', projectData.title);
      setValue('description', projectData.description);
      setValue('status', projectData.status);

      // Set required skills if they exist
      if (projectData.projectSkills && projectData.projectSkills.length > 0) {
        const currentSkills = projectData.projectSkills.map((ps: any) => ({
          skillId: ps.skillId,
          requiredLevel: ps.requiredLevel
        }));
        setRequiredSkills(currentSkills);
      }

      // Fetch skills if user can edit
      if (user?.role === 'leader') {
        fetchSkills();
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const addRequiredSkill = () => {
    if (!selectedSkillId) return;

    // Check if skill is already added
    const existingSkill = requiredSkills.find(skill => skill.skillId === selectedSkillId);
    if (existingSkill) {
      setError('This skill has already been added');
      return;
    }

    setRequiredSkills([...requiredSkills, {
      skillId: selectedSkillId,
      requiredLevel: selectedLevel
    }]);
    setSelectedSkillId('');
    setSelectedLevel('beginner');
    setError(null);
  };

  const removeRequiredSkill = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill.skillId !== skillId));
  };

  const getSkillName = (skillId: string) => {
    // First try to get from current project skills
    if (project?.projectSkills) {
      const projectSkill = project.projectSkills.find((ps: any) => ps.skillId === skillId);
      if (projectSkill?.skill?.name) {
        return projectSkill.skill.name;
      }
    }
    
    // Then try to get from all skills
    const skill = skills.find(s => s.id === skillId);
    return skill?.name || 'Unknown Skill';
  };

  const onSubmit = async (data: UpdateProjectForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updateData = {
        ...data,
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined
      };
      
      await projectsApi.updateProject(projectId, updateData);
      
      setIsEditing(false);
      await fetchProject(); // Refresh project data
    } catch (error: any) {
      console.error('Error updating project:', error);
      setError(error?.response?.data?.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
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
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading while auth is loading or while fetching project
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/projects')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Browse Projects
              </button>
              <button
                onClick={() => router.back()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW MODE
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created {formatDate(project.createdAt)}
                    </span>
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Edit Project
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-600">{error}</div>
                </div>
              )}

              {/* Project Owner */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Project Owner</h3>
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={project.owner?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner?.username || 'Unknown')}&background=3B82F6&color=fff`}
                    alt={project.owner?.username || 'Unknown'}
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {project.owner?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">Project Leader</p>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              </div>

              {/* Required Skills */}
              {project.projectSkills && project.projectSkills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Required Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.projectSkills.map((skill: any, index: number) => (
                      <div key={index} className="bg-blue-50 px-3 py-2 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-900">
                            {skill.skill?.name || 'Unknown Skill'}
                          </span>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full capitalize">
                            {skill.requiredLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members */}
              {project.team && project.team.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Team Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.team.map((member: any) => (
                      <div key={member.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={member.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.username)}&background=3B82F6&color=fff`}
                          alt={member.user.username}
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{member.user.username}</p>
                          <p className="text-xs text-gray-500">{member.roleTitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                             {/* Actions */}
               <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                 <button
                   onClick={() => router.back()}
                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                 >
                   Go Back
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDIT MODE (rest of the existing edit form)
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update your project details and status
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter project title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Describe your project, required skills, and what you're looking for in team members..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Project Status *
              </label>
              <select
                {...register('status')}
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="open">Open - Accepting applications</option>
                <option value="in_progress">In Progress - Team assembled, work started</option>
                <option value="closed">Closed - Project completed or cancelled</option>
                <option value="completed">Completed - Project finished successfully</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            {/* Required Skills Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Manage the skills required for this project. This helps with project matching for freelancers.
              </p>

              {/* Add Skill Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill
                    </label>
                    <select
                      value={selectedSkillId}
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">Select a skill</option>
                      {skills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Level
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value as 'beginner' | 'intermediate' | 'expert')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addRequiredSkill}
                      disabled={!selectedSkillId}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Required Skills List */}
              {requiredSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Required Skills:</h4>
                  <div className="space-y-2">
                    {requiredSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-900">{getSkillName(skill.skillId)}</span>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full capitalize">
                            {skill.requiredLevel}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRequiredSkill(skill.skillId)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {requiredSkills.length === 0 && (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                  <p className="text-sm">No required skills set for this project</p>
                  <p className="text-xs">Add skills above to help with project matching</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 