"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { School, Stethoscope, MapPin, Flame, Shield, Building2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Carregamento dinâmico do mapa para evitar problemas de SSR
const MapWithNoSSR = dynamic(() => import("./map-with-layers"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-muted rounded-md">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Carregando mapa...</p>
      </div>
    </div>
  ),
})

export default function MapComponent() {
  const [activeTab, setActiveTab] = useState("saude")
  const [viewMode, setViewMode] = useState("markers")
  const maringaPosition = [-23.4273, -51.9375] // Coordenadas de Maringá

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Mapa de Gastos</CardTitle>
            <CardDescription>Selecione uma categoria para visualizar os gastos públicos em Maringá</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
            {/* Botão de seleção para as categorias */}
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full sm:w-[200px]">
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

            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value)}
              className="w-full sm:w-auto flex sm:ml-2"
            >
              <ToggleGroupItem value="markers" aria-label="Mostrar marcadores" className="flex-1 sm:flex-none">
                <MapPin className="h-4 w-4 mr-2" />
                Marcadores
              </ToggleGroupItem>
              <ToggleGroupItem value="heatmap" aria-label="Mostrar mapa de calor" className="flex-1 sm:flex-none">
                <Flame className="h-4 w-4 mr-2" />
                Mapa de Calor
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full rounded-md overflow-hidden">
          <MapWithNoSSR center={maringaPosition} zoom={13} activeTab={activeTab} viewMode={viewMode} />
        </div>

        <div className="mt-4 p-4 bg-muted rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-red-500" />
            <h3 className="font-medium">Sobre o Mapa de Calor</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            O mapa de calor mostra a concentração de gastos públicos em diferentes regiões de Maringá. As cores indicam
            a intensidade dos gastos:
          </p>
          <div className="mt-2 grid grid-cols-5 gap-2 text-xs text-center">
            <div className="flex flex-col items-center">
              <div className="w-full h-4 bg-blue-600 rounded"></div>
              <span>Muito Baixo</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-4 bg-cyan-400 rounded"></div>
              <span>Baixo</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-4 bg-green-500 rounded"></div>
              <span>Médio</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-4 bg-yellow-400 rounded"></div>
              <span>Alto</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-4 bg-red-600 rounded"></div>
              <span>Muito Alto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
