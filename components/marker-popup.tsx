"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { School, Stethoscope, MapPin, Banknote, ThumbsUp, ThumbsDown, Lock, Shield, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useFeedbackStore } from "@/lib/feedback-data"
import { useToast } from "@/components/ui/use-toast"

interface MarkerPopupProps {
  title: string
  type: string
  address: string
  spending: {
    total: number
    breakdown: {
      label: string
      value: number
    }[]
  }
  category: "saude" | "educacao" | "seguranca" | "administracao"
}

export default function MarkerPopup({ title, type, address, spending, category }: MarkerPopupProps) {
  // Selecionar o ícone apropriado com base na categoria
  const getIcon = () => {
    switch (category) {
      case "saude":
        return Stethoscope
      case "educacao":
        return School
      case "seguranca":
        return Shield
      case "administracao":
        return Building2
      default:
        return MapPin
    }
  }

  const Icon = getIcon()
  const totalSpending = spending.total
  const { toast } = useToast()

  // Estados para gerenciar o feedback do usuário
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [approval, setApproval] = useState<"sim" | "nao" | null>(null)
  const [justification, setJustification] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackError, setFeedbackError] = useState(false)
  const [loginRequired, setLoginRequired] = useState(false)

  // Obter informações do usuário autenticado
  const { user, addCredits, isAuthenticated } = useAuth()

  // Acessar a store de feedbacks
  const addFeedback = useFeedbackStore((state) => state.addFeedback)

  // Função para obter a cor do ícone com base na categoria
  const getIconColor = () => {
    switch (category) {
      case "saude":
        return "text-red-500"
      case "educacao":
        return "text-blue-500"
      case "seguranca":
        return "text-green-500"
      case "administracao":
        return "text-orange-500"
      default:
        return "text-gray-500"
    }
  }

  // Função para enviar o feedback
  function submitFeedback() {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated()) {
      setLoginRequired(true)
      return
    }

    // Validar se uma opção foi selecionada
    if (approval === null) {
      setFeedbackError(true)
      return
    }

    // Validar se há justificativa quando a opção é "não"
    if (approval === "nao" && justification.trim() === "") {
      setFeedbackError(true)
      return
    }

    // Calcular créditos a serem concedidos
    let creditsToAdd = 10 // Créditos base por enviar feedback
    let description = `Opinião sobre ${title}`

    // Créditos extras por justificativa detalhada
    if (justification.trim().length > 0) {
      creditsToAdd += 5
      description += " com justificativa detalhada"
    }

    // Adicionar créditos ao usuário
    addCredits(creditsToAdd, description, title, category)

    // Adicionar o feedback à store
    addFeedback({
      local: title,
      categoria: category,
      aprovacao: approval,
      justificativa: justification,
      usuario: user?.name,
    })

    // Mostrar toast de confirmação
    toast({
      title: "Feedback enviado com sucesso!",
      description: "Sua opinião foi registrada e aparecerá no dashboard de feedback.",
      duration: 5000,
    })

    // Marcar como enviado com sucesso
    setFeedbackSubmitted(true)
    setFeedbackError(false)
    // Não fechamos o modal aqui, apenas mostramos a mensagem de sucesso
  }

  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md p-2 break-words overflow-auto">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${getIconColor()}`} />
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{type}</p>
      <div className="flex items-center gap-1 text-sm mb-3">
        <MapPin className="h-3 w-3" />
        <span>{address}</span>
      </div>

      <div className="border-t pt-2 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Gasto Total:</span>
          <span className="font-bold text-lg">{formatCurrency(totalSpending)}</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium flex items-center gap-1">
          <Banknote className="h-3 w-3" />
          Detalhamento de Gastos
        </h4>
        {spending.breakdown.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span>{formatCurrency(item.value)}</span>
            </div>
            <Progress value={(item.value / totalSpending) * 100} className="h-2" />
          </div>
        ))}
      </div>

      {!showFeedbackForm && !feedbackSubmitted && (
        <Button
          variant="outline"
          className="w-full mt-2 bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            setShowFeedbackForm(true)
          }}
        >
          Dar sua opinião sobre este gasto
        </Button>
      )}

      {showFeedbackForm && !feedbackSubmitted && (
        <div className="border-t pt-3 mt-3">
          <h4 className="font-medium mb-2">Você está de acordo com os gastos deste setor?</h4>

          {loginRequired && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription className="flex items-center gap-2">
                <Lock className="h-4 w-4" />É necessário entrar com seu CPF para enviar sua opinião e ganhar créditos.
              </AlertDescription>
            </Alert>
          )}

          <RadioGroup value={approval || ""} onValueChange={(value) => setApproval(value as "sim" | "nao")}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="sim" id="sim" />
              <Label htmlFor="sim" className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                Sim, estou de acordo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="nao" />
              <Label htmlFor="nao" className="flex items-center gap-1">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                Não, discordo destes gastos
              </Label>
            </div>
          </RadioGroup>

          {approval === "nao" && (
            <div className="mt-3">
              <Label htmlFor="justification" className="text-sm font-medium">
                Por favor, justifique sua resposta:
              </Label>
              <Textarea
                id="justification"
                placeholder="Explique por que você discorda destes gastos..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {feedbackError && !loginRequired && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                {approval === null
                  ? "Por favor, selecione uma opção."
                  : "Por favor, forneça uma justificativa para sua resposta."}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                setShowFeedbackForm(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                submitFeedback()
              }}
            >
              Enviar opinião
            </Button>
          </div>

          {isAuthenticated() && (
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Ganhe 10 créditos por enviar sua opinião + 5 créditos extras por incluir uma justificativa!
            </p>
          )}
        </div>
      )}

      {feedbackSubmitted && (
        <Alert className="mt-3 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800 flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Sua opinião foi registrada.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
