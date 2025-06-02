import React, { useState, useRef, useEffect } from 'react';
import { buscarRecursosPorNome, buscarRecursosPorEquipe } from '../../utils/autocomplete';

/**
 * Componente de autocomplete para selecionar recurso pelo nome
 * Props:
 *   value: valor atual (id do recurso ou objeto {id, nome})
 *   onChange: função chamada com o objeto {id, nome} do recurso selecionado
 *   equipeId: ID da equipe para filtrar recursos (opcional)
 */
export default function AutocompleteRecursoCascade({ value, onChange, equipeId, placeholder = 'Digite o nome do recurso...' }) {
  const [inputValue, setInputValue] = useState(value && value.nome ? value.nome : '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [todosRecursos, setTodosRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  // Carregar recursos quando a equipe mudar
  useEffect(() => {
    const carregarRecursos = async () => {
      setLoading(true);
      try {
        if (equipeId) {
          const recursos = await buscarRecursosPorEquipe(equipeId);
          setTodosRecursos(recursos);
          setSugestoes(recursos);
        } else {
          setTodosRecursos([]);
          setSugestoes([]);
        }
      } catch (error) {
        console.error('Erro ao carregar recursos:', error);
      } finally {
        setLoading(false);
      }
    };

    // Limpar o valor selecionado quando a equipe mudar
    if (value && onChange) {
      onChange(null);
      setInputValue('');
    }

    carregarRecursos();
  }, [equipeId]);

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
      // Se o campo estiver vazio, mostrar todos os recursos da equipe
      setSugestoes(todosRecursos);
      setShowSugestoes(true);
      return;
    }
    
    if (val.length >= 2) {
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
    if (inputValue && equipeId) {
      // Se já tem um valor, buscar por esse valor
      buscarRecursosPorNome(inputValue, equipeId).then(recursos => {
        setSugestoes(recursos.length > 0 ? recursos : todosRecursos);
        setShowSugestoes(true);
      });
    } else if (todosRecursos.length > 0) {
      // Se não tem valor mas tem recursos, mostrar todos os recursos
      setSugestoes(todosRecursos);
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
        Recurso
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={equipeId ? placeholder : 'Digite o nome da equipe...'}
        style={{ 
          width: '100%', 
          padding: '8px 12px', 
          borderRadius: 6, 
          border: '1.5px solid #E0E3E7', 
          fontSize: 15,
          background: loading || !equipeId ? '#f5f5f5' : '#fff'
        }}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
        disabled={loading || !equipeId}
      />
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
