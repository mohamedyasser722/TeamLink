'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, skillsApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

interface Skill {
  id: string;
  name: string;
}

interface RequiredSkill {
  skillId: string;
  requiredLevel: 'beginner' | 'intermediate' | 'expert';
}

export default function CreateProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
  });

  // Redirect if not a leader and fetch skills
  useEffect(() => {
    if (user?.role !== 'leader') {
      router.push('/dashboard');
    } else {
      fetchSkills();
    }
  }, [user?.role, router]);

  const fetchSkills = async () => {
    try {
      const skillsData = await skillsApi.getAllSkills();
      setSkills(skillsData);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  // Don't render anything if user is not a leader (will be redirected)
  if (!user || user.role !== 'leader') {
    return null;
  }

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
    const skill = skills.find(s => s.id === skillId);
    return skill?.name || 'Unknown Skill';
  };

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const projectData = {
        ...data,
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined
      };
      
      await projectsApi.createProjectWithSkills(projectData);
      
      // Redirect to my projects page
      router.push('/projects/my-projects');
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error?.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create a new project and start building your team
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

            {/* Required Skills Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Add skills that are required for this project. This will help freelancers see if they're a good match.
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

              {/* Required Skills List */}
              {requiredSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
                  <div className="space-y-2">
                    {requiredSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-900">{getSkillName(skill.skillId)}</span>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
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
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 