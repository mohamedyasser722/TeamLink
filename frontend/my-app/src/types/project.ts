export interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  status: 'open' | 'closed' | 'completed' | 'in_progress';
  createdAt: string;
  owner: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  applications: Application[];
  team: TeamMember[];
}

export interface Application {
  id: string;
  userId?: string;
  projectId?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'closed' | 'completed' | 'in_progress';
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
  projectId: string;
  userId: string;
  roleTitle: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    bio: string;
    avatarUrl: string;
  };
}

export interface TeamMembership {
  id: string;
  projectId: string;
  userId: string;
  roleTitle: string;
  joinedAt: string;
  project: {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'closed' | 'completed' | 'in_progress';
    createdAt: string;
    owner: {
      id: string;
      username: string;
      email: string;
      avatarUrl?: string;
    };
  };
} 