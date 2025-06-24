"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Typography, Divider
} from '@mui/material';
import { getSecoes } from '../../services/secoes';
import { getStatusProjetos } from '../../services/statusProjetos';
import { getRecursos } from '../../services/recursos';
import AlocacaoForm from './AlocacaoForm';

const wegBlue = '#00579d';

export default function ProjetoModal({ open, onClose, onSave, projeto, secoes, statusProjetos }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [recursos, setRecursos] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);

  const isEditing = !!projeto;

  useEffect(() => {
    if (open) {
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
            });
            setAlocacoes([]);
        }
        setErrors({});
    }
  }, [projeto, open]);

  useEffect(() => {
    const fetchRecursos = async () => {
        try {
            const data = await getRecursos();
            setRecursos(data.items || []);
        } catch (error) {
            console.error("Erro ao buscar recursos:", error);
            setRecursos([]);
        }
    };
    if (open) {
        fetchRecursos();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const dataToSave = { ...formData };
    if (dataToSave.data_fim_prevista === '') {
      dataToSave.data_fim_prevista = null;
    }

    const finalData = {
        projeto: dataToSave,
        alocacoes: alocacoes.map(a => ({
            ...a,
            horas_planejadas: a.horas_planejadas.map(p => ({...p, horas_planejadas: parseFloat(p.horas_planejadas) || 0}))
        }))
    };

    onSave(finalData);
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
      <DialogContent>
        <TextField autoFocus required margin="dense" name="nome" label="Nome do Projeto" type="text" fullWidth variant="outlined" value={formData.nome || ''} onChange={handleChange} error={!!errors.nome} helperText={errors.nome} sx={{ mt: 2 }} />
        <TextField required margin="dense" name="descricao" label="Descrição" type="text" fullWidth multiline rows={4} variant="outlined" value={formData.descricao || ''} onChange={handleChange} error={!!errors.descricao} helperText={errors.descricao} />
        <TextField margin="dense" name="codigo_empresa" label="Código da Empresa (Opcional)" type="text" fullWidth variant="outlined" value={formData.codigo_empresa || ''} onChange={handleChange} />
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

      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: wegBlue }}>
          {isEditing ? 'Salvar Alterações' : 'Criar Projeto'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
