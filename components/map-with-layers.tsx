"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Icon, DivIcon } from "leaflet"
import { healthData, educationData, securityData, administrationData } from "@/lib/data"
import MarkerPopup from "./marker-popup"

import "leaflet/dist/leaflet.css"

// Ícones personalizados para cada setor
const healthIcon = new Icon({
  iconUrl: "/icons/hospital-marker.png", // Caminho para o ícone de saúde
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [32, 37], // Tamanho do ícone
  iconAnchor: [16, 37], // Ponto do ícone que corresponderá à localização do marcador
  popupAnchor: [0, -37], // Ponto a partir do qual o popup deve abrir em relação ao iconAnchor
  shadowSize: [41, 41],
})

const educationIcon = new Icon({
  iconUrl: "/icons/school-marker.png", // Caminho para o ícone de educação
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -37],
  shadowSize: [41, 41],
})

const securityIcon = new Icon({
  iconUrl: "/icons/security-marker.png", // Caminho para o ícone de segurança
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -37],
  shadowSize: [41, 41],
})

const administrationIcon = new Icon({
  iconUrl: "/icons/admin-marker.png", // Caminho para o ícone de administração
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -37],
  shadowSize: [41, 41],
})

// Ícones alternativos usando DivIcon com SVG inline (caso as imagens não estejam disponíveis)
const createSvgIcon = (color, symbol) => {
  return new DivIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        <text x="12" y="10" fontSize="8" textAnchor="middle" fill="white">${symbol}</text>
      </svg>
    `,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

// Criar ícones SVG alternativos
const healthSvgIcon = createSvgIcon("#e53935", "H") // Vermelho com H para Hospital/Saúde
const educationSvgIcon = createSvgIcon("#1e88e5", "E") // Azul com E para Escola/Educação
const securitySvgIcon = createSvgIcon("#43a047", "S") // Verde com S para Segurança
const administrationSvgIcon = createSvgIcon("#fb8c00", "A") // Laranja com A para Administração

// Cores para o heatmap
const heatmapGradient = {
  0.1: "#0000ff", // Azul intenso (valor baixo)
  0.3: "#00ffff", // Ciano
  0.5: "#00ff00", // Verde
  0.7: "#ffff00", // Amarelo
  0.9: "#ff0000", // Vermelho intenso (valor alto)
}

// Hook personalizado para carregar scripts externos
function useScript(src) {
  const [status, setStatus] = useState(src ? "loading" : "idle")

  useEffect(() => {
    if (!src) {
      setStatus("idle")
      return
    }

    // Evitar carregar o script várias vezes
    let script = document.querySelector(`script[src="${src}"]`)

    if (!script) {
      script = document.createElement("script")
      script.src = src
      script.async = true
      script.setAttribute("data-status", "loading")
      document.body.appendChild(script)

      // Adicionar event listeners
      const setAttributeFromEvent = (event) => {
        script.setAttribute("data-status", event.type === "load" ? "ready" : "error")
      }

      script.addEventListener("load", setAttributeFromEvent)
      script.addEventListener("error", setAttributeFromEvent)
    } else {
      // Reutilizar script existente
      setStatus(script.getAttribute("data-status"))
    }

    // Script event handler to update status in state
    const setStateFromEvent = (event) => {
      setStatus(event.type === "load" ? "ready" : "error")
    }

    // Add event listeners
    script.addEventListener("load", setStateFromEvent)
    script.addEventListener("error", setStateFromEvent)

    // Remove event listeners on cleanup
    return () => {
      if (script) {
        script.removeEventListener("load", setStateFromEvent)
        script.removeEventListener("error", setStateFromEvent)
      }
    }
  }, [src])

  return status
}

// Implementação simplificada do heatmap sem depender da biblioteca externa
function SimpleHeatmapLayer({ points, radius = 35, blur = 15, visible = true }) {
  const map = useMap()
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!visible || !points.length) return

    // Criar um elemento canvas para desenhar o heatmap
    const canvas = document.createElement("canvas")
    canvas.style.position = "absolute"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "400"
    canvas.width = map.getSize().x
    canvas.height = map.getSize().y
    canvasRef.current = canvas

    // Adicionar o canvas ao container do mapa
    map.getPanes().overlayPane.appendChild(canvas)

    // Função para desenhar o heatmap
    const drawHeatmap = () => {
      const ctx = canvas.getContext("2d")
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Para cada ponto, desenhar um círculo com gradiente radial
      points.forEach((point) => {
        const latLng = [point[0], point[1]]
        const intensity = point[2] || 0.5
        const pixelPoint = map.latLngToContainerPoint(latLng)

        // Criar gradiente radial
        const gradient = ctx.createRadialGradient(pixelPoint.x, pixelPoint.y, 0, pixelPoint.x, pixelPoint.y, radius)

        // Definir cores do gradiente baseado na intensidade
        const color = getColorForIntensity(intensity)
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`)
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

        // Desenhar círculo
        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(pixelPoint.x, pixelPoint.y, radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Função para obter cor baseada na intensidade
    const getColorForIntensity = (intensity) => {
      // Mapear intensidade para cores RGB
      if (intensity < 0.2) {
        return { r: 0, g: 0, b: 255 } // Azul
      } else if (intensity < 0.4) {
        return { r: 0, g: 255, b: 255 } // Ciano
      } else if (intensity < 0.6) {
        return { r: 0, g: 255, b: 0 } // Verde
      } else if (intensity < 0.8) {
        return { r: 255, g: 255, b: 0 } // Amarelo
      } else {
        return { r: 255, g: 0, b: 0 } // Vermelho
      }
    }

    // Desenhar inicialmente e adicionar listeners para redesenhar quando o mapa mudar
    drawHeatmap()
    map.on("moveend", drawHeatmap)
    map.on("zoomend", drawHeatmap)
    map.on("resize", drawHeatmap)

    // Cleanup
    return () => {
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current)
      }
      map.off("moveend", drawHeatmap)
      map.off("zoomend", drawHeatmap)
      map.off("resize", drawHeatmap)
    }
  }, [map, points, radius, blur, visible])

  return null
}

// HeatmapLayer component que tenta usar leaflet.heat, mas cai para SimpleHeatmapLayer se não disponível
function HeatmapLayer({ points, radius = 35, blur = 15, max = 1.0, visible = true }) {
  const map = useMap()
  const [usingFallback, setUsingFallback] = useState(false)
  const scriptStatus = useScript("https://unpkg.com/leaflet.heat/dist/leaflet-heat.js")

  useEffect(() => {
    if (!visible || scriptStatus !== "ready") return

    try {
      // Verificar se a biblioteca leaflet.heat está disponível
      if (window.L && window.L.heatLayer) {
        // Aumentar a intensidade dos pontos para tornar o heatmap mais visível
        const intensifiedPoints = points.map((point) => [
          point[0],
          point[1],
          point[2] * 1.5, // Aumentar a intensidade em 50%
        ])

        // Create heatmap layer
        const heatLayer = window.L.heatLayer(intensifiedPoints, {
          radius,
          blur,
          max,
          gradient: heatmapGradient,
          minOpacity: 0.5, // Aumentar a opacidade mínima
        })

        // Add to map
        heatLayer.addTo(map)

        // Cleanup on unmount
        return () => {
          map.removeLayer(heatLayer)
        }
      } else {
        console.warn("Leaflet.heat não está disponível. Usando implementação alternativa.")
        setUsingFallback(true)
      }
    } catch (error) {
      console.error("Erro ao usar Leaflet.heat:", error)
      setUsingFallback(true)
    }
  }, [map, points, radius, blur, max, visible, scriptStatus])

  // Se o script falhar ou não estiver disponível, usar a implementação alternativa
  if (usingFallback || scriptStatus === "error" || scriptStatus === "loading") {
    return <SimpleHeatmapLayer points={points} radius={radius} blur={blur} visible={visible} />
  }

  return null
}

// Componentes para renderizar os marcadores
function HealthMarkers() {
  // Verificar se as imagens dos ícones estão disponíveis
  const [iconError, setIconError] = useState(false)

  useEffect(() => {
    // Verificar se o ícone de saúde está disponível
    const img = new Image()
    img.src = "/icons/hospital-marker.png"
    img.onerror = () => setIconError(true)
  }, [])

  return (
    <>
      {healthData.map((item) => (
        <Marker key={item.id} position={item.position} icon={iconError ? healthSvgIcon : healthIcon}>
          <Popup closeOnClick={false}>
            <MarkerPopup
              title={item.name}
              type="UBS"
              address={item.address}
              spending={item.spending}
              category="saude"
            />
          </Popup>
        </Marker>
      ))}
    </>
  )
}

function EducationMarkers() {
  // Verificar se as imagens dos ícones estão disponíveis
  const [iconError, setIconError] = useState(false)

  useEffect(() => {
    // Verificar se o ícone de educação está disponível
    const img = new Image()
    img.src = "/icons/school-marker.png"
    img.onerror = () => setIconError(true)
  }, [])

  return (
    <>
      {educationData.map((item) => (
        <Marker key={item.id} position={item.position} icon={iconError ? educationSvgIcon : educationIcon}>
          <Popup closeOnClick={false}>
            <MarkerPopup
              title={item.name}
              type="Escola"
              address={item.address}
              spending={item.spending}
              category="educacao"
            />
          </Popup>
        </Marker>
      ))}
    </>
  )
}

function SecurityMarkers() {
  // Verificar se as imagens dos ícones estão disponíveis
  const [iconError, setIconError] = useState(false)

  useEffect(() => {
    // Verificar se o ícone de segurança está disponível
    const img = new Image()
    img.src = "/icons/security-marker.png"
    img.onerror = () => setIconError(true)
  }, [])

  return (
    <>
      {securityData.map((item) => (
        <Marker key={item.id} position={item.position} icon={iconError ? securitySvgIcon : securityIcon}>
          <Popup closeOnClick={false}>
            <MarkerPopup
              title={item.name}
              type="Segurança"
              address={item.address}
              spending={item.spending}
              category="seguranca"
            />
          </Popup>
        </Marker>
      ))}
    </>
  )
}

function AdministrationMarkers() {
  // Verificar se as imagens dos ícones estão disponíveis
  const [iconError, setIconError] = useState(false)

  useEffect(() => {
    // Verificar se o ícone de administração está disponível
    const img = new Image()
    img.src = "/icons/admin-marker.png"
    img.onerror = () => setIconError(true)
  }, [])

  return (
    <>
      {administrationData.map((item) => (
        <Marker key={item.id} position={item.position} icon={iconError ? administrationSvgIcon : administrationIcon}>
          <Popup closeOnClick={false}>
            <MarkerPopup
              title={item.name}
              type="Administração"
              address={item.address}
              spending={item.spending}
              category="administracao"
            />
          </Popup>
        </Marker>
      ))}
    </>
  )
}

// Componente de legenda para o heatmap
function HeatmapLegend() {
  return (
    <div className="absolute bottom-5 right-5 z-[1000] bg-white p-3 rounded-md shadow-md">
      <h4 className="text-sm font-semibold mb-2">Intensidade de Gastos</h4>
      <div className="flex items-center space-x-2">
        <div className="w-full h-4 bg-gradient-to-r from-blue-600 via-green-500 via-yellow-400 to-red-600 rounded"></div>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span>Baixo</span>
        <span>Médio</span>
        <span>Alto</span>
      </div>
    </div>
  )
}

// Componente de legenda para os marcadores
function MarkersLegend({ activeTab }) {
  // Verificar se as imagens dos ícones estão disponíveis
  const [iconsError, setIconsError] = useState(false)

  useEffect(() => {
    // Verificar se os ícones estão disponíveis
    const img1 = new Image()
    img1.src = "/icons/hospital-marker.png"
    const img2 = new Image()
    img2.src = "/icons/school-marker.png"
    const img3 = new Image()
    img3.src = "/icons/security-marker.png"
    const img4 = new Image()
    img4.src = "/icons/admin-marker.png"

    img1.onerror = () => setIconsError(true)
    img2.onerror = () => setIconsError(true)
    img3.onerror = () => setIconsError(true)
    img4.onerror = () => setIconsError(true)
  }, [])

  // Determinar quais ícones mostrar com base na categoria ativa
  const getIconsToShow = () => {
    switch (activeTab) {
      case "saude":
        return [
          {
            src: "/icons/hospital-marker.png",
            alt: "Saúde",
            svg: createSvgIcon("#e53935", "H"),
            label: "Unidades de Saúde",
          },
        ]
      case "educacao":
        return [
          {
            src: "/icons/school-marker.png",
            alt: "Educação",
            svg: createSvgIcon("#1e88e5", "E"),
            label: "Instituições de Ensino",
          },
        ]
      case "seguranca":
        return [
          {
            src: "/icons/security-marker.png",
            alt: "Segurança",
            svg: createSvgIcon("#43a047", "S"),
            label: "Unidades de Segurança",
          },
        ]
      case "administracao":
        return [
          {
            src: "/icons/admin-marker.png",
            alt: "Administração",
            svg: createSvgIcon("#fb8c00", "A"),
            label: "Órgãos Administrativos",
          },
        ]
      default:
        return [
          {
            src: "/icons/hospital-marker.png",
            alt: "Saúde",
            svg: createSvgIcon("#e53935", "H"),
            label: "Unidades de Saúde",
          },
          {
            src: "/icons/school-marker.png",
            alt: "Educação",
            svg: createSvgIcon("#1e88e5", "E"),
            label: "Instituições de Ensino",
          },
          {
            src: "/icons/security-marker.png",
            alt: "Segurança",
            svg: createSvgIcon("#43a047", "S"),
            label: "Unidades de Segurança",
          },
          {
            src: "/icons/admin-marker.png",
            alt: "Administração",
            svg: createSvgIcon("#fb8c00", "A"),
            label: "Órgãos Administrativos",
          },
        ]
    }
  }

  const iconsToShow = getIconsToShow()

  return (
    <div className="absolute bottom-5 left-5 z-[1000] bg-white p-3 rounded-md shadow-md">
      <h4 className="text-sm font-semibold mb-2">Legenda</h4>
      <div className="space-y-2">
        {iconsToShow.map((icon, index) => (
          <div key={index} className="flex items-center gap-2">
            {iconsError ? (
              <div dangerouslySetInnerHTML={{ __html: icon.svg.html }} className="w-6 h-6" />
            ) : (
              <img src={icon.src || "/placeholder.svg"} alt={icon.alt} className="w-6 h-6" />
            )}
            <span className="text-xs">{icon.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente principal do mapa
export default function MapWithLayers({ center, zoom, activeTab, viewMode }) {
  // Prepare heatmap data
  const getHeatmapPoints = () => {
    let data
    switch (activeTab) {
      case "saude":
        data = healthData
        break
      case "educacao":
        data = educationData
        break
      case "seguranca":
        data = securityData
        break
      case "administracao":
        data = administrationData
        break
      default:
        data = healthData
    }

    // Encontrar o valor máximo para normalização
    const maxSpending = Math.max(...data.map((item) => item.spending.total))

    // Convert data to heatmap format [lat, lng, intensity]
    return data.map((item) => [
      item.position[0],
      item.position[1],
      // Normalize spending values to be between 0 and 1 for heatmap intensity
      item.spending.total / maxSpending,
    ])
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {viewMode === "markers" && activeTab === "saude" && <HealthMarkers />}
        {viewMode === "markers" && activeTab === "educacao" && <EducationMarkers />}
        {viewMode === "markers" && activeTab === "seguranca" && <SecurityMarkers />}
        {viewMode === "markers" && activeTab === "administracao" && <AdministrationMarkers />}

        {viewMode === "heatmap" && <HeatmapLayerWrapper points={getHeatmapPoints()} />}
      </MapContainer>

      {viewMode === "heatmap" && <HeatmapLegend />}
      {viewMode === "markers" && <MarkersLegend activeTab={activeTab} />}
    </div>
  )
}

// Wrapper para o HeatmapLayer para evitar erros de renderização
function HeatmapLayerWrapper({ points }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return <HeatmapLayer points={points} radius={40} blur={20} max={1.0} visible={true} />
}
