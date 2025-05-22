"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Clock, ThumbsUp, Award } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { formatDate } from "@/lib/utils"

interface UserWalletProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserWallet({ isOpen, onClose }: UserWalletProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Sua Carteira de Créditos
          </DialogTitle>
          <DialogDescription>
            Acompanhe seus créditos ganhos por contribuir com opiniões sobre os gastos públicos.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 py-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Saldo de Créditos</CardTitle>
                <CardDescription>Seus créditos acumulados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">{user.credits}</div>
                    <p className="text-sm text-muted-foreground">créditos disponíveis</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{user.transactions.length}</div>
                    <p className="text-xs text-muted-foreground">opiniões enviadas</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">
                      {user.transactions.reduce((total, transaction) => total + transaction.amount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">créditos ganhos no total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Como ganhar mais créditos?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Ganhe 10 créditos cada vez que enviar uma opinião sobre os gastos públicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Ganhe 5 créditos extras ao fornecer uma justificativa detalhada</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="history" className="py-4">
            <div className="rounded-md border">
              <div className="p-4 bg-muted">
                <h3 className="font-medium">Histórico de Transações</h3>
              </div>
              {user.transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Você ainda não tem transações.</p>
                  <p className="text-sm">Contribua com sua opinião para ganhar créditos!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {user.transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction, index) => (
                      <div key={index} className="p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(new Date(transaction.date))}</div>
                        </div>
                        <div className="text-primary font-bold">+{transaction.amount} créditos</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
