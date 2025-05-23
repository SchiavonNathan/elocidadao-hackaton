"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGamificationStore } from "@/lib/gamification-store"
import { Trophy, Medal } from "lucide-react"

export default function Leaderboard() {
  // Usar o hook corretamente
  const getLeaderboard = useGamificationStore((state) => state.getLeaderboard)
  const levels = useGamificationStore((state) => state.levels)

  // Armazenar o leaderboard em um estado local
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  // Obter o leaderboard apenas uma vez no carregamento
  useEffect(() => {
    setLeaderboard(getLeaderboard())
  }, [getLeaderboard])

  // Função para obter o título do nível
  const getLevelTitle = (level: number) => {
    return levels.find((l) => l.level === level)?.title || `Nível ${level}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking de Cidadãos
        </CardTitle>
        <CardDescription>Os cidadãos mais ativos na plataforma</CardDescription>
      </CardHeader>

      <CardContent>
        {leaderboard.length > 0 ? (
          <div className="space-y-4">
            {leaderboard.slice(0, 3).map((user, index) => (
              <div key={user.userId} className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="flex-shrink-0">
                  {index === 0 ? (
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                  ) : index === 1 ? (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Medal className="h-5 w-5 text-gray-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Medal className="h-5 w-5 text-amber-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge variant="outline" className="bg-primary/10">
                      {user.points} pontos
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{getLevelTitle(user.level)}</p>
                </div>
              </div>
            ))}

            {leaderboard.slice(3).map((user, index) => (
              <div key={user.userId} className="flex items-center gap-4 p-3 border-b last:border-0">
                <div className="flex-shrink-0 w-6 text-center font-medium text-muted-foreground">{index + 4}</div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge variant="outline">{user.points} pontos</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{getLevelTitle(user.level)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum participante ainda</h3>
            <p className="text-muted-foreground">Seja o primeiro a aparecer no ranking enviando opiniões!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
