"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Award, Target, Gift } from "lucide-react"
import UserProfile from "@/components/gamification/user-profile"
import Leaderboard from "@/components/gamification/leaderboard"
import BadgesShowcase from "@/components/gamification/badges-showcase"
import AchievementNotification from "@/components/gamification/achievement-notification"
import { useAuth } from "@/hooks/use-auth"
import type { Badge } from "@/lib/gamification-types"

export default function GamificationPage() {
  const { user } = useAuth()
  const [newBadge, setNewBadge] = useState<Badge | null>(null)

  // Removemos completamente o useEffect que simulava o desbloqueio de badge

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Gamificação</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso, conquistas e participe do ranking de cidadãos
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-3">
            <UserProfile />
          </div>

          <div className="space-y-6">
            <Leaderboard />
            <BadgesShowcase />
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1 bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
            <Trophy className="h-12 w-12 mb-4 text-primary" />
            <h3 className="font-medium text-lg">Conquistas</h3>
            <p className="text-sm text-muted-foreground">Desbloqueie badges ao participar ativamente da plataforma</p>
          </div>

          <div className="md:col-span-1 bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
            <Award className="h-12 w-12 mb-4 text-primary" />
            <h3 className="font-medium text-lg">Níveis</h3>
            <p className="text-sm text-muted-foreground">Suba de nível e desbloqueie benefícios exclusivos</p>
          </div>

          <div className="md:col-span-1 bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
            <Target className="h-12 w-12 mb-4 text-primary" />
            <h3 className="font-medium text-lg">Desafios</h3>
            <p className="text-sm text-muted-foreground">Complete desafios para ganhar pontos e recompensas</p>
          </div>

          <div className="md:col-span-1 bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
            <Gift className="h-12 w-12 mb-4 text-primary" />
            <h3 className="font-medium text-lg">Recompensas</h3>
            <p className="text-sm text-muted-foreground">Troque seus pontos por recompensas exclusivas</p>
          </div>
        </div>
      </div>

      {newBadge && <AchievementNotification badge={newBadge} onClose={() => setNewBadge(null)} />}
    </main>
  )
}
