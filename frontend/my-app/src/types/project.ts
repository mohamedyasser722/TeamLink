export interface ProjectSkill {
  skillId: string;
  requiredLevel: 'beginner' | 'intermediate' | 'expert';
  skill: {
    id: string;
    name: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'in_progress' | 'completed';
  createdAt: string;
  owner?: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  ownerId?: string;
  applications?: Application[];
  team?: TeamMember[];
  projectSkills?: ProjectSkill[];
}

export interface Application {
  id: string;
  userId: string;
  projectId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'closed' | 'in_progress' | 'completed';
    createdAt: string;
    owner: {
      id: string;
      username: string;
      email: string;
      avatarUrl?: string;
    };
  };
}

export interface TeamMember {
  id: string;
  roleTitle: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface TeamMembership {
  id: string;
  roleTitle: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  project: {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'closed' | 'in_progress' | 'completed';
    createdAt: string;
    owner: {
      id: string;
      username: string;
      email: string;
      avatarUrl?: string;
    };
  };
}

export interface Skill {
  id: string;
  name: string;
}

export interface UserSkill {
  level: 'beginner' | 'intermediate' | 'expert';
  skill: Skill;
} 