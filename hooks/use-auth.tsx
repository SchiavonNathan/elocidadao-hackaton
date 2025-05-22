"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useGamificationStore } from "@/lib/gamification-store"

// Definir a estrutura de uma transação
interface Transaction {
  date: string
  amount: number
  description: string
  local: string
  category: string
}

// Definir a estrutura de um usuário
interface User {
  cpf: string
  name: string
  credits: number
  transactions: Transaction[]
}

// Definir a interface do contexto de autenticação
interface AuthContextType {
  user: User | null
  isAuthenticated: () => boolean
  login: (cpf: string) => boolean
  register: (cpf: string, name: string) => boolean
  logout: () => void
  addCredits: (amount: number, description: string, local: string, category: string) => void
}

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provedor de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const gamificationStore = useGamificationStore()

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)

      // Inicializar perfil de gamificação apenas uma vez
      if (parsedUser) {
        // Usar setTimeout para evitar atualizações em cascata durante a renderização
        setTimeout(() => {
          gamificationStore.initializeUserProfile(parsedUser.cpf, parsedUser.name)
          gamificationStore.updateLoginStreak(parsedUser.cpf)
        }, 0)
      }
    }
  }, []) // Remover gamificationStore das dependências para evitar re-execuções

  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    return user !== null
  }

  // Fazer login com CPF
  const login = (cpf: string) => {
    // Remover formatação do CPF
    const cleanCPF = cpf.replace(/\D/g, "")

    // Verificar se o usuário existe no localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const foundUser = users.find((u: User) => u.cpf === cleanCPF)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))

      // Inicializar perfil de gamificação
      gamificationStore.initializeUserProfile(foundUser.cpf, foundUser.name)
      gamificationStore.updateLoginStreak(foundUser.cpf)

      return true
    }

    return false
  }

  // Registrar novo usuário
  const register = (cpf: string, name: string) => {
    // Remover formatação do CPF
    const cleanCPF = cpf.replace(/\D/g, "")

    // Verificar se o usuário já existe
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userExists = users.some((u: User) => u.cpf === cleanCPF)

    if (userExists) {
      return false
    }

    // Criar novo usuário
    const newUser: User = {
      cpf: cleanCPF,
      name,
      credits: 0,
      transactions: [],
    }

    // Adicionar à lista de usuários
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Fazer login com o novo usuário
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))

    // Inicializar perfil de gamificação
    gamificationStore.initializeUserProfile(newUser.cpf, newUser.name)
    gamificationStore.updateLoginStreak(newUser.cpf)

    return true
  }

  // Fazer logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // Adicionar créditos ao usuário
  const addCredits = (amount: number, description: string, local: string, category: string) => {
    if (!user) return

    // Criar nova transação
    const transaction: Transaction = {
      date: new Date().toISOString(),
      amount,
      description,
      local,
      category,
    }

    // Atualizar usuário
    const updatedUser = {
      ...user,
      credits: user.credits + amount,
      transactions: [...user.transactions, transaction],
    }

    // Atualizar estado e localStorage
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))

    // Atualizar na lista de usuários
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedUsers = users.map((u: User) => (u.cpf === user.cpf ? updatedUser : u))
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Atualizar estatísticas de gamificação
    const profile = gamificationStore.getUserProfile(user.cpf)
    if (profile) {
      // Adicionar pontos de gamificação (diferentes dos créditos)
      gamificationStore.addPoints(user.cpf, Math.floor(amount / 2), description)

      // Atualizar estatísticas
      const stats = { ...profile.stats }
      stats.feedbackCount += 1

      if (category === "saude") {
        stats.healthFeedbackCount += 1
      } else if (category === "educacao") {
        stats.educationFeedbackCount += 1
      }

      // Verificar conquistas
      if (stats.feedbackCount === 1) {
        gamificationStore.unlockBadge(user.cpf, "first_feedback")
      } else if (stats.feedbackCount === 5) {
        gamificationStore.unlockBadge(user.cpf, "feedback_5")
      } else if (stats.feedbackCount === 20) {
        gamificationStore.unlockBadge(user.cpf, "feedback_20")
      } else if (stats.feedbackCount === 50) {
        gamificationStore.unlockBadge(user.cpf, "feedback_50")
      }

      if (stats.healthFeedbackCount === 10) {
        gamificationStore.unlockBadge(user.cpf, "health_specialist")
      }

      if (stats.educationFeedbackCount === 10) {
        gamificationStore.unlockBadge(user.cpf, "education_specialist")
      }

      // Verificar justificativa detalhada
      const justificationMatch = description.match(/com justificativa detalhada/)
      if (justificationMatch) {
        gamificationStore.unlockBadge(user.cpf, "detailed_feedback")
      }

      // Atualizar progresso dos desafios
      profile.activeChallenges.forEach((challenge) => {
        if (challenge.criteria.type === "feedback_count") {
          const progress = Math.min(100, (stats.feedbackCount / challenge.criteria.target) * 100)
          gamificationStore.updateChallengeProgress(user.cpf, challenge.id, progress)
        } else if (challenge.criteria.type === "category_feedback" && challenge.criteria.category === category) {
          const count = category === "saude" ? stats.healthFeedbackCount : stats.educationFeedbackCount
          const progress = Math.min(100, (count / challenge.criteria.target) * 100)
          gamificationStore.updateChallengeProgress(user.cpf, challenge.id, progress)
        }
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, addCredits }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
