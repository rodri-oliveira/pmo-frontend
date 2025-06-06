import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField, Button, FormControlLabel, Checkbox,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, TableContainer, MenuItem, Select, InputLabel, FormControl,
  CircularProgress, Pagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AutocompleteSecaoCascade from './AutocompleteSecaoCascade';
import AutocompleteEquipeCascade from './AutocompleteEquipeCascade';
import AutocompleteProjetoCascade from './AutocompleteProjetoCascade';
import AutocompleteRecursoCascade from './AutocompleteRecursoCascade';
import axios from 'axios';

const monthNames = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

function formatAno(ano) {
  if (!ano) return '';
  // Remove qualquer ponto ou vírgula, força inteiro
  return String(Number.parseInt(ano, 10));
}

function formatMes(mes) {
  if (!mes) return '';
  const n = Number.parseInt(mes, 10);
  if (isNaN(n) || n < 1 || n > 12) return mes;
  // Formatar mês para pt-BR usando Intl e capitalizar
  const name = new Date(0, n - 1)
    .toLocaleString('pt-BR', { month: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatQtd(qtd) {
  if (qtd == null) return '';
  return String(Number.parseInt(qtd, 10));
}

function formatHoras(horas) {
  if (horas == null) return '';
  return Number(horas).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RelatorioHorasApontadas() {
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [secao, setSecao] = useState(null);
  const [equipe, setEquipe] = useState(null);
  const [projeto, setProjeto] = useState(null);
  const [recurso, setRecurso] = useState(null);
  const [fonte, setFonte] = useState('JIRA');
  const [agrupRecurso, setAgrupRecurso] = useState(false);
  const [agrupProjeto, setAgrupProjeto] = useState(false);
  const [agrupData, setAgrupData] = useState(false);
  const [agrupMes, setAgrupMes] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalHoras, setTotalHoras] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const gerarRelatorio = async () => {
    if (!dataInicio || !dataFim) return;
    setLoading(true);
    try {
      const params = {
        data_inicio: dataInicio,
        data_fim: dataFim,
        ...(secao && { secao_id: secao }),
        ...(equipe && { equipe_id: equipe }),
        ...(projeto && { projeto_id: projeto }),
        ...(recurso && { recurso_id: recurso }),
        ...(fonte && { fonte_apontamento: fonte }),
        ...(agrupRecurso && { agrupar_por_recurso: true }),
        ...(agrupProjeto && { agrupar_por_projeto: true }),
        ...(agrupData && { agrupar_por_data: true }),
        ...(agrupMes && { agrupar_por_mes: true }),
        skip: (page - 1) * limit,
        limit
      };
      const resp = await axios.get('/backend/v1/relatorios/horas-apontadas', { params });
      setItems(resp.data.items || []);
      setTotal(resp.data.total || 0);
      setTotalHoras(resp.data.total_horas || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // não gerar automaticamente
  }, []);

  const handlePageChange = (e, value) => {
    setPage(value);
    gerarRelatorio();
  };

  const columns = useMemo(() => {
    // Ordem: Ano, Mês, Horas, Qtd. Registros
    if (agrupMes && !agrupData && !agrupRecurso && !agrupProjeto) {
      return [
        { key: 'ano', label: 'Ano' },
        { key: 'mes', label: 'Mês' },
        { key: 'horas', label: 'Horas' },
        { key: 'quantidade', label: 'Qtd. Registros' },
      ];
    }
    if (!agrupRecurso && !agrupProjeto && !agrupData && !agrupMes) {
      return [
        { key: 'data', label: 'Data' },
        { key: 'recurso', label: 'Recurso' },
        { key: 'projeto', label: 'Projeto' },
        { key: 'fonte', label: 'Fonte' },
        { key: 'horas', label: 'Horas' },
        { key: 'quantidade', label: 'Qtd. Registros' },
      ];
    }
    // Agrupamentos customizados
    const cols = [];
    if (agrupData && !agrupMes) cols.push({ key: 'data', label: 'Data' });
    if (agrupRecurso) cols.push({ key: 'recurso', label: 'Recurso' });
    if (agrupProjeto) cols.push({ key: 'projeto', label: 'Projeto' });
    cols.push({ key: 'horas', label: 'Horas' });
    if (agrupData || agrupRecurso || agrupProjeto) cols.push({ key: 'quantidade', label: 'Qtd. Registros' });
    return cols;
  }, [agrupData, agrupMes, agrupProjeto, agrupRecurso]);

  return (
    <Paper style={{ padding: 16 }}>
      <h2>Relatório: Horas Apontadas</h2>
      <p>Detalhamento e agregação de horas lançadas, com filtros por recurso, projeto, equipe, seção e fonte.</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <DatePicker
          label="Data Início*"
          value={dataInicio}
          onChange={setDataInicio}
          renderInput={(params) => <TextField {...params} />}
        />
        <DatePicker
          label="Data Fim*"
          value={dataFim}
          onChange={setDataFim}
          renderInput={(params) => <TextField {...params} />}
        />
        <AutocompleteSecaoCascade value={secao} onChange={setSecao} />
        <AutocompleteEquipeCascade value={equipe} parentId={secao} onChange={setEquipe} />
        <AutocompleteProjetoCascade value={projeto} recursoId={recurso} equipeId={equipe} secaoId={secao} onChange={setProjeto} />
        <AutocompleteRecursoCascade value={recurso} equipeId={equipe} secaoId={secao} onChange={setRecurso} />
        <FormControl style={{ minWidth: 120 }}>
          <InputLabel>Fonte</InputLabel>
          <Select value={fonte} label="Fonte" onChange={e => setFonte(e.target.value)}>
            <MenuItem value="JIRA">JIRA</MenuItem>
            <MenuItem value="MANUAL">MANUAL</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div>
        <FormControlLabel control={<Checkbox checked={agrupRecurso} onChange={e => setAgrupRecurso(e.target.checked)} />} label="Agrupar por Recurso" />
        <FormControlLabel control={<Checkbox checked={agrupProjeto} onChange={e => setAgrupProjeto(e.target.checked)} />} label="Agrupar por Projeto" />
        <FormControlLabel control={<Checkbox checked={agrupData} onChange={e => setAgrupData(e.target.checked)} />} label="Agrupar por Data" />
        <FormControlLabel control={<Checkbox checked={agrupMes} onChange={e => setAgrupMes(e.target.checked)} />} label="Agrupar por Mês" />
      </div>
      <Button variant="contained" color="primary" onClick={gerarRelatorio} disabled={loading || !dataInicio || !dataFim} style={{ marginTop: 16 }}>
        {loading ? <CircularProgress size={24} /> : 'Gerar Relatório'}
      </Button>

      <div style={{ marginTop: 24 }}>
        <strong>Total Horas:</strong> {totalHoras}
        {columns.length > 0 && (
          <TableContainer component={Paper} style={{ marginTop: 16 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map(c => <TableCell key={c.key}>{c.label}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map(c => (
                      <TableCell key={c.key}>
                        {(() => {
                          switch (c.key) {
                            case 'horas':
                              return formatHoras(row.horas);
                            case 'quantidade':
                              // Preferencialmente usar o campo do backend 'qtd_lancamentos', senão 'quantidade'
                              return formatQtd(row.qtd_lancamentos ?? row.quantidade);
                            case 'ano':
                              return formatAno(row.ano);
                            case 'mes':
                              // Sempre traduzir o mês pelo número
                              return formatMes(row.mes);
                            default:
                              return row[c.key] ?? '';
                          }
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {total > limit && (
          <Pagination count={Math.ceil(total / limit)} page={page} onChange={handlePageChange} style={{ marginTop: 16 }} />
        )}
      </div>
    </Paper>
  );
}
