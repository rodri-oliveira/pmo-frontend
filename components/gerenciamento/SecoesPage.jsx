"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, CircularProgress, 
  FormControlLabel, Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecaoModal from './SecaoModal'; // Importa o modal

const wegBlue = '#00579d';

// Mock data - será substituído pela chamada da API
const mockSecoes = [
  { id: 1, nome: 'Desenvolvimento de Produto', descricao: 'Responsável pelo desenvolvimento de novos produtos.', ativo: true },
  { id: 2, nome: 'Engenharia de Aplicação', descricao: 'Equipe que customiza soluções para clientes.', ativo: true },
  { id: 3, nome: 'Qualidade e Testes', descricao: 'Garante a qualidade dos entregáveis.', ativo: false },
];

export default function SecoesPage() {
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [secaoEdit, setSecaoEdit] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    // Simula o carregamento de dados da API
    setTimeout(() => {
      setSecoes(mockSecoes);
      setLoading(false);
    }, 1000);
  }, []);

  const handleOpenModal = (secao = null) => {
    setSecaoEdit(secao);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSecaoEdit(null);
    setModalOpen(false);
  };

  const handleSaveSecao = (data) => {
    console.log('Salvando (visualmente):', data);
    // A lógica de salvar (criar ou editar) será implementada depois
    handleCloseModal();
  };

  const handleDelete = (id) => {
    console.log('Deletar seção com id:', id);
    // Lógica para confirmar e deletar
  };

  return (
    <Paper elevation={3} sx={{ p: 4, background: 'white', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: wegBlue, fontWeight: 'bold' }}>
            Gerenciamento de Seções
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Crie, edite e visualize as seções da organização.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ backgroundColor: wegBlue, '&:hover': { backgroundColor: '#004a8c' } }}
        >
          Nova Seção
        </Button>
      </Box>

      {/* Toggle "Mostrar Inativos" */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={() => setShowInactive((prev) => !prev)}
              color="primary"
            />
          }
          label="Mostrar Inativos"
        />
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #ddd' }}>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de seções">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Descrição</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {secoes
                .filter((secao) =>
                  showInactive ? true : secao.ativo !== false
                )
                .map((secao) => (
                  <TableRow key={secao.id}>
                    <TableCell component="th" scope="row">
                      {secao.nome}
                    </TableCell>
                    <TableCell>{secao.descricao}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(secao)} size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => {
                        if (window.confirm('Deseja realmente excluir esta seção?')) {
                          handleDelete(secao.id);
                        }
                      }} size="small" sx={{ color: 'red' }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <SecaoModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSecao}
        secao={secaoEdit}
      />
    </Paper>
  );
}
