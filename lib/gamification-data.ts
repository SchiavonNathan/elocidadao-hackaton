import type { Badge, Challenge, Level, Reward } from "./gamification-types"

// Badges padrão do sistema
export const defaultBadges: Badge[] = [
  // Badges de participação
  {
    id: "first_feedback",
    name: "Primeiro Passo",
    description: "Enviou sua primeira opinião sobre gastos públicos",
    icon: "MessageSquare",
    criteria: "Envie sua primeira opinião sobre qualquer gasto público",
    level: "bronze",
  },
  {
    id: "feedback_5",
    name: "Cidadão Ativo",
    description: "Enviou 5 opiniões sobre gastos públicos",
    icon: "MessageSquare",
    criteria: "Envie 5 opiniões sobre gastos públicos",
    level: "prata",
  },
  {
    id: "feedback_20",
    name: "Voz da Comunidade",
    description: "Enviou 20 opiniões sobre gastos públicos",
    icon: "MessageSquare",
    criteria: "Envie 20 opiniões sobre gastos públicos",
    level: "ouro",
  },
  {
    id: "feedback_50",
    name: "Guardião da Cidade",
    description: "Enviou 50 opiniões sobre gastos públicos",
    icon: "Shield",
    criteria: "Envie 50 opiniões sobre gastos públicos",
    level: "platina",
  },

  // Badges de categoria
  {
    id: "health_specialist",
    name: "Especialista em Saúde",
    description: "Enviou 10 opiniões sobre gastos em saúde",
    icon: "Stethoscope",
    criteria: "Envie 10 opiniões sobre gastos em saúde",
    level: "prata",
  },
  {
    id: "education_specialist",
    name: "Especialista em Educação",
    description: "Enviou 10 opiniões sobre gastos em educação",
    icon: "GraduationCap",
    criteria: "Envie 10 opiniões sobre gastos em educação",
    level: "prata",
  },

  // Badges de qualidade
  {
    id: "detailed_feedback",
    name: "Analista Detalhista",
    description: "Enviou uma opinião com justificativa detalhada (mais de 100 caracteres)",
    icon: "FileText",
    criteria: "Envie uma opinião com justificativa de mais de 100 caracteres",
    level: "bronze",
  },
  {
    id: "expert_analyst",
    name: "Analista Especialista",
    description: "Enviou 5 opiniões com justificativas detalhadas",
    icon: "FileText",
    criteria: "Envie 5 opiniões com justificativas de mais de 100 caracteres",
    level: "ouro",
  },

  // Badges de engajamento
  {
    id: "streak_3",
    name: "Cidadão Constante",
    description: "Acessou a plataforma por 3 dias consecutivos",
    icon: "Calendar",
    criteria: "Acesse a plataforma por 3 dias consecutivos",
    level: "bronze",
  },
  {
    id: "streak_7",
    name: "Cidadão Dedicado",
    description: "Acessou a plataforma por 7 dias consecutivos",
    icon: "Calendar",
    criteria: "Acesse a plataforma por 7 dias consecutivos",
    level: "prata",
  },
  {
    id: "streak_30",
    name: "Cidadão Exemplar",
    description: "Acessou a plataforma por 30 dias consecutivos",
    icon: "Award",
    criteria: "Acesse a plataforma por 30 dias consecutivos",
    level: "platina",
  },
]

// Desafios padrão do sistema
export const defaultChallenges: Challenge[] = [
  {
    id: "weekly_feedback",
    title: "Opinião Semanal",
    description: "Envie 3 opiniões sobre gastos públicos nesta semana",
    icon: "Target",
    points: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    criteria: {
      type: "feedback_count",
      target: 3,
    },
    progress: 0,
    completed: false,
  },
  {
    id: "health_focus",
    title: "Foco na Saúde",
    description: "Envie 5 opiniões sobre gastos em saúde",
    icon: "Stethoscope",
    points: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
    criteria: {
      type: "category_feedback",
      target: 5,
      category: "saude",
    },
    progress: 0,
    completed: false,
  },
  {
    id: "education_focus",
    title: "Foco na Educação",
    description: "Envie 5 opiniões sobre gastos em educação",
    icon: "GraduationCap",
    points: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
    criteria: {
      type: "category_feedback",
      target: 5,
      category: "educacao",
    },
    progress: 0,
    completed: false,
  },
  {
    id: "detailed_analysis",
    title: "Análise Detalhada",
    description: "Envie uma opinião com justificativa de pelo menos 200 caracteres",
    icon: "FileText",
    points: 40,
    startDate: new Date(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
    criteria: {
      type: "justification_length",
      target: 200,
    },
    progress: 0,
    completed: false,
  },
  {
    id: "login_streak",
    title: "Cidadão Presente",
    description: "Acesse a plataforma por 5 dias consecutivos",
    icon: "Calendar",
    points: 25,
    startDate: new Date(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
    criteria: {
      type: "login_streak",
      target: 5,
    },
    progress: 0,
    completed: false,
  },
]

// Níveis do sistema
export const defaultLevels: Level[] = [
  {
    level: 1,
    title: "Cidadão Iniciante",
    minPoints: 0,
    maxPoints: 99,
    icon: "User",
    benefits: ["Acesso básico à plataforma"],
  },
  {
    level: 2,
    title: "Cidadão Participativo",
    minPoints: 100,
    maxPoints: 299,
    icon: "Users",
    benefits: ["Acesso básico à plataforma", "Badge exclusivo de nível"],
  },
  {
    level: 3,
    title: "Cidadão Engajado",
    minPoints: 300,
    maxPoints: 699,
    icon: "UserCheck",
    benefits: ["Acesso básico à plataforma", "Badge exclusivo de nível", "Destaque no ranking de cidadãos"],
  },
  {
    level: 4,
    title: "Cidadão Influente",
    minPoints: 700,
    maxPoints: 1499,
    icon: "Award",
    benefits: [
      "Acesso básico à plataforma",
      "Badge exclusivo de nível",
      "Destaque no ranking de cidadãos",
      "Opiniões destacadas no dashboard",
    ],
  },
  {
    level: 5,
    title: "Guardião da Cidade",
    minPoints: 1500,
    maxPoints: 999999,
    icon: "Shield",
    benefits: [
      "Acesso básico à plataforma",
      "Badge exclusivo de nível",
      "Destaque no ranking de cidadãos",
      "Opiniões destacadas no dashboard",
      "Acesso a recompensas exclusivas",
    ],
  },
]

// Recompensas do sistema
export const defaultRewards: Reward[] = [
  {
    id: "certificate",
    title: "Certificado de Participação Cidadã",
    description: "Certificado digital reconhecendo sua contribuição para a transparência dos gastos públicos",
    pointsCost: 500,
    available: true,
  },
  {
    id: "exclusive_badge",
    title: "Badge Exclusivo: Cidadão Exemplar",
    description: "Um badge exclusivo que poucos cidadãos possuem",
    pointsCost: 1000,
    available: true,
  },
  {
    id: "feature_suggestion",
    title: "Sugerir Nova Funcionalidade",
    description: "Sua sugestão de funcionalidade será analisada com prioridade pela equipe",
    pointsCost: 2000,
    available: true,
  },
  {
    id: "meeting",
    title: "Reunião com Gestores",
    description: "Participe de uma reunião virtual com gestores públicos para discutir melhorias",
    pointsCost: 5000,
    available: true,
  },
]
