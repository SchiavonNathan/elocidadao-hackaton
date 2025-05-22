import { create } from "zustand"
import { persist } from "zustand/middleware"

// Definir a estrutura de um feedback
export interface Feedback {
  id: string
  data: Date
  local: string
  categoria: "saude" | "educacao"
  aprovacao: "sim" | "nao"
  justificativa?: string
  usuario?: string
}

// Dados fictícios iniciais de feedback para demonstração
const dadosIniciais: Feedback[] = [
  {
    id: "1",
    data: new Date(2025, 4, 10),
    local: "UBS Zona 7",
    categoria: "saude",
    aprovacao: "sim",
    justificativa: "",
  },
  {
    id: "2",
    data: new Date(2025, 4, 11),
    local: "UBS Alvorada",
    categoria: "saude",
    aprovacao: "nao",
    justificativa:
      "Os gastos com equipamentos são muito altos e não vemos resultados práticos. Faltam medicamentos básicos.",
  },
  {
    id: "3",
    data: new Date(2025, 4, 12),
    local: "Escola Municipal Pedro Álvares Cabral",
    categoria: "educacao",
    aprovacao: "sim",
    justificativa: "",
  },
  {
    id: "4",
    data: new Date(2025, 4, 13),
    local: "UBS Centro",
    categoria: "saude",
    aprovacao: "nao",
    justificativa: "O valor gasto com manutenção é desproporcional. O prédio continua com problemas estruturais.",
  },
  {
    id: "5",
    data: new Date(2025, 4, 14),
    local: "Escola Municipal Santos Dumont",
    categoria: "educacao",
    aprovacao: "sim",
    justificativa: "",
  },
  {
    id: "6",
    data: new Date(2025, 4, 15),
    local: "UBS Zona Sul",
    categoria: "saude",
    aprovacao: "sim",
    justificativa: "",
  },
  {
    id: "7",
    data: new Date(2025, 4, 16),
    local: "Escola Municipal Machado de Assis",
    categoria: "educacao",
    aprovacao: "nao",
    justificativa: "Os gastos com material didático são altos, mas os alunos não recebem materiais suficientes.",
  },
  {
    id: "8",
    data: new Date(2025, 4, 17),
    local: "UBS Pinheiros",
    categoria: "saude",
    aprovacao: "sim",
    justificativa: "",
  },
  {
    id: "9",
    data: new Date(2025, 4, 18),
    local: "Escola Municipal Monteiro Lobato",
    categoria: "educacao",
    aprovacao: "nao",
    justificativa: "A infraestrutura da escola continua precária apesar do alto investimento relatado.",
  },
  {
    id: "10",
    data: new Date(2025, 4, 19),
    local: "Escola Municipal Cecília Meireles",
    categoria: "educacao",
    aprovacao: "sim",
    justificativa: "",
  },
  {
    id: "11",
    data: new Date(2025, 4, 20),
    local: "UBS Zona 7",
    categoria: "saude",
    aprovacao: "nao",
    justificativa: "Faltam médicos especialistas apesar do alto gasto com pessoal.",
  },
  {
    id: "12",
    data: new Date(2025, 4, 21),
    local: "Escola Municipal Pedro Álvares Cabral",
    categoria: "educacao",
    aprovacao: "sim",
    justificativa: "",
  },
  {
    id: "13",
    data: new Date(2025, 4, 22),
    local: "UBS Alvorada",
    categoria: "saude",
    aprovacao: "sim",
    justificativa: "",
  },
  {
    id: "14",
    data: new Date(2025, 4, 23),
    local: "Escola Municipal Santos Dumont",
    categoria: "educacao",
    aprovacao: "nao",
    justificativa: "Os gastos com alimentação não refletem a qualidade da merenda escolar oferecida.",
  },
  {
    id: "15",
    data: new Date(2025, 4, 24),
    local: "UBS Centro",
    categoria: "saude",
    aprovacao: "sim",
    justificativa: "",
  },
]

// Criar uma store Zustand para gerenciar os feedbacks
interface FeedbackStore {
  feedbacks: Feedback[]
  addFeedback: (feedback: Omit<Feedback, "id" | "data">) => void
  getFeedbacks: () => Feedback[]
}

// Criar a store com persistência no localStorage
export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set, get) => ({
      feedbacks: dadosIniciais,
      addFeedback: (feedback) => {
        const newFeedback: Feedback = {
          id: Date.now().toString(), // Gerar um ID único baseado no timestamp
          data: new Date(), // Data atual
          ...feedback,
        }
        set((state) => ({
          feedbacks: [newFeedback, ...state.feedbacks],
        }))
      },
      getFeedbacks: () => get().feedbacks,
    }),
    {
      name: "feedback-storage", // Nome para o armazenamento no localStorage
    },
  ),
)

// Exportar os feedbacks para compatibilidade com o código existente
export const feedbackData = useFeedbackStore.getState().feedbacks
