import React, { useState, useRef, useEffect } from 'react';

export default function AutocompleteProjetoCascade({ value, onChange, secaoId, recursoId, equipeId, data_inicio, data_fim, filterBySecaoOnly = false, placeholder = 'Digite o nome do projeto...' }) {
  const [inputValue, setInputValue] = useState(value && value.nome ? value.nome : '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [todosProjetos, setTodosProjetos] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  const currentRecursoId = recursoId && recursoId.id ? recursoId.id : recursoId;
  const currentEquipeId = equipeId;
  const currentSecaoId = secaoId && secaoId.id ? secaoId.id : secaoId;

  // Carrega projetos via endpoint com todos filtros de contexto
  const carregarProjetos = async () => {
    setLoading(true);
    setTodosProjetos([]);
    setSugestoes([]);
    setShowSugestoes(false);
    try {
      const params = new URLSearchParams();
      params.append('ativo', 'true');
      if (currentSecaoId) params.append('secao_id', currentSecaoId);
      if (currentEquipeId) params.append('equipe_id', currentEquipeId);
      if (currentRecursoId) params.append('recurso_id', currentRecursoId);
      if (data_inicio) params.append('data_inicio', data_inicio); // Adicionado
      if (data_fim) params.append('data_fim', data_fim);           // Adicionado

      const url = `/backend/v1/projetos/filtrar?${params.toString()}`;
      console.log(`[AutocompleteProjetoCascade] URL projetos: ${url}`);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erro ao buscar projetos');
      const data = await resp.json();
      const raw = Array.isArray(data) ? data : data.items || [];
      const projetos = raw.map(item => ({ id: item.id, nome: item.nome }));
      setTodosProjetos(projetos);
      setSugestoes(projetos);
      setShowSugestoes(true);
    } catch (error) {
      console.error('Erro ao carregar projetos filtrados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar projetos ao montar e quando qualquer contexto mudar
  useEffect(() => {
    setInputValue('');
    if (onChange) onChange(null);
    carregarProjetos();
  }, [currentSecaoId, currentEquipeId, currentRecursoId, data_inicio, data_fim]); // Adicionado data_inicio e data_fim

  // Atualizar o valor do input quando o value mudar externamente
  useEffect(() => {
    if (value && value.nome) {
      setInputValue(value.nome);
    } else if (!value) {
      setInputValue('');
    }
  }, [value]);

  async function handleInputChange(e) {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(timeoutRef.current);
    
    if (!val) {
      setSugestoes(todosProjetos);
      setShowSugestoes(true);
      if (onChange) onChange(null);
      return;
    }
    
    if (val.length >= 2) {
      // Filtra localmente projetos já carregados
      const filtered = todosProjetos.filter(p =>
        p.nome.toLowerCase().includes(val.toLowerCase())
      );
      setSugestoes(filtered);
      setShowSugestoes(true);
    } else {
      setSugestoes([]);
      setShowSugestoes(false);
    }
  }

  function handleFocus() {
    // Ao focar, mostrar todos os projetos disponíveis
    if (todosProjetos.length > 0) {
      setSugestoes(todosProjetos);
      setShowSugestoes(true);
    }
  }

  function handleSelect(sugestao) {
    setInputValue(sugestao.nome);
    setShowSugestoes(false);
    setSugestoes([]);
    if (onChange) onChange(sugestao); // Retorna o objeto { id, nome }
  }

  return (
    <div style={{ position: 'relative', width: 240 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, color: '#00579D' }}>
        Projeto
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
        disabled={loading}
        placeholder={placeholder}
        style={{ 
          width: '100%', 
          padding: '8px 12px', 
          borderRadius: 6, 
          border: '1.5px solid #E0E3E7', 
          fontSize: 15,
          background: loading ? '#f5f5f5' : '#fff'
        }}
      />
      {inputValue && !loading && (
        <span
          onMouseDown={e => {
            e.preventDefault();
            handleInputChange({ target: { value: '' } });
          }}
          style={{
            position: 'absolute',
            right: 12,
            top: 36,
            cursor: 'pointer',
            fontSize: 16,
            color: '#999'
          }}
        >×</span>
      )}
      {showSugestoes && sugestoes.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          maxHeight: 200,
          overflowY: 'auto',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 4,
          zIndex: 100, // Aumentar o z-index para garantir que apareça acima de outros elementos
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {sugestoes.map(sugestao => (
            <div
              key={sugestao.id}
              onClick={() => handleSelect(sugestao)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                transition: 'background 0.2s',
                backgroundColor: value && value.id === sugestao.id ? '#E3F1FC' : 'transparent',
                fontWeight: value && value.id === sugestao.id ? 600 : 400
              }}
              onMouseEnter={e => e.target.style.background = '#f5f5f5'}
              onMouseLeave={e => e.target.style.background = value && value.id === sugestao.id ? '#E3F1FC' : '#fff'}
            >
              {sugestao.nome}
            </div>
          ))}
        </div>
      )}
      
      {/* Adicionar um handler para fechar o dropdown quando clicar fora */}
      {showSugestoes && (
        <div 
          onClick={() => setShowSugestoes(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99
          }}
        />
      )}
    </div>
  );
}