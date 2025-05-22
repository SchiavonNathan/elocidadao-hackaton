"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ThumbsUp, ThumbsDown, ArrowLeft, Search, Filter, Download, Users, PercentIcon, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useFeedbackStore, type Feedback } from "@/lib/feedback-data"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function FeedbackDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("todos")
  const [approvalFilter, setApprovalFilter] = useState("todos")
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [newFeedbackCount, setNewFeedbackCount] = useState(0)
  const { toast } = useToast()

  // Obter feedbacks da store
  const getFeedbacks = useFeedbackStore((state) => state.getFeedbacks)

  // Carregar feedbacks ao montar o componente e configurar listener para atualizações
  useEffect(() => {
    // Carregar feedbacks iniciais
    const initialFeedbacks = getFeedbacks()
    setFeedbacks(initialFeedbacks)

    // Configurar um intervalo para verificar novos feedbacks
    const checkForNewFeedbacks = () => {
      const currentFeedbacks = getFeedbacks()

      // Se temos mais feedbacks do que antes, atualizar o contador
      if (currentFeedbacks.length > feedbacks.length) {
        const newCount = currentFeedbacks.length - feedbacks.length
        setNewFeedbackCount(newCount)

        // Notificar o usuário sobre novos feedbacks
        toast({
          title: `${newCount} ${newCount === 1 ? "novo feedback" : "novos feedbacks"} recebido${newCount === 1 ? "" : "s"}!`,
          description: "Clique em 'Atualizar' para ver as novas opiniões.",
          duration: 5000,
        })
      }
    }

    // Verificar a cada 5 segundos (em um app real, usaríamos websockets ou polling mais eficiente)
    const interval = setInterval(checkForNewFeedbacks, 5000)

    // Limpar o intervalo ao desmontar o componente
    return () => clearInterval(interval)
  }, [feedbacks.length, getFeedbacks, toast])

  // Função para atualizar os feedbacks
  const refreshFeedbacks = () => {
    const updatedFeedbacks = getFeedbacks()
    setFeedbacks(updatedFeedbacks)
    setNewFeedbackCount(0)
  }

  // Filtrar dados com base nos filtros selecionados
  const filteredData = feedbacks.filter((item) => {
    const matchesSearch =
      item.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.justificativa?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "todos" || item.categoria === categoryFilter
    const matchesApproval =
      approvalFilter === "todos" ||
      (approvalFilter === "aprovados" && item.aprovacao === "sim") ||
      (approvalFilter === "reprovados" && item.aprovacao === "nao")

    return matchesSearch && matchesCategory && matchesApproval
  })

  // Dados para gráficos
  const approvalByCategory = [
    {
      name: "Saúde",
      aprovados: feedbacks.filter((item) => item.categoria === "saude" && item.aprovacao === "sim").length,
      reprovados: feedbacks.filter((item) => item.categoria === "saude" && item.aprovacao === "nao").length,
    },
    {
      name: "Educação",
      aprovados: feedbacks.filter((item) => item.categoria === "educacao" && item.aprovacao === "sim").length,
      reprovados: feedbacks.filter((item) => item.categoria === "educacao" && item.aprovacao === "nao").length,
    },
  ]

  const overallApprovalData = [
    { name: "Aprovados", value: feedbacks.filter((item) => item.aprovacao === "sim").length },
    { name: "Reprovados", value: feedbacks.filter((item) => item.aprovacao === "nao").length },
  ]

  const COLORS = ["#4ade80", "#f87171"]

  // Estatísticas gerais
  const totalFeedbacks = feedbacks.length
  const approvalRate =
    totalFeedbacks > 0
      ? Math.round((feedbacks.filter((item) => item.aprovacao === "sim").length / totalFeedbacks) * 100)
      : 0
  const healthFeedbacks = feedbacks.filter((item) => item.categoria === "saude").length
  const educationFeedbacks = feedbacks.filter((item) => item.categoria === "educacao").length

  // Dados de população de Maringá
  const populacaoMaringa = 409657

  // Obter usuários únicos que enviaram feedback
  const usuariosUnicos = new Set(feedbacks.map((f) => f.usuario).filter(Boolean))
  const usuariosAtivos = usuariosUnicos.size > 0 ? usuariosUnicos.size : Math.ceil(totalFeedbacks / 2)

  // Calcular porcentagem de participação
  const porcentagemParticipacao = (usuariosAtivos / populacaoMaringa) * 100

  // Exportar dados para CSV
  const exportToCSV = () => {
    const headers = ["Data", "Local", "Categoria", "Aprovação", "Justificativa", "Usuário"]
    const csvData = filteredData.map((item) => [
      formatDate(new Date(item.data)),
      item.local,
      item.categoria === "saude" ? "Saúde" : "Educação",
      item.aprovacao === "sim" ? "Aprovado" : "Reprovado",
      item.justificativa || "",
      item.usuario || "Anônimo",
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `feedback-cidadaos-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Feedback</h1>
            <p className="text-muted-foreground">
              Análise das opiniões dos cidadãos sobre os gastos públicos em Maringá
            </p>
          </div>
          {newFeedbackCount > 0 && (
            <Button
              onClick={refreshFeedbacks}
              variant="outline"
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20"
            >
              <Bell className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-medium">
                {newFeedbackCount} {newFeedbackCount === 1 ? "novo feedback" : "novos feedbacks"}
              </span>
              <span>Atualizar</span>
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFeedbacks}</div>
              <p className="text-xs text-muted-foreground">Opiniões coletadas dos cidadãos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRate}%</div>
              <p className="text-xs text-muted-foreground">Percentual de cidadãos satisfeitos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedbacks Saúde</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthFeedbacks}</div>
              <p className="text-xs text-muted-foreground">Opiniões sobre gastos em saúde</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedbacks Educação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{educationFeedbacks}</div>
              <p className="text-xs text-muted-foreground">Opiniões sobre gastos em educação</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                Participação Popular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {porcentagemParticipacao.toFixed(2)}%
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({usuariosAtivos.toLocaleString()} cidadãos)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Da população de Maringá ({populacaoMaringa.toLocaleString()} habitantes)
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Acompanhamento de Participação Popular</CardTitle>
            <CardDescription>
              Análise da participação dos cidadãos de Maringá na transparência dos gastos públicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold">{usuariosAtivos.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground text-center">Cidadãos participantes</p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <PercentIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold">{porcentagemParticipacao.toFixed(2)}%</div>
                <p className="text-sm text-muted-foreground text-center">Da população total</p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <ThumbsUp className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold">
                  {totalFeedbacks > 0 && usuariosAtivos > 0 ? (totalFeedbacks / usuariosAtivos).toFixed(1) : "0.0"}
                </div>
                <p className="text-sm text-muted-foreground text-center">Média de feedbacks por cidadão</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Sobre a Participação Popular</h3>
              <p className="text-sm text-muted-foreground">
                A participação popular é essencial para a transparência e eficiência dos gastos públicos. Atualmente,{" "}
                {porcentagemParticipacao.toFixed(2)}% da população de Maringá está engajada ativamente no acompanhamento
                e avaliação dos gastos em saúde e educação. Nossa meta é alcançar 5% de participação até o final do ano.
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="graficos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="tabela">Tabela de Feedbacks</TabsTrigger>
          </TabsList>

          <TabsContent value="graficos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Aprovação por Categoria</CardTitle>
                  <CardDescription>Comparação entre aprovações e reprovações por setor</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={approvalByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="aprovados" name="Aprovados" fill="#4ade80" />
                      <Bar dataKey="reprovados" name="Reprovados" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aprovação Geral</CardTitle>
                  <CardDescription>Distribuição geral de aprovações e reprovações</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overallApprovalData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {overallApprovalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tabela">
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks dos Cidadãos</CardTitle>
                <CardDescription>Lista detalhada de todas as opiniões coletadas</CardDescription>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por local ou justificativa..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas Categorias</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Aprovação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="aprovados">Aprovados</SelectItem>
                        <SelectItem value="reprovados">Reprovados</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={exportToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Aprovação</TableHead>
                        <TableHead className="hidden md:table-cell">Justificativa</TableHead>
                        <TableHead className="hidden lg:table-cell">Usuário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            Nenhum feedback encontrado com os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((item, index) => (
                          <TableRow
                            key={item.id}
                            className={
                              index === 0 && new Date(item.data).getTime() > Date.now() - 60000 ? "bg-primary/5" : ""
                            }
                          >
                            <TableCell>{formatDate(new Date(item.data))}</TableCell>
                            <TableCell>{item.local}</TableCell>
                            <TableCell>
                              <Badge variant={item.categoria === "saude" ? "destructive" : "default"}>
                                {item.categoria === "saude" ? "Saúde" : "Educação"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.aprovacao === "sim" ? (
                                <div className="flex items-center text-green-600">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  <span>Aprovado</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  <span>Reprovado</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-xs truncate">
                              {item.justificativa || "-"}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">{item.usuario || "Anônimo"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
