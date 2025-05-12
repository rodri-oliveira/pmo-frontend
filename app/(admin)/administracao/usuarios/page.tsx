"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { apiGet } from '@/services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  data_criacao: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Dados mockados para desenvolvimento (quando a API não estiver disponível)
  const dadosMockUsuarios: Usuario[] = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@empresa.com',
      ativo: true,
      data_criacao: '2025-01-15T10:00:00'
    },
    {
      id: 2,
      nome: 'Maria Oliveira',
      email: 'maria.oliveira@empresa.com',
      ativo: true,
      data_criacao: '2025-01-15T10:00:00'
    },
    {
      id: 3,
      nome: 'Pedro Santos',
      email: 'pedro.santos@empresa.com',
      ativo: false,
      data_criacao: '2025-01-15T10:00:00'
    }
  ];

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ items: Usuario[] }>('/usuarios');
      setUsuarios(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      // Garantir que usuarios seja um array mesmo em caso de erro
      setUsuarios(dadosMockUsuarios);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Usuários do Sistema
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Gerenciamento de usuários do sistema.
        </Typography>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width={50}><strong>ID</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell width={120}><strong>Status</strong></TableCell>
              <TableCell width={120}><strong>Data Criação</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} sx={{ color: '#00579d' }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>Carregando usuários...</Typography>
                </TableCell>
              </TableRow>
            ) : (usuarios || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2">Nenhum usuário encontrado.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              (usuarios || []).map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.id}</TableCell>
                  <TableCell>{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    {usuario.ativo ? 
                      <span style={{ color: 'green' }}>Ativo</span> : 
                      <span style={{ color: 'red' }}>Inativo</span>}
                  </TableCell>
                  <TableCell>
                    {new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
