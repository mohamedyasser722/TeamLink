'use client';

import { useState, useEffect } from 'react';
import { projectsApi } from '@/lib/api';

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

export default function RecommendedProjectsPage() {
  const [projects, setProjects] = useState<ProjectMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendedProjects();
  }, []);

  const fetchRecommendedProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getRecommendedProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recommended projects');
    } finally {
      setLoading(false);
    }
  };

  const applyToProject = async (projectId: string) => {
    try {
      await projectsApi.applyToProject(projectId);
      alert('Application submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to apply to project');
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRecommendedProjects}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended Projects</h1>
          <p className="text-gray-600">
            Projects that match your skills and experience level
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No recommended projects found
            </p>
            <p className="text-gray-400">
              Add skills to your profile to get better project recommendations
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Match percentage badge */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(
                      project.matchPercentage
                    )}`}
                  >
                    {project.matchPercentage}% Match
                  </span>
                  <span className="text-sm text-gray-500">
                    {project.matchedSkills}/{project.totalRequiredSkills} skills
                  </span>
                </div>

                {/* Project info */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Owner info */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    {project.owner.avatarUrl ? (
                      <img
                        src={project.owner.avatarUrl}
                        alt={project.owner.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">
                        {project.owner.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{project.owner.username}</p>
                    <p className="text-xs text-gray-500">Project Leader</p>
                  </div>
                </div>

                {/* Skill matches */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Required Skills:
                  </h4>
                  <div className="space-y-1">
                    {project.skillMatches.map((skill, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between text-xs p-2 rounded ${
                          skill.isMatch
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span>{skill.skillName}</span>
                        <div className="flex items-center space-x-1">
                          <span>Req: {skill.requiredLevel}</span>
                          {skill.userLevel && (
                            <>
                              <span>|</span>
                              <span>You: {skill.userLevel}</span>
                            </>
                          )}
                          <span>{skill.isMatch ? '✓' : '✗'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => applyToProject(project.id)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  Apply to Project
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 