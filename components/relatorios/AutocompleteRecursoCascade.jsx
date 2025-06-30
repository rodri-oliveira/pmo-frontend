import React, { useState, useRef, useEffect } from 'react';
import { buscarRecursosPorNome, buscarRecursosPorEquipe, buscarTodosRecursos } from '../../utils/autocomplete';

/**
 * Componente de autocomplete para selecionar recurso pelo nome
 * Props:
 *   value: valor atual (id do recurso ou objeto {id, nome})
 *   onChange: função chamada com o objeto {id, nome} do recurso selecionado
 *   equipeId: ID da equipe para filtrar recursos (opcional)
 */
export default function AutocompleteRecursoCascade({ value, onChange, equipeId, placeholder = 'Digite o nome do recurso...', options }) {
  const [inputValue, setInputValue] = useState(value && value.nome ? value.nome : '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [todosRecursos, setTodosRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  // Carregar recursos ao montar e quando a equipe mudar
  useEffect(() => {
    if (options) {
      setTodosRecursos(options);
      setSugestoes(options);
    } else {
      const carregarRecursos = async () => {
        setLoading(true);
        try {
          const recursos = equipeId
            ? await buscarRecursosPorEquipe(equipeId)
            : await buscarTodosRecursos();
          setTodosRecursos(recursos);
          setSugestoes(recursos);
        } catch (error) {
          console.error('Erro ao carregar recursos:', error);
        } finally {
          setLoading(false);
        }
      };
      carregarRecursos();
    }
  }, [equipeId, options]);

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
      setSugestoes(todosRecursos);
      setShowSugestoes(true);
      if (onChange) onChange(null);
      return;
    }
    
    if (options) {
      const sugests = todosRecursos.filter(r => r.nome && r.nome.toLowerCase().includes(val.toLowerCase()));
      setSugestoes(sugests);
      setShowSugestoes(true);
    } else if (val.length >= 2) {
      timeoutRef.current = setTimeout(async () => {
        const sugests = await buscarRecursosPorNome(val, equipeId);
        setSugestoes(sugests);
        setShowSugestoes(true);
      }, 300);
    } else {
      setSugestoes([]);
      setShowSugestoes(false);
    }
  }

  function handleFocus() {
    // Ao focar, sempre mostrar sugestões disponíveis
    setSugestoes(todosRecursos);
    setShowSugestoes(true);
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
        Recurso
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        style={{ 
          width: '100%', 
          padding: '8px 12px', 
          borderRadius: 6, 
          border: '1.5px solid #E0E3E7', 
          fontSize: 15,
          background: loading ? '#f5f5f5' : '#fff'
        }}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
        disabled={loading}
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
