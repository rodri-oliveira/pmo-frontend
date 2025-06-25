"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Typography, Divider,
  Stepper, Step, StepLabel, Box, Alert
} from '@mui/material';
import { getSecoes } from '../../services/secoes';
import { getStatusProjetos } from '../../services/statusProjetos';
import { getRecursos } from '../../services/recursos';
import AlocacaoForm from './AlocacaoForm';

const wegBlue = '#00579d';

export default function ProjetoModal({ open, onClose, onSave, projeto, secoes, statusProjetos, apiError = '' }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [recursos, setRecursos] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Dados do Projeto', 'Alocação de Recursos'];

  const isEditing = !!projeto;

  // Função para buscar recursos com filtro de seção
  const fetchRecursos = useCallback(async (secaoId) => {
    try {
      const params = secaoId ? { secao_id: secaoId } : undefined;
      const data = await getRecursos(params);
      setRecursos((data && data.items) || []);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      setRecursos([]);
    }
  }, []);

    // Recarrega recursos quando a seção selecionada mudar
  useEffect(() => {
    if (open) {
      if (formData.secao_id) {
        fetchRecursos(formData.secao_id);
      } else {
        setRecursos([]);
      }
    }
  }, [formData.secao_id, open, fetchRecursos]);

  useEffect(() => {
    if (open) {
        setActiveStep(0); // Reset step when modal opens
        setAlocacoes([]);
        if (projeto) {
            setFormData({
                nome: projeto.nome || '',
                descricao: projeto.descricao || '',
                codigo_empresa: projeto.codigo_empresa || '',
                secao_id: projeto.secao_id || '',
                status_projeto_id: projeto.status_projeto_id || '',
                data_inicio_prevista: projeto.data_inicio_prevista?.split('T')[0] || '',
                data_fim_prevista: projeto.data_fim_prevista?.split('T')[0] || '',
            });
            setAlocacoes(projeto.alocacoes?.map(a => ({...a, horas_planejadas: a.horas_planejadas || []})) || []);
        } else {
            setFormData({
                nome: '',
                descricao: '',
                codigo_empresa: '',
                secao_id: '',
                status_projeto_id: '',
                data_inicio_prevista: new Date().toISOString().split('T')[0],
                data_fim_prevista: '',
                ativo: true,
            });
            setAlocacoes([]);
        }
    }
  }, [projeto, open]);

  useEffect(() => {
    if (open) {
      // Quando o modal abrir, buscar recursos com a seção atual (caso exista)
      fetchRecursos(formData.secao_id);
    }
  }, [open, formData.secao_id, fetchRecursos]);

  // Avança do passo 0 para 1
  const handleAvancar = () => {
    if (validate()) setActiveStep(1);
  };

  const buildFinalData = () => {
    const dataToSave = {
      ...formData,
      
      secao_id: formData.secao_id ? parseInt(formData.secao_id, 10) : null,
      status_projeto_id: formData.status_projeto_id ? parseInt(formData.status_projeto_id, 10) : null,
      ativo: true,
    };
    if (dataToSave.data_fim_prevista === '') {
      dataToSave.data_fim_prevista = null;
    }


    // limpar opcionais vazios
    if (!dataToSave.codigo_empresa) delete dataToSave.codigo_empresa;
    if (!dataToSave.jira_project_key) delete dataToSave.jira_project_key;

    return {
      projeto: dataToSave,
      alocacoes: alocacoes.map(({ temp_id, ...rest }) => ({
        ...rest,
        ativo: true,
        recurso_id: rest.recurso_id ? parseInt(rest.recurso_id, 10) : null,
        horas_planejadas: rest.horas_planejadas.map(p => ({
          ...p,
          horas_planejadas: p.horas_planejadas ? parseFloat(p.horas_planejadas) : 0,
        })),
      })),
    };
  };

  // Salva recursos mas mantém modal aberto
  const handleSalvarRecurso = () => {
    if (!validate() || !validateAlocacoes()) return;
    const finalData = buildFinalData();
    onSave(finalData, true); // Manter modal aberto
  };

  // Envia projeto (fecha modal)
  const handleEnviarProjeto = () => {
    if (!validate() || !validateAlocacoes()) return;
    const finalData = buildFinalData();
    onSave(finalData, false); // Fechar modal após salvar
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Se a seção mudar, limpamos as alocações para evitar inconsistência
    if (name === 'secao_id' && value !== formData.secao_id) {
      setAlocacoes([]);
    }
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nome) newErrors.nome = 'O nome do projeto é obrigatório.';
    if (!formData.descricao) newErrors.descricao = 'A descrição é obrigatória.';
    if (!formData.secao_id) newErrors.secao_id = 'A seção é obrigatória.';
    if (!formData.status_projeto_id) newErrors.status_projeto_id = 'O status do projeto é obrigatório.';
    if (!formData.data_inicio_prevista) newErrors.data_inicio_prevista = 'A data de início prevista é obrigatória.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validação da etapa de alocação
  const validateAlocacoes = () => {
    if (alocacoes.length === 0) {
      alert('Adicione pelo menos uma alocação de recurso.');
      return false;
    }
    const recursoIds = new Set();
  for (const aloc of alocacoes) {
      if (!aloc.recurso_id) {
        alert('Selecione um recurso para todas as alocações.');
        return false;
      }
      if (recursoIds.has(aloc.recurso_id)) {
      alert('Este recurso já está alocado neste projeto.');
      return false;
    }
    recursoIds.add(aloc.recurso_id);
    if (!aloc.horas_planejadas || aloc.horas_planejadas.length === 0) {
        alert('Informe horas planejadas para todas as alocações.');
        return false;
      }
    }
    return true;
  };

  const handleAddAlocacao = () => {
    const newAlocacao = {
      temp_id: `temp_${Date.now()}`,
      recurso_id: '',
      data_inicio_alocacao: '',
      data_fim_alocacao: '',
      horas_planejadas: []
    };
    setAlocacoes([...alocacoes, newAlocacao]);
  };

  const handleRemoveAlocacao = (index) => {
    setAlocacoes(alocacoes.filter((_, i) => i !== index));
  };

  const handleUpdateAlocacao = (index, updatedAlocacao) => {
    const newAlocacoes = [...alocacoes];
    newAlocacoes[index] = updatedAlocacao;
    setAlocacoes(newAlocacoes);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: wegBlue, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 0 }}>
        {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 2 }}>
            {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
            ))}
        </Stepper>

        {activeStep === 0 && (
            <Box>
                <TextField autoFocus required margin="dense" name="nome" label="Nome do Projeto" type="text" fullWidth variant="outlined" value={formData.nome || ''} onChange={handleChange} error={!!errors.nome} helperText={errors.nome} sx={{ mt: 2 }} />
                <TextField required margin="dense" name="descricao" label="Descrição" type="text" fullWidth multiline rows={4} variant="outlined" value={formData.descricao || ''} onChange={handleChange} error={!!errors.descricao} helperText={errors.descricao} />
                <FormControl fullWidth margin="dense" required error={!!errors.secao_id}>
                  <InputLabel>Seção</InputLabel>
                  <Select name="secao_id" value={formData.secao_id || ''} label="Seção" onChange={handleChange}>
                    {secoes.map((secao) => (
                      <MenuItem key={secao.id} value={secao.id}>{secao.nome}</MenuItem>
                    ))}
                  </Select>
                  {errors.secao_id && <FormHelperText>{errors.secao_id}</FormHelperText>}
                </FormControl>
                <FormControl fullWidth margin="dense" required error={!!errors.status_projeto_id}>
                  <InputLabel>Status do Projeto</InputLabel>
                  <Select name="status_projeto_id" value={formData.status_projeto_id || ''} label="Status do Projeto" onChange={handleChange}>
                    {statusProjetos.map((status) => (
                      <MenuItem key={status.id} value={status.id}>{status.nome}</MenuItem>
                    ))}
                  </Select>
                  {errors.status_projeto_id && <FormHelperText>{errors.status_projeto_id}</FormHelperText>}
                </FormControl>
                <TextField required margin="dense" name="data_inicio_prevista" label="Data de Início Prevista" type="date" fullWidth variant="outlined" value={formData.data_inicio_prevista || ''} onChange={handleChange} error={!!errors.data_inicio_prevista} helperText={errors.data_inicio_prevista} InputLabelProps={{ shrink: true }} />
                <TextField margin="dense" name="data_fim_prevista" label="Data de Fim Prevista (Opcional)" type="date" fullWidth variant="outlined" value={formData.data_fim_prevista || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Box>
        )}

        {activeStep === 1 && (
            <Box>
                <Divider sx={{ my: 3 }}>
                    <Typography>Alocação de Recursos</Typography>
                </Divider>

                {alocacoes.map((alocacao, index) => (
                    <AlocacaoForm 
                        key={alocacao.id || alocacao.temp_id}
                        index={index}
                        alocacao={alocacao}
                        onUpdate={handleUpdateAlocacao}
                        onRemove={handleRemoveAlocacao}
                        recursos={recursos}
                    />
                ))}

                <Button onClick={handleAddAlocacao} sx={{ mt: 1 }}>
                    Adicionar Recurso
                </Button>
            </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 0 && (
            <Button onClick={handleAvancar} variant="contained" sx={{ backgroundColor: wegBlue }}>
              Avançar
            </Button>
          )}
          {activeStep === 1 && (
            <>
              <Button onClick={() => setActiveStep(0)}>Voltar</Button>
              <Button onClick={handleSalvarRecurso}>Salvar Recurso</Button>
              <Button onClick={handleEnviarProjeto} variant="contained" sx={{ backgroundColor: wegBlue }}>
                Enviar
              </Button>
            </>
          )}
      </DialogActions>
    </Dialog>
  );
}
