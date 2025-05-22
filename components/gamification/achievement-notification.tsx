"use client"

import { useState, useEffect } from "react"
import type { Badge } from "@/lib/gamification-types"
import { Award, X } from "lucide-react"

interface AchievementNotificationProps {
  badge: Badge
  onClose: () => void
}

export default function AchievementNotification({ badge, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animar entrada
    setTimeout(() => setIsVisible(true), 100)

    // Fechar automaticamente após 5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 500) // Dar tempo para a animação de saída
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  // Determinar cores com base no nível
  const getBadgeColors = () => {
    switch (badge.level) {
      case "bronze":
        return "bg-amber-100 border-amber-300 text-amber-800"
      case "prata":
        return "bg-gray-100 border-gray-300 text-gray-800"
      case "ouro":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "platina":
        return "bg-purple-100 border-purple-300 text-purple-800"
      default:
        return "bg-blue-100 border-blue-300 text-blue-800"
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-500 ${getBadgeColors()} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 500)
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="rounded-full p-2 bg-white/80">
          <Award className="h-6 w-6 text-yellow-600" />
        </div>

        <div>
          <h3 className="font-bold text-sm">Nova Conquista Desbloqueada!</h3>
          <p className="font-medium">{badge.name}</p>
          <p className="text-xs mt-1">{badge.description}</p>
        </div>
      </div>
    </div>
  )
}
