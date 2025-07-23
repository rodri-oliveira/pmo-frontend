import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Buscar recursos com filtros e paginação
export async function getRecursos(params) {
  // Para recursos, usar endpoint específico sem /v1
  const queryParams = new URLSearchParams();
  
  // Converter parâmetros para o formato correto
  if (params) {
    if (params.apenas_ativos !== undefined) {
      queryParams.append('apenas_ativos', params.apenas_ativos);
    }
    if (params.skip !== undefined) {
      queryParams.append('skip', params.skip);
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit);
    }
    // Outros parâmetros
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          !['apenas_ativos', 'skip', 'limit'].includes(key)) {
        queryParams.append(key, value);
      }
    });
  }
  
  const queryString = queryParams.toString();
  const url = `http://localhost:8000/backend/recursos/${queryString ? '?' + queryString : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

// Buscar recurso por ID
export async function getRecursoById(id) {
  const response = await fetch(`http://localhost:8000/backend/recursos/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

// Criar recurso
export async function createRecurso(data) {
  console.log('🔍 createRecurso - Dados enviados:', data);
  console.log('🔍 createRecurso - JSON enviado:', JSON.stringify(data));
  
  const response = await fetch('http://localhost:8000/backend/recursos/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  console.log('🔍 createRecurso - Status da resposta:', response.status);
  console.log('🔍 createRecurso - Headers da resposta:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ createRecurso - Erro do backend:', errorText);
    
    // Tentar extrair mensagem amigável do backend
    let userMessage = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        userMessage = errorData.detail;
      }
    } catch (e) {
      // Se não conseguir fazer parse do JSON, usar mensagem padrão
      userMessage = errorText || userMessage;
    }
    
    throw new Error(userMessage);
  }
  
  const result = await response.json();
  console.log('✅ createRecurso - Resposta do backend:', result);
  return result;
}

// Atualizar recurso
export async function updateRecurso(id, data) {
  const response = await fetch(`http://localhost:8000/backend/recursos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

// Deletar recurso
export async function deleteRecurso(id) {
  const response = await fetch(`http://localhost:8000/backend/recursos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  // DELETE pode retornar vazio ou dados
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

// Buscar equipes para dropdown de recurso
export function getEquipes(params) {
  return apiGet('/equipes', params);
}
