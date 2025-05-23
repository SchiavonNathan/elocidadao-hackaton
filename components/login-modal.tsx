"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { validateCPF } from "@/lib/utils"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [cpf, setCpf] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const { login, register } = useAuth()

  const handleLogin = () => {
    // Validar CPF
    if (!validateCPF(cpf)) {
      setError("CPF inválido. Por favor, verifique e tente novamente.")
      return
    }

    const success = login(cpf)
    if (success) {
      setCpf("")
      setError("")
      onClose()
    } else {
      setError("CPF não encontrado. Por favor, registre-se primeiro.")
    }
  }

  const handleRegister = () => {
    // Validar CPF
    if (!validateCPF(cpf)) {
      setError("CPF inválido. Por favor, verifique e tente novamente.")
      return
    }

    // Validar nome
    if (!name.trim()) {
      setError("Por favor, informe seu nome.")
      return
    }

    const success = register(cpf, name)
    if (success) {
      setCpf("")
      setName("")
      setError("")
      onClose()
    } else {
      setError("Este CPF já está registrado. Por favor, faça login.")
    }
  }

  // Formatar CPF enquanto digita
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Remove caracteres não numéricos
    if (value.length <= 11) {
      // Formatar CPF: 000.000.000-00
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4")
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3")
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2")
      }
      setCpf(value)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Acesso ao Sistema</DialogTitle>
          <DialogDescription>
            Entre com seu CPF para participar e ganhar créditos ao contribuir com sua opinião.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Registrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cpf-login">CPF</Label>
              <Input
                id="cpf-login"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                maxLength={14}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Não tem cadastro?{" "}
              <button
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => setActiveTab("register")}
              >
                Registre-se
              </button>
            </p>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf-register">CPF</Label>
              <Input
                id="cpf-register"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                maxLength={14}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleRegister} className="w-full">
              Registrar
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Já tem cadastro?{" "}
              <button className="text-primary underline-offset-4 hover:underline" onClick={() => setActiveTab("login")}>
                Faça login
              </button>
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
