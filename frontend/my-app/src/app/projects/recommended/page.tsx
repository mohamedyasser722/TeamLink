'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi } from '@/lib/api';
import Navigation from '@/components/Navigation';

interface ProjectSkillMatch {
  skillName: string;
  requiredLevel: string;
  userLevel: string;
  isMatch: boolean;
}

interface ProjectOwner {
  id: string;
  username: string;
  avatarUrl: string;
}

interface ProjectMatch {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  owner: ProjectOwner;
  skillMatches: ProjectSkillMatch[];
  matchPercentage: number;
  totalRequiredSkills: number;
  matchedSkills: number;
}

interface Application {
  id: string;
  project: {
    id: string;
  };
  status: string;
}

export default function RecommendedProjectsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectMatch[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (isAuthenticated && user?.role === 'freelancer') {
      fetchData();
    } else if (isAuthenticated && user?.role !== 'freelancer') {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, applicationsData] = await Promise.all([
        projectsApi.getRecommendedProjects(),
        projectsApi.getMyApplications()
      ]);
      setProjects(projectsData);
      setApplications(applicationsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const applyToProject = async (projectId: string) => {
    if (applyingTo) return; // Prevent multiple clicks
    
    try {
      setApplyingTo(projectId);
      await projectsApi.applyToProject(projectId);
      
      // Add to applications state
      const newApplication = {
        id: `temp-${Date.now()}`,
        project: { id: projectId },
        status: 'pending'
      };
      setApplications([...applications, newApplication]);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply to project');
      setTimeout(() => setError(null), 5000);
    } finally {
      setApplyingTo(null);
    }
  };

  const hasAppliedTo = (projectId: string) => {
    return applications.some(app => app.project.id === projectId);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    if (percentage >= 60) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    if (percentage >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
  };

  const getMatchBadge = (percentage: number) => {
    if (percentage >= 80) return '🎯 Perfect Match';
    if (percentage >= 60) return '✨ Great Match';
    if (percentage >= 40) return '👍 Good Match';
    return '💡 Partial Match';
  };

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Finding perfect projects for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter out projects user has already applied to
  const availableProjects = projects.filter(project => !hasAppliedTo(project.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recommended
            </span>{' '}
            Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover projects that perfectly match your skills and take your career to the next level
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{availableProjects.length}</div>
              <div className="text-sm text-gray-500">Available Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{applications.length}</div>
              <div className="text-sm text-gray-500">Applications Sent</div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {availableProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {applications.length > 0 ? 'Great Job!' : 'No Projects Yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {applications.length > 0 
                  ? 'You\'ve applied to all recommended projects! Check back later for new opportunities.'
                  : 'Add skills to your profile to get personalized project recommendations.'
                }
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => router.push('/projects')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse All Projects
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {availableProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
              >
                {/* Match Badge */}
                <div className="relative">
                  <div className={`${getMatchColor(project.matchPercentage)} px-6 py-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        {getMatchBadge(project.matchPercentage)}
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{project.matchPercentage}%</div>
                        <div className="text-sm opacity-90">
                          {project.matchedSkills}/{project.totalRequiredSkills} skills
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Project Title & Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Owner */}
                  <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={project.owner.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner.username)}&background=3B82F6&color=fff`}
                      alt={project.owner.username}
                    />
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">{project.owner.username}</p>
                      <p className="text-xs text-gray-500">Project Leader</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Required Skills</h4>
                    <div className="space-y-2">
                      {project.skillMatches.slice(0, 3).map((skill, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                            skill.isMatch
                              ? 'bg-green-50 text-green-800 border border-green-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          <span className="font-medium">{skill.skillName}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">
                              {skill.requiredLevel}
                              {skill.userLevel && ` → ${skill.userLevel}`}
                            </span>
                            <span className="text-lg">
                              {skill.isMatch ? '✅' : '❌'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {project.skillMatches.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{project.skillMatches.length - 3} more skills
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => applyToProject(project.id)}
                    disabled={applyingTo === project.id}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      applyingTo === project.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {applyingTo === project.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Applying...
                      </span>
                    ) : (
                      'Apply to Project 🚀'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {availableProjects.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Want More Opportunities?
              </h3>
              <p className="text-gray-600 mb-6">
                Add more skills to your profile to unlock additional project recommendations tailored to your expertise.
              </p>
              <button
                onClick={() => router.push('/profile')}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Enhance Profile ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 