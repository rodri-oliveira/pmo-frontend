import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsultarApontamentosPage from './page';

// Mock dos serviços usados na página
jest.mock('@/services/apontamentos', () => ({
  getApontamentos: jest.fn(() => Promise.resolve({ items: [
    { id: 1, data_apontamento: '2025-05-27', horas_apontadas: 8, descricao: 'Teste', recurso: { nome: 'João' }, projeto: { nome: 'Projeto X' }, fonte_apontamento: 'MANUAL', jira_issue_key: '', recurso_id: 1, projeto_id: 1 },
    { id: 2, data_apontamento: '2025-05-28', horas_apontadas: 4, descricao: 'Reunião', recurso: { nome: 'Maria' }, projeto: { nome: 'Projeto Y' }, fonte_apontamento: 'JIRA', jira_issue_key: 'PMO-123', recurso_id: 2, projeto_id: 2 },
  ], total: 2 }))
}));
jest.mock('@/services/projetos', () => ({ getProjetos: jest.fn(() => Promise.resolve({ items: [{ id: 1, nome: 'Projeto X' }, { id: 2, nome: 'Projeto Y' }] })) }));
jest.mock('@/services/recursos', () => ({ getRecursos: jest.fn(() => Promise.resolve({ items: [{ id: 1, nome: 'João' }, { id: 2, nome: 'Maria' }] })) }));
jest.mock('@/services/equipes', () => ({ getEquipes: jest.fn(() => Promise.resolve({ items: [{ id: 1, nome: 'Equipe A' }] })) }));
jest.mock('@/services/secoes', () => ({ getSecoes: jest.fn(() => Promise.resolve({ items: [{ id: 1, nome: 'Seção 1' }] })) }));


describe('ConsultarApontamentosPage', () => {
  it('renderiza filtros principais', async () => {
    render(<ConsultarApontamentosPage />);
    expect(await screen.findByLabelText(/Projeto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recurso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Equipe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Seção/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fonte do Apontamento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jira Issue Key/i)).toBeInTheDocument();
  });

  it('exibe os apontamentos retornados pela API', async () => {
    render(<ConsultarApontamentosPage />);
    expect(await screen.findByText('João')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('Projeto X')).toBeInTheDocument();
    expect(screen.getByText('Projeto Y')).toBeInTheDocument();
    expect(screen.getByText('Teste')).toBeInTheDocument();
    expect(screen.getByText('Reunião')).toBeInTheDocument();
  });

  it('mostra mensagem quando não há dados', async () => {
    const { getApontamentos } = require('@/services/apontamentos');
    getApontamentos.mockResolvedValueOnce({ items: [], total: 0 });
    render(<ConsultarApontamentosPage />);
    expect(await screen.findByText(/Nenhum apontamento encontrado/i)).toBeInTheDocument();
  });

  it('não deve exibir nenhum componente de configuração ou sincronização JIRA', async () => {
    render(<ConsultarApontamentosPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Integração com JIRA/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Sincronização de Dados/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Salvar Configurações/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Testar Conexão/i)).not.toBeInTheDocument();
    });
  });
});
