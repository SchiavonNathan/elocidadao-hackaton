"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGamificationStore } from "@/lib/gamification-store"
import { useAuth } from "@/hooks/use-auth"
import {
  Trophy,
  Award,
  Target,
  Gift,
  Shield,
  Star,
  Calendar,
  MessageSquare,
  Stethoscope,
  GraduationCap,
  FileText,
  User,
  Users,
  UserCheck,
} from "lucide-react"

// Mapeamento de nomes de ícones para componentes
const iconMap = {
  Trophy: Trophy,
  Award: Award,
  Target: Target,
  Gift: Gift,
  Shield: Shield,
  Star: Star,
  Calendar: Calendar,
  MessageSquare: MessageSquare,
  Stethoscope: Stethoscope,
  GraduationCap: GraduationCap,
  FileText: FileText,
  User: User,
  Users: Users,
  UserCheck: UserCheck,
}

export default function UserProfile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [rewards, setRewards] = useState<any[]>([])

  // Armazenar o perfil em um estado local
  const [profile, setProfile] = useState<any>(null)

  // Usar o hook corretamente
  const getUserProfile = useGamificationStore((state) => state.getUserProfile)
  const initializeUserProfile = useGamificationStore((state) => state.initializeUserProfile)
  const updateLoginStreak = useGamificationStore((state) => state.updateLoginStreak)
  const levels = useGamificationStore((state) => state.levels)
  const redeemReward = useGamificationStore((state) => state.redeemReward)
  const storeRewards = useGamificationStore((state) => state.rewards)

  // Calcular valores derivados usando useMemo para evitar recálculos desnecessários
  const { currentLevel, nextLevel, levelProgress } = useMemo(() => {
    if (!profile || !levels) {
      return { currentLevel: null, nextLevel: null, levelProgress: 0 }
    }
    const currentLevel = levels.find((l) => l.level === profile.level)
    const nextLevel = levels.find((l) => l.level === profile.level + 1)

    // Calcular progresso para o próximo nível
    const levelProgress = nextLevel
      ? Math.min(
          100,
          Math.max(
            0,
            ((profile.points - currentLevel!.minPoints) / (nextLevel.minPoints - currentLevel!.minPoints)) * 100,
          ),
        )
      : 100

    return { currentLevel, nextLevel, levelProgress }
  }, [profile, levels])

  // Inicializar perfil de gamificação se necessário
  useEffect(() => {
    if (user) {
      // Inicializar perfil se não existir
      initializeUserProfile(user.cpf, user.name)

      // Atualizar streak de login
      setTimeout(() => {
        updateLoginStreak(user.cpf)
      }, 0)

      // Obter perfil atualizado
      const userProfile = getUserProfile(user.cpf)
      setProfile(userProfile)

      // Obter recompensas
      setRewards(storeRewards)
    }
  }, [user, initializeUserProfile, updateLoginStreak, getUserProfile, storeRewards])

  // Se não houver usuário ou perfil, mostrar mensagem
  if (!user || !profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-6">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Perfil não disponível</h3>
            <p className="text-muted-foreground">Faça login para visualizar seu perfil de gamificação.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar ícone dinâmico
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Trophy
    return <IconComponent className="h-5 w-5" />
  }

  // Handler para resgatar recompensa
  const handleRedeemReward = (rewardId: string) => {
    if (user && rewardId) {
      const success = redeemReward(user.cpf, rewardId)
      if (success) {
        // Atualizar o perfil após resgatar a recompensa
        setTimeout(() => {
          const updatedProfile = getUserProfile(user.cpf)
          setProfile(updatedProfile)

          // Atualizar recompensas
          setRewards(storeRewards.map((r) => ({ ...r })))
        }, 0)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Seu Perfil de Gamificação
        </CardTitle>
        <CardDescription>Acompanhe seu progresso, conquistas e desafios</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="badges">Conquistas</TabsTrigger>
            <TabsTrigger value="challenges">Desafios</TabsTrigger>
            <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            {/* Informações do nível */}
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {currentLevel && renderIcon(currentLevel.icon)}
                  <h3 className="font-medium">{currentLevel?.title || "Cidadão Iniciante"}</h3>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Nível {profile.level}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{profile.points} pontos</span>
                  {nextLevel && <span>{nextLevel.minPoints} pontos para o próximo nível</span>}
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>

              {nextLevel && (
                <div className="mt-4 text-sm">
                  <p className="font-medium">Próximo nível: {nextLevel.title}</p>
                  <p className="text-muted-foreground">
                    Faltam {nextLevel.minPoints - profile.points} pontos para o nível {nextLevel.level}
                  </p>
                </div>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{profile.stats.feedbackCount}</div>
                    <p className="text-sm text-muted-foreground">Opiniões enviadas</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{profile.badges.length}</div>
                    <p className="text-sm text-muted-foreground">Conquistas desbloqueadas</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{profile.completedChallenges.length}</div>
                    <p className="text-sm text-muted-foreground">Desafios completados</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{profile.stats.loginStreak}</div>
                    <p className="text-sm text-muted-foreground">Dias consecutivos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefícios do nível atual */}
            {currentLevel && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Benefícios do seu nível</h3>
                <ul className="space-y-2">
                  {currentLevel.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.badges.length > 0 ? (
                profile.badges.map((badge) => (
                  <Card key={badge.id} className="overflow-hidden">
                    <div
                      className={`h-2 ${
                        badge.level === "bronze"
                          ? "bg-amber-600"
                          : badge.level === "prata"
                            ? "bg-gray-400"
                            : badge.level === "ouro"
                              ? "bg-yellow-500"
                              : "bg-purple-600"
                      }`}
                    />
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-full p-3 ${
                            badge.level === "bronze"
                              ? "bg-amber-100 text-amber-600"
                              : badge.level === "prata"
                                ? "bg-gray-100 text-gray-600"
                                : badge.level === "ouro"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {renderIcon(badge.icon)}
                        </div>
                        <div>
                          <h3 className="font-medium">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          {badge.unlockedAt && (
                            <p className="text-xs mt-2">
                              Desbloqueado em {new Date(badge.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center p-8">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma conquista ainda</h3>
                  <p className="text-muted-foreground">
                    Participe ativamente enviando opiniões para desbloquear conquistas.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="pt-4">
            <div className="space-y-4">
              {profile.activeChallenges.length > 0 ? (
                profile.activeChallenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full p-3 bg-primary/10 text-primary">{renderIcon(challenge.icon)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{challenge.title}</h3>
                            <Badge variant="outline">{challenge.points} pontos</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progresso: {challenge.progress}%</span>
                              <span>
                                Termina em{" "}
                                {Math.ceil(
                                  (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                                )}{" "}
                                dias
                              </span>
                            </div>
                            <Progress value={challenge.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhum desafio ativo</h3>
                  <p className="text-muted-foreground">
                    Você completou todos os desafios disponíveis. Novos desafios serão adicionados em breve!
                  </p>
                </div>
              )}

              {profile.completedChallenges.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Desafios Completados</h3>
                  <div className="space-y-2">
                    {profile.completedChallenges.map((challenge) => (
                      <div key={challenge.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          {renderIcon(challenge.icon)}
                          <span>{challenge.title}</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          +{challenge.points} pontos
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full p-3 bg-primary/10 text-primary">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{reward.title}</h3>
                          <Badge variant="outline">{reward.pointsCost} pontos</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>

                        <Button
                          variant={reward.available ? "default" : "outline"}
                          className="w-full"
                          disabled={!reward.available || profile.points < reward.pointsCost}
                          onClick={() => handleRedeemReward(reward.id)}
                        >
                          {reward.available
                            ? profile.points >= reward.pointsCost
                              ? "Resgatar Recompensa"
                              : `Faltam ${reward.pointsCost - profile.points} pontos`
                            : "Resgatado"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
