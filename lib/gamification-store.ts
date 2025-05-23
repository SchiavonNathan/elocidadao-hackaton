import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Badge, Challenge, Level, GamificationProfile, Reward } from "./gamification-types"
import { defaultBadges, defaultChallenges, defaultLevels, defaultRewards } from "./gamification-data"

interface GamificationStore {
  // Dados do sistema
  badges: Badge[]
  challenges: Challenge[]
  levels: Level[]
  rewards: Reward[]

  // Perfis dos usuários
  userProfiles: Record<string, GamificationProfile>

  // Ações
  getUserProfile: (userId: string) => GamificationProfile | null
  initializeUserProfile: (userId: string, name: string) => void
  addPoints: (userId: string, points: number, reason: string) => void
  unlockBadge: (userId: string, badgeId: string) => void
  updateChallengeProgress: (userId: string, challengeId: string, progress: number) => void
  completeChallenges: (userId: string) => void
  checkForLevelUp: (userId: string) => boolean
  updateLoginStreak: (userId: string) => void
  redeemReward: (userId: string, rewardId: string) => boolean

  // Estatísticas globais
  getLeaderboard: () => { userId: string; name: string; points: number; level: number }[]
  getMostPopularBadges: () => { badgeId: string; count: number }[]
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      badges: defaultBadges,
      challenges: defaultChallenges,
      levels: defaultLevels,
      rewards: defaultRewards,
      userProfiles: {},

      getUserProfile: (userId: string) => {
        const profiles = get().userProfiles
        return profiles[userId] || null
      },

      initializeUserProfile: (userId: string, name: string) => {
        const profiles = get().userProfiles

        // Verificar se o perfil já existe antes de inicializar
        if (!profiles[userId]) {
          const newProfile: GamificationProfile = {
            userId,
            points: 0,
            level: 1,
            badges: [],
            activeChallenges: [...get().challenges.slice(0, 3)], // Primeiros 3 desafios
            completedChallenges: [],
            stats: {
              feedbackCount: 0,
              healthFeedbackCount: 0,
              educationFeedbackCount: 0,
              loginStreak: 1,
              lastLogin: new Date(),
              longestJustification: 0,
            },
          }

          set({
            userProfiles: {
              ...profiles,
              [userId]: newProfile,
            },
          })
        }
      },

      addPoints: (userId: string, points: number, reason: string) => {
        const profiles = get().userProfiles
        const profile = profiles[userId]

        if (profile) {
          const updatedProfile = {
            ...profile,
            points: profile.points + points,
          }

          set({
            userProfiles: {
              ...profiles,
              [userId]: updatedProfile,
            },
          })

          // Verificar se subiu de nível
          get().checkForLevelUp(userId)
        }
      },

      unlockBadge: (userId: string, badgeId: string) => {
        const profiles = get().userProfiles
        const profile = profiles[userId]
        const allBadges = get().badges

        if (profile) {
          // Verificar se o badge já está desbloqueado
          const hasBadge = profile.badges.some((b) => b.id === badgeId)

          if (!hasBadge) {
            const badge = allBadges.find((b) => b.id === badgeId)

            if (badge) {
              const updatedBadge = {
                ...badge,
                unlockedAt: new Date(),
              }

              const updatedProfile = {
                ...profile,
                badges: [...profile.badges, updatedBadge],
                // Dar pontos por desbloquear badge
                points:
                  profile.points +
                  (badge.level === "bronze" ? 10 : badge.level === "prata" ? 25 : badge.level === "ouro" ? 50 : 100), // platina
              }

              set({
                userProfiles: {
                  ...profiles,
                  [userId]: updatedProfile,
                },
              })

              // Verificar se subiu de nível
              get().checkForLevelUp(userId)
            }
          }
        }
      },

      updateChallengeProgress: (userId: string, challengeId: string, progress: number) => {
        const profiles = get().userProfiles
        const profile = profiles[userId]

        if (profile) {
          const updatedActiveChallenges = profile.activeChallenges.map((challenge) => {
            if (challenge.id === challengeId) {
              return {
                ...challenge,
                progress: Math.min(100, progress),
                completed: progress >= 100,
              }
            }
            return challenge
          })

          set({
            userProfiles: {
              ...profiles,
              [userId]: {
                ...profile,
                activeChallenges: updatedActiveChallenges,
              },
            },
          })

          // Verificar se completou desafios
          get().completeChallenges(userId)
        }
      },

      completeChallenges: (userId: string) => {
        const profiles = get().userProfiles
        const profile = profiles[userId]

        if (profile) {
          // Separar desafios completados dos ativos
          const completedChallenges = profile.activeChallenges.filter((c) => c.completed)
          const stillActiveChallenges = profile.activeChallenges.filter((c) => !c.completed)

          // Adicionar pontos por desafios completados
          let pointsToAdd = 0
          completedChallenges.forEach((challenge) => {
            pointsToAdd += challenge.points
          })

          // Atualizar o perfil
          set({
            userProfiles: {
              ...profiles,
              [userId]: {
                ...profile,
                points: profile.points + pointsToAdd,
                activeChallenges: stillActiveChallenges,
                completedChallenges: [...profile.completedChallenges, ...completedChallenges],
              },
            },
          })

          // Verificar se subiu de nível
          get().checkForLevelUp(userId)
        }
      },

      checkForLevelUp: (userId: string) => {
        const profiles = get().userProfiles
        const profile = profiles[userId]
        const levels = get().levels

        if (profile) {
          // Encontrar o nível correto com base nos pontos
          const newLevel =
            levels.find((level) => profile.points >= level.minPoints && profile.points <= level.maxPoints)?.level ||
            profile.level

          // Se subiu de nível
          if (newLevel > profile.level) {
            set({
              userProfiles: {
                ...profiles,
                [userId]: {
                  ...profile,
                  level: newLevel,
                },
              },
            })
            return true
          }
        }
        return false
      },

      updateLoginStreak: (userId: string) => {
        const profiles = get().userProfiles
        const profile = profiles[userId]

        if (profile) {
          const now = new Date()
          const lastLogin = new Date(profile.stats.lastLogin)

          // Verificar se já atualizou hoje para evitar múltiplas atualizações
          const isSameDay =
            now.getDate() === lastLogin.getDate() &&
            now.getMonth() === lastLogin.getMonth() &&
            now.getFullYear() === lastLogin.getFullYear()

          // Só atualizar se não for o mesmo dia
          if (!isSameDay) {
            // Verificar se é um novo dia (mais de 20h desde o último login)
            const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)

            let newStreak = profile.stats.loginStreak

            if (hoursSinceLastLogin >= 20 && hoursSinceLastLogin <= 48) {
              // Incrementar streak se for um novo dia (entre 20h e 48h)
              newStreak += 1
            } else if (hoursSinceLastLogin > 48) {
              // Resetar streak se passou mais de 48h
              newStreak = 1
            }

            set({
              userProfiles: {
                ...profiles,
                [userId]: {
                  ...profile,
                  stats: {
                    ...profile.stats,
                    loginStreak: newStreak,
                    lastLogin: now,
                  },
                },
              },
            })
          }
        }
      },

      redeemReward: (userId: string, rewardId: string) => {
        const profiles = get().userProfiles
        const profile = profiles[userId]
        const rewards = get().rewards

        if (profile) {
          const reward = rewards.find((r) => r.id === rewardId)

          if (reward && reward.available && profile.points >= reward.pointsCost) {
            // Deduzir pontos e marcar recompensa como resgatada
            set({
              userProfiles: {
                ...profiles,
                [userId]: {
                  ...profile,
                  points: profile.points - reward.pointsCost,
                },
              },
              rewards: rewards.map((r) => (r.id === rewardId ? { ...r, available: false } : r)),
            })
            return true
          }
        }
        return false
      },

      getLeaderboard: () => {
        const profiles = get().userProfiles

        return Object.values(profiles)
          .map((profile) => ({
            userId: profile.userId,
            name: profile.userId.split("_")[1] || "Usuário",
            points: profile.points,
            level: profile.level,
          }))
          .sort((a, b) => b.points - a.points)
          .slice(0, 10) // Top 10
      },

      getMostPopularBadges: () => {
        const profiles = get().userProfiles
        const badgeCounts: Record<string, number> = {}

        // Contar ocorrências de cada badge
        Object.values(profiles).forEach((profile) => {
          profile.badges.forEach((badge) => {
            badgeCounts[badge.id] = (badgeCounts[badge.id] || 0) + 1
          })
        })

        // Converter para array e ordenar
        return Object.entries(badgeCounts)
          .map(([badgeId, count]) => ({ badgeId, count }))
          .sort((a, b) => b.count - a.count)
      },
    }),
    {
      name: "gamification-storage",
    },
  ),
)
