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
    // Ao focar, mostrar todas as equipes se não houver texto digitado
    if (!inputValue && todasEquipes.length > 0) {
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
        <ul style={{
          position: 'absolute',
          zIndex: 10,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 6,
          margin: 0,
          padding: '4px 0',
          width: '100%',
          maxHeight: 180,
          overflowY: 'auto',
          boxShadow: '0 2px 8px #0002',
          listStyle: 'none'
        }}>
          {sugestoes.map((s, idx) => (
            <li key={idx}
                onMouseDown={() => handleSelect(s)}
                style={{ 
                  padding: '8px 12px', 
                  cursor: 'pointer', 
                  fontSize: 15,
                  backgroundColor: value && value.id === s.id ? '#E3F1FC' : 'transparent',
                  fontWeight: value && value.id === s.id ? 600 : 400
                }}
            >
              {s.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
