"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { School, Stethoscope, BarChart3, PieChart, TrendingUp, Shield, Building2 } from "lucide-react"
import { healthData, educationData, securityData, administrationData } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function ComparativeCharts() {
  const [category, setCategory] = useState("saude")
  const [chartType, setChartType] = useState("bar")
  const [breakdownType, setBreakdownType] = useState("total")

  // Preparar dados para os gráficos com base na categoria selecionada
  const getCategoryData = () => {
    switch (category) {
      case "saude":
        return healthData
      case "educacao":
        return educationData
      case "seguranca":
        return securityData
      case "administracao":
        return administrationData
      default:
        return healthData
    }
  }

  const data = getCategoryData()

  // Dados para gráfico de barras/linha de gastos totais
  const totalSpendingData = data.map((item) => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
    total: item.spending.total,
  }))

  // Dados para gráfico de pizza
  const pieData = data.map((item) => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
    value: item.spending.total,
  }))

  // Dados para gráfico de barras de breakdown
  const getBreakdownData = () => {
    if (breakdownType === "total") return totalSpendingData

    // Transformar os dados para mostrar um tipo específico de gasto
    return data.map((item) => {
      const breakdownItem = item.spending.breakdown.find((b) =>
        b.label.toLowerCase().includes(breakdownType.toLowerCase()),
      )
      return {
        name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
        [breakdownType]: breakdownItem ? breakdownItem.value : 0,
      }
    })
  }

  // Obter categorias de breakdown disponíveis
  const breakdownCategories = data[0]?.spending.breakdown.map((item) => item.label) || []

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Função para obter o ícone e a cor da categoria
  const getCategoryIcon = () => {
    switch (category) {
      case "saude":
        return <Stethoscope className="h-4 w-4" />
      case "educacao":
        return <School className="h-4 w-4" />
      case "seguranca":
        return <Shield className="h-4 w-4" />
      case "administracao":
        return <Building2 className="h-4 w-4" />
      default:
        return <Stethoscope className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle>Comparativo de Gastos</CardTitle>
            <CardDescription>Análise comparativa dos gastos entre diferentes unidades</CardDescription>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-4 w-full">
            {/* Seletor de categoria */}
            <div className="w-full md:w-[180px]">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saude">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Saúde
                    </div>
                  </SelectItem>
                  <SelectItem value="educacao">
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4" />
                      Educação
                    </div>
                  </SelectItem>
                  <SelectItem value="seguranca">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Segurança
                    </div>
                  </SelectItem>
                  <SelectItem value="administracao">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Administração
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Seletor de tipo de gráfico */}
            <div className="w-full md:w-[180px]">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de Gráfico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Gráfico de Barras</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Gráfico de Linha</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Seletor de tipo de gasto */}
            {chartType !== "pie" && (
              <div className="w-full md:w-[180px]">
                <Select value={breakdownType} onValueChange={setBreakdownType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo de Gasto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Gasto Total</SelectItem>
                    {breakdownCategories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getBreakdownData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 120,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {breakdownType === "total" ? (
                  <Bar dataKey="total" fill="#3b82f6" name="Gasto Total" />
                ) : (
                  <Bar dataKey={breakdownType} fill="#3b82f6" name={breakdownType} />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === "line" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={getBreakdownData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 120,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {breakdownType === "total" ? (
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Gasto Total" />
                ) : (
                  <Line type="monotone" dataKey={breakdownType} stroke="#3b82f6" name={breakdownType} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
