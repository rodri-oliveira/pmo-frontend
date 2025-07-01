import React, { useState, useRef, useEffect } from 'react';
import { buscarEquipesPorNome, buscarEquipesPorSecao, buscarTodasEquipes } from '../../utils/autocomplete';

/**
 * Componente de autocomplete para selecionar equipe pelo nome
 * Props:
 *   value: valor atual (id da equipe ou objeto {id, nome})
 *   onChange: função chamada com o objeto {id, nome} da equipe selecionada
 *   secaoId: ID da seção para filtrar equipes (opcional)
 */
export default function AutocompleteEquipeCascade({ value, onChange, options, placeholder = 'Digite o nome da equipe...' }) {
  const [inputValue, setInputValue] = useState(value && value.nome ? value.nome : '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [todasEquipes, setTodasEquipes] = useState(options || []);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  // Sempre que options mudar, atualiza sugestões
  useEffect(() => {
    setTodasEquipes(options || []);
    setSugestoes(options || []);
  }, [options]);

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
      setSugestoes(todasEquipes);
      setShowSugestoes(true);
      if (onChange) onChange(null);
      return;
    }
    // Filtro local por nome
    const filtradas = todasEquipes.filter(eq => eq.nome && eq.nome.toLowerCase().includes(val.toLowerCase()));
    setSugestoes(filtradas);
    setShowSugestoes(true);
  }

  function handleFocus() {
    // Ao focar, sempre mostrar sugestões disponíveis
    setSugestoes(todasEquipes);
    setShowSugestoes(true);
  }

  function handleSelect(sugestao) {
    setInputValue(sugestao.nome);
    setShowSugestoes(false);
    setSugestoes([]);
    if (onChange) onChange(sugestao); // Retorna o objeto { id, nome }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '16.5px 14px',
          borderRadius: 4,
          border: '1px solid #C4C4C4',
          fontSize: '1rem',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          background: loading ? '#f5f5f5' : '#fff',
        }}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
        disabled={loading}
      />
      {inputValue && !loading && (
        <span
          onClick={() => {
            setInputValue('');
            if (onChange) onChange(null);
            setSugestoes(todasEquipes);
            setShowSugestoes(false);
          }}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
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
