import React, { useState, useRef, useEffect } from 'react';
import { buscarEquipesPorNome, buscarEquipesPorSecao } from '../../utils/autocomplete';

/**
 * Componente de autocomplete para selecionar equipe pelo nome
 * Props:
 *   value: valor atual (id da equipe ou objeto {id, nome})
 *   onChange: função chamada com o objeto {id, nome} da equipe selecionada
 *   secaoId: ID da seção para filtrar equipes (opcional)
 */
export default function AutocompleteEquipeCascade({ value, onChange, secaoId, placeholder = 'Digite o nome da equipe...' }) {
  const [inputValue, setInputValue] = useState(value && value.nome ? value.nome : '');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [todasEquipes, setTodasEquipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  // Carregar equipes quando a seção mudar
  useEffect(() => {
    const carregarEquipes = async () => {
      setLoading(true);
      try {
        if (secaoId) {
          const equipes = await buscarEquipesPorSecao(secaoId);
          setTodasEquipes(equipes);
          setSugestoes(equipes);
        } else {
          setTodasEquipes([]);
          setSugestoes([]);
        }
      } catch (error) {
        console.error('Erro ao carregar equipes:', error);
      } finally {
        setLoading(false);
      }
    };

    // Limpar o valor selecionado quando a seção mudar
    if (value && onChange) {
      onChange(null);
      setInputValue('');
    }

    carregarEquipes();
  }, [secaoId]);

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
      // Se o campo estiver vazio, mostrar todas as equipes da seção
      setSugestoes(todasEquipes);
      setShowSugestoes(true);
      return;
    }
    
    if (val.length >= 2) {
      timeoutRef.current = setTimeout(async () => {
        const sugests = await buscarEquipesPorNome(val, secaoId);
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
    if (inputValue && secaoId) {
      // Se já tem um valor, buscar por esse valor
      buscarEquipesPorNome(inputValue, secaoId).then(equipes => {
        setSugestoes(equipes.length > 0 ? equipes : todasEquipes);
        setShowSugestoes(true);
      });
    } else if (todasEquipes.length > 0) {
      // Se não tem valor mas tem equipes, mostrar todas as equipes
      setSugestoes(todasEquipes);
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
        Equipe
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={secaoId ? placeholder : 'Digite o nome da Seção...'}
        style={{ 
          width: '100%', 
          padding: '8px 12px', 
          borderRadius: 6, 
          border: '1.5px solid #E0E3E7', 
          fontSize: 15,
          background: loading || !secaoId ? '#f5f5f5' : '#fff'
        }}
        onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
        disabled={loading || !secaoId}
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
