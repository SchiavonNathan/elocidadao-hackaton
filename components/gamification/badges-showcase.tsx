"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useGamificationStore } from "@/lib/gamification-store"
import { Award } from "lucide-react"

export default function BadgesShowcase() {
  // Usar o hook corretamente em vez de getState()
  const badges = useGamificationStore((state) => state.badges)
  const getMostPopularBadges = useGamificationStore((state) => state.getMostPopularBadges)

  // Armazenar os badges populares em um estado local
  const [topBadges, setTopBadges] = useState<any[]>([])

  // Calcular os badges populares apenas uma vez no carregamento ou quando necessário
  useEffect(() => {
    const popularBadges = getMostPopularBadges()
    const top = popularBadges
      .slice(0, 5)
      .map((item) => {
        const badge = badges.find((b) => b.id === item.badgeId)
        return badge ? { ...badge, count: item.count } : null
      })
      .filter(Boolean) // Filtrar undefined

    setTopBadges(top)
  }, [badges, getMostPopularBadges])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Conquistas Populares
        </CardTitle>
        <CardDescription>As conquistas mais obtidas pelos cidadãos</CardDescription>
      </CardHeader>

      <CardContent>
        {topBadges.length > 0 ? (
          <div className="space-y-4">
            {topBadges.map((badge: any) => (
              <div key={badge.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div
                  className={`rounded-full p-2 ${
                    badge.level === "bronze"
                      ? "bg-amber-100 text-amber-600"
                      : badge.level === "prata"
                        ? "bg-gray-100 text-gray-600"
                        : badge.level === "ouro"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-purple-100 text-purple-600"
                  }`}
                >
                  <Award className="h-4 w-4" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm">{badge.name}</h3>
                    <span className="text-xs text-muted-foreground">{badge.count} cidadãos</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <Award className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma conquista desbloqueada ainda. Seja o primeiro!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
