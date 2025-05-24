"use client"

import { useEffect, useState } from "react"
import MapComponent from "@/components/map-component"
import ComparativeCharts from "@/components/comparative-charts"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart2, LogIn, User, LogOut, Wallet, Trophy, Menu } from "lucide-react"
import LoginModal from "@/components/login-modal"
import UserWallet from "@/components/user-wallet"
import { useAuth } from "@/hooks/use-auth"
// @ts-ignore
import logo from "../public/logo-elocidadao.png"

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    // Implementado no hook useAuth
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <main className="min-h-screen flex flex-col">
        <header className="bg-primary text-primary-foreground p-4">
          <div className="container mx-auto flex justify-between items-center">
            <img src={logo.src} alt="Logo" className="h-20 w-auto" />
            <div>
              <h1 className="text-2xl font-bold">Mapa de Gastos Públicos de Maringá</h1>
              <p className="text-sm opacity-90">Visualize os gastos da prefeitura em saúde e educação</p>
            </div>
            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/feedback">
                <Button variant="secondary" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Dashboard de Feedback
                </Button>
              </Link>
              {user && (
                <Link href="/gamification">
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Gamificação
                  </Button>
                </Link>
              )}
              {user ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsWalletOpen(true)}
                    className="flex items-center gap-2 text-black dark:text-white"
                  >
                    <Wallet className="h-4 w-4" />
                    {user.credits} créditos
                  </Button>
                  <Button variant="ghost" onClick={logout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                  <div className="bg-primary-foreground text-primary rounded-full w-8 h-8 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setIsLoginOpen(true)} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar com CPF
                </Button>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md hover:bg-primary-foreground"
                aria-label="Abrir menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
          {/* Mobile menu dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 flex flex-col gap-2 items-stretch">
              <Link href="/feedback" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Dashboard de Feedback
                </Button>
              </Link>
              {user && (
                <Link href="/gamification" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Gamificação
                  </Button>
                </Link>
              )}
              {user ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsWalletOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 text-black dark:text-white"
                  >
                    <Wallet className="h-4 w-4" />
                    {user.credits} créditos
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                  <div className="bg-primary-foreground text-primary rounded-full w-8 h-8 flex items-center justify-center self-center">
                    <User className="h-4 w-4" />
                  </div>
                </>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsLoginOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Entrar com CPF
                </Button>
              )}
            </div>
          )}
        </header>
        <div className="flex-1 container mx-auto p-4">
          <MapComponent />
          <ComparativeCharts />
        </div>
        <footer className="bg-muted p-4 text-center text-sm">
          <p>© 2025 Mapa de Gastos Públicos de Maringá - Dados fictícios para demonstração</p>
        </footer>
      </main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <UserWallet isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </ThemeProvider>
  )
}
