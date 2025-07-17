import React, { useState } from 'react';
import AutocompleteRecurso from './AutocompleteRecurso';
import AutocompleteProjeto from './AutocompleteProjeto';
import AutocompleteEquipe from './AutocompleteEquipe';
import AutocompleteSecao from './AutocompleteSecao';

// Paleta WEG
const WEG_AZUL = "#00579D";
const WEG_AZUL_CLARO = "#E3F1FC";
const WEG_BRANCO = "#FFFFFF";
const CINZA_CLARO = "#F4F6F8";
const CINZA_BORDA = "#E0E3E7";

const RELATORIOS = [
  {
    label: 'Horas Apontadas',
    value: 'horas-apontadas',
    endpoint: '/backend/v1/relatorios/horas-apontadas',
    exemplos: [
      { label: 'Total de horas por recurso, agrupado por mês', params: { agrupar_por_recurso: true, agrupar_por_mes: true } },
      { label: 'Total de horas de um recurso específico (ex: recurso_id=5), em todos os projetos', params: { recurso_id: 5, agrupar_por_projeto: true } },
      { label: 'Total de horas de todos os recursos de uma equipe específica (equipe_id=9), em maio de 2025', params: { equipe_id: 9, data_inicio: '2025-05-01', data_fim: '2025-05-31', agrupar_por_recurso: true } },
      { label: 'Total de horas de uma seção específica (secao_id=2), em todos os projetos', params: { secao_id: 2, agrupar_por_projeto: true } },
      { label: 'Total de horas de um projeto específico (projeto_id=1) por recurso, em junho de 2025', params: { projeto_id: 1, data_inicio: '2025-06-01', data_fim: '2025-06-30', agrupar_por_recurso: true } },
      { label: 'Total geral de horas (sem filtros)', params: {} },
    ],
    filtros: [
      { name: 'recurso_id', placeholder: 'Recurso ID', type: 'text', width: 120 },
      { name: 'projeto_id', placeholder: 'Projeto ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
      { name: 'data_inicio', placeholder: 'Data início (YYYY-MM-DD ou DD/MM/YYYY)', type: 'text', width: 210 },
      { name: 'data_fim', placeholder: 'Data fim (YYYY-MM-DD ou DD/MM/YYYY)', type: 'text', width: 210 },
      { name: 'fonte_apontamento', placeholder: 'Fonte (JIRA/MANUAL)', type: 'text', width: 150 },
      { name: 'agrupar_por_recurso', label: 'Agrupar por Recurso', type: 'checkbox' },
      { name: 'agrupar_por_projeto', label: 'Agrupar por Projeto', type: 'checkbox' },
      { name: 'agrupar_por_data', label: 'Agrupar por Data', type: 'checkbox' },
      { name: 'agrupar_por_mes', label: 'Agrupar por Mês', type: 'checkbox' },
    ],
  },
  {
    label: 'Planejado vs Realizado',
    value: 'planejado-vs-realizado',
    endpoint: '/backend/v1/relatorios/planejado-vs-realizado-3',
    exemplos: [
      { label: 'Comparativo de todos os recursos em 2025', params: { ano: 2025 } },
      { label: 'Comparativo por mês (maio de 2025)', params: { ano: 2025, mes: 5 } },
      { label: 'Comparativo para um projeto específico (projeto_id=2) em 2025', params: { ano: 2025, projeto_id: 2 } },
      { label: 'Comparativo para um recurso específico (recurso_id=3) em 2025', params: { ano: 2025, recurso_id: 3 } },
      { label: 'Comparativo para equipe e seção', params: { ano: 2025, equipe_id: 1, secao_id: 1 } },
    ],
    filtros: [
      { name: 'ano', placeholder: 'Ano de referência (obrigatório)', type: 'text', width: 120 },
      { name: 'mes', placeholder: 'Mês (1-12)', type: 'text', width: 80 },
      { name: 'projeto_id', placeholder: 'Projeto ID', type: 'text', width: 120 },
      { name: 'recurso_id', placeholder: 'Recurso ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
    ],
  },
  {
    label: 'Disponibilidade de Recursos',
    value: 'disponibilidade-recursos',
    endpoint: '/backend/v1/relatorios/disponibilidade-recursos',
    exemplos: [
      { label: 'Disponibilidade de todos os recursos em 2025', params: { ano: 2025 } },
      { label: 'Disponibilidade de todos os recursos em julho de 2025', params: { ano: 2025, mes: 7 } },
      { label: 'Disponibilidade de um recurso específico (recurso_id=22) em 2025', params: { ano: 2025, recurso_id: 22 } },
    ],
    filtros: [
      { name: 'ano', placeholder: 'Ano de referência (obrigatório)', type: 'text', width: 120 },
      { name: 'mes', placeholder: 'Mês (1-12)', type: 'text', width: 80 },
      { name: 'recurso_id', placeholder: 'Recurso ID', type: 'text', width: 120 },
    ],
  },
  {
    label: 'Horas por Projeto',
    value: 'horas-por-projeto',
    endpoint: '/backend/v1/relatorios/horas-por-projeto',
    exemplos: [
      { label: 'Total de horas por projeto (todos)', params: {} },
      { label: 'Horas por projeto filtrando por seção (secao_id=1)', params: { secao_id: 1 } },
      { label: 'Horas por projeto filtrando por equipe (equipe_id=1)', params: { equipe_id: 1 } },
      { label: 'Horas por projeto em um período', params: { data_inicio: '2025-05-01', data_fim: '2025-05-31' } },
      { label: 'Horas por projeto filtrando por seção e equipe', params: { secao_id: 1, equipe_id: 1 } },
    ],
    filtros: [
      { name: 'data_inicio', placeholder: 'Data início', type: 'text', width: 140 },
      { name: 'data_fim', placeholder: 'Data fim', type: 'text', width: 140 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
    ],
  },
  {
    label: 'Horas por Recurso',
    value: 'horas-por-recurso',
    endpoint: '/backend/v1/relatorios/horas-por-recurso',
    exemplos: [
      { label: 'Total de horas por recurso (todos)', params: {} },
      { label: 'Horas por recurso filtrando por equipe (equipe_id=1)', params: { equipe_id: 1 } },
      { label: 'Horas por recurso filtrando por seção (secao_id=1)', params: { secao_id: 1 } },
      { label: 'Horas por recurso em um período', params: { data_inicio: '2025-05-01', data_fim: '2025-05-31' } },
      { label: 'Horas por recurso filtrando por projeto (projeto_id=2)', params: { projeto_id: 2 } },
      { label: 'Horas por recurso filtrando por todos os campos', params: { data_inicio: '2025-05-01', data_fim: '2025-05-31', projeto_id: 2, equipe_id: 1, secao_id: 1 } },
    ],
    filtros: [
      { name: 'data_inicio', placeholder: 'Data início', type: 'text', width: 140 },
      { name: 'data_fim', placeholder: 'Data fim', type: 'text', width: 140 },
      { name: 'projeto_id', placeholder: 'Projeto ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
    ],
  },
  {
    label: 'Horas Disponíveis do Recurso',
    value: 'horas-disponiveis',
    endpoint: '/backend/v1/relatorios/horas-disponiveis',
    exemplos: [
      { label: 'Horas disponíveis do recurso 3', params: { recurso_id: 3 } },
      { label: 'Horas disponíveis do recurso 3 em 2025', params: { recurso_id: 3, ano: 2025 } },
      { label: 'Horas disponíveis do recurso 3 em junho de 2025', params: { recurso_id: 3, ano: 2025, mes: 6 } },
    ],
    filtros: [
      { name: 'recurso_id', placeholder: 'recurso_id', type: 'text', width: 120 },
      { name: 'ano', placeholder: 'ano', type: 'text', width: 100 },
      { name: 'mes', placeholder: 'mes', type: 'text', width: 100 },
    ],
  },
  {
    label: 'Relatório Dinâmico de Horas',
    value: 'dinamico',
    endpoint: '/backend/v1/relatorios-dinamico/dinamico',
    exemplos: [
      { label: 'Por equipe', params: { equipe_id: 1 } },
      // outros exemplos...
    ],
    filtros: [
      { name: 'recurso_id', placeholder: 'Recurso ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
      { name: 'projeto_id', placeholder: 'Projeto ID', type: 'text', width: 120 },
      { name: 'data_inicio', placeholder: 'Data inicial (YYYY-MM-DD ou DD/MM/YYYY)', type: 'text', width: 180 },
      { name: 'data_fim', placeholder: 'Data final (YYYY-MM-DD ou DD/MM/YYYY)', type: 'text', width: 180 },
      { name: 'agrupar_por', placeholder: 'Ex: recurso, equipe, secao, projeto, mes, ano', type: 'text', width: 200 },
    ],
  },
];

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState(RELATORIOS[0].value);
  const [params, setParams] = useState({
    recurso_id: '',
    projeto_id: '',
    equipe_id: '',
    secao_id: '',
    data_inicio: '',
    data_fim: '',
    fonte_apontamento: '',
    agrupar_por_recurso: false,
    agrupar_por_projeto: false,
    agrupar_por_data: false,
    agrupar_por_mes: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [matrizEditavel, setMatrizEditavel] = useState(null); // Estado para dados editáveis
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleTipoRelatorioChange(e) {
    const selected = e.target.value;
    setTipoRelatorio(selected);
    const rel = RELATORIOS.find(r => r.value === selected);
    setParams({}); // Limpa filtros ao trocar tipo
    setResult(null);
    setMatrizEditavel(null); // Limpa dados editáveis também
    setError('');
  }

  function handleExemploClick(exemplo) {
    setParams({
      recurso_id: '', projeto_id: '', equipe_id: '', secao_id: '', data_inicio: '', data_fim: '', fonte_apontamento: '',
      agrupar_por_recurso: false, agrupar_por_projeto: false, agrupar_por_data: false, agrupar_por_mes: true,
      ...exemplo.params,
    });
    setResult(null);
    setError('');
  }

  function buildQueryString(params) {
    return Object.entries(params)
      .filter(([k, v]) => {
        // Filtrar apenas valores vazios, mas manter valores booleanos (true ou false)
        // Os parâmetros de agrupamento precisam ser enviados explicitamente, mesmo quando false
        if (k.startsWith('agrupar_por_')) {
          return true; // Sempre incluir parâmetros de agrupamento
        }
        return v !== '';
      })
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
      const fixedParams = { ...params };

      const idFields = ['recurso_id', 'projeto_id', 'equipe_id', 'secao_id'];
      idFields.forEach(field => {
        if (fixedParams[field] && typeof fixedParams[field] === 'object') {
          fixedParams[field] = fixedParams[field].id;
        }
        if (!fixedParams[field] || isNaN(Number(fixedParams[field]))) {
          delete fixedParams[field];
        }
      });

      // Tratamento especial para o relatório 'Planejado vs Realizado' (modo de edição)
      if (tipoRelatorio === 'planejado-vs-realizado') {
        const res = await fetch('/backend/v1/relatorios/planejado-vs-realizado-3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fixedParams)
        });

        if (!res.ok) {
          throw new Error(`Erro ao buscar dados para edição: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setMatrizEditavel(data); // Armazena os dados brutos para edição
        // Futuramente, aqui transformaremos 'data' em 'matriz_dados' para renderTable
        setResult({ matriz_dados: [] }); // Placeholder para evitar erro na renderTable
        return; // Finaliza o fluxo aqui por enquanto
      }

      const qs = buildQueryString(fixedParams);
      const res = await fetch(`${rel.endpoint}?${qs}`);

      if (!res.ok) {
        throw new Error(`Erro ao buscar relatório: ${res.status} ${res.statusText}`);
      }

      let data = await res.json();

      // Tratamento para popular a linha de Horas Disponíveis (RH)
      // Este bloco foi movido para dentro de um else if para não conflitar com a nova lógica de edição

      if (tipoRelatorio === 'planejado-vs-realizado-LEGACY' && data && Array.isArray(data.matriz_dados) && data.matriz_dados.length > 1) { // Desativado temporariamente
        const formatarDataParaAPI = (dataRaw) => {
          if (!dataRaw || !dataRaw.includes('/')) return null;
          const [mesStr, anoStr] = dataRaw.split('/');
          const ano = `20${anoStr}`;
          const meses = { 'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12' };
          const mes = meses[mesStr.toLowerCase()];
          return mes ? `${ano}-${mes}` : null;
        };

        const headers = data.matriz_dados[0].slice(1);
        const datasValidas = headers.filter(h => formatarDataParaAPI(h) !== null);
        const data_inicio = formatarDataParaAPI(datasValidas[0]);
        const data_fim = formatarDataParaAPI(datasValidas[datasValidas.length - 1]);
        const recurso_id = fixedParams.recurso_id;

        if (recurso_id && data_inicio && data_fim) {
          try {
            const horasRes = await fetch(`/backend/v1/calendario/horas-disponiveis-recurso`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recurso_id, data_inicio, data_fim })
            });

            if (horasRes.ok) {
              const horasData = await horasRes.json();
              const horasMap = horasData.horas_por_mes.reduce((acc, item) => {
                acc[item.mes] = item.horas;
                return acc;
              }, {});

              const horasDisponiveisRow = ['Horas Disponíveis (RH)', ...headers.map(header => {
                if (header.toLowerCase() === 'hs.') return '';
                const chaveApi = formatarDataParaAPI(header);
                return horasMap[chaveApi] || 0;
              })];

              const rhRowIndex = data.matriz_dados.findIndex(row => row[0] === 'Horas Disponíveis (RH)');
              if (rhRowIndex > -1) {
                data.matriz_dados[rhRowIndex] = horasDisponiveisRow;
              } else {
                const totalRowIndex = data.matriz_dados.findIndex(row => row[0].includes('Total de Esforço'));
                if (totalRowIndex > -1) {
                  data.matriz_dados.splice(totalRowIndex, 0, horasDisponiveisRow);
                } else {
                  data.matriz_dados.push(horasDisponiveisRow);
                }
              }
            }
          } catch (horasError) {
            console.error('Exceção ao buscar horas disponíveis:', horasError);
          }
        }
        setResult(data);
      } else if (Array.isArray(data)) {
        setResult({ matriz_dados: data });
      } else if (data && data.items && Array.isArray(data.items)) {
        const resultData = [...data.items];
        if (data.total_horas !== undefined) {
          resultData.push({ total: true, horas: data.total_horas });
        }
        setResult(resultData);
      } else {
        setResult(data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleMatrizChange = (projetoIndex, mesAno, field, value) => {
    setMatrizEditavel(prevState => {
        const novosProjetos = prevState.projetos.map((p, pIndex) => {
            if (pIndex !== projetoIndex) {
                return p;
            }

            // Deep copy do projeto para evitar mutação
            const projetoAtualizado = JSON.parse(JSON.stringify(p));

            // Se a alteração for em um campo geral do projeto (status, obs, esforço)
            if (mesAno === null) {
                projetoAtualizado[field] = value;
                return projetoAtualizado;
            }

            // Se a alteração for nas horas mensais, `mesAno` será 'MM/YYYY'
            const [mesStr, anoStr] = mesAno.split('/');
            const mes = parseInt(mesStr, 10);
            const ano = parseInt(anoStr, 10);

            let planejamentoExistente = projetoAtualizado.planejamento_mensal.find(pm => pm.mes === mes && pm.ano === ano);

            if (planejamentoExistente) {
                planejamentoExistente[field] = value;
            } else {
                // Adiciona um novo planejamento se não existir para o mês/ano
                projetoAtualizado.planejamento_mensal.push({ mes, ano, horas_planejadas: 0, [field]: value });
            }

            return projetoAtualizado;
        });

        return { ...prevState, projetos: novosProjetos };
    });
  };

  async function handleSalvarAlteracoes() {
    if (!matrizEditavel || !matrizEditavel.projetos || !params.recurso_id) {
      alert('Não há dados para salvar ou nenhum recurso foi selecionado.');
      return;
    }

    // Monta o payload na estrutura correta, garantindo a tipagem dos dados
    const payload = {
      recurso_id: parseInt(params.recurso_id, 10), // Pega o ID do filtro e garante que é número
      alteracoes_projetos: matrizEditavel.projetos.map(p => ({
        projeto_id: parseInt(p.projeto_id, 10),
        status_alocacao_id: parseInt(p.status_alocacao_id, 10),
        observacao: p.observacao || '', // Garante que seja string
        esforco_estimado: parseFloat(p.esforco_estimado) || 0, // Garante que seja número
        // Filtra e mapeia o planejamento mensal para garantir que apenas dados válidos sejam enviados
        planejamento_mensal: p.planejamento_mensal
          .filter(pm => pm.mes && pm.ano) // Garante que mês e ano existam
          .map(pm => ({
            mes: parseInt(pm.mes, 10),
            ano: parseInt(pm.ano, 10),
            horas_planejadas: parseFloat(pm.horas_planejadas) || 0
          }))
      }))
    };

    console.log('Enviando payload:', JSON.stringify(payload, null, 2));

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/backend/v1/matriz-planejamento/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) // Envia o payload formatado
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Formata o erro para ser legível, em vez de [object Object]
        const errorMessage = errorData.detail 
          ? JSON.stringify(errorData.detail, null, 2) 
          : `Erro ao salvar alterações: ${res.status}`;
        throw new Error(errorMessage);
      }

      alert('Alterações salvas com sucesso!');
      // Opcional: recarregar os dados para refletir o estado salvo
      // handleSubmit({ preventDefault: () => {} });

    } catch (err) {
      setError(err.message);
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Função para formatar valores numéricos
  function formatNumber(value) {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value;
  }

  // Função para obter o nome amigável da coluna
  function getColumnLabel(col) {
    const columnLabels = {
      'quantidade': 'Qtd. Lançamentos',
      // IDs
      'recurso_id': 'ID Recurso',
      'projeto_id': 'ID Projeto',
      'equipe_id': 'ID Equipe',
      'secao_id': 'ID Seção',
      
      // Nomes
      'recurso_nome': 'Recurso',
      'projeto_nome': 'Projeto',
      'equipe_nome': 'Equipe',
      'secao_nome': 'Seção',
      'projeto_codigo': 'Código do Projeto',
      
      // Datas e períodos
      'ano': 'Ano',
      'mes': 'Mês',
      'data': 'Data',
      'data_inicio': 'Data Início',
      'data_fim': 'Data Fim',
      
      // Horas
      'total_horas': 'Total de Horas',
      'horas_planejadas': 'Horas Planejadas',
      'horas_realizadas': 'Horas Realizadas',
      'horas_disponiveis': 'Horas Disponíveis',
      'horas_disponiveis_mes': 'Horas Disponíveis no Mês',
      'horas_disponiveis_rh': 'Horas Disponíveis (RH)',
      'horas_livres': 'Horas Livres',
      
      // Métricas
      'diferenca': 'Diferença (horas)',
      'percentual_realizado': 'Realizado (%)',
      'percentual_alocacao_rh': 'Alocação (%)',
      'percentual_utilizacao_sobre_planejado': 'Utilização s/ Planejado (%)',
      'percentual_utilizacao_sobre_disponivel_rh': 'Utilização s/ Disponível (%)',
    };
    
    return columnLabels[col] || col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Renderiza tabela dinâmica
  function renderTable() {
    // NOVO: Renderização para a matriz de planejamento editável
    if (matrizEditavel && matrizEditavel.projetos) {
      const { projetos } = matrizEditavel;
      if (!projetos || projetos.length === 0) {
        return <div style={{ marginTop: 24, color: WEG_AZUL, fontWeight: 500, fontSize: 18 }}>Nenhum projeto encontrado para este recurso.</div>;
      }

      // Extrai todos os meses únicos para criar os cabeçalhos
      const todosMeses = projetos.flatMap(p => p.planejamento_mensal.map(pm => `${pm.mes}/${pm.ano}`));
      const mesesUnicos = [...new Set(todosMeses)].sort((a, b) => {
        const [mesA, anoA] = a.split('/');
        const [mesB, anoB] = b.split('/');
        return anoA - anoB || mesA - mesB;
      });

      const headers = ['Projeto', 'Status', 'Observação', 'Esforço Estimado', ...mesesUnicos];

      const statusOptions = [
        { id: 1, nome: 'Não Iniciado' },
        { id: 2, nome: 'Em andamento' },
        { id: 3, nome: 'Concluído' },
        { id: 4, nome: 'Cancelado' },
        { id: 5, nome: 'Pausado' },
      ];

      return (
        <div style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', boxShadow: '0 3px 16px #0002', background: WEG_BRANCO, marginTop: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 1200 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ background: WEG_AZUL, color: WEG_BRANCO }}>
                {headers.map((header, idx) => (
                  <th key={idx} style={{ padding: '14px', fontWeight: 800, fontSize: 15, textAlign: 'center', borderBottom: '2px solid #004170' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projetos.map((proj, projIndex) => {
                const horasPorMes = proj.planejamento_mensal.reduce((acc, pm) => {
                  acc[`${pm.mes}/${pm.ano}`] = pm.horas;
                  return acc;
                }, {});

                return (
                  <tr key={proj.projeto_id} style={{ background: projIndex % 2 ? '#F4F8FB' : WEG_BRANCO }}>
                    <td style={{ padding: '8px', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid #e3e7ee' }}>{proj.projeto_nome}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e3e7ee' }}>
                      <select
                        value={proj.status_alocacao_id}
                        onChange={(e) => handleMatrizChange(projIndex, 'status_alocacao_id', parseInt(e.target.value))}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
                      >
                        {statusOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e3e7ee' }}>
                      <input
                        type="text"
                        value={proj.observacao || ''}
                        onChange={(e) => handleMatrizChange(projIndex, 'observacao', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
                      />
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e3e7ee' }}>
                      <input
                        type="number"
                        value={proj.esforco_estimado || ''}
                        onChange={(e) => handleMatrizChange(projIndex, 'esforco_estimado', parseFloat(e.target.value) || 0)}
                        style={{ width: '80px', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
                      />
                    </td>
                    {mesesUnicos.map(mesAno => {
                      const mesIndex = proj.planejamento_mensal.findIndex(pm => `${pm.mes}/${pm.ano}` === mesAno);
                      return (
                        <td key={mesAno} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e3e7ee' }}>
                          {mesIndex !== -1 ? (
                            <input
                              type="number"
                              value={proj.planejamento_mensal[mesIndex].horas_planejadas}
                              onChange={(e) => handleMatrizChange(projIndex, mesAno, 'horas_planejadas', parseFloat(e.target.value) || 0)}
                              style={{ width: '70px', padding: '8px', border: '1px solid #ccc', borderRadius: 4, textAlign: 'center' }}
                            />
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    // Tratamento para relatórios de matriz (LEGACY)
    if (result && result.matriz_dados && result.matriz_dados.length > 0) {
      const matriz = result.matriz_dados;
      const headers = matriz[0];
      const body = matriz.slice(1);

      return (
        <div style={{width:'100%', overflowX:'auto', borderRadius: '12px', boxShadow:'0 3px 16px #0002', background: WEG_BRANCO, marginTop: 8}}>
          <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:700}}>
            <thead style={{position: 'sticky', top: 0, zIndex: 2}}>
              <tr style={{background:WEG_AZUL, color:WEG_BRANCO}}>
                {headers.map((header, idx) => (
                  <th key={idx} style={{ padding:'14px 14px', fontWeight:800, fontSize:15, textAlign:'center', borderBottom: '2px solid #004170' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIdx) => (
                <tr key={rowIdx} style={{background: rowIdx % 2 ? '#F4F8FB' : WEG_BRANCO}}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} style={{ padding:'11px 14px', textAlign:'center', fontSize: 15, borderBottom: '1px solid #e3e7ee', color: '#232b36', fontWeight: cellIdx === 0 ? 700 : 500 }}>
                      {typeof cell === 'number' ? formatNumber(cell) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log('DEBUG renderTable: sem dados para exibir');
      return (
        <div style={{marginTop:24, color:WEG_AZUL, fontWeight:500, fontSize:18}}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }

    console.log('DEBUG renderTable: dados para exibir', result);
    
    const dataRows = result.filter(row => !row.total);
    const totalRows = result.filter(row => row.total);
    
    if (dataRows.length === 0) {
      console.log('DEBUG renderTable: sem dados após filtrar linhas de total');
      return (
        <div style={{marginTop:24, color:WEG_AZUL, fontWeight:500, fontSize:18}}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }
    
    let columns = Object.keys(dataRows[0] || {}).filter(col => col !== 'total');
    console.log('DEBUG colunas detectadas:', columns);

    // Cálculo de totais automaticamente a partir dos dados
    let hasTotals = totalRows.length > 0 || columns.some(col => typeof dataRows[0][col] === 'number');
    let totals = {};
    
    // Se temos linhas de total especiais, usamos elas
    if (totalRows.length > 0) {
      totalRows.forEach(row => {
        Object.keys(row).forEach(key => {
          if (key !== 'total') {
            totals[key] = row[key];
          }
        });
      });
      console.log('DEBUG totais especiais:', totals);
    }
    // Senão, calculamos os totais automaticamente
    else if (columns.some(col => typeof dataRows[0][col] === 'number')) {
      columns.forEach(col => {
        if (typeof dataRows[0][col] === 'number') {
          totals[col] = dataRows.reduce((acc, row) => acc + (typeof row[col] === 'number' ? row[col] : 0), 0);
        }
      });
      console.log('DEBUG totais calculados:', totals);
    }

    return (
      <div style={{width:'100%', overflowX:'auto', borderRadius: '12px', boxShadow:'0 3px 16px #0002', background: WEG_BRANCO, marginTop: 8}}>
        <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:700}}>
          <thead style={{position: 'sticky', top: 0, zIndex: 2}}>
            <tr style={{background:WEG_AZUL, color:WEG_BRANCO}}>
              {columns.map((col, idx) => (
  <th key={col}
    style={{
      padding:'14px 14px',
      fontWeight:800,
      fontSize:15,
      textAlign:'center',
      width: `${100 / columns.length}%`,
      minWidth: 90,
      borderTopLeftRadius: idx === 0 ? 10 : 0,
      borderTopRightRadius: idx === columns.length-1 ? 10 : 0,
      borderBottom: '2px solid #004170',
      letterSpacing: 0.4
    }}
    title={col}
  >
    {getColumnLabel(col)}
  </th>
))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, idx) => (
              <tr key={idx} style={{background: idx%2 ? '#F4F8FB' : WEG_BRANCO}}>
                {columns.map((col, idx) => (
  <td key={col} style={{
    padding:'11px 14px',
    textAlign:'center',
    width: `${100 / columns.length}%`,
    minWidth: 90,
    fontSize: 15,
    borderBottom: '1px solid #e3e7ee',
    color: '#232b36',
    fontWeight: 500
  }}>
    {/* Tratamento defensivo para campo 'email' opcional */}
    {col === 'email'
      ? (!row[col] || row[col] === '' ? 'Sem e-mail' : row[col])
      : (typeof row[col] === 'number' ? formatNumber(row[col]) : (row[col] ?? '-'))}
  </td>
))}
              </tr>
            ))}
            {/* Exibir mensagem quando não há dados */}
            {dataRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{padding:'18px', textAlign:'center', color:WEG_AZUL, fontWeight:600, fontSize:16}}>
                  Nenhum resultado encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
            {hasTotals && (
              <tr style={{background:'#E3F1FC', fontWeight:800, borderTop: '2px solid #b6d6f6'}}>
                {columns.map((col, idx) => (
  <td key={col} style={{
    padding:'13px 14px',
    textAlign:'center',
    width: `${100 / columns.length}%`,
    minWidth: 90,
    color: idx === 0 ? WEG_AZUL : '#00325a',
    fontWeight: idx === 0 ? 900 : 700,
    fontSize: 15,
    borderBottomLeftRadius: idx === 0 ? 10 : 0,
    borderBottomRightRadius: idx === columns.length-1 ? 10 : 0
  }}>
    {totals[col] !== undefined ? formatNumber(totals[col]) : (col === columns[0] ? 'Total' : '')}
  </td>
))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
return (
  <div style={{
    width: '100%', 
    boxSizing: 'border-box',
    padding: '32px 32px 24px 32px', 
    background: '#f8fafc',
    borderRadius: 18, 
    boxShadow: '0 4px 24px #0003'
  }}>
    <h2 style={{
      color: WEG_AZUL, marginBottom: 22, borderBottom: `3px solid ${WEG_AZUL}`,
      paddingBottom: 10, fontWeight: 800, letterSpacing: 1.2, fontSize: 26
    }}>
      Relatórios
    </h2>

    {/* Seleção do relatório */}
    <div style={{marginBottom: 26, display: 'flex', alignItems: 'center', gap: 16}}>
      <label style={{fontWeight: 700, color: WEG_AZUL, fontSize: 17, marginRight: 8}}>Tipo de Relatório:</label>
      <select
        value={tipoRelatorio}
        onChange={handleTipoRelatorioChange}
        style={{
          padding: '10px 18px', borderRadius: 8, border: `2px solid ${WEG_AZUL}`,
          fontSize: 17, color: WEG_AZUL, background: WEG_BRANCO, fontWeight: 600, minWidth: 220
        }}
      >
        {RELATORIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
    </div>

    {/* Bloco visual de filtros */}
    <form
  onSubmit={handleSubmit}
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 24,
    rowGap: 18,
    marginBottom: 36,
    background: CINZA_CLARO,
    borderRadius: 14,
    padding: '22px 24px 14px 24px',
    boxShadow: '0 2px 12px #0001',
    border: `2px solid ${CINZA_BORDA}`
  }}
>
  {rel.filtros.map(filtro => {
          if (filtro.name === 'recurso_id') {
            return (
              <AutocompleteRecurso
                key={filtro.name}
                value={typeof params.recurso_id === 'object' ? params.recurso_id : params.recurso_id ? { id: params.recurso_id, nome: '' } : null}
                onChange={recurso => setParams(prev => ({ ...prev, recurso_id: recurso }))}
                placeholder={filtro.placeholder || 'Digite o nome do recurso...'}
              />
            );
          }
          if (filtro.name === 'projeto_id') {
            return (
              <AutocompleteProjeto
                key={filtro.name}
                value={typeof params.projeto_id === 'object' ? params.projeto_id : params.projeto_id ? { id: params.projeto_id, nome: '' } : null}
                onChange={projeto => setParams(prev => ({ ...prev, projeto_id: projeto }))}
                placeholder={filtro.placeholder || 'Digite o nome do projeto...'}
              />
            );
          }
          if (filtro.name === 'equipe_id') {
            return (
              <AutocompleteEquipe
                key={filtro.name}
                value={typeof params.equipe_id === 'object' ? params.equipe_id : params.equipe_id ? { id: params.equipe_id, nome: '' } : null}
                onChange={equipe => setParams(prev => ({ ...prev, equipe_id: equipe }))}
                placeholder={filtro.placeholder || 'Digite o nome da equipe...'}
              />
            );
          }
          if (filtro.name === 'secao_id') {
            return (
              <AutocompleteSecao
                key={filtro.name}
                value={typeof params.secao_id === 'object' ? params.secao_id : params.secao_id ? { id: params.secao_id, nome: '' } : null}
                onChange={secao => setParams(prev => ({ ...prev, secao_id: secao }))}
                placeholder={filtro.placeholder || 'Digite o nome da seção...'}
              />
            );
          }
          if (filtro.type === 'checkbox') {
            return (
              <label key={filtro.name} style={{
                display: 'flex', alignItems: 'center', gap: 4, color: WEG_AZUL, fontWeight: 500
              }}>
                <input
                  type="checkbox"
                  name={filtro.name}
                  checked={!!params[filtro.name]}
                  onChange={handleChange}
                  style={{ accentColor: WEG_AZUL, width: 18, height: 18, marginRight: 4 }}
                />
                {filtro.label}
              </label>
            );
          }
          // Campo padrão
          return (
            <input
              key={filtro.name}
              name={filtro.name}
              value={params[filtro.name] || ''}
              onChange={handleChange}
              placeholder={filtro.placeholder}
              style={{
                width: filtro.width,
                padding: '8px 12px',
                borderRadius: 6,
                border: `1.5px solid ${CINZA_BORDA}`,
                fontSize: 15,
                background: WEG_BRANCO,
                color: WEG_AZUL,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxShadow: '0 1px 4px #0001'
              }}
              onFocus={e => e.target.style.borderColor = WEG_AZUL}
              onBlur={e => e.target.style.borderColor = CINZA_BORDA}
            />
          );
        })}
  <div style={{ minWidth: 180, flex: '1 1 220px', display: 'flex', alignItems: 'center', marginTop: 8 }}>
    <button
      type="submit"
      disabled={loading}
      style={{
        height: 44,
        minWidth: 170,
        padding: '0 32px',
        background: WEG_AZUL,
        color: WEG_BRANCO,
        border: 'none',
        borderRadius: 8,
        fontWeight: 800,
        fontSize: 17,
        cursor: 'pointer',
        boxShadow: '0 3px 10px #0002',
        letterSpacing: 0.5
      }}
    >
      Gerar Relatório
    </button>

    {tipoRelatorio === 'planejado-vs-realizado' && (
      <button
        type="button" // Importante ser type="button" para não submeter o form
        onClick={handleSalvarAlteracoes}
        disabled={loading || !matrizEditavel}
        style={{
          height: 44,
          minWidth: 170,
          padding: '0 32px',
          background: '#007A4D', // Um verde para diferenciar
          color: WEG_BRANCO,
          border: 'none',
          borderRadius: 8,
          fontWeight: 800,
          fontSize: 17,
          cursor: 'pointer',
          boxShadow: '0 3px 10px #0002',
          marginLeft: 12, // Espaçamento
          letterSpacing: 0.5,
          opacity: (loading || !matrizEditavel) ? 0.6 : 1
        }}
      >
        Salvar Alterações
      </button>
    )}
  </div>
      </form>

      {/* Feedbacks */}
      {loading && <div style={{color: WEG_AZUL, marginTop:12, fontWeight:600}}>Carregando...</div>}
      {error && <div style={{color: '#D32F2F', background: '#FFEBEE', border: '1px solid #D32F2F', borderRadius: 8, padding: '12px 16px', marginTop:12, fontWeight:600}}>Erro: {error}</div>}

      {/* Tabela de resultados */}
      <div style={{marginTop:32}}>
        {renderTable()}
      </div>

      {/* Mensagem para nenhum resultado */}
      {(!loading && !matrizEditavel && result && Array.isArray(result) && result.length === 0) && (
        <div style={{marginTop:24, color:WEG_AZUL, fontWeight:500, fontSize:18}}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      )}
    </div>
  );
}
