// Tipos para o sistema de gamificação

// Definição de uma conquista (badge)
export interface Badge {
  id: string
  name: string
  description: string
  icon: string // Nome do ícone Lucide
  criteria: string // Descrição de como conquistar
  level: "bronze" | "prata" | "ouro" | "platina" // Nível de dificuldade
  unlockedAt?: Date // Data em que foi desbloqueada (undefined se não desbloqueada)
}

// Definição de um desafio
export interface Challenge {
  id: string
  title: string
  description: string
  icon: string
  points: number
  startDate: Date
  endDate: Date
  criteria: {
    type: "feedback_count" | "category_feedback" | "justification_length" | "login_streak"
    target: number
    category?: "saude" | "educacao"
  }
  progress: number // Progresso atual (0-100)
  completed: boolean
}

// Definição de um nível
export interface Level {
  level: number
  title: string
  minPoints: number
  maxPoints: number
  icon: string
  benefits: string[]
}

// Definição do perfil de gamificação do usuário
export interface GamificationProfile {
  userId: string
  points: number
  level: number
  badges: Badge[]
  activeChallenges: Challenge[]
  completedChallenges: Challenge[]
  stats: {
    feedbackCount: number
    healthFeedbackCount: number
    educationFeedbackCount: number
    loginStreak: number
    lastLogin: Date
    longestJustification: number
  }
}

// Definição de uma recompensa
export interface Reward {
  id: string
  title: string
  description: string
  pointsCost: number
  available: boolean
  imageUrl?: string
  expiresAt?: Date
}
