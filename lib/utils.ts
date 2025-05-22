import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

// Função para validar CPF
export function validateCPF(cpf: string): boolean {
  // Remover caracteres não numéricos
  cpf = cpf.replace(/\D/g, "")

  // Verificar se tem 11 dígitos
  if (cpf.length !== 11) return false

  // Verificar se todos os dígitos são iguais (CPF inválido, mas passa na validação matemática)
  if (/^(\d)\1+$/.test(cpf)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  const digit1 = remainder > 9 ? 0 : remainder

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  const digit2 = remainder > 9 ? 0 : remainder

  // Verificar se os dígitos calculados são iguais aos dígitos informados
  return digit1 === Number.parseInt(cpf.charAt(9)) && digit2 === Number.parseInt(cpf.charAt(10))
}
