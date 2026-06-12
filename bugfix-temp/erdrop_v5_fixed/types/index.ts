export type ProjectStatus = 'Not Started' | 'In Progress' | 'Eligible' | 'Claimed' | 'Missed' | 'Vesting'
export type ProjectDifficulty = 'Easy' | 'Medium' | 'Hard'

export type UserPlan = 'free' | 'pro'

export interface Profile {
  id: string
  plan: UserPlan
  plan_expires_at: string | null
  subscription_id: string | null
  ai_analysis_count: number
  ai_plan_count: number
  ai_analysis_reset_at: string | null
  ai_plan_reset_at: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type ProjectType = 'Token' | 'NFT'

export interface Project {
  id: string
  user_id: string
  name: string
  project_type: ProjectType
  chain: string | null
  website: string | null
  twitter_url: string | null
  mint_price: string | null
  collection_size: string | null
  status: ProjectStatus
  difficulty: ProjectDifficulty | null
  estimated_reward: string | null
  deadline: string | null
  notes: string | null
  logo_url: string | null
  email_notified: boolean
  created_at: string
  updated_at: string
}

export type ProjectInsert = Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'email_notified'>
export type ProjectUpdate = Partial<ProjectInsert>

export type LogStatus = 'Pending' | 'Completed' | 'Claimed' | 'Failed'

export interface Log {
  id: string
  user_id: string
  project_id: string
  task: string
  wallet: string | null
  estimated_value: number | null
  status: LogStatus
  tx_hash: string | null
  notes: string | null
  logged_at: string
}

export type LogInsert = Omit<Log, 'id' | 'user_id' | 'logged_at'>
export type LogUpdate = Partial<LogInsert>

export type RecommendationType = 'SKIP' | 'WATCH' | 'FARM' | 'PRIORITY FARM'

export interface AiAnalysis {
  id: string
  project_id: string
  potential_score: number
  summary: string
  red_flags: string[]
  green_flags: string[]
  recommendation: RecommendationType
  reasoning: string
  created_at: string
}
