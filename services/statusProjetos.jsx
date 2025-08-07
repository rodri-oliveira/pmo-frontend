// Buscar lista de status de projetos
export async function getStatusProjetos(params = {}) {
  // Converter parâmetros para o formato esperado pelo backend
  const queryParams = new URLSearchParams();
  
  if (params.skip !== undefined) queryParams.append('skip', params.skip);
  if (params.limit !== undefined) queryParams.append('limit', params.limit);
  if (params.apenas_ativos !== undefined) queryParams.append('apenas_ativos', params.apenas_ativos);
  
  const url = `http://localhost:8000/backend/status-projeto/?${queryParams.toString()}`;
  console.log('🔍 getStatusProjetos - URL:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ getStatusProjetos - Erro do backend:', errorText);
    
    let userMessage = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        userMessage = errorData.detail;
      }
    } catch (e) {
      userMessage = errorText || userMessage;
    }
    
    const err = new Error(userMessage);
    err.status = response.status;
    throw err;
  }
  
  return await response.json();
}

// Buscar status de projeto por ID
export async function getStatusProjeto(id) {
  const response = await fetch(`http://localhost:8000/backend/status-projeto/${id}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ getStatusProjeto - Erro do backend:', errorText);
    
    let userMessage = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        userMessage = errorData.detail;
      }
    } catch (e) {
      userMessage = errorText || userMessage;
    }
    
    const err = new Error(userMessage);
    err.status = response.status;
    throw err;
  }
  
  return await response.json();
}

// Criar novo status de projeto
export async function createStatusProjeto(data) {
  console.log('🔍 createStatusProjeto - Dados enviados:', data);
  
  const response = await fetch('http://localhost:8000/backend/status-projeto/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ createStatusProjeto - Erro do backend:', errorText);
    
    let userMessage = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        userMessage = errorData.detail;
      }
    } catch (e) {
      userMessage = errorText || userMessage;
    }
    
    const err = new Error(userMessage);
    err.status = response.status;
    throw err;
  }
  
  const result = await response.json();
  console.log('✅ createStatusProjeto - Resposta do backend:', result);
  return result;
}

// Atualizar status de projeto
export async function updateStatusProjeto(id, data) {
  const response = await fetch(`http://localhost:8000/backend/status-projeto/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ updateStatusProjeto - Erro do backend:', errorText);
    
    let userMessage = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        userMessage = errorData.detail;
      }
    } catch (e) {
      userMessage = errorText || userMessage;
    }
    
    const err = new Error(userMessage);
    err.status = response.status;
    throw err;
  }
  
  return await response.json();
}

// Deletar status de projeto
export async function deleteStatusProjeto(id) {
  const response = await fetch(`http://localhost:8000/backend/status-projeto/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ deleteStatusProjeto - Erro do backend:', errorText);
    
    let userMessage = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.detail) {
        userMessage = errorData.detail;
      }
    } catch (e) {
      userMessage = errorText || userMessage;
    }
    
    const err = new Error(userMessage);
    err.status = response.status;
    throw err;
  }
  
  // DELETE pode retornar 204 (sem conteúdo)
  if (response.status === 204) {
    return { success: true };
  }
  
  return await response.json();
}
