import { apiGet } from './api';

export interface RelatorioProjeto {
  id: number;
  nome: string;
  codigo_empresa: string;
  horas_totais: number;
  recursos: Array<{
    id: number;
    nome: string;
    horas: number;
  }>;
}

export interface RelatorioHorasProjeto {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  projetos: RelatorioProjeto[];
  total_horas: number;
}

export const getRelatorioHorasProjeto = (params: {
  data_inicio: string;
  data_fim: string;
  projeto_id?: number;
}) => {
  return apiGet<RelatorioHorasProjeto>('/relatorios/horas-por-projeto', params);
};

export interface RelatorioRecurso {
  id: number;
  nome: string;
  horas_disponiveis: number;
  horas_planejadas: number;
  horas_apontadas: number;
  projetos: Array<{
    id: number;
    nome: string;
    horas_planejadas: number;
    horas_apontadas: number;
  }>;
}

export interface RelatorioAlocacaoRecursos {
  periodo: {
    ano: number;
    mes?: number;
  };
  recursos: RelatorioRecurso[];
}

export const getRelatorioAlocacaoRecursos = (params: {
  ano: number;
  mes?: number;
  recurso_id?: number;
}) => {
  return apiGet<RelatorioAlocacaoRecursos>('/relatorios/alocacao-recursos', params);
};

export interface RelatorioDashboard {
  projetos: {
    total: number;
    nao_iniciados: number;
    em_andamento: number;
    pausados: number;
    concluidos: number;
    cancelados: number;
  };
  recursos: {
    total: number;
    ativos: number;
  };
  apontamentos: {
    total_periodo: number;
    horas_totais: number;
  };
  projetos_recentes: Array<{
    id: number;
    nome: string;
    status: string;
    apontamentos_recentes: number;
    horas_recentes: number;
  }>;
}

export const getRelatorioDashboard = (params: {
  data_inicio?: string;
  data_fim?: string;
}) => {
  return apiGet<RelatorioDashboard>('/relatorios/dashboard', params);
}; 